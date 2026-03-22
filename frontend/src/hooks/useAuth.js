// src/hooks/useAuth.js
// ✅ Pure DB-driven auth — sirf token localStorage mein, user data hamesha /api/users/me se
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PUBLIC_ONLY_ROUTES = ["/login", "/signup", "/forgot-password"];
const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL;

export const useAuth = () => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();
  const isMountedRef          = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      setLoading(false);
      return;
    }

    // ✅ Always fetch fresh user from DB — never trust localStorage for user data
    axios
      .get(`${BASE_API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        if (!isMountedRef.current) return;

        const freshUser = res.data?.data || res.data;

        if (!freshUser?._id) {
          // Bad response — clear token
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("isLoggedIn");
          setLoading(false);
          return;
        }

        setUser(freshUser);

        // ✅ Redirect if on public-only route
        const currentPath = window.location.pathname;
        if (PUBLIC_ONLY_ROUTES.includes(currentPath)) {
          const roleRedirects = {
            SUPER_ADMIN: "/admin-dashboard",
            ORGANIZER:   "/organizer-dashboard",
            USER:        "/dashboard",
          };
          const target = roleRedirects[freshUser.role];
          if (target) navigate(target, { replace: true });
        }
      })
      .catch((err) => {
        if (!isMountedRef.current) return;

        // 401 = token expired/invalid → clear everything
        if (err.response?.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("user");
          setUser(null);
        }
        // Network error — don't logout, just stay loading=false
      })
      .finally(() => {
        if (isMountedRef.current) setLoading(false);
      });
  }, [navigate]);

  const hasRole      = useCallback((roles) => user && roles.includes(user.role), [user]);
  const isSuperAdmin = useCallback(() => user?.role === "SUPER_ADMIN", [user]);
  const isOrganizer  = useCallback(() => user?.role === "ORGANIZER",   [user]);
  const isUser       = useCallback(() => user?.role === "USER",        [user]);

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  // ✅ Manually refresh user from DB (call this after profile update etc.)
  const refreshUser = useCallback(async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;
    try {
      const res = await axios.get(`${BASE_API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const freshUser = res.data?.data || res.data;
      if (freshUser?._id && isMountedRef.current) setUser(freshUser);
    } catch {}
  }, []);

  return {
    user,
    loading,
    hasRole,
    isSuperAdmin,
    isOrganizer,
    isUser,
    logout,
    refreshUser,
  };
};