// hooks/useAuth.js
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// Routes jahan logged-in user ko redirect NAHI karna
const PUBLIC_ONLY_ROUTES = ["/login", "/signup", "/forgot-password"];

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const accessToken = localStorage.getItem("accessToken");

    if (storedUser && accessToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // ✅ Sirf login/signup pages pe redirect karo
        // Landing page (/) pe rehne do — woh bhi dekh sakta hai
        const currentPath = window.location.pathname;
        const isPublicOnlyRoute = PUBLIC_ONLY_ROUTES.includes(currentPath);

        if (isPublicOnlyRoute) {
          const roleRedirects = {
            SUPER_ADMIN: "/admin-dashboard",
            ORGANIZER:   "/organizer-dashboard",
            USER:        "/dashboard",
          };
          const target = roleRedirects[parsedUser.role];
          if (target) navigate(target, { replace: true });
        }
      } catch {
        // Corrupted localStorage — clear karo
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("isLoggedIn");
      }
    }

    setLoading(false);
  }, [navigate]);

  const hasRole = useCallback(
    (roles) => user && roles.includes(user.role),
    [user]
  );

  const isSuperAdmin = useCallback(() => user?.role === "SUPER_ADMIN", [user]);
  const isOrganizer  = useCallback(() => user?.role === "ORGANIZER",   [user]);
  const isUser       = useCallback(() => user?.role === "USER",        [user]);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("isLoggedIn");
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  return {
    user,
    loading,
    hasRole,
    isSuperAdmin,
    isOrganizer,
    isUser,
    logout,
  };
};