const formatDate = (value) => {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};

const formatPrice = (value) => {
  const num = Number(value || 0);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M VND`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K VND`;
  return `${num.toLocaleString("vi-VN")} VND`;
};

export { formatDate, formatPrice };
