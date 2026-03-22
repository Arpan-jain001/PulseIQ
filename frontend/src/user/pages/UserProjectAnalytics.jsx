// src/user/pages/UserProjectAnalytics.jsx
// MEMBER/ADMIN can view analytics for projects they have access to
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, Activity, Users, MousePointer, ArrowLeft, RefreshCw, TrendingUp } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import UserLayout from "../components/UserLayout";
import { useUserApi } from "../hooks/useUserApi";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#1a2a4a] bg-[#060d18] px-3 py-2"
      style={{ boxShadow: "0 8px 24px #00000099" }}>
      <p className="text-[10px] text-[#3d6080] mb-1" style={{ fontFamily: "var(--font-mono)" }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} className="text-xs font-bold" style={{ color: p.color, fontFamily: "var(--font-mono)" }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const UserProjectAnalytics = () => {
  const { workspaceId, projectId } = useParams();
  const { getAnalyticsOverview, getDau, getProjects, loading } = useUserApi();
  const [overview, setOverview]   = useState(null);
  const [dauData, setDauData]     = useState([]);
  const [project, setProject]     = useState(null);
  const [dateRange, setDateRange] = useState("7d");

  const getRange = () => {
    const to = new Date();
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return { from: from.toISOString(), to: to.toISOString() };
  };

  const load = async () => {
    try {
      // Get project details
      const projRes = await getProjects();
      const proj = (projRes?.data || []).find(p => p._id === projectId);
      setProject(proj);

      const { from, to } = getRange();
      const [ov, dau] = await Promise.all([
        getAnalyticsOverview(projectId, from, to),
        getDau(projectId, from, to),
      ]);
      setOverview(ov?.data);
      setDauData((dau?.data || []).map(d => ({ date: d._id?.slice(5), users: d.activeUsers })));
    } catch {}
  };

  useEffect(() => { load(); }, [projectId, dateRange]);

  const statCards = [
    { icon: Activity,     label: "Total Events",  value: overview?.totalEvents ?? "—",  color: "#00e5ff" },
    { icon: Users,        label: "Unique Users",  value: overview?.uniqueUsers ?? "—",  color: "#10d990" },
    { icon: MousePointer, label: "Top Event",     value: overview?.topEvents?.[0]?._id ?? "—", color: "#a855f7" },
    { icon: TrendingUp,   label: "Event Types",   value: overview?.topEvents?.length ?? "—",   color: "#f59e0b" },
  ];

  return (
    <UserLayout>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">

        {/* Back + Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link to="/dashboard/workspaces"
            className="flex items-center gap-1.5 text-[10px] text-[#3d6080] hover:text-[#00e5ff] transition-colors mb-4 w-fit"
            style={{ fontFamily: "var(--font-mono)" }}>
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Workspaces
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] text-[#00e5ff] uppercase tracking-[0.3em] mb-1"
                style={{ fontFamily: "var(--font-mono)" }}>User / Analytics</p>
              <h1 className="text-2xl font-black text-[#e8f4ff] uppercase"
                style={{ fontFamily: "var(--font-display)" }}>
                {project?.name || "Project Analytics"}
              </h1>
            </div>
            <div className="flex gap-2 flex-wrap">
              {["7d", "30d", "90d"].map(r => (
                <button key={r} onClick={() => setDateRange(r)}
                  className="px-3 py-2 rounded-xl text-[10px] uppercase tracking-wider font-bold border transition-all"
                  style={{ borderColor: dateRange === r ? "#00e5ff50" : "#1a2a4a", background: dateRange === r ? "#00e5ff15" : "transparent", color: dateRange === r ? "#00e5ff" : "#3d6080", fontFamily: "var(--font-mono)" }}>
                  {r}
                </button>
              ))}
              <motion.button whileTap={{ scale: 0.95 }} onClick={load}
                className="px-3 py-2 rounded-xl border border-[#1a2a4a] text-[#3d6080] hover:text-[#00e5ff] hover:border-[#00e5ff33] transition-all">
                <RefreshCw className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ icon: Icon, label, value, color }, i) => (
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
              <p className="text-xl font-black text-[#e8f4ff] mb-0.5" style={{ fontFamily: "var(--font-display)" }}>
                {loading ? "—" : value}
              </p>
              <p className="text-[10px] text-[#3d6080] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>{label}</p>
            </motion.div>
          ))}
        </div>

        {/* DAU Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5 mb-6"
          style={{ boxShadow: "0 4px 24px #00000055" }}>
          <div className="mb-4">
            <p className="text-[10px] text-[#00e5ff] uppercase tracking-widest mb-0.5" style={{ fontFamily: "var(--font-mono)" }}>Daily Active</p>
            <h3 className="text-sm font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>User Activity</h3>
          </div>
          {dauData.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-[11px] text-[#3d6080] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                No data for selected range
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dauData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2a4a" />
                <XAxis dataKey="date" tick={{ fill: "#3d6080", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#3d6080", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="users" name="Active Users" stroke="#00e5ff" strokeWidth={2} dot={false}
                  activeDot={{ r: 4, fill: "#00e5ff" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Top Events Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5"
          style={{ boxShadow: "0 4px 24px #00000055" }}>
          <div className="mb-4">
            <p className="text-[10px] text-[#10d990] uppercase tracking-widest mb-0.5" style={{ fontFamily: "var(--font-mono)" }}>Most Frequent</p>
            <h3 className="text-sm font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>Top Events</h3>
          </div>
          {!overview?.topEvents?.length ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-[11px] text-[#3d6080] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>No events yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={overview.topEvents.map(e => ({ name: e._id, count: e.count }))}
                margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2a4a" />
                <XAxis dataKey="name" tick={{ fill: "#3d6080", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#3d6080", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Events" fill="#10d990" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>
    </UserLayout>
  );
};

export default UserProjectAnalytics;