import { useAuthStore } from "@store/authStore";
import { useMemo } from "react";
import { parsePermissionString } from "@utils/permissionUtils";

export const useRBAC = () => {
  const { user } = useAuthStore();

  return useMemo(() => {
    const isAdmin = user?.role === "ADMIN";
    const permission = parsePermissionString(user?.permission);

    return {
      isAdmin,
      canCreate: isAdmin || permission.create,
      canUpdate: isAdmin || permission.update,
      canDelete: isAdmin || permission.del,
      permissions: permission,
    };
  }, [user]);
};