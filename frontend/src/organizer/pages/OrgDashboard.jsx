// src/organizer/pages/OrgDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, FolderKanban, Users, Bell, ArrowRight, CheckCircle2, Clock, AlertCircle, Zap } from "lucide-react";
import OrgLayout from "../components/OrgLayout";
import { useOrgApi } from "../hooks/useOrgApi";
import { useAuth } from "../../hooks/useAuth";

const StatCard = ({ icon: Icon, label, value, color, to, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="relative rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5 overflow-hidden group hover:border-[#10d99033] transition-all duration-300"
    style={{ boxShadow: "0 4px 24px #00000055" }}>
    <div className="absolute top-0 inset-x-0 h-[1.5px] opacity-60"
      style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{ background: `radial-gradient(circle at 80% 20%, ${color}0d 0%, transparent 60%)` }} />
    <div className="relative">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <p className="text-2xl font-black text-[#e8f4ff] mb-1" style={{ fontFamily: "var(--font-display)" }}>{value ?? "—"}</p>
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-[#3d6080] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>{label}</p>
        {to && (
          <Link to={to} className="text-[10px] text-[#3d6080] hover:text-[#10d990] transition-colors flex items-center gap-1"
            style={{ fontFamily: "var(--font-mono)" }}>
            View <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  </motion.div>
);

const OrgDashboard = () => {
  const { getMyWorkspaces, getProjects, getNotifications, loading } = useOrgApi();
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [projects, setProjects]     = useState([]);
  const [notifs, setNotifs]         = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [ws, proj, n] = await Promise.all([
          getMyWorkspaces(), getProjects(), getNotifications()
        ]);
        setWorkspaces(ws?.data || []);
        setProjects(proj?.data || []);
        setNotifs(n?.data || []);
      } catch {}
    };
    load();
  }, []);

  const isVerified = user?.verificationStatus === "VERIFIED";
  const unread = notifs.filter(n => !n.readBy?.includes(user?._id));

  return (
    <OrgLayout>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px flex-1 bg-gradient-to-r from-[#10d99033] to-transparent" />
            <span className="text-[10px] text-[#10d990] uppercase tracking-[0.3em]"
              style={{ fontFamily: "var(--font-mono)" }}>Organizer / Overview</span>
          </div>
          <h1 className="text-3xl font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>
            Welcome, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-sm text-[#3d6080] mt-1" style={{ fontFamily: "var(--font-mono)" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </motion.div>

        {/* Verification Banner */}
        {!isVerified && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl border flex items-start gap-4"
            style={{
              borderColor: user?.verificationStatus === "REJECTED" ? "#f43f8e30" : "#f59e0b30",
              background: user?.verificationStatus === "REJECTED" ? "#f43f8e08" : "#f59e0b08",
            }}>
            {user?.verificationStatus === "REJECTED"
              ? <AlertCircle className="w-5 h-5 text-[#f43f8e] flex-shrink-0 mt-0.5" />
              : <Clock className="w-5 h-5 text-[#f59e0b] flex-shrink-0 mt-0.5" />
            }
            <div>
              <p className="text-sm font-bold mb-0.5"
                style={{ color: user?.verificationStatus === "REJECTED" ? "#f43f8e" : "#f59e0b" }}>
                {user?.verificationStatus === "REJECTED" ? "Verification Rejected" : "Verification Pending"}
              </p>
              <p className="text-xs text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                {user?.verificationStatus === "REJECTED"
                  ? "Your organization verification was rejected. Contact admin for details."
                  : "Your organization is under review. Some features like creating workspaces require verification."
                }
              </p>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Building2}     label="My Workspaces"  value={workspaces.length} color="#10d990" to="/organizer-dashboard/workspaces" delay={0} />
          <StatCard icon={FolderKanban}  label="Projects"       value={projects.length}   color="#00e5ff" to="/organizer-dashboard/projects"   delay={0.07} />
          <StatCard icon={Bell}          label="Unread Notifs"  value={unread.length}     color="#f59e0b" to="/organizer-dashboard/notifications" delay={0.14} />
          <StatCard icon={Users}         label="Team Members"   value={"—"}               color="#a855f7" to="/organizer-dashboard/members"    delay={0.21} />
        </div>

        {/* Workspaces + Quick actions grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Workspaces */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden"
            style={{ boxShadow: "0 4px 24px #00000055" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a2a4a]">
              <div>
                <p className="text-[10px] text-[#10d990] uppercase tracking-widest mb-0.5" style={{ fontFamily: "var(--font-mono)" }}>My</p>
                <h2 className="text-sm font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>Workspaces</h2>
              </div>
              <Link to="/organizer-dashboard/workspaces"
                className="flex items-center gap-1 text-[10px] text-[#3d6080] hover:text-[#10d990] transition-colors"
                style={{ fontFamily: "var(--font-mono)" }}>
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-3">
              {loading && workspaces.length === 0 ? (
                <div className="flex justify-center py-8">
                  <motion.div className="w-6 h-6 rounded-full border-2 border-[#10d99033] border-t-[#10d990]"
                    animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
                </div>
              ) : workspaces.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="w-8 h-8 text-[#1a3a6b] mx-auto mb-2" />
                  <p className="text-[11px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                    {isVerified ? "No workspaces yet" : "Requires verification"}
                  </p>
                  {isVerified && (
                    <Link to="/organizer-dashboard/workspaces"
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#10d990] text-[#020408] text-[11px] font-bold uppercase tracking-wider"
                      style={{ fontFamily: "var(--font-mono)" }}>
                      <Zap className="w-3 h-3" /> Create First
                    </Link>
                  )}
                </div>
              ) : (
                workspaces.slice(0, 4).map((ws, i) => (
                  <motion.div key={ws._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#ffffff04] transition-colors border-b border-[#1a2a4a]/40 last:border-0">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#10d990] to-[#00e5ff] flex items-center justify-center text-[11px] font-black text-[#020408] flex-shrink-0"
                      style={{ fontFamily: "var(--font-display)" }}>
                      {ws.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#e8f4ff] truncate">{ws.name}</p>
                      <p className="text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                        {ws.createdAt ? new Date(ws.createdAt).toLocaleDateString() : "—"}
                      </p>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full border"
                      style={{ color: ws.status === "ACTIVE" ? "#10d990" : "#f59e0b", borderColor: ws.status === "ACTIVE" ? "#10d99030" : "#f59e0b30", background: ws.status === "ACTIVE" ? "#10d99010" : "#f59e0b10", fontFamily: "var(--font-mono)" }}>
                      {ws.status || "ACTIVE"}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Recent notifications */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden"
            style={{ boxShadow: "0 4px 24px #00000055" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a2a4a]">
              <div>
                <p className="text-[10px] text-[#10d990] uppercase tracking-widest mb-0.5" style={{ fontFamily: "var(--font-mono)" }}>Latest</p>
                <h2 className="text-sm font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>Notifications</h2>
              </div>
              {unread.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f59e0b15] border border-[#f59e0b30] text-[#f59e0b] font-bold"
                  style={{ fontFamily: "var(--font-mono)" }}>{unread.length} new</span>
              )}
            </div>
            <div className="p-3">
              {notifs.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-8 h-8 text-[#1a3a6b] mx-auto mb-2" />
                  <p className="text-[11px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>No notifications</p>
                </div>
              ) : (
                notifs.slice(0, 5).map((n, i) => {
                  const isUnread = !n.readBy?.includes(user?._id);
                  return (
                    <motion.div key={n._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-[#ffffff04] transition-colors border-b border-[#1a2a4a]/40 last:border-0">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${isUnread ? "bg-[#10d990]" : "bg-[#1a3a6b]"}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold truncate ${isUnread ? "text-[#e8f4ff]" : "text-[#3d6080]"}`}>{n.title}</p>
                        <p className="text-[10px] text-[#3d6080] truncate" style={{ fontFamily: "var(--font-mono)" }}>{n.message}</p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </OrgLayout>
  );
};

export default OrgDashboard;