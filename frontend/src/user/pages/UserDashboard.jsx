// src/user/pages/UserDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, User, ArrowRight, Building2, FolderKanban,
  BarChart3, Eye, Crown, Shield, Users, Zap
} from "lucide-react";
import UserLayout from "../components/UserLayout";
import { useUserApi } from "../hooks/useUserApi";
import { useAuth } from "../../hooks/useAuth";

// Role config — kya dekh sakta hai
const ROLE_ACCESS = {
  OWNER:  { color: "#f43f8e", label: "Owner",  canViewAnalytics: true,  canViewProjects: true,  canViewMembers: true  },
  ADMIN:  { color: "#a855f7", label: "Admin",  canViewAnalytics: true,  canViewProjects: true,  canViewMembers: true  },
  MEMBER: { color: "#00e5ff", label: "Member", canViewAnalytics: true,  canViewProjects: true,  canViewMembers: true  },
  VIEWER: { color: "#10d990", label: "Viewer", canViewAnalytics: false, canViewProjects: false, canViewMembers: false },
};

const RoleBadge = ({ role }) => {
  const cfg = ROLE_ACCESS[role] || { color: "#8ab4d4", label: role };
  return (
    <span className="text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold"
      style={{ color: cfg.color, borderColor: `${cfg.color}30`, background: `${cfg.color}10`, fontFamily: "var(--font-mono)" }}>
      {cfg.label}
    </span>
  );
};

// Workspace card with role-based features
const WorkspaceCard = ({ membership, projects, i }) => {
  const ws   = membership.workspaceId || membership;
  const role = membership.role || "MEMBER";
  const cfg  = ROLE_ACCESS[role] || ROLE_ACCESS.MEMBER;

  // Projects belonging to this workspace
  const wsProjects = projects.filter(p =>
    (p.workspaceId?._id || p.workspaceId) === (ws._id || ws)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.08 }}
      className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden hover:border-[#00e5ff22] transition-all"
      style={{ boxShadow: "0 4px 24px #00000055" }}>

      {/* Top accent by role color */}
      <div className="h-[2px]" style={{ background: `linear-gradient(90deg,${cfg.color},transparent)` }} />

      <div className="p-5">
        {/* Workspace header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-[#020408] flex-shrink-0"
              style={{ background: `linear-gradient(135deg,${cfg.color},#10d990)`, fontFamily: "var(--font-display)" }}>
              {ws.name?.charAt(0) || "W"}
            </div>
            <div>
              <p className="text-sm font-black text-[#e8f4ff]">{ws.name || "Workspace"}</p>
              <p className="text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                {ws.createdAt ? new Date(ws.createdAt).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>
          <RoleBadge role={role} />
        </div>

        {/* Access info */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-2.5 rounded-xl bg-[#04080f] border border-[#1a2a4a] text-center">
            <p className="text-lg font-black text-[#e8f4ff]" style={{ fontFamily: "var(--font-display)" }}>
              {wsProjects.length}
            </p>
            <p className="text-[9px] text-[#3d6080] uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)" }}>Projects</p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#04080f] border border-[#1a2a4a] text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider mt-1" style={{ color: cfg.color, fontFamily: "var(--font-mono)" }}>
              {cfg.label}
            </p>
            <p className="text-[9px] text-[#3d6080] uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)" }}>Your Role</p>
          </div>
        </div>

        {/* Role-based access buttons */}
        <div className="space-y-2">
          {/* Projects — OWNER, ADMIN, MEMBER can see */}
          {cfg.canViewProjects && wsProjects.length > 0 ? (
            <div>
              <p className="text-[9px] text-[#3d6080] uppercase tracking-widest mb-1.5" style={{ fontFamily: "var(--font-mono)" }}>Projects</p>
              <div className="space-y-1.5">
                {wsProjects.slice(0, 3).map(proj => (
                  <Link key={proj._id}
                    to={`/dashboard/workspace/${ws._id}/project/${proj._id}`}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#04080f] border border-[#1a2a4a] hover:border-[#00e5ff33] hover:bg-[#00e5ff05] transition-all group">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#00e5ff] to-[#10d990] flex items-center justify-center text-[9px] font-black text-[#020408] flex-shrink-0"
                      style={{ fontFamily: "var(--font-display)" }}>
                      {proj.name?.charAt(0)}
                    </div>
                    <span className="text-[11px] text-[#8ab4d4] font-bold truncate flex-1 group-hover:text-[#e8f4ff] transition-colors">
                      {proj.name}
                    </span>
                    {cfg.canViewAnalytics && (
                      <BarChart3 className="w-3.5 h-3.5 text-[#3d6080] group-hover:text-[#00e5ff] transition-colors flex-shrink-0" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ) : cfg.canViewProjects && wsProjects.length === 0 ? (
            <div className="p-2.5 rounded-xl bg-[#04080f] border border-[#1a2a4a] text-center">
              <p className="text-[10px] text-[#1a3a6b]" style={{ fontFamily: "var(--font-mono)" }}>No projects yet</p>
            </div>
          ) : (
            // VIEWER — limited access
            <div className="p-3 rounded-xl border border-[#f59e0b20] bg-[#f59e0b08] flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-[#f59e0b] flex-shrink-0" />
              <p className="text-[10px] text-[#f59e0b]" style={{ fontFamily: "var(--font-mono)" }}>
                Viewer role — limited access
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const UserDashboard = () => {
  const { getNotifications, getMyWorkspaces, getProjects, loading } = useUserApi();
  const { user } = useAuth();
  const [notifs, setNotifs]         = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [projects, setProjects]     = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [n, ws, proj] = await Promise.all([
          getNotifications(),
          getMyWorkspaces(),
          getProjects(),
        ]);
        setNotifs(n?.data || []);
        // getMyWorkspaces returns workspace objects — we need memberships with roles
        // So fetch memberships separately
        setMemberships(ws?.data || []);
        setProjects(proj?.data || []);
      } catch {}
    };
    load();
  }, []);

  const unread = notifs.filter(n => !n.readBy?.includes(user?._id));

  return (
    <UserLayout>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px flex-1 bg-gradient-to-r from-[#00e5ff33] to-transparent" />
            <span className="text-[10px] text-[#00e5ff] uppercase tracking-[0.3em]"
              style={{ fontFamily: "var(--font-mono)" }}>User / Overview</span>
          </div>
          <h1 className="text-3xl font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>
            Hello, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-[#3d6080] mt-1" style={{ fontFamily: "var(--font-mono)" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Building2,    label: "Workspaces", value: memberships.length, color: "#00e5ff", to: "/dashboard/workspaces" },
            { icon: FolderKanban, label: "Projects",   value: projects.length,   color: "#10d990", to: "/dashboard/workspaces" },
            { icon: Bell,         label: "Unread",     value: unread.length,     color: "#f59e0b", to: "/dashboard/notifications" },
            { icon: User,         label: "Profile",    value: "Edit",            color: "#a855f7", to: "/dashboard/profile" },
          ].map(({ icon: Icon, label, value, color, to }) => (
            <Link key={label} to={to}>
              <motion.div whileHover={{ y: -3, borderColor: `${color}33` }}
                className="relative rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5 overflow-hidden transition-all"
                style={{ boxShadow: "0 4px 24px #00000055" }}>
                <div className="absolute top-0 inset-x-0 h-[1.5px] opacity-60"
                  style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <p className="text-xl font-black text-[#e8f4ff]" style={{ fontFamily: "var(--font-display)" }}>{value}</p>
                <p className="text-[10px] text-[#3d6080] uppercase tracking-widest mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>{label}</p>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Workspaces — 2/3 width */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] text-[#00e5ff] uppercase tracking-widest mb-0.5" style={{ fontFamily: "var(--font-mono)" }}>
                  My Access
                </p>
                <h2 className="text-base font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>
                  Workspaces
                </h2>
              </div>
              <Link to="/dashboard/workspaces"
                className="flex items-center gap-1 text-[10px] text-[#3d6080] hover:text-[#00e5ff] transition-colors"
                style={{ fontFamily: "var(--font-mono)" }}>
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loading && memberships.length === 0 ? (
              <div className="flex justify-center py-12">
                <motion.div className="w-8 h-8 rounded-full border-2 border-[#00e5ff33] border-t-[#00e5ff]"
                  animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
              </div>
            ) : memberships.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-8 text-center"
                style={{ boxShadow: "0 4px 24px #00000055" }}>
                <Building2 className="w-10 h-10 text-[#1a3a6b] mx-auto mb-3" />
                <p className="text-sm font-bold text-[#3d6080] mb-1">No workspaces yet</p>
                <p className="text-[11px] text-[#1a3a6b]" style={{ fontFamily: "var(--font-mono)" }}>
                  Ask an organizer to invite you to their workspace.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {memberships.slice(0, 4).map((m, i) => (
                  <WorkspaceCard key={m._id || i} membership={m} projects={projects} i={i} />
                ))}
              </div>
            )}
          </div>

          {/* Notifications — 1/3 width */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] text-[#00e5ff] uppercase tracking-widest mb-0.5" style={{ fontFamily: "var(--font-mono)" }}>Latest</p>
                <h2 className="text-base font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>Notifications</h2>
              </div>
              {unread.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold text-[#020408]"
                  style={{ background: "#00e5ff", fontFamily: "var(--font-mono)" }}>{unread.length}</span>
              )}
            </div>

            <div className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden"
              style={{ boxShadow: "0 4px 24px #00000055" }}>
              {notifs.length === 0 ? (
                <div className="text-center py-10">
                  <Bell className="w-8 h-8 text-[#1a3a6b] mx-auto mb-2" />
                  <p className="text-[11px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>No notifications</p>
                </div>
              ) : (
                notifs.slice(0, 6).map((n, i) => {
                  const isUnread = !n.readBy?.includes(user?._id);
                  return (
                    <motion.div key={n._id}
                      initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-[#1a2a4a]/50 last:border-0 ${isUnread ? "bg-[#00e5ff04]" : ""}`}>
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${isUnread ? "bg-[#00e5ff]" : "bg-[#1a2a4a]"}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold truncate ${isUnread ? "text-[#e8f4ff]" : "text-[#3d6080]"}`}>{n.title}</p>
                        <p className="text-[10px] text-[#3d6080] truncate" style={{ fontFamily: "var(--font-mono)" }}>{n.message}</p>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <Link to="/dashboard/notifications"
                className="flex items-center justify-center gap-2 px-4 py-3 text-[10px] text-[#3d6080] hover:text-[#00e5ff] transition-colors border-t border-[#1a2a4a]"
                style={{ fontFamily: "var(--font-mono)" }}>
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserDashboard;