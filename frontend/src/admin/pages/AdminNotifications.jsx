import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Send, RefreshCw, X, Users, Building2, Globe, Trash2, Search, UserCircle2 } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { useAdminApi } from "../hooks/useAdminApi";

const TARGET_OPTIONS = [
  { value: "ALL", label: "Global", icon: Globe, desc: "Send to everyone on the platform." },
  { value: "USER", label: "Specific User", icon: Users, desc: "Choose one user from all platform accounts." },
  { value: "WORKSPACE", label: "Workspace", icon: Building2, desc: "Send to all members inside one workspace." },
];

const AdminNotifications = () => {
  const { getNotifications, sendNotification, deleteNotification, getUsers, getOrganizations, loading } = useAdminApi();
  const [notifs, setNotifs] = useState([]);
  const [showCompose, setShowCompose] = useState(false);
  const [toast, setToast] = useState(null);
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [users, setUsers] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    title: "",
    message: "",
    target: "ALL",
    targetUser: "",
    targetWorkspace: "",
  });

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    try {
      const [notificationsRes, usersRes, workspaceRes] = await Promise.all([
        getNotifications(),
        getUsers(),
        getOrganizations(),
      ]);
      setNotifs(notificationsRes?.data || []);
      setUsers(usersRes?.data || []);
      setWorkspaces(workspaceRes?.data || []);
    } catch {}
  }, [getNotifications, getOrganizations, getUsers]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((user) =>
      [user.name, user.email, user.role].filter(Boolean).some((value) => String(value).toLowerCase().includes(q))
    );
  }, [search, users]);

  const selectedTarget = TARGET_OPTIONS.find((option) => option.value === form.target);

  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      showToast("error", "Title and message are required.");
      return;
    }
    if (form.target === "USER" && !form.targetUser) {
      showToast("error", "Choose a user first.");
      return;
    }
    if (form.target === "WORKSPACE" && !form.targetWorkspace) {
      showToast("error", "Choose a workspace first.");
      return;
    }

    setSending(true);
    try {
      await sendNotification(form);
      showToast("success", "Notification sent successfully.");
      setForm({ title: "", message: "", target: "ALL", targetUser: "", targetWorkspace: "" });
      setSearch("");
      setShowCompose(false);
      load();
    } catch (error) {
      showToast("error", error.message || "Failed to send notification.");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const res = await deleteNotification(id);
      showToast("success", res?.message || "Notification deleted.");
      load();
    } catch (error) {
      showToast("error", error.message || "Failed to delete notification.");
    } finally {
      setDeletingId(null);
    }
  };

  const getAudienceLabel = (notification) => {
    if (notification.type === "USER") {
      return notification.targetUser?.name || notification.targetUser?.email || "Specific user";
    }
    if (notification.type === "WORKSPACE") {
      return notification.targetWorkspace?.name || "Workspace";
    }
    return "Global audience";
  };

  return (
    <AdminLayout>
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

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="text-[10px] text-[#f43f8e] uppercase tracking-[0.3em] mb-1" style={{ fontFamily: "var(--font-mono)" }}>
            Admin / Notifications
          </p>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>
                Notification Control Center
              </h1>
              <p className="text-[12px] text-[#3d6080] mt-1" style={{ fontFamily: "var(--font-mono)" }}>
                Send announcements globally, to a specific user, or to an entire workspace from one place.
              </p>
            </div>
            <div className="flex gap-2">
              <motion.button whileTap={{ scale: 0.95 }} onClick={load} className="px-3 py-2 rounded-xl border border-[#1a2a4a] text-[#3d6080] hover:text-[#00e5ff] hover:border-[#00e5ff33] transition-all">
                <RefreshCw className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowCompose(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f43f8e] text-white font-bold text-xs uppercase tracking-widest"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <Send className="w-3.5 h-3.5" /> Compose
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[1.2fr_2fr] gap-6 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5">
            <p className="text-[10px] text-[#00e5ff] uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-mono)" }}>
              Delivery Modes
            </p>
            <h2 className="text-sm font-black text-[#e8f4ff] uppercase mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Available Targets
            </h2>
            <div className="space-y-3">
              {TARGET_OPTIONS.map((option) => (
                <div key={option.value} className="rounded-xl border border-[#1a2a4a] bg-[#04080f] p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <option.icon className="w-4 h-4 text-[#f43f8e]" />
                    <p className="text-xs font-bold text-[#e8f4ff]">{option.label}</p>
                  </div>
                  <p className="text-[11px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                    {option.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5">
            <p className="text-[10px] text-[#10d990] uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-mono)" }}>
              Live Stats
            </p>
            <h2 className="text-sm font-black text-[#e8f4ff] uppercase mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Notification Reach
            </h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { label: "Platform Users", value: users.length, color: "#00e5ff" },
                { label: "Workspaces", value: workspaces.length, color: "#a855f7" },
                { label: "Sent Notifications", value: notifs.length, color: "#10d990" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-[#1a2a4a] bg-[#04080f] p-4">
                  <p className="text-xl font-black mb-0.5" style={{ color: item.color, fontFamily: "var(--font-display)" }}>
                    {item.value}
                  </p>
                  <p className="text-[10px] text-[#3d6080] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden">
          {loading && notifs.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <motion.div className="w-8 h-8 rounded-full border-2 border-[#f43f8e33] border-t-[#f43f8e]" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
            </div>
          ) : notifs.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="w-8 h-8 text-[#1a3a6b] mx-auto mb-3" />
              <p className="text-[11px] text-[#3d6080] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                No notifications yet
              </p>
            </div>
          ) : (
            notifs.map((notification, index) => (
              <motion.div key={notification._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }} className="flex items-start gap-4 px-5 py-4 border-b border-[#1a2a4a]/50 last:border-0 hover:bg-[#ffffff04] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#f43f8e15] border border-[#f43f8e25] flex items-center justify-center flex-shrink-0">
                  <Bell className="w-4 h-4 text-[#f43f8e]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-xs font-bold text-[#e8f4ff]">{notification.title}</p>
                    <span className="text-[9px] px-2 py-0.5 rounded-full border border-[#00e5ff20] bg-[#00e5ff08] text-[#00e5ff] uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)" }}>
                      {notification.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#3d6080] leading-relaxed" style={{ fontFamily: "var(--font-mono)" }}>
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-[9px] text-[#1a3a6b] uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)" }}>
                      {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : "-"}
                    </span>
                    <span className="text-[9px] text-[#8ab4d4] uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)" }}>
                      Audience: {getAudienceLabel(notification)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(notification._id)}
                  disabled={deletingId === notification._id}
                  className="w-9 h-9 rounded-xl border border-[#f43f8e20] bg-[#f43f8e08] text-[#f43f8e] hover:bg-[#f43f8e12] transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showCompose && (
          <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowCompose(false)} />
            <motion.div
              className="relative w-full max-w-3xl rounded-2xl border border-[#1a2a4a] bg-[#0a0f1a] p-6 overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              style={{ boxShadow: "0 0 80px #00000099" }}
            >
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-[#f43f8e] via-[#7c3aed] to-[#00e5ff] opacity-60" />
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>
                    Send Notification
                  </h3>
                  <p className="text-[11px] text-[#3d6080] mt-1" style={{ fontFamily: "var(--font-mono)" }}>
                    Choose the exact audience and publish a platform message instantly.
                  </p>
                </div>
                <button onClick={() => setShowCompose(false)} className="text-[#3d6080] hover:text-[#8ab4d4]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                    Audience
                  </label>
                  <div className="grid md:grid-cols-3 gap-2">
                    {TARGET_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            target: option.value,
                            targetUser: option.value === "USER" ? current.targetUser : "",
                            targetWorkspace: option.value === "WORKSPACE" ? current.targetWorkspace : "",
                          }))
                        }
                        className={`rounded-xl border p-3 text-left transition-all ${
                          form.target === option.value ? "border-[#f43f8e50] bg-[#f43f8e15]" : "border-[#1a2a4a] bg-[#04080f]"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <option.icon className={`w-4 h-4 ${form.target === option.value ? "text-[#f43f8e]" : "text-[#3d6080]"}`} />
                          <span className={`text-[11px] font-bold uppercase tracking-wider ${form.target === option.value ? "text-[#f43f8e]" : "text-[#8ab4d4]"}`} style={{ fontFamily: "var(--font-mono)" }}>
                            {option.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                          {option.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {form.target === "USER" && (
                  <div className="rounded-xl border border-[#1a2a4a] bg-[#04080f] p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Search className="w-4 h-4 text-[#3d6080]" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users by name, email, or role..."
                        className="w-full bg-transparent text-[#e8f4ff] placeholder:text-[#1a3a6b] outline-none text-sm"
                        style={{ fontFamily: "var(--font-mono)" }}
                      />
                    </div>
                    <div className="max-h-52 overflow-y-auto space-y-2">
                      {filteredUsers.map((user) => (
                        <button
                          key={user._id}
                          onClick={() => setForm((current) => ({ ...current, targetUser: user._id }))}
                          className={`w-full rounded-xl border px-3 py-3 flex items-center gap-3 text-left transition-all ${
                            form.targetUser === user._id ? "border-[#00e5ff40] bg-[#00e5ff10]" : "border-[#1a2a4a] bg-[#060d18]"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00e5ff] to-[#10d990] flex items-center justify-center text-[#020408] text-[11px] font-black" style={{ fontFamily: "var(--font-display)" }}>
                            {user.name?.charAt(0) || "U"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#e8f4ff] truncate">{user.name}</p>
                            <p className="text-[10px] text-[#3d6080] truncate" style={{ fontFamily: "var(--font-mono)" }}>
                              {user.email}
                            </p>
                          </div>
                          <span className="text-[9px] px-2 py-0.5 rounded-full border border-[#a855f720] bg-[#a855f708] text-[#a855f7] uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)" }}>
                            {user.role}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {form.target === "WORKSPACE" && (
                  <div>
                    <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                      Workspace
                    </label>
                    <div className="grid md:grid-cols-2 gap-2 max-h-52 overflow-y-auto">
                      {workspaces.map((workspace) => (
                        <button
                          key={workspace._id}
                          onClick={() => setForm((current) => ({ ...current, targetWorkspace: workspace._id }))}
                          className={`rounded-xl border p-3 text-left transition-all ${
                            form.targetWorkspace === workspace._id ? "border-[#10d99040] bg-[#10d99010]" : "border-[#1a2a4a] bg-[#04080f]"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <UserCircle2 className="w-4 h-4 text-[#10d990]" />
                            <p className="text-xs font-bold text-[#e8f4ff] truncate">{workspace.name}</p>
                          </div>
                          <p className="text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                            Send to everyone inside this workspace.
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                    Title
                  </label>
                  <input
                    className="w-full bg-[#04080f] border border-[#1a2a4a] rounded-xl px-4 py-3 text-[#e8f4ff] placeholder:text-[#1a3a6b] focus:outline-none focus:border-[#f43f8e44] text-sm"
                    style={{ fontFamily: "var(--font-mono)" }}
                    placeholder="Notification title..."
                    value={form.title}
                    onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                    Message
                  </label>
                  <textarea
                    className="w-full bg-[#04080f] border border-[#1a2a4a] rounded-xl px-4 py-3 text-[#e8f4ff] placeholder:text-[#1a3a6b] focus:outline-none focus:border-[#f43f8e44] text-sm resize-none"
                    style={{ fontFamily: "var(--font-mono)" }}
                    rows={5}
                    placeholder="Write the message you want to deliver..."
                    value={form.message}
                    onChange={(e) => setForm((current) => ({ ...current, message: e.target.value }))}
                  />
                </div>

                <div className="rounded-xl border border-[#00e5ff20] bg-[#00e5ff08] p-3">
                  <p className="text-[10px] text-[#00e5ff] uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-mono)" }}>
                    Selected audience
                  </p>
                  <p className="text-[11px] text-[#8ab4d4]" style={{ fontFamily: "var(--font-mono)" }}>
                    {selectedTarget?.label}
                    {form.target === "USER" && form.targetUser
                      ? ` - ${users.find((user) => user._id === form.targetUser)?.name || "User selected"}`
                      : ""}
                    {form.target === "WORKSPACE" && form.targetWorkspace
                      ? ` - ${workspaces.find((workspace) => workspace._id === form.targetWorkspace)?.name || "Workspace selected"}`
                      : ""}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowCompose(false)} className="flex-1 py-2.5 rounded-xl border border-[#1a2a4a] text-[#8ab4d4] text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                  Cancel
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSend} disabled={sending} className="flex-1 py-2.5 rounded-xl bg-[#f43f8e] text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50" style={{ fontFamily: "var(--font-mono)" }}>
                  <Send className="w-3.5 h-3.5" />
                  {sending ? "Sending..." : "Send Notification"}
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
