import { useEffect } from "react";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL;

export const useWarmup = () => {
  useEffect(() => {
    // Small delay — DOM load hone ke baad ping karo
    const timer = setTimeout(() => {
      fetch(`${BASE_API_URL}/health`, {
        method: "GET",
        // No credentials, no headers — lightest possible request
      }).catch(() => {
        // Silently ignore — even if it fails, no error shown
      });
    }, 1000); // 1 second baad ping

    return () => clearTimeout(timer);
  }, []); // Only once on mount
};