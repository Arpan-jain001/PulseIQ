// src/organizer/hooks/useOrgApi.js
import { useState, useCallback } from "react";
import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_API_URL;
const headers = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  "Content-Type": "application/json",
});

export const useOrgApi = () => {
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

  // Workspaces
  const getMyWorkspaces = ()           => req("GET", "/api/workspaces/mine");
  const createWorkspace = (name)       => req("POST", "/api/workspaces", { name });
  const deleteWorkspace = (id)         => req("DELETE", `/api/workspaces/${id}`);
  const getMembers      = (wsId)       => req("GET", `/api/workspaces/${wsId}/members`);
  const addMember       = (wsId, email, role = "MEMBER") =>
    req("POST", `/api/workspaces/${wsId}/members`, { email, role });
  const removeMember    = (wsId, userId) =>
    req("DELETE", `/api/workspaces/${wsId}/members/${userId}`);

  // Projects
  const createProject = (workspaceId, name, allowedDomains = []) =>
    req("POST", "/api/projects", { workspaceId, name, allowedDomains });
  const getProjects   = ()   => req("GET", "/api/projects");
  const deleteProject  = (id)         => req("DELETE", `/api/projects/${id}`);
  const updateProject  = (id, data)     => req("PATCH",  `/api/projects/${id}`, data);
  const verifySdk          = (id) => req("GET",  `/api/projects/${id}/verify-sdk`);
  const skipVerification   = (id) => req("POST", `/api/projects/${id}/skip-verification`);

  // Analytics
  const getAnalyticsOverview = (projectId, from, to) => {
    const p = new URLSearchParams({ projectId, ...(from && { from }), ...(to && { to }) });
    return req("GET", `/api/analytics/overview?${p}`);
  };
  const getDau = (projectId, from, to) => {
    const p = new URLSearchParams({ projectId, ...(from && { from }), ...(to && { to }) });
    return req("GET", `/api/analytics/dau?${p}`);
  };

  // Funnel
  const getFunnel = (projectId, steps) =>
    req("POST", "/api/funnel", { projectId, steps });

  // Notifications
  const getNotifications = (workspaceId) => {
    const p = workspaceId ? `?workspaceId=${workspaceId}` : "";
    return req("GET", `/api/notifications${p}`);
  };
  const markRead = (id) => req("PATCH", `/api/notifications/${id}/read`);

  return {
    loading, error,
    getProfile, updateProfile,
    getMyWorkspaces, createWorkspace, deleteWorkspace,
    getMembers, addMember, removeMember,
    createProject, getProjects, deleteProject, updateProject, verifySdk, skipVerification,
    getAnalyticsOverview, getDau, getFunnel,
    getNotifications, markRead,
  };
};