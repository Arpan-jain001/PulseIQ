import { useState, useCallback, useMemo } from "react";
import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_API_URL;

const headers = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  "Content-Type": "application/json",
});

export const useOrgApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const req = useCallback(async (method, url, data = null) => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios({ method, url: `${BASE}${url}`, data, headers: headers() });
      return res.data;
    } catch (e) {
      const message = e.response?.data?.message || "Request failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const methods = useMemo(() => {
    const getProfile = () => req("GET", "/api/users/me");
    const updateProfile = (data) => req("PUT", "/api/users/me", data);

    const getMyWorkspaces = () => req("GET", "/api/workspaces/mine");
    const createWorkspace = (name) => req("POST", "/api/workspaces", { name });
    const deleteWorkspace = (id, confirmation) => req("DELETE", `/api/workspaces/${id}`, { confirmation });
    const getMembers = (workspaceId) => req("GET", `/api/workspaces/${workspaceId}/members`);
    const addMember = (workspaceId, email, role = "MEMBER") =>
      req("POST", `/api/workspaces/${workspaceId}/members`, { email, role });
    const removeMember = (workspaceId, userId, confirmation) =>
      req("DELETE", `/api/workspaces/${workspaceId}/members/${userId}`, { confirmation });
    const acceptInvitation = (token) => req("POST", "/api/workspaces/invitations/accept", { token });

    const createProject = (workspaceId, name, allowedDomains = []) =>
      req("POST", "/api/projects", { workspaceId, name, allowedDomains });
    const getProjects = () => req("GET", "/api/projects");
    const deleteProject = (id, confirmation) => req("DELETE", `/api/projects/${id}`, { confirmation });
    const updateProject = (id, data) => req("PATCH", `/api/projects/${id}`, data);
    const verifySdk = (id) => req("GET", `/api/projects/${id}/verify-sdk`);
    const skipVerification = (id) => req("POST", `/api/projects/${id}/skip-verification`);

    const getMau = (projectId) => req("GET", `/api/analytics/mau?projectId=${projectId}`);
    const getPageAnalytics = (projectId, from, to) =>
      req("GET", `/api/analytics/page-analytics?projectId=${projectId}&from=${from}&to=${to}`);
    const getRetention = (projectId, from, to) =>
      req("GET", `/api/analytics/retention?projectId=${projectId}&from=${from}&to=${to}`);
    const getEventTrend = (projectId, from, to) =>
      req("GET", `/api/analytics/event-trend?projectId=${projectId}&from=${from}&to=${to}`);
    const getHeatmap = (projectId, from, to, page = "") =>
      req(
        "GET",
        `/api/analytics/heatmap?projectId=${projectId}&from=${from}&to=${to}${page ? `&page=${encodeURIComponent(page)}` : ""}`
      );
    const getSessions = (projectId, from, to) =>
      req("GET", `/api/analytics/sessions?projectId=${projectId}&from=${from}&to=${to}`);
    const getExamAnalytics = (projectId, from, to) =>
      req("GET", `/api/analytics/exam?projectId=${projectId}&from=${from}&to=${to}`);

    const getAiInsights = (body) => req("POST", "/api/ai/insights", body);
    const askAiChat = (body) => req("POST", "/api/ai/chat", body);
    const getPageAiInsights = (body) => req("POST", "/api/ai/page-insights", body);

    const getAnalyticsOverview = (projectId, from, to) => {
      const params = new URLSearchParams({ projectId, ...(from && { from }), ...(to && { to }) });
      return req("GET", `/api/analytics/overview?${params}`);
    };

    const getDau = (projectId, from, to) => {
      const params = new URLSearchParams({ projectId, ...(from && { from }), ...(to && { to }) });
      return req("GET", `/api/analytics/dau?${params}`);
    };

    const getFunnel = (projectId, steps) => req("POST", "/api/funnel", { projectId, steps });

    const getNotifications = (workspaceId) => {
      const suffix = workspaceId ? `?workspaceId=${workspaceId}` : "";
      return req("GET", `/api/notifications${suffix}`);
    };

    const markRead = (id) => req("PATCH", `/api/notifications/${id}/read`);

    return {
      getProfile,
      updateProfile,
      getMyWorkspaces,
      createWorkspace,
      deleteWorkspace,
      getMembers,
      addMember,
      removeMember,
      acceptInvitation,
      createProject,
      getProjects,
      deleteProject,
      updateProject,
      verifySdk,
      skipVerification,
      getMau,
      getPageAnalytics,
      getRetention,
      getEventTrend,
      getHeatmap,
      getSessions,
      getExamAnalytics,
      getAiInsights,
      askAiChat,
      getPageAiInsights,
      getAnalyticsOverview,
      getDau,
      getFunnel,
      getNotifications,
      markRead,
    };
  }, [req]);

  return {
    loading,
    error,
    ...methods,
  };
};
