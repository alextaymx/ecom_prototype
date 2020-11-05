"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const maxAge = 1000 * 60 * 60 * 24;
exports.createToken = (id, password) => {
    return jsonwebtoken_1.default.sign({ id, password }, "testing", {
        expiresIn: maxAge,
    });
};
//# sourceMappingURL=createToken.js.map