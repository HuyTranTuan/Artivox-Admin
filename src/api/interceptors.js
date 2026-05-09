import { useAuthStore } from "@store/authStore";
import axiosClient from "@api/axios";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) {
      resolve(token);
    } else {
      reject(error);
    }
  });
  failedQueue = [];
};

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
    async (error) => {
      const originalRequest = error.config;

      // not a 401 or already retried → reject
      if (error?.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      const { refreshToken, signOut } = useAuthStore.getState();

      if (!refreshToken) {
        signOut();
        return Promise.reject(error);
      }

      // if already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosClient(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const response = await fetch(
          `${axiosClient.defaults.baseURL}/auth/refresh`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          },
        );

        if (!response.ok) throw new Error("Refresh failed");

        const data = await response.json();

        useAuthStore.getState().refreshAuth({
          token: data.token,
          refreshToken: data.refreshToken || refreshToken,
        });

        processQueue(null, data.token);

        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        signOut();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );
};
