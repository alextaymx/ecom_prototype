"use strict";
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
exports.isAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../entities/User");
exports.isAuth = ({ context }, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = context.req.headers.authorization;
    if (token) {
        yield jsonwebtoken_1.default.verify(token, "testing", (err, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                throw new Error("not authenticated");
            }
            else {
                const user = (yield User_1.User.findOne(decodedToken.id));
                if (user == null || user.status !== "1") {
                    throw new Error("user does not exist");
                }
                context.res.locals.permissions = user.permissions;
            }
        }));
    }
    return next();
});
//# sourceMappingURL=isAuth.js.map