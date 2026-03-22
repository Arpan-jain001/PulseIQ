// src/admin/hooks/useAdminApi.js
import { useState, useCallback } from "react";
import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_API_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  "Content-Type": "application/json",
});

export const useAdminApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const request = useCallback(async (method, url, data = null) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios({ method, url: `${BASE}${url}`, data, headers: getHeaders() });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Request failed.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Stats ─────────────────────────────────────────
  const getStats    = () => request("GET", "/api/admin/analytics/overview");
  const getOverview = () => request("GET", "/api/admin/overview");
  const getDau      = () => request("GET", "/api/admin/analytics/dau");

  // ── Users ─────────────────────────────────────────
  const getUsers              = ()               => request("GET",    "/api/admin/users");
  const deleteUser            = (id)             => request("DELETE", `/api/admin/users/${id}`);
  const updateUserStatus      = (id, status)     => request("PATCH",  `/api/admin/users/${id}/status`,   { status });
  const updateVerificationStatus = (id, verificationStatus) =>
                                                    request("PATCH",  `/api/admin/users/${id}/verify`,   { verificationStatus });
  const updateUserRole        = (id, role)       => request("PATCH",  `/api/admin/users/${id}/status`,   { role });

  // ── Verifications ─────────────────────────────────
  const getVerificationRequests  = ()                  => request("GET",   "/api/verification/requests");
  const reviewVerification       = (id, status, note) => request("PATCH", `/api/verification/requests/${id}/review`, { status, note });

  // ── Workspaces / Orgs ─────────────────────────────
  const getOrganizations  = () => request("GET",    "/api/admin/workspaces");
  const deleteOrganization= (id) => request("DELETE", `/api/admin/workspaces/${id}`);

  // ── Notifications ─────────────────────────────────
  const getNotifications   = ()        => request("GET",    "/api/admin/notifications");
  const sendNotification   = (payload) => request("POST",   "/api/admin/notifications", payload);
  const deleteNotification = (id)      => request("DELETE", `/api/admin/notifications/${id}`);

  // ── Admins ────────────────────────────────────────
  const getAdmins = async () => {
    const res  = await request("GET", "/api/admin/users");
    const all  = res?.data || (Array.isArray(res) ? res : []);
    const list = all.filter(u => u.role === "SUPER_ADMIN");
    return { data: list };
  };

  // POST /api/admin/users/create-admin  → sends credentials email
  const createAdmin = ({ name, email, password }) =>
    request("POST", "/api/admin/users/create-admin", { name, email, password });

  // Hard delete
  const deleteAdmin = (id) => request("DELETE", `/api/admin/users/${id}`);

  // ✅ Remove admin privileges (PATCH) + reason → sends removal email
  const removeAdmin = (id, reason = "") =>
    request("PATCH", `/api/admin/users/${id}/remove-admin`, { reason });

  return {
    loading, error,
    // Stats
    getStats, getOverview, getDau,
    // Users
    getUsers, deleteUser, updateUserStatus, updateUserRole, updateVerificationStatus,
    // Verifications
    getVerificationRequests, reviewVerification,
    // Orgs
    getOrganizations, deleteOrganization,
    // Notifications
    getNotifications, sendNotification, deleteNotification,
    // Admins
    getAdmins, createAdmin, deleteAdmin, removeAdmin,
  };
};