import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  Eye,
  FileBarChart,
  Flame,
  Gauge,
  MousePointer,
  RefreshCw,
  Route,
  Timer,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import UserLayout from "../components/UserLayout";
import { useUserApi } from "../hooks/useUserApi";

const COLORS = {
  cyan: "#00e5ff",
  green: "#10d990",
  purple: "#a855f7",
  amber: "#f59e0b",
  pink: "#f43f8e",
};

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#1a2a4a] bg-[#060d18] px-3 py-2" style={{ boxShadow: "0 8px 24px #00000099" }}>
      <p className="mb-1 text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
        {label}
      </p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-xs font-bold" style={{ color: p.color, fontFamily: "var(--font-mono)" }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="relative overflow-hidden rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5"
    style={{ boxShadow: "0 4px 24px #00000055" }}
  >
    <div className="absolute inset-x-0 top-0 h-[1.5px] opacity-70" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
      <Icon className="h-4 w-4" style={{ color }} />
    </div>
    <p className="text-2xl font-black text-[#e8f4ff]" style={{ fontFamily: "var(--font-display)" }}>
      {value}
    </p>
    <p className="mt-1 text-[10px] uppercase tracking-widest text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
      {label}
    </p>
    {sub ? (
      <p className="mt-1 text-[10px] text-[#1a3a6b]" style={{ fontFamily: "var(--font-mono)" }}>
        {sub}
      </p>
    ) : null}
  </motion.div>
);

const MiniPanel = ({ title, eyebrow, children }) => (
  <div className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5" style={{ boxShadow: "0 4px 24px #00000055" }}>
    <p className="text-[10px] uppercase tracking-widest text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
      {eyebrow}
    </p>
    <h3 className="mb-4 mt-1 text-sm font-black uppercase text-[#e8f4ff]" style={{ fontFamily: "var(--font-display)" }}>
      {title}
    </h3>
    {children}
  </div>
);

const UserProjectAnalytics = () => {
  const { projectId } = useParams();
  const {
    getAnalyticsOverview,
    getDau,
    getRetention,
    getPageAnalytics,
    getHeatmap,
    getSessions,
    getExamAnalytics,
    getProjects,
    loading,
  } = useUserApi();

  const [project, setProject] = useState(null);
  const [overview, setOverview] = useState(null);
  const [dauData, setDauData] = useState([]);
  const [retention, setRetention] = useState([]);
  const [pages, setPages] = useState([]);
  const [heatmap, setHeatmap] = useState(null);
  const [sessions, setSessions] = useState(null);
  const [exam, setExam] = useState(null);
  const [dateRange, setDateRange] = useState("7d");

  const getRange = () => {
    const to = new Date();
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    const from = new Date(Date.now() - days * 86400000);
    return { from: from.toISOString(), to: to.toISOString() };
  };

  const load = async () => {
    try {
      const { from, to } = getRange();
      const projRes = await getProjects();
      setProject((projRes?.data || []).find((item) => item._id === projectId) || null);

      const [ovRes, dauRes, retentionRes, pagesRes, heatmapRes, sessionsRes, examRes] = await Promise.all([
        getAnalyticsOverview(projectId, from, to),
        getDau(projectId, from, to),
        getRetention(projectId, from, to),
        getPageAnalytics(projectId, from, to),
        getHeatmap(projectId, from, to),
        getSessions(projectId, from, to),
        getExamAnalytics(projectId, from, to),
      ]);

      setOverview(ovRes?.data || null);
      setDauData((dauRes?.data || []).map((item) => ({ date: item._id?.slice(5), users: item.activeUsers })));
      setRetention(retentionRes?.data || []);
      setPages(pagesRes?.data?.pages || []);
      setHeatmap(heatmapRes?.data || null);
      setSessions(sessionsRes?.data || null);
      setExam(examRes?.data || null);
    } catch {}
  };

  useEffect(() => {
    load();
  }, [projectId, dateRange]);

  const topPage = useMemo(() => pages[0] || null, [pages]);
  const strongestRetention = useMemo(() => retention[0]?.rate ?? 0, [retention]);
  const category = overview?.category || { key: "general", label: "General Web App", journeysLabel: "User journeys" };

  const stats = [
    { icon: Activity, label: "Total Events", value: overview?.totalEvents ?? "-", color: COLORS.cyan },
    { icon: Users, label: "Unique Users", value: overview?.uniqueUsers ?? "-", color: COLORS.green },
    { icon: Gauge, label: "Bounce Rate", value: overview ? `${overview.bounceRate}%` : "-", color: COLORS.amber },
    { icon: MousePointer, label: "Avg Events / User", value: overview?.avgEventsPerUser ?? "-", color: COLORS.purple },
    { icon: Route, label: "Sessions", value: sessions?.summary?.totalSessions ?? "-", color: COLORS.pink },
    { icon: Eye, label: "Top Page", value: topPage?._id || "/", color: COLORS.cyan, sub: topPage ? `${topPage.totalViews} views` : "No page data" },
  ];

  return (
    <UserLayout>
      <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link
            to="/dashboard/workspaces"
            className="mb-4 flex w-fit items-center gap-1.5 text-[10px] text-[#3d6080] transition-colors hover:text-[#00e5ff]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Workspaces
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-[0.3em] text-[#00e5ff]" style={{ fontFamily: "var(--font-mono)" }}>
                User / Advanced Analytics
              </p>
              <h1 className="text-2xl font-black uppercase text-[#e8f4ff]" style={{ fontFamily: "var(--font-display)" }}>
                {project?.name || "Project Analytics"}
              </h1>
              <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                {category.label} / {category.journeysLabel}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {["7d", "30d", "90d"].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className="rounded-xl border px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-all"
                  style={{
                    borderColor: dateRange === range ? "#00e5ff50" : "#1a2a4a",
                    background: dateRange === range ? "#00e5ff15" : "transparent",
                    color: dateRange === range ? "#00e5ff" : "#3d6080",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {range}
                </button>
              ))}
              <motion.button whileTap={{ scale: 0.95 }} onClick={load} className="rounded-xl border border-[#1a2a4a] px-3 py-2 text-[#3d6080] transition-all hover:border-[#00e5ff33] hover:text-[#00e5ff]">
                <RefreshCw className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-6">
          {stats.map((item, index) => (
            <StatCard key={item.label} {...item} delay={index * 0.06} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <MiniPanel title="Daily Activity" eyebrow="Usage trend">
              {dauData.length === 0 ? (
                <div className="flex h-56 items-center justify-center text-[11px] uppercase tracking-widest text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                  No data for selected range
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={dauData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <defs>
                      <linearGradient id="userActivityFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2a4a" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: "#3d6080", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#3d6080", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<Tip />} />
                    <Area type="monotone" dataKey="users" name="Active Users" stroke="#00e5ff" strokeWidth={2.2} fill="url(#userActivityFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </MiniPanel>

            <div className="grid gap-6 lg:grid-cols-2">
              <MiniPanel title="Retention" eyebrow="Engagement">
                {retention.length === 0 ? (
                  <p className="text-[11px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                    Retention data is not available yet.
                  </p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={retention} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                        <defs>
                          <linearGradient id="retentionFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a2a4a" vertical={false} />
                        <XAxis dataKey="day" tick={{ fill: "#3d6080", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#3d6080", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<Tip />} />
                        <Area type="monotone" dataKey="rate" name="Retention %" stroke="#a855f7" strokeWidth={2.2} fill="url(#retentionFill)" />
                      </AreaChart>
                    </ResponsiveContainer>
                    <p className="mt-3 text-[11px] text-[#8ab4d4]" style={{ fontFamily: "var(--font-mono)" }}>
                      Day 0 retention is currently {strongestRetention}% for this project window.
                    </p>
                  </>
                )}
              </MiniPanel>

              <MiniPanel title="Top Events" eyebrow="Most frequent">
                {!overview?.topEvents?.length ? (
                  <p className="text-[11px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                    No event data yet.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={overview.topEvents.map((event) => ({ name: event._id, count: event.count }))} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a2a4a" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "#3d6080", fontSize: 9, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#3d6080", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<Tip />} />
                      <Bar dataKey="count" name="Events" fill="#10d990" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </MiniPanel>
            </div>

            <MiniPanel title="Page Performance" eyebrow="Pages">
              {!pages.length ? (
                <p className="text-[11px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                  No page analytics available yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {pages.slice(0, 6).map((page) => (
                    <div key={page._id || "/"} className="flex items-center justify-between rounded-xl border border-[#1a2a4a] bg-[#04080f] px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#e8f4ff]">{page._id || "/"}</p>
                        <p className="text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                          {page.uniqueUsers} users
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-[#00e5ff]" style={{ fontFamily: "var(--font-display)" }}>
                          {page.totalViews}
                        </p>
                        <p className="text-[10px] uppercase tracking-widest text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                          views
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </MiniPanel>
          </div>

          <div className="space-y-6">
            <MiniPanel title="Heatmap Readiness" eyebrow="Interactions">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#1a2a4a] bg-[#04080f] p-4">
                  <p className="text-2xl font-black text-[#f59e0b]" style={{ fontFamily: "var(--font-display)" }}>
                    {heatmap?.points?.length || 0}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                    click clusters
                  </p>
                </div>
                <div className="rounded-xl border border-[#1a2a4a] bg-[#04080f] p-4">
                  <p className="text-2xl font-black text-[#a855f7]" style={{ fontFamily: "var(--font-display)" }}>
                    {heatmap?.scrollDepth?.[0]?.avgScrollDepth ?? 0}%
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                    avg scroll
                  </p>
                </div>
              </div>
              <p className="mt-4 text-[11px] leading-6 text-[#8ab4d4]" style={{ fontFamily: "var(--font-mono)" }}>
                {heatmap?.hasCoordinateData
                  ? "Coordinate-based interaction data is available. You can now evolve this into a visual click heatmap layer."
                  : "No coordinate-level click data has been ingested yet. Add x/y coordinates from the tracking script to unlock true click heatmaps."}
              </p>
            </MiniPanel>

            <MiniPanel title="Session Journey" eyebrow="Journey analysis">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#1a2a4a] bg-[#04080f] p-4">
                  <p className="text-2xl font-black text-[#00e5ff]" style={{ fontFamily: "var(--font-display)" }}>
                    {sessions?.summary?.totalSessions ?? 0}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                    sessions
                  </p>
                </div>
                <div className="rounded-xl border border-[#1a2a4a] bg-[#04080f] p-4">
                  <p className="text-2xl font-black text-[#10d990]" style={{ fontFamily: "var(--font-display)" }}>
                    {sessions?.summary?.avgDurationSeconds ?? 0}s
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                    avg duration
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {(sessions?.sessions || []).slice(0, 3).map((session) => (
                  <div key={session.sessionId} className="rounded-xl border border-[#1a2a4a] bg-[#04080f] p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-xs font-bold text-[#e8f4ff]">{session.userKey || "anonymous user"}</p>
                      <p className="text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                        {session.durationSeconds}s
                      </p>
                    </div>
                    <p className="text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                      {session.events?.map((event) => event.eventName).join(" -> ") || "No events"}
                    </p>
                  </div>
                ))}
                {!sessions?.sessions?.length ? (
                  <p className="text-[11px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                    No session journeys available yet.
                  </p>
                ) : null}
              </div>
            </MiniPanel>

            {(category.key === "edtech" || exam?.hasExamSignals) ? (
            <MiniPanel title="Exam Analytics" eyebrow="EdTech / coaching">
              {exam?.hasExamSignals ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-[#1a2a4a] bg-[#04080f] p-4">
                      <p className="text-2xl font-black text-[#f43f8e]" style={{ fontFamily: "var(--font-display)" }}>
                        {exam.questionDropOffs?.[0]?.quits ?? 0}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-widest text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                        top question exits
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#1a2a4a] bg-[#04080f] p-4">
                      <p className="text-2xl font-black text-[#f59e0b]" style={{ fontFamily: "var(--font-display)" }}>
                        {exam.reattempts?.[0]?.reattemptRate ?? 0}%
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-widest text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                        reattempt rate
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {(exam.sectionDifficulty || []).slice(0, 4).map((section) => (
                      <div key={section.section} className="flex items-center gap-3 rounded-xl border border-[#1a2a4a] bg-[#04080f] px-4 py-3">
                        <Flame className="h-4 w-4 text-[#f43f8e]" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-[#e8f4ff]">{section.section}</p>
                          <p className="text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                            {section.issues} friction signals
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[11px] leading-6 text-[#8ab4d4]" style={{ fontFamily: "var(--font-mono)" }}>
                  No dedicated exam events have been received yet. Once the product sends `exam_start`, `question_quit`, `question_retry`, or `timeSpent` payloads, PulseIQ will surface question-level and section-level analytics here.
                </p>
              )}
            </MiniPanel>
            ) : (
            <MiniPanel title="Journey Focus" eyebrow="Category intelligence">
              <p className="text-[11px] leading-6 text-[#8ab4d4]" style={{ fontFamily: "var(--font-mono)" }}>
                This project is currently classified as {category.label}. PulseIQ is prioritizing {category.journeysLabel.toLowerCase()} instead of exam-specific analytics for this experience.
              </p>
            </MiniPanel>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <MiniPanel title="Top Pages by Views" eyebrow="Content performance">
            {!pages.length ? (
              <p className="text-[11px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                No page view dataset available.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={pages.slice(0, 6).map((page) => ({
                    name: (page._id || "/").slice(0, 14),
                    views: page.totalViews,
                  }))}
                  margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2a4a" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#3d6080", fontSize: 9, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#3d6080", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="views" name="Views" fill="#00e5ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </MiniPanel>

          <MiniPanel title="Product Summary" eyebrow="Quick read">
            <div className="space-y-3">
              {[
                `This project recorded ${overview?.totalEvents ?? 0} events across ${overview?.uniqueUsers ?? 0} users in the selected range.`,
                `Retention starts at ${retention?.[0]?.rate ?? 0}% and the strongest page right now is ${topPage?._id || "/"}.`,
                `PulseIQ is now surfacing page, session, heatmap readiness, and exam analytics from the same product view.`,
              ].map((line) => (
                <div key={line} className="rounded-xl border border-[#1a2a4a] bg-[#04080f] px-4 py-3">
                  <p className="text-[11px] leading-6 text-[#8ab4d4]" style={{ fontFamily: "var(--font-mono)" }}>
                    {line}
                  </p>
                </div>
              ))}
            </div>
          </MiniPanel>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserProjectAnalytics;
