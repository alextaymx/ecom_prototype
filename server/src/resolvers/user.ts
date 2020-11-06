import {
  Resolver,
  Mutation,
  Arg,
  Field,
  Ctx,
  ObjectType,
  Query,
  FieldResolver,
  Root,
  Int,
  UseMiddleware,
} from "type-graphql";
import { MyContext } from "../types";
import { User } from "../entities/User";
import argon2 from "argon2";
import {
  APPROVE_USER_PREFIX,
  COOKIE_NAME,
  FORGET_PASSWORD_PREFIX,
  Permissions,
  Roles,
  UserStatus,
} from "../constants";
import { UserFilter, UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import { getConnection } from "typeorm";
import { ListMetadata } from "../entities/ListMetadata";
import { isAuth } from "../middleware/isAuth";
import { createToken } from "../utils/createToken";
import { validatePermission } from "../utils/validatePermission";
import { ForbiddenError } from "apollo-server-express";

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => String, { nullable: true })
  token?: string;
}

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    // this is the current user and its ok to show them their own email
    if (req.session.userId === user.id) {
      return user.email;
    }
    // current user wants to see someone elses email
    // return "";
    return user.email;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "length must be greater than 2",
          },
        ],
      };
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired",
          },
        ],
      };
    }

    const userIdNum = parseInt(userId);
    const user = await User.findOne(userIdNum);

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }

    await User.update(
      { id: userIdNum },
      {
        password: await argon2.hash(newPassword),
      }
    );

    await redis.del(key);

    // log in user after change password
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // the email is not in the db
      return true;
    }

    const token = v4();

    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 * 3
    ); // 3 days

    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    );

    return true;
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    // you are not logged in
    if (!req.session.userId) {
      return null;
    }

    return User.findOne(req.session.userId);
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }
    const hashedPassword = await argon2.hash(options.password);
    let user;
    try {
      // User.create({}).save()
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          name: options.name,
          email: options.email,
          password: hashedPassword,
          status: UserStatus.Pending,
          role: Roles.User.id,
          permissions: Roles.User.permissions,
        })
        .returning("*")
        .execute();
      user = result.raw[0];
    } catch (err) {
      //|| err.detail.includes("already exists")) {
      // duplicate username error
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "username already taken",
            },
          ],
        };
      }
    }

    // store user id session
    // this will set a cookie on the user
    // keep them logged in
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<any> {
    const user = await User.findOne(
      usernameOrEmail.includes("@")
        ? { where: { email: usernameOrEmail } }
        : { where: { name: usernameOrEmail } }
    );
    if (!user || user.status !== "1") {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "user doesn't exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }

    req.session.userId = user.id;
    const token = createToken(user.id, password);
    // console.log({ user });
    return {
      user,
      token,
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }

  @Query(() => [User])
  @UseMiddleware(isAuth)
  async allUsers(
    @Arg("page", () => Int, { nullable: true }) page: number,
    @Arg("perPage", () => Int, { nullable: true }) perPage: number,
    @Arg("sortField", () => String, { nullable: true }) sortField: string,
    @Arg("sortOrder", () => String, { nullable: true }) sortOrder: string,
    @Arg("filter", () => UserFilter, { nullable: true }) filter: UserFilter
  ): // @Arg("page", () => Int, { nullable: true }) page: number,
  // @Arg("perPage", () => Int, { nullable: true }) perPage: number,
  // @Arg("sortField", () => String, { nullable: true }) sortField: string,
  // @Arg("sortOrder", () => String, { nullable: true }) sortOrder: string,
  // @Arg("filter", () => UserFilter, { nullable: true }) filter: UserFilter
  Promise<User[]> {
    // const users = await User.find({});
    const users = await getConnection()
      .getRepository(User)
      .createQueryBuilder("user");
    if (filter.q && filter.status) {
      users
        .where("user.name LIKE :name", { name: `%${filter.q}%` })
        .andWhere("user.status = :status", { status: filter.status });
    } else if (filter.q) {
      users.where("user.name LIKE :name", { name: `%${filter.q}%` });
    } else if (filter.status) {
      users.where("user.status = :status", { status: filter.status });
    }

    // console.log(users, "aaaaa");
    return users
      .orderBy(`user.${sortField}`, sortOrder as any)
      .skip(page * perPage)
      .take(perPage)
      .getMany();
  }

  @Query(() => User, { nullable: true })
  User(@Arg("id", () => Int) id: number): Promise<User | undefined> {
    return User.findOne(id);
  }

  @Query(() => ListMetadata)
  @UseMiddleware(isAuth)
  async _allUsersMeta(
    @Arg("page", () => Int, { nullable: true }) page: number,
    @Arg("perPage", () => Int, { nullable: true }) perPage: number,
    @Arg("sortField", () => String, { nullable: true }) sortField: string,
    @Arg("sortOrder", () => String, { nullable: true }) sortOrder: string,
    @Arg("filter", () => UserFilter, { nullable: true }) filter: UserFilter
  ): Promise<ListMetadata> {
    console.log(filter);
    // const count = await User.count({});
    const count = await getConnection()
      .getRepository(User)
      .createQueryBuilder("user")
      .select("COUNT(*)", "count");
    if (filter.q && filter.status) {
      count
        .where("user.name LIKE :name", { name: `%${filter.q}%` })
        .andWhere("user.status = :status", { status: filter.status });
    } else if (filter.q) {
      count.where("user.name LIKE :name", { name: `%${filter.q}%` });
    } else if (filter.status) {
      count.where("user.status = :status", { status: filter.status });
    }
    // .where("user.name = :name", { name: 1 })
    // count.getRawOne();
    // console.log("count", count);
    return count.getRawOne();
  }

  @Mutation(() => User)
  @UseMiddleware(isAuth)
  async createUser(
    @Arg("email", () => String) email: string,
    @Arg("name", () => String) name: string,
    @Arg("password", () => String) password: string,
    @Ctx() { res }: MyContext
  ): Promise<User | ForbiddenError> {
    if (!validatePermission(res.locals.permissions, Permissions.Create_User)) {
      return new ForbiddenError("You dont have the permission");
    }
    const options = { email, name, password };
    const errors = validateRegister(options);
    if (errors) {
      throw new Error(errors[0].message);
    }
    const hashedPassword = await argon2.hash(options.password);
    let user: User;
    try {
      // User.create({}).save()
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          name: options.name,
          email: options.email,
          password: hashedPassword,
          status: UserStatus.Pending,
          role: Roles.User.id,
          permissions: Roles.User.permissions,
        })
        .returning("*")
        .execute();
      user = result.raw[0];
    } catch (err) {
      //|| err.detail.includes("already exists")) {
      // duplicate username error
      if (err.code === "23505") {
        throw new Error("username already taken");
      }
      throw new Error("failed to create user");
    }

    // store user id session
    // this will set a cookie on the user
    // keep them logged in
    // req.session.userId = user.id;

    return user;
  }

  @Mutation(() => User)
  @UseMiddleware(isAuth)
  async updateUser(
    @Arg("id", () => Int) id: number,
    @Arg("name", () => String, { nullable: true }) name: string,
    @Arg("email", () => String, { nullable: true }) email: string,
    @Arg("status", () => String, { nullable: true }) status: string,
    @Arg("role", () => String, { nullable: true }) role: string,
    @Arg("permissions", () => [String], { nullable: true })
    permissions: [string],
    @Ctx() { res }: MyContext
  ): Promise<User | ForbiddenError | undefined> {
    if (!validatePermission(res.locals.permissions, Permissions.Update_User)) {
      return new ForbiddenError("You dont have the permission");
    }
    const user = {
      ...(name && { name }),
      ...(status && { status }),
      ...(email && { email }),
      ...(role && { role }),
      ...(permissions && { permissions }),
    };
    await User.update(id, user);
    return User.findOne(id);
  }

  @Mutation(() => User)
  @UseMiddleware(isAuth)
  async deleteUser(
    @Arg("id", () => Int) id: number,
    @Ctx() { res }: MyContext
  ): Promise<User | ForbiddenError | undefined> {
    if (!validatePermission(res.locals.permissions, Permissions.Update_User)) {
      return new ForbiddenError("You dont have the permission");
    }
    await User.update(id, {
      status: "3",
    });
    return User.findOne(id);
  }

  @Mutation(() => Boolean)
  async approveUser(
    @Arg("email", () => String, { nullable: true }) email: string,
    @Arg("token", () => String, { nullable: true }) token: string,
    @Ctx() { redis }: MyContext
  ) {
    if (!email && !token) {
      return false;
    } else if (email) {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        // the email is not in the db
        return false;
      }
      const newToken = v4();
      await redis.set(
        APPROVE_USER_PREFIX + newToken,
        user.id,
        "ex",
        1000 * 60 * 60 * 24 * 3
      ); // 3 days
      await sendEmail(
        email,
        `<a href="http://localhost:3000/#/users/verification/${newToken}">Click here to verify your email</a>`
      );
    } else if (token) {
      const key = APPROVE_USER_PREFIX + token;
      const userId = await redis.get(key);
      if (!userId) {
        return false;
      }
      const userIdNum = parseInt(userId);
      const user = await User.findOne(userIdNum);
      if (!user) {
        return false;
      }
      await User.update(
        { id: userIdNum },
        {
          status: "1",
        }
      );
      await redis.del(key);
    }
    return true;
  }
}
