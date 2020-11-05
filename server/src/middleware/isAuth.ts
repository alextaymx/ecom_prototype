import { MiddlewareFn } from "type-graphql";
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
      }
    });
  }
  return next();
};
