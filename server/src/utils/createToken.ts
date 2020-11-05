import jwt from "jsonwebtoken";

const maxAge = 1000 * 60 * 60 * 24;
export const createToken = (id: number, password: string) => {
  return jwt.sign({ id, password }, "testing", {
    expiresIn: maxAge,
  });
};
