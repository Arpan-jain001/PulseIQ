// src/admin/pages/AdminNotifications.jsx
// Backend: GET /api/admin/notifications
//          POST /api/admin/notifications { title, message, type, targetUser?, targetWorkspace? }
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Send, RefreshCw, X, Users, Building2, Globe, Trash2 } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { useAdminApi } from "../hooks/useAdminApi";

const AdminNotifications = () => {
  const { getNotifications, sendNotification, loading } = useAdminApi();
  const [notifs, setNotifs]       = useState([]);
  const [showCompose, setShowCompose] = useState(false);
  const [toast, setToast]         = useState(null);
  const [form, setForm]           = useState({ title: "", message: "", target: "ALL" });
  const [sending, setSending]     = useState(false);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    try {
      const res = await getNotifications();
      setNotifs(res?.data || (Array.isArray(res?.data) ? res.data : []));
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSend = async () => {
    if (!form.title || !form.message) { showToast("error", "Title and message required."); return; }
    setSending(true);
    try {
      await sendNotification(form);
      showToast("success", "Notification sent!");
      setForm({ title: "", message: "", target: "ALL" });
      setShowCompose(false);
      load();
    } catch { showToast("error", "Failed to send."); }
    finally { setSending(false); }
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
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="text-[10px] text-[#f43f8e] uppercase tracking-[0.3em] mb-1" style={{ fontFamily: "var(--font-mono)" }}>Admin / Notifications</p>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>Notifications</h1>
            <div className="flex gap-2">
              <motion.button whileTap={{ scale: 0.95 }} onClick={load}
                className="px-3 py-2 rounded-xl border border-[#1a2a4a] text-[#3d6080] hover:text-[#00e5ff] hover:border-[#00e5ff33] transition-all">
                <RefreshCw className="w-4 h-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setShowCompose(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f43f8e] text-white font-bold text-xs uppercase tracking-widest"
                style={{ fontFamily: "var(--font-mono)" }}>
                <Send className="w-3.5 h-3.5" /> Send
              </motion.button>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden">
          {loading && notifs.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <motion.div className="w-8 h-8 rounded-full border-2 border-[#f43f8e33] border-t-[#f43f8e]"
                animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
            </div>
          ) : notifs.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="w-8 h-8 text-[#1a3a6b] mx-auto mb-3" />
              <p className="text-[11px] text-[#3d6080] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>No notifications yet</p>
            </div>
          ) : (
            notifs.map((n, i) => (
              <motion.div key={n._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-start gap-4 px-5 py-4 border-b border-[#1a2a4a]/50 last:border-0 hover:bg-[#ffffff04] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#f43f8e15] border border-[#f43f8e25] flex items-center justify-center flex-shrink-0">
                  <Bell className="w-4 h-4 text-[#f43f8e]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#e8f4ff] mb-0.5">{n.title}</p>
                  <p className="text-[11px] text-[#3d6080] leading-relaxed" style={{ fontFamily: "var(--font-mono)" }}>{n.message}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[9px] text-[#1a3a6b] uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)" }}>
                      {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "—"}
                    </span>
                    {n.type && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full border border-[#00e5ff20] bg-[#00e5ff08] text-[#00e5ff] uppercase tracking-wider"
                        style={{ fontFamily: "var(--font-mono)" }}>{n.type}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {showCompose && (
          <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowCompose(false)} />
            <motion.div className="relative w-full max-w-md rounded-2xl border border-[#1a2a4a] bg-[#0a0f1a] p-6 overflow-hidden"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              style={{ boxShadow: "0 0 80px #00000099" }}>
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-[#f43f8e] via-[#7c3aed] to-[#00e5ff] opacity-60" />
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>Send Notification</h3>
                <button onClick={() => setShowCompose(false)} className="text-[#3d6080] hover:text-[#8ab4d4]"><X className="w-4 h-4" /></button>
              </div>

              <div className="space-y-4">
                {/* Type */}
                <div>
                  <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>Type / Target</label>
                  <div className="flex gap-2">
                    {[
                      { v: "ALL",       label: "Global",  icon: Globe },
                      { v: "USER",      label: "Users",   icon: Users },
                      { v: "ORGANIZER", label: "Orgs",    icon: Building2 },
                    ].map(({ v, label, icon: Icon }) => (
                      <button key={v} onClick={() => setForm(f => ({ ...f, target: v }))}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] uppercase tracking-wider font-bold border transition-all ${
                          form.target === v ? "border-[#f43f8e50] bg-[#f43f8e15] text-[#f43f8e]" : "border-[#1a2a4a] text-[#3d6080] hover:text-[#8ab4d4]"
                        }`}
                        style={{ fontFamily: "var(--font-mono)" }}>
                        <Icon className="w-3 h-3" />{label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>Title</label>
                  <input className="w-full bg-[#04080f] border border-[#1a2a4a] rounded-xl px-4 py-3 text-[#e8f4ff] placeholder:text-[#1a3a6b] focus:outline-none focus:border-[#f43f8e44] text-sm"
                    style={{ fontFamily: "var(--font-mono)" }} placeholder="Notification title..."
                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>Message</label>
                  <textarea className="w-full bg-[#04080f] border border-[#1a2a4a] rounded-xl px-4 py-3 text-[#e8f4ff] placeholder:text-[#1a3a6b] focus:outline-none focus:border-[#f43f8e44] text-sm resize-none"
                    style={{ fontFamily: "var(--font-mono)" }} rows={4} placeholder="Notification message..."
                    value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowCompose(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#1a2a4a] text-[#8ab4d4] text-xs uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-mono)" }}>Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSend} disabled={sending}
                  className="flex-1 py-2.5 rounded-xl bg-[#f43f8e] text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ fontFamily: "var(--font-mono)" }}>
                  <Send className="w-3.5 h-3.5" />{sending ? "Sending..." : "Send"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminNotifications;