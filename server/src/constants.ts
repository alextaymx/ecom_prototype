export const __prod__ = process.env.NODE_ENV === "production";
export const COOKIE_NAME = "qid";
export const FORGET_PASSWORD_PREFIX = "forget-password:";

export const APPROVE_USER_PREFIX = "approve-user:";
export const Permissions = {
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

export const Roles = {
  SuperAdmin: {
    id: "1",
    permissions: [
      Permissions.Create_Product,
      Permissions.Update_Product,
      Permissions.Delete_Product,
      Permissions.Create_User,
      Permissions.Update_User,
      Permissions.Delete_User,
      Permissions.Update_Order,
      Permissions.Create_Order,
      Permissions.Cancel_Order,
    ],
  },
  User: {
    id: "2",
    permissions: [
      Permissions.Update_Product,
      Permissions.Create_Product,
      Permissions.Delete_Product,
      Permissions.Update_Order,
      Permissions.Create_Order,
      Permissions.Cancel_Order,
    ],
  },
};

export const UserStatus = {
  Active: "1",
  Pending: "2",
  Inactive: "3",
};
