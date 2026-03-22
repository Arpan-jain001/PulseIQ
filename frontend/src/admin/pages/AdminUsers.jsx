// src/admin/pages/AdminUsers.jsx
// Backend: GET /api/admin/users | DELETE /api/admin/users/:id
//          PATCH /api/admin/users/:id/status | PATCH /api/admin/users/:id/verify
// Note: Shows ALL users by default, can filter by role
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trash2, UserCog, X, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { useAdminApi } from "../hooks/useAdminApi";

const ROLE_CFG = {
  SUPER_ADMIN: { color: "#f43f8e", label: "Admin",     bg: "#f43f8e" },
  ORGANIZER:   { color: "#a855f7", label: "Organizer", bg: "#a855f7" },
  USER:        { color: "#00e5ff", label: "User",      bg: "#00e5ff" },
};

const RoleBadge = ({ role }) => {
  const { color, label } = ROLE_CFG[role] || { color: "#8ab4d4", label: role };
  return <span className="text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold"
    style={{ color, borderColor: `${color}30`, background: `${color}10`, fontFamily: "var(--font-mono)" }}>{label}</span>;
};

const StatusBadge = ({ status }) => {
  const m = { ACTIVE: "#10d990", SUSPENDED: "#f59e0b", BANNED: "#f43f8e" };
  const c = m[status] || "#8ab4d4";
  return <span className="text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold"
    style={{ color: c, borderColor: `${c}30`, background: `${c}10`, fontFamily: "var(--font-mono)" }}>{status}</span>;
};

const VerBadge = ({ status }) => {
  if (!status || status === "NONE") return <span className="text-[10px] text-[#1a3a6b]">—</span>;
  const m = { VERIFIED: "#10d990", PENDING: "#f59e0b", REJECTED: "#f43f8e" };
  const c = m[status] || "#8ab4d4";
  return <span className="text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold"
    style={{ color: c, borderColor: `${c}30`, background: `${c}10`, fontFamily: "var(--font-mono)" }}>{status}</span>;
};

// Edit Modal
const EditModal = ({ user, onClose, onSave }) => {
  const [status, setStatus]       = useState(user.status || "ACTIVE");
  const [verStatus, setVerStatus] = useState(user.verificationStatus || "PENDING");
  const [saving, setSaving]       = useState(false);

  return (
    <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative w-full max-w-md rounded-2xl border border-[#1a2a4a] bg-[#0a0f1a] p-6"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        style={{ boxShadow: "0 0 60px #00000099" }}>
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-[#f43f8e] to-[#7c3aed] opacity-60" />

        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>Edit User</h3>
          <button onClick={onClose} className="text-[#3d6080] hover:text-[#8ab4d4]"><X className="w-4 h-4" /></button>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#04080f] border border-[#1a2a4a] mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-[#020408] flex-shrink-0"
            style={{ background: ROLE_CFG[user.role]?.bg || "#00e5ff", fontFamily: "var(--font-display)" }}>
            {user.name?.charAt(0)}
          </div>
          <div>
            <p className="text-xs font-bold text-[#e8f4ff]">{user.name}</p>
            <p className="text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
              {user.email} · <span style={{ color: ROLE_CFG[user.role]?.color || "#8ab4d4" }}>{user.role}</span>
            </p>
          </div>
        </div>

        {/* Account Status */}
        <div className="mb-4">
          <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>Account Status</label>
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

        {/* Verification — only for ORGANIZER */}
        {user.role === "ORGANIZER" && (
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
        )}

        <div className="flex gap-3 mt-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#1a2a4a] text-[#8ab4d4] text-xs uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono)" }}>Cancel</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={async () => { setSaving(true); await onSave(user._id, status, verStatus); setSaving(false); }}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-[#00e5ff] text-[#020408] font-bold text-xs uppercase tracking-widest disabled:opacity-50"
            style={{ fontFamily: "var(--font-mono)" }}>{saving ? "Saving..." : "Save Changes"}</motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const AdminUsers = () => {
  const { getUsers, deleteUser, updateUserStatus, updateVerificationStatus, loading } = useAdminApi();
  const [allUsers, setAllUsers]   = useState([]);
  const [search, setSearch]       = useState("");
  const [roleFilter, setRoleFilter] = useState("USER"); // ✅ Default to USER only
  const [page, setPage]           = useState(1);
  const [editUser, setEditUser]   = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [toast, setToast]         = useState(null);
  const LIMIT = 12;

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    try {
      const res = await getUsers();
      setAllUsers(res?.data || (Array.isArray(res) ? res : []));
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  // ✅ Client-side filter
  const filtered = allUsers.filter(u => {
    const matchSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalPages = Math.ceil(filtered.length / LIMIT);
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  // Count per role
  const counts = { USER: 0, ORGANIZER: 0, SUPER_ADMIN: 0 };
  allUsers.forEach(u => { if (counts[u.role] !== undefined) counts[u.role]++; });

  const handleSave = async (id, status, verificationStatus) => {
    try {
      await updateUserStatus(id, status);
      const user = allUsers.find(u => u._id === id);
      if (user?.role === "ORGANIZER") await updateVerificationStatus(id, verificationStatus);
      showToast("success", "User updated!");
      setEditUser(null);
      load();
    } catch { showToast("error", "Update failed."); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      showToast("success", "User deleted.");
      setDeleteModal(null);
      load();
    } catch { showToast("error", "Delete failed."); }
  };

  const ROLE_TABS = [
    { key: "USER",        label: `Users (${counts.USER})`,       color: "#00e5ff" },
    { key: "ORGANIZER",   label: `Organizers (${counts.ORGANIZER})`, color: "#a855f7" },
    { key: "SUPER_ADMIN", label: `Admins (${counts.SUPER_ADMIN})`,   color: "#f43f8e" },
    { key: "",            label: `All (${allUsers.length})`,         color: "#8ab4d4" },
  ];

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
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="text-[10px] text-[#f43f8e] uppercase tracking-[0.3em] mb-1" style={{ fontFamily: "var(--font-mono)" }}>Admin / Users</p>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>User Management</h1>
            <motion.button whileTap={{ scale: 0.95 }} onClick={load}
              className="px-3 py-2 rounded-xl border border-[#1a2a4a] text-[#3d6080] hover:text-[#00e5ff] hover:border-[#00e5ff33] transition-all">
              <RefreshCw className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>

        {/* ✅ Role Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {ROLE_TABS.map(({ key, label, color }) => (
            <button key={key} onClick={() => { setRoleFilter(key); setPage(1); }}
              className="px-4 py-2 rounded-xl text-[11px] uppercase tracking-wider font-bold border transition-all"
              style={{ borderColor: roleFilter === key ? `${color}50` : "#1a2a4a", background: roleFilter === key ? `${color}15` : "transparent", color: roleFilter === key ? color : "#3d6080", fontFamily: "var(--font-mono)" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d6080]" />
          <input className="w-full bg-[#04080f] border border-[#1a2a4a] rounded-xl pl-9 pr-4 py-2.5 text-[#e8f4ff] placeholder:text-[#1a3a6b] focus:outline-none focus:border-[#f43f8e44] text-sm"
            style={{ fontFamily: "var(--font-mono)" }}
            placeholder="Search name or email..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden">
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-3 px-5 py-3 border-b border-[#1a2a4a] text-[10px] text-[#3d6080] uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono)" }}>
            <span>User</span><span>Email</span><span>Role</span><span>Status</span><span>Verification</span><span>Actions</span>
          </div>

          {loading && paged.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <motion.div className="w-8 h-8 rounded-full border-2 border-[#f43f8e33] border-t-[#f43f8e]"
                animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
            </div>
          ) : paged.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[11px] text-[#3d6080] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>No users found</p>
            </div>
          ) : (
            paged.map((u, i) => (
              <motion.div key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-3 items-center px-5 py-3.5 border-b border-[#1a2a4a]/50 last:border-0 hover:bg-[#ffffff04] transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black text-[#020408] flex-shrink-0"
                    style={{ background: ROLE_CFG[u.role]?.bg || "#00e5ff", fontFamily: "var(--font-display)" }}>
                    {u.name?.charAt(0)}
                  </div>
                  <span className="text-xs text-[#e8f4ff] font-bold truncate">{u.name}</span>
                </div>
                <span className="text-[11px] text-[#3d6080] truncate" style={{ fontFamily: "var(--font-mono)" }}>{u.email}</span>
                <RoleBadge role={u.role} />
                <StatusBadge status={u.status} />
                {/* Verification only meaningful for ORGANIZER */}
                <div>
                  {u.role === "ORGANIZER"
                    ? <VerBadge status={u.verificationStatus} />
                    : <span className="text-[10px] text-[#1a3a6b]">—</span>
                  }
                </div>
                <div className="flex items-center gap-2">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setEditUser(u)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center border border-[#1a2a4a] text-[#3d6080] hover:text-[#00e5ff] hover:border-[#00e5ff33] transition-all">
                    <UserCog className="w-3.5 h-3.5" />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setDeleteModal(u)}
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

      <AnimatePresence>
        {editUser && <EditModal user={editUser} onClose={() => setEditUser(null)} onSave={handleSave} />}
        {deleteModal && (
          <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setDeleteModal(null)} />
            <motion.div className="relative w-full max-w-sm rounded-2xl border border-[#1a2a4a] bg-[#0a0f1a] p-6 text-center"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}>
              <h3 className="text-sm font-black text-[#e8f4ff] mb-2 uppercase" style={{ fontFamily: "var(--font-display)" }}>Delete User</h3>
              <p className="text-xs text-[#3d6080] mb-5" style={{ fontFamily: "var(--font-mono)" }}>
                Delete "{deleteModal.name}"? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 rounded-xl border border-[#1a2a4a] text-[#8ab4d4] text-xs uppercase tracking-widest"
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

export default AdminUsers;