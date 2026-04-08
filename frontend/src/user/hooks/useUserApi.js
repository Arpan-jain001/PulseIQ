import { useState, useCallback, useMemo } from "react";
import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_API_URL;

const headers = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  "Content-Type": "application/json",
});

export const useUserApi = () => {
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
    const getWorkspaceMembers = (workspaceId) => req("GET", `/api/workspaces/${workspaceId}/members`);

    const getAnalyticsOverview = (projectId, from, to) => {
      const params = new URLSearchParams({ projectId, ...(from && { from }), ...(to && { to }) });
      return req("GET", `/api/analytics/overview?${params}`);
    };

    const getDau = (projectId, from, to) => {
      const params = new URLSearchParams({ projectId, ...(from && { from }), ...(to && { to }) });
      return req("GET", `/api/analytics/dau?${params}`);
    };

    const getRetention = (projectId, from, to) => {
      const params = new URLSearchParams({ projectId, ...(from && { from }), ...(to && { to }) });
      return req("GET", `/api/analytics/retention?${params}`);
    };

    const getPageAnalytics = (projectId, from, to) => {
      const params = new URLSearchParams({ projectId, ...(from && { from }), ...(to && { to }) });
      return req("GET", `/api/analytics/page-analytics?${params}`);
    };

    const getHeatmap = (projectId, from, to, page = "") => {
      const params = new URLSearchParams({ projectId, ...(from && { from }), ...(to && { to }), ...(page && { page }) });
      return req("GET", `/api/analytics/heatmap?${params}`);
    };

    const getSessions = (projectId, from, to) => {
      const params = new URLSearchParams({ projectId, ...(from && { from }), ...(to && { to }) });
      return req("GET", `/api/analytics/sessions?${params}`);
    };

    const getExamAnalytics = (projectId, from, to) => {
      const params = new URLSearchParams({ projectId, ...(from && { from }), ...(to && { to }) });
      return req("GET", `/api/analytics/exam?${params}`);
    };

    const getProjects = () => req("GET", "/api/projects");

    const getNotifications = (workspaceId) => {
      const suffix = workspaceId ? `?workspaceId=${workspaceId}` : "";
      return req("GET", `/api/notifications${suffix}`);
    };

    const markRead = (id) => req("PATCH", `/api/notifications/${id}/read`);

    return {
      getProfile,
      updateProfile,
      getMyWorkspaces,
      getWorkspaceMembers,
      getAnalyticsOverview,
      getDau,
      getRetention,
      getPageAnalytics,
      getHeatmap,
      getSessions,
      getExamAnalytics,
      getProjects,
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
