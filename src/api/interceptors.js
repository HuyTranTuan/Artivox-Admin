import { useAuthStore } from "@store/authStore";

export const applyAxiosInterceptors = (axiosClient) => {
  axiosClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        useAuthStore.getState().signOut();
      }

      return Promise.reject(error);
    }
  );
};
