// src/pages/HelpCenter.jsx
// PulseIQ Help Center — Dark cyberpunk theme matching dashboard
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search, ChevronDown, ChevronUp, ArrowLeft,
  Zap, BookOpen, Code2, Shield, Users, BarChart3,
  Key, Globe, Mail, MessageSquare, ExternalLink,
  Terminal, FolderKanban, Building2, Bell, HelpCircle,
  CheckCircle2, Copy, Check
} from "lucide-react";
import Navbar from "../components/Navbar";

/* ── Design tokens ── */
const C = {
  bg:      "#020408",
  card:    "#060d18",
  border:  "#1a2a4a",
  green:   "#10d990",
  cyan:    "#00e5ff",
  purple:  "#a855f7",
  pink:    "#f43f8e",
  amber:   "#f59e0b",
  text:    "#e8f4ff",
  muted:   "#8ab4d4",
  dim:     "#3d6080",
  dimmer:  "#1a3a6b",
};

/* ── FAQ Data ── */
const FAQS = [
  {
    section: "Getting Started",
    icon: Zap,
    color: C.green,
    items: [
      {
        q: "What is PulseIQ?",
        a: "PulseIQ is an analytics platform that lets you track user behavior on your website or app in real-time. You create a project, get an API key, paste a small SDK snippet into your site, and instantly start seeing events, DAU, funnels, and more."
      },
      {
        q: "How do I create my first project?",
        a: "Sign up as an Organizer → Get verified by admin → Create a Workspace → Inside the workspace, create a Project → You'll receive your API key (shown only once). Copy it, then follow the SDK setup guide."
      },
      {
        q: "Why do I need to get verified?",
        a: "Verification ensures platform integrity. Only verified organizers can create workspaces and projects. Contact the admin or wait for approval — usually within 24 hours."
      },
      {
        q: "What roles are available?",
        a: "USER — basic member, can be invited to workspaces. ORGANIZER — creates workspaces, projects, tracks analytics. SUPER_ADMIN — full platform control, manages users and verifications."
      },
    ]
  },
  {
    section: "SDK Integration",
    icon: Code2,
    color: C.cyan,
    items: [
      {
        q: "How do I install the PulseIQ SDK?",
        a: "Go to Projects → Click 'SDK Setup' on your project card → Choose your platform (HTML, React, MERN, WordPress, or React Native) → Copy the pre-filled code snippet with your API key and Project ID already included → Paste into your website."
      },
      {
        q: "My API key was shown once and I missed it. What do I do?",
        a: "API keys are shown only once for security (similar to GitHub tokens). If you've lost it, you'll need to delete the project and create a new one. A new API key will be generated."
      },
      {
        q: "What is the ingest endpoint?",
        a: "All events are sent to POST /api/ingest/event with your API key in the x-api-key header. The SDK handles this automatically. If you're sending manually, include: projectId, eventName, and optionally userId and anonymousId."
      },
      {
        q: "Do I need to change the endpoint URL when I deploy?",
        a: "Yes. The endpoint is set via VITE_BACKEND_API_URL environment variable. Update this in your Netlify/Vercel/Render dashboard to point to your production backend URL. The SDK code will automatically use the correct URL."
      },
      {
        q: "Why does my domain get blocked?",
        a: "When you create a project you can specify allowed domains. If your domain is not in the list, events from it will be rejected (403). Either add your domain in the project settings or leave the list empty to allow all domains."
      },
    ]
  },
  {
    section: "Analytics",
    icon: BarChart3,
    color: C.purple,
    items: [
      {
        q: "Why is my Analytics tab locked?",
        a: "Analytics unlock only after your SDK is verified. Install the SDK on your website, refresh the page (which triggers a page_view event), then click 'Verify SDK' in the Analytics tab. Once one event is received, analytics unlock permanently."
      },
      {
        q: "What is the 7-day grace period?",
        a: "After creating a project, you have 7 days to verify your SDK. During this grace period you can skip verification and still access analytics. After 7 days, analytics lock until verification is complete."
      },
      {
        q: "What events can I track?",
        a: "Any custom event name you choose — page_view, button_click, purchase, signup, error, etc. Pass optional properties as an object. Built-in tracking includes page path, referrer, timestamp, user agent, and IP."
      },
      {
        q: "How do I identify users?",
        a: "Call PulseIQ.identify('user_id') after login. This associates all future events with that user ID. For anonymous users, the SDK auto-generates a stable anonymousId stored in localStorage."
      },
    ]
  },
  {
    section: "Workspaces & Teams",
    icon: Users,
    color: C.amber,
    items: [
      {
        q: "How do I invite a team member?",
        a: "Go to Workspaces → Click 'Add' on your workspace → Enter their email address → Choose their role (MEMBER, ADMIN, or VIEWER) → They'll receive an invite email and get added immediately."
      },
      {
        q: "What can each role do in a workspace?",
        a: "OWNER — full control including deletion. ADMIN — manage members and view all analytics. MEMBER — view analytics and contribute. VIEWER — can only see workspace info, no analytics access."
      },
      {
        q: "Can a USER role see workspace analytics?",
        a: "Yes — if an organizer invites them with MEMBER or ADMIN role. Go to Dashboard → Workspaces to see all workspaces you've been invited to. Click a project to view its analytics."
      },
    ]
  },
  {
    section: "Account & Security",
    icon: Shield,
    color: C.pink,
    items: [
      {
        q: "How do I reset my password?",
        a: "Click 'Forgot password?' on the login page → Enter your email → You'll receive a reset link + OTP via email. Use either method. The link/OTP expires in 10 minutes."
      },
      {
        q: "Is my API key stored securely?",
        a: "Yes. API keys are stored as bcrypt hashes in the database — not as plain text. The raw key is only shown once at creation. Even if the database is compromised, your key cannot be recovered from the hash."
      },
      {
        q: "Can I use Google login?",
        a: "Yes. Click 'Continue with Google' on the login or signup page. On mobile, you'll be redirected to Google's login page and brought back automatically. On desktop, a popup opens."
      },
      {
        q: "What happens when an admin removes my admin role?",
        a: "You'll receive an email notification explaining the reason (if provided). Your account remains active as a regular USER — you keep your login and data but lose admin panel access."
      },
    ]
  },
];

/* ── Quick Links ── */
const QUICK_LINKS = [
  { icon: Key,          label: "API Key Setup",         desc: "Get your key & integrate SDK",       color: C.amber,  to: "/organizer-dashboard/projects" },
  { icon: BarChart3,    label: "Analytics Dashboard",   desc: "View events, DAU & funnels",         color: C.purple, to: "/organizer-dashboard/analytics" },
  { icon: Building2,    label: "Manage Workspaces",     desc: "Create & invite team members",       color: C.green,  to: "/organizer-dashboard/workspaces" },
  { icon: FolderKanban, label: "Projects",              desc: "Create projects & get API keys",     color: C.cyan,   to: "/organizer-dashboard/projects" },
  { icon: Bell,         label: "Notifications",         desc: "Platform updates & invites",         color: C.pink,   to: "/dashboard/notifications" },
  { icon: Shield,       label: "Admin Panel",           desc: "Manage users & verifications",       color: C.pink,   to: "/admin-dashboard" },
];

/* ── Code Snippet ── */
const CodeSnippet = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code).catch(() => {
      const el = document.createElement("textarea");
      el.value = code; el.style.cssText = "position:fixed;top:-9999px;opacity:0";
      document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el);
    });
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative rounded-xl bg-[#020810] border border-[#1a2a4a] overflow-hidden my-3">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1a2a4a]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#f43f8e44]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b44]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#10d99044]" />
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCopy}
          className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-lg transition-all"
          style={{ color: copied ? C.green : C.dim, background: copied ? `${C.green}15` : "transparent", fontFamily: "var(--font-mono)" }}>
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied!" : "Copy"}
        </motion.button>
      </div>
      <pre className="p-4 text-[11px] overflow-x-auto leading-relaxed"
        style={{ fontFamily: "var(--font-mono)", color: C.cyan }}>{code}</pre>
    </div>
  );
};

/* ── FAQ Item ── */
const FaqItem = ({ item, color, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-2xl border overflow-hidden transition-all"
      style={{ borderColor: open ? `${color}30` : C.border, background: open ? `${color}05` : C.card }}>
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        onClick={() => setOpen(o => !o)}>
        <span className="text-sm font-bold text-[#e8f4ff] pr-4">{item.q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: open ? color : C.dim }} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden">
            <div className="px-5 pb-5 border-t" style={{ borderColor: `${color}20` }}>
              <p className="text-sm leading-relaxed pt-4" style={{ color: C.muted, fontFamily: "var(--font-mono)" }}>
                {item.a}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ── Main HelpCenter ── */
const HelpCenter = () => {
  const [search, setSearch]           = useState("");
  const [activeSection, setActiveSection] = useState(null);

  // Filter FAQs by search
  const filtered = search.trim()
    ? FAQS.map(s => ({
        ...s,
        items: s.items.filter(i =>
          i.q.toLowerCase().includes(search.toLowerCase()) ||
          i.a.toLowerCase().includes(search.toLowerCase())
        )
      })).filter(s => s.items.length > 0)
    : activeSection
      ? FAQS.filter(s => s.section === activeSection)
      : FAQS;

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <Navbar />

      {/* ── Hero ── */}
      <div className="relative overflow-hidden pt-24 pb-16 px-4">
        {/* BG effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-10"
            style={{ background: `radial-gradient(ellipse, ${C.cyan} 0%, transparent 70%)` }} />
          <div className="absolute top-20 left-1/4 w-[200px] h-[200px] rounded-full opacity-5"
            style={{ background: `radial-gradient(ellipse, ${C.green} 0%, transparent 70%)` }} />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: `linear-gradient(${C.cyan} 1px, transparent 1px), linear-gradient(90deg, ${C.cyan} 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#10d99030] bg-[#10d99010] mb-6">
              <HelpCircle className="w-3.5 h-3.5 text-[#10d990]" />
              <span className="text-[11px] text-[#10d990] uppercase tracking-[0.2em] font-bold"
                style={{ fontFamily: "var(--font-mono)" }}>Help Center</span>
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl font-black text-[#e8f4ff] uppercase mb-4 leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            How can we<br />
            <span style={{ background: `linear-gradient(135deg, ${C.green}, ${C.cyan})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              help you?
            </span>
          </motion.h1>

          <motion.p className="text-sm mb-8" style={{ color: C.dim, fontFamily: "var(--font-mono)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            Search our knowledge base or browse by category below
          </motion.p>

          {/* Search bar */}
          <motion.div className="relative max-w-xl mx-auto"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.dim }} />
            <input
              className="w-full rounded-2xl pl-11 pr-4 py-4 text-sm outline-none transition-all"
              style={{
                background: C.card,
                border: `1px solid ${search ? C.cyan + "50" : C.border}`,
                color: C.text,
                fontFamily: "var(--font-mono)",
                boxShadow: search ? `0 0 0 3px ${C.cyan}10` : "none",
              }}
              placeholder="Search questions... e.g. API key, verify SDK, workspace"
              value={search}
              onChange={e => { setSearch(e.target.value); setActiveSection(null); }}
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3d6080] hover:text-[#e8f4ff] transition-colors text-lg leading-none">
                ×
              </button>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20">

        {/* ── Quick Links ── */}
        {!search && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="mb-12">
            <p className="text-[10px] uppercase tracking-[0.3em] mb-4" style={{ color: C.dim, fontFamily: "var(--font-mono)" }}>
              Quick Navigation
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {QUICK_LINKS.map(({ icon: Icon, label, desc, color, to }) => (
                <Link key={label} to={to}>
                  <motion.div whileHover={{ y: -4, borderColor: `${color}40` }}
                    className="p-4 rounded-2xl border text-center transition-all group cursor-pointer"
                    style={{ background: C.card, borderColor: C.border, boxShadow: "0 4px 20px #00000044" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 transition-all group-hover:scale-110"
                      style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                      <Icon className="w-4.5 h-4.5" style={{ color }} />
                    </div>
                    <p className="text-[11px] font-bold mb-1" style={{ color: C.text }}>{label}</p>
                    <p className="text-[10px]" style={{ color: C.dim, fontFamily: "var(--font-mono)" }}>{desc}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── SDK Quick Start ── */}
        {!search && !activeSection && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="rounded-2xl border overflow-hidden mb-12"
            style={{ background: C.card, borderColor: C.border, boxShadow: "0 4px 24px #00000055" }}>
            <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${C.green}, ${C.cyan}, ${C.purple})` }} />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${C.green}15`, border: `1px solid ${C.green}30` }}>
                  <Terminal className="w-5 h-5" style={{ color: C.green }} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: C.green, fontFamily: "var(--font-mono)" }}>5-Minute Setup</p>
                  <h2 className="text-base font-black uppercase" style={{ color: C.text, fontFamily: "var(--font-display)" }}>SDK Quick Start</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                {[
                  { n: "01", title: "Create Project",    desc: "Organizer dashboard → Projects → New Project → Copy API key", color: C.green  },
                  { n: "02", title: "Paste SDK Code",    desc: "Choose your platform and paste the pre-filled snippet",        color: C.cyan   },
                  { n: "03", title: "Verify & Unlock",   desc: "Refresh your site → click Verify in Analytics tab",            color: C.purple },
                ].map(({ n, title, desc, color }) => (
                  <div key={n} className="p-4 rounded-xl border" style={{ borderColor: `${color}20`, background: `${color}05` }}>
                    <div className="text-3xl font-black mb-2 opacity-20" style={{ color, fontFamily: "var(--font-display)" }}>{n}</div>
                    <p className="text-xs font-bold mb-1" style={{ color }}>{title}</p>
                    <p className="text-[11px] leading-relaxed" style={{ color: C.dim, fontFamily: "var(--font-mono)" }}>{desc}</p>
                  </div>
                ))}
              </div>

              <p className="text-[11px] mb-2" style={{ color: C.dim, fontFamily: "var(--font-mono)" }}>Minimal HTML snippet (your credentials pre-filled in the SDK Setup page):</p>
              <CodeSnippet code={`<!-- Paste before </body> -->
<script>
(function() {
  var PulseIQ = {
    apiKey:    "YOUR_API_KEY",     // ← from Projects page
    projectId: "YOUR_PROJECT_ID", // ← from Projects page
    endpoint:  "https://your-backend.onrender.com/api/ingest/event",
    track: function(name, props) {
      fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": this.apiKey },
        body: JSON.stringify({ projectId: this.projectId, eventName: name,
          anonymousId: localStorage.getItem("_piq_anon") || "anon_" + Math.random().toString(36).slice(2),
          properties: Object.assign({ page: location.pathname }, props || {}) })
      }).catch(function(){});
    }
  };
  window.PulseIQ = PulseIQ;
  PulseIQ.track("page_view");
})();
</script>`} />

              <div className="flex flex-wrap gap-2 mt-4">
                {["HTML/JS", "React/Vite", "MERN/Node", "WordPress", "React Native"].map(p => (
                  <span key={p} className="text-[10px] px-3 py-1 rounded-full border font-bold uppercase tracking-wider"
                    style={{ color: C.cyan, borderColor: `${C.cyan}30`, background: `${C.cyan}10`, fontFamily: "var(--font-mono)" }}>
                    {p}
                  </span>
                ))}
                <span className="text-[10px] px-3 py-1 rounded-full border font-bold"
                  style={{ color: C.dim, borderColor: C.border, fontFamily: "var(--font-mono)" }}>
                  All platforms supported via SDK Setup Guide
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Category filters ── */}
        {!search && (
          <div className="flex gap-2 flex-wrap mb-6">
            <button
              onClick={() => setActiveSection(null)}
              className="px-4 py-2 rounded-xl text-[11px] uppercase tracking-wider font-bold border transition-all"
              style={{
                borderColor: !activeSection ? `${C.cyan}50` : C.border,
                background:  !activeSection ? `${C.cyan}15` : "transparent",
                color:       !activeSection ? C.cyan : C.dim,
                fontFamily:  "var(--font-mono)"
              }}>
              All Topics
            </button>
            {FAQS.map(({ section, icon: Icon, color }) => (
              <button key={section}
                onClick={() => setActiveSection(section === activeSection ? null : section)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] uppercase tracking-wider font-bold border transition-all"
                style={{
                  borderColor: activeSection === section ? `${color}50` : C.border,
                  background:  activeSection === section ? `${color}15` : "transparent",
                  color:       activeSection === section ? color : C.dim,
                  fontFamily:  "var(--font-mono)"
                }}>
                <Icon className="w-3.5 h-3.5" />
                {section}
              </button>
            ))}
          </div>
        )}

        {/* Search results info */}
        {search && (
          <div className="mb-4 flex items-center gap-2">
            <Search className="w-4 h-4" style={{ color: C.dim }} />
            <p className="text-sm" style={{ color: C.dim, fontFamily: "var(--font-mono)" }}>
              {filtered.reduce((a, s) => a + s.items.length, 0)} results for "{search}"
            </p>
          </div>
        )}

        {/* ── FAQ Sections ── */}
        <div className="space-y-8">
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-16">
              <HelpCircle className="w-12 h-12 mx-auto mb-4" style={{ color: C.dimmer }} />
              <p className="text-sm font-bold mb-2" style={{ color: C.muted }}>No results found</p>
              <p className="text-xs" style={{ color: C.dim, fontFamily: "var(--font-mono)" }}>
                Try different keywords or{" "}
                <button onClick={() => setSearch("")} className="underline" style={{ color: C.cyan }}>
                  browse all topics
                </button>
              </p>
            </motion.div>
          ) : (
            filtered.map(({ section, icon: Icon, color, items }) => (
              <motion.div key={section}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                {/* Section header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-wide" style={{ color, fontFamily: "var(--font-display)" }}>
                    {section}
                  </h2>
                  <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${color}30, transparent)` }} />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ color, background: `${color}15`, fontFamily: "var(--font-mono)" }}>
                    {items.length}
                  </span>
                </div>

                {/* FAQ items */}
                <div className="space-y-2.5">
                  {items.map((item, i) => (
                    <FaqItem key={i} item={item} color={color} index={i} />
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* ── Contact Support ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="mt-16 rounded-2xl border overflow-hidden"
          style={{ background: C.card, borderColor: C.border, boxShadow: "0 4px 24px #00000055" }}>
          <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${C.pink}, ${C.purple}, transparent)` }} />
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: `${C.pink}15`, border: `1px solid ${C.pink}30` }}>
              <MessageSquare className="w-6 h-6" style={{ color: C.pink }} />
            </div>
            <h3 className="text-lg font-black uppercase mb-2" style={{ color: C.text, fontFamily: "var(--font-display)" }}>
              Still need help?
            </h3>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: C.dim, fontFamily: "var(--font-mono)" }}>
              Can't find what you're looking for? Reach out to our support team directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="mailto:arpanjain00123@gmail.com"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all hover:opacity-90"
                style={{ background: C.pink, color: "#020408", fontFamily: "var(--font-mono)" }}>
                <Mail className="w-4 h-4" /> Email Support
              </a>
              <Link to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider border transition-all hover:border-[#00e5ff50]"
                style={{ borderColor: C.border, color: C.muted, fontFamily: "var(--font-mono)" }}>
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Link>
            </div>
            <div className="mt-6 pt-5 border-t flex items-center justify-center gap-6 flex-wrap"
              style={{ borderColor: C.border }}>
              {[
                { icon: CheckCircle2, text: "Response within 24h",   color: C.green  },
                { icon: Shield,       text: "Secure & confidential",  color: C.cyan   },
                { icon: Globe,        text: "Available worldwide",    color: C.purple },
              ].map(({ icon: Icon, text, color }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                  <span className="text-[11px]" style={{ color: C.dim, fontFamily: "var(--font-mono)" }}>{text}</span>
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