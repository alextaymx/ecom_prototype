"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const type_graphql_1 = require("type-graphql");
const User_1 = require("../entities/User");
const argon2_1 = __importDefault(require("argon2"));
const constants_1 = require("../constants");
const UsernamePasswordInput_1 = require("./UsernamePasswordInput");
const validateRegister_1 = require("../utils/validateRegister");
const sendEmail_1 = require("../utils/sendEmail");
const uuid_1 = require("uuid");
const typeorm_1 = require("typeorm");
const ListMetadata_1 = require("../entities/ListMetadata");
const isAuth_1 = require("../middleware/isAuth");
const createToken_1 = require("../utils/createToken");
const validatePermission_1 = require("../utils/validatePermission");
const apollo_server_express_1 = require("apollo-server-express");
let FieldError = class FieldError {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FieldError.prototype, "field", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FieldError.prototype, "message", void 0);
FieldError = __decorate([
    type_graphql_1.ObjectType()
], FieldError);
let UserResponse = class UserResponse {
};
__decorate([
    type_graphql_1.Field(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "errors", void 0);
__decorate([
    type_graphql_1.Field(() => User_1.User, { nullable: true }),
    __metadata("design:type", User_1.User)
], UserResponse.prototype, "user", void 0);
__decorate([
    type_graphql_1.Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserResponse.prototype, "token", void 0);
UserResponse = __decorate([
    type_graphql_1.ObjectType()
], UserResponse);
let UserResolver = class UserResolver {
    email(user, { req }) {
        if (req.session.userId === user.id) {
            return user.email;
        }
        return user.email;
    }
    changePassword(token, newPassword, { redis, req }) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const key = constants_1.FORGET_PASSWORD_PREFIX + token;
            const userId = yield redis.get(key);
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
            const user = yield User_1.User.findOne(userIdNum);
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
            yield User_1.User.update({ id: userIdNum }, {
                password: yield argon2_1.default.hash(newPassword),
            });
            yield redis.del(key);
            req.session.userId = user.id;
            return { user };
        });
    }
    forgotPassword(email, { redis }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOne({ where: { email } });
            if (!user) {
                return true;
            }
            const token = uuid_1.v4();
            yield redis.set(constants_1.FORGET_PASSWORD_PREFIX + token, user.id, "ex", 1000 * 60 * 60 * 24 * 3);
            yield sendEmail_1.sendEmail(email, `<a href="http://localhost:3000/change-password/${token}">reset password</a>`);
            return true;
        });
    }
    me({ req }) {
        if (!req.session.userId) {
            return null;
        }
        return User_1.User.findOne(req.session.userId);
    }
    register(options, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = validateRegister_1.validateRegister(options);
            if (errors) {
                return { errors };
            }
            const hashedPassword = yield argon2_1.default.hash(options.password);
            let user;
            try {
                const result = yield typeorm_1.getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(User_1.User)
                    .values({
                    name: options.name,
                    email: options.email,
                    password: hashedPassword,
                    status: constants_1.UserStatus.Pending,
                    role: constants_1.Roles.User.id,
                    permissions: constants_1.Roles.User.permissions,
                })
                    .returning("*")
                    .execute();
                user = result.raw[0];
            }
            catch (err) {
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
            req.session.userId = user.id;
            return { user };
        });
    }
    login(usernameOrEmail, password, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOne(usernameOrEmail.includes("@")
                ? { where: { email: usernameOrEmail } }
                : { where: { name: usernameOrEmail } });
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
            const valid = yield argon2_1.default.verify(user.password, password);
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
            const token = createToken_1.createToken(user.id, password);
            return {
                user,
                token,
            };
        });
    }
    logout({ req, res }) {
        return new Promise((resolve) => req.session.destroy((err) => {
            res.clearCookie(constants_1.COOKIE_NAME);
            if (err) {
                console.log(err);
                resolve(false);
                return;
            }
            resolve(true);
        }));
    }
    allUsers(page, perPage, sortField, sortOrder, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield typeorm_1.getConnection()
                .getRepository(User_1.User)
                .createQueryBuilder("user");
            if (filter.q && filter.status) {
                users
                    .where("user.name LIKE :name", { name: `%${filter.q}%` })
                    .andWhere("user.status = :status", { status: filter.status });
            }
            else if (filter.q) {
                users.where("user.name LIKE :name", { name: `%${filter.q}%` });
            }
            else if (filter.status) {
                users.where("user.status = :status", { status: filter.status });
            }
            return users
                .orderBy(`user.${sortField}`, sortOrder)
                .skip(page * perPage)
                .take(perPage)
                .getMany();
        });
    }
    User(id) {
        return User_1.User.findOne(id);
    }
    _allUsersMeta(page, perPage, sortField, sortOrder, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(filter);
            const count = yield typeorm_1.getConnection()
                .getRepository(User_1.User)
                .createQueryBuilder("user")
                .select("COUNT(*)", "count");
            if (filter.q && filter.status) {
                count
                    .where("user.name LIKE :name", { name: `%${filter.q}%` })
                    .andWhere("user.status = :status", { status: filter.status });
            }
            else if (filter.q) {
                count.where("user.name LIKE :name", { name: `%${filter.q}%` });
            }
            else if (filter.status) {
                count.where("user.status = :status", { status: filter.status });
            }
            return count.getRawOne();
        });
    }
    createUser(email, name, password, { res }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validatePermission_1.validatePermission(res.locals.permissions, constants_1.Permissions.Create_User)) {
                return new apollo_server_express_1.ForbiddenError("You dont have the permission");
            }
            const options = { email, name, password };
            const errors = validateRegister_1.validateRegister(options);
            if (errors) {
                throw new Error(errors[0].message);
            }
            const hashedPassword = yield argon2_1.default.hash(options.password);
            let user;
            try {
                const result = yield typeorm_1.getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(User_1.User)
                    .values({
                    name: options.name,
                    email: options.email,
                    password: hashedPassword,
                    status: constants_1.UserStatus.Pending,
                    role: constants_1.Roles.User.id,
                    permissions: constants_1.Roles.User.permissions,
                })
                    .returning("*")
                    .execute();
                user = result.raw[0];
            }
            catch (err) {
                if (err.code === "23505") {
                    throw new Error("username already taken");
                }
                throw new Error("failed to create user");
            }
            return user;
        });
    }
    updateUser(id, name, email, status, role, permissions, { res }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validatePermission_1.validatePermission(res.locals.permissions, constants_1.Permissions.Update_User)) {
                return new apollo_server_express_1.ForbiddenError("You dont have the permission");
            }
            const user = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (name && { name })), (status && { status })), (email && { email })), (role && { role })), (permissions && { permissions }));
            yield User_1.User.update(id, user);
            return User_1.User.findOne(id);
        });
    }
    deleteUser(id, { res }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validatePermission_1.validatePermission(res.locals.permissions, constants_1.Permissions.Update_User)) {
                return new apollo_server_express_1.ForbiddenError("You dont have the permission");
            }
            yield User_1.User.update(id, {
                status: "3",
            });
            return User_1.User.findOne(id);
        });
    }
    approveUser(email, token, { redis }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email && !token) {
                return false;
            }
            else if (email) {
                const user = yield User_1.User.findOne({ where: { email } });
                if (!user) {
                    return false;
                }
                const newToken = uuid_1.v4();
                yield redis.set(constants_1.APPROVE_USER_PREFIX + newToken, user.id, "ex", 1000 * 60 * 60 * 24 * 3);
                yield sendEmail_1.sendEmail(email, `<a href="http://localhost:3000/#/users/verification/${newToken}">Click here to verify your email</a>`);
            }
            else if (token) {
                const key = constants_1.APPROVE_USER_PREFIX + token;
                const userId = yield redis.get(key);
                if (!userId) {
                    return false;
                }
                const userIdNum = parseInt(userId);
                const user = yield User_1.User.findOne(userIdNum);
                if (!user) {
                    return false;
                }
                yield User_1.User.update({ id: userIdNum }, {
                    status: "1",
                });
                yield redis.del(key);
            }
            return true;
        });
    }
};
__decorate([
    type_graphql_1.FieldResolver(() => String),
    __param(0, type_graphql_1.Root()), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User, Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "email", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse),
    __param(0, type_graphql_1.Arg("token")),
    __param(1, type_graphql_1.Arg("newPassword")),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "changePassword", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("email")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "forgotPassword", null);
__decorate([
    type_graphql_1.Query(() => User_1.User, { nullable: true }),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "me", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse),
    __param(0, type_graphql_1.Arg("options")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UsernamePasswordInput_1.UsernamePasswordInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse),
    __param(0, type_graphql_1.Arg("usernameOrEmail")),
    __param(1, type_graphql_1.Arg("password")),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "logout", null);
__decorate([
    type_graphql_1.Query(() => [User_1.User]),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("page", () => type_graphql_1.Int, { nullable: true })),
    __param(1, type_graphql_1.Arg("perPage", () => type_graphql_1.Int, { nullable: true })),
    __param(2, type_graphql_1.Arg("sortField", () => String, { nullable: true })),
    __param(3, type_graphql_1.Arg("sortOrder", () => String, { nullable: true })),
    __param(4, type_graphql_1.Arg("filter", () => UsernamePasswordInput_1.UserFilter, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, UsernamePasswordInput_1.UserFilter]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "allUsers", null);
__decorate([
    type_graphql_1.Query(() => User_1.User, { nullable: true }),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "User", null);
__decorate([
    type_graphql_1.Query(() => ListMetadata_1.ListMetadata),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("page", () => type_graphql_1.Int, { nullable: true })),
    __param(1, type_graphql_1.Arg("perPage", () => type_graphql_1.Int, { nullable: true })),
    __param(2, type_graphql_1.Arg("sortField", () => String, { nullable: true })),
    __param(3, type_graphql_1.Arg("sortOrder", () => String, { nullable: true })),
    __param(4, type_graphql_1.Arg("filter", () => UsernamePasswordInput_1.UserFilter, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, UsernamePasswordInput_1.UserFilter]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "_allUsersMeta", null);
__decorate([
    type_graphql_1.Mutation(() => User_1.User),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("email", () => String)),
    __param(1, type_graphql_1.Arg("name", () => String)),
    __param(2, type_graphql_1.Arg("password", () => String)),
    __param(3, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "createUser", null);
__decorate([
    type_graphql_1.Mutation(() => User_1.User),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg("name", () => String, { nullable: true })),
    __param(2, type_graphql_1.Arg("email", () => String, { nullable: true })),
    __param(3, type_graphql_1.Arg("status", () => String, { nullable: true })),
    __param(4, type_graphql_1.Arg("role", () => String, { nullable: true })),
    __param(5, type_graphql_1.Arg("permissions", () => [String], { nullable: true })),
    __param(6, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String, String, Array, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "updateUser", null);
__decorate([
    type_graphql_1.Mutation(() => User_1.User),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "deleteUser", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("email", () => String, { nullable: true })),
    __param(1, type_graphql_1.Arg("token", () => String, { nullable: true })),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "approveUser", null);
UserResolver = __decorate([
    type_graphql_1.Resolver(User_1.User)
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map