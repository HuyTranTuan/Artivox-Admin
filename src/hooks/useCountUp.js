import { useEffect, useRef, useState } from "react";

export const useCountUp = (endValue, duration = 2000, isActive = true) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Extract numeric value from strings like "₫248.5M" or "3,264"
  const extractNumericValue = (value) => {
    if (typeof value === "number") return value;
    if (typeof value !== "string") return 0;

    // Handle Vietnamese currency format (₫248.5M)
    const currencyMatch = value.match(/[\d,.]+/);
    if (!currencyMatch) return 0;

    let numStr = currencyMatch[0].replace(/,/g, "");

    // Handle millions (M)
    if (value.includes("M")) {
      numStr = (parseFloat(numStr) * 1000000).toString();
    }

    return parseFloat(numStr) || 0;
  };

  // Format number back to original format
  const formatNumber = (num) => {
    if (num >= 1000000) {
      const millions = (num / 1000000).toFixed(1);
      return `₫${millions}M`;
    }
    if (num >= 1000) {
      return num.toLocaleString("en-US");
    }
    return Math.floor(num).toString();
  };

  useEffect(() => {
    if (!isActive) {
      setCount(0);
      return;
    }

    const endNum = extractNumericValue(endValue);
    startTimeRef.current = Date.now();
    countRef.current = 0;

    const animate = () => {
      if (!startTimeRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      countRef.current = endNum * easeOutQuart;

      setCount(formatNumber(countRef.current));

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [endValue, duration, isActive]);

  return count;
};
