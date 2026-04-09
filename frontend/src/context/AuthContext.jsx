import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext(null);

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL;
const PUBLIC_ONLY_ROUTES = ["/login", "/signup", "/forgot-password"];

const clearStoredAuth = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("user");
  delete axios.defaults.headers.common.Authorization;
};

const syncAccessToken = (accessToken) => {
  if (!accessToken) {
    delete axios.defaults.headers.common.Authorization;
    return;
  }

  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("isLoggedIn", "true");
  axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
};

const syncRefreshToken = (refreshToken) => {
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }
};

const getRoleRedirect = (role) => {
  if (role === "SUPER_ADMIN") return "/admin-dashboard";
  if (role === "ORGANIZER") return "/organizer-dashboard";
  return "/dashboard";
};

const normalizeUser = (nextUser) => {
  if (!nextUser) return null;
  if (nextUser._id) return nextUser;
  if (nextUser.id) return { ...nextUser, _id: nextUser.id };
  return nextUser;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isMountedRef = useRef(false);
  const didBootstrapRef = useRef(false);
  const refreshPromiseRef = useRef(null);

  const refreshAccessToken = useCallback(async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (!storedRefreshToken) {
      throw new Error("No refresh token available");
    }

    refreshPromiseRef.current = axios
      .post(
        `${BASE_API_URL}/api/auth/refresh`,
        { refreshToken: storedRefreshToken },
        { headers: { "Content-Type": "application/json" } }
      )
      .then((res) => {
        const nextAccessToken = res.data?.accessToken;
        if (!nextAccessToken) {
          throw new Error("Refresh token response missing access token");
        }

        syncAccessToken(nextAccessToken);
        return nextAccessToken;
      })
      .catch((error) => {
        clearStoredAuth();
        throw error;
      })
      .finally(() => {
        refreshPromiseRef.current = null;
      });

    return refreshPromiseRef.current;
  }, []);

  const fetchCurrentUser = useCallback(
    async (accessToken, allowRefresh = true) => {
      try {
        const res = await axios.get(`${BASE_API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const freshUser = normalizeUser(res.data?.data || res.data);
        if (!freshUser?._id) {
          throw new Error("Invalid user payload");
        }

        if (isMountedRef.current) {
          setUser(freshUser);
        }

        return freshUser;
      } catch (error) {
        if (allowRefresh && error.response?.status === 401) {
          const nextAccessToken = await refreshAccessToken();
          return fetchCurrentUser(nextAccessToken, false);
        }

        throw error;
      }
    },
    [refreshAccessToken]
  );

  const authenticate = useCallback(({ user: nextUser, accessToken, refreshToken }) => {
    syncAccessToken(accessToken);
    syncRefreshToken(refreshToken);

    const normalizedUser = normalizeUser(nextUser);
    if (normalizedUser) {
      setUser(normalizedUser);
    }

    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setUser(null);
    setLoading(false);
    navigate("/login", { replace: true });
  }, [navigate]);

  const refreshUser = useCallback(async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return null;

    return fetchCurrentUser(accessToken);
  }, [fetchCurrentUser]);

  useEffect(() => {
    isMountedRef.current = true;

    const storedAccessToken = localStorage.getItem("accessToken");
    if (storedAccessToken) {
      axios.defaults.headers.common.Authorization = `Bearer ${storedAccessToken}`;
    }

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (didBootstrapRef.current) return;
    didBootstrapRef.current = true;

    const bootstrapAuth = async () => {
      const storedAccessToken = localStorage.getItem("accessToken");

      if (!storedAccessToken) {
        if (isMountedRef.current) setLoading(false);
        return;
      }

      try {
        await fetchCurrentUser(storedAccessToken);
      } catch (error) {
        const shouldClearAuth =
          error.response?.status === 401 || !localStorage.getItem("accessToken");

        if (shouldClearAuth) {
          clearStoredAuth();
          if (isMountedRef.current) setUser(null);
        }
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };

    bootstrapAuth();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (loading || !user) return;
    if (!PUBLIC_ONLY_ROUTES.includes(location.pathname)) return;
    if (new URLSearchParams(location.search).has("invite")) return;

    navigate(getRoleRedirect(user.role), { replace: true });
  }, [loading, user, location.pathname, location.search, navigate]);

  const value = useMemo(
    () => ({
      user,
      loading,
      hasRole: (roles) => Boolean(user && roles.includes(user.role)),
      isSuperAdmin: () => user?.role === "SUPER_ADMIN",
      isOrganizer: () => user?.role === "ORGANIZER",
      isUser: () => user?.role === "USER",
      authenticate,
      logout,
      refreshUser,
    }),
    [user, loading, authenticate, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
