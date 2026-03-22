// src/organizer/pages/OrgAnalytics.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, Activity, Users, MousePointer, RefreshCw,
  TrendingUp, Zap, CheckCircle2, AlertTriangle, Terminal,
  Lock, Clock, XCircle, Info
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import OrgLayout from "../components/OrgLayout";
import { useOrgApi } from "../hooks/useOrgApi";
import SdkSetupDrawer from "../components/SdkSetupDrawer";

const GRACE_DAYS = 7;

/* ── Helpers ── */
const getGraceInfo = (project) => {
  if (!project) return { inGrace: false, daysLeft: 0, expired: true };
  const cutoff  = new Date(project.createdAt);
  cutoff.setDate(cutoff.getDate() + GRACE_DAYS);
  const msLeft  = cutoff - new Date();
  const inGrace = msLeft > 0;
  const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
  return { inGrace, daysLeft, expired: !inGrace };
};

const canAccessAnalytics = (project) => {
  if (!project) return false;
  if (project.sdkVerified) return true;              // verified — always open
  const { inGrace } = getGraceInfo(project);
  if (inGrace && project.skippedVerification) return true;  // skipped during grace
  return false;
};

/* ── Tooltip ── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#1a2a4a] bg-[#060d18] px-3 py-2.5"
      style={{ boxShadow: "0 8px 24px #00000099" }}>
      <p className="text-[10px] text-[#3d6080] mb-1.5" style={{ fontFamily: "var(--font-mono)" }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} className="text-xs font-bold" style={{ color: p.color, fontFamily: "var(--font-mono)" }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

/* ── Grace Period Warning Banner ── */
const GraceBanner = ({ project, onVerifyClick }) => {
  const { daysLeft } = getGraceInfo(project);
  const urgent = daysLeft <= 2;

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-3 rounded-xl border mb-5 flex-wrap"
      style={{
        background: urgent ? "#f43f8e08" : "#f59e0b08",
        borderColor: urgent ? "#f43f8e30" : "#f59e0b30",
      }}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: urgent ? "#f43f8e" : "#f59e0b" }} />
        <p className="text-[11px] font-bold" style={{ color: urgent ? "#f43f8e" : "#f59e0b", fontFamily: "var(--font-mono)" }}>
          SDK not verified —
          {daysLeft === 0
            ? " grace period ends today!"
            : ` ${daysLeft} day${daysLeft > 1 ? "s" : ""} left in grace period.`}
          {" "}Analytics will lock after grace expires.
        </p>
      </div>
      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        onClick={onVerifyClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider flex-shrink-0"
        style={{ background: urgent ? "#f43f8e" : "#f59e0b", color: "#020408", fontFamily: "var(--font-mono)" }}>
        <Zap className="w-3 h-3" /> Verify Now
      </motion.button>
    </motion.div>
  );
};

/* ── SDK Not Verified Screen ── */
const SdkNotVerifiedScreen = ({ project, onSetupClick, onSkip, onVerified, verifySdk }) => {
  const { inGrace, daysLeft, expired } = getGraceInfo(project);
  const [checking, setChecking]         = useState(false);
  const [pollCount, setPollCount]       = useState(0);
  const [skipping, setSkipping]         = useState(false);
  const pollRef = useRef(null);

  const startCheck = () => {
    setChecking(true);
    const check = async (count) => {
      try {
        const res = await verifySdk(project._id);
        if (res?.verified) { onVerified(); return; }
        if (count >= 12) { setChecking(false); return; }
        setPollCount(count + 1);
        pollRef.current = setTimeout(() => check(count + 1), 5000);
      } catch { setChecking(false); }
    };
    check(0);
  };

  const stop = () => {
    if (pollRef.current) clearTimeout(pollRef.current);
    setChecking(false);
  };

  const handleSkip = async () => {
    setSkipping(true);
    try { await onSkip(); } finally { setSkipping(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[65vh] px-4 text-center">

      {/* Icon */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{ background: expired ? "#f43f8e10" : "#f59e0b10", border: `2px solid ${expired ? "#f43f8e30" : "#f59e0b30"}`, boxShadow: `0 0 40px ${expired ? "#f43f8e" : "#f59e0b"}10` }}>
          {expired
            ? <XCircle className="w-9 h-9 text-[#f43f8e]" />
            : <Lock className="w-9 h-9 text-[#f59e0b]" />}
        </div>
        {inGrace && (
          <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[9px] font-black text-[#020408]"
            style={{ background: daysLeft <= 2 ? "#f43f8e" : "#f59e0b", fontFamily: "var(--font-mono)" }}>
            {daysLeft}d left
          </div>
        )}
      </div>

      {/* Title */}
      <h2 className="text-xl font-black text-[#e8f4ff] uppercase mb-2"
        style={{ fontFamily: "var(--font-display)" }}>
        {expired ? "Grace Period Expired" : "SDK Not Verified"}
      </h2>

      <p className="text-sm text-[#3d6080] max-w-sm mb-1" style={{ fontFamily: "var(--font-mono)" }}>
        {expired
          ? <>Analytics for <span className="text-[#e8f4ff] font-bold">"{project?.name}"</span> are locked. Verify your SDK to unlock permanently.</>
          : <>Analytics are accessible during the <span className="text-[#f59e0b] font-bold">{GRACE_DAYS}-day grace period</span>. Verify your SDK to unlock permanently.</>
        }
      </p>

      {/* Grace period info */}
      {inGrace && (
        <div className="flex items-center gap-2 mb-6 px-3 py-2 rounded-xl border border-[#f59e0b20] bg-[#f59e0b08]">
          <Clock className="w-3.5 h-3.5 text-[#f59e0b] flex-shrink-0" />
          <p className="text-[10px] text-[#f59e0b]" style={{ fontFamily: "var(--font-mono)" }}>
            Grace period: {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining •
            Created {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Steps */}
      <div className="w-full max-w-sm space-y-2.5 mb-7">
        {[
          { n: 1, label: "Get SDK code",         sub: "Projects → SDK Setup button",                    color: "#f59e0b" },
          { n: 2, label: "Paste in your website", sub: "Before </body> in HTML or in src/lib/pulseiq.js", color: "#00e5ff" },
          { n: 3, label: "Refresh your website",  sub: "SDK auto-sends a page_view event",               color: "#a855f7" },
          { n: 4, label: "Click Verify below",    sub: "We'll confirm events are arriving",               color: "#10d990" },
        ].map(({ n, label, sub, color }) => (
          <div key={n} className="flex items-center gap-3 p-3 rounded-xl bg-[#060d18] border border-[#1a2a4a] text-left">
            <span className="w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-black text-[#020408] flex-shrink-0"
              style={{ background: color, fontFamily: "var(--font-display)" }}>{n}</span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#e8f4ff]">{label}</p>
              <p className="text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={onSetupClick}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-[#00e5ff30] text-[#00e5ff] font-bold text-xs uppercase tracking-wider hover:bg-[#00e5ff10] transition-all"
          style={{ fontFamily: "var(--font-mono)" }}>
          <Terminal className="w-3.5 h-3.5" /> SDK Setup
        </motion.button>

        <motion.button
          whileHover={{ scale: checking ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={checking ? stop : startCheck}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-xs uppercase tracking-widest"
          style={{ background: checking ? "#1a2a4a" : "linear-gradient(135deg,#10d990,#00e5ff)", color: checking ? "#3d6080" : "#020408", fontFamily: "var(--font-display)" }}>
          {checking ? (
            <>
              <motion.div className="w-4 h-4 rounded-full border-2 border-[#3d6080] border-t-[#10d990]"
                animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
              {pollCount > 0 ? `${pollCount * 5}s...` : "Listening..."}
            </>
          ) : (
            <><Zap className="w-4 h-4" /> Verify SDK</>
          )}
        </motion.button>
      </div>

      {checking && (
        <p className="text-[10px] text-[#3d6080] mt-3 max-w-xs" style={{ fontFamily: "var(--font-mono)" }}>
          Refresh your website to trigger a <span className="text-[#10d990]">page_view</span> event. Listening for 60s...
        </p>
      )}

      {/* Skip for now — only during grace period */}
      {inGrace && !expired && (
        <motion.button whileTap={{ scale: 0.97 }}
          onClick={handleSkip} disabled={skipping}
          className="mt-5 flex items-center gap-1.5 text-[11px] text-[#3d6080] hover:text-[#8ab4d4] transition-colors disabled:opacity-50"
          style={{ fontFamily: "var(--font-mono)" }}>
          <Info className="w-3.5 h-3.5" />
          {skipping ? "Skipping..." : `Skip for now — ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left to verify`}
        </motion.button>
      )}
    </motion.div>
  );
};

/* ── Verified Badge ── */
const VerifiedBadge = ({ verifiedAt }) => (
  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10d99015] border border-[#10d99030]">
    <CheckCircle2 className="w-3 h-3 text-[#10d990]" />
    <span className="text-[9px] text-[#10d990] uppercase tracking-wider font-bold" style={{ fontFamily: "var(--font-mono)" }}>
      SDK Verified {verifiedAt ? `· ${new Date(verifiedAt).toLocaleDateString()}` : ""}
    </span>
  </div>
);

/* ── Main OrgAnalytics ── */
const OrgAnalytics = () => {
  const { getMyWorkspaces, getProjects, getAnalyticsOverview, getDau, verifySdk, skipVerification, loading } = useOrgApi();
  const [workspaces, setWorkspaces]   = useState([]);
  const [projects, setProjects]       = useState([]);
  const [selectedWs, setSelectedWs]   = useState(null);
  const [selectedProj, setSelectedProj] = useState(null);
  const [overview, setOverview]       = useState(null);
  const [dauData, setDauData]         = useState([]);
  const [dateRange, setDateRange]     = useState("7d");
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [showSdkDrawer, setShowSdkDrawer] = useState(false);

  const refreshProjects = useCallback(async () => {
    const res = await getProjects();
    const list = res?.data || [];
    setProjects(list);
    return list;
  }, []);

  const loadAll = useCallback(async () => {
    try {
      const [ws, proj] = await Promise.all([getMyWorkspaces(), getProjects()]);
      const wsList = ws?.data || [];
      const pList  = proj?.data || [];
      setWorkspaces(wsList);
      setProjects(pList);
      if (!selectedWs && wsList.length > 0) setSelectedWs(wsList[0]);
    } catch {}
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Auto-select first project when workspace changes
  useEffect(() => {
    if (!selectedWs) return;
    const wsProjects = projects.filter(p => (p.workspaceId?._id || p.workspaceId) === selectedWs._id);
    if (wsProjects.length > 0 && (!selectedProj || !wsProjects.find(p => p._id === selectedProj._id))) {
      setSelectedProj(wsProjects[0]);
    }
    if (wsProjects.length === 0) setSelectedProj(null);
  }, [selectedWs, projects]);

  const loadAnalytics = useCallback(async () => {
    if (!selectedProj || !canAccessAnalytics(selectedProj)) return;
    setAnalyticsLoading(true);
    try {
      const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
      const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const to   = new Date().toISOString();
      const [ov, dau] = await Promise.all([
        getAnalyticsOverview(selectedProj._id, from, to),
        getDau(selectedProj._id, from, to),
      ]);
      setOverview(ov?.data);
      setDauData((dau?.data || []).map(d => ({ date: d._id?.slice(5) || d.date, users: d.activeUsers || d.count || 0 })));
    } catch {}
    finally { setAnalyticsLoading(false); }
  }, [selectedProj, dateRange]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  const handleVerified = async () => {
    const list = await refreshProjects();
    const fresh = list.find(p => p._id === selectedProj?._id);
    if (fresh) setSelectedProj(fresh);
  };

  const handleSkip = async () => {
    try {
      await skipVerification(selectedProj._id);
      const list = await refreshProjects();
      const fresh = list.find(p => p._id === selectedProj?._id);
      if (fresh) setSelectedProj({ ...fresh, skippedVerification: true });
    } catch {}
  };

  const wsProjects = selectedWs
    ? projects.filter(p => (p.workspaceId?._id || p.workspaceId) === selectedWs._id)
    : [];

  const analyticsAccessible = canAccessAnalytics(selectedProj);
  const { inGrace, daysLeft } = getGraceInfo(selectedProj);

  // Project tab status dot
  const projDotColor = (proj) => {
    if (proj.sdkVerified) return "#10d990";
    const g = getGraceInfo(proj);
    if (g.inGrace) return "#f59e0b";
    return "#f43f8e";
  };

  return (
    <OrgLayout>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="text-[10px] text-[#10d990] uppercase tracking-[0.3em] mb-1"
            style={{ fontFamily: "var(--font-mono)" }}>Organizer / Analytics</p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-2xl font-black text-[#e8f4ff] uppercase"
              style={{ fontFamily: "var(--font-display)" }}>Analytics</h1>
            <div className="flex gap-2 items-center flex-wrap">
              {analyticsAccessible && ["7d","30d","90d"].map(r => (
                <button key={r} onClick={() => setDateRange(r)}
                  className="px-3 py-2 rounded-xl text-[10px] uppercase tracking-wider font-bold border transition-all"
                  style={{ borderColor: dateRange === r ? "#10d99050" : "#1a2a4a", background: dateRange === r ? "#10d99015" : "transparent", color: dateRange === r ? "#10d990" : "#3d6080", fontFamily: "var(--font-mono)" }}>
                  {r}
                </button>
              ))}
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => { loadAll(); loadAnalytics(); }}
                className="px-3 py-2 rounded-xl border border-[#1a2a4a] text-[#3d6080] hover:text-[#10d990] hover:border-[#10d99033] transition-all">
                <RefreshCw className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Workspace + Project selectors */}
        {workspaces.length > 0 && (
          <div className="space-y-3 mb-5">
            {/* Workspace tabs */}
            <div className="flex gap-2 flex-wrap">
              {workspaces.map(ws => (
                <button key={ws._id}
                  onClick={() => { setSelectedWs(ws); setSelectedProj(null); setOverview(null); setDauData([]); }}
                  className="px-4 py-2 rounded-xl text-[11px] uppercase tracking-wider font-bold border transition-all"
                  style={{ borderColor: selectedWs?._id === ws._id ? "#10d99050" : "#1a2a4a", background: selectedWs?._id === ws._id ? "#10d99015" : "transparent", color: selectedWs?._id === ws._id ? "#10d990" : "#3d6080", fontFamily: "var(--font-mono)" }}>
                  {ws.name}
                </button>
              ))}
            </div>

            {/* Project tabs */}
            {wsProjects.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {wsProjects.map(proj => {
                  const dot = projDotColor(proj);
                  const isSelected = selectedProj?._id === proj._id;
                  return (
                    <button key={proj._id}
                      onClick={() => { setSelectedProj(proj); setOverview(null); setDauData([]); }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] uppercase tracking-wider font-bold border transition-all"
                      style={{ borderColor: isSelected ? "#00e5ff50" : "#1a2a4a", background: isSelected ? "#00e5ff15" : "transparent", color: isSelected ? "#00e5ff" : "#3d6080", fontFamily: "var(--font-mono)" }}>
                      <span className="w-2 h-2 rounded-full flex-shrink-0 relative"
                        style={{ background: dot }}>
                        {!proj.sdkVerified && getGraceInfo(proj).inGrace && (
                          <span className="absolute inset-0 rounded-full animate-ping opacity-75"
                            style={{ background: dot }} />
                        )}
                      </span>
                      {proj.name}
                      {proj.sdkVerified
                        ? <CheckCircle2 className="w-3 h-3 text-[#10d990]" />
                        : <span className="text-[8px]" style={{ color: dot, fontFamily: "var(--font-mono)" }}>
                            {getGraceInfo(proj).inGrace ? `${getGraceInfo(proj).daysLeft}d` : "locked"}
                          </span>
                      }
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Empty states */}
        {workspaces.length === 0 && !loading && (
          <div className="text-center py-20">
            <BarChart3 className="w-12 h-12 text-[#1a3a6b] mx-auto mb-4" />
            <p className="text-sm text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>Create a workspace and project first.</p>
          </div>
        )}
        {selectedWs && wsProjects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-sm text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>No projects in this workspace.</p>
          </div>
        )}

        {/* SDK not verified / grace expired */}
        {selectedProj && !analyticsAccessible && (
          <SdkNotVerifiedScreen
            project={selectedProj}
            verifySdk={verifySdk}
            onSetupClick={() => setShowSdkDrawer(true)}
            onVerified={handleVerified}
            onSkip={handleSkip}
          />
        )}

        {/* Analytics accessible */}
        {selectedProj && analyticsAccessible && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

            {/* Grace period warning banner */}
            {!selectedProj.sdkVerified && inGrace && (
              <GraceBanner project={selectedProj} onVerifyClick={() => setShowSdkDrawer(true)} />
            )}

            {/* Verified badge row */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              {selectedProj.sdkVerified
                ? <VerifiedBadge verifiedAt={selectedProj.sdkVerifiedAt} />
                : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f59e0b15] border border-[#f59e0b30]">
                    <Clock className="w-3 h-3 text-[#f59e0b]" />
                    <span className="text-[9px] text-[#f59e0b] uppercase tracking-wider font-bold"
                      style={{ fontFamily: "var(--font-mono)" }}>
                      Grace Period — {daysLeft}d left
                    </span>
                  </div>
                )
              }
              <span className="text-[11px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                {selectedProj.name}
              </span>
              <button onClick={() => setShowSdkDrawer(true)}
                className="text-[10px] text-[#3d6080] hover:text-[#00e5ff] transition-colors flex items-center gap-1"
                style={{ fontFamily: "var(--font-mono)" }}>
                <Terminal className="w-3 h-3" /> SDK Guide
              </button>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { icon: Activity,     label: "Total Events",  value: overview?.totalEvents,           color: "#00e5ff" },
                { icon: Users,        label: "Unique Users",  value: overview?.uniqueUsers,           color: "#10d990" },
                { icon: MousePointer, label: "Top Event",     value: overview?.topEvents?.[0]?._id,   color: "#a855f7" },
                { icon: TrendingUp,   label: "Event Types",   value: overview?.topEvents?.length,     color: "#f59e0b" },
              ].map(({ icon: Icon, label, value, color }, i) => (
                <motion.div key={label}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5 relative overflow-hidden"
                  style={{ boxShadow: "0 4px 24px #00000055" }}>
                  <div className="absolute top-0 inset-x-0 h-[1.5px] opacity-60"
                    style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <p className="text-xl font-black text-[#e8f4ff] mb-0.5"
                    style={{ fontFamily: "var(--font-display)" }}>
                    {analyticsLoading ? "—" : (value ?? "0")}
                  </p>
                  <p className="text-[10px] text-[#3d6080] uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-mono)" }}>{label}</p>
                </motion.div>
              ))}
            </div>

            {/* DAU Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5 mb-4"
              style={{ boxShadow: "0 4px 24px #00000055" }}>
              <div className="mb-4">
                <p className="text-[10px] text-[#00e5ff] uppercase tracking-widest mb-0.5"
                  style={{ fontFamily: "var(--font-mono)" }}>Daily Active</p>
                <h3 className="text-sm font-black text-[#e8f4ff] uppercase"
                  style={{ fontFamily: "var(--font-display)" }}>User Activity</h3>
              </div>
              {analyticsLoading ? (
                <div className="flex justify-center items-center h-48">
                  <motion.div className="w-8 h-8 rounded-full border-2 border-[#00e5ff33] border-t-[#00e5ff]"
                    animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
                </div>
              ) : dauData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48">
                  <Clock className="w-8 h-8 text-[#1a3a6b] mb-2" />
                  <p className="text-[11px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>No data for this range</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={dauData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2a4a" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: "#3d6080", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#3d6080", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line type="monotone" dataKey="users" name="Active Users" stroke="#00e5ff" strokeWidth={2}
                      dot={false} activeDot={{ r: 5, fill: "#00e5ff", strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            {/* Top Events */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5"
              style={{ boxShadow: "0 4px 24px #00000055" }}>
              <div className="mb-4">
                <p className="text-[10px] text-[#10d990] uppercase tracking-widest mb-0.5"
                  style={{ fontFamily: "var(--font-mono)" }}>Most Frequent</p>
                <h3 className="text-sm font-black text-[#e8f4ff] uppercase"
                  style={{ fontFamily: "var(--font-display)" }}>Top Events</h3>
              </div>
              {analyticsLoading ? (
                <div className="flex justify-center items-center h-40">
                  <motion.div className="w-8 h-8 rounded-full border-2 border-[#10d99033] border-t-[#10d990]"
                    animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
                </div>
              ) : !overview?.topEvents?.length ? (
                <div className="flex flex-col items-center justify-center h-40">
                  <p className="text-[11px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>No events yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={overview.topEvents.map(e => ({ name: e._id || e.eventName, count: e.count }))}
                    margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2a4a" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "#3d6080", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#3d6080", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" name="Events" fill="#10d990" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* SDK Drawer */}
      <AnimatePresence>
        {showSdkDrawer && selectedProj && (
          <SdkSetupDrawer
            project={selectedProj}
            verifySdk={verifySdk}
            onClose={() => setShowSdkDrawer(false)}
          />
        )}
      </AnimatePresence>
    </OrgLayout>
  );
};

export default OrgAnalytics;