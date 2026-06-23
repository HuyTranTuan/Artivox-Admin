export const parsePermissionString = (permissionStr) => {
  if (!permissionStr) return { create: false, update: false, del: false };
  if (typeof permissionStr === "object") return permissionStr;
  try {
    const validJsonString = permissionStr
      .replace(/([a-zA-Z0-9_]+)(?=\s*:)/g, '"$1"')
      .replace(/'/g, '"');
    const parsed = JSON.parse(validJsonString);
    return {
      create: !!parsed.create,
      update: !!parsed.update,
      del: !!parsed.del,
    };
  } catch (e) {
    console.error("Failed to parse permission string", permissionStr, e);
    return { create: false, update: false, del: false };
  }
};