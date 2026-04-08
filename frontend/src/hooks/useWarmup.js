import { useEffect } from "react";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL;

export const useWarmup = () => {
  useEffect(() => {
    if (!BASE_API_URL) return undefined;

    const timer = setTimeout(() => {
      fetch(`${BASE_API_URL}/health`, {
        method: "GET",
      }).catch(() => {
        // Warmup failure should not interrupt the UI.
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);
};
