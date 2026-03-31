import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const scrollPositions = {};

export default function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    // restore scroll if exists
    if (scrollPositions[path]) {
  // 🔙 Back pe exact position restore (NO smooth)
  window.scrollTo(0, scrollPositions[path]);
} else {
  // 🆕 New page → smooth scroll top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

    return () => {
      // save scroll before leaving
      scrollPositions[path] = window.scrollY;
    };
  }, [location.pathname]);

  return null;
}