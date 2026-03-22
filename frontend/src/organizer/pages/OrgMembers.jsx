// src/organizer/pages/OrgMembers.jsx
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, RefreshCw, X, Building2 } from "lucide-react";
import OrgLayout from "../components/OrgLayout";
import { useOrgApi } from "../hooks/useOrgApi";

const AddMemberModal = ({ workspaces, onClose, onAdd }) => {
  const [form, setForm] = useState({ workspaceId: workspaces[0]?._id || "", userId: "", role: "MEMBER" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleAdd = async () => {
    if (!form.workspaceId || !form.userId.trim()) { setErr("Workspace and User ID required."); return; }
    setSaving(true);
    try {
      await onAdd(form.workspaceId, form.userId.trim(), form.role);
      onClose();
    } catch (e) { setErr(e.message || "Failed to add member."); }
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
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>Add Member</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-xl border border-[#1a2a4a] flex items-center justify-center text-[#3d6080] hover:text-[#8ab4d4]">
              <X className="w-4 h-4" />
            </button>
          </div>

          {err && (
            <div className="mb-4 px-3 py-2.5 rounded-xl border border-[#f43f8e30] bg-[#f43f8e08] text-[11px] text-[#f43f8e]"
              style={{ fontFamily: "var(--font-mono)" }}>❌ {err}</div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                Workspace
              </label>
              <select
                className="w-full bg-[#04080f] border border-[#1a2a4a] rounded-xl px-4 py-3 text-[#e8f4ff] focus:outline-none focus:border-[#a855f744] text-sm"
                style={{ fontFamily: "var(--font-mono)" }}
                value={form.workspaceId}
                onChange={e => setForm(f => ({ ...f, workspaceId: e.target.value }))}>
                {workspaces.map(ws => (
                  <option key={ws._id} value={ws._id} style={{ background: "#0d1117" }}>{ws.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                User ID
              </label>
              <input
                className="w-full bg-[#04080f] border border-[#1a2a4a] rounded-xl px-4 py-3 text-[#e8f4ff] placeholder:text-[#1a3a6b] focus:outline-none focus:border-[#a855f744] text-sm"
                style={{ fontFamily: "var(--font-mono)" }}
                placeholder="MongoDB user _id"
                value={form.userId}
                onChange={e => { setForm(f => ({ ...f, userId: e.target.value })); setErr(""); }}
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                Role
              </label>
              <div className="flex gap-2">
                {["MEMBER", "ADMIN", "VIEWER"].map(r => (
                  <button key={r} onClick={() => setForm(f => ({ ...f, role: r }))}
                    className="flex-1 py-2.5 rounded-xl text-[10px] uppercase tracking-wider font-bold border transition-all"
                    style={{
                      borderColor: form.role === r ? "#a855f750" : "#1a2a4a",
                      background: form.role === r ? "#a855f715" : "transparent",
                      color: form.role === r ? "#a855f7" : "#3d6080",
                      fontFamily: "var(--font-mono)"
                    }}>{r}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#1a2a4a] text-[#8ab4d4] text-xs uppercase tracking-widest"
              style={{ fontFamily: "var(--font-mono)" }}>Cancel</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleAdd} disabled={saving}
              className="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest text-[#020408] disabled:opacity-50"
              style={{ background: "#a855f7", fontFamily: "var(--font-mono)" }}>
              {saving ? "Adding..." : "Add Member"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const OrgMembers = () => {
  const { getMyWorkspaces, getMembers, addMember, loading } = useOrgApi();
  const [workspaces, setWorkspaces]   = useState([]);
  const [selectedWs, setSelectedWs]   = useState(null);
  const [members, setMembers]         = useState([]);
  const [showAdd, setShowAdd]         = useState(false);
  const [toast, setToast]             = useState(null);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };

  const loadWorkspaces = useCallback(async () => {
    try {
      const res = await getMyWorkspaces();
      const ws = res?.data || [];
      setWorkspaces(ws);
      if (ws.length > 0 && !selectedWs) setSelectedWs(ws[0]);
    } catch {}
  }, []);

  const loadMembers = useCallback(async () => {
    if (!selectedWs?._id) return;
    try {
      const res = await getMembers(selectedWs._id);
      setMembers(res?.data || []);
    } catch {}
  }, [selectedWs]);

  useEffect(() => { loadWorkspaces(); }, [loadWorkspaces]);
  useEffect(() => { loadMembers(); }, [loadMembers]);

  const handleAdd = async (workspaceId, userId, role) => {
    await addMember(workspaceId, userId, role);
    showToast("success", "Member added!");
    loadMembers();
  };

  const ROLE_COLORS = { OWNER: "#f43f8e", ADMIN: "#a855f7", MEMBER: "#00e5ff", VIEWER: "#10d990" };

  return (
    <OrgLayout>
      <AnimatePresence>
        {toast && (
          <motion.div className="fixed top-20 right-6 z-[10000] px-4 py-3 rounded-xl border text-xs font-bold uppercase tracking-widest"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ fontFamily: "var(--font-mono)", background: toast.type === "success" ? "#10d99015" : "#f43f8e15", borderColor: toast.type === "success" ? "#10d99030" : "#f43f8e30", color: toast.type === "success" ? "#10d990" : "#f43f8e" }}>
            {toast.type === "success" ? "✅" : "❌"} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="text-[10px] text-[#10d990] uppercase tracking-[0.3em] mb-1" style={{ fontFamily: "var(--font-mono)" }}>
            Organizer / Members
          </p>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>Team Members</h1>
            <div className="flex gap-2">
              <motion.button whileTap={{ scale: 0.95 }} onClick={loadMembers}
                className="px-3 py-2 rounded-xl border border-[#1a2a4a] text-[#3d6080] hover:text-[#10d990] hover:border-[#10d99033] transition-all">
                <RefreshCw className="w-4 h-4" />
              </motion.button>
              {workspaces.length > 0 && (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setShowAdd(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest text-[#020408]"
                  style={{ background: "#a855f7", fontFamily: "var(--font-mono)" }}>
                  <UserPlus className="w-3.5 h-3.5" /> Add Member
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {workspaces.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-12 h-12 text-[#1a3a6b] mx-auto mb-4" />
            <p className="text-sm text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
              Create a workspace first to manage members
            </p>
          </div>
        ) : (
          <>
            {/* Workspace selector */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {workspaces.map(ws => (
                <button key={ws._id} onClick={() => setSelectedWs(ws)}
                  className="px-4 py-2 rounded-xl text-[11px] uppercase tracking-wider font-bold border transition-all"
                  style={{
                    borderColor: selectedWs?._id === ws._id ? "#10d99050" : "#1a2a4a",
                    background: selectedWs?._id === ws._id ? "#10d99015" : "transparent",
                    color: selectedWs?._id === ws._id ? "#10d990" : "#3d6080",
                    fontFamily: "var(--font-mono)"
                  }}>{ws.name}</button>
              ))}
            </div>

            {/* Members table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden"
              style={{ boxShadow: "0 4px 24px #00000055" }}>
              <div className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-4 px-5 py-3 border-b border-[#1a2a4a] text-[10px] text-[#3d6080] uppercase tracking-widest"
                style={{ fontFamily: "var(--font-mono)" }}>
                <span>Member</span><span>Email</span><span>Role</span><span>Status</span>
              </div>

              {loading && members.length === 0 ? (
                <div className="flex justify-center py-16">
                  <motion.div className="w-8 h-8 rounded-full border-2 border-[#a855f733] border-t-[#a855f7]"
                    animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-8 h-8 text-[#1a3a6b] mx-auto mb-3" />
                  <p className="text-[11px] text-[#3d6080] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                    No members in this workspace
                  </p>
                </div>
              ) : (
                members.map((m, i) => {
                  const rc = ROLE_COLORS[m.role] || "#8ab4d4";
                  const sc = m.status === "ACTIVE" ? "#10d990" : "#f59e0b";
                  return (
                    <motion.div key={m._id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-4 items-center px-5 py-3.5 border-b border-[#1a2a4a]/50 last:border-0 hover:bg-[#ffffff04] transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
                          style={{ fontFamily: "var(--font-display)" }}>
                          {m.userId?.name?.charAt(0) || "?"}
                        </div>
                        <span className="text-xs font-bold text-[#e8f4ff] truncate">{m.userId?.name || "Unknown"}</span>
                      </div>
                      <span className="text-[11px] text-[#3d6080] truncate" style={{ fontFamily: "var(--font-mono)" }}>
                        {m.userId?.email || "—"}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold w-fit"
                        style={{ color: rc, borderColor: `${rc}30`, background: `${rc}10`, fontFamily: "var(--font-mono)" }}>
                        {m.role}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold w-fit"
                        style={{ color: sc, borderColor: `${sc}30`, background: `${sc}10`, fontFamily: "var(--font-mono)" }}>
                        {m.status || "ACTIVE"}
                      </span>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          </>
        )}
      </div>

      <AnimatePresence>
        {showAdd && workspaces.length > 0 && (
          <AddMemberModal workspaces={workspaces} onClose={() => setShowAdd(false)} onAdd={handleAdd} />
        )}
      </AnimatePresence>
    </OrgLayout>
  );
};

export default OrgMembers;