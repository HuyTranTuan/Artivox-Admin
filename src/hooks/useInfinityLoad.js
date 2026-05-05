import { useEffect, useRef } from "react";

export const useInfinityLoad = ({ enabled = true, onReachEnd }) => {
  const targetRef = useRef(null);

  useEffect(() => {
    if (!enabled || !targetRef.current || typeof onReachEnd !== "function") {
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onReachEnd();
        }
      });
    });

    observer.observe(targetRef.current);

    return () => {
      observer.disconnect();
    };
  }, [enabled, onReachEnd]);

  return targetRef;
};
