import axios from "axios";
import { applyAxiosInterceptors } from "@api/interceptors";
import HTTP_CODE from "@/constants/httpStatus";
import { toast } from "react-toastify";
import i18n from "@/i18n/i18n";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3600/api/v1";

export const axiosClient = axios.create({
  baseURL,
  timeout: 10000,
});

applyAxiosInterceptors(axiosClient);

const _send = async (method, path, data, config) => {
  try {
    const response = await axiosClient({
      method,
      url: path,
      data,
      ...config,
    });

    const m = method.toLowerCase();
    
    if (["post", "put", "patch", "delete"].includes(m) && !config?.hideToast && !path.includes("/auth")) {
      let defaultMsg = i18n.t("common.success", "Operation successful");
      if (m === "post") defaultMsg = i18n.t("common.createSuccess", "Created successfully");
      if (m === "put" || m === "patch") defaultMsg = i18n.t("common.updateSuccess", "Updated successfully");
      if (m === "delete") defaultMsg = i18n.t("common.deleteSuccess", "Deleted successfully");
      
      if(response.data.message !== "Message sent" && response.data.message !== "Chat rooms fetched" && response.data.message !== "Marked as read"){
        toast.success(defaultMsg, { position: "top-right", autoClose: 3000 });
      }
    }

    return response?.data;
  } catch (error) {
    const m = method.toLowerCase();
    let defaultMsg = i18n.t("common.error", "Operation failed");
    if (m === "post") defaultMsg = i18n.t("common.createError", "Failed to create");
    if (m === "put" || m === "patch") defaultMsg = i18n.t("common.updateError", "Failed to update");
    if (m === "delete") defaultMsg = i18n.t("common.deleteError", "Failed to delete");

    let errorMsg = defaultMsg;
    const statusCode = error.response?.status;
    const backendMessage = error.response?.data?.message;

    if (statusCode && statusCode < 500 && backendMessage) {
      errorMsg = backendMessage;
    } else if (statusCode >= 500) {
      errorMsg = defaultMsg;
    } else if (!statusCode) {
      errorMsg = HTTP_CODE.HTTP_STATUS[500];
    }

    if (!config?.hideToast && !path.includes("/auth")) {
      toast.error(errorMsg, { position: "top-right", autoClose: 4000 });
    }
    return Promise.reject(error);
  }
};

const get = async (path, config) => {
  const result = await _send("get", path, null, config);
  if (result?.pagination) return result;
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