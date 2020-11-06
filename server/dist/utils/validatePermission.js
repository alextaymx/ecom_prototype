"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePermission = void 0;
exports.validatePermission = (permissions, operation) => {
    if (permissions && permissions.includes(operation)) {
        return true;
    }
    return false;
};
//# sourceMappingURL=validatePermission.js.map