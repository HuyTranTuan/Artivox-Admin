import axios from "axios";
import { applyAxiosInterceptors } from "@api/interceptors";
import useToast from "@/hooks/useToast";
import HTTP_CODE from "@/constants/httpStatus";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

export const axiosClient = axios.create({
  baseURL,
  timeout: 10000,
});

applyAxiosInterceptors(axiosClient);

const _send = async (method, path, data, config) => {
  const { toastTopRight } = useToast();
  try {
    const response = await axiosClient({
      method,
      url: path,
      data,
      ...config,
    });
    toastTopRight("success", HTTP_CODE.HTTP_STATUS[200]);
    return response?.data;
  } catch (error) {
    switch (error.response?.status) {
      case 409:
        toastTopRight("error", HTTP_CODE.HTTP_STATUS[409]);
        break;
      case 405:
        toastTopRight("error", HTTP_CODE.HTTP_STATUS[405]);
        break;
      case 404:
        toastTopRight("error", HTTP_CODE.HTTP_STATUS[404]);
        break;
      case 403:
        toastTopRight("error", HTTP_CODE.HTTP_STATUS[403]);
        break;
      case 401:
        toastTopRight("error", HTTP_CODE.HTTP_STATUS[401]);
        break;
      case 400:
        toastTopRight("error", HTTP_CODE.HTTP_STATUS[400]);
        break;
      default:
        toastTopRight("error", HTTP_CODE.HTTP_STATUS[500]);
        break;
    }
    return Promise.reject(error);
  }
};

const get = async (path, config) => {
  const result = await _send("get", path, null, config);
  return result?.data || result;
};
const post = async (path, data, config) => {
  const result = await _send("post", path, data, config);
  return result?.data || result;
};
const put = async (path, data, config) => {
  const result = await _send("put", path, data, config);
  return result?.data || result;
};
const patch = async (path, data, config) => {
  const result = await _send("patch", path, data, config);
  return result?.data || result;
};
const del = async (path, config) => {
  const result = await _send("delete", path, null, config);
  return result?.data || result;
};

const http = { get, post, put, patch, del };

export default http;
