import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bell,
  User,
  ArrowRight,
  Building2,
  FolderKanban,
  BarChart3,
  Eye,
  Users,
  Zap,
  Target,
  MousePointer,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import UserLayout from "../components/UserLayout";
import { useUserApi } from "../hooks/useUserApi";
import { useAuth } from "../../hooks/useAuth";

const ROLE_ACCESS = {
  OWNER: { color: "#f43f8e", label: "Owner", canViewAnalytics: true, canViewProjects: true, canViewMembers: true },
  ADMIN: { color: "#a855f7", label: "Admin", canViewAnalytics: true, canViewProjects: true, canViewMembers: true },
  MEMBER: { color: "#00e5ff", label: "Member", canViewAnalytics: true, canViewProjects: true, canViewMembers: true },
  VIEWER: { color: "#10d990", label: "Viewer", canViewAnalytics: false, canViewProjects: false, canViewMembers: false },
};

const getJourneySteps = (categoryKey = "general") => {
  if (categoryKey === "edtech") {
    return [
      { key: "page_view", label: "Page View" },
      { key: "exam_start", label: "Exam Start" },
      { key: "question_view", label: "Question View" },
      { key: "question_retry", label: "Retry" },
      { key: "exam_complete", label: "Exam Complete" },
    ];
  }

  if (categoryKey === "saas") {
    return [
      { key: "page_view", label: "Page View" },
      { key: "sign_up", label: "Sign Up" },
      { key: "workspace_created", label: "Workspace" },
      { key: "invite_sent", label: "Invite" },
      { key: "subscription_started", label: "Subscription" },
    ];
  }

  return [
    { key: "page_view", label: "Page View" },
    { key: "sign_up", label: "Sign Up" },
    { key: "add_to_cart", label: "Add to Cart" },
    { key: "checkout", label: "Checkout" },
    { key: "purchase", label: "Purchase" },
  ];
};

const RoleBadge = ({ role }) => {
  const cfg = ROLE_ACCESS[role] || { color: "#8ab4d4", label: role };
  return (
    <span className="text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold" style={{ color: cfg.color, borderColor: `${cfg.color}30`, background: `${cfg.color}10`, fontFamily: "var(--font-mono)" }}>
      {cfg.label}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, color, to }) => (
  <Link to={to}>
    <motion.div whileHover={{ y: -3, borderColor: `${color}33` }} className="relative rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5 overflow-hidden transition-all" style={{ boxShadow: "0 4px 24px #00000055" }}>
      <div className="absolute top-0 inset-x-0 h-[1.5px] opacity-60" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <p className="text-xl font-black text-[#e8f4ff]" style={{ fontFamily: "var(--font-display)" }}>
        {value}
      </p>
      <p className="text-[10px] text-[#3d6080] uppercase tracking-widest mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
        {label}
      </p>
    </motion.div>
  </Link>
);

const WorkspaceCard = ({ membership, projects, index }) => {
  const workspace = membership.workspaceId || membership;
  const role = membership.role || "MEMBER";
  const cfg = ROLE_ACCESS[role] || ROLE_ACCESS.MEMBER;
  const workspaceProjects = projects.filter((project) => (project.workspaceId?._id || project.workspaceId) === (workspace._id || workspace));

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden hover:border-[#00e5ff22] transition-all" style={{ boxShadow: "0 4px 24px #00000055" }}>
      <div className="h-[2px]" style={{ background: `linear-gradient(90deg,${cfg.color},transparent)` }} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-[#020408] flex-shrink-0" style={{ background: `linear-gradient(135deg,${cfg.color},#10d990)`, fontFamily: "var(--font-display)" }}>
              {workspace.name?.charAt(0) || "W"}
            </div>
            <div>
              <p className="text-sm font-black text-[#e8f4ff]">{workspace.name || "Workspace"}</p>
              <p className="text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                {workspace.createdAt ? new Date(workspace.createdAt).toLocaleDateString() : "-"}
              </p>
            </div>
          </div>
          <RoleBadge role={role} />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-2.5 rounded-xl bg-[#04080f] border border-[#1a2a4a] text-center">
            <p className="text-lg font-black text-[#e8f4ff]" style={{ fontFamily: "var(--font-display)" }}>
              {workspaceProjects.length}
            </p>
            <p className="text-[9px] text-[#3d6080] uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)" }}>
              Projects
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#04080f] border border-[#1a2a4a] text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider mt-1" style={{ color: cfg.color, fontFamily: "var(--font-mono)" }}>
              {cfg.label}
            </p>
            <p className="text-[9px] text-[#3d6080] uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)" }}>
              Your Role
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {cfg.canViewProjects && workspaceProjects.length > 0 ? (
            <div>
              <p className="text-[9px] text-[#3d6080] uppercase tracking-widest mb-1.5" style={{ fontFamily: "var(--font-mono)" }}>
                Projects
              </p>
              <div className="space-y-1.5">
                {workspaceProjects.slice(0, 3).map((project) => (
                  <Link key={project._id} to={`/dashboard/workspace/${workspace._id}/project/${project._id}`} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#04080f] border border-[#1a2a4a] hover:border-[#00e5ff33] hover:bg-[#00e5ff05] transition-all group">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#00e5ff] to-[#10d990] flex items-center justify-center text-[9px] font-black text-[#020408] flex-shrink-0" style={{ fontFamily: "var(--font-display)" }}>
                      {project.name?.charAt(0)}
                    </div>
                    <span className="text-[11px] text-[#8ab4d4] font-bold truncate flex-1 group-hover:text-[#e8f4ff] transition-colors">{project.name}</span>
                    {cfg.canViewAnalytics && <BarChart3 className="w-3.5 h-3.5 text-[#3d6080] group-hover:text-[#00e5ff] transition-colors flex-shrink-0" />}
                  </Link>
                ))}
              </div>
            </div>
          ) : cfg.canViewProjects && workspaceProjects.length === 0 ? (
            <div className="p-2.5 rounded-xl bg-[#04080f] border border-[#1a2a4a] text-center">
              <p className="text-[10px] text-[#1a3a6b]" style={{ fontFamily: "var(--font-mono)" }}>
                No projects yet
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-[#f59e0b20] bg-[#f59e0b08] flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-[#f59e0b] flex-shrink-0" />
              <p className="text-[10px] text-[#f59e0b]" style={{ fontFamily: "var(--font-mono)" }}>
                Viewer role - limited access
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const FunnelRow = ({ label, count, previous }) => {
  const percentage = previous > 0 ? Math.round((count / previous) * 100) : 100;
  const dropped = previous > count ? previous - count : 0;

  return (
    <div className="rounded-xl border border-[#1a2a4a] bg-[#04080f] p-3">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] text-[#8ab4d4] uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)" }}>
          {label}
        </p>
        <span className="text-[10px] text-[#00e5ff]" style={{ fontFamily: "var(--font-mono)" }}>
          {percentage}%
        </span>
      </div>
      <p className="text-lg font-black text-[#e8f4ff]" style={{ fontFamily: "var(--font-display)" }}>
        {count.toLocaleString()}
      </p>
      {dropped > 0 && (
        <p className="text-[10px] text-[#f43f8e] mt-1" style={{ fontFamily: "var(--font-mono)" }}>
          -{dropped.toLocaleString()} dropped
        </p>
      )}
    </div>
  );
};

const UserDashboard = () => {
  const { getNotifications, getMyWorkspaces, getProjects, getAnalyticsOverview, loading } = useUserApi();
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [projects, setProjects] = useState([]);
  const [spotlight, setSpotlight] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [notificationsRes, workspacesRes, projectsRes] = await Promise.all([getNotifications(), getMyWorkspaces(), getProjects()]);
        const nextNotifications = notificationsRes?.data || [];
        const nextMemberships = workspacesRes?.data || [];
        const nextProjects = projectsRes?.data || [];

        setNotifs(nextNotifications);
        setMemberships(nextMemberships);
        setProjects(nextProjects);

        if (nextProjects.length > 0) {
          const to = new Date().toISOString();
          const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          const overviewRes = await getAnalyticsOverview(nextProjects[0]._id, from, to);
          setSpotlight({
            project: nextProjects[0],
            overview: overviewRes?.data || null,
          });
        }
      } catch {}
    };
    load();
  }, [getAnalyticsOverview, getMyWorkspaces, getNotifications, getProjects]);

  const unread = notifs.filter((notification) => !notification.readBy?.includes(user?._id));

  const spotlightEvents = useMemo(() => {
    const steps = getJourneySteps(spotlight?.overview?.category?.key);
    const map = Object.fromEntries((spotlight?.overview?.topEvents || []).map((event) => [event._id, event.count]));
    return steps.map((step, index) => ({
      ...step,
      count: map[step.key] || 0,
      previous: index === 0 ? map[step.key] || 0 : map[steps[index - 1].key] || 0,
    }));
  }, [spotlight]);

  const topEvents = spotlight?.overview?.topEvents?.slice(0, 5) || [];
  const funnelBase = spotlightEvents[0]?.count || 0;
  const funnelEnd = spotlightEvents[spotlightEvents.length - 1]?.count || 0;
  const overallConversion = funnelBase > 0 ? Math.round((funnelEnd / funnelBase) * 100) : 0;
  const biggestDrop = useMemo(() => {
    let best = null;
    spotlightEvents.forEach((step, index) => {
      if (index === 0) return;
      const prev = spotlightEvents[index - 1].count;
      if (!prev) return;
      const loss = prev - step.count;
      const rate = Math.round((loss / prev) * 100);
      if (!best || rate > best.rate) {
        best = {
          label: `${spotlightEvents[index - 1].label} -> ${step.label}`,
          rate,
        };
      }
    });
    return best;
  }, [spotlightEvents]);

  return (
    <UserLayout>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px flex-1 bg-gradient-to-r from-[#00e5ff33] to-transparent" />
            <span className="text-[10px] text-[#00e5ff] uppercase tracking-[0.3em]" style={{ fontFamily: "var(--font-mono)" }}>
              User / Overview
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>
            Hello, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-sm text-[#3d6080] mt-1" style={{ fontFamily: "var(--font-mono)" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Building2} label="Workspaces" value={memberships.length} color="#00e5ff" to="/dashboard/workspaces" />
          <StatCard icon={FolderKanban} label="Projects" value={projects.length} color="#10d990" to="/dashboard/workspaces" />
          <StatCard icon={Bell} label="Unread" value={unread.length} color="#f59e0b" to="/dashboard/notifications" />
          <StatCard icon={User} label="Profile" value="Edit" color="#a855f7" to="/dashboard/profile" />
        </motion.div>

        {spotlight?.overview && (
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5 mb-8" style={{ boxShadow: "0 4px 24px #00000055" }}>
            <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
              <div>
                <p className="text-[10px] text-[#10d990] uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-mono)" }}>
                  Analytics Spotlight
                </p>
                <h2 className="text-base font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>
                  {spotlight.project?.name || "Primary Project"} {spotlight?.overview?.category?.journeysLabel || "Journey"} Snapshot
                </h2>
                <p className="text-[10px] text-[#3d6080] mt-1" style={{ fontFamily: "var(--font-mono)" }}>
                  Detected category: {spotlight?.overview?.category?.label || "General Web App"}
                </p>
              </div>
              <Link to={`/dashboard/workspace/${spotlight.project?.workspaceId?._id || spotlight.project?.workspaceId}/project/${spotlight.project?._id}`} className="flex items-center gap-1 text-[10px] text-[#3d6080] hover:text-[#00e5ff] transition-colors" style={{ fontFamily: "var(--font-mono)" }}>
                Open analytics <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid xl:grid-cols-[1.6fr_1fr] gap-5">
              <div>
                <div className="grid sm:grid-cols-5 gap-3 mb-4">
                  {spotlightEvents.map((step, index) => (
                    <FunnelRow key={step.key} label={step.label} count={step.count} previous={index === 0 ? step.count : spotlightEvents[index - 1].count} />
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#00e5ff20] bg-[#00e5ff08] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-[#00e5ff]" />
                      <p className="text-[10px] text-[#00e5ff] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                        Overall Conversion
                      </p>
                    </div>
                    <p className="text-2xl font-black text-[#e8f4ff]" style={{ fontFamily: "var(--font-display)" }}>
                      {overallConversion}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#f43f8e20] bg-[#f43f8e08] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-[#f43f8e]" />
                      <p className="text-[10px] text-[#f43f8e] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                        Biggest Drop
                      </p>
                    </div>
                    <p className="text-sm font-black text-[#e8f4ff]">{biggestDrop ? `${biggestDrop.label} (${biggestDrop.rate}% loss)` : "Not enough data"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-[#1a2a4a] bg-[#04080f] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MousePointer className="w-4 h-4 text-[#10d990]" />
                    <p className="text-[10px] text-[#10d990] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                      Top Events
                    </p>
                  </div>
                  <div className="space-y-2">
                    {topEvents.map((event) => (
                      <div key={event._id} className="flex items-center justify-between text-[11px]">
                        <span className="text-[#8ab4d4]" style={{ fontFamily: "var(--font-mono)" }}>
                          {event._id}
                        </span>
                        <span className="text-[#e8f4ff] font-bold">{event.count.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-[#10d99020] bg-[#10d99008] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10d990]" />
                    <p className="text-[10px] text-[#10d990] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                      Strong Signal
                    </p>
                  </div>
                  <p className="text-[11px] text-[#8ab4d4] leading-relaxed" style={{ fontFamily: "var(--font-mono)" }}>
                    {spotlightEvents[3]?.count > 0 && spotlightEvents[4]?.count > 0
                      ? `Checkout to purchase conversion looks healthy at ${Math.round((spotlightEvents[4].count / spotlightEvents[3].count) * 100)}%.`
                      : "Purchase-stage conversion insight will appear once checkout and purchase events are flowing."}
                  </p>
                </div>

                <div className="rounded-xl border border-[#f59e0b20] bg-[#f59e0b08] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-[#f59e0b]" />
                    <p className="text-[10px] text-[#f59e0b] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                      Recommended Action
                    </p>
                  </div>
                  <p className="text-[11px] text-[#8ab4d4] leading-relaxed" style={{ fontFamily: "var(--font-mono)" }}>
                    Focus testing on the step with the highest loss, improve the CTA and friction points, then retarget users who exited early in the journey.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <Link to="/dashboard/workspaces" className="flex items-center gap-1 text-[10px] text-[#3d6080] hover:text-[#00e5ff] transition-colors" style={{ fontFamily: "var(--font-mono)" }}>
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loading && memberships.length === 0 ? (
              <div className="flex justify-center py-12">
                <motion.div className="w-8 h-8 rounded-full border-2 border-[#00e5ff33] border-t-[#00e5ff]" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
              </div>
            ) : memberships.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-8 text-center" style={{ boxShadow: "0 4px 24px #00000055" }}>
                <Building2 className="w-10 h-10 text-[#1a3a6b] mx-auto mb-3" />
                <p className="text-sm font-bold text-[#3d6080] mb-1">No workspaces yet</p>
                <p className="text-[11px] text-[#1a3a6b]" style={{ fontFamily: "var(--font-mono)" }}>
                  Ask an organizer to invite you to their workspace.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {memberships.slice(0, 4).map((membership, index) => (
                  <WorkspaceCard key={membership._id || index} membership={membership} projects={projects} index={index} />
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] text-[#00e5ff] uppercase tracking-widest mb-0.5" style={{ fontFamily: "var(--font-mono)" }}>
                  Latest
                </p>
                <h2 className="text-base font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>
                  Notifications
                </h2>
              </div>
              {unread.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold text-[#020408]" style={{ background: "#00e5ff", fontFamily: "var(--font-mono)" }}>
                  {unread.length}
                </span>
              )}
            </div>

            <div className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden" style={{ boxShadow: "0 4px 24px #00000055" }}>
              {notifs.length === 0 ? (
                <div className="text-center py-10">
                  <Bell className="w-8 h-8 text-[#1a3a6b] mx-auto mb-2" />
                  <p className="text-[11px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                    No notifications
                  </p>
                </div>
              ) : (
                notifs.slice(0, 6).map((notification, index) => {
                  const isUnread = !notification.readBy?.includes(user?._id);
                  return (
                    <motion.div key={notification._id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }} className={`flex items-start gap-3 px-4 py-3 border-b border-[#1a2a4a]/50 last:border-0 ${isUnread ? "bg-[#00e5ff04]" : ""}`}>
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${isUnread ? "bg-[#00e5ff]" : "bg-[#1a2a4a]"}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold truncate ${isUnread ? "text-[#e8f4ff]" : "text-[#3d6080]"}`}>{notification.title}</p>
                        <p className="text-[10px] text-[#3d6080] truncate" style={{ fontFamily: "var(--font-mono)" }}>
                          {notification.message}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <Link to="/dashboard/notifications" className="flex items-center justify-center gap-2 px-4 py-3 text-[10px] text-[#3d6080] hover:text-[#00e5ff] transition-colors border-t border-[#1a2a4a]" style={{ fontFamily: "var(--font-mono)" }}>
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
