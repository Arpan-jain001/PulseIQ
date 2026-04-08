import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Code2,
  Eye,
  FolderKanban,
  Globe,
  Key,
  Lightbulb,
  MousePointer,
  Pause,
  Play,
  SkipForward,
  Sparkles,
  Shield,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Navbar from "../components/Navbar";
import { SDK_PLATFORMS as GUIDE_PLATFORMS, getSdkGuide } from "../lib/sdkGuides";

const DAU = [
  { d: "Mar 11", u: 84, s: 130 },
  { d: "Mar 12", u: 102, s: 158 },
  { d: "Mar 13", u: 91, s: 142 },
  { d: "Mar 14", u: 134, s: 201 },
  { d: "Mar 15", u: 118, s: 177 },
  { d: "Mar 16", u: 156, s: 234 },
  { d: "Mar 17", u: 143, s: 215 },
  { d: "Mar 18", u: 179, s: 268 },
  { d: "Mar 19", u: 162, s: 243 },
  { d: "Mar 20", u: 198, s: 297 },
  { d: "Mar 21", u: 187, s: 280 },
  { d: "Mar 22", u: 221, s: 332 },
  { d: "Mar 23", u: 209, s: 314 },
  { d: "Mar 24", u: 243, s: 365 },
];

const TOP_EVENTS = [
  { name: "page_view", count: 4821, color: "#38bdf8" },
  { name: "button_click", count: 2103, color: "#22c55e" },
  { name: "add_to_cart", count: 1342, color: "#8b5cf6" },
  { name: "checkout", count: 856, color: "#f59e0b" },
  { name: "purchase", count: 412, color: "#f43f5e" },
];

const FUNNEL = [
  { stage: "Page View", pct: 100, users: 4821 },
  { stage: "Sign Up", pct: 40, users: 1928 },
  { stage: "Add to Cart", pct: 20, users: 965 },
  { stage: "Checkout", pct: 10, users: 482 },
  { stage: "Purchase", pct: 5, users: 241 },
];

const LIVE_FEED = [
  { event: "page_view", user: "anon_a3f1", page: "/products", time: "0s ago" },
  { event: "button_click", user: "user_2819", page: "/home", time: "2s ago" },
  { event: "add_to_cart", user: "anon_b921", page: "/products", time: "5s ago" },
  { event: "checkout", user: "user_4401", page: "/checkout", time: "8s ago" },
  { event: "purchase", user: "user_7732", page: "/checkout", time: "12s ago" },
  { event: "signup", user: "anon_c119", page: "/auth", time: "15s ago" },
];

const EVENT_COLORS = {
  page_view: "#38bdf8",
  button_click: "#22c55e",
  add_to_cart: "#8b5cf6",
  checkout: "#f59e0b",
  purchase: "#f43f5e",
  signup: "#14b8a6",
};

const WALKTHROUGH_METRICS = [
  { label: "Organizations", value: "126", change: "+18%", icon: Building2, color: "#22c55e" },
  { label: "Projects Live", value: "384", change: "+32%", icon: FolderKanban, color: "#38bdf8" },
  { label: "Events Today", value: "9.5K", change: "+12%", icon: Activity, color: "#8b5cf6" },
  { label: "Alerts Resolved", value: "94%", change: "+9%", icon: Shield, color: "#f59e0b" },
];

const INTEGRATION_STEPS = [
  {
    id: "create",
    number: "01",
    title: "Create a workspace and project",
    detail: "Spin up a workspace, create a product, and generate a secure API key in one place.",
    icon: FolderKanban,
    color: "#22c55e",
  },
  {
    id: "install",
    number: "02",
    title: "Install the PulseIQ snippet or package",
    detail: "Choose a paste-ready snippet or the npm package SDK for modern apps without extra setup friction.",
    icon: Code2,
    color: "#38bdf8",
  },
  {
    id: "collect",
    number: "03",
    title: "Capture live behavioral events",
    detail: "Track page views, clicks, checkout, payments, and exam attempts as they happen.",
    icon: Activity,
    color: "#8b5cf6",
  },
  {
    id: "optimize",
    number: "04",
    title: "Unlock dashboards and AI guidance",
    detail: "Move from raw events to real dashboards, funnel analysis, alerts, and recommendations.",
    icon: Sparkles,
    color: "#f43f5e",
  },
];

const DEMO_PLATFORM_COLORS = {
  html: "#f59e0b",
  websdk: "#14b8a6",
  react: "#38bdf8",
  nextjs: "#e5e7eb",
  vue: "#22c55e",
  angular: "#f43f5e",
  mern: "#8b5cf6",
  wordpress: "#a855f7",
  reactnative: "#10b981",
  flutter: "#06b6d4",
};

const SDK_PLATFORMS = GUIDE_PLATFORMS.map((platform) => ({
  ...platform,
  color: DEMO_PLATFORM_COLORS[platform.id] || "#38bdf8",
}));

const FUNNEL_NOTES = [
  {
    icon: AlertTriangle,
    title: "Critical Drop",
    text: "Biggest drop happens from Sign Up to Add to Cart with a 60% loss.",
    color: "#f43f5e",
  },
  {
    icon: BadgeCheck,
    title: "Strong Signal",
    text: "Checkout to Purchase conversion remains healthy at 50%.",
    color: "#22c55e",
  },
  {
    icon: Lightbulb,
    title: "Recommended Test",
    text: "Run an A/B test on the Add to Cart CTA and supporting proof points.",
    color: "#f59e0b",
  },
  {
    icon: Target,
    title: "Retention Play",
    text: "Retarget users who reached Sign Up but never made it to cart.",
    color: "#8b5cf6",
  },
];

const SLIDES = [
  {
    id: "overview",
    label: "Platform Story",
    eyebrow: "PulseIQ Demo",
    title: "A guided tour through the product experience",
    subtitle: "Showcasing the SaaS workflow, dashboards, live intelligence, and onboarding path.",
    icon: Sparkles,
    color: "#22c55e",
    duration: 7000,
  },
  {
    id: "workflow",
    label: "How It Works",
    eyebrow: "Company to insight",
    title: "Launch tracking, verify setup, and unlock analytics",
    subtitle: "A clean operating model for workspaces, projects, SDK setup, and event collection.",
    icon: FolderKanban,
    color: "#38bdf8",
    duration: 8000,
  },
  {
    id: "analytics",
    label: "Analytics",
    eyebrow: "Operations view",
    title: "Executive metrics and behavioral patterns in one place",
    subtitle: "Trend lines, top events, health signals, and real-time product motion.",
    icon: BarChart3,
    color: "#8b5cf6",
    duration: 9000,
  },
  {
    id: "live",
    label: "Live Feed",
    eyebrow: "Streaming activity",
    title: "See user behavior arrive in real time",
    subtitle: "Follow event flow with a live feed, event mix, and alert-oriented monitoring.",
    icon: Bell,
    color: "#f43f5e",
    duration: 8000,
  },
  {
    id: "funnels",
    label: "Funnels",
    eyebrow: "Conversion analysis",
    title: "Explain where users drop and what to do next",
    subtitle: "A focused funnel layer built for growth, product teams, and operators.",
    icon: TrendingUp,
    color: "#f59e0b",
    duration: 8500,
  },
  {
    id: "sdk",
    label: "SDK Setup",
    eyebrow: "Implementation",
    title: "Get live in minutes with framework-ready snippets",
    subtitle: "The setup path stays simple while the analytics layer remains enterprise-ready.",
    icon: Code2,
    color: "#14b8a6",
    duration: 9500,
  },
  {
    id: "cta",
    label: "Get Started",
    eyebrow: "Ready to launch",
    title: "Start collecting insights without slowing your team down",
    subtitle: "PulseIQ turns raw events into dashboards, alerts, and AI-backed action.",
    icon: Zap,
    color: "#22c55e",
    duration: 0,
  },
];

const TooltipCard = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="rounded-2xl border border-white/10 bg-[#07111d]/95 px-3 py-2 shadow-2xl"
      style={{ backdropFilter: "blur(12px)" }}
    >
      <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-[#7da6d4]" style={{ fontFamily: "var(--font-mono)" }}>
        {label}
      </p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-[11px] font-bold" style={{ color: entry.color, fontFamily: "var(--font-mono)" }}>
          {entry.name}: {Number(entry.value || 0).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

const DemoShell = ({ slide, children }) => (
  <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#07111d]/85 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:p-8">
    <div
      className="absolute inset-0 opacity-80"
      style={{
        background:
          "radial-gradient(circle at top right, rgba(56,189,248,0.18), transparent 30%), radial-gradient(circle at bottom left, rgba(34,197,94,0.12), transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))",
      }}
    />
    <div className="absolute -right-16 top-10 h-36 w-36 rounded-full blur-3xl" style={{ background: `${slide.color}22` }} />
    <div className="absolute left-10 top-24 h-24 w-24 rounded-full blur-3xl" style={{ background: `${slide.color}18` }} />
    <div className="relative">{children}</div>
  </div>
);

const SectionHeader = ({ slide }) => {
  const Icon = slide.icon;

  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <Icon className="h-5 w-5" style={{ color: slide.color }} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#8db2d8]" style={{ fontFamily: "var(--font-mono)" }}>
              {slide.eyebrow}
            </p>
            <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: slide.color, fontFamily: "var(--font-mono)" }}>
              {slide.label}
            </p>
          </div>
        </div>
        <h1 className="max-w-3xl text-3xl font-black leading-tight text-white sm:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
          {slide.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#8db2d8]" style={{ fontFamily: "var(--font-mono)" }}>
          {slide.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:min-w-[280px]">
        {WALKTHROUGH_METRICS.slice(0, 2).map(({ icon: IconMetric, label, value, change, color }) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-[#06101a]/80 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border" style={{ borderColor: `${color}33`, background: `${color}12` }}>
                <IconMetric className="h-4 w-4" style={{ color }} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color, fontFamily: "var(--font-mono)" }}>
                {change}
              </span>
            </div>
            <p className="text-2xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
              {value}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[#7da6d4]" style={{ fontFamily: "var(--font-mono)" }}>
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const SceneOverview = ({ slide }) => (
  <DemoShell slide={slide}>
    <SectionHeader slide={slide} />

    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {WALKTHROUGH_METRICS.map(({ icon: Icon, label, value, change, color }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="rounded-3xl border border-white/10 bg-[#06101a]/90 p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border" style={{ borderColor: `${color}33`, background: `${color}12` }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color, fontFamily: "var(--font-mono)" }}>
                  <ArrowUpRight className="h-3 w-3" />
                  {change}
                </span>
              </div>
              <p className="text-3xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
                {value}
              </p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-[#7da6d4]" style={{ fontFamily: "var(--font-mono)" }}>
                {label}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-3xl border border-white/10 bg-[#06101a]/85 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#7da6d4]" style={{ fontFamily: "var(--font-mono)" }}>
                  Product narrative
                </p>
                <h2 className="mt-1 text-xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
                  The AI analytics layer for modern digital products
                </h2>
              </div>
              <div className="hidden rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-emerald-300 md:block" style={{ fontFamily: "var(--font-mono)" }}>
                Multi-tenant SaaS
              </div>
            </div>
            <p className="text-sm leading-7 text-[#8db2d8]" style={{ fontFamily: "var(--font-mono)" }}>
              PulseIQ helps teams understand user behavior, identify drop-off points, monitor live product activity, and act on AI-backed suggestions from one collaborative analytics workspace.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Real-time event tracking",
                "Funnel and retention analysis",
                "Workspace and project isolation",
                "AI insights and guided alerts",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs text-[#d8ecff]" style={{ fontFamily: "var(--font-mono)" }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#06101a]/85 p-6">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#7da6d4]" style={{ fontFamily: "var(--font-mono)" }}>
              Ideal teams
            </p>
            <div className="mt-5 space-y-3">
              {[
                { label: "SaaS products", icon: Globe, color: "#38bdf8" },
                { label: "E-commerce", icon: MousePointer, color: "#f59e0b" },
                { label: "EdTech and exams", icon: Eye, color: "#8b5cf6" },
                { label: "Growth teams", icon: TrendingUp, color: "#22c55e" },
              ].map(({ label, icon: Icon, color }) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}14` }}>
                    <Icon className="h-4 w-4" style={{ color }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{label}</p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#7da6d4]" style={{ fontFamily: "var(--font-mono)" }}>
                      Industry-ready analytics
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-[#050c14]/90 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#7da6d4]" style={{ fontFamily: "var(--font-mono)" }}>
              Live readiness
            </p>
            <h3 className="mt-1 text-lg font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
              Platform pulse
            </h3>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.18em] text-emerald-300" style={{ fontFamily: "var(--font-mono)" }}>
              Live
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: "AI summary generated", value: "2m ago", color: "#38bdf8" },
            { label: "Low health alert delivered", value: "6m ago", color: "#f43f5e" },
            { label: "Weekly report queued", value: "10m ago", color: "#22c55e" },
            { label: "SDK verification passed", value: "12m ago", color: "#8b5cf6" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
              <div className="mb-1 flex items-center justify-between gap-4">
                <p className="text-xs font-semibold text-white">{item.label}</p>
                <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: item.color, fontFamily: "var(--font-mono)" }}>
                  {item.value}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/6">
                <div className="h-full rounded-full" style={{ width: "72%", background: item.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </DemoShell>
);

const SceneWorkflow = ({ slide }) => (
  <DemoShell slide={slide}>
    <SectionHeader slide={slide} />

    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-4">
        {INTEGRATION_STEPS.map(({ id, number, title, detail, icon: Icon, color }, index) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08, duration: 0.45 }}
            className="relative rounded-3xl border border-white/10 bg-[#06101a]/85 p-5"
          >
            {index !== INTEGRATION_STEPS.length - 1 && (
              <div className="absolute left-[34px] top-[72px] h-10 w-px bg-gradient-to-b from-white/20 to-transparent" />
            )}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border" style={{ borderColor: `${color}33`, background: `${color}10` }}>
                  <Icon className="h-6 w-6" style={{ color }} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em]" style={{ color, fontFamily: "var(--font-mono)" }}>
                    Step {number}
                  </p>
                  <h3 className="mt-1 text-lg font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
                    {title}
                  </h3>
                </div>
              </div>
              <p className="sm:ml-auto max-w-xl text-sm leading-7 text-[#8db2d8]" style={{ fontFamily: "var(--font-mono)" }}>
                {detail}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="rounded-3xl border border-white/10 bg-[#06101a]/85 p-6">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#7da6d4]" style={{ fontFamily: "var(--font-mono)" }}>
            Architecture flow
          </p>
          <div className="mt-5 space-y-3">
            {[
              "Client website or app",
              "PulseIQ tracking script",
              "Secure backend ingestion API",
              "MongoDB event and project storage",
              "Analytics engine and AI layer",
              "Dashboards, alerts, and reports",
            ].map((item, index) => (
              <div key={item} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-white" style={{ fontFamily: "var(--font-mono)" }}>
                  {index + 1}
                </div>
                <div className="flex-1 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-xs text-[#d8ecff]" style={{ fontFamily: "var(--font-mono)" }}>
                  {item}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#06101a]/85 p-6">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#7da6d4]" style={{ fontFamily: "var(--font-mono)" }}>
            Why teams like the flow
          </p>
          <div className="mt-4 grid gap-3">
            {[
              { icon: Shield, label: "Project-level API isolation", color: "#22c55e" },
              { icon: Users, label: "Team invites and role control", color: "#38bdf8" },
              { icon: Bell, label: "Weekly reports and alerting", color: "#f59e0b" },
              { icon: Sparkles, label: "AI-backed recommendations", color: "#8b5cf6" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}12` }}>
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <p className="text-sm text-white">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </DemoShell>
);

const SceneAnalytics = ({ slide }) => (
  <DemoShell slide={slide}>
    <SectionHeader slide={slide} />

    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total Events", value: "9,534", delta: "+12.4%", icon: Activity, color: "#38bdf8" },
            { label: "Unique Users", value: "2,841", delta: "+8.1%", icon: Users, color: "#22c55e" },
            { label: "Events per User", value: "3.4", delta: "+5.2%", icon: MousePointer, color: "#8b5cf6" },
            { label: "DAU Today", value: "412", delta: "+18.7%", icon: TrendingUp, color: "#f59e0b" },
          ].map(({ label, value, delta, icon: Icon, color }) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-[#06101a]/85 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border" style={{ borderColor: `${color}33`, background: `${color}10` }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color, fontFamily: "var(--font-mono)" }}>
                  {delta}
                </span>
              </div>
              <p className="text-3xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
                {value}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[#7da6d4]" style={{ fontFamily: "var(--font-mono)" }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#06101a]/85 p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#7da6d4]" style={{ fontFamily: "var(--font-mono)" }}>
                14 day trend
              </p>
              <h3 className="mt-1 text-xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
                Daily users and sessions
              </h3>
            </div>
            <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-sky-300" style={{ fontFamily: "var(--font-mono)" }}>
              Auto-refresh active
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={DAU} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="usersFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="sessionsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#183147" vertical={false} />
              <XAxis dataKey="d" tick={{ fill: "#7da6d4", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#7da6d4", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipCard />} />
              <Area type="monotone" dataKey="s" name="Sessions" stroke="#22c55e" strokeWidth={2} fill="url(#sessionsFill)" dot={false} />
              <Area type="monotone" dataKey="u" name="Users" stroke="#38bdf8" strokeWidth={2.3} fill="url(#usersFill)" dot={false} activeDot={{ r: 4, fill: "#38bdf8" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-[#06101a]/85 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#7da6d4]" style={{ fontFamily: "var(--font-mono)" }}>
                Most frequent
              </p>
              <h3 className="mt-1 text-xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
                Top events
              </h3>
            </div>
            <BarChart3 className="h-5 w-5 text-[#8b5cf6]" />
          </div>

          <div className="space-y-4">
            {TOP_EVENTS.map((event) => (
              <div key={event.name}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <code className="text-[11px] font-semibold" style={{ color: event.color, fontFamily: "var(--font-mono)" }}>
                    {event.name}
                  </code>
                  <span className="text-[11px] text-[#d8ecff]" style={{ fontFamily: "var(--font-mono)" }}>
                    {event.count.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/6">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(event.count / TOP_EVENTS[0].count) * 100}%` }}
                    transition={{ duration: 0.7 }}
                    className="h-full rounded-full"
                    style={{ background: event.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#06101a]/85 p-6">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#7da6d4]" style={{ fontFamily: "var(--font-mono)" }}>
            AI health summary
          </p>
          <div className="mt-4 space-y-3">
            {[
              { title: "Conversion health", text: "Healthy checkout completion with room to improve mid-funnel progression.", color: "#22c55e" },
              { title: "Engagement trend", text: "Event volume is rising week over week across active projects.", color: "#38bdf8" },
              { title: "Action priority", text: "Improve cart entry and post-signup continuation to lift overall conversion.", color: "#f59e0b" },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                  <p className="text-sm font-bold text-white">{item.title}</p>
                </div>
                <p className="text-xs leading-6 text-[#8db2d8]" style={{ fontFamily: "var(--font-mono)" }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </DemoShell>
);

const SceneLive = ({ slide }) => {
  const [feed, setFeed] = useState(LIVE_FEED);
  const [liveCount, setLiveCount] = useState(24);

  useEffect(() => {
    const eventNames = Object.keys(EVENT_COLORS);
    const pages = ["/home", "/products", "/checkout", "/pricing", "/auth", "/courses"];

    const interval = setInterval(() => {
      setFeed((prev) => [
        {
          event: eventNames[Math.floor(Math.random() * eventNames.length)],
          user: `anon_${Math.random().toString(36).slice(2, 6)}`,
          page: pages[Math.floor(Math.random() * pages.length)],
          time: "just now",
        },
        ...prev.slice(0, 7),
      ]);
      setLiveCount((count) => count + 1);
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <DemoShell slide={slide}>
      <SectionHeader slide={slide} />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-white/10 bg-[#06101a]/85 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-rose-400 animate-pulse" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-rose-300" style={{ fontFamily: "var(--font-mono)" }}>
                  Live event stream
                </p>
                <h3 className="mt-1 text-xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
                  Events flowing every second
                </h3>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-[#d8ecff]" style={{ fontFamily: "var(--font-mono)" }}>
              {liveCount} new events
            </div>
          </div>

          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {feed.map((item, index) => (
                <motion.div
                  key={`${item.user}-${item.event}-${index}-${liveCount}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="grid items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 sm:grid-cols-[auto_1fr_auto_auto]"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: EVENT_COLORS[item.event] || "#7da6d4" }} />
                    <code className="text-[11px] font-semibold" style={{ color: EVENT_COLORS[item.event] || "#d8ecff", fontFamily: "var(--font-mono)" }}>
                      {item.event}
                    </code>
                  </div>
                  <span className="text-[11px] text-[#d8ecff]" style={{ fontFamily: "var(--font-mono)" }}>
                    {item.user}
                  </span>
                  <span className="text-[11px] text-[#7da6d4]" style={{ fontFamily: "var(--font-mono)" }}>
                    {item.page}
                  </span>
                  <span className="text-[11px] text-[#7da6d4]" style={{ fontFamily: "var(--font-mono)" }}>
                    {item.time}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[#06101a]/85 p-6">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#7da6d4]" style={{ fontFamily: "var(--font-mono)" }}>
              Event distribution
            </p>
            <div className="mt-4 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={TOP_EVENTS} dataKey="count" innerRadius={58} outerRadius={88} paddingAngle={2} stroke="none">
                    {TOP_EVENTS.map((event) => (
                      <Cell key={event.name} fill={event.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-2">
              {TOP_EVENTS.map((event) => (
                <div key={event.name} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: event.color }} />
                  <span className="flex-1 text-[11px] text-[#d8ecff]" style={{ fontFamily: "var(--font-mono)" }}>
                    {event.name}
                  </span>
                  <span className="text-[11px]" style={{ color: event.color, fontFamily: "var(--font-mono)" }}>
                    {event.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#06101a]/85 p-6">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#7da6d4]" style={{ fontFamily: "var(--font-mono)" }}>
              Alert routing
            </p>
            <div className="mt-4 grid gap-3">
              {[
                { label: "Admin notifications", icon: Bell, color: "#f43f5e" },
                { label: "Organizer health reports", icon: TrendingUp, color: "#22c55e" },
                { label: "Grace period reminders", icon: Clock3, color: "#f59e0b" },
              ].map(({ label, icon: Icon, color }) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}12` }}>
                    <Icon className="h-4 w-4" style={{ color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#7da6d4]" style={{ fontFamily: "var(--font-mono)" }}>
                      Real-time delivery
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DemoShell>
  );
};

const SceneFunnels = ({ slide }) => (
  <DemoShell slide={slide}>
    <SectionHeader slide={slide} />

    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-white/10 bg-[#06101a]/85 p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#7da6d4]" style={{ fontFamily: "var(--font-mono)" }}>
              Conversion funnel
            </p>
            <h3 className="mt-1 text-xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
              From first visit to purchase
            </h3>
          </div>
          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-amber-200" style={{ fontFamily: "var(--font-mono)" }}>
            Overall conversion 5%
          </div>
        </div>

        <div className="space-y-4">
          {FUNNEL.map((step, index) => {
            const color = TOP_EVENTS[index]?.color || "#38bdf8";
            const previousUsers = FUNNEL[index - 1]?.users;
            const dropped = previousUsers ? previousUsers - step.users : 0;

            return (
              <div key={step.stage}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-bold text-white">{step.stage}</p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#7da6d4]" style={{ fontFamily: "var(--font-mono)" }}>
                      {step.users.toLocaleString()} users
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {dropped > 0 && (
                      <span className="text-[10px] uppercase tracking-[0.18em] text-rose-300" style={{ fontFamily: "var(--font-mono)" }}>
                        -{dropped.toLocaleString()} dropped
                      </span>
                    )}
                    <span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color, background: `${color}14`, fontFamily: "var(--font-mono)" }}>
                      {step.pct}%
                    </span>
                  </div>
                </div>
                <div className="h-11 rounded-2xl bg-white/6 p-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${step.pct}%` }}
                    transition={{ duration: 0.7, delay: index * 0.08 }}
                    className="flex h-full items-center rounded-xl px-4"
                    style={{ background: `linear-gradient(90deg, ${color}55, ${color}20)` }}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white" style={{ fontFamily: "var(--font-mono)" }}>
                      {step.stage}
                    </span>
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {FUNNEL_NOTES.map(({ icon: Icon, title, text, color }) => (
          <div key={title} className="rounded-3xl border border-white/10 bg-[#06101a]/85 p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: `${color}12` }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{title}</p>
                <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color, fontFamily: "var(--font-mono)" }}>
                  AI recommendation
                </p>
              </div>
            </div>
            <p className="text-sm leading-7 text-[#8db2d8]" style={{ fontFamily: "var(--font-mono)" }}>
              {text}
            </p>
          </div>
        ))}

        <div className="rounded-3xl border border-white/10 bg-[#06101a]/85 p-5">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#7da6d4]" style={{ fontFamily: "var(--font-mono)" }}>
            Snapshot
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { label: "Biggest drop", value: "Sign Up -> Add to Cart" },
              { label: "Strongest stage", value: "Checkout -> Purchase" },
              { label: "Next test", value: "CTA and social proof" },
              { label: "Target segment", value: "Signup drop-off users" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#7da6d4]" style={{ fontFamily: "var(--font-mono)" }}>
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </DemoShell>
);

const SceneSdk = ({ slide }) => {
  const [platform, setPlatform] = useState("react");
  const currentGuide = getSdkGuide({
    platform,
    apiKey: "pk_your_key_here",
    projectId: "your_project_id",
    endpoint: "https://your-backend.onrender.com",
  });

  return (
    <DemoShell slide={slide}>
      <SectionHeader slide={slide} />

      <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <div className="space-y-4">
          {INTEGRATION_STEPS.map(({ id, number, title, detail, icon: Icon, color }) => (
            <div key={id} className="rounded-3xl border border-white/10 bg-[#06101a]/85 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border" style={{ borderColor: `${color}33`, background: `${color}12` }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color, fontFamily: "var(--font-mono)" }}>
                    Step {number}
                  </p>
                  <p className="mt-1 text-lg font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
                    {title}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[#8db2d8]" style={{ fontFamily: "var(--font-mono)" }}>
                    {detail}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#050c14]/95">
          <div className="border-b border-white/10 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#7da6d4]" style={{ fontFamily: "var(--font-mono)" }}>
                  SDK guide library
                </p>
                <h3 className="mt-1 text-xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
                  Framework-ready snippet and package setup
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {SDK_PLATFORMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPlatform(item.id)}
                    className="rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-all"
                    style={{
                      borderColor: platform === item.id ? `${item.color}55` : "#183147",
                      background: platform === item.id ? `${item.color}16` : "transparent",
                      color: platform === item.id ? item.color : "#7da6d4",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <pre className="max-h-[460px] overflow-auto px-5 py-5 text-[11px] leading-6 text-[#b9d7f3]" style={{ fontFamily: "var(--font-mono)" }}>
            {currentGuide.code}
          </pre>

          <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-[#7da6d4]" style={{ fontFamily: "var(--font-mono)" }}>
              <Key className="h-4 w-4 text-[#22c55e]" />
              Real credentials auto-fill after signup
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-[#031018]"
                style={{ background: "linear-gradient(135deg,#22c55e,#38bdf8)", fontFamily: "var(--font-display)" }}
              >
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-[#d8ecff]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Open dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DemoShell>
  );
};

const SceneCta = ({ slide }) => (
  <DemoShell slide={slide}>
    <SectionHeader slide={slide} />

    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-[30px] border border-white/10 bg-[#06101a]/85 p-8">
        <p className="text-[10px] uppercase tracking-[0.24em] text-[#7da6d4]" style={{ fontFamily: "var(--font-mono)" }}>
          Launch checklist
        </p>
        <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
          Start collecting real product intelligence in minutes
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#8db2d8]" style={{ fontFamily: "var(--font-mono)" }}>
          Create a workspace, connect your project, install the snippet, invite your team, and turn live behavior into reports, funnels, and AI-backed action.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            "Workspace and project setup",
            "GitHub-style member invitation flow",
            "Admin notifications and alerts",
            "Weekly reports and health scoring",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-[#d8ecff]" style={{ fontFamily: "var(--font-mono)" }}>
                {item}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-[#031018]"
            style={{ background: "linear-gradient(135deg,#22c55e,#38bdf8)", fontFamily: "var(--font-display)" }}
          >
            Create account
            <Zap className="h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-6 py-4 text-sm font-bold uppercase tracking-[0.18em] text-[#d8ecff]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Open product
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {[
          {
            title: "For organizers",
            text: "Monitor workspace health, invite members, receive reports, and drive AI-backed optimization.",
            icon: Users,
            color: "#22c55e",
          },
          {
            title: "For admins",
            text: "Control platform operations, route notifications, monitor adoption, and review system health.",
            icon: Shield,
            color: "#38bdf8",
          },
          {
            title: "For product teams",
            text: "Use live events, funnel visibility, and user journey signals to improve conversion performance.",
            icon: TrendingUp,
            color: "#8b5cf6",
          },
        ].map(({ title, text, icon: Icon, color }) => (
          <div key={title} className="rounded-3xl border border-white/10 bg-[#06101a]/85 p-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `${color}12` }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <div>
                <p className="text-lg font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
                  {title}
                </p>
                <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color, fontFamily: "var(--font-mono)" }}>
                  High-trust workflow
                </p>
              </div>
            </div>
            <p className="text-sm leading-7 text-[#8db2d8]" style={{ fontFamily: "var(--font-mono)" }}>
              {text}
            </p>
          </div>
        ))}
      </div>
    </div>
  </DemoShell>
);

const SCENE_COMPONENTS = {
  overview: SceneOverview,
  workflow: SceneWorkflow,
  analytics: SceneAnalytics,
  live: SceneLive,
  funnels: SceneFunnels,
  sdk: SceneSdk,
  cta: SceneCta,
};

const Demo = () => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const elapsedRef = useRef(0);

  const goTo = useCallback((index) => {
    const nextIndex = Math.max(0, Math.min(SLIDES.length - 1, index));
    setSlideIndex(nextIndex);
    setProgress(0);
    elapsedRef.current = 0;
  }, []);

  const currentSlide = SLIDES[slideIndex];
  const CurrentScene = SCENE_COMPONENTS[currentSlide.id];

  const handlePrev = useCallback(() => goTo(slideIndex - 1), [goTo, slideIndex]);
  const handleNext = useCallback(() => goTo(slideIndex + 1), [goTo, slideIndex]);

  useEffect(() => {
    const duration = currentSlide.duration;

    if (!isPlaying || duration === 0) return undefined;

    const tick = 50;
    timerRef.current = setInterval(() => {
      elapsedRef.current += tick;
      const nextProgress = Math.min((elapsedRef.current / duration) * 100, 100);
      setProgress(nextProgress);

      if (elapsedRef.current >= duration) {
        clearInterval(timerRef.current);
        if (slideIndex < SLIDES.length - 1) {
          goTo(slideIndex + 1);
        }
      }
    }, tick);

    return () => clearInterval(timerRef.current);
  }, [currentSlide.duration, goTo, isPlaying, slideIndex]);

  return (
    <div className="min-h-screen bg-[#030711] text-white">
      <Navbar />

      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(56,189,248,0.12), transparent 28%), radial-gradient(circle at top right, rgba(34,197,94,0.1), transparent 28%), radial-gradient(circle at bottom center, rgba(139,92,246,0.12), transparent 30%), #030711",
        }}
      />

      <div className="fixed left-0 right-0 top-16 z-40 h-[3px] bg-white/5">
        <motion.div
          className="h-full"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${currentSlide.color}, ${currentSlide.color}aa)`,
          }}
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1600px] gap-6 px-4 pb-28 pt-28 sm:px-6 xl:px-10">
        <aside className="sticky top-28 hidden h-[calc(100vh-10rem)] w-[260px] shrink-0 xl:block">
          <div className="rounded-[28px] border border-white/10 bg-[#07111d]/80 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="mb-5 px-2">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#7da6d4]" style={{ fontFamily: "var(--font-mono)" }}>
                Demo navigator
              </p>
              <h2 className="mt-2 text-xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
                Product walkthrough
              </h2>
            </div>

            <div className="space-y-2">
              {SLIDES.map((item, index) => {
                const Icon = item.icon;
                const active = index === slideIndex;

                return (
                  <button
                    key={item.id}
                    onClick={() => goTo(index)}
                    className="w-full rounded-2xl border px-4 py-3 text-left transition-all"
                    style={{
                      borderColor: active ? `${item.color}55` : "#183147",
                      background: active ? `${item.color}12` : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border" style={{ borderColor: active ? `${item.color}44` : "#1c2a38" }}>
                        <Icon className="h-4 w-4" style={{ color: active ? item.color : "#7da6d4" }} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: active ? item.color : "#7da6d4", fontFamily: "var(--font-mono)" }}>
                          {String(index + 1).padStart(2, "0")}
                        </p>
                        <p className="mt-1 text-sm font-bold text-white">{item.label}</p>
                        <p className="mt-1 text-xs leading-5 text-[#8db2d8]" style={{ fontFamily: "var(--font-mono)" }}>
                          {item.eyebrow}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="relative z-10 min-w-0 flex-1">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-[#7da6d4]" style={{ fontFamily: "var(--font-mono)" }}>
                PulseIQ / Product Demo
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[10px] uppercase tracking-[0.2em]" style={{ color: currentSlide.color, fontFamily: "var(--font-mono)" }}>
                {currentSlide.label}
              </div>
            </div>

            <div className="hidden rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-[#d8ecff] lg:flex lg:items-center lg:gap-2" style={{ fontFamily: "var(--font-mono)" }}>
              <Eye className="h-4 w-4 text-[#38bdf8]" />
              Auto-play walkthrough
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, y: 26, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.99 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <CurrentScene slide={currentSlide} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <div className="fixed bottom-5 left-0 right-0 z-50 px-4">
        <div className="mx-auto flex w-full max-w-[980px] flex-wrap items-center justify-center gap-3 rounded-[26px] border border-white/10 bg-[#07111d]/88 px-4 py-3 shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:px-5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrev}
            disabled={slideIndex === 0}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 text-[#7da6d4] transition-all disabled:opacity-35"
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsPlaying((value) => !value);
              elapsedRef.current = (progress / 100) * currentSlide.duration;
            }}
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-[#031018]"
            style={{ background: currentSlide.color, boxShadow: `0 0 18px ${currentSlide.color}55` }}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </motion.button>

          <div className="flex items-center gap-2">
            {SLIDES.map((item, index) => (
              <button
                key={item.id}
                onClick={() => goTo(index)}
                className="rounded-full transition-all"
                style={{
                  width: index === slideIndex ? 26 : 8,
                  height: 8,
                  background: index === slideIndex ? item.color : index < slideIndex ? "#6a8fb4" : "#1f3448",
                }}
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            disabled={slideIndex === SLIDES.length - 1}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 text-[#7da6d4] transition-all disabled:opacity-35"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>

          {slideIndex < SLIDES.length - 1 && (
            <button
              onClick={() => goTo(SLIDES.length - 1)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#d8ecff]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Skip to final
              <SkipForward className="h-4 w-4" />
            </button>
          )}

          <div className="text-[10px] uppercase tracking-[0.18em] text-[#7da6d4]" style={{ fontFamily: "var(--font-mono)" }}>
            {slideIndex + 1}/{SLIDES.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
