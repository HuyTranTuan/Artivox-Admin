import { useUiStore } from "@/store/uiStore";

export const useUI = () => {
  const { theme, setTheme } = useUiStore();
  const changeToTheme = theme === "light" ? "dark" : "light";

  const handleSetTheme = async () => {
    setTheme(changeToTheme);
  };

  return { theme, handleSetTheme };
};
