// src/admin/pages/AdminWorkspaces.jsx
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Trash2, RefreshCw, Search,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Users, FolderKanban, Mail, Calendar, Shield,
  CheckCircle2, Clock, XCircle, Copy, Check, X
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";

const BASE = import.meta.env.VITE_BACKEND_API_URL;
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("accessToken")}` });

/* ── Copy Button ─────────────────────────────────────── */
const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true); setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        const el = document.createElement("textarea");
        el.value = text; el.style.cssText = "position:fixed;top:-9999px;opacity:0";
        document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el);
        setCopied(true); setTimeout(() => setCopied(false), 2000);
      });
    } catch {}
  };
  return (
    <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleCopy}
      className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg flex-shrink-0"
      style={{ color: copied ? "#10d990" : "#3d6080", background: copied ? "#10d99015" : "transparent" }}>
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
    </motion.button>
  );
};

/* ── Detail Modal ────────────────────────────────────── */
const DetailModal = ({ ws, onClose, onDelete }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BASE}/api/admin/workspaces/${ws._id}`, { headers: headers() });
        const data = await res.json();
        setDetails(data?.data);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [ws._id]);

  const VER_CFG = {
    VERIFIED: { color: "#10d990", icon: CheckCircle2 },
    PENDING:  { color: "#f59e0b", icon: Clock },
    REJECTED: { color: "#f43f8e", icon: XCircle },
  };

  const owner = details?.workspace?.ownerId;
  const members = details?.members || [];
  const projects = details?.projects || [];
  const verCfg = VER_CFG[owner?.verificationStatus] || VER_CFG.PENDING;
  const VerIcon = verCfg.icon;

  return (
    <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        style={{ background: "linear-gradient(135deg,#0a0f1a 0%,#060d18 100%)", border: "1px solid #f43f8e22", boxShadow: "0 0 80px #f43f8e08, 0 20px 80px #00000099" }}>
        <div className="h-[2px] bg-gradient-to-r from-[#f43f8e] via-[#7c3aed] to-[#00e5ff]" />

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a2a4a]">
          <div>
            <p className="text-[10px] text-[#f43f8e] uppercase tracking-widest mb-0.5" style={{ fontFamily: "var(--font-mono)" }}>Workspace Details</p>
            <h2 className="text-base font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>
              {ws.name}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => onDelete(ws)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#f43f8e30] text-[#f43f8e] hover:bg-[#f43f8e10] transition-all text-[10px] uppercase tracking-wider font-bold"
              style={{ fontFamily: "var(--font-mono)" }}>
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </motion.button>
            <button onClick={onClose} className="w-8 h-8 rounded-xl border border-[#1a2a4a] flex items-center justify-center text-[#3d6080] hover:text-[#8ab4d4] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <motion.div className="w-8 h-8 rounded-full border-2 border-[#f43f8e33] border-t-[#f43f8e]"
              animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
          </div>
        ) : (
          <div className="p-6 space-y-5">

            {/* ── Workspace Info ── */}
            <section>
              <p className="text-[10px] text-[#f43f8e] uppercase tracking-widest mb-3 flex items-center gap-2"
                style={{ fontFamily: "var(--font-mono)" }}>
                <Building2 className="w-3.5 h-3.5" /> Workspace Info
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { label: "Workspace ID", value: ws._id, copy: true },
                  { label: "Name",         value: ws.name },
                  { label: "Status",       value: ws.status || "ACTIVE" },
                  { label: "Members",      value: `${members.length} active` },
                  { label: "Projects",     value: `${projects.length} total` },
                  { label: "Created",      value: ws.createdAt ? new Date(ws.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—" },
                ].map(({ label, value, copy }) => (
                  <div key={label} className="p-3 rounded-xl bg-[#04080f] border border-[#1a2a4a]">
                    <p className="text-[9px] text-[#3d6080] uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-mono)" }}>{label}</p>
                    <div className="flex items-center gap-1">
                      <p className="text-[11px] text-[#e8f4ff] font-bold truncate" style={{ fontFamily: "var(--font-mono)" }}>{value || "—"}</p>
                      {copy && <CopyBtn text={value} />}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Owner Info ── */}
            <section>
              <p className="text-[10px] text-[#a855f7] uppercase tracking-widest mb-3 flex items-center gap-2"
                style={{ fontFamily: "var(--font-mono)" }}>
                <Shield className="w-3.5 h-3.5" /> Owner Details
              </p>
              {owner ? (
                <div className="rounded-2xl border border-[#1a2a4a] bg-[#04080f] p-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center text-base font-black text-white flex-shrink-0"
                      style={{ fontFamily: "var(--font-display)", boxShadow: "0 0 16px #a855f733" }}>
                      {owner.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-black text-[#e8f4ff]">{owner.name}</p>
                        {/* Verification badge */}
                        <span className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold"
                          style={{ color: verCfg.color, borderColor: `${verCfg.color}30`, background: `${verCfg.color}10`, fontFamily: "var(--font-mono)" }}>
                          <VerIcon className="w-3 h-3" />
                          {owner.verificationStatus || "PENDING"}
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold"
                          style={{ color: owner.status === "ACTIVE" ? "#10d990" : "#f43f8e", borderColor: owner.status === "ACTIVE" ? "#10d99030" : "#f43f8e30", background: owner.status === "ACTIVE" ? "#10d99010" : "#f43f8e10", fontFamily: "var(--font-mono)" }}>
                          {owner.status || "ACTIVE"}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {[
                          { icon: Mail,     label: "Email",   value: owner.email, copy: true },
                          { icon: Building2,label: "Company", value: owner.companyName || "—" },
                          { icon: Shield,   label: "Role",    value: owner.role },
                          { icon: Calendar, label: "Joined",  value: owner.createdAt ? new Date(owner.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—" },
                        ].map(({ icon: Icon, label, value, copy }) => (
                          <div key={label} className="flex items-center gap-2">
                            <Icon className="w-3 h-3 text-[#3d6080] flex-shrink-0" />
                            <span className="text-[10px] text-[#3d6080] uppercase tracking-wider flex-shrink-0"
                              style={{ fontFamily: "var(--font-mono)" }}>{label}:</span>
                            <span className="text-[10px] text-[#8ab4d4] truncate"
                              style={{ fontFamily: "var(--font-mono)" }}>{value}</span>
                            {copy && <CopyBtn text={value} />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>Owner info not available</p>
              )}
            </section>

            {/* ── Projects ── */}
            <section>
              <p className="text-[10px] text-[#00e5ff] uppercase tracking-widest mb-3 flex items-center gap-2"
                style={{ fontFamily: "var(--font-mono)" }}>
                <FolderKanban className="w-3.5 h-3.5" /> Projects ({projects.length})
              </p>
              {projects.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#04080f] border border-[#1a2a4a] text-center">
                  <p className="text-[11px] text-[#1a3a6b]" style={{ fontFamily: "var(--font-mono)" }}>No projects yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.map(proj => (
                    <div key={proj._id} className="p-3 rounded-xl bg-[#04080f] border border-[#1a2a4a]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00e5ff] to-[#10d990] flex items-center justify-center text-[11px] font-black text-[#020408] flex-shrink-0"
                            style={{ fontFamily: "var(--font-display)" }}>
                            {proj.name?.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#e8f4ff] truncate">{proj.name}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <code className="text-[9px] text-[#1a3a6b] truncate" style={{ fontFamily: "var(--font-mono)" }}>{proj._id}</code>
                              <CopyBtn text={proj._id} />
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold"
                            style={{ color: proj.status === "ACTIVE" ? "#10d990" : "#f59e0b", borderColor: proj.status === "ACTIVE" ? "#10d99030" : "#f59e0b30", background: proj.status === "ACTIVE" ? "#10d99010" : "#f59e0b10", fontFamily: "var(--font-mono)" }}>
                            {proj.status || "ACTIVE"}
                          </span>
                          <span className="text-[9px] text-[#1a3a6b]" style={{ fontFamily: "var(--font-mono)" }}>
                            {proj.createdAt ? new Date(proj.createdAt).toLocaleDateString() : "—"}
                          </span>
                        </div>
                      </div>
                      {/* Domains */}
                      {proj.allowedDomains?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {proj.allowedDomains.map(d => (
                            <span key={d} className="text-[9px] px-2 py-0.5 rounded-full border border-[#00e5ff20] bg-[#00e5ff08] text-[#00e5ff]"
                              style={{ fontFamily: "var(--font-mono)" }}>{d}</span>
                          ))}
                        </div>
                      )}
                      {proj.allowedDomains?.length === 0 && (
                        <p className="mt-1.5 text-[9px] text-[#1a3a6b]" style={{ fontFamily: "var(--font-mono)" }}>All domains allowed</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── Members ── */}
            <section>
              <p className="text-[10px] text-[#10d990] uppercase tracking-widest mb-3 flex items-center gap-2"
                style={{ fontFamily: "var(--font-mono)" }}>
                <Users className="w-3.5 h-3.5" /> Members ({members.length})
              </p>
              {members.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#04080f] border border-[#1a2a4a] text-center">
                  <p className="text-[11px] text-[#1a3a6b]" style={{ fontFamily: "var(--font-mono)" }}>No members yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {members.map(m => {
                    const ROLE_C = { OWNER: "#f43f8e", ADMIN: "#a855f7", MEMBER: "#00e5ff", VIEWER: "#10d990" };
                    const rc = ROLE_C[m.role] || "#8ab4d4";
                    return (
                      <div key={m._id} className="flex items-center gap-3 p-3 rounded-xl bg-[#04080f] border border-[#1a2a4a]">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black text-[#020408] flex-shrink-0"
                          style={{ background: rc, fontFamily: "var(--font-display)" }}>
                          {m.userId?.name?.charAt(0) || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#e8f4ff] truncate">{m.userId?.name || "Unknown"}</p>
                          <div className="flex items-center gap-1">
                            <p className="text-[10px] text-[#3d6080] truncate" style={{ fontFamily: "var(--font-mono)" }}>{m.userId?.email || "—"}</p>
                            {m.userId?.email && <CopyBtn text={m.userId.email} />}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold"
                            style={{ color: rc, borderColor: `${rc}30`, background: `${rc}10`, fontFamily: "var(--font-mono)" }}>
                            {m.role}
                          </span>
                          <span className="text-[9px] text-[#1a3a6b]" style={{ fontFamily: "var(--font-mono)" }}>
                            {m.userId?.status || "ACTIVE"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

/* ── Main AdminWorkspaces ───────────────────────────── */
const AdminWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(false);
  const [selectedWs, setSelectedWs] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [toast, setToast]           = useState(null);
  const LIMIT = 10;

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/admin/workspaces`, { headers: headers() });
      const data = await res.json();
      setWorkspaces(data?.data || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${BASE}/api/admin/workspaces/${id}`, { method: "DELETE", headers: headers() });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Workspace deleted.");
        setDeleteModal(null);
        setSelectedWs(null);
        load();
      } else {
        showToast("error", data.message || "Delete failed.");
      }
    } catch { showToast("error", "Delete failed."); }
  };

  const filtered = workspaces.filter(w =>
    !search ||
    w.name?.toLowerCase().includes(search.toLowerCase()) ||
    w.ownerId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    w.ownerId?.email?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / LIMIT);
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const VER_CFG = {
    VERIFIED: { color: "#10d990" },
    PENDING:  { color: "#f59e0b" },
    REJECTED: { color: "#f43f8e" },
  };

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
          <p className="text-[10px] text-[#f43f8e] uppercase tracking-[0.3em] mb-1" style={{ fontFamily: "var(--font-mono)" }}>Admin / Workspaces</p>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>All Workspaces</h1>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-[#3d6080] px-3 py-1.5 rounded-full border border-[#1a2a4a]"
                style={{ fontFamily: "var(--font-mono)" }}>{workspaces.length} total</span>
              <motion.button whileTap={{ scale: 0.95 }} onClick={load}
                className="px-3 py-2 rounded-xl border border-[#1a2a4a] text-[#3d6080] hover:text-[#00e5ff] hover:border-[#00e5ff33] transition-all">
                <RefreshCw className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d6080]" />
          <input className="w-full bg-[#04080f] border border-[#1a2a4a] rounded-xl pl-9 pr-4 py-2.5 text-[#e8f4ff] placeholder:text-[#1a3a6b] focus:outline-none focus:border-[#f43f8e44] text-sm"
            style={{ fontFamily: "var(--font-mono)" }}
            placeholder="Search by workspace name, owner name or email..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden"
          style={{ boxShadow: "0 4px 24px #00000055" }}>

          {/* Table header */}
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-3 px-5 py-3 border-b border-[#1a2a4a] text-[10px] text-[#3d6080] uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono)" }}>
            <span>Workspace</span>
            <span>Owner</span>
            <span>Verification</span>
            <span>Members</span>
            <span>Projects</span>
            <span>Actions</span>
          </div>

          {loading && paged.length === 0 ? (
            <div className="flex justify-center py-16">
              <motion.div className="w-8 h-8 rounded-full border-2 border-[#f43f8e33] border-t-[#f43f8e]"
                animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
            </div>
          ) : paged.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="w-10 h-10 text-[#1a3a6b] mx-auto mb-3" />
              <p className="text-[11px] text-[#3d6080] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>No workspaces found</p>
            </div>
          ) : (
            paged.map((ws, i) => {
              const verColor = VER_CFG[ws.ownerId?.verificationStatus]?.color || "#f59e0b";
              return (
                <motion.div key={ws._id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-3 items-center px-5 py-4 border-b border-[#1a2a4a]/50 last:border-0 hover:bg-[#ffffff04] transition-colors">

                  {/* Workspace */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#f43f8e] to-[#7c3aed] flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
                      style={{ fontFamily: "var(--font-display)" }}>{ws.name?.charAt(0)}</div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#e8f4ff] truncate">{ws.name}</p>
                      <p className="text-[9px] text-[#1a3a6b] truncate" style={{ fontFamily: "var(--font-mono)" }}>
                        {ws.createdAt ? new Date(ws.createdAt).toLocaleDateString() : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Owner */}
                  <div className="min-w-0">
                    <p className="text-xs text-[#8ab4d4] font-bold truncate">{ws.ownerId?.name || "—"}</p>
                    <p className="text-[10px] text-[#3d6080] truncate" style={{ fontFamily: "var(--font-mono)" }}>
                      {ws.ownerId?.email || "—"}
                    </p>
                  </div>

                  {/* Verification */}
                  <span className="text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold w-fit"
                    style={{ color: verColor, borderColor: `${verColor}30`, background: `${verColor}10`, fontFamily: "var(--font-mono)" }}>
                    {ws.ownerId?.verificationStatus || "PENDING"}
                  </span>

                  {/* Members count */}
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#3d6080]" />
                    <span className="text-[11px] text-[#8ab4d4] font-bold">{ws.memberCount ?? "—"}</span>
                  </div>

                  {/* Projects count */}
                  <div className="flex items-center gap-1.5">
                    <FolderKanban className="w-3.5 h-3.5 text-[#3d6080]" />
                    <span className="text-[11px] text-[#8ab4d4] font-bold">{ws.projectCount ?? "—"}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                      onClick={() => setSelectedWs(ws)}
                      className="px-3 py-1.5 rounded-xl border border-[#00e5ff30] text-[#00e5ff] hover:bg-[#00e5ff10] transition-all text-[10px] uppercase tracking-wider font-bold"
                      style={{ fontFamily: "var(--font-mono)" }}>
                      Details
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => setDeleteModal(ws)}
                      className="w-7 h-7 rounded-xl border border-[#1a2a4a] flex items-center justify-center text-[#3d6080] hover:text-[#f43f8e] hover:border-[#f43f8e33] transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })
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

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedWs && (
          <DetailModal
            ws={selectedWs}
            onClose={() => setSelectedWs(null)}
            onDelete={(ws) => { setSelectedWs(null); setDeleteModal(ws); }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteModal(null)} />
            <motion.div className="relative w-full max-w-sm rounded-2xl overflow-hidden"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              style={{ background: "linear-gradient(135deg,#0d1117,#161b22)", border: "1px solid #f43f8e22", boxShadow: "0 0 60px #00000099" }}>
              <div className="h-[2px] bg-gradient-to-r from-[#f43f8e] to-transparent" />
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#f43f8e0a] border border-[#f43f8e30] flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-5 h-5 text-[#f43f8e]" />
                </div>
                <h3 className="text-sm font-black text-[#e8f4ff] mb-2 uppercase" style={{ fontFamily: "var(--font-display)" }}>Delete Workspace</h3>
                <p className="text-xs text-[#3d6080] mb-5" style={{ fontFamily: "var(--font-mono)" }}>
                  Delete <span className="text-[#f43f8e]">"{deleteModal.name}"</span>?<br/>
                  All projects and members will be permanently removed.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 rounded-xl border border-[#1a2a4a] text-[#8ab4d4] text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>Cancel</button>
                  <motion.button whileTap={{ scale: 0.98 }} onClick={() => handleDelete(deleteModal._id)}
                    className="flex-1 py-2.5 rounded-xl bg-[#f43f8e] text-white font-bold text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>Delete</motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminWorkspaces;