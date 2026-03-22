// src/admin/pages/AdminAdmins.jsx
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Trash2, Shield, Eye, EyeOff, X, RefreshCw, UserMinus, AlertTriangle } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { useAdminApi } from "../hooks/useAdminApi";

/* ── Toast ── */
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

/* ── Create Admin Modal ── */
const CreateAdminModal = ({ onClose, onCreate }) => {
  const [form, setForm]         = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [err, setErr]           = useState("");

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) { setErr("All fields required."); return; }
    if (form.password.length < 8) { setErr("Password must be 8+ characters."); return; }
    setSaving(true);
    try { await onCreate(form); onClose(); }
    catch (e) { setErr(e.message || "Failed to create admin."); }
    finally { setSaving(false); }
  };

  return (
    <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative w-full max-w-md rounded-2xl overflow-hidden"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        style={{ background: "linear-gradient(135deg,#0d1117,#161b22)", border: "1px solid #f43f8e22", boxShadow: "0 0 60px #f43f8e08, 0 20px 60px #00000099" }}>
        <div className="h-[2px] bg-gradient-to-r from-[#f43f8e] via-[#7c3aed] to-transparent" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] text-[#f43f8e] uppercase tracking-[0.2em] mb-1" style={{ fontFamily: "var(--font-mono)" }}>Create New</p>
              <h3 className="text-base font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>Admin Account</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl border border-[#1a2a4a] flex items-center justify-center text-[#3d6080] hover:text-[#8ab4d4] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {err && (
            <div className="mb-4 px-3 py-2.5 rounded-xl border border-[#f43f8e30] bg-[#f43f8e08] text-[11px] text-[#f43f8e]"
              style={{ fontFamily: "var(--font-mono)" }}>❌ {err}</div>
          )}

          {/* Info note */}
          <div className="mb-4 p-3 rounded-xl border border-[#10d99020] bg-[#10d99008] flex items-start gap-2">
            <Shield className="w-3.5 h-3.5 text-[#10d990] flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
              Credentials will be emailed to the new admin automatically.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { name: "name",  label: "Full Name", placeholder: "Admin Name",      type: "text" },
              { name: "email", label: "Email",     placeholder: "admin@email.com", type: "email" },
            ].map(({ name, label, placeholder, type }) => (
              <div key={name}>
                <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2"
                  style={{ fontFamily: "var(--font-mono)" }}>{label}</label>
                <input type={type} placeholder={placeholder}
                  className="w-full bg-[#04080f] border border-[#1a2a4a] rounded-xl px-4 py-3 text-[#e8f4ff] placeholder:text-[#1a3a6b] focus:outline-none focus:border-[#f43f8e44] text-sm"
                  style={{ fontFamily: "var(--font-mono)" }}
                  value={form[name]}
                  onChange={e => { setForm(f => ({ ...f, [name]: e.target.value })); setErr(""); }} />
              </div>
            ))}

            <div>
              <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2"
                style={{ fontFamily: "var(--font-mono)" }}>Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} placeholder="Min 8 characters"
                  className="w-full bg-[#04080f] border border-[#1a2a4a] rounded-xl px-4 py-3 text-[#e8f4ff] placeholder:text-[#1a3a6b] focus:outline-none focus:border-[#f43f8e44] text-sm pr-10"
                  style={{ fontFamily: "var(--font-mono)" }}
                  value={form.password}
                  onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErr(""); }} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3d6080] hover:text-[#8ab4d4] transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#1a2a4a] text-[#8ab4d4] text-xs uppercase tracking-widest"
              style={{ fontFamily: "var(--font-mono)" }}>Cancel</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleCreate} disabled={saving}
              className="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest text-white disabled:opacity-50"
              style={{ background: "#f43f8e", fontFamily: "var(--font-mono)" }}>
              {saving ? "Creating..." : "Create & Send Email"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Remove Admin Modal (with reason) ── */
const RemoveAdminModal = ({ admin, onClose, onConfirm }) => {
  const [reason, setReason]   = useState("");
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    try { await onConfirm(admin._id, reason.trim()); onClose(); }
    catch {}
    finally { setRemoving(false); }
  };

  return (
    <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        style={{ background: "linear-gradient(135deg,#0d1117,#161b22)", border: "1px solid #f59e0b22", boxShadow: "0 0 60px #00000099" }}>
        <div className="h-[2px] bg-gradient-to-r from-[#f59e0b] via-[#f43f8e] to-transparent" />
        <div className="p-6">
          <div className="w-12 h-12 rounded-2xl bg-[#f59e0b0a] border border-[#f59e0b30] flex items-center justify-center mx-auto mb-4">
            <UserMinus className="w-5 h-5 text-[#f59e0b]" />
          </div>
          <h3 className="text-sm font-black text-[#e8f4ff] mb-1 uppercase text-center"
            style={{ fontFamily: "var(--font-display)" }}>Remove Admin</h3>
          <p className="text-[11px] text-[#3d6080] text-center mb-4"
            style={{ fontFamily: "var(--font-mono)" }}>
            Remove admin privileges from <span className="text-[#f59e0b]">"{admin.name}"</span>?
            They'll become a regular USER and receive an email notification.
          </p>

          {/* Reason box */}
          <div className="mb-4">
            <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2"
              style={{ fontFamily: "var(--font-mono)" }}>
              Reason <span className="text-[#1a3a6b]">(optional — included in email)</span>
            </label>
            <textarea rows={3}
              className="w-full bg-[#04080f] border border-[#1a2a4a] rounded-xl px-3 py-2.5 text-[#e8f4ff] placeholder:text-[#1a3a6b] focus:outline-none focus:border-[#f59e0b44] text-xs resize-none"
              style={{ fontFamily: "var(--font-mono)" }}
              placeholder="e.g. Role restructuring, inactive account, policy violation..."
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#f59e0b08] border border-[#f59e0b20] mb-5">
            <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b] flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-[#f59e0b]" style={{ fontFamily: "var(--font-mono)" }}>
              Account will not be deleted — only admin role removed.
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#1a2a4a] text-[#8ab4d4] text-xs uppercase tracking-widest"
              style={{ fontFamily: "var(--font-mono)" }}>Cancel</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleRemove} disabled={removing}
              className="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest text-[#020408] disabled:opacity-50"
              style={{ background: "#f59e0b", fontFamily: "var(--font-mono)" }}>
              {removing ? "Removing..." : "Remove Admin"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Delete Admin Modal (hard delete) ── */
const DeleteAdminModal = ({ admin, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    setDeleting(true);
    try { await onConfirm(admin._id); onClose(); }
    catch {}
    finally { setDeleting(false); }
  };
  return (
    <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        style={{ background: "linear-gradient(135deg,#0d1117,#161b22)", border: "1px solid #f43f8e22", boxShadow: "0 0 60px #00000099" }}>
        <div className="h-[2px] bg-gradient-to-r from-[#f43f8e] to-transparent" />
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#f43f8e0a] border border-[#f43f8e30] flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-5 h-5 text-[#f43f8e]" />
          </div>
          <h3 className="text-sm font-black text-[#e8f4ff] mb-2 uppercase" style={{ fontFamily: "var(--font-display)" }}>Delete Admin</h3>
          <p className="text-xs text-[#3d6080] mb-5" style={{ fontFamily: "var(--font-mono)" }}>
            Permanently delete <span className="text-[#f43f8e]">"{admin.name}"</span>?
            This cannot be undone. Their account will be completely removed.
          </p>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#1a2a4a] text-[#8ab4d4] text-xs uppercase tracking-widest"
              style={{ fontFamily: "var(--font-mono)" }}>Cancel</button>
            <motion.button whileTap={{ scale: 0.98 }} onClick={handleDelete} disabled={deleting}
              className="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest text-white disabled:opacity-50"
              style={{ background: "#f43f8e", fontFamily: "var(--font-mono)" }}>
              {deleting ? "Deleting..." : "Delete"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Main AdminAdmins ── */
const AdminAdmins = () => {
  const { getAdmins, createAdmin, deleteAdmin, removeAdmin, loading } = useAdminApi();
  const [admins, setAdmins]           = useState([]);
  const [showCreate, setShowCreate]   = useState(false);
  const [removeModal, setRemoveModal] = useState(null); // remove privileges
  const [deleteModal, setDeleteModal] = useState(null); // hard delete
  const [toast, setToast]             = useState(null);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    try {
      const res = await getAdmins();
      setAdmins(res?.data || []);
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (form) => {
    await createAdmin(form);
    showToast("success", `Admin created! Credentials sent to ${form.email}`);
    load();
  };

  const handleRemove = async (id, reason) => {
    try {
      await removeAdmin(id, reason);
      showToast("success", "Admin privileges removed. Email sent.");
      load();
    } catch (e) { showToast("error", e.message || "Failed to remove admin."); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAdmin(id);
      showToast("success", "Admin account deleted.");
      load();
    } catch (e) { showToast("error", e.message || "Failed to delete."); }
  };

  return (
    <AdminLayout>
      <AnimatePresence>
        {toast && <Toast toast={toast} />}
      </AnimatePresence>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="text-[10px] text-[#f43f8e] uppercase tracking-[0.3em] mb-1"
            style={{ fontFamily: "var(--font-mono)" }}>Admin / Admins</p>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-[#e8f4ff] uppercase"
              style={{ fontFamily: "var(--font-display)" }}>Admin Management</h1>
            <div className="flex gap-2">
              <motion.button whileTap={{ scale: 0.95 }} onClick={load}
                className="px-3 py-2 rounded-xl border border-[#1a2a4a] text-[#3d6080] hover:text-[#00e5ff] hover:border-[#00e5ff33] transition-all">
                <RefreshCw className="w-4 h-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold text-xs uppercase tracking-widest"
                style={{ background: "#f43f8e", fontFamily: "var(--font-mono)" }}>
                <UserPlus className="w-3.5 h-3.5" /> New Admin
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Info banner */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="mb-6 p-4 rounded-xl border border-[#f59e0b30] bg-[#f59e0b08] flex items-start gap-3">
          <Shield className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#8ab4d4] leading-relaxed" style={{ fontFamily: "var(--font-mono)" }}>
            Admin accounts have full platform access. New admin receives credentials via email automatically.
            Use <span className="text-[#f59e0b]">Remove Admin</span> to revoke privileges (keeps account) or
            <span className="text-[#f43f8e]"> Delete</span> to permanently remove the account.
          </p>
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden"
          style={{ boxShadow: "0 4px 24px #00000055" }}>
          <div className="h-[1.5px]" style={{ background: "linear-gradient(90deg,#f43f8e,#7c3aed,transparent)" }} />

          <div className="grid grid-cols-[2fr_2fr_1fr_auto] gap-4 px-5 py-3 border-b border-[#1a2a4a] text-[10px] text-[#3d6080] uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono)" }}>
            <span>Admin</span><span>Email</span><span>Created</span><span>Actions</span>
          </div>

          {loading && admins.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <motion.div className="w-8 h-8 rounded-full border-2 border-[#f43f8e33] border-t-[#f43f8e]"
                animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[11px] text-[#3d6080] uppercase tracking-widest"
                style={{ fontFamily: "var(--font-mono)" }}>No admins found</p>
            </div>
          ) : (
            admins.map((admin, i) => (
              <motion.div key={admin._id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="grid grid-cols-[2fr_2fr_1fr_auto] gap-4 items-center px-5 py-4 border-b border-[#1a2a4a]/50 last:border-0 hover:bg-[#ffffff04] transition-colors">

                {/* Name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#f43f8e] to-[#7c3aed] flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
                    style={{ fontFamily: "var(--font-display)", boxShadow: "0 0 12px #f43f8e33" }}>
                    {admin.name?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#e8f4ff] truncate">{admin.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f43f8e]" />
                      <span className="text-[9px] text-[#f43f8e] uppercase tracking-wider"
                        style={{ fontFamily: "var(--font-mono)" }}>Super Admin</span>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <span className="text-[11px] text-[#3d6080] truncate"
                  style={{ fontFamily: "var(--font-mono)" }}>{admin.email}</span>

                {/* Date */}
                <span className="text-[10px] text-[#1a3a6b]"
                  style={{ fontFamily: "var(--font-mono)" }}>
                  {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "—"}
                </span>

                {/* Actions — Remove + Delete */}
                <div className="flex items-center gap-1.5">
                  {/* Remove admin privileges */}
                  <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                    onClick={() => setRemoveModal(admin)}
                    title="Remove admin privileges"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#f59e0b30] text-[#f59e0b] hover:bg-[#f59e0b10] transition-all text-[9px] uppercase tracking-wider font-bold"
                    style={{ fontFamily: "var(--font-mono)" }}>
                    <UserMinus className="w-3 h-3" /> Remove
                  </motion.button>

                  {/* Hard delete */}
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setDeleteModal(admin)}
                    title="Delete account permanently"
                    className="w-7 h-7 rounded-xl border border-[#1a2a4a] flex items-center justify-center text-[#3d6080] hover:text-[#f43f8e] hover:border-[#f43f8e33] transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreate && (
          <CreateAdminModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
        )}
        {removeModal && (
          <RemoveAdminModal
            admin={removeModal}
            onClose={() => setRemoveModal(null)}
            onConfirm={handleRemove}
          />
        )}
        {deleteModal && (
          <DeleteAdminModal
            admin={deleteModal}
            onClose={() => setDeleteModal(null)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminAdmins;