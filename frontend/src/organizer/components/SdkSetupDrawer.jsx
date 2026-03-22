// src/organizer/components/SdkSetupDrawer.jsx
// For EXISTING projects — no API key shown (one-time only)
// Shows: platform code snippets + verify

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Copy, Check, Download, Terminal, Zap,
  CheckCircle2, AlertTriangle, RefreshCw, Code2
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

/* ── Copy Button ── */
const CopyBtn = ({ text, label = "Copy" }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e?.stopPropagation();
    const doCopy = () => {
      const el = document.createElement("textarea");
      el.value = text; el.style.cssText = "position:fixed;top:-9999px;opacity:0";
      document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el);
      setCopied(true); setTimeout(() => setCopied(false), 2500);
    };
    try { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); }).catch(doCopy); } catch { doCopy(); }
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

/* ── Code Block ── */
const CodeBlock = ({ code, filename }) => (
  <div className="rounded-xl bg-[#020810] border border-[#1a2a4a] overflow-hidden">
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1a2a4a]">
      <div className="flex items-center gap-2.5">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#f43f8e55]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b55]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#10d99055]" />
        </div>
        <span className="text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>{filename}</span>
      </div>
      <CopyBtn text={code} label="Copy" />
    </div>
    <pre className="p-4 text-[10px] overflow-x-auto leading-relaxed max-h-72"
      style={{ fontFamily: "var(--font-mono)", color: "#8ab4d4" }}>
      {code}
    </pre>
  </div>
);

const TABS = [
  { id: "html",        label: "HTML / JS",    icon: "🌐" },
  { id: "react",       label: "React",        icon: "⚛️" },
  { id: "mern",        label: "MERN / Node",  icon: "🟢" },
  { id: "wordpress",   label: "WordPress",    icon: "🔵" },
  { id: "reactnative", label: "React Native", icon: "📱" },
];

const getSnippet = (platform, projectId, endpoint) => {
  const INGEST = `${endpoint}/api/ingest/event`;
  const NOTE   = `// ⚠️  Replace YOUR_API_KEY with your project's API key\n// API key was shown once at project creation\n\n`;

  const map = {
    html: {
      filename: "pulseiq-sdk.js",
      paste:    "Paste before </body> in your HTML",
      code: NOTE + `<!-- PulseIQ Analytics — Project: ${projectId} -->
<script>
(function() {
  var PulseIQ = {
    apiKey:    "YOUR_API_KEY",          // ← paste your key here
    projectId: "${projectId}",
    endpoint:  "${INGEST}",

    _anonId: function() {
      var id = localStorage.getItem("_piq_anon");
      if (!id) { id = "anon_" + Math.random().toString(36).slice(2, 11); localStorage.setItem("_piq_anon", id); }
      return id;
    },

    track: function(name, props) {
      fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": this.apiKey },
        body: JSON.stringify({
          projectId:   this.projectId,
          eventName:   name,
          userId:      localStorage.getItem("_piq_user") || undefined,
          anonymousId: this._anonId(),
          properties:  Object.assign({ page: location.pathname, referrer: document.referrer }, props || {}),
        }),
      }).catch(function() {});
    },

    identify: function(userId) {
      localStorage.setItem("_piq_user", String(userId));
      this.track("identify", { userId: userId });
    },
  };
  window.PulseIQ = PulseIQ;
  PulseIQ.track("page_view"); // auto track
})();
</script>
<!-- Usage:
  PulseIQ.track("button_click", { id: "signup" });
  PulseIQ.identify("user_123"); // after login
-->`,
    },

    react: {
      filename: "src/lib/pulseiq.js",
      paste:    "Save as src/lib/pulseiq.js → import { track } anywhere",
      code: NOTE + `// PulseIQ — React / Vite  |  Project: ${projectId}
const CONFIG = {
  apiKey:    "YOUR_API_KEY",            // ← paste your key here
  projectId: "${projectId}",
  endpoint:  "${INGEST}",
};

function getAnonId() {
  let id = localStorage.getItem("_piq_anon");
  if (!id) { id = "anon_" + Math.random().toString(36).slice(2, 11); localStorage.setItem("_piq_anon", id); }
  return id;
}

export function track(eventName, properties = {}) {
  fetch(CONFIG.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": CONFIG.apiKey },
    body: JSON.stringify({
      projectId:   CONFIG.projectId,
      eventName,
      userId:      localStorage.getItem("_piq_user") || undefined,
      anonymousId: getAnonId(),
      properties:  { page: window.location.pathname, ...properties },
    }),
  }).catch(() => {});
}

export function identify(userId) {
  localStorage.setItem("_piq_user", String(userId));
  track("identify", { userId });
}

// ── Usage ─────────────────────────────────────────
// import { track, identify } from "../lib/pulseiq";
// useEffect(() => track("page_view"), [location]);
// <button onClick={() => track("click", { btn: "cta" })}>
// identify(user._id); // after login`,
    },

    mern: {
      filename: "pulseiq.js (Node/Express)",
      paste:    "Use React snippet for frontend. This is for server-side Node.js:",
      code: NOTE + `// PulseIQ — Node.js / Express  |  Project: ${projectId}
const PULSEIQ_API_KEY    = "YOUR_API_KEY";  // ← paste your key
const PULSEIQ_PROJECT_ID = "${projectId}";
const PULSEIQ_ENDPOINT   = "${INGEST}";

async function track(eventName, userId = null, properties = {}) {
  try {
    await fetch(PULSEIQ_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": PULSEIQ_API_KEY },
      body: JSON.stringify({ projectId: PULSEIQ_PROJECT_ID, eventName, userId: userId || undefined, anonymousId: "server", properties }),
    });
  } catch (e) {}
}

module.exports = { track };

// Usage in Express:
// app.post("/api/register", async (req, res) => {
//   await track("user_registered", newUser._id, { email: newUser.email });
// });`,
    },

    wordpress: {
      filename: "functions.php",
      paste:    "Add to Appearance > Theme Editor > functions.php",
      code: NOTE + `<?php
// PulseIQ Analytics — WordPress  |  Project: ${projectId}
function pulseiq_analytics() { ?>
<script>
(function() {
  var PulseIQ = {
    apiKey:    "YOUR_API_KEY",
    projectId: "<?php echo esc_js("${projectId}"); ?>",
    endpoint:  "<?php echo esc_js("${INGEST}"); ?>",
    _anonId: function() {
      var id = localStorage.getItem("_piq_anon");
      if (!id) { id = "anon_" + Math.random().toString(36).slice(2); localStorage.setItem("_piq_anon", id); }
      return id;
    },
    track: function(name, props) {
      fetch(this.endpoint, {
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":this.apiKey},
        body:JSON.stringify({ projectId:this.projectId, eventName:name,
          userId: <?php echo is_user_logged_in() ? '"'.get_current_user_id().'"' : 'undefined'; ?>,
          anonymousId:this._anonId(), properties:Object.assign({page:location.pathname},props||{}) })
      }).catch(function(){});
    },
  };
  window.PulseIQ = PulseIQ;
  PulseIQ.track("page_view", { title: document.title });
})();
</script>
<?php }
add_action("wp_footer", "pulseiq_analytics");
?>`,
    },

    reactnative: {
      filename: "src/lib/pulseiq.js",
      paste:    "Save as src/lib/pulseiq.js — requires @react-native-async-storage",
      code: NOTE + `// PulseIQ — React Native  |  Project: ${projectId}
import AsyncStorage from "@react-native-async-storage/async-storage";

const CONFIG = {
  apiKey:    "YOUR_API_KEY",
  projectId: "${projectId}",
  endpoint:  "${INGEST}",
};

async function getAnonId() {
  let id = await AsyncStorage.getItem("_piq_anon");
  if (!id) { id = "anon_" + Math.random().toString(36).slice(2, 11); await AsyncStorage.setItem("_piq_anon", id); }
  return id;
}

export async function track(eventName, properties = {}) {
  try {
    const [anonId, userId] = await Promise.all([getAnonId(), AsyncStorage.getItem("_piq_user")]);
    await fetch(CONFIG.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": CONFIG.apiKey },
      body: JSON.stringify({ projectId: CONFIG.projectId, eventName, userId: userId || undefined, anonymousId: anonId, properties }),
    });
  } catch (e) {}
}

export async function identify(userId) {
  await AsyncStorage.setItem("_piq_user", String(userId));
  await track("identify", { userId });
}

// useFocusEffect(() => { track("screen_view", { screen: "Home" }); });`,
    },
  };

  return map[platform] || map.html;
};

/* ── Main Drawer ── */
const SdkSetupDrawer = ({ project, onClose, verifySdk }) => {
  const [activeTab, setActiveTab]   = useState("html");
  const [verifying, setVerifying]   = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [pollCount, setPollCount]   = useState(0);
  const pollRef = useRef(null);

  const snippet = getSnippet(activeTab, project._id, BASE_URL);

  const downloadCode = () => {
    const blob = new Blob([snippet.code], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = snippet.filename.split(" ")[0]; a.click();
    URL.revokeObjectURL(url);
  };

  const startVerify = async () => {
    setVerifying(true); setVerifyResult(null); setPollCount(0);
    const check = async (count) => {
      try {
        const res = await verifySdk(project._id);
        if (res?.verified) {
          setVerifyResult({ success: true, msg: "🎉 SDK verified! Events are being received.", event: res.event });
          setVerifying(false); return;
        }
        if (count >= 12) {
          setVerifyResult({ success: false, msg: "No events received yet. Make sure SDK is installed and page is refreshed." });
          setVerifying(false); return;
        }
        setPollCount(count + 1);
        pollRef.current = setTimeout(() => check(count + 1), 5000);
      } catch {
        setVerifyResult({ success: false, msg: "Verification check failed. Try again." });
        setVerifying(false);
      }
    };
    check(0);
  };

  const stopVerify = () => { if (pollRef.current) clearTimeout(pollRef.current); setVerifying(false); };

  return (
    <motion.div className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center sm:px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <motion.div className="relative w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col"
        style={{ background: "linear-gradient(160deg,#0a0f1a,#060d18)", border: "1px solid #10d99022", boxShadow: "0 0 80px #10d99008, 0 -20px 60px #00000088", maxHeight: "90vh" }}
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}>

        <div className="h-[2px] flex-shrink-0" style={{ background: "linear-gradient(90deg,#10d990,#00e5ff,#a855f7)" }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a2a4a] flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#10d990] to-[#00e5ff] flex items-center justify-center text-sm font-black text-[#020408] flex-shrink-0"
              style={{ fontFamily: "var(--font-display)" }}>{project.name?.charAt(0)}</div>
            <div className="min-w-0">
              <p className="text-xs font-black text-[#e8f4ff] truncate">{project.name}</p>
              <p className="text-[9px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>SDK Integration Guide</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl border border-[#1a2a4a] flex items-center justify-center text-[#3d6080] hover:text-[#e8f4ff] transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Project credentials */}
          <div className="px-5 py-4 border-b border-[#1a2a4a] space-y-2">
            <p className="text-[9px] text-[#3d6080] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>Project Credentials</p>
            {[
              { label: "Project ID", value: project._id, color: "#a855f7" },
              { label: "Endpoint",   value: `${BASE_URL}/api/ingest/event`, color: "#00e5ff" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#04080f] border border-[#1a2a4a]">
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color, fontFamily: "var(--font-mono)" }}>{label}</p>
                  <code className="text-[10px] text-[#8ab4d4] truncate block select-all" style={{ fontFamily: "var(--font-mono)" }}>{value}</code>
                </div>
                <CopyBtn text={value} />
              </div>
            ))}

            {/* API key reminder */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl border border-[#f59e0b20] bg-[#f59e0b08]">
              <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b] flex-shrink-0" />
              <p className="text-[10px] text-[#f59e0b]" style={{ fontFamily: "var(--font-mono)" }}>
                API Key was shown once at creation — paste it in the code below where it says YOUR_API_KEY
              </p>
            </div>
          </div>

          {/* Platform tabs */}
          <div className="px-5 pt-4">
            <p className="text-[9px] text-[#3d6080] uppercase tracking-widest mb-3" style={{ fontFamily: "var(--font-mono)" }}>Choose your platform:</p>
            <div className="flex gap-2 flex-wrap mb-4">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-bold border transition-all"
                  style={{ borderColor: activeTab === t.id ? "#10d99050" : "#1a2a4a", background: activeTab === t.id ? "#10d99015" : "transparent", color: activeTab === t.id ? "#10d990" : "#3d6080", fontFamily: "var(--font-mono)" }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* Paste instruction */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#10d99008] border border-[#10d99020] mb-3">
              <Terminal className="w-3.5 h-3.5 text-[#10d990] flex-shrink-0" />
              <p className="text-[10px] text-[#10d990]" style={{ fontFamily: "var(--font-mono)" }}>{snippet.paste}</p>
            </div>

            {/* Code */}
            <CodeBlock code={snippet.code} filename={snippet.filename} />

            {/* Download */}
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={downloadCode}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#a855f730] bg-[#a855f710] text-[#a855f7] font-bold text-[11px] uppercase tracking-wider mt-3"
              style={{ fontFamily: "var(--font-mono)" }}>
              <Download className="w-3.5 h-3.5" /> Download {snippet.filename.split(" ")[0]}
            </motion.button>
          </div>

          {/* Verify section */}
          <div className="px-5 py-5 mt-2 border-t border-[#1a2a4a]">
            <div className="flex items-center gap-2 mb-4">
              <Code2 className="w-4 h-4 text-[#00e5ff]" />
              <p className="text-xs font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>Verify SDK</p>
            </div>
            <p className="text-[11px] text-[#3d6080] mb-4" style={{ fontFamily: "var(--font-mono)" }}>
              After pasting the code, refresh your website and click verify. We'll check if events are arriving.
            </p>

            {!verifyResult ? (
              <motion.button whileHover={{ scale: verifying ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={verifying ? stopVerify : startVerify}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest"
                style={{ background: verifying ? "#1a2a4a" : "linear-gradient(135deg,#10d990,#00e5ff)", color: verifying ? "#3d6080" : "#020408", fontFamily: "var(--font-display)" }}>
                {verifying ? (
                  <>
                    <motion.div className="w-4 h-4 rounded-full border-2 border-[#3d6080] border-t-[#10d990]"
                      animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
                    Listening... ({pollCount * 5}s elapsed) — tap to stop
                  </>
                ) : (
                  <><Zap className="w-4 h-4" /> Verify Installation</>
                )}
              </motion.button>
            ) : null}

            <AnimatePresence>
              {verifyResult && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl border"
                  style={{ background: verifyResult.success ? "#10d99010" : "#f43f8e10", borderColor: verifyResult.success ? "#10d99030" : "#f43f8e30" }}>
                  <div className="flex items-center gap-2 mb-2">
                    {verifyResult.success
                      ? <CheckCircle2 className="w-5 h-5 text-[#10d990]" />
                      : <AlertTriangle className="w-5 h-5 text-[#f43f8e]" />}
                    <p className="text-sm font-black" style={{ color: verifyResult.success ? "#10d990" : "#f43f8e", fontFamily: "var(--font-display)" }}>
                      {verifyResult.success ? "Verified! 🎉" : "Not verified yet"}
                    </p>
                  </div>
                  <p className="text-[11px] text-[#8ab4d4] mb-3" style={{ fontFamily: "var(--font-mono)" }}>{verifyResult.msg}</p>
                  {verifyResult.success && verifyResult.event && (
                    <div className="p-2.5 rounded-xl bg-[#04080f] border border-[#10d99020]">
                      <p className="text-[10px] text-[#3d6080] mb-0.5" style={{ fontFamily: "var(--font-mono)" }}>First event received:</p>
                      <p className="text-[11px] text-[#10d990] font-bold" style={{ fontFamily: "var(--font-mono)" }}>
                        "{verifyResult.event.name}" — {verifyResult.event.time ? new Date(verifyResult.event.time).toLocaleTimeString() : "just now"}
                      </p>
                    </div>
                  )}
                  {!verifyResult.success && (
                    <button onClick={() => setVerifyResult(null)}
                      className="flex items-center gap-1.5 text-[10px] text-[#3d6080] hover:text-[#00e5ff] transition-colors mt-2"
                      style={{ fontFamily: "var(--font-mono)" }}>
                      <RefreshCw className="w-3.5 h-3.5" /> Try again
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SdkSetupDrawer;