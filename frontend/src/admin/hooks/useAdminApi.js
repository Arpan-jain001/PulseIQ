import { useState, useCallback, useMemo } from "react";
import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_API_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  "Content-Type": "application/json",
});

export const useAdminApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, url, data = null) => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios({
        method,
        url: `${BASE}${url}`,
        data,
        headers: getHeaders(),
      });
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || "Request failed.";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const methods = useMemo(() => {
    const getStats = () => request("GET", "/api/admin/analytics/overview");
    const getOverview = () => request("GET", "/api/admin/overview");
    const getDau = () => request("GET", "/api/admin/analytics/dau");

    const getUsers = () => request("GET", "/api/admin/users");
    const deleteUser = (id, confirmation) => request("DELETE", `/api/admin/users/${id}`, { confirmation });
    const updateUserStatus = (id, status) => request("PATCH", `/api/admin/users/${id}/status`, { status });
    const updateVerificationStatus = (id, verificationStatus) =>
      request("PATCH", `/api/admin/users/${id}/verify`, { verificationStatus });
    const updateUserRole = (id, role) => request("PATCH", `/api/admin/users/${id}/status`, { role });

    const getVerificationRequests = () => request("GET", "/api/verification/requests");
    const reviewVerification = (id, status, note) =>
      request("PATCH", `/api/verification/requests/${id}/review`, { status, note });

    const getOrganizations = () => request("GET", "/api/admin/workspaces");
    const deleteOrganization = (id, confirmation) =>
      request("DELETE", `/api/admin/workspaces/${id}`, { confirmation });

    const getNotifications = () => request("GET", "/api/admin/notifications");
    const sendNotification = (payload) => request("POST", "/api/admin/notifications", payload);
    const deleteNotification = (id) => request("DELETE", `/api/admin/notifications/${id}`);

    const getAdmins = async () => {
      const res = await request("GET", "/api/admin/users");
      const all = res?.data || (Array.isArray(res) ? res : []);
      return { data: all.filter((user) => user.role === "SUPER_ADMIN") };
    };

    const createAdmin = ({ name, email, password }) =>
      request("POST", "/api/admin/users/create-admin", { name, email, password });
    const deleteAdmin = (id, confirmation) => request("DELETE", `/api/admin/users/${id}`, { confirmation });
    const removeAdmin = (id, reason = "") =>
      request("PATCH", `/api/admin/users/${id}/remove-admin`, { reason });

    return {
      getStats,
      getOverview,
      getDau,
      getUsers,
      deleteUser,
      updateUserStatus,
      updateVerificationStatus,
      updateUserRole,
      getVerificationRequests,
      reviewVerification,
      getOrganizations,
      deleteOrganization,
      getNotifications,
      sendNotification,
      deleteNotification,
      getAdmins,
      createAdmin,
      deleteAdmin,
      removeAdmin,
    };
  }, [request]);

  return {
    loading,
    error,
    ...methods,
  };
};
