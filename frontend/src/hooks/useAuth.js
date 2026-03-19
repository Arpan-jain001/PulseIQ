// hooks/useAuth.js
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const accessToken = localStorage.getItem("accessToken");
    
    if (storedUser && accessToken) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // 🚀 Role-based auto redirect
      const roleRedirects = {
        "SUPER_ADMIN": "/admin/dashboard",
        "ORGANIZER": "/organizer/dashboard",
        "USER": "/dashboard"
      };

      // Redirect based on role (only if not already on dashboard)
      const currentPath = window.location.pathname;
      const targetPath = roleRedirects[parsedUser.role];
      
      if (targetPath && currentPath !== targetPath && currentPath !== "/login") {
        navigate(targetPath, { replace: true });
      }
    }
    setLoading(false);
  }, [navigate]);

  const hasRole = (roles) => {
    return user && roles.includes(user.role);
  };

  const isSuperAdmin = useCallback(() => user?.role === "SUPER_ADMIN", [user]);
  const isOrganizer = useCallback(() => user?.role === "ORGANIZER", [user]);
  const isUser = useCallback(() => user?.role === "USER", [user]);

  // Logout function
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
    logout 
  };
};
