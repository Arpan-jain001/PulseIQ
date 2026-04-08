// src/organizer/pages/OrgDashboard.jsx — Upgraded with AI + Analytics preview
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, FolderKanban, Users, Bell, ArrowRight,
  CheckCircle2, Clock, AlertCircle, Zap, BarChart3,
  TrendingUp, Activity, BrainCircuit, Sparkles,
  Terminal, ArrowUpRight, Target, Globe, MessageSquare
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip
} from "recharts";
import OrgLayout from "../components/OrgLayout";
import { useOrgApi } from "../hooks/useOrgApi";
import { useAuth } from "../../hooks/useAuth";

const BASE = import.meta.env.VITE_BACKEND_API_URL;
const authHdr = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  "Content-Type": "application/json",
});

/* ── Stat Card ── */
const StatCard = ({ icon: Icon, label, value, color, to, delay = 0, sub }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="relative rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5 overflow-hidden group hover:border-opacity-50 transition-all duration-300"
    style={{ boxShadow: "0 4px 24px #00000055", borderColor: "#1a2a4a" }}
    onMouseEnter={e => e.currentTarget.style.borderColor = `${color}33`}
    onMouseLeave={e => e.currentTarget.style.borderColor = "#1a2a4a"}>
    <div className="absolute top-0 inset-x-0 h-[1.5px] opacity-60"
      style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{ background: `radial-gradient(circle at 80% 20%, ${color}0d 0%, transparent 60%)` }} />
    <div className="relative">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <p className="text-2xl font-black text-[#e8f4ff] mb-0.5" style={{ fontFamily: "var(--font-display)" }}>
        {value ?? "—"}
      </p>
      {sub && <p className="text-[9px] mb-1" style={{ color: `${color}aa`, fontFamily: "var(--font-mono)" }}>{sub}</p>}
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

/* ── Mini Sparkline ── */
const Sparkline = ({ data, color }) => (
  <ResponsiveContainer width="100%" height={40}>
    <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
      <defs>
        <linearGradient id={`sg${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.3} />
          <stop offset="95%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
        fill={`url(#sg${color.replace("#","")})`} dot={false} />
    </AreaChart>
  </ResponsiveContainer>
);

/* ── AI Terminal Widget ── */
const AiTerminalWidget = ({ projectId, projectName }) => {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shown, setShown]     = useState(false);

  const load = async () => {
    if (!projectId || loading) return;
    setLoading(true); setShown(true);
    try {
      const from = new Date(Date.now() - 7 * 86400000).toISOString();
      const to   = new Date().toISOString();
      const res  = await fetch(`${BASE}/api/ai/insights`, {
        method: "POST", headers: authHdr(),
        body: JSON.stringify({ projectId, from, to, projectName }),
      });
      const data = await res.json();
      if (data.success) setInsight(data.data);
    } catch {}
    finally { setLoading(false); }
  };

  if (!shown) {
    return (
      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        onClick={load}
        className="w-full rounded-2xl border bg-[#060d18] p-5 relative overflow-hidden text-left group"
        style={{ borderColor: "#a855f720", boxShadow: "0 0 40px #a855f706" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(135deg,#a855f706 0%,transparent 60%)" }} />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#a855f715] border border-[#a855f730] flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-[#a855f7]" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>
              AI Quick Insight
            </p>
            <p className="text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
              Click to analyze {projectName} with Gemini AI
            </p>
          </div>
          <Sparkles className="w-4 h-4 text-[#a855f7] opacity-60 group-hover:opacity-100 transition-opacity" />
        </div>
      </motion.button>
    );
  }

  return (
    <div className="rounded-2xl border bg-[#060d18] overflow-hidden"
      style={{ borderColor: "#a855f720", boxShadow: "0 0 40px #a855f706" }}>
      <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#a855f7,#f43f8e,#00e5ff)" }} />
      <div className="p-5">
        {loading ? (
          <div className="flex items-center gap-3">
            <motion.div className="w-5 h-5 rounded-full border-2 border-[#a855f733] border-t-[#a855f7] flex-shrink-0"
              animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
            <p className="text-[11px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
              Gemini AI analyzing {projectName}...
            </p>
          </div>
        ) : insight ? (
          <div className="space-y-3">
            {/* Health */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                style={{
                  background: `${insight.health_score >= 75 ? "#10d990" : insight.health_score >= 50 ? "#f59e0b" : "#f43f8e"}15`,
                  color: insight.health_score >= 75 ? "#10d990" : insight.health_score >= 50 ? "#f59e0b" : "#f43f8e",
                  fontFamily: "var(--font-display)"
                }}>
                {insight.health_score}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-[#e8f4ff]">{insight.health_label}</p>
                <p className="text-[10px] text-[#3d6080] line-clamp-2" style={{ fontFamily: "var(--font-mono)" }}>
                  {insight.summary}
                </p>
              </div>
            </div>
            {/* Top insight terminal card */}
            {insight.page_insights?.[0] && (
              <div className="rounded-xl border bg-[#04080f] p-3 relative overflow-hidden"
                style={{ borderColor: "#f43f8e18" }}>
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(135deg,#f43f8e06 0%,transparent 50%)" }} />
                <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full border animate-spin"
                  style={{ borderColor: "#f43f8e10", animationDuration: "20s" }} />
                <div className="relative flex items-start gap-2">
                  <Terminal className="w-3.5 h-3.5 text-[#f43f8e] flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[9px] text-[#f43f8e] uppercase tracking-widest mb-1"
                      style={{ fontFamily: "var(--font-mono)" }}>
                      ai_insight → {(insight.page_insights[0].page || "/").slice(0, 20)} → {insight.page_insights[0].priority}
                    </p>
                    <p className="text-[10px] text-[#3d6080] line-clamp-2"
                      style={{ fontFamily: "var(--font-mono)" }}>
                      {insight.page_insights[0].issue}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* Top recommendation */}
            {insight.recommendations?.[0] && (
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#10d99008] border border-[#10d99020]">
                <Target className="w-3.5 h-3.5 text-[#10d990] flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-[#8ab4d4] line-clamp-2" style={{ fontFamily: "var(--font-mono)" }}>
                  {insight.recommendations[0].action}
                </p>
              </div>
            )}
            <Link to="/organizer-dashboard/analytics"
              className="flex items-center gap-1.5 text-[10px] text-[#a855f7] hover:text-[#c084fc] transition-colors"
              style={{ fontFamily: "var(--font-mono)" }}>
              <Sparkles className="w-3 h-3" /> View full AI insights →
            </Link>
          </div>
        ) : (
          <p className="text-[11px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
            Failed to load insights. <button onClick={load} className="text-[#a855f7] underline">Retry</button>
          </p>
        )}
      </div>
    </div>
  );
};

/* ── Main OrgDashboard ── */
const OrgDashboard = () => {
  const { getMyWorkspaces, getProjects, getNotifications, loading } = useOrgApi();
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [projects, setProjects]     = useState([]);
  const [notifs, setNotifs]         = useState([]);
  const [analyticsPreview, setAnalyticsPreview] = useState(null);
  const [dauPreview, setDauPreview] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async () => {
    try {
      const [ws, proj, n] = await Promise.all([
        getMyWorkspaces(), getProjects(), getNotifications()
      ]);
      const wsList = ws?.data || [];
      const pList  = proj?.data || [];
      setWorkspaces(wsList);
      setProjects(pList);
      setNotifs(n?.data || []);
      setLastUpdated(new Date());

      // Load analytics preview for first project
      if (pList.length > 0 && pList[0].sdkVerified) {
        const pid  = pList[0]._id;
        const from = new Date(Date.now() - 7 * 86400000).toISOString();
        const to   = new Date().toISOString();
        try {
          const [ov, dau] = await Promise.all([
            fetch(`${BASE}/api/analytics/overview?projectId=${pid}&from=${from}&to=${to}`, { headers: authHdr() }).then(r => r.json()),
            fetch(`${BASE}/api/analytics/dau?projectId=${pid}&from=${from}&to=${to}`,      { headers: authHdr() }).then(r => r.json()),
          ]);
          setAnalyticsPreview(ov?.data);
          setDauPreview((dau?.data || []).map(d => ({ v: d.activeUsers || 0 })));
        } catch {}
      }
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const timer = setInterval(() => {
      load();
    }, 60000);

    return () => clearInterval(timer);
  }, [load]);

  const isVerified = user?.verificationStatus === "VERIFIED";
  const unread     = notifs.filter(n => !n.readBy?.includes(user?._id));
  const firstVerifiedProj = projects.find(p => p.sdkVerified);
  const weakestProject = [...projects]
    .filter((p) => typeof p.recentHealthScore === "number")
    .sort((a, b) => a.recentHealthScore - b.recentHealthScore)[0];
  const totalEvents = analyticsPreview?.totalEvents ?? 0;
  const uniqueUsers = analyticsPreview?.uniqueUsers ?? 0;
  const dauToday    = analyticsPreview?.dauToday ?? 0;

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
          <div className="flex items-end justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-3xl font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>
                Welcome, {user?.name?.split(" ")[0]}
              </h1>
              <p className="text-sm text-[#3d6080] mt-1" style={{ fontFamily: "var(--font-mono)" }}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </p>
              {lastUpdated && (
                <p className="text-[10px] text-[#1a7f63] mt-1" style={{ fontFamily: "var(--font-mono)" }}>
                  Auto refresh every 60s · last sync {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
            {isVerified && (
              <span className="flex items-center gap-1.5 text-[10px] text-[#10d990] px-3 py-1.5 rounded-full border border-[#10d99030] bg-[#10d99010]"
                style={{ fontFamily: "var(--font-mono)" }}>
                <CheckCircle2 className="w-3 h-3" /> Verified Organization
              </span>
            )}
          </div>
        </motion.div>

        {/* Verification Banner */}
        {!isVerified && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl border flex items-start gap-4"
            style={{
              borderColor: user?.verificationStatus === "REJECTED" ? "#f43f8e30" : "#f59e0b30",
              background:  user?.verificationStatus === "REJECTED" ? "#f43f8e08" : "#f59e0b08",
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
                  : "Your organization is under review. Workspace creation requires verification."
                }
              </p>
            </div>
          </motion.div>
        )}

        {/* Top stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Building2}    label="My Workspaces" value={workspaces.length}          color="#10d990" to="/organizer-dashboard/workspaces"    delay={0} />
          <StatCard icon={FolderKanban} label="Projects"      value={projects.length}            color="#00e5ff" to="/organizer-dashboard/projects"       delay={0.07} />
          <StatCard icon={Bell}         label="Unread Notifs" value={unread.length}              color="#f59e0b" to="/organizer-dashboard/notifications"   delay={0.14} />
          <StatCard icon={Users}        label="SDK Verified"  value={projects.filter(p => p.sdkVerified).length} color="#a855f7" to="/organizer-dashboard/analytics" delay={0.21}
            sub={`${projects.length} total projects`} />
        </div>

        {/* Analytics preview row */}
        {firstVerifiedProj && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { icon: Activity,    label: "Events (7d)",     value: totalEvents.toLocaleString(), color: "#00e5ff" },
              { icon: Users,       label: "Unique Users",    value: uniqueUsers.toLocaleString(),  color: "#10d990" },
              { icon: TrendingUp,  label: "DAU Today",       value: dauToday.toLocaleString(),     color: "#a855f7" },
              { icon: BarChart3,   label: "Bounce Rate",     value: `${analyticsPreview?.bounceRate ?? 0}%`, color: "#f59e0b" },
            ].map(({ icon: Icon, label, value, color }, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 + i * 0.07 }}
                className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-4 relative overflow-hidden"
                style={{ boxShadow: "0 4px 20px #00000044" }}>
                <div className="absolute top-0 inset-x-0 h-[1.5px]"
                  style={{ background: `linear-gradient(90deg,transparent,${color}80,transparent)` }} />
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
                  <p className="text-[9px] text-[#3d6080] uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-mono)" }}>{label}</p>
                </div>
                <p className="text-xl font-black text-[#e8f4ff]" style={{ fontFamily: "var(--font-display)" }}>{value}</p>
                {dauPreview.length > 0 && label === "Events (7d)" && (
                  <div className="mt-2 -mx-1">
                    <Sparkline data={dauPreview} color={color} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Workspaces */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden"
            style={{ boxShadow: "0 4px 24px #00000055" }}>
            <div className="h-[1.5px]" style={{ background: "linear-gradient(90deg,#10d990,transparent)" }} />
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a2a4a]">
              <div>
                <p className="text-[10px] text-[#10d990] uppercase tracking-widest mb-0.5"
                  style={{ fontFamily: "var(--font-mono)" }}>My</p>
                <h2 className="text-sm font-black text-[#e8f4ff] uppercase"
                  style={{ fontFamily: "var(--font-display)" }}>Workspaces</h2>
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

          {/* Projects + SDK status */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden"
            style={{ boxShadow: "0 4px 24px #00000055" }}>
            <div className="h-[1.5px]" style={{ background: "linear-gradient(90deg,#00e5ff,transparent)" }} />
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a2a4a]">
              <div>
                <p className="text-[10px] text-[#00e5ff] uppercase tracking-widest mb-0.5"
                  style={{ fontFamily: "var(--font-mono)" }}>Active</p>
                <h2 className="text-sm font-black text-[#e8f4ff] uppercase"
                  style={{ fontFamily: "var(--font-display)" }}>Projects</h2>
              </div>
              <Link to="/organizer-dashboard/projects"
                className="flex items-center gap-1 text-[10px] text-[#3d6080] hover:text-[#00e5ff] transition-colors"
                style={{ fontFamily: "var(--font-mono)" }}>
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-3">
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <FolderKanban className="w-8 h-8 text-[#1a3a6b] mx-auto mb-2" />
                  <p className="text-[11px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>No projects yet</p>
                </div>
              ) : (
                projects.slice(0, 4).map((proj, i) => {
                  const sdkColor = proj.sdkVerified ? "#10d990" : "#f59e0b";
                  return (
                    <div key={proj._id} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#ffffff04] transition-colors border-b border-[#1a2a4a]/40 last:border-0">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sdkColor }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#e8f4ff] truncate">{proj.name}</p>
                        <p className="text-[9px]" style={{ color: sdkColor, fontFamily: "var(--font-mono)" }}>
                          {proj.sdkVerified ? "✓ SDK Verified" : "⚡ Pending Verification"}
                        </p>
                      </div>
                      <Link to="/organizer-dashboard/analytics"
                        className="text-[9px] text-[#3d6080] hover:text-[#00e5ff] flex items-center gap-0.5 transition-colors"
                        style={{ fontFamily: "var(--font-mono)" }}>
                        <BarChart3 className="w-3 h-3" />
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden"
            style={{ boxShadow: "0 4px 24px #00000055" }}>
            <div className="h-[1.5px]" style={{ background: "linear-gradient(90deg,#f59e0b,transparent)" }} />
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a2a4a]">
              <div>
                <p className="text-[10px] text-[#f59e0b] uppercase tracking-widest mb-0.5"
                  style={{ fontFamily: "var(--font-mono)" }}>Latest</p>
                <h2 className="text-sm font-black text-[#e8f4ff] uppercase"
                  style={{ fontFamily: "var(--font-display)" }}>Notifications</h2>
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
                    <div key={n._id} className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-[#ffffff04] transition-colors border-b border-[#1a2a4a]/40 last:border-0">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${isUnread ? "bg-[#10d990] animate-pulse" : "bg-[#1a3a6b]"}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold truncate ${isUnread ? "text-[#e8f4ff]" : "text-[#3d6080]"}`}>{n.title}</p>
                        <p className="text-[10px] text-[#3d6080] truncate" style={{ fontFamily: "var(--font-mono)" }}>{n.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>

        {/* AI Widget + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">

          {/* AI Terminal */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            {firstVerifiedProj ? (
              <AiTerminalWidget projectId={firstVerifiedProj._id} projectName={firstVerifiedProj.name} />
            ) : (
              <div className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5 flex items-center gap-4"
                style={{ boxShadow: "0 4px 24px #00000055" }}>
                <div className="w-12 h-12 rounded-xl bg-[#a855f715] border border-[#a855f730] flex items-center justify-center flex-shrink-0">
                  <BrainCircuit className="w-6 h-6 text-[#a855f7]" />
                </div>
                <div>
                  <p className="text-xs font-black text-[#e8f4ff] mb-1">AI Insights Available</p>
                  <p className="text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                    Verify your SDK to unlock Gemini AI analytics insights
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52 }}>
            <div className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden"
              style={{ boxShadow: "0 4px 24px #00000055" }}>
              <div className="h-[1.5px]" style={{ background: "linear-gradient(90deg,#f43f8e,#f59e0b,transparent)" }} />
              <div className="px-5 py-4 border-b border-[#1a2a4a]">
                <p className="text-[10px] text-[#f43f8e] uppercase tracking-widest mb-0.5"
                  style={{ fontFamily: "var(--font-mono)" }}>Pulse Engine</p>
                <h2 className="text-sm font-black text-[#e8f4ff] uppercase"
                  style={{ fontFamily: "var(--font-display)" }}>Project Health Radar</h2>
              </div>
              <div className="p-4">
                {weakestProject ? (
                  <div className="rounded-xl border border-[#f43f8e20] bg-[#04080f] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black text-[#e8f4ff]">{weakestProject.name}</p>
                        <p className="text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                          Lowest live score across your projects
                        </p>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl border"
                        style={{
                          color: weakestProject.recentHealthScore >= 70 ? "#10d990" : weakestProject.recentHealthScore >= 40 ? "#f59e0b" : "#f43f8e",
                          borderColor: weakestProject.recentHealthScore >= 70 ? "#10d99030" : weakestProject.recentHealthScore >= 40 ? "#f59e0b30" : "#f43f8e30",
                          background: weakestProject.recentHealthScore >= 70 ? "#10d99010" : weakestProject.recentHealthScore >= 40 ? "#f59e0b10" : "#f43f8e10",
                          fontFamily: "var(--font-mono)",
                        }}>
                        {weakestProject.recentHealthScore}/100
                      </div>
                    </div>
                    <p className="text-[11px] text-[#8ab4d4] mt-3 leading-relaxed" style={{ fontFamily: "var(--font-mono)" }}>
                      {weakestProject.recentHealthSummary || "Health engine is evaluating this project."}
                    </p>
                    <Link to="/organizer-dashboard/projects"
                      className="inline-flex items-center gap-1.5 mt-3 text-[10px] text-[#f43f8e] hover:text-[#fb7185] transition-colors"
                      style={{ fontFamily: "var(--font-mono)" }}>
                      Open project workspace <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                ) : (
                  <div className="rounded-xl border border-[#1a2a4a] bg-[#04080f] p-4">
                    <p className="text-[11px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                      Health scores auto-populate as alerts and weekly reports run.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <div className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden"
              style={{ boxShadow: "0 4px 24px #00000055" }}>
              <div className="h-[1.5px]" style={{ background: "linear-gradient(90deg,#f43f8e,#a855f7,transparent)" }} />
              <div className="px-5 py-4 border-b border-[#1a2a4a]">
                <p className="text-[10px] text-[#f43f8e] uppercase tracking-widest mb-0.5"
                  style={{ fontFamily: "var(--font-mono)" }}>Navigate</p>
                <h2 className="text-sm font-black text-[#e8f4ff] uppercase"
                  style={{ fontFamily: "var(--font-display)" }}>Quick Actions</h2>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2">
                {[
                  { icon: BarChart3,    label: "Analytics",   sub: "DAU, Events, AI",   to: "/organizer-dashboard/analytics", color: "#10d990" },
                  { icon: FolderKanban, label: "Projects",    sub: "Create & manage",   to: "/organizer-dashboard/projects",  color: "#00e5ff" },
                  { icon: Building2,    label: "Workspaces",  sub: "Teams & projects",  to: "/organizer-dashboard/workspaces", color: "#a855f7" },
                  { icon: Bell,         label: "Notifications", sub: `${unread.length} unread`, to: "/organizer-dashboard/notifications", color: "#f59e0b" },
                ].map(({ icon: Icon, label, sub, to, color }) => (
                  <Link key={label} to={to}>
                    <motion.div whileHover={{ scale: 1.02, borderColor: `${color}40` }}
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-[#1a2a4a] hover:bg-[#ffffff04] transition-all group">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#e8f4ff] truncate">{label}</p>
                        <p className="text-[9px] text-[#3d6080] truncate" style={{ fontFamily: "var(--font-mono)" }}>{sub}</p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </OrgLayout>
  );
};

export default OrgDashboard;
