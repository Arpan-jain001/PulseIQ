// src/admin/pages/AdminOverview.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Building2, Bell, Activity, TrendingUp, ShieldCheck, Zap } from "lucide-react";
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
    <div className="absolute top-0 inset-x-0 h-[1.5px] opacity-60"
      style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{ background: `radial-gradient(circle at 80% 20%, ${color}0d 0%, transparent 60%)` }} />
    <div className="relative">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <p className="text-2xl font-black text-[#e8f4ff] mb-1" style={{ fontFamily: "var(--font-display)" }}>
        {value ?? "—"}
      </p>
      <p className="text-[11px] text-[#3d6080] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
        {label}
      </p>
    </div>
  </motion.div>
);

const UserRow = ({ u, i }) => {
  const roleColors = { SUPER_ADMIN: "#f43f8e", ORGANIZER: "#a855f7", USER: "#00e5ff" };
  const statusColors = { ACTIVE: "#10d990", SUSPENDED: "#f59e0b", BANNED: "#f43f8e" };
  const verColors = { VERIFIED: "#10d990", PENDING: "#f59e0b", REJECTED: "#f43f8e" };
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
      className="flex items-center gap-4 py-3 border-b border-[#1a2a4a] last:border-0 hover:bg-[#ffffff04] px-2 rounded-xl transition-colors">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black text-[#020408] flex-shrink-0"
        style={{ background: roleColors[u.role] || "#00e5ff", fontFamily: "var(--font-display)" }}>
        {u.name?.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-[#e8f4ff] truncate">{u.name}</p>
        <p className="text-[10px] text-[#3d6080] truncate" style={{ fontFamily: "var(--font-mono)" }}>{u.email}</p>
      </div>
      <span className="text-[9px] px-2 py-0.5 rounded-full border hidden sm:block uppercase tracking-wider font-bold"
        style={{ color: roleColors[u.role] || "#00e5ff", borderColor: `${roleColors[u.role]}30`, background: `${roleColors[u.role]}10`, fontFamily: "var(--font-mono)" }}>
        {u.role?.replace("_", " ")}
      </span>
      <span className="text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold"
        style={{ color: statusColors[u.status] || "#8ab4d4", borderColor: `${statusColors[u.status]}30`, background: `${statusColors[u.status]}10`, fontFamily: "var(--font-mono)" }}>
        {u.status}
      </span>
      {u.role === "ORGANIZER" && (
        <span className="text-[9px] px-2 py-0.5 rounded-full border hidden md:block uppercase tracking-wider font-bold"
          style={{ color: verColors[u.verificationStatus] || "#8ab4d4", borderColor: `${verColors[u.verificationStatus]}30`, background: `${verColors[u.verificationStatus]}10`, fontFamily: "var(--font-mono)" }}>
          {u.verificationStatus || "PENDING"}
        </span>
      )}
      <span className="text-[10px] text-[#1a3a6b] hidden md:block flex-shrink-0" style={{ fontFamily: "var(--font-mono)" }}>
        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
      </span>
    </motion.div>
  );
};

const AdminOverview = () => {
  const { getOverview, getUsers, loading } = useAdminApi();
  const [overview, setOverview] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [ov, usersRes] = await Promise.all([getOverview(), getUsers()]);
        setOverview(ov?.data || ov);
        const users = usersRes?.data || (Array.isArray(usersRes) ? usersRes : []);
        setRecentUsers(users.slice(0, 8));
      } catch {}
    };
    load();
  }, []);

  const CARDS = [
    { icon: Users,    label: "Total Users",    value: overview?.users,         color: "#00e5ff" },
    { icon: Building2,label: "Workspaces",     value: overview?.workspaces,    color: "#a855f7" },
    { icon: Bell,     label: "Notifications",  value: overview?.notifications, color: "#f59e0b" },
    { icon: ShieldCheck,label:"Active",        value: recentUsers.filter(u => u.status === "ACTIVE").length, color: "#10d990" },
    { icon: TrendingUp, label:"Organizers",    value: recentUsers.filter(u => u.role === "ORGANIZER").length, color: "#f43f8e" },
    { icon: Activity,   label:"Pending Verify",value: recentUsers.filter(u => u.verificationStatus === "PENDING").length, color: "#f59e0b" },
  ];

  return (
    <AdminLayout>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px flex-1 bg-gradient-to-r from-[#f43f8e33] to-transparent" />
            <span className="text-[10px] text-[#f43f8e] uppercase tracking-[0.3em]" style={{ fontFamily: "var(--font-mono)" }}>
              Admin / Overview
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#e8f4ff] uppercase tracking-wide" style={{ fontFamily: "var(--font-display)" }}>
            Dashboard
          </h1>
          <p className="text-sm text-[#3d6080] mt-1" style={{ fontFamily: "var(--font-mono)" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {CARDS.map((c, i) => <StatCard key={c.label} {...c} delay={i * 0.07} />)}
        </div>

        {/* Recent users */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden"
          style={{ boxShadow: "0 4px 24px #00000055" }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a2a4a]">
            <div>
              <p className="text-[10px] text-[#f43f8e] uppercase tracking-widest mb-0.5" style={{ fontFamily: "var(--font-mono)" }}>
                Latest Registrations
              </p>
              <h2 className="text-sm font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>Recent Users</h2>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#10d99025] bg-[#10d99008]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10d990] animate-pulse" />
              <span className="text-[10px] text-[#10d990] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>Live</span>
            </div>
          </div>
          <div className="px-3 py-2">
            {loading && recentUsers.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <motion.div className="w-8 h-8 rounded-full border-2 border-[#f43f8e33] border-t-[#f43f8e]"
                  animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
              </div>
            ) : recentUsers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[11px] text-[#3d6080] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>No users yet</p>
              </div>
            ) : (
              recentUsers.map((u, i) => <UserRow key={u._id} u={u} i={i} />)
            )}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;