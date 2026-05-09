const readStorage = (STORAGE_KEY) => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
};

const writeStorage = (STORAGE_KEY, value) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
};

export { readStorage, writeStorage };
