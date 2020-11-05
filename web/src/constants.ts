export const UserStatusMap = {
  "1": "Active",
  "2": "Pending",
  "3": "Inactive",
};

export const PermissionMap = {
  "1": "Create_User",
  "2": "Update_User",
  "3": "Delete_User",
  "4": "Create_Product",
  "5": "Update_Product",
  "6": "Delete_Product",
  "7": "Create_Order",
  "8": "Update_Order",
  "9": "Cancel_Order",
};

export const PermissionConstant = {
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

export const RoleMap = {
  SuperAdmin: {
    id: "1",
    permissions: [
      PermissionConstant.Create_Product,
      PermissionConstant.Update_Product,
      PermissionConstant.Delete_Product,
      PermissionConstant.Create_User,
      PermissionConstant.Update_User,
      PermissionConstant.Delete_User,
      PermissionConstant.Update_Order,
      PermissionConstant.Create_Order,
      PermissionConstant.Update_Order,
    ],
  },
  User: {
    id: "2",
    permissions: [
      PermissionConstant.Update_Product,
      PermissionConstant.Create_Product,
      PermissionConstant.Delete_Product,
      PermissionConstant.Update_Order,
      PermissionConstant.Create_Order,
      PermissionConstant.Update_Order,
    ],
  },
};
