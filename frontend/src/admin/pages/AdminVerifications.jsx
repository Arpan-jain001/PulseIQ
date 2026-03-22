// src/admin/pages/AdminVerifications.jsx
// Backend: GET /api/verification/requests
//          PATCH /api/verification/requests/:id/review
//          Also: PATCH /api/admin/users/:id/verify (direct user verification)
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Clock, Eye, RefreshCw, Building2, Mail, Calendar, FileText } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { useAdminApi } from "../hooks/useAdminApi";

const STATUS_CFG = {
  VERIFIED: { color: "#10d990", icon: CheckCircle2, label: "Verified" },
  PENDING:  { color: "#f59e0b", icon: Clock,        label: "Pending"  },
  REJECTED: { color: "#f43f8e", icon: XCircle,      label: "Rejected" },
};

const DetailModal = ({ item, onClose, onUpdate }) => {
  const [status, setStatus] = useState(item.verificationStatus || "PENDING");
  const [note, setNote]     = useState("");
  const [saving, setSaving] = useState(false);

  return (
    <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative w-full max-w-lg rounded-2xl border border-[#1a2a4a] bg-[#0a0f1a] p-6 overflow-hidden"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        style={{ boxShadow: "0 0 80px #00000099" }}>
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-[#f43f8e] via-[#7c3aed] to-[#00e5ff] opacity-60" />

        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] text-[#f59e0b] uppercase tracking-[0.2em] mb-1" style={{ fontFamily: "var(--font-mono)" }}>
              Verification Review
            </p>
            <h3 className="text-base font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>
              {item.name || "Unknown"}
            </h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl border border-[#1a2a4a] flex items-center justify-center text-[#3d6080] hover:text-[#8ab4d4] transition-colors">
            <XCircle className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { icon: Mail,     label: "Email",        value: item.email },
            { icon: Building2,label: "Company",      value: item.companyName || "—" },
            { icon: Calendar, label: "Joined",       value: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—" },
            { icon: FileText, label: "Current Status",value: item.verificationStatus || "PENDING" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="p-3 rounded-xl bg-[#04080f] border border-[#1a2a4a]">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3 h-3 text-[#3d6080]" />
                <p className="text-[9px] text-[#3d6080] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>{label}</p>
              </div>
              <p className="text-xs text-[#e8f4ff] font-bold truncate" style={{ fontFamily: "var(--font-mono)" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Status selector */}
        <div className="mb-4">
          <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>
            Set Verification Status
          </label>
          <div className="flex gap-2">
            {Object.entries(STATUS_CFG).map(([key, { color, label }]) => (
              <button key={key} onClick={() => setStatus(key)}
                className="flex-1 py-2.5 rounded-xl text-[10px] uppercase tracking-wider font-bold border transition-all"
                style={{ borderColor: status === key ? `${color}60` : "#1a2a4a", background: status === key ? `${color}18` : "transparent", color: status === key ? color : "#3d6080", fontFamily: "var(--font-mono)" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="mb-5">
          <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>
            Note (optional)
          </label>
          <textarea
            className="w-full bg-[#04080f] border border-[#1a2a4a] rounded-xl px-3 py-2.5 text-[#8ab4d4] placeholder:text-[#1a3a6b] focus:outline-none focus:border-[#f43f8e44] text-xs resize-none"
            style={{ fontFamily: "var(--font-mono)" }}
            rows={3}
            placeholder="Reason for rejection or approval note..."
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#1a2a4a] text-[#8ab4d4] text-xs uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono)" }}>Cancel</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={async () => { setSaving(true); await onUpdate(item._id, status, note); setSaving(false); }}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest disabled:opacity-50"
            style={{ background: STATUS_CFG[status]?.color, color: "#020408", fontFamily: "var(--font-mono)" }}>
            {saving ? "Saving..." : `Mark ${STATUS_CFG[status]?.label}`}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const AdminVerifications = () => {
  const { getUsers, updateVerificationStatus, loading } = useAdminApi();
  const [allUsers, setAllUsers] = useState([]);
  const [filter, setFilter]     = useState("PENDING");
  const [selected, setSelected] = useState(null);
  const [toast, setToast]       = useState(null);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    try {
      const res = await getUsers();
      const users = res?.data || (Array.isArray(res) ? res : []);
      // Only organizers have verification status
      setAllUsers(users.filter(u => u.role === "ORGANIZER"));
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter ? allUsers.filter(u => u.verificationStatus === filter) : allUsers;

  const handleUpdate = async (id, verificationStatus, note) => {
    try {
      // PATCH /api/admin/users/:id/verify
      await updateVerificationStatus(id, verificationStatus);
      showToast("success", `Status set to ${verificationStatus}!`);
      setSelected(null);
      load();
    } catch { showToast("error", "Update failed."); }
  };

  const counts = { PENDING: 0, VERIFIED: 0, REJECTED: 0 };
  allUsers.forEach(u => { if (counts[u.verificationStatus] !== undefined) counts[u.verificationStatus]++; });

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
          <p className="text-[10px] text-[#f43f8e] uppercase tracking-[0.3em] mb-1" style={{ fontFamily: "var(--font-mono)" }}>Admin / Verifications</p>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>Organization Verifications</h1>
            <motion.button whileTap={{ scale: 0.95 }} onClick={load}
              className="px-3 py-2 rounded-xl border border-[#1a2a4a] text-[#3d6080] hover:text-[#00e5ff] hover:border-[#00e5ff33] transition-all">
              <RefreshCw className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: "PENDING",  color: "#f59e0b", label: `Pending (${counts.PENDING})` },
            { key: "VERIFIED", color: "#10d990", label: `Verified (${counts.VERIFIED})` },
            { key: "REJECTED", color: "#f43f8e", label: `Rejected (${counts.REJECTED})` },
            { key: "",         color: "#8ab4d4", label: `All (${allUsers.length})` },
          ].map(({ key, color, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className="px-4 py-2 rounded-xl text-[11px] uppercase tracking-wider font-bold border transition-all"
              style={{ borderColor: filter === key ? `${color}50` : "#1a2a4a", background: filter === key ? `${color}15` : "transparent", color: filter === key ? color : "#3d6080", fontFamily: "var(--font-mono)" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden">
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-[#1a2a4a] text-[10px] text-[#3d6080] uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono)" }}>
            <span>Organization</span><span>Email</span><span>Joined</span><span>Status</span><span>Review</span>
          </div>

          {loading && filtered.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <motion.div className="w-8 h-8 rounded-full border-2 border-[#f59e0b33] border-t-[#f59e0b]"
                animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle2 className="w-8 h-8 text-[#10d990] mx-auto mb-3 opacity-40" />
              <p className="text-[11px] text-[#3d6080] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                No {filter || ""} verifications
              </p>
            </div>
          ) : (
            filtered.map((item, i) => {
              const cfg = STATUS_CFG[item.verificationStatus] || STATUS_CFG.PENDING;
              const StatusIcon = cfg.icon;
              return (
                <motion.div key={item._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 border-b border-[#1a2a4a]/50 last:border-0 hover:bg-[#ffffff04] transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
                      style={{ fontFamily: "var(--font-display)" }}>{item.name?.charAt(0) || "O"}</div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#e8f4ff] truncate">{item.name}</p>
                      <p className="text-[10px] text-[#3d6080] truncate" style={{ fontFamily: "var(--font-mono)" }}>{item.companyName || "No company"}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#3d6080] truncate" style={{ fontFamily: "var(--font-mono)" }}>{item.email}</span>
                  <span className="text-[10px] text-[#1a3a6b]" style={{ fontFamily: "var(--font-mono)" }}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <StatusIcon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cfg.color, fontFamily: "var(--font-mono)" }}>{cfg.label}</span>
                  </div>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setSelected(item)}
                    className="w-8 h-8 rounded-xl border border-[#1a2a4a] flex items-center justify-center text-[#3d6080] hover:text-[#f59e0b] hover:border-[#f59e0b33] transition-all">
                    <Eye className="w-3.5 h-3.5" />
                  </motion.button>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {selected && <DetailModal item={selected} onClose={() => setSelected(null)} onUpdate={handleUpdate} />}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminVerifications;