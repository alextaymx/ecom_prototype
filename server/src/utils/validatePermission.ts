export const validatePermission = (
  permissions: string[],
  operation: string
): Boolean => {
  if (permissions && permissions.includes(operation)) {
    return true;
  }

  return false;
};
