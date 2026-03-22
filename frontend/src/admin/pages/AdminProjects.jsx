// src/admin/pages/AdminProjects.jsx
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderKanban, Trash2, RefreshCw, Search,
  ChevronLeft, ChevronRight, Building2, Mail,
  Calendar, Globe, Copy, Check, X, Shield
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
const ProjectDetailModal = ({ proj, onClose, onDelete }) => {
  // workspaceId may already be populated from list fetch
  const ws = proj.workspaceId;
  const owner = ws?.ownerId;

  return (
    <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative w-full max-w-2xl rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        style={{ background: "linear-gradient(135deg,#0a0f1a,#060d18)", border: "1px solid #00e5ff22", boxShadow: "0 0 80px #00e5ff08, 0 20px 80px #00000099" }}>
        <div className="h-[2px] bg-gradient-to-r from-[#00e5ff] via-[#10d990] to-[#a855f7]" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a2a4a]">
          <div>
            <p className="text-[10px] text-[#00e5ff] uppercase tracking-widest mb-0.5" style={{ fontFamily: "var(--font-mono)" }}>Project Details</p>
            <h2 className="text-base font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>{proj.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => onDelete(proj)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#f43f8e30] text-[#f43f8e] hover:bg-[#f43f8e10] transition-all text-[10px] uppercase tracking-wider font-bold"
              style={{ fontFamily: "var(--font-mono)" }}>
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </motion.button>
            <button onClick={onClose} className="w-8 h-8 rounded-xl border border-[#1a2a4a] flex items-center justify-center text-[#3d6080] hover:text-[#8ab4d4] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* ── Project Info ── */}
          <section>
            <p className="text-[10px] text-[#00e5ff] uppercase tracking-widest mb-3 flex items-center gap-2"
              style={{ fontFamily: "var(--font-mono)" }}>
              <FolderKanban className="w-3.5 h-3.5" /> Project Info
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { label: "Project ID",   value: proj._id, copy: true },
                { label: "Project Name", value: proj.name },
                { label: "Status",       value: proj.status || "ACTIVE" },
                { label: "Created",      value: proj.createdAt ? new Date(proj.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—" },
                { label: "Workspace ID", value: ws?._id || "—", copy: !!ws?._id },
                { label: "Workspace",    value: ws?.name || "—" },
              ].map(({ label, value, copy }) => (
                <div key={label} className="p-3 rounded-xl bg-[#04080f] border border-[#1a2a4a]">
                  <p className="text-[9px] text-[#3d6080] uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-mono)" }}>{label}</p>
                  <div className="flex items-center gap-1">
                    <p className={`text-[11px] font-bold truncate ${value === "ACTIVE" ? "text-[#10d990]" : "text-[#e8f4ff]"}`}
                      style={{ fontFamily: "var(--font-mono)" }}>{value || "—"}</p>
                    {copy && value !== "—" && <CopyBtn text={value} />}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Allowed Domains ── */}
          <section>
            <p className="text-[10px] text-[#a855f7] uppercase tracking-widest mb-3 flex items-center gap-2"
              style={{ fontFamily: "var(--font-mono)" }}>
              <Globe className="w-3.5 h-3.5" /> Allowed Domains
            </p>
            <div className="p-4 rounded-xl bg-[#04080f] border border-[#1a2a4a]">
              {proj.allowedDomains?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {proj.allowedDomains.map(d => (
                    <div key={d} className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#a855f730] bg-[#a855f710]">
                      <Globe className="w-3 h-3 text-[#a855f7]" />
                      <span className="text-[10px] text-[#a855f7] font-bold" style={{ fontFamily: "var(--font-mono)" }}>{d}</span>
                      <CopyBtn text={d} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-[#3d6080] flex items-center gap-2" style={{ fontFamily: "var(--font-mono)" }}>
                  <Globe className="w-3.5 h-3.5" /> All domains allowed (no restrictions)
                </p>
              )}
            </div>
          </section>

          {/* ── Workspace Owner ── */}
          <section>
            <p className="text-[10px] text-[#f43f8e] uppercase tracking-widest mb-3 flex items-center gap-2"
              style={{ fontFamily: "var(--font-mono)" }}>
              <Shield className="w-3.5 h-3.5" /> Workspace Owner
            </p>
            {owner ? (
              <div className="rounded-2xl border border-[#1a2a4a] bg-[#04080f] p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f43f8e] to-[#7c3aed] flex items-center justify-center text-base font-black text-white flex-shrink-0"
                    style={{ fontFamily: "var(--font-display)", boxShadow: "0 0 16px #f43f8e33" }}>
                    {owner.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-[#e8f4ff] mb-2">{owner.name}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { icon: Mail,     label: "Email",       value: owner.email, copy: true },
                        { icon: Building2,label: "Company",     value: owner.companyName || "—" },
                        { icon: Shield,   label: "Role",        value: owner.role },
                        { icon: Calendar, label: "Joined",      value: owner.createdAt ? new Date(owner.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—" },
                      ].map(({ icon: Icon, label, value, copy }) => (
                        <div key={label} className="flex items-center gap-2">
                          <Icon className="w-3 h-3 text-[#3d6080] flex-shrink-0" />
                          <span className="text-[10px] text-[#3d6080] flex-shrink-0" style={{ fontFamily: "var(--font-mono)" }}>{label}:</span>
                          <span className="text-[10px] text-[#8ab4d4] truncate" style={{ fontFamily: "var(--font-mono)" }}>{value}</span>
                          {copy && value && value !== "—" && <CopyBtn text={value} />}
                        </div>
                      ))}
                    </div>
                    {/* Verification + Status badges */}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {owner.verificationStatus && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold"
                          style={{
                            color: owner.verificationStatus === "VERIFIED" ? "#10d990" : owner.verificationStatus === "REJECTED" ? "#f43f8e" : "#f59e0b",
                            borderColor: owner.verificationStatus === "VERIFIED" ? "#10d99030" : owner.verificationStatus === "REJECTED" ? "#f43f8e30" : "#f59e0b30",
                            background: owner.verificationStatus === "VERIFIED" ? "#10d99010" : owner.verificationStatus === "REJECTED" ? "#f43f8e10" : "#f59e0b10",
                            fontFamily: "var(--font-mono)"
                          }}>
                          {owner.verificationStatus}
                        </span>
                      )}
                      {owner.status && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold"
                          style={{ color: owner.status === "ACTIVE" ? "#10d990" : "#f43f8e", borderColor: owner.status === "ACTIVE" ? "#10d99030" : "#f43f8e30", background: owner.status === "ACTIVE" ? "#10d99010" : "#f43f8e10", fontFamily: "var(--font-mono)" }}>
                          {owner.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#04080f] border border-[#1a2a4a]">
                <p className="text-[11px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                  Owner info not available
                </p>
              </div>
            )}
          </section>

        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Main AdminProjects ─────────────────────────────── */
const AdminProjects = () => {
  const [projects, setProjects]     = useState([]);
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(false);
  const [selectedProj, setSelectedProj] = useState(null);
  const [deleteModal, setDeleteModal]   = useState(null);
  const [toast, setToast]           = useState(null);
  const LIMIT = 10;

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/projects`, { headers: headers() });
      const data = await res.json();
      setProjects(data?.data || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${BASE}/api/projects/${id}`, { method: "DELETE", headers: headers() });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Project deleted.");
        setDeleteModal(null);
        setSelectedProj(null);
        load();
      } else {
        showToast("error", data.message || "Delete failed.");
      }
    } catch { showToast("error", "Delete failed."); }
  };

  const filtered = projects.filter(p =>
    !search ||
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.workspaceId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.workspaceId?.ownerId?.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.workspaceId?.ownerId?.name?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / LIMIT);
  const paged = filtered.slice((page - 1) * LIMIT, page * LIMIT);

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
          <p className="text-[10px] text-[#f43f8e] uppercase tracking-[0.3em] mb-1" style={{ fontFamily: "var(--font-mono)" }}>Admin / Projects</p>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>All Projects</h1>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-[#3d6080] px-3 py-1.5 rounded-full border border-[#1a2a4a]"
                style={{ fontFamily: "var(--font-mono)" }}>{projects.length} total</span>
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
            placeholder="Search by project name, workspace or owner..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden"
          style={{ boxShadow: "0 4px 24px #00000055" }}>

          <div className="grid grid-cols-[2fr_2fr_2fr_1fr_auto] gap-3 px-5 py-3 border-b border-[#1a2a4a] text-[10px] text-[#3d6080] uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono)" }}>
            <span>Project</span>
            <span>Workspace</span>
            <span>Owner</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {loading && paged.length === 0 ? (
            <div className="flex justify-center py-16">
              <motion.div className="w-8 h-8 rounded-full border-2 border-[#f43f8e33] border-t-[#f43f8e]"
                animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
            </div>
          ) : paged.length === 0 ? (
            <div className="text-center py-16">
              <FolderKanban className="w-10 h-10 text-[#1a3a6b] mx-auto mb-3" />
              <p className="text-[11px] text-[#3d6080] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>No projects found</p>
            </div>
          ) : (
            paged.map((proj, i) => {
              const ws    = proj.workspaceId;
              const owner = ws?.ownerId;
              return (
                <motion.div key={proj._id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-[2fr_2fr_2fr_1fr_auto] gap-3 items-center px-5 py-4 border-b border-[#1a2a4a]/50 last:border-0 hover:bg-[#ffffff04] transition-colors">

                  {/* Project */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00e5ff] to-[#10d990] flex items-center justify-center text-[11px] font-black text-[#020408] flex-shrink-0"
                      style={{ fontFamily: "var(--font-display)" }}>{proj.name?.charAt(0)}</div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#e8f4ff] truncate">{proj.name}</p>
                      <p className="text-[9px] text-[#1a3a6b] truncate" style={{ fontFamily: "var(--font-mono)" }}>
                        {proj.createdAt ? new Date(proj.createdAt).toLocaleDateString() : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Workspace */}
                  <div className="min-w-0">
                    <p className="text-xs text-[#8ab4d4] font-bold truncate">{ws?.name || "—"}</p>
                    {/* Domains */}
                    <div className="flex gap-1 mt-0.5 flex-wrap">
                      {proj.allowedDomains?.length > 0
                        ? proj.allowedDomains.slice(0, 2).map(d => (
                          <span key={d} className="text-[8px] px-1.5 py-0.5 rounded-full border border-[#a855f720] bg-[#a855f708] text-[#a855f7]"
                            style={{ fontFamily: "var(--font-mono)" }}>{d}</span>
                        ))
                        : <span className="text-[9px] text-[#1a3a6b]" style={{ fontFamily: "var(--font-mono)" }}>All domains</span>
                      }
                      {proj.allowedDomains?.length > 2 && (
                        <span className="text-[8px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>+{proj.allowedDomains.length - 2}</span>
                      )}
                    </div>
                  </div>

                  {/* Owner */}
                  <div className="min-w-0">
                    <p className="text-xs text-[#8ab4d4] font-bold truncate">{owner?.name || "—"}</p>
                    <p className="text-[10px] text-[#3d6080] truncate" style={{ fontFamily: "var(--font-mono)" }}>
                      {owner?.email || "—"}
                    </p>
                  </div>

                  {/* Status */}
                  <span className="text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold w-fit"
                    style={{ color: proj.status === "ACTIVE" ? "#10d990" : "#f59e0b", borderColor: proj.status === "ACTIVE" ? "#10d99030" : "#f59e0b30", background: proj.status === "ACTIVE" ? "#10d99010" : "#f59e0b10", fontFamily: "var(--font-mono)" }}>
                    {proj.status || "ACTIVE"}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                      onClick={() => setSelectedProj(proj)}
                      className="px-3 py-1.5 rounded-xl border border-[#00e5ff30] text-[#00e5ff] hover:bg-[#00e5ff10] transition-all text-[10px] uppercase tracking-wider font-bold"
                      style={{ fontFamily: "var(--font-mono)" }}>
                      Details
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => setDeleteModal(proj)}
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
        {selectedProj && (
          <ProjectDetailModal
            proj={selectedProj}
            onClose={() => setSelectedProj(null)}
            onDelete={(p) => { setSelectedProj(null); setDeleteModal(p); }}
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
                <h3 className="text-sm font-black text-[#e8f4ff] mb-2 uppercase" style={{ fontFamily: "var(--font-display)" }}>Delete Project</h3>
                <p className="text-xs text-[#3d6080] mb-5" style={{ fontFamily: "var(--font-mono)" }}>
                  Delete <span className="text-[#f43f8e]">"{deleteModal.name}"</span>?<br/>
                  All analytics data will be permanently lost.
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

export default AdminProjects;