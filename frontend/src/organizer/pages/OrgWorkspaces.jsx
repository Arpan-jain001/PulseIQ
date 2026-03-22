// src/organizer/pages/OrgWorkspaces.jsx
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Plus, X, Users, RefreshCw, Copy, Check, Trash2, UserPlus, ChevronDown, ChevronUp } from "lucide-react";
import OrgLayout from "../components/OrgLayout";
import { useOrgApi } from "../hooks/useOrgApi";
import { useAuth } from "../../hooks/useAuth";

const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <motion.div className="fixed top-20 right-6 z-[10000] px-4 py-3 rounded-xl border text-xs font-bold uppercase tracking-widest"
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      style={{ fontFamily: "var(--font-mono)", background: toast.type === "success" ? "#10d99015" : "#f43f8e15", borderColor: toast.type === "success" ? "#10d99030" : "#f43f8e30", color: toast.type === "success" ? "#10d990" : "#f43f8e" }}>
      {toast.type === "success" ? "✅" : "❌"} {toast.msg}
    </motion.div>
  );
};

const ConfirmModal = ({ title, message, onConfirm, onCancel }) => (
  <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onCancel} />
    <motion.div className="relative w-full max-w-sm rounded-2xl overflow-hidden"
      initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
      style={{ background: "linear-gradient(135deg,#0d1117,#161b22)", border: "1px solid #f43f8e22", boxShadow: "0 0 60px #00000099" }}>
      <div className="h-[2px] bg-gradient-to-r from-[#f43f8e] to-transparent" />
      <div className="p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#f43f8e0a] border border-[#f43f8e30] flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-[#f43f8e]" />
        </div>
        <h3 className="text-sm font-black text-[#e8f4ff] mb-2 uppercase" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
        <p className="text-xs text-[#3d6080] mb-6" style={{ fontFamily: "var(--font-mono)" }}>{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-[#1a2a4a] text-[#8ab4d4] text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>Cancel</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-[#f43f8e] text-white font-bold text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>Delete</motion.button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

const AddMemberModal = ({ wsName, wsId, onClose, onAdd }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleAdd = async () => {
    if (!email.trim()) { setErr("Email required."); return; }
    setSaving(true);
    try { await onAdd(wsId, email.trim(), role); onClose(); }
    catch (e) { setErr(e.message || "Failed to add member."); }
    finally { setSaving(false); }
  };

  return (
    <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative w-full max-w-md rounded-2xl overflow-hidden"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        style={{ background: "linear-gradient(135deg,#0d1117,#161b22)", border: "1px solid #a855f722", boxShadow: "0 0 60px #a855f708, 0 20px 60px #00000099" }}>
        <div className="h-[2px] bg-gradient-to-r from-[#a855f7] via-[#10d990] to-transparent" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>Add Member</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-xl border border-[#1a2a4a] flex items-center justify-center text-[#3d6080] hover:text-[#8ab4d4]"><X className="w-4 h-4" /></button>
          </div>
          <p className="text-[10px] text-[#3d6080] mb-5" style={{ fontFamily: "var(--font-mono)" }}>
            Workspace: <span className="text-[#10d990]">{wsName}</span>
          </p>
          {err && <div className="mb-4 px-3 py-2.5 rounded-xl border border-[#f43f8e30] bg-[#f43f8e08] text-[11px] text-[#f43f8e]" style={{ fontFamily: "var(--font-mono)" }}>❌ {err}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>Email Address</label>
              <input type="email" className="w-full bg-[#04080f] border border-[#1a2a4a] rounded-xl px-4 py-3 text-[#e8f4ff] placeholder:text-[#1a3a6b] focus:outline-none focus:border-[#a855f744] text-sm" style={{ fontFamily: "var(--font-mono)" }}
                placeholder="member@example.com" value={email} onChange={e => { setEmail(e.target.value); setErr(""); }} autoFocus />
            </div>
            <div>
              <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>Role</label>
              <div className="flex gap-2">
                {[{ v: "MEMBER", c: "#00e5ff" }, { v: "ADMIN", c: "#a855f7" }, { v: "VIEWER", c: "#10d990" }].map(({ v, c }) => (
                  <button key={v} onClick={() => setRole(v)}
                    className="flex-1 py-2.5 rounded-xl text-[10px] uppercase tracking-wider font-bold border transition-all"
                    style={{ borderColor: role === v ? `${c}50` : "#1a2a4a", background: role === v ? `${c}15` : "transparent", color: role === v ? c : "#3d6080", fontFamily: "var(--font-mono)" }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#1a2a4a] text-[#8ab4d4] text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>Cancel</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAdd} disabled={saving}
              className="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest text-[#020408] disabled:opacity-50"
              style={{ background: "#a855f7", fontFamily: "var(--font-mono)" }}>{saving ? "Adding..." : "Add Member"}</motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CreateModal = ({ onClose, onCreate }) => {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const handleCreate = async () => {
    if (!name.trim()) { setErr("Name required."); return; }
    setSaving(true);
    try { await onCreate(name.trim()); onClose(); }
    catch (e) { setErr(e.message || "Failed."); }
    finally { setSaving(false); }
  };
  return (
    <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative w-full max-w-md rounded-2xl overflow-hidden"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        style={{ background: "linear-gradient(135deg,#0d1117,#161b22)", border: "1px solid #10d99022", boxShadow: "0 0 60px #10d99008, 0 20px 60px #00000099" }}>
        <div className="h-[2px] bg-gradient-to-r from-[#10d990] via-[#00e5ff] to-transparent" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>New Workspace</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-xl border border-[#1a2a4a] flex items-center justify-center text-[#3d6080] hover:text-[#8ab4d4]"><X className="w-4 h-4" /></button>
          </div>
          {err && <div className="mb-4 px-3 py-2.5 rounded-xl border border-[#f43f8e30] bg-[#f43f8e08] text-[11px] text-[#f43f8e]" style={{ fontFamily: "var(--font-mono)" }}>❌ {err}</div>}
          <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>Workspace Name</label>
          <input className="w-full bg-[#04080f] border border-[#1a2a4a] rounded-xl px-4 py-3 text-[#e8f4ff] placeholder:text-[#1a3a6b] focus:outline-none focus:border-[#10d99044] text-sm mb-5"
            style={{ fontFamily: "var(--font-mono)" }} placeholder="My Analytics Workspace"
            value={name} onChange={e => { setName(e.target.value); setErr(""); }} onKeyDown={e => e.key === "Enter" && handleCreate()} autoFocus />
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#1a2a4a] text-[#8ab4d4] text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>Cancel</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCreate} disabled={saving}
              className="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest text-[#020408] disabled:opacity-50"
              style={{ background: "#10d990", fontFamily: "var(--font-mono)" }}>{saving ? "Creating..." : "Create"}</motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ✅ Fixed Copy Button — no text disappears, fallback for all browsers
const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => fallbackCopy());
    } catch {
      fallbackCopy();
    }
  };
  const fallbackCopy = () => {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, 99999);
    document.execCommand("copy");
    document.body.removeChild(el);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleCopy}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg flex-shrink-0 select-none"
      style={{ color: copied ? "#10d990" : "#3d6080", background: copied ? "#10d99015" : "transparent" }}>
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      <span className="text-[9px] uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)" }}>
        {copied ? "Copied!" : "Copy"}
      </span>
    </motion.button>
  );
};

const ROLE_COLORS = { OWNER: "#f43f8e", ADMIN: "#a855f7", MEMBER: "#00e5ff", VIEWER: "#10d990" };

const OrgWorkspaces = () => {
  const { getMyWorkspaces, createWorkspace, deleteWorkspace, getMembers, addMember, removeMember, loading } = useOrgApi();
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedWs, setExpandedWs] = useState(null);
  const [membersMap, setMembersMap] = useState({});
  const [deleteWsModal, setDeleteWsModal] = useState(null);
  const [addMemberModal, setAddMemberModal] = useState(null);
  const [removeMemberModal, setRemoveMemberModal] = useState(null);
  const [toast, setToast] = useState(null);
  const isVerified = user?.verificationStatus === "VERIFIED";

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    try { const res = await getMyWorkspaces(); setWorkspaces(res?.data || []); } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (name) => {
    await createWorkspace(name);
    showToast("success", "Workspace created!");
    load();
  };

  const handleDeleteWs = async (wsId) => {
    try {
      await deleteWorkspace(wsId);
      showToast("success", "Workspace deleted.");
      setDeleteWsModal(null);
      if (expandedWs === wsId) setExpandedWs(null);
      setMembersMap(m => { const n = { ...m }; delete n[wsId]; return n; });
      load();
    } catch (e) { showToast("error", e.message || "Delete failed."); }
  };

  const toggleExpand = async (wsId) => {
    if (expandedWs === wsId) { setExpandedWs(null); return; }
    setExpandedWs(wsId);
    try {
      const res = await getMembers(wsId);
      setMembersMap(m => ({ ...m, [wsId]: res?.data || [] }));
    } catch {}
  };

  const handleAddMember = async (wsId, userId, role) => {
    await addMember(wsId, userId, role);
    showToast("success", "Member added!");
    const res = await getMembers(wsId);
    setMembersMap(m => ({ ...m, [wsId]: res?.data || [] }));
  };

  const handleRemoveMember = async () => {
    if (!removeMemberModal) return;
    try {
      await removeMember(removeMemberModal.wsId, removeMemberModal.userId);
      showToast("success", "Member removed.");
      const res = await getMembers(removeMemberModal.wsId);
      setMembersMap(m => ({ ...m, [removeMemberModal.wsId]: res?.data || [] }));
      setRemoveMemberModal(null);
    } catch (e) { showToast("error", e.message || "Remove failed."); }
  };

  return (
    <OrgLayout>
      <AnimatePresence>{toast && <Toast toast={toast} />}</AnimatePresence>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="text-[10px] text-[#10d990] uppercase tracking-[0.3em] mb-1" style={{ fontFamily: "var(--font-mono)" }}>Organizer / Workspaces</p>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>My Workspaces</h1>
            <div className="flex gap-2">
              <motion.button whileTap={{ scale: 0.95 }} onClick={load}
                className="px-3 py-2 rounded-xl border border-[#1a2a4a] text-[#3d6080] hover:text-[#10d990] hover:border-[#10d99033] transition-all">
                <RefreshCw className="w-4 h-4" />
              </motion.button>
              {isVerified && (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest text-[#020408]"
                  style={{ background: "#10d990", fontFamily: "var(--font-mono)" }}>
                  <Plus className="w-3.5 h-3.5" /> New Workspace
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {!isVerified && (
          <div className="mb-6 p-4 rounded-xl border border-[#f59e0b30] bg-[#f59e0b08] flex items-center gap-3">
            <span className="text-[#f59e0b]">⚠️</span>
            <p className="text-[11px] text-[#8ab4d4]" style={{ fontFamily: "var(--font-mono)" }}>Organization verification required to create workspaces.</p>
          </div>
        )}

        {loading && workspaces.length === 0 ? (
          <div className="flex justify-center py-20">
            <motion.div className="w-10 h-10 rounded-full border-2 border-[#10d99033] border-t-[#10d990]"
              animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
          </div>
        ) : workspaces.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-12 h-12 text-[#1a3a6b] mx-auto mb-4" />
            <p className="text-sm text-[#3d6080] mb-3" style={{ fontFamily: "var(--font-mono)" }}>No workspaces yet</p>
            {isVerified && (
              <motion.button whileHover={{ scale: 1.02 }} onClick={() => setShowCreate(true)}
                className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-[#020408]"
                style={{ background: "#10d990", fontFamily: "var(--font-mono)" }}>Create First Workspace</motion.button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {workspaces.map((ws, i) => (
              <motion.div key={ws._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden hover:border-[#10d99022] transition-all"
                style={{ boxShadow: "0 4px 24px #00000055" }}>
                <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#10d990,#00e5ff,transparent)" }} />

                <div className="flex items-center gap-4 p-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10d990] to-[#00e5ff] flex items-center justify-center text-sm font-black text-[#020408] flex-shrink-0"
                    style={{ fontFamily: "var(--font-display)" }}>{ws.name?.charAt(0)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-black text-[#e8f4ff]">{ws.name}</p>
                      <span className="text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold"
                        style={{ color: ws.status === "ACTIVE" ? "#10d990" : "#f59e0b", borderColor: ws.status === "ACTIVE" ? "#10d99030" : "#f59e0b30", background: ws.status === "ACTIVE" ? "#10d99010" : "#f59e0b10", fontFamily: "var(--font-mono)" }}>
                        {ws.status || "ACTIVE"}
                      </span>
                    </div>
                    {/* ✅ Fixed copy — text stays visible */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-[#3d6080] font-mono select-all">ID: {ws._id}</span>
                      <CopyBtn text={ws._id} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setAddMemberModal({ wsId: ws._id, wsName: ws.name })}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#a855f730] text-[#a855f7] hover:bg-[#a855f710] transition-all text-[10px] uppercase tracking-wider font-bold"
                      style={{ fontFamily: "var(--font-mono)" }}>
                      <UserPlus className="w-3.5 h-3.5" /> Add
                    </motion.button>

                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => toggleExpand(ws._id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#1a2a4a] text-[#3d6080] hover:text-[#10d990] hover:border-[#10d99033] transition-all text-[10px] font-bold"
                      style={{ fontFamily: "var(--font-mono)" }}>
                      <Users className="w-3.5 h-3.5" />
                      <span>{membersMap[ws._id]?.length ?? "—"}</span>
                      {expandedWs === ws._id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </motion.button>

                    <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                      onClick={() => setDeleteWsModal(ws)}
                      className="w-8 h-8 rounded-xl border border-[#1a2a4a] flex items-center justify-center text-[#3d6080] hover:text-[#f43f8e] hover:border-[#f43f8e33] transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </div>

                {/* Members list */}
                <AnimatePresence>
                  {expandedWs === ws._id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-[#1a2a4a]">
                      <div className="p-4">
                        <p className="text-[10px] text-[#3d6080] uppercase tracking-widest mb-3" style={{ fontFamily: "var(--font-mono)" }}>Members</p>
                        {(membersMap[ws._id] || []).length === 0 ? (
                          <p className="text-[11px] text-[#1a3a6b] text-center py-3" style={{ fontFamily: "var(--font-mono)" }}>No members yet</p>
                        ) : (
                          <div className="space-y-2">
                            {(membersMap[ws._id] || []).map(m => {
                              const rc = ROLE_COLORS[m.role] || "#8ab4d4";
                              return (
                                <div key={m._id} className="flex items-center gap-3 p-3 rounded-xl bg-[#04080f] border border-[#1a2a4a]">
                                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black text-[#020408] flex-shrink-0"
                                    style={{ background: rc, fontFamily: "var(--font-display)" }}>
                                    {m.userId?.name?.charAt(0) || "?"}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-[#e8f4ff] truncate">{m.userId?.name || "Unknown"}</p>
                                    <p className="text-[10px] text-[#3d6080] truncate" style={{ fontFamily: "var(--font-mono)" }}>{m.userId?.email || "—"}</p>
                                  </div>
                                  <span className="text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold flex-shrink-0"
                                    style={{ color: rc, borderColor: `${rc}30`, background: `${rc}10`, fontFamily: "var(--font-mono)" }}>{m.role}</span>
                                  {m.role !== "OWNER" && (
                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                      onClick={() => setRemoveMemberModal({ wsId: ws._id, userId: m.userId?._id, name: m.userId?.name })}
                                      className="w-7 h-7 rounded-lg border border-[#1a2a4a] flex items-center justify-center text-[#3d6080] hover:text-[#f43f8e] hover:border-[#f43f8e33] transition-all flex-shrink-0">
                                      <X className="w-3 h-3" />
                                    </motion.button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
        {deleteWsModal && (
          <ConfirmModal title="Delete Workspace"
            message={`Delete "${deleteWsModal.name}"? All members will be removed. Cannot be undone.`}
            onConfirm={() => handleDeleteWs(deleteWsModal._id)}
            onCancel={() => setDeleteWsModal(null)} />
        )}
        {addMemberModal && (
          <AddMemberModal wsName={addMemberModal.wsName} wsId={addMemberModal.wsId}
            onClose={() => setAddMemberModal(null)} onAdd={handleAddMember} />
        )}
        {removeMemberModal && (
          <ConfirmModal title="Remove Member"
            message={`Remove "${removeMemberModal.name}" from workspace?`}
            onConfirm={handleRemoveMember}
            onCancel={() => setRemoveMemberModal(null)} />
        )}
      </AnimatePresence>
    </OrgLayout>
  );
};

export default OrgWorkspaces;