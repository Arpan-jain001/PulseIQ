import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users, Building2, Bell, Activity, TrendingUp, ShieldCheck, UserCheck, AlertTriangle, Sparkles } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { useAdminApi } from "../hooks/useAdminApi";

const StatCard = ({ icon: Icon, label, value, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="relative rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5 overflow-hidden group hover:border-[#f43f8e33] transition-all duration-300"
    style={{ boxShadow: "0 4px 24px #00000055" }}
  >
    <div className="absolute top-0 inset-x-0 h-[1.5px] opacity-60" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 80% 20%, ${color}0d 0%, transparent 60%)` }} />
    <div className="relative">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <p className="text-2xl font-black text-[#e8f4ff] mb-1" style={{ fontFamily: "var(--font-display)" }}>
        {value ?? "-"}
      </p>
      <p className="text-[11px] text-[#3d6080] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
        {label}
      </p>
    </div>
  </motion.div>
);

const AdminOverview = () => {
  const { getOverview, getUsers, getNotifications, getOrganizations, loading } = useAdminApi();
  const [overview, setOverview] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [overviewRes, usersRes, notificationsRes, workspacesRes] = await Promise.all([
          getOverview(),
          getUsers(),
          getNotifications(),
          getOrganizations(),
        ]);
        const users = usersRes?.data || [];
        setOverview(overviewRes?.data || overviewRes);
        setRecentUsers(users.slice(0, 8));
        setNotifications(notificationsRes?.data || []);
        setWorkspaces(workspacesRes?.data || []);
      } catch {}
    };
    load();
  }, [getNotifications, getOrganizations, getOverview, getUsers]);

  const metrics = useMemo(() => {
    const activeUsers = recentUsers.filter((user) => user.status === "ACTIVE").length;
    const organizers = recentUsers.filter((user) => user.role === "ORGANIZER").length;
    const pendingVerify = recentUsers.filter((user) => user.verificationStatus === "PENDING").length;
    const bannedUsers = recentUsers.filter((user) => user.status === "BANNED").length;
    return { activeUsers, organizers, pendingVerify, bannedUsers };
  }, [recentUsers]);

  const cards = [
    { icon: Users, label: "Total Users", value: overview?.users, color: "#00e5ff" },
    { icon: Building2, label: "Workspaces", value: overview?.workspaces, color: "#a855f7" },
    { icon: Bell, label: "Notifications", value: overview?.notifications, color: "#f59e0b" },
    { icon: ShieldCheck, label: "Active Users", value: metrics.activeUsers, color: "#10d990" },
    { icon: TrendingUp, label: "Organizers", value: metrics.organizers, color: "#f43f8e" },
    { icon: AlertTriangle, label: "Pending Verify", value: metrics.pendingVerify, color: "#f59e0b" },
  ];

  return (
    <AdminLayout>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px flex-1 bg-gradient-to-r from-[#f43f8e33] to-transparent" />
            <span className="text-[10px] text-[#f43f8e] uppercase tracking-[0.3em]" style={{ fontFamily: "var(--font-mono)" }}>
              Admin / Control Board
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#e8f4ff] uppercase tracking-wide" style={{ fontFamily: "var(--font-display)" }}>
            Platform Overview
          </h1>
          <p className="text-sm text-[#3d6080] mt-1" style={{ fontFamily: "var(--font-mono)" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {cards.map((card, index) => (
            <StatCard key={card.label} {...card} delay={index * 0.07} />
          ))}
        </div>

        <div className="grid xl:grid-cols-[1.25fr_1fr] gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5" style={{ boxShadow: "0 4px 24px #00000055" }}>
            <p className="text-[10px] text-[#00e5ff] uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-mono)" }}>
              Executive Summary
            </p>
            <h2 className="text-sm font-black text-[#e8f4ff] uppercase mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Platform Health Snapshot
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#10d99020] bg-[#10d99008] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="w-4 h-4 text-[#10d990]" />
                  <p className="text-[10px] text-[#10d990] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                    Strong Signal
                  </p>
                </div>
                <p className="text-[11px] text-[#8ab4d4] leading-relaxed" style={{ fontFamily: "var(--font-mono)" }}>
                  {metrics.activeUsers > 0
                    ? `${metrics.activeUsers} recent users are active, which indicates healthy platform engagement across the latest accounts.`
                    : "Active user momentum will appear here as new accounts start engaging."}
                </p>
              </div>
              <div className="rounded-xl border border-[#f43f8e20] bg-[#f43f8e08] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-[#f43f8e]" />
                  <p className="text-[10px] text-[#f43f8e] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                    Risk Watch
                  </p>
                </div>
                <p className="text-[11px] text-[#8ab4d4] leading-relaxed" style={{ fontFamily: "var(--font-mono)" }}>
                  {metrics.pendingVerify > 0
                    ? `${metrics.pendingVerify} organizer accounts are still pending verification. This is the fastest place to reduce onboarding friction.`
                    : "No urgent organizer verification backlog detected in the latest set."}
                </p>
              </div>
              <div className="rounded-xl border border-[#a855f720] bg-[#a855f708] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#a855f7]" />
                  <p className="text-[10px] text-[#a855f7] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                    Admin Focus
                  </p>
                </div>
                <p className="text-[11px] text-[#8ab4d4] leading-relaxed" style={{ fontFamily: "var(--font-mono)" }}>
                  Use the notification center to target specific users or workspaces whenever platform-wide announcements are not the right fit.
                </p>
              </div>
              <div className="rounded-xl border border-[#f59e0b20] bg-[#f59e0b08] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-4 h-4 text-[#f59e0b]" />
                  <p className="text-[10px] text-[#f59e0b] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                    Delivery Readiness
                  </p>
                </div>
                <p className="text-[11px] text-[#8ab4d4] leading-relaxed" style={{ fontFamily: "var(--font-mono)" }}>
                  {notifications.length} admin notifications have been logged so far, giving you a visible audit trail for operational communication.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5" style={{ boxShadow: "0 4px 24px #00000055" }}>
            <p className="text-[10px] text-[#f43f8e] uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-mono)" }}>
              Ops Mix
            </p>
            <h2 className="text-sm font-black text-[#e8f4ff] uppercase mb-4" style={{ fontFamily: "var(--font-display)" }}>
              User and Workspace Composition
            </h2>
            <div className="space-y-3">
              {[
                { label: "Recent Organizers", value: metrics.organizers, color: "#a855f7" },
                { label: "Recent Active Users", value: metrics.activeUsers, color: "#10d990" },
                { label: "Banned Users", value: metrics.bannedUsers, color: "#f43f8e" },
                { label: "Tracked Workspaces", value: workspaces.length, color: "#00e5ff" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-[#1a2a4a] bg-[#04080f] p-3 flex items-center justify-between">
                  <span className="text-[11px] text-[#8ab4d4]" style={{ fontFamily: "var(--font-mono)" }}>
                    {item.label}
                  </span>
                  <span className="text-lg font-black" style={{ color: item.color, fontFamily: "var(--font-display)" }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden" style={{ boxShadow: "0 4px 24px #00000055" }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a2a4a]">
            <div>
              <p className="text-[10px] text-[#f43f8e] uppercase tracking-widest mb-0.5" style={{ fontFamily: "var(--font-mono)" }}>
                Latest Registrations
              </p>
              <h2 className="text-sm font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>
                Recent Users
              </h2>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#10d99025] bg-[#10d99008]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10d990] animate-pulse" />
              <span className="text-[10px] text-[#10d990] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                Live
              </span>
            </div>
          </div>
          <div className="px-3 py-2">
            {loading && recentUsers.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <motion.div className="w-8 h-8 rounded-full border-2 border-[#f43f8e33] border-t-[#f43f8e]" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
              </div>
            ) : recentUsers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[11px] text-[#3d6080] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                  No users yet
                </p>
              </div>
            ) : (
              recentUsers.map((user, index) => {
                const roleColors = { SUPER_ADMIN: "#f43f8e", ORGANIZER: "#a855f7", USER: "#00e5ff" };
                const statusColors = { ACTIVE: "#10d990", SUSPENDED: "#f59e0b", BANNED: "#f43f8e" };
                const verColors = { VERIFIED: "#10d990", PENDING: "#f59e0b", REJECTED: "#f43f8e" };
                return (
                  <motion.div key={user._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="flex items-center gap-4 py-3 border-b border-[#1a2a4a] last:border-0 hover:bg-[#ffffff04] px-2 rounded-xl transition-colors">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black text-[#020408] flex-shrink-0" style={{ background: roleColors[user.role] || "#00e5ff", fontFamily: "var(--font-display)" }}>
                      {user.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#e8f4ff] truncate">{user.name}</p>
                      <p className="text-[10px] text-[#3d6080] truncate" style={{ fontFamily: "var(--font-mono)" }}>
                        {user.email}
                      </p>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full border hidden sm:block uppercase tracking-wider font-bold" style={{ color: roleColors[user.role] || "#00e5ff", borderColor: `${roleColors[user.role]}30`, background: `${roleColors[user.role]}10`, fontFamily: "var(--font-mono)" }}>
                      {user.role?.replace("_", " ")}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold" style={{ color: statusColors[user.status] || "#8ab4d4", borderColor: `${statusColors[user.status]}30`, background: `${statusColors[user.status]}10`, fontFamily: "var(--font-mono)" }}>
                      {user.status}
                    </span>
                    {user.role === "ORGANIZER" && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full border hidden md:block uppercase tracking-wider font-bold" style={{ color: verColors[user.verificationStatus] || "#8ab4d4", borderColor: `${verColors[user.verificationStatus]}30`, background: `${verColors[user.verificationStatus]}10`, fontFamily: "var(--font-mono)" }}>
                        {user.verificationStatus || "PENDING"}
                      </span>
                    )}
                    <span className="text-[10px] text-[#1a3a6b] hidden md:block flex-shrink-0" style={{ fontFamily: "var(--font-mono)" }}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                    </span>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;
