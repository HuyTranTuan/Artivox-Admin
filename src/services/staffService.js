import axiosClient from "@api/axios";

export const staffService = {
  getStaffMembers: async () => {
    const response = await axiosClient.get(`/admin/users`);
    return response;
  },

  updateStaffPermissions: async (email, permissions) => {
    const response = await axiosClient.patch(`/admin/staff-decentralize/${email}`, permissions);
    return response;
  },
};
