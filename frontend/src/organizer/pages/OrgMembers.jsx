import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, RefreshCw, X, Building2, Mail, Trash2 } from "lucide-react";
import OrgLayout from "../components/OrgLayout";
import { useOrgApi } from "../hooks/useOrgApi";
import TypedDeleteModal from "../../components/TypedDeleteModal";

const AddMemberModal = ({ workspaces, onClose, onAdd }) => {
  const [form, setForm] = useState({ workspaceId: workspaces[0]?._id || "", email: "", role: "MEMBER" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleAdd = async () => {
    if (!form.workspaceId || !form.email.trim()) {
      setErr("Workspace and email are required.");
      return;
    }

    setSaving(true);
    try {
      await onAdd(form.workspaceId, form.email.trim(), form.role);
      onClose();
    } catch (error) {
      setErr(error.message || "Failed to send invitation.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        style={{ background: "linear-gradient(135deg,#0d1117,#161b22)", border: "1px solid #a855f722", boxShadow: "0 0 60px #a855f708, 0 20px 60px #00000099" }}
      >
        <div className="h-[2px] bg-gradient-to-r from-[#a855f7] via-[#10d990] to-transparent" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>
              Invite Member
            </h3>
            <button onClick={onClose} className="w-8 h-8 rounded-xl border border-[#1a2a4a] flex items-center justify-center text-[#3d6080] hover:text-[#8ab4d4]">
              <X className="w-4 h-4" />
            </button>
          </div>

          {err && (
            <div className="mb-4 px-3 py-2.5 rounded-xl border border-[#f43f8e30] bg-[#f43f8e08] text-[11px] text-[#f43f8e]" style={{ fontFamily: "var(--font-mono)" }}>
              {err}
            </div>
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
                onChange={(e) => setForm((current) => ({ ...current, workspaceId: e.target.value }))}
              >
                {workspaces.map((workspace) => (
                  <option key={workspace._id} value={workspace._id} style={{ background: "#0d1117" }}>
                    {workspace.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                Member Email
              </label>
              <input
                className="w-full bg-[#04080f] border border-[#1a2a4a] rounded-xl px-4 py-3 text-[#e8f4ff] placeholder:text-[#1a3a6b] focus:outline-none focus:border-[#a855f744] text-sm"
                style={{ fontFamily: "var(--font-mono)" }}
                placeholder="member@example.com"
                value={form.email}
                onChange={(e) => {
                  setForm((current) => ({ ...current, email: e.target.value }));
                  setErr("");
                }}
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                Role
              </label>
              <div className="flex gap-2">
                {["MEMBER", "ADMIN", "VIEWER"].map((role) => (
                  <button
                    key={role}
                    onClick={() => setForm((current) => ({ ...current, role }))}
                    className="flex-1 py-2.5 rounded-xl text-[10px] uppercase tracking-wider font-bold border transition-all"
                    style={{
                      borderColor: form.role === role ? "#a855f750" : "#1a2a4a",
                      background: form.role === role ? "#a855f715" : "transparent",
                      color: form.role === role ? "#a855f7" : "#3d6080",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-[#10d99020] bg-[#10d99008] p-3">
            <p className="text-[10px] text-[#10d990] uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-mono)" }}>
              Invite flow
            </p>
            <p className="text-[11px] text-[#8ab4d4] leading-relaxed" style={{ fontFamily: "var(--font-mono)" }}>
              PulseIQ will send a collaboration email with an accept-invitation button. The member becomes active after accepting the invite.
            </p>
          </div>

          <div className="flex gap-3 mt-5">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#1a2a4a] text-[#8ab4d4] text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
              Cancel
            </button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAdd} disabled={saving} className="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest text-[#020408] disabled:opacity-50" style={{ background: "#a855f7", fontFamily: "var(--font-mono)" }}>
              {saving ? "Sending..." : "Send Invite"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const OrgMembers = () => {
  const { getMyWorkspaces, getMembers, addMember, removeMember, loading } = useOrgApi();
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWs, setSelectedWs] = useState(null);
  const [members, setMembers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [removing, setRemoving] = useState(false);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3200);
  };

  const loadWorkspaces = useCallback(async () => {
    try {
      const response = await getMyWorkspaces();
      const nextWorkspaces = response?.data || [];
      setWorkspaces(nextWorkspaces);
      if (nextWorkspaces.length > 0 && !selectedWs) {
        setSelectedWs(nextWorkspaces[0]);
      }
    } catch {}
  }, [getMyWorkspaces, selectedWs]);

  const loadMembers = useCallback(async () => {
    if (!selectedWs?._id) return;
    try {
      const response = await getMembers(selectedWs._id);
      setMembers(response?.data || []);
    } catch {}
  }, [getMembers, selectedWs]);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleAdd = async (workspaceId, email, role) => {
    const response = await addMember(workspaceId, email, role);
    showToast("success", response?.message || "Invitation sent.");
    if (selectedWs?._id === workspaceId) {
      loadMembers();
    }
  };

  const handleRemove = async (confirmation) => {
    if (!deleteModal?.workspaceId || !deleteModal?.userId) return;
    setRemoving(true);
    try {
      const response = await removeMember(deleteModal.workspaceId, deleteModal.userId, confirmation);
      showToast("success", response?.message || "Member removed.");
      setDeleteModal(null);
      loadMembers();
    } catch (error) {
      showToast("error", error.message || "Failed to remove member.");
    } finally {
      setRemoving(false);
    }
  };

  const roleColors = { OWNER: "#f43f8e", ADMIN: "#a855f7", MEMBER: "#00e5ff", VIEWER: "#10d990" };

  return (
    <OrgLayout>
      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed top-20 right-6 z-[10000] px-4 py-3 rounded-xl border text-xs font-bold uppercase tracking-widest"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              fontFamily: "var(--font-mono)",
              background: toast.type === "success" ? "#10d99015" : "#f43f8e15",
              borderColor: toast.type === "success" ? "#10d99030" : "#f43f8e30",
              color: toast.type === "success" ? "#10d990" : "#f43f8e",
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="text-[10px] text-[#10d990] uppercase tracking-[0.3em] mb-1" style={{ fontFamily: "var(--font-mono)" }}>
            Organizer / Members
          </p>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>
                Team Members
              </h1>
              <p className="text-[12px] text-[#3d6080] mt-1" style={{ fontFamily: "var(--font-mono)" }}>
                Invite teammates by email, track pending invites, and permanently remove access when needed.
              </p>
            </div>
            <div className="flex gap-2">
              <motion.button whileTap={{ scale: 0.95 }} onClick={loadMembers} className="px-3 py-2 rounded-xl border border-[#1a2a4a] text-[#3d6080] hover:text-[#10d990] hover:border-[#10d99033] transition-all">
                <RefreshCw className="w-4 h-4" />
              </motion.button>
              {workspaces.length > 0 && (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest text-[#020408]" style={{ background: "#a855f7", fontFamily: "var(--font-mono)" }}>
                  <UserPlus className="w-3.5 h-3.5" /> Invite Member
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
            <div className="flex gap-2 mb-6 flex-wrap">
              {workspaces.map((workspace) => (
                <button
                  key={workspace._id}
                  onClick={() => setSelectedWs(workspace)}
                  className="px-4 py-2 rounded-xl text-[11px] uppercase tracking-wider font-bold border transition-all"
                  style={{
                    borderColor: selectedWs?._id === workspace._id ? "#10d99050" : "#1a2a4a",
                    background: selectedWs?._id === workspace._id ? "#10d99015" : "transparent",
                    color: selectedWs?._id === workspace._id ? "#10d990" : "#3d6080",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {workspace.name}
                </button>
              ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden" style={{ boxShadow: "0 4px 24px #00000055" }}>
              <div className="grid grid-cols-[1.8fr_2fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-[#1a2a4a] text-[10px] text-[#3d6080] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                <span>Member</span>
                <span>Email</span>
                <span>Role</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              {loading && members.length === 0 ? (
                <div className="flex justify-center py-16">
                  <motion.div className="w-8 h-8 rounded-full border-2 border-[#a855f733] border-t-[#a855f7]" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-8 h-8 text-[#1a3a6b] mx-auto mb-3" />
                  <p className="text-[11px] text-[#3d6080] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                    No members or pending invites in this workspace
                  </p>
                </div>
              ) : (
                members.map((member, index) => {
                  const roleColor = roleColors[member.role] || "#8ab4d4";
                  const statusColor = member.status === "ACTIVE" ? "#10d990" : "#f59e0b";
                  const displayName = member.userId?.name || member.userId?.email || "Pending Member";
                  const displayEmail = member.userId?.email || "Unavailable";

                  return (
                    <motion.div
                      key={member._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.04 }}
                      className="grid grid-cols-[1.8fr_2fr_1fr_1fr_1fr] gap-4 items-center px-5 py-3.5 border-b border-[#1a2a4a]/50 last:border-0 hover:bg-[#ffffff04] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center text-[11px] font-black text-white flex-shrink-0" style={{ fontFamily: "var(--font-display)" }}>
                          {displayName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <span className="block text-xs font-bold text-[#e8f4ff] truncate">{displayName}</span>
                          {member.invitedBy?.name && member.status === "PENDING" && (
                            <span className="block text-[10px] text-[#3d6080] truncate" style={{ fontFamily: "var(--font-mono)" }}>
                              Invited by {member.invitedBy.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <span className="text-[11px] text-[#3d6080] truncate flex items-center gap-2" style={{ fontFamily: "var(--font-mono)" }}>
                          <Mail className="w-3 h-3 text-[#1a3a6b]" />
                          {displayEmail}
                        </span>
                      </div>

                      <span className="text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold w-fit" style={{ color: roleColor, borderColor: `${roleColor}30`, background: `${roleColor}10`, fontFamily: "var(--font-mono)" }}>
                        {member.role}
                      </span>

                      <span className="text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold w-fit" style={{ color: statusColor, borderColor: `${statusColor}30`, background: `${statusColor}10`, fontFamily: "var(--font-mono)" }}>
                        {member.status}
                      </span>

                      <div>
                        {member.role === "OWNER" ? (
                          <span className="text-[10px] text-[#1a3a6b]" style={{ fontFamily: "var(--font-mono)" }}>
                            Protected
                          </span>
                        ) : (
                          <button
                            onClick={() =>
                              setDeleteModal({
                                workspaceId: selectedWs?._id,
                                userId: member.userId?._id,
                                name: member.userId?.name || member.userId?.email || "member",
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#f43f8e20] bg-[#f43f8e08] text-[#f43f8e] hover:bg-[#f43f8e12] transition-colors text-[10px] uppercase tracking-widest"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            <Trash2 className="w-3 h-3" />
                            Remove
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          </>
        )}
      </div>

      <AnimatePresence>
        {showAdd && workspaces.length > 0 && <AddMemberModal workspaces={workspaces} onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
      </AnimatePresence>

      <AnimatePresence>
        {deleteModal && (
          <TypedDeleteModal
            title="Remove Member Permanently"
            itemName={deleteModal.name}
            description={`Permanently remove "${deleteModal.name}" from this workspace? They will lose access immediately.`}
            confirmLabel="Remove Permanently"
            deleting={removing}
            onCancel={() => !removing && setDeleteModal(null)}
            onConfirm={handleRemove}
          />
        )}
      </AnimatePresence>
    </OrgLayout>
  );
};

export default OrgMembers;
