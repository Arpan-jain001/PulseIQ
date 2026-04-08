import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search,
  ChevronDown,
  HelpCircle,
  Zap,
  Code2,
  BarChart3,
  Users,
  Shield,
  Terminal,
  Key,
  Building2,
  FolderKanban,
  Bell,
  Mail,
  MessageSquare,
  Copy,
  Check,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { SDK_PLATFORMS, getMinimalHtmlSnippet, getSdkQuickStartSteps } from "../lib/sdkGuides";
import { SUPPORT_EMAIL } from "../lib/runtimeConfig";

const C = {
  bg: "#020408",
  card: "#060d18",
  border: "#1a2a4a",
  green: "#10d990",
  cyan: "#00e5ff",
  purple: "#a855f7",
  pink: "#f43f8e",
  amber: "#f59e0b",
  text: "#e8f4ff",
  muted: "#8ab4d4",
  dim: "#3d6080",
  dimmer: "#1a3a6b",
};

const FAQS = [
  {
    section: "Getting Started",
    icon: Zap,
    color: C.green,
    items: [
      {
        q: "What is PulseIQ?",
        a: "PulseIQ is an analytics SaaS platform that tracks user behavior on websites and apps in real time. You create a project, copy the tracking credentials, install the SDK snippet, and start seeing events, DAU, retention, and AI insights.",
      },
      {
        q: "How do I create my first project?",
        a: "Sign up as an Organizer, complete verification, create a workspace, then create a project inside it. PulseIQ immediately gives you the API key, project id, SDK setup guide, and verify step.",
      },
      {
        q: "What roles are available?",
        a: "USER can join workspaces and view assigned analytics. ORGANIZER manages workspaces, projects, and SDK setup. SUPER_ADMIN controls the whole platform, including users, approvals, and system operations.",
      },
    ],
  },
  {
    section: "SDK Integration",
    icon: Code2,
    color: C.cyan,
    items: [
      {
        q: "How do I install the PulseIQ SDK?",
        a: "Open Projects, click SDK Setup, then choose either the paste-ready snippet guides or the installable npm package SDK. The guide tells you the exact file and paste location for HTML, React, Next.js, Vue, Angular, MERN, WordPress, React Native, and Flutter.",
      },
      {
        q: "What is the ingest endpoint?",
        a: "All events are sent to POST /api/ingest/event. The SDK snippet handles this automatically using the x-api-key header, projectId, eventName, and anonymousId or userId.",
      },
      {
        q: "My API key was shown once and I missed it. What do I do?",
        a: "For security, the raw API key is only shown once when the project is created. If you lose it, create a new project or implement API-key rotation later. Existing projects will still show the endpoint and project id, but not the raw key.",
      },
      {
        q: "Do I need to update the endpoint when I deploy?",
        a: "Yes. During local development the SDK points to your current backend URL. In production you should update the backend base URL so the snippet sends events to your deployed API.",
      },
    ],
  },
  {
    section: "Analytics",
    icon: BarChart3,
    color: C.purple,
    items: [
      {
        q: "Why is my Analytics page locked?",
        a: "Analytics unlock after SDK verification. Paste the snippet, refresh your website or app once so page_view is sent, then use Verify SDK inside PulseIQ. After the first event is received, the project becomes verified.",
      },
      {
        q: "What data does PulseIQ calculate?",
        a: "PulseIQ calculates overview metrics, DAU, MAU, retention, page analytics, event trends, click/scroll readiness, session journeys, and exam analytics when relevant events are present.",
      },
      {
        q: "How do I identify logged-in users?",
        a: "Call identify('user_id') after login or signup. Before that, PulseIQ tracks visitors with a stable anonymous id so user journeys still work even without authentication.",
      },
    ],
  },
  {
    section: "Workspaces & Teams",
    icon: Users,
    color: C.amber,
    items: [
      {
        q: "How do I invite team members?",
        a: "Go to Workspaces, open a workspace, add a teammate by email, and assign the role you want. Members can then access the workspaces and projects they are part of.",
      },
      {
        q: "Can invited users see analytics?",
        a: "Yes. If they are active members of the workspace, they can open the project analytics pages according to their assigned role and permissions.",
      },
    ],
  },
  {
    section: "Security",
    icon: Shield,
    color: C.pink,
    items: [
      {
        q: "Is the API key stored securely?",
        a: "Yes. The raw key is not stored in plain text. PulseIQ stores a hash and validates incoming tracking requests against that hash on the backend.",
      },
      {
        q: "How is project access controlled?",
        a: "Protected dashboard routes require login, and project analytics APIs verify that the current user actually belongs to the workspace or is a super admin before returning data.",
      },
    ],
  },
];

const QUICK_LINKS = [
  { icon: Key, label: "API Key Setup", desc: "Copy credentials and SDK code", color: C.amber, to: "/organizer-dashboard/projects" },
  { icon: BarChart3, label: "Analytics", desc: "DAU, retention, sessions, AI", color: C.purple, to: "/organizer-dashboard/analytics" },
  { icon: Building2, label: "Workspaces", desc: "Create workspaces and invite teams", color: C.green, to: "/organizer-dashboard/workspaces" },
  { icon: FolderKanban, label: "Projects", desc: "Create and configure tracking targets", color: C.cyan, to: "/organizer-dashboard/projects" },
  { icon: Bell, label: "Notifications", desc: "Check invites and system updates", color: C.pink, to: "/dashboard/notifications" },
  { icon: Shield, label: "Admin Panel", desc: "Manage users and approvals", color: C.pink, to: "/admin-dashboard" },
];

const CodeSnippet = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code).catch(() => {
      const element = document.createElement("textarea");
      element.value = code;
      element.style.cssText = "position:fixed;top:-9999px;opacity:0";
      document.body.appendChild(element);
      element.select();
      document.execCommand("copy");
      document.body.removeChild(element);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-[#1a2a4a] bg-[#020810]">
      <div className="flex items-center justify-between border-b border-[#1a2a4a] px-4 py-2">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#f43f8e44]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#f59e0b44]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#10d99044]" />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={copy}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
          style={{ color: copied ? C.green : C.dim, fontFamily: "var(--font-mono)" }}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied!" : "Copy"}
        </motion.button>
      </div>
      <pre className="overflow-x-auto p-4 text-[11px] leading-relaxed" style={{ fontFamily: "var(--font-mono)", color: C.cyan }}>
        {code}
      </pre>
    </div>
  );
};

const FaqItem = ({ item, color, index }) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="overflow-hidden rounded-2xl border transition-all"
      style={{ borderColor: open ? `${color}30` : C.border, background: open ? `${color}08` : C.card }}
    >
      <button className="flex w-full items-center justify-between px-5 py-4 text-left" onClick={() => setOpen((value) => !value)}>
        <span className="pr-4 text-sm font-bold text-[#e8f4ff]">{item.q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 flex-shrink-0" style={{ color: open ? color : C.dim }} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t px-5 pb-5" style={{ borderColor: `${color}20` }}>
              <p className="pt-4 text-sm leading-relaxed" style={{ color: C.muted, fontFamily: "var(--font-mono)" }}>
                {item.a}
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
};

const HelpCenter = () => {
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState(null);

  const sdkSteps = getSdkQuickStartSteps();
  const platformLabels = useMemo(() => SDK_PLATFORMS.map((platform) => platform.label), []);

  const filtered = search.trim()
    ? FAQS.map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.q.toLowerCase().includes(search.toLowerCase()) ||
            item.a.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter((section) => section.items.length > 0)
    : activeSection
      ? FAQS.filter((section) => section.section === activeSection)
      : FAQS;

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <Navbar />

      <div className="relative overflow-hidden px-4 pb-16 pt-24">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full opacity-10"
            style={{ background: `radial-gradient(ellipse, ${C.cyan} 0%, transparent 70%)` }}
          />
          <div
            className="absolute left-1/4 top-20 h-[200px] w-[200px] rounded-full opacity-5"
            style={{ background: `radial-gradient(ellipse, ${C.green} 0%, transparent 70%)` }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(${C.cyan} 1px, transparent 1px), linear-gradient(90deg, ${C.cyan} 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#10d99030] bg-[#10d99010] px-4 py-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-[#10d990]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#10d990]" style={{ fontFamily: "var(--font-mono)" }}>
                Help Center
              </span>
            </div>
          </motion.div>

          <motion.h1
            className="mb-4 text-4xl font-black uppercase leading-tight text-[#e8f4ff] sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            PulseIQ setup and
            <br />
            <span
              style={{
                background: `linear-gradient(135deg, ${C.green}, ${C.cyan})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              integration guide
            </span>
          </motion.h1>

          <motion.p
            className="mb-8 text-sm"
            style={{ color: C.dim, fontFamily: "var(--font-mono)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Search the docs or use the quick-start blocks below to integrate PulseIQ on your website or app.
          </motion.p>

          <motion.div className="relative mx-auto max-w-xl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: C.dim }} />
            <input
              className="w-full rounded-2xl py-4 pl-11 pr-4 text-sm outline-none transition-all"
              style={{
                background: C.card,
                border: `1px solid ${search ? `${C.cyan}50` : C.border}`,
                color: C.text,
                fontFamily: "var(--font-mono)",
                boxShadow: search ? `0 0 0 3px ${C.cyan}10` : "none",
              }}
              placeholder="Search API key, verify SDK, React, Next.js, WordPress..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setActiveSection(null);
              }}
            />
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-20">
        {!search ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-12">
            <p className="mb-4 text-[10px] uppercase tracking-[0.3em]" style={{ color: C.dim, fontFamily: "var(--font-mono)" }}>
              Quick Navigation
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {QUICK_LINKS.map(({ icon: Icon, label, desc, color, to }) => (
                <Link key={label} to={to}>
                  <motion.div
                    whileHover={{ y: -4, borderColor: `${color}40` }}
                    className="cursor-pointer rounded-2xl border p-4 text-center transition-all"
                    style={{ background: C.card, borderColor: C.border, boxShadow: "0 4px 20px #00000044" }}
                  >
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                      <Icon className="h-4.5 w-4.5" style={{ color }} />
                    </div>
                    <p className="mb-1 text-[11px] font-bold" style={{ color: C.text }}>
                      {label}
                    </p>
                    <p className="text-[10px]" style={{ color: C.dim, fontFamily: "var(--font-mono)" }}>
                      {desc}
                    </p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        ) : null}

        {!search && !activeSection ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12 overflow-hidden rounded-2xl border"
            style={{ background: C.card, borderColor: C.border, boxShadow: "0 4px 24px #00000055" }}
          >
            <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${C.green}, ${C.cyan}, ${C.purple})` }} />
            <div className="p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${C.green}15`, border: `1px solid ${C.green}30` }}>
                  <Terminal className="h-5 w-5" style={{ color: C.green }} />
                </div>
                <div>
                  <p className="mb-0.5 text-[10px] uppercase tracking-widest" style={{ color: C.green, fontFamily: "var(--font-mono)" }}>
                    5-Minute Setup
                  </p>
                  <h2 className="text-base font-black uppercase" style={{ color: C.text, fontFamily: "var(--font-display)" }}>
                    SDK Quick Start
                  </h2>
                </div>
              </div>

              <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                {sdkSteps.map((step, index) => {
                  const color = [C.green, C.cyan, C.purple][index] || C.green;
                  return (
                    <div key={step.id} className="rounded-xl border p-4" style={{ borderColor: `${color}20`, background: `${color}05` }}>
                      <div className="mb-2 text-3xl font-black opacity-20" style={{ color, fontFamily: "var(--font-display)" }}>
                        0{index + 1}
                      </div>
                      <p className="mb-1 text-xs font-bold" style={{ color }}>
                        {step.title}
                      </p>
                      <p className="text-[11px] leading-relaxed" style={{ color: C.dim, fontFamily: "var(--font-mono)" }}>
                        {step.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              <p className="mb-2 text-[11px]" style={{ color: C.dim, fontFamily: "var(--font-mono)" }}>
                Minimal HTML example:
              </p>
              <CodeSnippet code={getMinimalHtmlSnippet("https://your-backend.onrender.com")} />

              <div className="mt-4 flex flex-wrap gap-2">
                {platformLabels.map((platform) => (
                  <span
                    key={platform}
                    className="rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: C.cyan, borderColor: `${C.cyan}30`, background: `${C.cyan}10`, fontFamily: "var(--font-mono)" }}
                  >
                    {platform}
                  </span>
                ))}
                <span className="rounded-full border px-3 py-1 text-[10px] font-bold" style={{ color: C.dim, borderColor: C.border, fontFamily: "var(--font-mono)" }}>
                  Exact file path and paste location shown in SDK Setup
                </span>
              </div>
            </div>
          </motion.div>
        ) : null}

        {!search ? (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveSection(null)}
              className="rounded-xl border px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all"
              style={{
                borderColor: !activeSection ? `${C.cyan}50` : C.border,
                background: !activeSection ? `${C.cyan}15` : "transparent",
                color: !activeSection ? C.cyan : C.dim,
                fontFamily: "var(--font-mono)",
              }}
            >
              All Topics
            </button>
            {FAQS.map(({ section, icon: Icon, color }) => (
              <button
                key={section}
                onClick={() => setActiveSection(section === activeSection ? null : section)}
                className="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all"
                style={{
                  borderColor: activeSection === section ? `${color}50` : C.border,
                  background: activeSection === section ? `${color}15` : "transparent",
                  color: activeSection === section ? color : C.dim,
                  fontFamily: "var(--font-mono)",
                }}
              >
                <Icon className="h-3.5 w-3.5" />
                {section}
              </button>
            ))}
          </div>
        ) : null}

        {search ? (
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4" style={{ color: C.dim }} />
            <p className="text-sm" style={{ color: C.dim, fontFamily: "var(--font-mono)" }}>
              {filtered.reduce((count, section) => count + section.items.length, 0)} results for "{search}"
            </p>
          </div>
        ) : null}

        <div className="space-y-8">
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
              <HelpCircle className="mx-auto mb-4 h-12 w-12" style={{ color: C.dimmer }} />
              <p className="mb-2 text-sm font-bold" style={{ color: C.muted }}>
                No results found
              </p>
              <p className="text-xs" style={{ color: C.dim, fontFamily: "var(--font-mono)" }}>
                Try a different keyword or clear the search.
              </p>
            </motion.div>
          ) : (
            filtered.map(({ section, icon: Icon, color, items }) => (
              <motion.div key={section} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                    <Icon className="h-4 w-4" style={{ color }} />
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-wide" style={{ color, fontFamily: "var(--font-display)" }}>
                    {section}
                  </h2>
                  <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${color}30, transparent)` }} />
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ color, background: `${color}15`, fontFamily: "var(--font-mono)" }}>
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {items.map((item, index) => (
                    <FaqItem key={item.q} item={item} color={color} index={index} />
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 overflow-hidden rounded-2xl border"
          style={{ background: C.card, borderColor: C.border, boxShadow: "0 4px 24px #00000055" }}
        >
          <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${C.pink}, ${C.purple}, transparent)` }} />
          <div className="p-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: `${C.pink}15`, border: `1px solid ${C.pink}30` }}>
              <MessageSquare className="h-6 w-6" style={{ color: C.pink }} />
            </div>
            <h3 className="mb-2 text-lg font-black uppercase" style={{ color: C.text, fontFamily: "var(--font-display)" }}>
              Need more help?
            </h3>
            <p className="mx-auto mb-6 max-w-md text-sm" style={{ color: C.dim, fontFamily: "var(--font-mono)" }}>
              If you are stuck during SDK setup or dashboard access, contact the team directly.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all hover:opacity-90"
                style={{ background: C.pink, color: "#020408", fontFamily: "var(--font-mono)" }}
              >
                <Mail className="h-4 w-4" /> Email Support
              </a>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-2xl border px-6 py-3 text-sm font-bold uppercase tracking-wider"
                style={{ borderColor: C.border, color: C.muted, fontFamily: "var(--font-mono)" }}
              >
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 border-t pt-5" style={{ borderColor: C.border }}>
              {[
                "Response within 24h",
                "Exact SDK paste guidance",
                "Support for web and app stacks",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5" style={{ color: C.green }} />
                  <span className="text-[11px]" style={{ color: C.dim, fontFamily: "var(--font-mono)" }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HelpCenter;
