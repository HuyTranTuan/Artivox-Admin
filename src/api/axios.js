import axios from "axios";
import { applyAxiosInterceptors } from "@api/interceptors";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1",
  timeout: 10000
});

applyAxiosInterceptors(axiosClient);

export default axiosClient;
