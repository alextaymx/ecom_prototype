import { AuthChecker, MiddlewareFn } from "type-graphql";
import { MyContext } from "../types";
import jwt from "jsonwebtoken";
import { User } from "../entities/User";
export const isAuth: MiddlewareFn<MyContext> = async ({ context }, next) => {
  const token = context.req.headers.authorization;
  if (token) {
    await jwt.verify(token, "testing", async (err, decodedToken: any) => {
      if (err) {
        throw new Error("not authenticated");
      } else {
        const user = (await User.findOne(decodedToken!.id)) as any;
        if (user == null || user.status !== "1") {
          throw new Error("user does not exist");
        }
        console.log(user);
        context.res.locals.permissions = user.permissions;
      }
    });
  }

  return next();
};

// export const isAuthorized: MiddlewareFn<MyContext> = async (
//   { context },
//   next
// ) => {
//   const permissions = context.req.headers.authorization;
//   if (permissions) {
//     permissions.includes();
//   } else {
//     throw new Error("user does not exist");
//   }

//   if (token) {
//     await jwt.verify(token, "testing", async (err, decodedToken: any) => {
//       if (err) {
//         throw new Error("not authenticated");
//       } else {
//         const user = (await User.findOne(decodedToken!.id)) as any;
//         if (user == null || user.status !== "1") {
//           throw new Error("user does not exist");
//         }
//       }
//     });
//   }
//   return next();
// };
export const customAuthChecker: AuthChecker<MyContext> = (
  { args, context },
  roles
) => {
  console.log(
    args,
    context.res.locals,
    roles,
    "alllllllllllllllllllllllllllllllll"
  );
  // here we can read the user from context
  // and check his permission in the db against the `roles` argument
  // that comes from the `@Authorized` decorator, eg. ["ADMIN", "MODERATOR"]

  return true; // or false if access is denied
};
