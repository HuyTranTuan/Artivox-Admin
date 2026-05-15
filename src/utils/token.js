// Safe JWT decode: reads base64 payload from a JWT string
const decodeToken = (token) => {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
    const json = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return false; // no exp claim → assume valid
  return Date.now() >= decoded.exp * 1000;
};

export { decodeToken, isTokenExpired };
