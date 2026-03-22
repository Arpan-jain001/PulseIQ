// src/organizer/pages/OrgProjects.jsx
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderKanban, Plus, X, RefreshCw, Copy, Eye, EyeOff,
  Key, Trash2, Check, Pencil, ChevronDown, ChevronUp,
  Terminal, Code2, Globe, Download, AlertTriangle, FileCode2
} from "lucide-react";
import OrgLayout from "../components/OrgLayout";
import ApiKeySetupModal from "../components/ApiKeySetupModal";
import SdkSetupDrawer from "../components/SdkSetupDrawer";
import { useOrgApi } from "../hooks/useOrgApi";
import { useAuth } from "../../hooks/useAuth";

const BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

/* ── Toast ─────────────────────────────────────────── */
const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <motion.div className="fixed top-20 right-6 z-[10000] px-4 py-3 rounded-xl border text-xs font-bold uppercase tracking-widest"
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      style={{ fontFamily: "var(--font-mono)", background: toast.type === "success" ? "#10d99015" : "#f43f8e15", borderColor: toast.type === "success" ? "#10d99030" : "#f43f8e30", color: toast.type === "success" ? "#10d990" : "#f43f8e" }}>
      {toast.type === "success" ? "✅" : "❌"} {toast.msg}
    </motion.div>
  );
};

/* ── Copy Button ────────────────────────────────────── */
const CopyBtn = ({ text, label = "Copy" }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e?.stopPropagation();
    const doCopy = () => {
      const el = document.createElement("textarea");
      el.value = text; el.style.cssText = "position:fixed;top:-9999px;opacity:0";
      document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    };
    try { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(doCopy); } catch { doCopy(); }
  };
  return (
    <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCopy}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all flex-shrink-0"
      style={{ color: copied ? "#10d990" : "#3d6080", borderColor: copied ? "#10d99030" : "#1a2a4a", background: copied ? "#10d99015" : "transparent", fontFamily: "var(--font-mono)" }}>
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      <span className="text-[9px] uppercase tracking-wider">{copied ? "Copied!" : label}</span>
    </motion.button>
  );
};

/* ── API Key Display + Setup Guide ─────────────────── */
const ApiKeyDisplay = ({ apiKey, projectId, projectName, onClose }) => {
  const [show, setShow]     = useState(true); // show by default since one-time
  const [activeTab, setActiveTab] = useState("html");
  const [copied, setCopied] = useState(false);

  // Download .env file
  const downloadEnv = () => {
    const content = `# PulseIQ Configuration
# Project: ${projectName}
# Generated: ${new Date().toLocaleString()}
# ⚠️ Keep this file secret — do NOT commit to git

VITE_PULSEIQ_API_KEY=${apiKey}
VITE_PULSEIQ_PROJECT_ID=${projectId}
VITE_PULSEIQ_ENDPOINT=${BASE_URL}/api/ingest
`;
    const blob = new Blob([content], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `.env.pulseiq`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download setup file
  const downloadSetup = (type) => {
    const filename = type === "html" ? "pulseiq.js" : "pulseiq.js";
    const content  = type === "html" ? htmlSnippet : reactSnippet;
    const blob = new Blob([content], { type: "text/javascript" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyAll = (e) => {
    e?.stopPropagation();
    const doCopy = () => {
      const el = document.createElement("textarea");
      el.value = apiKey; el.style.cssText = "position:fixed;top:-9999px;opacity:0";
      document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    };
    try { navigator.clipboard.writeText(apiKey).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(doCopy); } catch { doCopy(); }
  };

  const htmlSnippet = `/* =========================================
   PulseIQ Analytics — Vanilla JS Setup
   Project: ${projectName}
   ========================================= */

const PULSEIQ = {
  apiKey:    "${apiKey}",
  projectId: "${projectId}",
  endpoint:  "${BASE_URL}/api/ingest",

  // Get or create anonymous ID
  getAnonId() {
    let id = localStorage.getItem("_piq_anon");
    if (!id) {
      id = "anon_" + crypto.randomUUID?.() || Math.random().toString(36).slice(2);
      localStorage.setItem("_piq_anon", id);
    }
    return id;
  },

  // Track any event
  track(eventName, properties = {}) {
    fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify({
        projectId:   this.projectId,
        eventName,
        userId:      localStorage.getItem("_piq_user") || null,
        anonymousId: this.getAnonId(),
        properties:  {
          ...properties,
          page:      window.location.pathname,
          referrer:  document.referrer,
          timestamp: new Date().toISOString(),
        },
      }),
    }).catch(() => {}); // silent fail — never break your app
  },

  // Call after user logs in
  identify(userId) {
    localStorage.setItem("_piq_user", userId);
    this.track("identify", { userId });
  },
};

// Auto-track page views
PULSEIQ.track("page_view");

/* ── Usage Examples ──────────────────────────
PULSEIQ.track("button_click", { id: "signup_cta" });
PULSEIQ.track("purchase",     { amount: 499, plan: "pro" });
PULSEIQ.track("form_submit",  { form: "contact" });
PULSEIQ.identify("user_123"); // after login
─────────────────────────────────────────── */`;

  const reactSnippet = `/* =========================================
   PulseIQ Analytics — React / Next.js Setup
   Project: ${projectName}
   ========================================= */

// 1️⃣  Save this as: src/lib/pulseiq.js
//     Add to .env: VITE_PULSEIQ_API_KEY=${apiKey}
//                  VITE_PULSEIQ_PROJECT_ID=${projectId}

const CONFIG = {
  apiKey:    import.meta.env.VITE_PULSEIQ_API_KEY    || "${apiKey}",
  projectId: import.meta.env.VITE_PULSEIQ_PROJECT_ID || "${projectId}",
  endpoint:  import.meta.env.VITE_PULSEIQ_ENDPOINT   || "${BASE_URL}/api/ingest",
};

function getAnonId() {
  let id = localStorage.getItem("_piq_anon");
  if (!id) {
    id = "anon_" + Math.random().toString(36).slice(2, 11);
    localStorage.setItem("_piq_anon", id);
  }
  return id;
}

export function track(eventName, properties = {}) {
  fetch(CONFIG.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": CONFIG.apiKey,
    },
    body: JSON.stringify({
      projectId:   CONFIG.projectId,
      eventName,
      userId:      localStorage.getItem("_piq_user") || null,
      anonymousId: getAnonId(),
      properties:  {
        ...properties,
        page: window.location.pathname,
      },
    }),
  }).catch(() => {});
}

export function identify(userId) {
  localStorage.setItem("_piq_user", String(userId));
  track("identify", { userId });
}

/* ─────────────────────────────────────────────
   2️⃣  Use anywhere in your React app:

   import { track, identify } from "../lib/pulseiq";

   // In useEffect for page views:
   useEffect(() => { track("page_view"); }, []);

   // On button click:
   <button onClick={() => track("signup_click", { plan: "pro" })}>
     Sign Up
   </button>

   // After login:
   identify(user.id);
   track("login", { method: "google" });

   // In React Router for SPA navigation:
   const location = useLocation();
   useEffect(() => { track("page_view", { path: location.pathname }); }, [location]);
───────────────────────────────────────────── */`;

  const TABS = [
    { id: "html",  label: "HTML / Vanilla JS", icon: Globe },
    { id: "react", label: "React / Next.js",   icon: FileCode2 },
  ];

  return (
    <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />
      <motion.div className="relative w-full max-w-2xl rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg,#0a0f1a 0%,#060d18 100%)", border: "1px solid #f59e0b33", boxShadow: "0 0 80px #f59e0b08, 0 20px 80px #00000099", maxHeight: "92vh", overflowY: "auto" }}
        initial={{ scale: 0.92, y: 24 }} animate={{ scale: 1, y: 0 }}>

        {/* Rainbow top bar */}
        <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg,#f59e0b,#f43f8e,#a855f7,#00e5ff,#10d990)" }} />

        <div className="p-6">

          {/* Header */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-[#f59e0b15] border border-[#f59e0b30] flex items-center justify-center flex-shrink-0">
              <Key className="w-6 h-6 text-[#f59e0b]" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-black text-[#e8f4ff] uppercase mb-1" style={{ fontFamily: "var(--font-display)" }}>
                API Key Generated — {projectName}
              </h3>
              <div className="flex items-center gap-2 p-2 rounded-xl border border-[#f43f8e30] bg-[#f43f8e08]">
                <AlertTriangle className="w-3.5 h-3.5 text-[#f43f8e] flex-shrink-0" />
                <p className="text-[10px] text-[#f43f8e]" style={{ fontFamily: "var(--font-mono)" }}>
                  This key is shown ONLY ONCE. Copy it now or download the .env file.
                </p>
              </div>
            </div>
          </div>

          {/* API Key box */}
          <div className="p-4 rounded-2xl bg-[#04080f] border border-[#f59e0b22] mb-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-[10px] text-[#f59e0b] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                API Key
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setShow(s => !s)} className="w-7 h-7 rounded-lg border border-[#1a2a4a] flex items-center justify-center text-[#3d6080] hover:text-[#8ab4d4] transition-colors">
                  {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <CopyBtn text={apiKey} label="Copy Key" />
              </div>
            </div>
            <code className="block text-[12px] break-all select-all leading-relaxed"
              style={{ color: show ? "#10d990" : "#3d6080", fontFamily: "var(--font-mono)" }}>
              {show ? apiKey : "•".repeat(apiKey.length)}
            </code>

            {/* Credentials grid */}
            <div className="grid grid-cols-1 gap-2 mt-4 pt-4 border-t border-[#1a2a4a]">
              {[
                { label: "Project ID",   value: projectId },
                { label: "Endpoint",     value: `${BASE_URL}/api/ingest` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#060d18] border border-[#1a2a4a]">
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] text-[#3d6080] uppercase tracking-widest mb-0.5" style={{ fontFamily: "var(--font-mono)" }}>{label}</p>
                    <code className="text-[10px] text-[#8ab4d4] truncate block" style={{ fontFamily: "var(--font-mono)" }}>{value}</code>
                  </div>
                  <CopyBtn text={value} />
                </div>
              ))}
            </div>
          </div>

          {/* Download buttons */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={downloadEnv}
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[#10d99030] bg-[#10d99010] text-[#10d990] font-bold text-[11px] uppercase tracking-widest transition-all hover:bg-[#10d99018]"
              style={{ fontFamily: "var(--font-mono)" }}>
              <Download className="w-3.5 h-3.5" /> Download .env
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => downloadSetup(activeTab)}
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[#00e5ff30] bg-[#00e5ff10] text-[#00e5ff] font-bold text-[11px] uppercase tracking-widest transition-all hover:bg-[#00e5ff18]"
              style={{ fontFamily: "var(--font-mono)" }}>
              <Download className="w-3.5 h-3.5" /> Download pulseiq.js
            </motion.button>
          </div>

          {/* Setup Guide Tabs */}
          <div className="mb-4">
            <p className="text-[10px] text-[#3d6080] uppercase tracking-widest mb-3" style={{ fontFamily: "var(--font-mono)" }}>
              Setup Guide — choose your stack:
            </p>
            <div className="flex gap-2 mb-3">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] uppercase tracking-wider font-bold border transition-all"
                  style={{ borderColor: activeTab === id ? "#00e5ff50" : "#1a2a4a", background: activeTab === id ? "#00e5ff15" : "transparent", color: activeTab === id ? "#00e5ff" : "#3d6080", fontFamily: "var(--font-mono)" }}>
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>

            {/* Code block */}
            <div className="relative rounded-xl bg-[#04080f] border border-[#1a2a4a] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1a2a4a]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#f43f8e]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#10d990]" />
                  </div>
                  <span className="text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                    {activeTab === "html" ? "pulseiq.js" : "src/lib/pulseiq.js"}
                  </span>
                </div>
                <CopyBtn text={activeTab === "html" ? htmlSnippet : reactSnippet} label="Copy Code" />
              </div>
              <pre className="p-4 text-[10px] text-[#8ab4d4] overflow-x-auto leading-relaxed max-h-56"
                style={{ fontFamily: "var(--font-mono)" }}>
                {activeTab === "html" ? htmlSnippet : reactSnippet}
              </pre>
            </div>
          </div>

          {/* Quick steps */}
          <div className="space-y-2 mb-5">
            {(activeTab === "html" ? [
              "Copy the code above or download pulseiq.js",
              "Add <script src='pulseiq.js'></script> before </body>",
              "PULSEIQ.track('page_view') is called automatically",
              "Use PULSEIQ.track('event_name', { props }) anywhere",
            ] : [
              "Download .env file → add to your project root",
              "Save pulseiq.js as src/lib/pulseiq.js",
              "import { track } from '../lib/pulseiq' in your components",
              "Call track('page_view') in useEffect on app start",
            ]).map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-[#020408] flex-shrink-0 mt-0.5"
                  style={{ background: ["#f59e0b","#00e5ff","#a855f7","#10d990"][i], fontFamily: "var(--font-display)" }}>
                  {i + 1}
                </span>
                <p className="text-[11px] text-[#8ab4d4] leading-relaxed" style={{ fontFamily: "var(--font-mono)" }}>{step}</p>
              </div>
            ))}
          </div>

          {/* Confirm button */}
          <motion.button whileHover={{ scale: 1.02, boxShadow: "0 0 20px #10d99033" }} whileTap={{ scale: 0.98 }} onClick={onClose}
            className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest text-[#020408]"
            style={{ background: "linear-gradient(135deg,#10d990,#00e5ff)", fontFamily: "var(--font-display)" }}>
            ✅ I've Saved My API Key — Continue
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Create Modal ───────────────────────────────────── */
const CreateProjectModal = ({ workspaces, onClose, onCreate }) => {
  const [form, setForm] = useState({ workspaceId: workspaces[0]?._id || "", name: "", domains: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleCreate = async () => {
    if (!form.workspaceId || !form.name.trim()) { setErr("Workspace and project name required."); return; }
    setSaving(true);
    try {
      const domains = form.domains ? form.domains.split(",").map(d => d.trim()).filter(Boolean) : [];
      await onCreate(form.workspaceId, form.name.trim(), domains);
      onClose();
    } catch (e) { setErr(e.message || "Failed to create."); }
    finally { setSaving(false); }
  };

  return (
    <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative w-full max-w-md rounded-2xl overflow-hidden"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        style={{ background: "linear-gradient(135deg,#0d1117,#161b22)", border: "1px solid #00e5ff22", boxShadow: "0 0 60px #00e5ff08, 0 20px 60px #00000099" }}>
        <div className="h-[2px] bg-gradient-to-r from-[#00e5ff] via-[#10d990] to-transparent" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>New Project</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-xl border border-[#1a2a4a] flex items-center justify-center text-[#3d6080] hover:text-[#8ab4d4]"><X className="w-4 h-4" /></button>
          </div>
          {err && <div className="mb-4 px-3 py-2.5 rounded-xl border border-[#f43f8e30] bg-[#f43f8e08] text-[11px] text-[#f43f8e]" style={{ fontFamily: "var(--font-mono)" }}>❌ {err}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>Workspace</label>
              <select className="w-full bg-[#04080f] border border-[#1a2a4a] rounded-xl px-4 py-3 text-[#e8f4ff] focus:outline-none focus:border-[#00e5ff44] text-sm"
                style={{ fontFamily: "var(--font-mono)" }} value={form.workspaceId}
                onChange={e => setForm(f => ({ ...f, workspaceId: e.target.value }))}>
                {workspaces.map(ws => <option key={ws._id} value={ws._id} style={{ background: "#0d1117" }}>{ws.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>Project Name</label>
              <input className="w-full bg-[#04080f] border border-[#1a2a4a] rounded-xl px-4 py-3 text-[#e8f4ff] placeholder:text-[#1a3a6b] focus:outline-none focus:border-[#00e5ff44] text-sm"
                style={{ fontFamily: "var(--font-mono)" }} placeholder="My Web App" value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErr(""); }} autoFocus />
            </div>
            <div>
              <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                Allowed Domains <span className="font-normal text-[#1a3a6b]">(optional, comma separated)</span>
              </label>
              <input className="w-full bg-[#04080f] border border-[#1a2a4a] rounded-xl px-4 py-3 text-[#e8f4ff] placeholder:text-[#1a3a6b] focus:outline-none focus:border-[#00e5ff44] text-sm"
                style={{ fontFamily: "var(--font-mono)" }} placeholder="example.com, app.example.com"
                value={form.domains} onChange={e => setForm(f => ({ ...f, domains: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#1a2a4a] text-[#8ab4d4] text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>Cancel</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCreate} disabled={saving}
              className="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest text-[#020408] disabled:opacity-50"
              style={{ background: "#00e5ff", fontFamily: "var(--font-mono)" }}>
              {saving ? "Creating..." : "Create Project"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Edit Modal ─────────────────────────────────────── */
const EditProjectModal = ({ project, onClose, onSave }) => {
  const [name, setName]       = useState(project.name);
  const [domains, setDomains] = useState(project.allowedDomains?.join(", ") || "");
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState("");

  const handleSave = async () => {
    if (!name.trim()) { setErr("Project name required."); return; }
    setSaving(true);
    try {
      const allowedDomains = domains ? domains.split(",").map(d => d.trim()).filter(Boolean) : [];
      await onSave(project._id, { name: name.trim(), allowedDomains });
      onClose();
    } catch (e) { setErr(e.message || "Failed to update."); }
    finally { setSaving(false); }
  };

  return (
    <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative w-full max-w-md rounded-2xl overflow-hidden"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        style={{ background: "linear-gradient(135deg,#0d1117,#161b22)", border: "1px solid #a855f722", boxShadow: "0 0 60px #a855f708, 0 20px 60px #00000099" }}>
        <div className="h-[2px] bg-gradient-to-r from-[#a855f7] via-[#00e5ff] to-transparent" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>Edit Project</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-xl border border-[#1a2a4a] flex items-center justify-center text-[#3d6080] hover:text-[#8ab4d4]"><X className="w-4 h-4" /></button>
          </div>
          {err && <div className="mb-4 px-3 py-2.5 rounded-xl border border-[#f43f8e30] bg-[#f43f8e08] text-[11px] text-[#f43f8e]" style={{ fontFamily: "var(--font-mono)" }}>❌ {err}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>Project Name</label>
              <input className="w-full bg-[#04080f] border border-[#1a2a4a] rounded-xl px-4 py-3 text-[#e8f4ff] placeholder:text-[#1a3a6b] focus:outline-none focus:border-[#a855f744] text-sm"
                style={{ fontFamily: "var(--font-mono)" }} value={name}
                onChange={e => { setName(e.target.value); setErr(""); }} autoFocus />
            </div>
            <div>
              <label className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                Allowed Domains <span className="font-normal text-[#1a3a6b]">(comma separated)</span>
              </label>
              <input className="w-full bg-[#04080f] border border-[#1a2a4a] rounded-xl px-4 py-3 text-[#e8f4ff] placeholder:text-[#1a3a6b] focus:outline-none focus:border-[#a855f744] text-sm"
                style={{ fontFamily: "var(--font-mono)" }} placeholder="example.com, app.example.com"
                value={domains} onChange={e => setDomains(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#1a2a4a] text-[#8ab4d4] text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>Cancel</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest text-[#020408] disabled:opacity-50"
              style={{ background: "#a855f7", fontFamily: "var(--font-mono)" }}>
              {saving ? "Saving..." : "Save Changes"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Inline Integration Guide ───────────────────────── */
const IntegrationGuide = ({ project }) => {
  const [open, setOpen]         = useState(false);
  const [activeTab, setActiveTab] = useState("html");

  const htmlSnippet = `PULSEIQ.track("page_view");
PULSEIQ.track("button_click", { id: "cta" });
PULSEIQ.identify("user_123"); // after login`;

  const reactSnippet = `import { track, identify } from "../lib/pulseiq";

useEffect(() => { track("page_view"); }, []);
<button onClick={() => track("signup_click")}>Sign Up</button>
identify(user.id); // after login`;

  return (
    <div className="mt-3 rounded-xl border border-[#1a2a4a] overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#ffffff04] transition-colors">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#00e5ff]" />
          <span className="text-[10px] text-[#8ab4d4] uppercase tracking-wider font-bold" style={{ fontFamily: "var(--font-mono)" }}>
            Integration Guide
          </span>
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-[#3d6080]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#3d6080]" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[#1a2a4a]">
            <div className="p-3 space-y-3">
              {/* Tabs */}
              <div className="flex gap-2">
                {[{ id: "html", label: "HTML" }, { id: "react", label: "React" }].map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    className="px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold border transition-all"
                    style={{ borderColor: activeTab === t.id ? "#00e5ff50" : "#1a2a4a", background: activeTab === t.id ? "#00e5ff15" : "transparent", color: activeTab === t.id ? "#00e5ff" : "#3d6080", fontFamily: "var(--font-mono)" }}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Project credentials */}
              {[
                { label: "Project ID", value: project._id },
                { label: "Endpoint",   value: `${BASE_URL}/api/ingest` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between p-2.5 bg-[#04080f] rounded-xl border border-[#1a2a4a]">
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] text-[#3d6080] uppercase tracking-widest mb-0.5" style={{ fontFamily: "var(--font-mono)" }}>{label}</p>
                    <code className="text-[10px] text-[#10d990] truncate block" style={{ fontFamily: "var(--font-mono)" }}>{value}</code>
                  </div>
                  <CopyBtn text={value} />
                </div>
              ))}

              {/* Code snippet */}
              <div className="bg-[#04080f] rounded-xl border border-[#1a2a4a] overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a2a4a]">
                  <span className="text-[9px] text-[#3d6080] uppercase tracking-wider" style={{ fontFamily: "var(--font-mono)" }}>
                    {activeTab === "html" ? "Usage" : "React Usage"}
                  </span>
                  <CopyBtn text={activeTab === "html" ? htmlSnippet : reactSnippet} />
                </div>
                <pre className="p-3 text-[10px] text-[#a855f7] overflow-x-auto leading-relaxed" style={{ fontFamily: "var(--font-mono)" }}>
                  {activeTab === "html" ? htmlSnippet : reactSnippet}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Main OrgProjects ───────────────────────────────── */
const OrgProjects = () => {
  const { getMyWorkspaces, getProjects, createProject, deleteProject, updateProject, verifySdk, loading } = useOrgApi();
  const { user } = useAuth();
  const [projects, setProjects]       = useState([]);
  const [workspaces, setWorkspaces]   = useState([]);
  const [showCreate, setShowCreate]   = useState(false);
  const [editModal, setEditModal]     = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [sdkDrawer, setSdkDrawer]     = useState(null); // project object
  const [apiKeyData, setApiKeyData]   = useState(null); // { apiKey, projectId, projectName }
  const [toast, setToast]             = useState(null);

  const isVerified = user?.verificationStatus === "VERIFIED";
  const showToast  = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    try {
      const [proj, ws] = await Promise.all([getProjects(), getMyWorkspaces()]);
      setProjects(proj?.data || []);
      setWorkspaces(ws?.data || []);
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (workspaceId, name, domains) => {
    const res = await createProject(workspaceId, name, domains);
    if (res?.data?.apiKey) {
      setApiKeyData({ apiKey: res.data.apiKey, projectId: res.data.project?._id, projectName: name });
    }
    showToast("success", "Project created!");
    load();
  };

  const handleDelete = async (id) => {
    try {
      await deleteProject(id);
      showToast("success", "Project deleted.");
      setDeleteModal(null);
      load();
    } catch (e) { showToast("error", e.message || "Delete failed."); }
  };

  const handleEdit = async (id, data) => {
    try {
      await updateProject(id, data);
      showToast("success", "Project updated!");
      setEditModal(null);
      load();
    } catch (e) { showToast("error", e.message || "Update failed."); }
  };

  return (
    <OrgLayout>
      <AnimatePresence>{toast && <Toast toast={toast} />}</AnimatePresence>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="text-[10px] text-[#10d990] uppercase tracking-[0.3em] mb-1" style={{ fontFamily: "var(--font-mono)" }}>Organizer / Projects</p>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>Projects</h1>
            <div className="flex gap-2">
              <motion.button whileTap={{ scale: 0.95 }} onClick={load}
                className="px-3 py-2 rounded-xl border border-[#1a2a4a] text-[#3d6080] hover:text-[#10d990] hover:border-[#10d99033] transition-all">
                <RefreshCw className="w-4 h-4" />
              </motion.button>
              {isVerified && workspaces.length > 0 && (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest text-[#020408]"
                  style={{ background: "#00e5ff", fontFamily: "var(--font-mono)" }}>
                  <Plus className="w-3.5 h-3.5" /> New Project
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {!isVerified && (
          <div className="mb-6 p-4 rounded-xl border border-[#f59e0b30] bg-[#f59e0b08] flex items-center gap-3">
            <span className="text-[#f59e0b]">⚠️</span>
            <p className="text-[11px] text-[#8ab4d4]" style={{ fontFamily: "var(--font-mono)" }}>Verification required to create projects.</p>
          </div>
        )}

        {loading && projects.length === 0 ? (
          <div className="flex justify-center py-20">
            <motion.div className="w-10 h-10 rounded-full border-2 border-[#00e5ff33] border-t-[#00e5ff]"
              animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <FolderKanban className="w-12 h-12 text-[#1a3a6b] mx-auto mb-4" />
            <p className="text-sm text-[#3d6080] mb-2" style={{ fontFamily: "var(--font-mono)" }}>No projects yet</p>
            {isVerified && workspaces.length > 0 && (
              <motion.button whileHover={{ scale: 1.02 }} onClick={() => setShowCreate(true)}
                className="mt-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-[#020408]"
                style={{ background: "#00e5ff", fontFamily: "var(--font-mono)" }}>
                Create First Project
              </motion.button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((proj, i) => (
              <motion.div key={proj._id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-[#1a2a4a] bg-[#060d18] overflow-hidden hover:border-[#00e5ff22] transition-all"
                style={{ boxShadow: "0 4px 24px #00000055" }}>
                <div className="h-[2px]" style={{ background: "linear-gradient(90deg,#00e5ff,#10d990,transparent)" }} />
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00e5ff] to-[#10d990] flex items-center justify-center text-sm font-black text-[#020408] flex-shrink-0"
                        style={{ fontFamily: "var(--font-display)" }}>{proj.name?.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-black text-[#e8f4ff]">{proj.name}</p>
                        <p className="text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                          {proj.createdAt ? new Date(proj.createdAt).toLocaleDateString() : "—"}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold flex-shrink-0"
                      style={{ color: proj.status === "ACTIVE" ? "#10d990" : "#f59e0b", borderColor: proj.status === "ACTIVE" ? "#10d99030" : "#f59e0b30", background: proj.status === "ACTIVE" ? "#10d99010" : "#f59e0b10", fontFamily: "var(--font-mono)" }}>
                      {proj.status || "ACTIVE"}
                    </span>
                  </div>

                  {/* Project ID */}
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#04080f] border border-[#1a2a4a] mb-3">
                    <FolderKanban className="w-3 h-3 text-[#3d6080] flex-shrink-0" />
                    <p className="text-[10px] text-[#3d6080] flex-1 truncate select-all" style={{ fontFamily: "var(--font-mono)" }}>{proj._id}</p>
                    <CopyBtn text={proj._id} />
                  </div>

                  {/* Domains */}
                  {proj.allowedDomains?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {proj.allowedDomains.map(d => (
                        <span key={d} className="text-[9px] px-2 py-0.5 rounded-full border border-[#00e5ff20] bg-[#00e5ff08] text-[#00e5ff]"
                          style={{ fontFamily: "var(--font-mono)" }}>{d}</span>
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 mb-3">
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setEditModal(proj)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#a855f730] text-[#a855f7] hover:bg-[#a855f710] transition-all text-[10px] uppercase tracking-wider font-bold"
                      style={{ fontFamily: "var(--font-mono)" }}>
                      <Pencil className="w-3 h-3" /> Edit
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setDeleteModal(proj)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#f43f8e30] text-[#f43f8e] hover:bg-[#f43f8e10] transition-all text-[10px] uppercase tracking-wider font-bold"
                      style={{ fontFamily: "var(--font-mono)" }}>
                      <Trash2 className="w-3 h-3" /> Delete
                    </motion.button>
                  </div>

                  {/* SDK Setup button */}
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setSdkDrawer(proj)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#10d99030] text-[#10d990] hover:bg-[#10d99010] transition-all text-[10px] uppercase tracking-widest font-bold mt-2"
                    style={{ fontFamily: "var(--font-mono)" }}>
                    <Terminal className="w-3.5 h-3.5" /> SDK Setup & Integration
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && workspaces.length > 0 && (
          <CreateProjectModal workspaces={workspaces} onClose={() => setShowCreate(false)} onCreate={handleCreate} />
        )}
        {editModal && (
          <EditProjectModal project={editModal} onClose={() => setEditModal(null)} onSave={handleEdit} />
        )}
        {sdkDrawer && (
          <SdkSetupDrawer
            project={sdkDrawer}
            verifySdk={verifySdk}
            onClose={() => setSdkDrawer(null)}
          />
        )}
        {apiKeyData && (
          <ApiKeySetupModal
            apiKey={apiKeyData.apiKey}
            projectId={apiKeyData.projectId}
            projectName={apiKeyData.projectName}
            verifySdk={verifySdk}
            onClose={() => setApiKeyData(null)}
            onVerified={() => { setApiKeyData(null); }}
          />
        )}
        {deleteModal && (
          <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setDeleteModal(null)} />
            <motion.div className="relative w-full max-w-sm rounded-2xl overflow-hidden"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              style={{ background: "linear-gradient(135deg,#0d1117,#161b22)", border: "1px solid #f43f8e22", boxShadow: "0 0 60px #00000099" }}>
              <div className="h-[2px] bg-gradient-to-r from-[#f43f8e] to-transparent" />
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#f43f8e0a] border border-[#f43f8e30] flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-5 h-5 text-[#f43f8e]" />
                </div>
                <h3 className="text-sm font-black text-[#e8f4ff] mb-2 uppercase" style={{ fontFamily: "var(--font-display)" }}>Delete Project</h3>
                <p className="text-xs text-[#3d6080] mb-6" style={{ fontFamily: "var(--font-mono)" }}>Delete "{deleteModal.name}"? All analytics data will be permanently lost.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 rounded-xl border border-[#1a2a4a] text-[#8ab4d4] text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>Cancel</button>
                  <motion.button whileTap={{ scale: 0.98 }} onClick={() => handleDelete(deleteModal._id)}
                    className="flex-1 py-2.5 rounded-xl bg-[#f43f8e] text-white font-bold text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>Delete</motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </OrgLayout>
  );
};

export default OrgProjects;