// src/organizer/pages/OrgAnalytics.jsx — Complete Advanced Analytics with AI
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, Activity, Users, MousePointer, RefreshCw,
  TrendingUp, Zap, CheckCircle2, AlertTriangle, Terminal,
  Lock, XCircle, Info, BrainCircuit, MessageSquare,
  Send, Sparkles, ArrowUpRight, ArrowDownRight,
  Target, AlertCircle, Eye, Globe, Clock, ChevronRight,
  BarChart2, Layers, Code2
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell
} from "recharts";
import OrgLayout from "../components/OrgLayout";
import { useOrgApi } from "../hooks/useOrgApi";
import SdkSetupDrawer from "../components/SdkSetupDrawer";

/* ── Constants ── */
const GRACE_DAYS = 7;
const PIE_COLORS = ["#00e5ff","#10d990","#a855f7","#f59e0b","#f43f8e","#38bdf8","#34d399","#fb923c"];
const BASE = import.meta.env.VITE_BACKEND_API_URL;

/* ── Helpers ── */
const getGraceInfo = (p) => {
  if (!p) return { inGrace:false, daysLeft:0 };
  const cut = new Date(p.createdAt); cut.setDate(cut.getDate() + GRACE_DAYS);
  const ms  = cut - new Date();
  return { inGrace: ms > 0, daysLeft: Math.max(0, Math.ceil(ms / 86400000)) };
};

const canAccess = (p) => {
  if (!p) return false;
  if (p.sdkVerified) return true;
  return getGraceInfo(p).inGrace && p.skippedVerification;
};

const authHdr = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  "Content-Type": "application/json"
});

/* ── Tooltip ── */
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#1a2a4a] bg-[#060d18] px-3 py-2.5"
      style={{ boxShadow:"0 8px 24px #00000099" }}>
      <p className="text-[10px] text-[#3d6080] mb-1.5" style={{ fontFamily:"var(--font-mono)" }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} className="text-xs font-bold"
          style={{ color:p.color||"#00e5ff", fontFamily:"var(--font-mono)" }}>
          {p.name}: {(p.value||0).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

/* ── Stat Card ── */
const StatCard = ({ icon:Icon, label, value, sub, color, trend, delay=0 }) => (
  <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay }}
    className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5 relative overflow-hidden"
    style={{ boxShadow:"0 4px 24px #00000055" }}>
    <div className="absolute top-0 inset-x-0 h-[1.5px] opacity-60"
      style={{ background:`linear-gradient(90deg,transparent,${color},transparent)` }}/>
    <div className="flex items-start justify-between mb-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background:`${color}15`, border:`1px solid ${color}30` }}>
        <Icon className="w-4 h-4" style={{ color }}/>
      </div>
      {trend !== undefined && (
        <span className={`flex items-center gap-0.5 text-[10px] font-bold ${trend>=0?"text-[#10d990]":"text-[#f43f8e]"}`}
          style={{ fontFamily:"var(--font-mono)" }}>
          {trend>=0 ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-2xl font-black text-[#e8f4ff] mb-0.5" style={{ fontFamily:"var(--font-display)" }}>
      {value ?? "—"}
    </p>
    <p className="text-[10px] text-[#3d6080] uppercase tracking-widest" style={{ fontFamily:"var(--font-mono)" }}>{label}</p>
    {sub && <p className="text-[9px] text-[#1a3a6b] mt-0.5" style={{ fontFamily:"var(--font-mono)" }}>{sub}</p>}
  </motion.div>
);

/* ── Health Ring ── */
const HealthRing = ({ score, label, color }) => {
  const r = 36, c = 2*Math.PI*r, dash = (score/100)*c;
  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1a2a4a" strokeWidth="8"/>
        <motion.circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c}
          animate={{ strokeDashoffset: c - dash }}
          transition={{ duration:1.5, ease:"easeOut" }}
          style={{ transformOrigin:"center", transform:"rotate(-90deg)" }}/>
        <text x="50" y="46" textAnchor="middle" fill="#e8f4ff" fontSize="18" fontWeight="900"
          style={{ fontFamily:"var(--font-display)" }}>{score}</text>
        <text x="50" y="60" textAnchor="middle" fill="#3d6080" fontSize="8"
          style={{ fontFamily:"var(--font-mono)" }}>/100</text>
      </svg>
      <span className="text-[10px] font-bold uppercase tracking-wider mt-1"
        style={{ color, fontFamily:"var(--font-mono)" }}>{label}</span>
    </div>
  );
};

/* ── AI Terminal Card (OrgDashboard style) ── */
const AiTerminalCard = ({ verdict, color="#00e5ff" }) => (
  <div className="rounded-2xl border bg-[#060d18] p-5 relative overflow-hidden"
    style={{ borderColor:`${color}18`, boxShadow:`0 0 40px ${color}06` }}>
    <div className="absolute inset-0 pointer-events-none"
      style={{ background:`linear-gradient(135deg,${color}06 0%,transparent 50%)` }}/>
    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full border animate-spin"
      style={{ borderColor:`${color}12`, animationDuration:"20s" }}/>
    <div className="relative flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background:`${color}12`, border:`1px solid ${color}25` }}>
        <Terminal className="w-4 h-4" style={{ color }}/>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest mb-1.5"
          style={{ color, fontFamily:"var(--font-mono)" }}>
          {verdict || "ai_insight → analyzing..."}
        </p>
      </div>
    </div>
  </div>
);

/* ── Page AI Insight Panel ── */
const PageInsightPanel = ({ pageData, projectId, from, to, onClose }) => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr]       = useState("");

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`${BASE}/api/ai/page-insights`, {
          method:"POST", headers:authHdr(),
          body: JSON.stringify({ projectId, page:pageData._id, from, to }),
        });
        const json = await res.json();
        if (json.success) setData(json.data);
        else setErr(json.message||"AI error");
      } catch { setErr("Failed to load insights"); }
      finally { setLoading(false); }
    };
    fetch_();
  }, []);

  const healthColor = { good:"#10d990", warning:"#f59e0b", critical:"#f43f8e" }[data?.health] || "#3d6080";

  return (
    <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:20 }}
      className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 overflow-y-auto"
      style={{ background:"#060d18", borderLeft:"1px solid #1a2a4a", boxShadow:"-8px 0 40px #00000077" }}>
      <div className="h-[2px]" style={{ background:"linear-gradient(90deg,#a855f7,#f43f8e,#00e5ff)" }}/>
      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] text-[#a855f7] uppercase tracking-widest mb-0.5"
              style={{ fontFamily:"var(--font-mono)" }}>Page AI Analysis</p>
            <h3 className="text-sm font-black text-[#e8f4ff] uppercase"
              style={{ fontFamily:"var(--font-display)" }}>
              {(pageData._id || "/").slice(0, 24)}
            </h3>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl border border-[#1a2a4a] flex items-center justify-center text-[#3d6080] hover:text-[#e8f4ff] transition-colors">
            ✕
          </button>
        </div>

        {/* Page stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label:"Total Views",     value:(pageData.totalViews||0).toLocaleString(), color:"#00e5ff" },
            { label:"Unique Visitors", value:(pageData.uniqueUsers||0).toLocaleString(), color:"#10d990" },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-3 rounded-xl border border-[#1a2a4a] bg-[#04080f] text-center">
              <p className="text-lg font-black" style={{ color, fontFamily:"var(--font-display)" }}>{value}</p>
              <p className="text-[9px] text-[#3d6080] uppercase tracking-wider mt-0.5"
                style={{ fontFamily:"var(--font-mono)" }}>{label}</p>
            </div>
          ))}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <motion.div className="w-12 h-12 rounded-full border-4 border-[#a855f733] border-t-[#a855f7] mb-3"
              animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:1, ease:"linear" }}/>
            <p className="text-xs text-[#3d6080]" style={{ fontFamily:"var(--font-mono)" }}>Analyzing page...</p>
          </div>
        )}

        {err && (
          <div className="p-3 rounded-xl border border-[#f43f8e30] bg-[#f43f8e08] text-[11px] text-[#f43f8e]"
            style={{ fontFamily:"var(--font-mono)" }}>{err}</div>
        )}

        {data && (
          <div className="space-y-4">
            {/* Verdict terminal card */}
            <AiTerminalCard verdict={data.verdict} color={healthColor}/>

            {/* Summary */}
            <div className="p-4 rounded-xl border bg-[#04080f]"
              style={{ borderColor:`${healthColor}30` }}>
              <p className="text-xs text-[#8ab4d4] leading-relaxed"
                style={{ fontFamily:"var(--font-mono)" }}>{data.summary}</p>
            </div>

            {/* Problems */}
            {data.problems?.length > 0 && (
              <div>
                <p className="text-[10px] text-[#f43f8e] uppercase tracking-widest mb-2"
                  style={{ fontFamily:"var(--font-mono)" }}>Problems Detected</p>
                <div className="space-y-2">
                  {data.problems.map((p, i) => {
                    const sc = { high:"#f43f8e", medium:"#f59e0b", low:"#3d6080" }[p.severity]||"#3d6080";
                    return (
                      <motion.div key={i} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                        transition={{ delay:i*0.1 }}
                        className="p-3 rounded-xl border"
                        style={{ borderColor:`${sc}25`, background:`${sc}08` }}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-bold text-[#e8f4ff]">{p.issue}</p>
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase"
                            style={{ color:sc, background:`${sc}20`, fontFamily:"var(--font-mono)" }}>
                            {p.severity}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#3d6080]"
                          style={{ fontFamily:"var(--font-mono)" }}>→ {p.fix}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Opportunities */}
            {data.opportunities?.length > 0 && (
              <div>
                <p className="text-[10px] text-[#10d990] uppercase tracking-widest mb-2"
                  style={{ fontFamily:"var(--font-mono)" }}>Opportunities</p>
                <div className="space-y-2">
                  {data.opportunities.map((o, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-xl border border-[#10d99020] bg-[#10d99008]">
                      <span className="text-[#10d990] mt-0.5">💡</span>
                      <p className="text-[11px] text-[#8ab4d4]" style={{ fontFamily:"var(--font-mono)" }}>{o}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* ── AI Chat ── */
const AiChat = ({ projectId, from, to }) => {
  const [msgs, setMsgs]       = useState([
    { role:"ai", text:"Hi! I'm PulseIQ AI. Ask me anything about your analytics — \"Why is bounce rate high?\", \"Which page drops the most users?\", \"What should I improve first?\"" }
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const endRef                = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  const ask = async () => {
    if (!input.trim() || loading) return;
    const q = input.trim(); setInput("");
    setMsgs(m => [...m, { role:"user", text:q }]);
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/ai/chat`, {
        method:"POST", headers:authHdr(),
        body: JSON.stringify({ projectId, question:q, from, to }),
      });
      const data = await res.json();
      setMsgs(m => [...m, { role:"ai", text:data.data || "Sorry, couldn't answer that." }]);
    } catch {
      setMsgs(m => [...m, { role:"ai", text:"Connection error. Please try again." }]);
    } finally { setLoading(false); }
  };

  const SUGGESTIONS = [
    "Why is my bounce rate high?",
    "Which page has most drop-off?",
    "What should I improve first?",
    "Predict next week's DAU",
  ];

  return (
    <div className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden flex flex-col"
      style={{ boxShadow:"0 4px 24px #00000055", height:"400px" }}>
      <div className="h-[2px]" style={{ background:"linear-gradient(90deg,#a855f7,#f43f8e,#00e5ff)" }}/>
      <div className="flex items-center gap-2 px-5 py-3 border-b border-[#1a2a4a]">
        <div className="w-7 h-7 rounded-xl bg-[#a855f715] border border-[#a855f730] flex items-center justify-center">
          <MessageSquare className="w-3.5 h-3.5 text-[#a855f7]"/>
        </div>
        <div className="flex-1">
          <p className="text-xs font-black text-[#e8f4ff] uppercase" style={{ fontFamily:"var(--font-display)" }}>
            AI Analytics Chat
          </p>
        </div>
        <span className="text-[9px] text-[#a855f7]" style={{ fontFamily:"var(--font-mono)" }}>Gemini AI</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role==="user"?"justify-end":"justify-start"}`}>
            <div className="max-w-[88%] px-3 py-2.5 rounded-2xl text-[11px] leading-relaxed"
              style={{
                background: m.role==="user" ? "#a855f720" : "#04080f",
                border: `1px solid ${m.role==="user" ? "#a855f740" : "#1a2a4a"}`,
                color: "#8ab4d4",
                fontFamily: "var(--font-mono)",
              }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-[#04080f] border border-[#1a2a4a]">
              {[0,1,2].map(i => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-[#a855f7]"
                  animate={{ scale:[1,1.5,1], opacity:[0.5,1,0.5] }}
                  transition={{ duration:0.8, delay:i*0.2, repeat:Infinity }}/>
              ))}
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>

      {/* Quick suggestions */}
      {msgs.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => { setInput(s); setTimeout(ask, 50); }}
              className="text-[9px] px-2.5 py-1 rounded-full border border-[#1a2a4a] text-[#3d6080] hover:border-[#a855f730] hover:text-[#a855f7] transition-all"
              style={{ fontFamily:"var(--font-mono)" }}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 px-4 py-3 border-t border-[#1a2a4a]">
        <input
          className="flex-1 bg-[#04080f] border border-[#1a2a4a] rounded-xl px-3 py-2 text-[11px] text-[#e8f4ff] placeholder:text-[#1a3a6b] focus:outline-none focus:border-[#a855f744]"
          style={{ fontFamily:"var(--font-mono)" }}
          placeholder="Ask about your analytics..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==="Enter" && ask()}
        />
        <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
          onClick={ask} disabled={loading||!input.trim()}
          className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40 transition-all"
          style={{ background:"#a855f7" }}>
          <Send className="w-3.5 h-3.5 text-white"/>
        </motion.button>
      </div>
    </div>
  );
};

/* ── Not Verified Screen ── */
const NotVerifiedScreen = ({ project, verifySdk, onSetup, onSkip, onVerified }) => {
  const { inGrace, daysLeft } = getGraceInfo(project);
  const [checking, setChecking] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const pollRef = useRef(null);

  const startCheck = () => {
    setChecking(true);
    let count = 0;
    const check = async () => {
      try {
        const res = await verifySdk(project._id);
        if (res?.verified) { onVerified(); return; }
        if (count++ >= 12) { setChecking(false); return; }
        pollRef.current = setTimeout(check, 5000);
      } catch { setChecking(false); }
    };
    check();
  };

  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
        style={{ background:inGrace?"#f59e0b10":"#f43f8e10", border:`2px solid ${inGrace?"#f59e0b30":"#f43f8e30"}` }}>
        {inGrace ? <Lock className="w-9 h-9 text-[#f59e0b]"/> : <XCircle className="w-9 h-9 text-[#f43f8e]"/>}
      </div>
      <h2 className="text-xl font-black text-[#e8f4ff] uppercase mb-2" style={{ fontFamily:"var(--font-display)" }}>
        {inGrace ? "SDK Not Verified" : "Grace Period Expired"}
      </h2>
      <p className="text-sm text-[#3d6080] max-w-sm mb-6" style={{ fontFamily:"var(--font-mono)" }}>
        {inGrace ? `${daysLeft}d left. Verify SDK to unlock analytics permanently.`
                 : "Verify your SDK to access analytics."}
      </p>
      <div className="flex gap-3">
        <button onClick={onSetup}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#00e5ff30] text-[#00e5ff] text-xs uppercase tracking-wider font-bold hover:bg-[#00e5ff10] transition-all"
          style={{ fontFamily:"var(--font-mono)" }}>
          <Terminal className="w-3.5 h-3.5"/> SDK Setup
        </button>
        <motion.button whileTap={{ scale:0.97 }}
          onClick={checking ? () => { clearTimeout(pollRef.current); setChecking(false); } : startCheck}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest text-[#020408]"
          style={{ background:"linear-gradient(135deg,#10d990,#00e5ff)", fontFamily:"var(--font-display)" }}>
          {checking ? (
            <><motion.div className="w-3.5 h-3.5 rounded-full border-2 border-[#020408]/40 border-t-[#020408]"
              animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:0.9, ease:"linear" }}/> Listening...</>
          ) : <><Zap className="w-3.5 h-3.5"/> Verify SDK</>}
        </motion.button>
      </div>
      {inGrace && (
        <button onClick={async () => { setSkipping(true); try { await onSkip(); } finally { setSkipping(false); } }}
          disabled={skipping}
          className="mt-4 text-[11px] text-[#3d6080] hover:text-[#8ab4d4] flex items-center gap-1.5"
          style={{ fontFamily:"var(--font-mono)" }}>
          <Info className="w-3.5 h-3.5"/> {skipping?"Skipping...":`Skip for now (${daysLeft}d left)`}
        </button>
      )}
    </motion.div>
  );
};

/* ══════════════════════════
   MAIN
══════════════════════════ */
const OrgAnalytics = () => {
  const {
    getMyWorkspaces, getProjects, getAnalyticsOverview, getDau,
    getMau, getPageAnalytics, getRetention, getEventTrend, getHeatmap, getSessions, getExamAnalytics,
    getAiInsights, askAiChat, getPageAiInsights,
    verifySdk, skipVerification, loading
  } = useOrgApi();

  const [workspaces, setWorkspaces]   = useState([]);
  const [projects, setProjects]       = useState([]);
  const [selectedWs, setSelectedWs]   = useState(null);
  const [selectedProj, setSelectedProj] = useState(null);
  const [overview, setOverview]       = useState(null);
  const [dauData, setDauData]         = useState([]);
  const [mauCount, setMauCount]       = useState(null);
  const [retentionData, setRetentionData] = useState([]);
  const [eventTrendData, setEventTrendData] = useState([]);
  const [pageData, setPageData]       = useState([]);
  const [heatmapData, setHeatmapData] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [examData, setExamData]       = useState(null);
  const [dateRange, setDateRange]     = useState("7d");
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [showSdkDrawer, setShowSdkDrawer] = useState(false);
  const [activeTab, setActiveTab]     = useState("overview");
  const [refreshKey, setRefreshKey] = useState(0);

  // AI state
  const [aiData, setAiData]           = useState(null);
  const [aiLoading, setAiLoading]     = useState(false);
  const [aiError, setAiError]         = useState("");

  // Page AI panel
  const [pagePanel, setPagePanel]     = useState(null);

  const getRange = () => {
    const to   = new Date();
    const days = dateRange==="7d" ? 7 : dateRange==="30d" ? 30 : 90;
    return { from: new Date(Date.now() - days*86400000).toISOString(), to: to.toISOString() };
  };

  const projDot = (p) => {
    if (p.sdkVerified) return "#10d990";
    return getGraceInfo(p).inGrace ? "#f59e0b" : "#f43f8e";
  };

  const refreshProjects = useCallback(async () => {
    const res  = await getProjects();
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

  useEffect(() => {
    if (!selectedWs) return;
    const wsProjs = projects.filter(p => (p.workspaceId?._id||p.workspaceId) === selectedWs._id);
    if (wsProjs.length > 0 && (!selectedProj || !wsProjs.find(p => p._id === selectedProj._id)))
      setSelectedProj(wsProjs[0]);
    if (wsProjs.length === 0) setSelectedProj(null);
  }, [selectedWs, projects]);

  // Load analytics
  useEffect(() => {
    if (!selectedProj || !canAccess(selectedProj)) return;
    setAnalyticsLoading(true);
    setAiData(null);
    const { from, to } = getRange();
    const id = selectedProj._id;

    Promise.all([
      fetch(`${BASE}/api/analytics/overview?projectId=${id}&from=${from}&to=${to}`,       { headers:authHdr() }).then(r=>r.json()),
      fetch(`${BASE}/api/analytics/dau?projectId=${id}&from=${from}&to=${to}`,            { headers:authHdr() }).then(r=>r.json()),
      fetch(`${BASE}/api/analytics/mau?projectId=${id}`,                                  { headers:authHdr() }).then(r=>r.json()),
      fetch(`${BASE}/api/analytics/retention?projectId=${id}&from=${from}&to=${to}`,      { headers:authHdr() }).then(r=>r.json()),
      fetch(`${BASE}/api/analytics/event-trend?projectId=${id}&from=${from}&to=${to}`,    { headers:authHdr() }).then(r=>r.json()),
      fetch(`${BASE}/api/analytics/page-analytics?projectId=${id}&from=${from}&to=${to}`, { headers:authHdr() }).then(r=>r.json()),
      fetch(`${BASE}/api/analytics/heatmap?projectId=${id}&from=${from}&to=${to}`,        { headers:authHdr() }).then(r=>r.json()),
      fetch(`${BASE}/api/analytics/sessions?projectId=${id}&from=${from}&to=${to}`,       { headers:authHdr() }).then(r=>r.json()),
      fetch(`${BASE}/api/analytics/exam?projectId=${id}&from=${from}&to=${to}`,           { headers:authHdr() }).then(r=>r.json()),
    ]).then(([ov, dau, mau_, ret, trend, pg, hm, sess, exam]) => {
      setOverview(ov?.data);
      setDauData((dau?.data||[]).map(d => ({ date:d._id?.slice(5)||"", users:d.activeUsers||0 })));
      setMauCount(mau_?.data ?? null);
      setRetentionData(ret?.data || []);
      const tMap = {};
      (trend?.data||[]).forEach(({ _id, count }) => {
        const day = _id?.day||"";
        if (!tMap[day]) tMap[day] = { date:day.slice(5) };
        tMap[day][_id?.event||"event"] = count;
      });
      setEventTrendData(Object.values(tMap).slice(-14));
      setPageData(pg?.data?.pages || []);
      setHeatmapData(hm?.data || null);
      setSessionData(sess?.data || null);
      setExamData(exam?.data || null);
    }).finally(() => setAnalyticsLoading(false));
  }, [selectedProj?._id, dateRange, refreshKey]);

  const loadAiInsights = useCallback(async () => {
    if (!selectedProj || !canAccess(selectedProj)) return;
    setAiLoading(true); setAiError("");
    const { from, to } = getRange();
    try {
      const res  = await fetch(`${BASE}/api/ai/insights`, {
        method:"POST", headers:authHdr(),
        body: JSON.stringify({ projectId:selectedProj._id, from, to, projectName:selectedProj.name }),
      });
      const data = await res.json();
      if (data.success) setAiData(data.data);
      else setAiError(data.message || "AI insights unavailable");
    } catch { setAiError("Failed to load AI insights"); }
    finally { setAiLoading(false); }
  }, [selectedProj?._id, dateRange]);

  const handleVerified = async () => {
    const list  = await refreshProjects();
    const fresh = list.find(p => p._id === selectedProj?._id);
    if (fresh) setSelectedProj(fresh);
    setRefreshKey((value) => value + 1);
  };

  const handleSkip = async () => {
    try {
      await skipVerification(selectedProj._id);
      const list  = await refreshProjects();
      const fresh = list.find(p => p._id === selectedProj?._id);
      if (fresh) setSelectedProj({ ...fresh, skippedVerification:true });
      setRefreshKey((value) => value + 1);
    } catch {}
  };

  const wsProjects = selectedWs ? projects.filter(p => (p.workspaceId?._id||p.workspaceId) === selectedWs._id) : [];
  const accessible = canAccess(selectedProj);
  const { inGrace, daysLeft } = getGraceInfo(selectedProj);
  const { from: rangeFrom, to: rangeTo } = getRange();
  const healthColor = (s) => s>=75?"#10d990":s>=50?"#f59e0b":"#f43f8e";

  const TABS = [
    { id:"overview",  label:"Overview",    icon:BarChart3    },
    { id:"pages",     label:"Pages",       icon:Globe        },
    { id:"events",    label:"Events",      icon:Activity     },
    { id:"retention", label:"Retention",   icon:Users        },
    { id:"journeys",  label:"Journeys",    icon:Eye          },
    { id:"ai",        label:"AI Insights", icon:BrainCircuit },
  ];

  return (
    <OrgLayout>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="mb-6">
          <p className="text-[10px] text-[#10d990] uppercase tracking-[0.3em] mb-1"
            style={{ fontFamily:"var(--font-mono)" }}>Organizer / Analytics</p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-2xl font-black text-[#e8f4ff] uppercase"
              style={{ fontFamily:"var(--font-display)" }}>Analytics</h1>
            <div className="flex gap-2 flex-wrap items-center">
              {accessible && ["7d","30d","90d"].map(r => (
                <button key={r} onClick={() => setDateRange(r)}
                  className="px-3 py-2 rounded-xl text-[10px] uppercase tracking-wider font-bold border transition-all"
                  style={{ borderColor:dateRange===r?"#10d99050":"#1a2a4a", background:dateRange===r?"#10d99015":"transparent", color:dateRange===r?"#10d990":"#3d6080", fontFamily:"var(--font-mono)" }}>
                  {r}
                </button>
              ))}
              <motion.button whileTap={{ scale:0.95 }} onClick={() => { loadAll(); setRefreshKey((value) => value + 1); }}
                className="px-3 py-2 rounded-xl border border-[#1a2a4a] text-[#3d6080] hover:text-[#10d990] hover:border-[#10d99033] transition-all">
                <RefreshCw className="w-4 h-4"/>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Workspace + Project selector */}
        {workspaces.length > 0 && (
          <div className="space-y-2 mb-5">
            <div className="flex gap-2 flex-wrap">
              {workspaces.map(ws => (
                <button key={ws._id}
                  onClick={() => { setSelectedWs(ws); setSelectedProj(null); setOverview(null); setDauData([]); setAiData(null); }}
                  className="px-4 py-2 rounded-xl text-[11px] uppercase tracking-wider font-bold border transition-all"
                  style={{ borderColor:selectedWs?._id===ws._id?"#10d99050":"#1a2a4a", background:selectedWs?._id===ws._id?"#10d99015":"transparent", color:selectedWs?._id===ws._id?"#10d990":"#3d6080", fontFamily:"var(--font-mono)" }}>
                  {ws.name}
                </button>
              ))}
            </div>
            {wsProjects.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {wsProjects.map(proj => {
                  const dot = projDot(proj);
                  const sel = selectedProj?._id === proj._id;
                  return (
                    <button key={proj._id}
                      onClick={() => { setSelectedProj(proj); setOverview(null); setDauData([]); setAiData(null); }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] uppercase tracking-wider font-bold border transition-all"
                      style={{ borderColor:sel?"#00e5ff50":"#1a2a4a", background:sel?"#00e5ff15":"transparent", color:sel?"#00e5ff":"#3d6080", fontFamily:"var(--font-mono)" }}>
                      <span className="w-2 h-2 rounded-full relative flex-shrink-0" style={{ background:dot }}>
                        {!proj.sdkVerified && getGraceInfo(proj).inGrace &&
                          <span className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ background:dot }}/>}
                      </span>
                      {proj.name}
                      {proj.sdkVerified
                        ? <CheckCircle2 className="w-3 h-3 text-[#10d990]"/>
                        : <span className="text-[8px]" style={{ color:dot, fontFamily:"var(--font-mono)" }}>
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

        {/* Empty */}
        {workspaces.length === 0 && !loading && (
          <div className="text-center py-20">
            <BarChart3 className="w-12 h-12 text-[#1a3a6b] mx-auto mb-4"/>
            <p className="text-sm text-[#3d6080]" style={{ fontFamily:"var(--font-mono)" }}>Create a workspace and project first.</p>
          </div>
        )}

        {/* Not verified */}
        {selectedProj && !accessible && (
          <NotVerifiedScreen project={selectedProj} verifySdk={verifySdk}
            onSetup={() => setShowSdkDrawer(true)} onVerified={handleVerified} onSkip={handleSkip}/>
        )}

        {/* Analytics */}
        {selectedProj && accessible && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>

            {/* Grace warning */}
            {!selectedProj.sdkVerified && inGrace && (
              <div className="flex items-center gap-3 p-3 rounded-xl border mb-5 flex-wrap"
                style={{ background:"#f59e0b08", borderColor:"#f59e0b30" }}>
                <AlertTriangle className="w-4 h-4 text-[#f59e0b] flex-shrink-0"/>
                <p className="text-[11px] font-bold text-[#f59e0b] flex-1"
                  style={{ fontFamily:"var(--font-mono)" }}>
                  SDK not verified — {daysLeft}d left. Analytics will lock after grace period.
                </p>
                <button onClick={() => setShowSdkDrawer(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[10px] text-[#020408] bg-[#f59e0b]"
                  style={{ fontFamily:"var(--font-mono)" }}>
                  <Zap className="w-3 h-3"/> Verify Now
                </button>
              </div>
            )}

            <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-[#1a2a4a] bg-[#04080f] p-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#10d990]" style={{ fontFamily:"var(--font-mono)" }}>
                  Detected Category
                </p>
                <p className="text-sm font-bold text-[#e8f4ff]">
                  {overview?.category?.label || selectedProj.categoryLabel || "General Web App"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-[#3d6080]" style={{ fontFamily:"var(--font-mono)" }}>
                  Journey Mode
                </p>
                <p className="text-[11px] text-[#8ab4d4]" style={{ fontFamily:"var(--font-mono)" }}>
                  {overview?.category?.journeysLabel || "User journeys"}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap mb-6">
              {TABS.map(({ id, label, icon:Icon }) => (
                <button key={id}
                  onClick={() => { setActiveTab(id); if (id==="ai" && !aiData) loadAiInsights(); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] uppercase tracking-wider font-bold border transition-all"
                  style={{ borderColor:activeTab===id?"#10d99050":"#1a2a4a", background:activeTab===id?"#10d99015":"transparent", color:activeTab===id?"#10d990":"#3d6080", fontFamily:"var(--font-mono)" }}>
                  <Icon className="w-3.5 h-3.5"/>
                  {label}
                  {id==="ai" && <Sparkles className="w-3 h-3 text-[#a855f7]"/>}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">

              {/* ── OVERVIEW ── */}
              {activeTab==="overview" && (
                <motion.div key="overview" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}>
                  {/* Stats — DAU, MAU, Events, Bounce */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                    <StatCard icon={Activity}    label="Total Events"  value={analyticsLoading?"—":(overview?.totalEvents??0).toLocaleString()} color="#00e5ff" delay={0}/>
                    <StatCard icon={Users}       label="DAU Today"     value={analyticsLoading?"—":(overview?.dauToday??0).toLocaleString()} sub={`MAU: ${mauCount??"—"}`} color="#10d990" delay={0.07}/>
                    <StatCard icon={TrendingUp}  label="Unique Users"  value={analyticsLoading?"—":(overview?.uniqueUsers??0).toLocaleString()} color="#a855f7" delay={0.14}/>
                    <StatCard icon={MousePointer} label="Bounce Rate"  value={analyticsLoading?"—":`${overview?.bounceRate??0}%`} color="#f59e0b" delay={0.21}/>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
                    {/* DAU chart */}
                    <motion.div className="lg:col-span-2 rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5"
                      style={{ boxShadow:"0 4px 24px #00000055" }}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-[10px] text-[#00e5ff] uppercase tracking-widest mb-0.5"
                            style={{ fontFamily:"var(--font-mono)" }}>Daily Active</p>
                          <h3 className="text-sm font-black text-[#e8f4ff] uppercase"
                            style={{ fontFamily:"var(--font-display)" }}>User Activity</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-[#10d990]"
                            style={{ fontFamily:"var(--font-display)" }}>MAU</p>
                          <p className="text-lg font-black text-[#e8f4ff]"
                            style={{ fontFamily:"var(--font-display)" }}>
                            {mauCount ?? "—"}
                          </p>
                        </div>
                      </div>
                      {analyticsLoading ? (
                        <div className="flex justify-center items-center h-48">
                          <motion.div className="w-8 h-8 rounded-full border-2 border-[#00e5ff33] border-t-[#00e5ff]"
                            animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:0.9, ease:"linear" }}/>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={200}>
                          <AreaChart data={dauData} margin={{ top:5, right:5, bottom:0, left:-20 }}>
                            <defs>
                              <linearGradient id="gCyan" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1a2a4a" vertical={false}/>
                            <XAxis dataKey="date" tick={{ fill:"#3d6080", fontSize:9, fontFamily:"var(--font-mono)" }} axisLine={false} tickLine={false}/>
                            <YAxis tick={{ fill:"#3d6080", fontSize:9, fontFamily:"var(--font-mono)" }} axisLine={false} tickLine={false}/>
                            <Tooltip content={<Tip />}/>
                            <Area type="monotone" dataKey="users" name="Active Users" stroke="#00e5ff" strokeWidth={2} fill="url(#gCyan)" dot={false} activeDot={{ r:4, fill:"#00e5ff" }}/>
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </motion.div>

                    {/* Top Events */}
                    <motion.div className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5"
                      style={{ boxShadow:"0 4px 24px #00000055" }}>
                      <p className="text-[10px] text-[#10d990] uppercase tracking-widest mb-0.5"
                        style={{ fontFamily:"var(--font-mono)" }}>Most Frequent</p>
                      <h3 className="text-sm font-black text-[#e8f4ff] uppercase mb-4"
                        style={{ fontFamily:"var(--font-display)" }}>Top Events</h3>
                      {analyticsLoading ? (
                        <div className="flex justify-center items-center h-40">
                          <motion.div className="w-7 h-7 rounded-full border-2 border-[#10d99033] border-t-[#10d990]"
                            animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:0.9, ease:"linear" }}/>
                        </div>
                      ) : !overview?.topEvents?.length ? (
                        <p className="text-[11px] text-[#3d6080] text-center mt-8" style={{ fontFamily:"var(--font-mono)" }}>No events yet</p>
                      ) : (
                        <div className="space-y-2.5">
                          {overview.topEvents.slice(0,6).map((e,i) => (
                            <div key={e._id}>
                              <div className="flex justify-between mb-1">
                                <code className="text-[10px]" style={{ color:PIE_COLORS[i%PIE_COLORS.length], fontFamily:"var(--font-mono)" }}>{e._id}</code>
                                <span className="text-[10px] text-[#3d6080] font-bold" style={{ fontFamily:"var(--font-mono)" }}>{e.count.toLocaleString()}</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-[#1a2a4a] overflow-hidden">
                                <motion.div className="h-full rounded-full"
                                  style={{ background:PIE_COLORS[i%PIE_COLORS.length] }}
                                  initial={{ width:0 }}
                                  animate={{ width:`${(e.count/(overview.topEvents[0]?.count||1))*100}%` }}
                                  transition={{ delay:0.2+i*0.1, duration:0.8, ease:"easeOut" }}/>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Hourly heatmap */}
                  <motion.div className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5"
                    style={{ boxShadow:"0 4px 24px #00000055" }}>
                    <p className="text-[10px] text-[#f59e0b] uppercase tracking-widest mb-0.5"
                      style={{ fontFamily:"var(--font-mono)" }}>Peak Activity</p>
                    <h3 className="text-sm font-black text-[#e8f4ff] uppercase mb-4"
                      style={{ fontFamily:"var(--font-display)" }}>Hourly Distribution</h3>
                    {!overview?.hourlyDistribution ? (
                      <p className="text-[11px] text-[#3d6080] text-center" style={{ fontFamily:"var(--font-mono)" }}>No data</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={120}>
                        <BarChart data={overview.hourlyDistribution} margin={{ top:5, right:5, bottom:0, left:-20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1a2a4a" vertical={false}/>
                          <XAxis dataKey="hour" tick={{ fill:"#3d6080", fontSize:7, fontFamily:"var(--font-mono)" }} axisLine={false} tickLine={false}/>
                          <YAxis tick={{ fill:"#3d6080", fontSize:9, fontFamily:"var(--font-mono)" }} axisLine={false} tickLine={false}/>
                          <Tooltip content={<Tip />}/>
                          <Bar dataKey="count" name="Events" fill="#f59e0b" radius={[2,2,0,0]} opacity={0.8}/>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </motion.div>
                </motion.div>
              )}

              {/* ── PAGES TAB ── */}
              {activeTab==="pages" && (
                <motion.div key="pages" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[10px] text-[#a855f7] uppercase tracking-widest mb-0.5"
                        style={{ fontFamily:"var(--font-mono)" }}>Page Analytics</p>
                      <h2 className="text-base font-black text-[#e8f4ff] uppercase"
                        style={{ fontFamily:"var(--font-display)" }}>All Pages</h2>
                    </div>
                    <p className="text-[10px] text-[#3d6080]" style={{ fontFamily:"var(--font-mono)" }}>
                      Click a page → AI Analysis
                    </p>
                  </div>

                  {analyticsLoading ? (
                    <div className="flex justify-center py-16">
                      <motion.div className="w-8 h-8 rounded-full border-2 border-[#a855f733] border-t-[#a855f7]"
                        animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:0.9, ease:"linear" }}/>
                    </div>
                  ) : !pageData.length ? (
                    <div className="text-center py-16">
                      <Globe className="w-10 h-10 text-[#1a3a6b] mx-auto mb-3"/>
                      <p className="text-sm text-[#3d6080]" style={{ fontFamily:"var(--font-mono)" }}>
                        No page_view events yet. Add PulseIQ.track("page_view") to your site.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden"
                      style={{ boxShadow:"0 4px 24px #00000055" }}>
                      <div className="h-[1.5px]" style={{ background:"linear-gradient(90deg,#a855f7,#f43f8e,transparent)" }}/>
                      {/* Header */}
                      <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-[#1a2a4a] text-[10px] text-[#3d6080] uppercase tracking-widest"
                        style={{ fontFamily:"var(--font-mono)" }}>
                        <span>Page</span><span>Views</span><span>Users</span><span>AI</span>
                      </div>
                      {pageData.map((pg, i) => (
                        <motion.div key={pg._id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.04 }}
                          className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 items-center px-5 py-3.5 border-b border-[#1a2a4a]/50 last:border-0 hover:bg-[#ffffff04] transition-colors">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background:`${PIE_COLORS[i%PIE_COLORS.length]}15`, border:`1px solid ${PIE_COLORS[i%PIE_COLORS.length]}30` }}>
                              <Globe className="w-3 h-3" style={{ color:PIE_COLORS[i%PIE_COLORS.length] }}/>
                            </div>
                            <code className="text-[11px] text-[#e8f4ff] truncate" style={{ fontFamily:"var(--font-mono)" }}>
                              {pg._id || "/"}
                            </code>
                          </div>
                          <span className="text-[11px] font-bold text-[#00e5ff]" style={{ fontFamily:"var(--font-mono)" }}>
                            {(pg.totalViews||0).toLocaleString()}
                          </span>
                          <span className="text-[11px] text-[#10d990]" style={{ fontFamily:"var(--font-mono)" }}>
                            {(pg.uniqueUsers||0).toLocaleString()}
                          </span>
                          <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                            onClick={() => setPagePanel(pg)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[9px] uppercase tracking-wider font-bold border transition-all"
                            style={{ borderColor:"#a855f730", background:"#a855f710", color:"#a855f7", fontFamily:"var(--font-mono)" }}>
                            <Sparkles className="w-3 h-3"/> AI
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Bar chart */}
                  {pageData.length > 0 && (
                    <motion.div className="mt-5 rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5"
                      style={{ boxShadow:"0 4px 24px #00000055" }}>
                      <p className="text-[10px] text-[#a855f7] uppercase tracking-widest mb-0.5"
                        style={{ fontFamily:"var(--font-mono)" }}>Comparison</p>
                      <h3 className="text-sm font-black text-[#e8f4ff] uppercase mb-4"
                        style={{ fontFamily:"var(--font-display)" }}>Page Views vs Unique Users</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={pageData.slice(0,8).map(p => ({ page:(p._id||"/").slice(0,14), views:p.totalViews, users:p.uniqueUsers }))}
                          margin={{ top:5, right:5, bottom:10, left:-20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1a2a4a" vertical={false}/>
                          <XAxis dataKey="page" tick={{ fill:"#3d6080", fontSize:8, fontFamily:"var(--font-mono)" }} axisLine={false} tickLine={false}/>
                          <YAxis tick={{ fill:"#3d6080", fontSize:9, fontFamily:"var(--font-mono)" }} axisLine={false} tickLine={false}/>
                          <Tooltip content={<Tip />}/>
                          <Bar dataKey="views" name="Views"   fill="#a855f7" radius={[4,4,0,0]} opacity={0.9}/>
                          <Bar dataKey="users" name="Users"   fill="#f43f8e" radius={[4,4,0,0]} opacity={0.9}/>
                        </BarChart>
                      </ResponsiveContainer>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* ── EVENTS TAB ── */}
              {activeTab==="events" && (
                <motion.div key="events" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5" style={{ boxShadow:"0 4px 24px #00000055" }}>
                      <p className="text-[10px] text-[#00e5ff] uppercase tracking-widest mb-0.5" style={{ fontFamily:"var(--font-mono)" }}>Volume</p>
                      <h3 className="text-sm font-black text-[#e8f4ff] uppercase mb-4" style={{ fontFamily:"var(--font-display)" }}>Top Events</h3>
                      {!overview?.topEvents?.length ? (
                        <p className="text-[11px] text-[#3d6080] mt-8 text-center" style={{ fontFamily:"var(--font-mono)" }}>No events</p>
                      ) : (
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={overview.topEvents.map(e=>({ name:e._id, count:e.count }))}
                            layout="vertical" margin={{ top:5, right:20, bottom:0, left:10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1a2a4a" horizontal={false}/>
                            <XAxis type="number" tick={{ fill:"#3d6080", fontSize:9, fontFamily:"var(--font-mono)" }} axisLine={false} tickLine={false}/>
                            <YAxis type="category" dataKey="name" tick={{ fill:"#8ab4d4", fontSize:9, fontFamily:"var(--font-mono)" }} axisLine={false} tickLine={false} width={90}/>
                            <Tooltip content={<Tip />}/>
                            <Bar dataKey="count" name="Count" radius={[0,4,4,0]}>
                              {overview.topEvents.map((_,i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    <div className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5" style={{ boxShadow:"0 4px 24px #00000055" }}>
                      <p className="text-[10px] text-[#10d990] uppercase tracking-widest mb-0.5" style={{ fontFamily:"var(--font-mono)" }}>Distribution</p>
                      <h3 className="text-sm font-black text-[#e8f4ff] uppercase mb-4" style={{ fontFamily:"var(--font-display)" }}>Event Share</h3>
                      {!overview?.topEvents?.length ? (
                        <p className="text-[11px] text-[#3d6080] mt-8 text-center" style={{ fontFamily:"var(--font-mono)" }}>No events</p>
                      ) : (
                        <>
                          <ResponsiveContainer width="100%" height={160}>
                            <PieChart>
                              <Pie data={overview.topEvents.map(e=>({ name:e._id, value:e.count }))}
                                cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                                paddingAngle={3} dataKey="value" stroke="none">
                                {overview.topEvents.map((_,i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                              </Pie>
                              <Tooltip content={<Tip />}/>
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {overview.topEvents.slice(0,6).map((e,i) => (
                              <div key={e._id} className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ background:PIE_COLORS[i%PIE_COLORS.length] }}/>
                                <span className="text-[9px] text-[#3d6080]" style={{ fontFamily:"var(--font-mono)" }}>{e._id}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {eventTrendData.length > 0 && (
                      <div className="lg:col-span-2 rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5" style={{ boxShadow:"0 4px 24px #00000055" }}>
                        <p className="text-[10px] text-[#a855f7] uppercase tracking-widest mb-0.5" style={{ fontFamily:"var(--font-mono)" }}>Over Time</p>
                        <h3 className="text-sm font-black text-[#e8f4ff] uppercase mb-4" style={{ fontFamily:"var(--font-display)" }}>Event Trend</h3>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={eventTrendData} margin={{ top:5, right:5, bottom:0, left:-20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1a2a4a" vertical={false}/>
                            <XAxis dataKey="date" tick={{ fill:"#3d6080", fontSize:9, fontFamily:"var(--font-mono)" }} axisLine={false} tickLine={false}/>
                            <YAxis tick={{ fill:"#3d6080", fontSize:9, fontFamily:"var(--font-mono)" }} axisLine={false} tickLine={false}/>
                            <Tooltip content={<Tip />}/>
                            {Object.keys(eventTrendData[0]||{}).filter(k=>k!=="date").slice(0,5).map((key,i) => (
                              <Line key={key} type="monotone" dataKey={key} stroke={PIE_COLORS[i]} strokeWidth={1.5} dot={false}/>
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── RETENTION TAB ── */}
              {activeTab==="retention" && (
                <motion.div key="retention" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5" style={{ boxShadow:"0 4px 24px #00000055" }}>
                      <p className="text-[10px] text-[#a855f7] uppercase tracking-widest mb-0.5" style={{ fontFamily:"var(--font-mono)" }}>7-Day Cohort</p>
                      <h3 className="text-sm font-black text-[#e8f4ff] uppercase mb-4" style={{ fontFamily:"var(--font-display)" }}>User Retention</h3>
                      {!retentionData.length ? (
                        <p className="text-[11px] text-[#3d6080] mt-8 text-center" style={{ fontFamily:"var(--font-mono)" }}>Not enough data</p>
                      ) : (
                        <>
                          <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={retentionData} margin={{ top:5, right:5, bottom:0, left:-20 }}>
                              <defs>
                                <linearGradient id="gPurple" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1a2a4a" vertical={false}/>
                              <XAxis dataKey="day" tick={{ fill:"#3d6080", fontSize:9, fontFamily:"var(--font-mono)" }} axisLine={false} tickLine={false}/>
                              <YAxis tick={{ fill:"#3d6080", fontSize:9, fontFamily:"var(--font-mono)" }} axisLine={false} tickLine={false}/>
                              <Tooltip content={<Tip />}/>
                              <Area type="monotone" dataKey="rate" name="Retention %" stroke="#a855f7" strokeWidth={2} fill="url(#gPurple)" dot={{ r:3, fill:"#a855f7" }}/>
                            </AreaChart>
                          </ResponsiveContainer>
                          <div className="mt-3 grid grid-cols-4 gap-2">
                            {retentionData.slice(0,4).map(r => {
                              const c = r.rate>50?"#10d990":r.rate>20?"#f59e0b":"#f43f8e";
                              return (
                                <div key={r.day} className="text-center p-2 rounded-xl bg-[#04080f] border border-[#1a2a4a]">
                                  <p className="text-sm font-black" style={{ color:c, fontFamily:"var(--font-display)" }}>{r.rate}%</p>
                                  <p className="text-[9px] text-[#3d6080]" style={{ fontFamily:"var(--font-mono)" }}>{r.day}</p>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5" style={{ boxShadow:"0 4px 24px #00000055" }}>
                      <p className="text-[10px] text-[#f43f8e] uppercase tracking-widest mb-0.5" style={{ fontFamily:"var(--font-mono)" }}>Health</p>
                      <h3 className="text-sm font-black text-[#e8f4ff] uppercase mb-4" style={{ fontFamily:"var(--font-display)" }}>Retention Summary</h3>
                      <div className="space-y-2.5">
                        {[
                          { label:"Day 0 — Activation",  i:0, desc:"Active on first visit"     },
                          { label:"Day 1 — Next Day",    i:1, desc:"Returned next day"          },
                          { label:"Day 3 — Short-Term",  i:3, desc:"3-day retention"            },
                          { label:"Day 6 — Weekly",      i:6, desc:"Week-long retention"        },
                        ].map(({ label, i, desc }) => {
                          const val = retentionData[i]?.rate ?? 0;
                          const c   = val>50?"#10d990":val>20?"#f59e0b":"#f43f8e";
                          return (
                            <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-[#04080f] border border-[#1a2a4a]">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0"
                                style={{ background:`${c}15`, color:c, fontFamily:"var(--font-display)" }}>
                                {val}%
                              </div>
                              <div>
                                <p className="text-xs font-bold text-[#e8f4ff]">{label}</p>
                                <p className="text-[10px] text-[#3d6080]" style={{ fontFamily:"var(--font-mono)" }}>{desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab==="journeys" && (
                <motion.div key="journeys" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
                    <div className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5" style={{ boxShadow:"0 4px 24px #00000055" }}>
                      <p className="text-[10px] text-[#f59e0b] uppercase tracking-widest mb-0.5" style={{ fontFamily:"var(--font-mono)" }}>Heatmap</p>
                      <h3 className="text-sm font-black text-[#e8f4ff] uppercase mb-4" style={{ fontFamily:"var(--font-display)" }}>Interaction Readiness</h3>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="p-3 rounded-xl bg-[#04080f] border border-[#1a2a4a]">
                          <p className="text-lg font-black text-[#f59e0b]" style={{ fontFamily:"var(--font-display)" }}>{heatmapData?.points?.length || 0}</p>
                          <p className="text-[9px] text-[#3d6080] uppercase tracking-wider" style={{ fontFamily:"var(--font-mono)" }}>Click clusters</p>
                        </div>
                        <div className="p-3 rounded-xl bg-[#04080f] border border-[#1a2a4a]">
                          <p className="text-lg font-black text-[#a855f7]" style={{ fontFamily:"var(--font-display)" }}>{heatmapData?.scrollDepth?.[0]?.avgScrollDepth ?? 0}%</p>
                          <p className="text-[9px] text-[#3d6080] uppercase tracking-wider" style={{ fontFamily:"var(--font-mono)" }}>Avg scroll</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#8ab4d4] leading-relaxed" style={{ fontFamily:"var(--font-mono)" }}>
                        {heatmapData?.hasCoordinateData
                          ? "Coordinate click data is available. PulseIQ can now evolve into true click heatmaps from tracked x/y positions."
                          : "No coordinate-based click payloads detected yet. Send x/y coordinates from the tracking SDK to unlock true click heatmaps."}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5" style={{ boxShadow:"0 4px 24px #00000055" }}>
                      <p className="text-[10px] text-[#00e5ff] uppercase tracking-widest mb-0.5" style={{ fontFamily:"var(--font-mono)" }}>Session Journey</p>
                      <h3 className="text-sm font-black text-[#e8f4ff] uppercase mb-4" style={{ fontFamily:"var(--font-display)" }}>
                        {overview?.category?.journeysLabel || "User Journeys"}
                      </h3>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="p-3 rounded-xl bg-[#04080f] border border-[#1a2a4a]">
                          <p className="text-lg font-black text-[#00e5ff]" style={{ fontFamily:"var(--font-display)" }}>{sessionData?.summary?.totalSessions ?? 0}</p>
                          <p className="text-[9px] text-[#3d6080] uppercase tracking-wider" style={{ fontFamily:"var(--font-mono)" }}>Sessions</p>
                        </div>
                        <div className="p-3 rounded-xl bg-[#04080f] border border-[#1a2a4a]">
                          <p className="text-lg font-black text-[#10d990]" style={{ fontFamily:"var(--font-display)" }}>{sessionData?.summary?.avgDurationSeconds ?? 0}s</p>
                          <p className="text-[9px] text-[#3d6080] uppercase tracking-wider" style={{ fontFamily:"var(--font-mono)" }}>Avg duration</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#8ab4d4] leading-relaxed" style={{ fontFamily:"var(--font-mono)" }}>
                        PulseIQ now groups recent behavior into journey sessions so you can inspect event flow and engagement depth instead of isolated counts only.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5" style={{ boxShadow:"0 4px 24px #00000055" }}>
                      <p className="text-[10px] text-[#f43f8e] uppercase tracking-widest mb-0.5" style={{ fontFamily:"var(--font-mono)" }}>Exam Analytics</p>
                      <h3 className="text-sm font-black text-[#e8f4ff] uppercase mb-4" style={{ fontFamily:"var(--font-display)" }}>
                        {overview?.category?.key === "edtech" ? "Coaching & EdTech Signals" : "Category-Specific Signals"}
                      </h3>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="p-3 rounded-xl bg-[#04080f] border border-[#1a2a4a]">
                          <p className="text-lg font-black text-[#f43f8e]" style={{ fontFamily:"var(--font-display)" }}>{examData?.questionDropOffs?.[0]?.quits ?? 0}</p>
                          <p className="text-[9px] text-[#3d6080] uppercase tracking-wider" style={{ fontFamily:"var(--font-mono)" }}>Top quits</p>
                        </div>
                        <div className="p-3 rounded-xl bg-[#04080f] border border-[#1a2a4a]">
                          <p className="text-lg font-black text-[#f59e0b]" style={{ fontFamily:"var(--font-display)" }}>{examData?.reattempts?.[0]?.reattemptRate ?? 0}%</p>
                          <p className="text-[9px] text-[#3d6080] uppercase tracking-wider" style={{ fontFamily:"var(--font-mono)" }}>Reattempt rate</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#8ab4d4] leading-relaxed" style={{ fontFamily:"var(--font-mono)" }}>
                        {overview?.category?.key === "edtech"
                          ? examData?.hasExamSignals
                            ? "Exam-specific signals are being detected, including question drop-offs, section friction, and reattempt behavior."
                            : "No exam-specific event stream detected yet. Track question quits, retries, and timeSpent payloads to unlock this module."
                          : `This project is classified as ${overview?.category?.label || "General Web App"}, so PulseIQ prioritizes ${overview?.category?.journeysLabel?.toLowerCase() || "user journeys"} over exam-only reporting.`}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5" style={{ boxShadow:"0 4px 24px #00000055" }}>
                      <p className="text-[10px] text-[#00e5ff] uppercase tracking-widest mb-0.5" style={{ fontFamily:"var(--font-mono)" }}>Recent Journeys</p>
                      <h3 className="text-sm font-black text-[#e8f4ff] uppercase mb-4" style={{ fontFamily:"var(--font-display)" }}>Latest Session Paths</h3>
                      <div className="space-y-3">
                        {(sessionData?.sessions || []).slice(0,4).map((s, i) => (
                          <div key={s.sessionId || i} className="p-3 rounded-xl bg-[#04080f] border border-[#1a2a4a]">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-bold text-[#e8f4ff]">{s.userKey || "anonymous"}</p>
                              <p className="text-[9px] text-[#3d6080]" style={{ fontFamily:"var(--font-mono)" }}>{s.durationSeconds}s</p>
                            </div>
                            <p className="text-[10px] text-[#8ab4d4] leading-relaxed" style={{ fontFamily:"var(--font-mono)" }}>
                              {(s.events || []).map(e => e.eventName).join(" → ") || "No event chain"}
                            </p>
                          </div>
                        ))}
                        {!sessionData?.sessions?.length && (
                          <p className="text-[11px] text-[#3d6080]" style={{ fontFamily:"var(--font-mono)" }}>No session journeys available yet.</p>
                        )}
                      </div>
                    </div>

                    {(overview?.category?.key === "edtech" || examData?.hasExamSignals) && (
                    <div className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5" style={{ boxShadow:"0 4px 24px #00000055" }}>
                      <p className="text-[10px] text-[#f43f8e] uppercase tracking-widest mb-0.5" style={{ fontFamily:"var(--font-mono)" }}>Exam Detail</p>
                      <h3 className="text-sm font-black text-[#e8f4ff] uppercase mb-4" style={{ fontFamily:"var(--font-display)" }}>Question & Section Signals</h3>
                      <div className="space-y-3">
                        {(examData?.questionDropOffs || []).slice(0,4).map((item, i) => (
                          <div key={`${item.questionId}-${i}`} className="p-3 rounded-xl bg-[#04080f] border border-[#1a2a4a]">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-bold text-[#e8f4ff]">{item.questionId}</p>
                              <p className="text-[9px] text-[#f43f8e]" style={{ fontFamily:"var(--font-mono)" }}>{item.quits} exits</p>
                            </div>
                            <p className="text-[10px] text-[#3d6080]" style={{ fontFamily:"var(--font-mono)" }}>
                              Section: {item.section || "General"}
                            </p>
                          </div>
                        ))}
                        {!examData?.questionDropOffs?.length && (
                          <p className="text-[11px] text-[#3d6080]" style={{ fontFamily:"var(--font-mono)" }}>No exam question signal detected yet.</p>
                        )}
                      </div>
                    </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── AI INSIGHTS TAB ── */}
              {activeTab==="ai" && (
                <motion.div key="ai" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}>

                  <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                    <div>
                      <p className="text-[10px] text-[#a855f7] uppercase tracking-widest mb-0.5"
                        style={{ fontFamily:"var(--font-mono)" }}>Gemini AI — Real Data</p>
                      <h2 className="text-lg font-black text-[#e8f4ff] uppercase"
                        style={{ fontFamily:"var(--font-display)" }}>AI Analytics Intelligence</h2>
                    </div>
                    <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                      onClick={loadAiInsights} disabled={aiLoading}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest text-[#020408] disabled:opacity-60"
                      style={{ background:"linear-gradient(135deg,#a855f7,#f43f8e)", fontFamily:"var(--font-display)" }}>
                      {aiLoading ? (
                        <><motion.div className="w-4 h-4 rounded-full border-2 border-[#020408]/40 border-t-[#020408]"
                          animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:0.9, ease:"linear" }}/> Analyzing...</>
                      ) : <><Sparkles className="w-4 h-4"/> {aiData?"Refresh":"Generate"} Insights</>}
                    </motion.button>
                  </div>

                  {aiError && (
                    <div className="p-4 rounded-xl border border-[#f43f8e30] bg-[#f43f8e08] mb-5 flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-[#f43f8e] flex-shrink-0 mt-0.5"/>
                      <div>
                        <p className="text-xs font-bold text-[#f43f8e] mb-1">AI Error</p>
                        <p className="text-[11px] text-[#8ab4d4]" style={{ fontFamily:"var(--font-mono)" }}>{aiError}</p>
                        <p className="text-[10px] text-[#3d6080] mt-1" style={{ fontFamily:"var(--font-mono)" }}>
                          Ensure GEMINI_API_KEY is set in .env and server restarted
                        </p>
                      </div>
                    </div>
                  )}

                  {!aiData && !aiLoading && !aiError && (
                    <div className="flex flex-col items-center justify-center py-12 text-center mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-[#a855f715] border border-[#a855f730] flex items-center justify-center mb-4">
                        <BrainCircuit className="w-8 h-8 text-[#a855f7]"/>
                      </div>
                      <p className="text-sm font-bold text-[#e8f4ff] mb-2">Generate AI Insights</p>
                      <p className="text-xs text-[#3d6080] max-w-sm" style={{ fontFamily:"var(--font-mono)" }}>
                        Gemini AI will analyze your real project data and provide health score, insights, recommendations, and predictions.
                      </p>
                    </div>
                  )}

                  {aiLoading && !aiData && (
                    <div className="flex flex-col items-center justify-center py-12 text-center mb-6">
                      <motion.div className="w-16 h-16 rounded-full border-4 border-[#a855f733] border-t-[#a855f7] mb-4"
                        animate={{ rotate:360 }} transition={{ repeat:Infinity, duration:1, ease:"linear" }}/>
                      <p className="text-sm font-bold text-[#e8f4ff] mb-1">Analyzing your data...</p>
                      <p className="text-xs text-[#3d6080]" style={{ fontFamily:"var(--font-mono)" }}>Gemini is processing analytics</p>
                    </div>
                  )}

                  {aiData && (
                    <div className="space-y-6 mb-6">
                      {/* Summary + Health */}
                      <div className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden"
                        style={{ boxShadow:"0 4px 24px #00000055" }}>
                        <div className="h-[2px]" style={{ background:"linear-gradient(90deg,#a855f7,#f43f8e,#00e5ff)" }}/>
                        <div className="p-5 flex flex-col sm:flex-row gap-5 items-start">
                          <HealthRing score={aiData.health_score||0} label={aiData.health_label||"N/A"}
                            color={healthColor(aiData.health_score||0)}/>
                          <div className="flex-1">
                            <p className="text-[10px] text-[#a855f7] uppercase tracking-widest mb-2"
                              style={{ fontFamily:"var(--font-mono)" }}>Executive Summary</p>
                            <p className="text-sm text-[#8ab4d4] leading-relaxed mb-3"
                              style={{ fontFamily:"var(--font-mono)" }}>{aiData.summary}</p>
                            {aiData.warnings?.length > 0 && aiData.warnings.map((w,i) => (
                              <div key={i} className="flex items-center gap-2 text-[10px] text-[#f43f8e]"
                                style={{ fontFamily:"var(--font-mono)" }}>
                                <AlertTriangle className="w-3 h-3 flex-shrink-0"/> {w}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Terminal AI verdict cards */}
                      {aiData.page_insights?.length > 0 && (
                        <div>
                          <p className="text-[10px] text-[#00e5ff] uppercase tracking-widest mb-3"
                            style={{ fontFamily:"var(--font-mono)" }}>Page Intelligence</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {aiData.page_insights.map((pi, i) => {
                              const prioColor = { critical:"#f43f8e", high:"#f59e0b", medium:"#a855f7" }[pi.priority]||"#3d6080";
                              return (
                                <motion.div key={i} initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.1 }}
                                  className="rounded-2xl border bg-[#060d18] p-4 relative overflow-hidden"
                                  style={{ borderColor:`${prioColor}20`, boxShadow:`0 0 30px ${prioColor}06` }}>
                                  <div className="absolute inset-0 pointer-events-none"
                                    style={{ background:`linear-gradient(135deg,${prioColor}06 0%,transparent 50%)` }}/>
                                  <div className="relative flex items-start gap-2">
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                      style={{ background:`${prioColor}12`, border:`1px solid ${prioColor}25` }}>
                                      <Terminal className="w-3.5 h-3.5" style={{ color:prioColor }}/>
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-[10px] uppercase tracking-widest mb-1 truncate"
                                        style={{ color:prioColor, fontFamily:"var(--font-mono)" }}>
                                        ai_insight → {(pi.page||"/").slice(0,16)} → {pi.priority}
                                      </p>
                                      <p className="text-[11px] text-[#3d6080] leading-relaxed"
                                        style={{ fontFamily:"var(--font-mono)" }}>{pi.issue}</p>
                                      <p className="text-[10px] text-[#1a3a6b] mt-1"
                                        style={{ fontFamily:"var(--font-mono)" }}>→ {pi.recommendation}</p>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Predictions */}
                      {aiData.predictions?.length > 0 && (
                        <div>
                          <p className="text-[10px] text-[#f59e0b] uppercase tracking-widest mb-3"
                            style={{ fontFamily:"var(--font-mono)" }}>7-Day Predictions</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {aiData.predictions.map((p,i) => {
                              const tc = p.trend==="up"?"#10d990":p.trend==="down"?"#f43f8e":"#f59e0b";
                              const TIcon = p.trend==="up"?ArrowUpRight:p.trend==="down"?ArrowDownRight:TrendingUp;
                              return (
                                <motion.div key={i} initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.1 }}
                                  className="p-4 rounded-2xl border border-[#1a2a4a] bg-[#060d18]">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] text-[#3d6080] uppercase tracking-wider"
                                      style={{ fontFamily:"var(--font-mono)" }}>{p.metric}</span>
                                    <TIcon className="w-4 h-4" style={{ color:tc }}/>
                                  </div>
                                  <p className="text-[11px] leading-relaxed"
                                    style={{ color:tc, fontFamily:"var(--font-mono)" }}>{p.forecast}</p>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Insights */}
                      {aiData.insights?.length > 0 && (
                        <div>
                          <p className="text-[10px] text-[#00e5ff] uppercase tracking-widest mb-3"
                            style={{ fontFamily:"var(--font-mono)" }}>Key Insights</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {aiData.insights.map((ins,i) => {
                              const cfg = {
                                growth:      { color:"#10d990", icon:"📈" },
                                warning:     { color:"#f43f8e", icon:"⚠️" },
                                opportunity: { color:"#a855f7", icon:"💡" },
                                anomaly:     { color:"#f59e0b", icon:"🔍" },
                              }[ins.type] || { color:"#3d6080", icon:"•" };
                              const ic = { high:"#f43f8e", medium:"#f59e0b", low:"#10d990" }[ins.impact]||"#3d6080";
                              return (
                                <motion.div key={i} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.08 }}
                                  className="p-4 rounded-2xl border"
                                  style={{ background:`${cfg.color}08`, borderColor:`${cfg.color}25` }}>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-base">{cfg.icon}</span>
                                      <p className="text-xs font-black text-[#e8f4ff]">{ins.title}</p>
                                    </div>
                                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase flex-shrink-0"
                                      style={{ color:ic, background:`${ic}20`, fontFamily:"var(--font-mono)" }}>
                                      {ins.impact}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[#8ab4d4] leading-relaxed"
                                    style={{ fontFamily:"var(--font-mono)" }}>{ins.description}</p>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {aiData.recommendations?.length > 0 && (
                        <div>
                          <p className="text-[10px] text-[#10d990] uppercase tracking-widest mb-3"
                            style={{ fontFamily:"var(--font-mono)" }}>Action Plan</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {aiData.recommendations.map((r,i) => {
                              const pc = { critical:"#f43f8e", high:"#f59e0b", medium:"#a855f7" }[r.priority]||"#3d6080";
                              const ec = { low:"#10d990", medium:"#f59e0b", high:"#f43f8e" }[r.effort]||"#3d6080";
                              return (
                                <motion.div key={i} initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}
                                  className="p-4 rounded-2xl border border-[#1a2a4a] bg-[#060d18]">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase"
                                      style={{ color:pc, background:`${pc}20`, fontFamily:"var(--font-mono)" }}>{r.priority}</span>
                                    <span className="text-[9px] text-[#3d6080]" style={{ fontFamily:"var(--font-mono)" }}>
                                      effort: <span style={{ color:ec }}>{r.effort}</span>
                                    </span>
                                  </div>
                                  <p className="text-xs font-bold text-[#e8f4ff] mb-1">{r.action}</p>
                                  <p className="text-[10px] text-[#3d6080]" style={{ fontFamily:"var(--font-mono)" }}>
                                    → {r.expected_impact}
                                  </p>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI Chat — always visible */}
                  <div>
                    <p className="text-[10px] text-[#a855f7] uppercase tracking-widest mb-3"
                      style={{ fontFamily:"var(--font-mono)" }}>Natural Language Analytics</p>
                    <AiChat projectId={selectedProj._id} from={rangeFrom} to={rangeTo}/>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* SDK Drawer */}
      <AnimatePresence>
        {showSdkDrawer && selectedProj && (
          <SdkSetupDrawer project={selectedProj} verifySdk={verifySdk} onClose={() => setShowSdkDrawer(false)}/>
        )}
      </AnimatePresence>

      {/* Page AI Panel */}
      <AnimatePresence>
        {pagePanel && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:0.5 }} exit={{ opacity:0 }}
              className="fixed inset-0 bg-black z-40" onClick={() => setPagePanel(null)}/>
            <PageInsightPanel
              pageData={pagePanel}
              projectId={selectedProj?._id}
              from={rangeFrom} to={rangeTo}
              onClose={() => setPagePanel(null)}
            />
          </>
        )}
      </AnimatePresence>
    </OrgLayout>
  );
};

export default OrgAnalytics;
