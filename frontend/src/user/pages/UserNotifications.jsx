// src/user/pages/UserNotifications.jsx
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, RefreshCw } from "lucide-react";
import UserLayout from "../components/UserLayout";
import { useUserApi } from "../hooks/useUserApi";
import { useAuth } from "../../hooks/useAuth";

const UserNotifications = () => {
  const { getNotifications, markRead, loading } = useUserApi();
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);

  const load = useCallback(async () => {
    try {
      const res = await getNotifications();
      setNotifs(res?.data || []);
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleMarkRead = async (id) => {
    try {
      await markRead(id);
      setNotifs(prev => prev.map(n =>
        n._id === id ? { ...n, readBy: [...(n.readBy || []), user?._id] } : n
      ));
    } catch {}
  };

  const markAllRead = async () => {
    const unread = notifs.filter(n => !n.readBy?.includes(user?._id));
    for (const n of unread) await handleMarkRead(n._id);
  };

  const unreadCount = notifs.filter(n => !n.readBy?.includes(user?._id)).length;
  const TYPE_COLORS = { GLOBAL: "#10d990", USER: "#00e5ff", WORKSPACE: "#a855f7" };

  return (
    <UserLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="text-[10px] text-[#00e5ff] uppercase tracking-[0.3em] mb-1"
            style={{ fontFamily: "var(--font-mono)" }}>User / Inbox</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-[#e8f4ff] uppercase"
                style={{ fontFamily: "var(--font-display)" }}>Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-[#020408]"
                  style={{ background: "#00e5ff", fontFamily: "var(--font-mono)" }}>{unreadCount}</span>
              )}
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <motion.button whileTap={{ scale: 0.95 }} onClick={markAllRead}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#00e5ff30] text-[#00e5ff] text-[10px] uppercase tracking-wider font-bold hover:bg-[#00e5ff10] transition-all"
                  style={{ fontFamily: "var(--font-mono)" }}>
                  <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
                </motion.button>
              )}
              <motion.button whileTap={{ scale: 0.95 }} onClick={load}
                className="px-3 py-2 rounded-xl border border-[#1a2a4a] text-[#3d6080] hover:text-[#00e5ff] hover:border-[#00e5ff33] transition-all">
                <RefreshCw className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden"
          style={{ boxShadow: "0 4px 24px #00000055" }}>
          {loading && notifs.length === 0 ? (
            <div className="flex justify-center py-16">
              <motion.div className="w-8 h-8 rounded-full border-2 border-[#00e5ff33] border-t-[#00e5ff]"
                animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
            </div>
          ) : notifs.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="w-10 h-10 text-[#1a3a6b] mx-auto mb-3" />
              <p className="text-[11px] text-[#3d6080] uppercase tracking-widest"
                style={{ fontFamily: "var(--font-mono)" }}>No notifications yet</p>
            </div>
          ) : (
            notifs.map((n, i) => {
              const isUnread = !n.readBy?.includes(user?._id);
              const tc = TYPE_COLORS[n.type] || "#00e5ff";
              return (
                <motion.div key={n._id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-start gap-4 px-5 py-4 border-b border-[#1a2a4a]/50 last:border-0 cursor-pointer transition-colors ${
                    isUnread ? "bg-[#00e5ff04] hover:bg-[#00e5ff08]" : "hover:bg-[#ffffff03]"
                  }`}
                  onClick={() => isUnread && handleMarkRead(n._id)}>
                  <div className="flex-shrink-0 mt-2">
                    <div className={`w-2 h-2 rounded-full transition-colors ${isUnread ? "bg-[#00e5ff]" : "bg-[#1a2a4a]"}`} />
                  </div>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${tc}15`, border: `1px solid ${tc}25` }}>
                    <Bell className="w-4 h-4" style={{ color: tc }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-bold ${isUnread ? "text-[#e8f4ff]" : "text-[#8ab4d4]"}`}>{n.title}</p>
                      <span className="text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider flex-shrink-0"
                        style={{ color: tc, borderColor: `${tc}30`, background: `${tc}10`, fontFamily: "var(--font-mono)" }}>
                        {n.type}
                      </span>
                    </div>
                    <p className="text-xs text-[#3d6080] mt-0.5 leading-relaxed"
                      style={{ fontFamily: "var(--font-mono)" }}>{n.message}</p>
                    <p className="text-[10px] text-[#1a3a6b] mt-1.5"
                      style={{ fontFamily: "var(--font-mono)" }}>
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : "—"}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default UserNotifications;