import { toast } from "react-toastify";

const useToast = () => {
  const toastTopRight = (type, message) => {
    toast[type](message, {
      position: "top-right",
      autoClose: 5000,
    });
  };
  const toastBottomRight = (type, message) => {
    toast[type](message, {
      position: "bottom-right",
      autoClose: 5000,
    });
  };
  return { toastBottomRight, toastTopRight };
};

export default useToast;
