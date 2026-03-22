// src/admin/pages/AdminOrganizations.jsx
// Organizations = Users with role=ORGANIZER
// Backend: GET /api/admin/users (filter client-side by role=ORGANIZER)
//          PATCH /api/admin/users/:id/status
//          PATCH /api/admin/users/:id/verify
//          DELETE /api/admin/users/:id
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Trash2, RefreshCw, Search, ChevronLeft, ChevronRight, UserCog, X, CheckCircle2, Clock, XCircle } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { useAdminApi } from "../hooks/useAdminApi";

const VER_CFG = {
  VERIFIED: { color: "#10d990", label: "Verified" },
  PENDING:  { color: "#f59e0b", label: "Pending"  },
  REJECTED: { color: "#f43f8e", label: "Rejected" },
};

const StatusBadge = ({ status }) => {
  const m = { ACTIVE: "#10d990", SUSPENDED: "#f59e0b", BANNED: "#f43f8e" };
  const c = m[status] || "#8ab4d4";
  return <span className="text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold"
    style={{ color: c, borderColor: `${c}30`, background: `${c}10`, fontFamily: "var(--font-mono)" }}>{status}</span>;
};

const VerBadge = ({ status }) => {
  const cfg = VER_CFG[status] || { color: "#8ab4d4", label: status || "PENDING" };
  return <span className="text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold"
    style={{ color: cfg.color, borderColor: `${cfg.color}30`, background: `${cfg.color}10`, fontFamily: "var(--font-mono)" }}>{cfg.label}</span>;
};

// Edit Modal for Org
const EditOrgModal = ({ org, onClose, onSave }) => {
  const [status, setStatus]   = useState(org.status || "ACTIVE");
  const [verStatus, setVerStatus] = useState(org.verificationStatus || "PENDING");
  const [saving, setSaving]   = useState(false);

  return (
    <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative w-full max-w-md rounded-2xl border border-[#1a2a4a] bg-[#0a0f1a] p-6"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        style={{ boxShadow: "0 0 60px #00000099" }}>
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-[#a855f7] via-[#f43f8e] to-transparent opacity-60" />

        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>
            Edit Organization
          </h3>
          <button onClick={onClose} className="text-[#3d6080] hover:text-[#8ab4d4]"><X className="w-4 h-4" /></button>
        </div>

        {/* Org info */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#04080f] border border-[#1a2a4a] mb-5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center text-xs font-black text-white flex-shrink-0"
            style={{ fontFamily: "var(--font-display)" }}>{org.name?.charAt(0)}</div>
          <div>
            <p className="text-xs font-bold text-[#e8f4ff]">{org.name}</p>
            <p className="text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
              {org.companyName || "No company"} · {org.email}
            </p>
          </div>
        </div>

        {/* Account Status */}
        <div className="mb-4">
          <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>
            Account Status
          </label>
          <div className="flex gap-2">
            {[{ v: "ACTIVE", c: "#10d990" }, { v: "SUSPENDED", c: "#f59e0b" }, { v: "BANNED", c: "#f43f8e" }].map(({ v, c }) => (
              <button key={v} onClick={() => setStatus(v)}
                className="flex-1 py-2 rounded-xl text-[10px] uppercase tracking-wider font-bold border transition-all"
                style={{ borderColor: status === v ? `${c}50` : "#1a2a4a", background: status === v ? `${c}15` : "transparent", color: status === v ? c : "#3d6080", fontFamily: "var(--font-mono)" }}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Verification Status */}
        <div className="mb-5">
          <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>
            Verification Status
          </label>
          <div className="flex gap-2">
            {[{ v: "VERIFIED", c: "#10d990" }, { v: "PENDING", c: "#f59e0b" }, { v: "REJECTED", c: "#f43f8e" }].map(({ v, c }) => (
              <button key={v} onClick={() => setVerStatus(v)}
                className="flex-1 py-2 rounded-xl text-[10px] uppercase tracking-wider font-bold border transition-all"
                style={{ borderColor: verStatus === v ? `${c}50` : "#1a2a4a", background: verStatus === v ? `${c}15` : "transparent", color: verStatus === v ? c : "#3d6080", fontFamily: "var(--font-mono)" }}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#1a2a4a] text-[#8ab4d4] text-xs uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono)" }}>Cancel</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={async () => { setSaving(true); await onSave(org._id, status, verStatus); setSaving(false); }}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-[#a855f7] text-white font-bold text-xs uppercase tracking-widest disabled:opacity-50"
            style={{ fontFamily: "var(--font-mono)" }}>{saving ? "Saving..." : "Save Changes"}</motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const AdminOrganizations = () => {
  const { getUsers, updateUserStatus, updateVerificationStatus, deleteUser, loading } = useAdminApi();
  const [allOrgs, setAllOrgs]   = useState([]);
  const [search, setSearch]     = useState("");
  const [verFilter, setVerFilter] = useState("");
  const [page, setPage]         = useState(1);
  const [editOrg, setEditOrg]   = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [toast, setToast]       = useState(null);
  const LIMIT = 10;

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    try {
      const res = await getUsers();
      const users = res?.data || (Array.isArray(res) ? res : []);
      // ✅ Only ORGANIZER role users
      setAllOrgs(users.filter(u => u.role === "ORGANIZER"));
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  // Client-side filter
  const filtered = allOrgs.filter(o => {
    const matchSearch = !search ||
      o.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.email?.toLowerCase().includes(search.toLowerCase()) ||
      o.companyName?.toLowerCase().includes(search.toLowerCase());
    const matchVer = !verFilter || o.verificationStatus === verFilter;
    return matchSearch && matchVer;
  });

  const totalPages = Math.ceil(filtered.length / LIMIT);
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const handleSave = async (id, status, verificationStatus) => {
    try {
      await updateUserStatus(id, status);
      await updateVerificationStatus(id, verificationStatus);
      showToast("success", "Organization updated!");
      setEditOrg(null);
      load();
    } catch { showToast("error", "Update failed."); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      showToast("success", "Organization deleted.");
      setDeleteModal(null);
      load();
    } catch { showToast("error", "Delete failed."); }
  };

  // Count by verificationStatus
  const counts = { VERIFIED: 0, PENDING: 0, REJECTED: 0 };
  allOrgs.forEach(o => { if (counts[o.verificationStatus] !== undefined) counts[o.verificationStatus]++; });

  return (
    <AdminLayout>
      <AnimatePresence>
        {toast && (
          <motion.div className="fixed top-20 right-6 z-[10000] px-4 py-3 rounded-xl border text-xs font-bold uppercase tracking-widest"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ fontFamily: "var(--font-mono)", background: toast.type === "success" ? "#10d99015" : "#f43f8e15", borderColor: toast.type === "success" ? "#10d99030" : "#f43f8e30", color: toast.type === "success" ? "#10d990" : "#f43f8e" }}>
            {toast.type === "success" ? "✅" : "❌"} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="text-[10px] text-[#f43f8e] uppercase tracking-[0.3em] mb-1" style={{ fontFamily: "var(--font-mono)" }}>Admin / Organizations</p>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>
                Organizations
              </h1>
              <p className="text-[11px] text-[#3d6080] mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
                All users with ORGANIZER role — {allOrgs.length} total
              </p>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={load}
              className="px-3 py-2 rounded-xl border border-[#1a2a4a] text-[#3d6080] hover:text-[#00e5ff] hover:border-[#00e5ff33] transition-all">
              <RefreshCw className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>

        {/* Summary cards */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Verified",  count: counts.VERIFIED,  color: "#10d990", icon: CheckCircle2 },
            { label: "Pending",   count: counts.PENDING,   color: "#f59e0b", icon: Clock },
            { label: "Rejected",  count: counts.REJECTED,  color: "#f43f8e", icon: XCircle },
          ].map(({ label, count, color, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-4 flex items-center gap-3"
              style={{ boxShadow: "0 4px 24px #00000044" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div>
                <p className="text-xl font-black text-[#e8f4ff]" style={{ fontFamily: "var(--font-display)" }}>{count}</p>
                <p className="text-[10px] text-[#3d6080] uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)" }}>{label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d6080]" />
            <input
              className="w-full bg-[#04080f] border border-[#1a2a4a] rounded-xl pl-9 pr-4 py-2.5 text-[#e8f4ff] placeholder:text-[#1a3a6b] focus:outline-none focus:border-[#a855f744] text-sm"
              style={{ fontFamily: "var(--font-mono)" }}
              placeholder="Search name, email or company..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex gap-2">
            {["", "PENDING", "VERIFIED", "REJECTED"].map(v => {
              const cfg = { PENDING: "#f59e0b", VERIFIED: "#10d990", REJECTED: "#f43f8e", "": "#8ab4d4" };
              const c = cfg[v];
              return (
                <button key={v} onClick={() => { setVerFilter(v); setPage(1); }}
                  className="px-3 py-2.5 rounded-xl text-[10px] uppercase tracking-wider font-bold border transition-all"
                  style={{ borderColor: verFilter === v ? `${c}50` : "#1a2a4a", background: verFilter === v ? `${c}15` : "transparent", color: verFilter === v ? c : "#3d6080", fontFamily: "var(--font-mono)" }}>
                  {v || "All"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_1fr_auto] gap-3 px-5 py-3 border-b border-[#1a2a4a] text-[10px] text-[#3d6080] uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono)" }}>
            <span>Organization</span>
            <span>Email</span>
            <span>Company</span>
            <span>Status</span>
            <span>Verification</span>
            <span>Actions</span>
          </div>

          {loading && paged.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <motion.div className="w-8 h-8 rounded-full border-2 border-[#a855f733] border-t-[#a855f7]"
                animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
            </div>
          ) : paged.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="w-8 h-8 text-[#1a3a6b] mx-auto mb-3" />
              <p className="text-[11px] text-[#3d6080] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                No organizations found
              </p>
            </div>
          ) : (
            paged.map((org, i) => (
              <motion.div key={org._id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_1fr_auto] gap-3 items-center px-5 py-3.5 border-b border-[#1a2a4a]/50 last:border-0 hover:bg-[#ffffff04] transition-colors">

                {/* Name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
                    style={{ fontFamily: "var(--font-display)" }}>
                    {org.name?.charAt(0)}
                  </div>
                  <p className="text-xs font-bold text-[#e8f4ff] truncate">{org.name}</p>
                </div>

                {/* Email */}
                <span className="text-[11px] text-[#3d6080] truncate" style={{ fontFamily: "var(--font-mono)" }}>{org.email}</span>

                {/* Company */}
                <span className="text-[11px] text-[#8ab4d4] truncate" style={{ fontFamily: "var(--font-mono)" }}>
                  {org.companyName || <span className="text-[#1a3a6b]">—</span>}
                </span>

                {/* Account status */}
                <StatusBadge status={org.status} />

                {/* Verification status */}
                <VerBadge status={org.verificationStatus} />

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setEditOrg(org)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center border border-[#1a2a4a] text-[#3d6080] hover:text-[#a855f7] hover:border-[#a855f733] transition-all">
                    <UserCog className="w-3.5 h-3.5" />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setDeleteModal(org)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center border border-[#1a2a4a] text-[#3d6080] hover:text-[#f43f8e] hover:border-[#f43f8e33] transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-5">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 rounded-xl border border-[#1a2a4a] flex items-center justify-center text-[#3d6080] hover:text-[#00e5ff] disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <span className="text-[11px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>{page} / {totalPages}</span>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 rounded-xl border border-[#1a2a4a] flex items-center justify-center text-[#3d6080] hover:text-[#00e5ff] disabled:opacity-30 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {editOrg && <EditOrgModal org={editOrg} onClose={() => setEditOrg(null)} onSave={handleSave} />}
        {deleteModal && (
          <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setDeleteModal(null)} />
            <motion.div className="relative w-full max-w-sm rounded-2xl border border-[#1a2a4a] bg-[#0a0f1a] p-6 text-center"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}>
              <h3 className="text-sm font-black text-[#e8f4ff] mb-2 uppercase" style={{ fontFamily: "var(--font-display)" }}>Delete Organization</h3>
              <p className="text-xs text-[#3d6080] mb-5" style={{ fontFamily: "var(--font-mono)" }}>
                Delete organizer "{deleteModal.name}"? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#1a2a4a] text-[#8ab4d4] text-xs uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-mono)" }}>Cancel</button>
                <motion.button whileTap={{ scale: 0.98 }} onClick={() => handleDelete(deleteModal._id)}
                  className="flex-1 py-2.5 rounded-xl bg-[#f43f8e] text-white font-bold text-xs uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-mono)" }}>Delete</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminOrganizations;