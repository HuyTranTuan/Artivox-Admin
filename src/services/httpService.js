const wait = (timeout = 400) => {
  return new Promise((resolve) => {
    window.setTimeout(resolve, timeout);
  });
};

export const http = {
  get: async (payload) => {
    await wait();
    return payload;
  },
  post: async (payload) => {
    await wait();
    return payload;
  },
  put: async (payload) => {
    await wait();
    return payload;
  },
  delete: async (payload) => {
    await wait();
    return payload;
  }
};
