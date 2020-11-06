"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatus = exports.Roles = exports.Permissions = exports.APPROVE_USER_PREFIX = exports.FORGET_PASSWORD_PREFIX = exports.COOKIE_NAME = exports.__prod__ = void 0;
exports.__prod__ = process.env.NODE_ENV === "production";
exports.COOKIE_NAME = "qid";
exports.FORGET_PASSWORD_PREFIX = "forget-password:";
exports.APPROVE_USER_PREFIX = "approve-user:";
exports.Permissions = {
    Create_User: "1",
    Update_User: "2",
    Delete_User: "3",
    Create_Product: "4",
    Update_Product: "5",
    Delete_Product: "6",
    Create_Order: "7",
    Update_Order: "8",
    Cancel_Order: "9",
};
exports.Roles = {
    SuperAdmin: {
        id: "1",
        permissions: [
            exports.Permissions.Create_Product,
            exports.Permissions.Update_Product,
            exports.Permissions.Delete_Product,
            exports.Permissions.Create_User,
            exports.Permissions.Update_User,
            exports.Permissions.Delete_User,
            exports.Permissions.Update_Order,
            exports.Permissions.Create_Order,
            exports.Permissions.Cancel_Order,
        ],
    },
    User: {
        id: "2",
        permissions: [
            exports.Permissions.Update_Product,
            exports.Permissions.Create_Product,
            exports.Permissions.Delete_Product,
            exports.Permissions.Update_Order,
            exports.Permissions.Create_Order,
            exports.Permissions.Cancel_Order,
        ],
    },
};
exports.UserStatus = {
    Active: "1",
    Pending: "2",
    Inactive: "3",
};
//# sourceMappingURL=constants.js.map