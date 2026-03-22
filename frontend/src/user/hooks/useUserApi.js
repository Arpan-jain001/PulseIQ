// src/user/hooks/useUserApi.js
import { useState, useCallback } from "react";
import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_API_URL;
const headers = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  "Content-Type": "application/json",
});

export const useUserApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const req = useCallback(async (method, url, data = null) => {
    setLoading(true); setError(null);
    try {
      const res = await axios({ method, url: `${BASE}${url}`, data, headers: headers() });
      return res.data;
    } catch (e) {
      const msg = e.response?.data?.message || "Request failed";
      setError(msg); throw new Error(msg);
    } finally { setLoading(false); }
  }, []);

  // Profile
  const getProfile    = ()     => req("GET", "/api/users/me");
  const updateProfile = (data) => req("PUT", "/api/users/me", data);

  // ✅ Workspaces — USER bhi member ho sakta hai
  // GET /api/workspaces/mine — sab memberships return karta hai (OWNER + invited)
  const getMyWorkspaces = () => req("GET", "/api/workspaces/mine");

  // Members of a workspace (role check ke liye)
  const getWorkspaceMembers = (wsId) => req("GET", `/api/workspaces/${wsId}/members`);

  // ✅ Analytics — MEMBER/ADMIN role wale dekh sakte hain
  const getAnalyticsOverview = (projectId, from, to) => {
    const p = new URLSearchParams({ projectId, ...(from && { from }), ...(to && { to }) });
    return req("GET", `/api/analytics/overview?${p}`);
  };
  const getDau = (projectId, from, to) => {
    const p = new URLSearchParams({ projectId, ...(from && { from }), ...(to && { to }) });
    return req("GET", `/api/analytics/dau?${p}`);
  };

  // ✅ Projects — workspace ke projects
  const getProjects = () => req("GET", "/api/projects");

  // Notifications
  const getNotifications = (workspaceId) => {
    const p = workspaceId ? `?workspaceId=${workspaceId}` : "";
    return req("GET", `/api/notifications${p}`);
  };
  const markRead = (id) => req("PATCH", `/api/notifications/${id}/read`);

  return {
    loading, error,
    getProfile, updateProfile,
    getMyWorkspaces, getWorkspaceMembers,
    getAnalyticsOverview, getDau,
    getProjects,
    getNotifications, markRead,
  };
};