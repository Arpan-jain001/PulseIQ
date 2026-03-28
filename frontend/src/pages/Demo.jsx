// src/pages/Demo.jsx — Animated Auto-Play Walkthrough Tour
import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
  Play, Pause, ChevronLeft, ChevronRight, SkipForward,
  Zap, BarChart3, Code2, Users, Shield, FolderKanban,
  Activity, MousePointer, TrendingUp, ArrowRight,
  CheckCircle2, Terminal, Key, Globe, Building2,
  ArrowUpRight, Bell, Eye
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell
} from "recharts";
import Navbar from "../components/Navbar";

/* ══════════════════════════════════
   FAKE DATA
══════════════════════════════════ */
const DAU = [
  { d:"Mar 11", u:84,  s:130 }, { d:"Mar 12", u:102, s:158 },
  { d:"Mar 13", u:91,  s:142 }, { d:"Mar 14", u:134, s:201 },
  { d:"Mar 15", u:118, s:177 }, { d:"Mar 16", u:156, s:234 },
  { d:"Mar 17", u:143, s:215 }, { d:"Mar 18", u:179, s:268 },
  { d:"Mar 19", u:162, s:243 }, { d:"Mar 20", u:198, s:297 },
  { d:"Mar 21", u:187, s:280 }, { d:"Mar 22", u:221, s:332 },
  { d:"Mar 23", u:209, s:314 }, { d:"Mar 24", u:243, s:365 },
];

const TOP_EVENTS = [
  { name:"page_view",    count:4821, color:"#00e5ff" },
  { name:"button_click", count:2103, color:"#10d990" },
  { name:"add_to_cart",  count:1342, color:"#a855f7" },
  { name:"checkout",     count: 856, color:"#f59e0b" },
  { name:"purchase",     count: 412, color:"#f43f8e" },
];

const FUNNEL = [
  { stage:"Page View",   pct:100, users:4821 },
  { stage:"Sign Up",     pct:40,  users:1928 },
  { stage:"Add to Cart", pct:20,  users: 965 },
  { stage:"Checkout",    pct:10,  users: 482 },
  { stage:"Purchase",    pct:5,   users: 241 },
];

const LIVE_FEED = [
  { event:"page_view",    user:"anon_a3f1", page:"/products",  t:"0s" },
  { event:"button_click", user:"user_2819", page:"/home",      t:"2s" },
  { event:"add_to_cart",  user:"anon_b921", page:"/products",  t:"5s" },
  { event:"checkout",     user:"user_4401", page:"/checkout",  t:"8s" },
  { event:"purchase",     user:"user_7732", page:"/checkout",  t:"12s"},
  { event:"signup",       user:"anon_c119", page:"/auth",      t:"15s"},
];

const EVT_COLORS = {
  page_view:"#00e5ff", button_click:"#10d990", add_to_cart:"#a855f7",
  checkout:"#f59e0b", purchase:"#f43f8e", signup:"#10d990",
};

/* ══════════════════════════════════
   SHARED COMPONENTS
══════════════════════════════════ */
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#1a2a4a] bg-[#060d18] px-3 py-2.5"
      style={{ boxShadow:"0 8px 24px #00000099" }}>
      <p className="text-[10px] text-[#3d6080] mb-1" style={{ fontFamily:"var(--font-mono)" }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} className="text-xs font-bold"
          style={{ color:p.color, fontFamily:"var(--font-mono)" }}>
          {p.name}: {(p.value||0).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

const StatCard = ({ icon:Icon, label, value, change, color, i=0 }) => (
  <motion.div
    initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
    transition={{ delay:i*0.1, duration:0.5, ease:"easeOut" }}
    className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-4 relative overflow-hidden"
    style={{ boxShadow:"0 4px 20px #00000055" }}>
    <div className="absolute top-0 inset-x-0 h-[1.5px] opacity-70"
      style={{ background:`linear-gradient(90deg,transparent,${color},transparent)` }} />
    <div className="flex items-start justify-between mb-3">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background:`${color}15`, border:`1px solid ${color}30` }}>
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <span className="text-[10px] font-bold text-[#10d990] flex items-center gap-0.5"
        style={{ fontFamily:"var(--font-mono)" }}>
        <ArrowUpRight className="w-3 h-3" />{change}%
      </span>
    </div>
    <p className="text-xl font-black text-[#e8f4ff] mb-0.5"
      style={{ fontFamily:"var(--font-display)" }}>{value}</p>
    <p className="text-[10px] text-[#3d6080] uppercase tracking-widest"
      style={{ fontFamily:"var(--font-mono)" }}>{label}</p>
  </motion.div>
);

/* ══════════════════════════════════
   SLIDE SCENES
══════════════════════════════════ */

/* Scene 0 — Intro */
const SceneIntro = () => (
  <div className="flex flex-col items-center justify-center min-h-[480px] text-center px-4">
    <motion.div initial={{ scale:0, rotate:-20 }} animate={{ scale:1, rotate:0 }}
      transition={{ type:"spring", stiffness:200, damping:15 }}
      className="w-24 h-24 rounded-3xl flex items-center justify-center mb-8"
      style={{ background:"linear-gradient(135deg,#10d990,#00e5ff)", boxShadow:"0 0 60px #10d99033" }}>
      <Zap className="w-12 h-12 text-[#020408]" />
    </motion.div>
    <motion.p className="text-[11px] text-[#10d990] uppercase tracking-[0.4em] mb-4"
      style={{ fontFamily:"var(--font-mono)" }}
      initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
      PulseIQ Analytics Platform
    </motion.p>
    <motion.h1
      className="text-4xl sm:text-6xl font-black text-[#e8f4ff] uppercase mb-5 leading-tight"
      style={{ fontFamily:"var(--font-display)" }}
      initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}>
      The Analytics Platform
      <br />
      <span style={{ background:"linear-gradient(135deg,#10d990,#00e5ff,#a855f7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
        Built for Builders
      </span>
    </motion.h1>
    <motion.p className="text-sm text-[#3d6080] max-w-md mb-10"
      style={{ fontFamily:"var(--font-mono)" }}
      initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}>
      Track events, understand user behavior, and grow your product — all with a single SDK snippet.
    </motion.p>
    <motion.div className="flex flex-wrap gap-3 justify-center"
      initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}>
      {[
        { label:"Real-Time Events",    color:"#00e5ff" },
        { label:"Funnel Analysis",     color:"#10d990" },
        { label:"SDK in 5 Minutes",    color:"#a855f7" },
        { label:"5 Platforms",         color:"#f59e0b" },
        { label:"SDK Verification",    color:"#f43f8e" },
      ].map(({ label, color }) => (
        <span key={label} className="text-[10px] px-3 py-1.5 rounded-full border font-bold uppercase tracking-wider"
          style={{ color, borderColor:`${color}30`, background:`${color}10`, fontFamily:"var(--font-mono)" }}>
          {label}
        </span>
      ))}
    </motion.div>
  </div>
);

/* Scene 1 — How it works */
const SceneHowItWorks = () => {
  const steps = [
    { n:"01", icon:FolderKanban, title:"Create Project",   desc:"Signup as Organizer → Create Workspace → New Project → Get API Key",           color:"#10d990" },
    { n:"02", icon:Code2,        title:"Paste SDK",        desc:"Copy the pre-filled code snippet for HTML, React, WordPress or React Native",   color:"#00e5ff" },
    { n:"03", icon:Activity,     title:"Events Flow In",   desc:"SDK auto-tracks page_view. Call track('event') anywhere for custom events",     color:"#a855f7" },
    { n:"04", icon:CheckCircle2, title:"Analytics Unlock", desc:"Verify your SDK → Analytics dashboard opens → DAU, Funnels, Events — all live", color:"#f43f8e" },
  ];
  return (
    <div className="px-2">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="text-center mb-8">
        <p className="text-[10px] text-[#10d990] uppercase tracking-[0.3em] mb-2"
          style={{ fontFamily:"var(--font-mono)" }}>How it works</p>
        <h2 className="text-2xl sm:text-3xl font-black text-[#e8f4ff] uppercase"
          style={{ fontFamily:"var(--font-display)" }}>Up & Running in 5 Minutes</h2>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map(({ n, icon:Icon, title, desc, color }, i) => (
          <motion.div key={n}
            initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:i*0.15, duration:0.5, ease:"easeOut" }}
            className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5 relative overflow-hidden"
            style={{ boxShadow:"0 4px 20px #00000055" }}>
            <div className="absolute top-0 inset-x-0 h-[2px]"
              style={{ background:`linear-gradient(90deg,${color},transparent)` }} />
            <div className="text-4xl font-black opacity-10 mb-4"
              style={{ color, fontFamily:"var(--font-display)" }}>{n}</div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background:`${color}15`, border:`1px solid ${color}30` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <p className="text-sm font-black text-[#e8f4ff] mb-2">{title}</p>
            <p className="text-[11px] text-[#3d6080] leading-relaxed"
              style={{ fontFamily:"var(--font-mono)" }}>{desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/* Scene 2 — Analytics Dashboard */
const SceneAnalytics = () => {
  const [reveal, setReveal] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setReveal(1), 300);
    const t2 = setTimeout(() => setReveal(2), 800);
    const t3 = setTimeout(() => setReveal(3), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="px-2">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="text-center mb-6">
        <p className="text-[10px] text-[#00e5ff] uppercase tracking-[0.3em] mb-2"
          style={{ fontFamily:"var(--font-mono)" }}>Analytics Dashboard</p>
        <h2 className="text-2xl sm:text-3xl font-black text-[#e8f4ff] uppercase"
          style={{ fontFamily:"var(--font-display)" }}>Real-Time Insights</h2>
      </motion.div>

      {/* Stats */}
      {reveal >= 1 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <StatCard icon={Activity}     label="Total Events"   value="9,534"  change={12.4} color="#00e5ff" i={0} />
          <StatCard icon={Users}        label="Unique Users"   value="2,841"  change={8.1}  color="#10d990" i={1} />
          <StatCard icon={MousePointer} label="Events/User"    value="3.4"    change={5.2}  color="#a855f7" i={2} />
          <StatCard icon={TrendingUp}   label="DAU Today"      value="412"    change={18.7} color="#f59e0b" i={3} />
        </div>
      )}

      {/* Charts */}
      {reveal >= 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div className="lg:col-span-2 rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-4"
            initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }}
            transition={{ duration:0.5 }}>
            <p className="text-[10px] text-[#00e5ff] uppercase tracking-widest mb-0.5"
              style={{ fontFamily:"var(--font-mono)" }}>14-Day Trend</p>
            <p className="text-xs font-black text-[#e8f4ff] uppercase mb-3"
              style={{ fontFamily:"var(--font-display)" }}>Daily Active Users</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={DAU} margin={{ top:5, right:5, bottom:0, left:-20 }}>
                <defs>
                  <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10d990" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10d990" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2a4a" vertical={false}/>
                <XAxis dataKey="d" tick={{ fill:"#3d6080", fontSize:8, fontFamily:"var(--font-mono)" }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:"#3d6080", fontSize:8, fontFamily:"var(--font-mono)" }} axisLine={false} tickLine={false}/>
                <Tooltip content={<Tip />}/>
                <Area type="monotone" dataKey="s" name="Sessions" stroke="#10d990" strokeWidth={1.5} fill="url(#gG)" dot={false}/>
                <Area type="monotone" dataKey="u" name="Users"    stroke="#00e5ff" strokeWidth={2}   fill="url(#gC)" dot={false} activeDot={{ r:4, fill:"#00e5ff" }}/>
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-4"
            initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }}
            transition={{ duration:0.5 }}>
            <p className="text-[10px] text-[#10d990] uppercase tracking-widest mb-0.5"
              style={{ fontFamily:"var(--font-mono)" }}>Most Frequent</p>
            <p className="text-xs font-black text-[#e8f4ff] uppercase mb-3"
              style={{ fontFamily:"var(--font-display)" }}>Top Events</p>
            <div className="space-y-2.5">
              {TOP_EVENTS.map((e,i) => (
                <div key={e.name}>
                  <div className="flex justify-between mb-1">
                    <code className="text-[10px]" style={{ color:e.color, fontFamily:"var(--font-mono)" }}>{e.name}</code>
                    <span className="text-[10px] text-[#3d6080] font-bold" style={{ fontFamily:"var(--font-mono)" }}>
                      {e.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#1a2a4a] overflow-hidden">
                    <motion.div className="h-full rounded-full"
                      style={{ background:e.color }}
                      initial={{ width:0 }}
                      animate={{ width:`${(e.count/4821)*100}%` }}
                      transition={{ delay:0.2+i*0.1, duration:0.7, ease:"easeOut" }}/>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

/* Scene 3 — Live Event Stream */
const SceneLiveEvents = () => {
  const [feed, setFeed] = useState(LIVE_FEED);
  const [count, setCount] = useState(0);
  useEffect(() => {
    const names = ["page_view","button_click","add_to_cart","checkout","purchase","signup"];
    const pages  = ["/home","/products","/checkout","/auth","/cart"];
    const id = setInterval(() => {
      setFeed(prev => [{
        event: names[Math.floor(Math.random()*names.length)],
        user:  "anon_"+Math.random().toString(36).slice(2,6),
        page:  pages[Math.floor(Math.random()*pages.length)],
        t:     "just now",
      }, ...prev.slice(0,9)]);
      setCount(c => c+1);
    }, 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="px-2">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="text-center mb-6">
        <p className="text-[10px] text-[#f43f8e] uppercase tracking-[0.3em] mb-2"
          style={{ fontFamily:"var(--font-mono)" }}>Real-Time</p>
        <h2 className="text-2xl sm:text-3xl font-black text-[#e8f4ff] uppercase"
          style={{ fontFamily:"var(--font-display)" }}>Live Event Stream</h2>
        <p className="text-xs text-[#3d6080] mt-1" style={{ fontFamily:"var(--font-mono)" }}>
          Watch events arrive as they happen — every 1.2 seconds
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stream */}
        <div className="lg:col-span-2 rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden"
          style={{ boxShadow:"0 4px 20px #00000055" }}>
          <div className="h-[2px]" style={{ background:"linear-gradient(90deg,#f43f8e,#a855f7,#00e5ff)" }}/>
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#1a2a4a]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f43f8e] animate-pulse"/>
              <span className="text-[10px] text-[#f43f8e] uppercase tracking-widest font-bold"
                style={{ fontFamily:"var(--font-mono)" }}>Live Feed</span>
            </div>
            <span className="text-[10px] text-[#3d6080]" style={{ fontFamily:"var(--font-mono)" }}>
              {count} new events
            </span>
          </div>
          <div className="p-4 space-y-1.5 max-h-72 overflow-hidden">
            <AnimatePresence initial={false}>
              {feed.map((e, i) => (
                <motion.div key={`${e.event}-${i}-${count}`}
                  initial={{ opacity:0, x:-20, height:0 }}
                  animate={{ opacity:1, x:0, height:"auto" }}
                  exit={{ opacity:0, height:0 }}
                  transition={{ duration:0.25 }}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl border"
                  style={{ background:"#04080f", borderColor:`${EVT_COLORS[e.event]||"#1a2a4a"}20` }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background:EVT_COLORS[e.event]||"#3d6080" }}/>
                  <code className="text-[10px] flex-1 truncate"
                    style={{ color:EVT_COLORS[e.event]||"#3d6080", fontFamily:"var(--font-mono)" }}>
                    {e.event}
                  </code>
                  <span className="text-[9px] text-[#3d6080] flex-shrink-0" style={{ fontFamily:"var(--font-mono)" }}>{e.user}</span>
                  <span className="text-[9px] text-[#1a3a6b] flex-shrink-0 hidden sm:inline" style={{ fontFamily:"var(--font-mono)" }}>{e.page}</span>
                  <span className="text-[9px] text-[#1a3a6b] flex-shrink-0" style={{ fontFamily:"var(--font-mono)" }}>{e.t}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Event pie */}
        <div className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5"
          style={{ boxShadow:"0 4px 20px #00000055" }}>
          <p className="text-[10px] text-[#a855f7] uppercase tracking-widest mb-4"
            style={{ fontFamily:"var(--font-mono)" }}>Event Distribution</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={TOP_EVENTS.map(e=>({name:e.name, value:e.count}))}
                cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                paddingAngle={2} dataKey="value" stroke="none">
                {TOP_EVENTS.map((e,i) => <Cell key={i} fill={e.color}/>)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-3">
            {TOP_EVENTS.map(e => (
              <div key={e.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:e.color }}/>
                <span className="text-[9px] text-[#3d6080] flex-1 truncate" style={{ fontFamily:"var(--font-mono)" }}>{e.name}</span>
                <span className="text-[9px] font-bold" style={{ color:e.color, fontFamily:"var(--font-mono)" }}>
                  {e.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* Scene 4 — Funnel */
const SceneFunnel = () => {
  const [step, setStep] = useState(-1);
  useEffect(() => {
    FUNNEL.forEach((_, i) => {
      setTimeout(() => setStep(i), 400 + i*400);
    });
  }, []);

  return (
    <div className="px-2">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="text-center mb-6">
        <p className="text-[10px] text-[#a855f7] uppercase tracking-[0.3em] mb-2"
          style={{ fontFamily:"var(--font-mono)" }}>Funnel Analysis</p>
        <h2 className="text-2xl sm:text-3xl font-black text-[#e8f4ff] uppercase"
          style={{ fontFamily:"var(--font-display)" }}>Conversion Funnel</h2>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Visual funnel */}
        <div className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] p-5"
          style={{ boxShadow:"0 4px 20px #00000055" }}>
          <div className="space-y-3">
            {FUNNEL.map((f, i) => {
              const colors = ["#00e5ff","#10d990","#a855f7","#f59e0b","#f43f8e"];
              const c = colors[i];
              const shown = step >= i;
              const drop = i > 0 ? FUNNEL[i-1].users - f.users : 0;
              return (
                <AnimatePresence key={f.stage}>
                  {shown && (
                    <motion.div initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }}
                      transition={{ duration:0.4 }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-[#e8f4ff]">{f.stage}</span>
                        <div className="flex items-center gap-3">
                          {drop > 0 && (
                            <span className="text-[9px] text-[#f43f8e]"
                              style={{ fontFamily:"var(--font-mono)" }}>
                              −{drop.toLocaleString()} dropped
                            </span>
                          )}
                          <span className="text-[10px] font-bold"
                            style={{ color:c, fontFamily:"var(--font-mono)" }}>
                            {f.users.toLocaleString()} ({f.pct}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-9 rounded-xl bg-[#1a2a4a] overflow-hidden relative">
                        <motion.div className="h-full rounded-xl flex items-center px-3"
                          style={{ background:`${c}20`, borderLeft:`3px solid ${c}` }}
                          initial={{ width:0 }}
                          animate={{ width:`${f.pct}%` }}
                          transition={{ duration:0.7, ease:"easeOut" }}>
                          <span className="text-[9px] font-bold" style={{ color:c, fontFamily:"var(--font-mono)" }}>
                            {f.pct}%
                          </span>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              );
            })}
          </div>
          {step >= FUNNEL.length - 1 && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
              className="mt-4 pt-4 border-t border-[#1a2a4a] flex items-center justify-between">
              <span className="text-[10px] text-[#3d6080]" style={{ fontFamily:"var(--font-mono)" }}>Overall Conversion Rate</span>
              <span className="text-lg font-black text-[#f43f8e]" style={{ fontFamily:"var(--font-display)" }}>5%</span>
            </motion.div>
          )}
        </div>

        {/* Insights */}
        <div className="space-y-3">
          {[
            { emoji:"⚠️", text:"Biggest drop at Sign Up → Add to Cart (60% loss)", color:"#f43f8e" },
            { emoji:"✅", text:"Checkout → Purchase conversion is strong at 50%",  color:"#10d990" },
            { emoji:"💡", text:"Recommend A/B test on Add to Cart CTA button",     color:"#f59e0b" },
            { emoji:"🎯", text:"Focus retargeting on Sign Up drop-off users",      color:"#a855f7" },
          ].map(({ emoji, text, color }, i) => (
            <motion.div key={text}
              initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }}
              transition={{ delay:0.5 + i*0.2 }}
              className="flex items-start gap-3 p-4 rounded-xl border"
              style={{ borderColor:`${color}25`, background:`${color}08` }}>
              <span className="text-lg flex-shrink-0">{emoji}</span>
              <p className="text-[11px] leading-relaxed" style={{ color:"#8ab4d4", fontFamily:"var(--font-mono)" }}>{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* Scene 5 — SDK Setup */
const SceneSdk = () => {
  const [sdkStep, setSdkStep] = useState(0);
  const [platform, setPlatform] = useState("react");

  useEffect(() => {
    const id = setInterval(() => {
      setSdkStep(s => (s < 3 ? s + 1 : s));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const STEPS = [
    { n:"01", title:"Create Project",   color:"#10d990", icon:FolderKanban },
    { n:"02", title:"Copy SDK Snippet", color:"#00e5ff", icon:Code2 },
    { n:"03", title:"Paste & Deploy",   color:"#a855f7", icon:Globe },
    { n:"04", title:"Verify & Unlock",  color:"#f43f8e", icon:CheckCircle2 },
  ];

  const PLATFORMS = [
    { id:"html",        label:"HTML/JS",      color:"#f59e0b" },
    { id:"react",       label:"React",        color:"#00e5ff" },
    { id:"wordpress",   label:"WordPress",    color:"#a855f7" },
    { id:"reactnative", label:"React Native", color:"#10d990" },
  ];

  const code = {
    html: `<!-- Paste before </body> -->
<script>
(function() {
  var PulseIQ = {
    apiKey:    "pk_your_key_here",
    projectId: "your_project_id",
    endpoint:  "https://your-backend.onrender.com/api/ingest/event",
    track: function(name, props) {
      fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey
        },
        body: JSON.stringify({
          projectId: this.projectId,
          eventName: name,
          properties: Object.assign(
            { page: location.pathname }, props || {}
          )
        })
      }).catch(function(){});
    }
  };
  window.PulseIQ = PulseIQ;
  PulseIQ.track("page_view");
})();
</script>`,
    react: `// src/lib/pulseiq.js
const CONFIG = {
  apiKey:    "pk_your_key_here",
  projectId: "your_project_id",
  endpoint:  "https://your-backend.onrender.com/api/ingest/event",
};

export function track(eventName, properties = {}) {
  fetch(CONFIG.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": CONFIG.apiKey,
    },
    body: JSON.stringify({
      projectId: CONFIG.projectId,
      eventName,
      properties: {
        page: window.location.pathname,
        ...properties,
      },
    }),
  }).catch(() => {});
}

// Usage anywhere:
// import { track } from "../lib/pulseiq";
// track("page_view");
// track("purchase", { amount: 499 });`,
    wordpress: `<?php
// Add to functions.php
function pulseiq_analytics() { ?>
<script>
(function() {
  var PulseIQ = {
    apiKey: "pk_your_key_here",
    projectId: "your_project_id",
    endpoint: "https://your-backend.onrender.com/api/ingest/event",
    track: function(name, props) {
      fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey
        },
        body: JSON.stringify({
          projectId: this.projectId, eventName: name,
          userId: <?php echo is_user_logged_in()
            ? '"'.get_current_user_id().'"' : 'undefined'; ?>,
          properties: Object.assign(
            { page: location.pathname }, props || {}
          )
        })
      }).catch(function(){});
    }
  };
  window.PulseIQ = PulseIQ;
  PulseIQ.track("page_view");
})();
</script>
<?php }
add_action("wp_footer", "pulseiq_analytics");`,
    reactnative: `// src/lib/pulseiq.js
import AsyncStorage from
  "@react-native-async-storage/async-storage";

const CONFIG = {
  apiKey:    "pk_your_key_here",
  projectId: "your_project_id",
  endpoint:
    "https://your-backend.onrender.com/api/ingest/event",
};

export async function track(eventName, properties = {}) {
  try {
    const userId = await AsyncStorage.getItem("_piq_user");
    await fetch(CONFIG.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CONFIG.apiKey,
      },
      body: JSON.stringify({
        projectId: CONFIG.projectId,
        eventName,
        userId: userId || undefined,
        properties,
      }),
    });
  } catch (e) {}
}

// Usage:
// useFocusEffect(() => {
//   track("screen_view", { screen: "Home" });
// });`,
  };

  return (
    <div className="px-2">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="text-center mb-6">
        <p className="text-[10px] text-[#f43f8e] uppercase tracking-[0.3em] mb-2"
          style={{ fontFamily:"var(--font-mono)" }}>SDK Integration</p>
        <h2 className="text-2xl sm:text-3xl font-black text-[#e8f4ff] uppercase"
          style={{ fontFamily:"var(--font-display)" }}>Setup in 5 Minutes</h2>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Steps */}
        <div className="lg:col-span-2 space-y-2">
          {STEPS.map(({ n, title, color, icon:Icon }, i) => {
            const done   = i < sdkStep;
            const active = i === sdkStep;
            return (
              <motion.div key={n}
                initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
                transition={{ delay:i*0.1 }}
                className="flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all"
                style={{
                  borderColor: active ? `${color}50` : done ? `${color}20` : "#1a2a4a",
                  background:  active ? `${color}08` : "transparent",
                }}
                onClick={() => setSdkStep(i)}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] flex-shrink-0 transition-all"
                  style={{
                    background: done ? color : active ? `${color}30` : "#1a2a4a",
                    border: `2px solid ${done||active ? color : "#1a2a4a"}`,
                    color: done ? "#020408" : active ? color : "#3d6080",
                    fontFamily: "var(--font-display)",
                    boxShadow: active ? `0 0 14px ${color}44` : "none",
                  }}>
                  {done ? "✓" : n}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold" style={{ color:active?color:done?"#8ab4d4":"#3d6080" }}>{title}</p>
                </div>
                {active && <Icon className="w-4 h-4 flex-shrink-0" style={{ color }}/>}
              </motion.div>
            );
          })}
        </div>

        {/* Code */}
        <div className="lg:col-span-3 rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden"
          style={{ boxShadow:"0 4px 20px #00000055" }}>
          <div className="h-[2px]" style={{ background:"linear-gradient(90deg,#f43f8e,#a855f7,#00e5ff)" }}/>
          <div className="flex gap-1 p-3 border-b border-[#1a2a4a] overflow-x-auto">
            {PLATFORMS.map(p => (
              <button key={p.id} onClick={() => setPlatform(p.id)}
                className="px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-bold border transition-all flex-shrink-0"
                style={{ borderColor:platform===p.id?`${p.color}50`:"#1a2a4a", background:platform===p.id?`${p.color}15`:"transparent", color:platform===p.id?p.color:"#3d6080", fontFamily:"var(--font-mono)" }}>
                {p.label}
              </button>
            ))}
          </div>
          <pre className="p-4 text-[9px] overflow-auto leading-relaxed max-h-72 text-[#8ab4d4]"
            style={{ fontFamily:"var(--font-mono)" }}>
            {code[platform]}
          </pre>
          <div className="border-t border-[#1a2a4a] p-3 flex items-center justify-between">
            <p className="text-[9px] text-[#3d6080]" style={{ fontFamily:"var(--font-mono)" }}>
              Real credentials auto-filled after signup
            </p>
            <Link to="/signup"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider text-[#020408]"
              style={{ background:"#f43f8e", fontFamily:"var(--font-mono)" }}>
              Get Key <Key className="w-3 h-3"/>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Scene 6 — CTA */
const SceneCta = () => (
  <div className="flex flex-col items-center justify-center min-h-[480px] text-center px-4">
    <motion.div initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }}
      transition={{ type:"spring", stiffness:150 }}
      className="w-20 h-20 rounded-3xl flex items-center justify-center mb-8"
      style={{ background:"linear-gradient(135deg,#f43f8e,#a855f7)", boxShadow:"0 0 60px #f43f8e33" }}>
      <CheckCircle2 className="w-10 h-10 text-white"/>
    </motion.div>
    <motion.p className="text-[11px] text-[#f43f8e] uppercase tracking-[0.4em] mb-3"
      style={{ fontFamily:"var(--font-mono)" }}
      initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}>
      You've seen it all
    </motion.p>
    <motion.h2 className="text-3xl sm:text-5xl font-black text-[#e8f4ff] uppercase mb-5 leading-tight"
      style={{ fontFamily:"var(--font-display)" }}
      initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}>
      Ready to go live?
      <br/>
      <span style={{ background:"linear-gradient(135deg,#10d990,#00e5ff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
        Start in 5 minutes.
      </span>
    </motion.h2>
    <motion.div className="flex flex-col sm:flex-row gap-3 justify-center mt-2"
      initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}>
      <Link to="/signup"
        className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-[#020408] hover:opacity-90 transition-opacity"
        style={{ background:"linear-gradient(135deg,#10d990,#00e5ff)", fontFamily:"var(--font-display)" }}>
        <Zap className="w-4 h-4"/> Start Free Now
      </Link>
      <Link to="/help"
        className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider border border-[#1a2a4a] text-[#8ab4d4] hover:border-[#10d99033] hover:text-[#10d990] transition-all"
        style={{ fontFamily:"var(--font-mono)" }}>
        Read Docs <ArrowRight className="w-4 h-4"/>
      </Link>
    </motion.div>
  </div>
);

/* ══════════════════════════════════
   TOUR CONFIG
══════════════════════════════════ */
const SLIDES = [
  { id:"intro",     label:"Welcome",      icon:Zap,          color:"#10d990", duration:6000,  component:SceneIntro },
  { id:"howitworks",label:"How It Works", icon:Activity,     color:"#00e5ff", duration:8000,  component:SceneHowItWorks },
  { id:"analytics", label:"Analytics",    icon:BarChart3,    color:"#a855f7", duration:9000,  component:SceneAnalytics },
  { id:"live",      label:"Live Events",  icon:Activity,     color:"#f43f8e", duration:8000,  component:SceneLiveEvents },
  { id:"funnel",    label:"Funnels",      icon:TrendingUp,   color:"#f59e0b", duration:8000,  component:SceneFunnel },
  { id:"sdk",       label:"SDK Setup",    icon:Code2,        color:"#f43f8e", duration:10000, component:SceneSdk },
  { id:"cta",       label:"Get Started",  icon:CheckCircle2, color:"#10d990", duration:0,     component:SceneCta },
];

/* ══════════════════════════════════
   MAIN DEMO
══════════════════════════════════ */
const Demo = () => {
  const [slide, setSlide] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const startRef = useRef(null);
  const elapsed  = useRef(0);

  const goTo = useCallback((idx) => {
    setSlide(Math.max(0, Math.min(SLIDES.length - 1, idx)));
    setProgress(0);
    elapsed.current = 0;
  }, []);

  const next = useCallback(() => goTo(slide + 1), [slide, goTo]);
  const prev = useCallback(() => goTo(slide - 1), [slide, goTo]);

  // Auto-advance timer
  useEffect(() => {
    const dur = SLIDES[slide].duration;
    if (!playing || dur === 0) return;
    const TICK = 50;
    timerRef.current = setInterval(() => {
      elapsed.current += TICK;
      setProgress(Math.min(elapsed.current / dur * 100, 100));
      if (elapsed.current >= dur) {
        clearInterval(timerRef.current);
        if (slide < SLIDES.length - 1) goTo(slide + 1);
      }
    }, TICK);
    return () => clearInterval(timerRef.current);
  }, [slide, playing, goTo]);

  const current = SLIDES[slide];
  const Scene   = current.component;

  return (
    <div style={{ background:"#020408", minHeight:"100vh" }}>
      <Navbar />

      {/* ── Progress bar top ── */}
      <div className="fixed top-[64px] left-0 right-0 z-40 h-[2px] bg-[#1a2a4a]">
        <motion.div className="h-full"
          style={{ background:`linear-gradient(90deg,${current.color},${current.color}aa)`, width:`${progress}%` }}
          transition={{ duration:0.05 }}/>
      </div>

      {/* ── Slide nav (desktop) ── */}
      <div className="fixed top-[72px] left-0 right-0 z-30 flex justify-center pt-3 px-4 pointer-events-none">
        <div className="flex gap-1.5 p-1.5 rounded-2xl border border-[#1a2a4a] bg-[#060d18] pointer-events-auto"
          style={{ boxShadow:"0 4px 20px #00000077" }}>
          {SLIDES.map((s, i) => {
            const Icon = s.icon;
            const active = i === slide;
            return (
              <button key={s.id} onClick={() => goTo(i)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[9px] uppercase tracking-wider font-bold border transition-all"
                style={{
                  borderColor: active ? `${s.color}50` : "transparent",
                  background:  active ? `${s.color}15`  : "transparent",
                  color:       active ? s.color          : "#3d6080",
                  fontFamily:  "var(--font-mono)",
                }}>
                <Icon className="w-3 h-3"/>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main scene ── */}
      <div className="pt-36 pb-28 px-4 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div key={slide}
            initial={{ opacity:0, y:30, scale:0.98 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:-20, scale:0.99 }}
            transition={{ duration:0.5, ease:[0.22, 1, 0.36, 1] }}>
            <Scene />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Controls bottom ── */}
      <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4">
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-[#1a2a4a] bg-[#060d18]"
          style={{ boxShadow:"0 8px 32px #00000099" }}>

          {/* Prev */}
          <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
            onClick={prev} disabled={slide === 0}
            className="w-9 h-9 rounded-xl border border-[#1a2a4a] flex items-center justify-center text-[#3d6080] hover:text-[#e8f4ff] hover:border-[#3d6080] disabled:opacity-30 transition-all">
            <ChevronLeft className="w-4 h-4"/>
          </motion.button>

          {/* Play/Pause */}
          <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
            onClick={() => { setPlaying(p => !p); elapsed.current = progress / 100 * SLIDES[slide].duration; }}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ background:current.color, boxShadow:`0 0 16px ${current.color}44` }}>
            {playing ? <Pause className="w-3.5 h-3.5 text-[#020408]"/> : <Play className="w-3.5 h-3.5 text-[#020408]"/>}
          </motion.button>

          {/* Dots */}
          <div className="flex items-center gap-1.5 mx-1">
            {SLIDES.map((s, i) => (
              <button key={i} onClick={() => goTo(i)}
                className="rounded-full transition-all"
                style={{
                  width:  i === slide ? 20 : 6,
                  height: 6,
                  background: i === slide ? s.color : i < slide ? "#3d6080" : "#1a2a4a",
                }}/>
            ))}
          </div>

          {/* Next */}
          <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
            onClick={next} disabled={slide === SLIDES.length - 1}
            className="w-9 h-9 rounded-xl border border-[#1a2a4a] flex items-center justify-center text-[#3d6080] hover:text-[#e8f4ff] hover:border-[#3d6080] disabled:opacity-30 transition-all">
            <ChevronRight className="w-4 h-4"/>
          </motion.button>

          {/* Skip to end */}
          {slide < SLIDES.length - 1 && (
            <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
              onClick={() => goTo(SLIDES.length - 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1a2a4a] text-[#3d6080] hover:text-[#e8f4ff] text-[10px] uppercase tracking-wider font-bold transition-all"
              style={{ fontFamily:"var(--font-mono)" }}>
              Skip <SkipForward className="w-3 h-3"/>
            </motion.button>
          )}

          {/* Slide counter */}
          <span className="text-[10px] text-[#3d6080] min-w-[32px] text-center"
            style={{ fontFamily:"var(--font-mono)" }}>
            {slide+1}/{SLIDES.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Demo;