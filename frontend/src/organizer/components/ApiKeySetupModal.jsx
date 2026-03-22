// src/organizer/components/ApiKeySetupModal.jsx
// Shows ONCE after project creation
// — Pre-filled code for 5 platforms
// — Download .env + script file
// — SDK Verify step

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key, Eye, EyeOff, Copy, Check, Download,
  AlertTriangle, Globe, X, Zap, CheckCircle2,
  Clock, RefreshCw, Terminal
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
const CodeBlock = ({ code, filename, lang = "js" }) => (
  <div className="rounded-xl bg-[#020810] border border-[#1a2a4a] overflow-hidden">
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1a2a4a]">
      <div className="flex items-center gap-2.5">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#f43f8e55]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b55]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#10d99055]" />
        </div>
        {filename && (
          <span className="text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>{filename}</span>
        )}
      </div>
      <CopyBtn text={code} label="Copy Code" />
    </div>
    <pre className="p-4 text-[10px] overflow-x-auto leading-relaxed max-h-64 scrollbar-thin"
      style={{ fontFamily: "var(--font-mono)", color: "#8ab4d4" }}>
      {code}
    </pre>
  </div>
);

/* ── Platform code generators ── */
const getCode = (platform, apiKey, projectId, endpoint) => {
  const INGEST = `${endpoint}/api/ingest/event`;

  const codes = {
    html: {
      label: "HTML / JS",
      icon: "🌐",
      filename: "pulseiq-sdk.js",
      paste: "Paste this in your HTML before </body>",
      code: `<!-- PulseIQ Analytics SDK -->
<!-- Project: ${projectId} -->
<script>
(function() {
  var PulseIQ = {
    apiKey:    "${apiKey}",
    projectId: "${projectId}",
    endpoint:  "${INGEST}",  // ← auto-set from your backend URL

    _anonId: function() {
      var id = localStorage.getItem("_piq_anon");
      if (!id) { id = "anon_" + Math.random().toString(36).slice(2, 11); localStorage.setItem("_piq_anon", id); }
      return id;
    },

    track: function(eventName, properties) {
      fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": this.apiKey },
        body: JSON.stringify({
          projectId:   this.projectId,
          eventName:   eventName,
          userId:      localStorage.getItem("_piq_user") || undefined,
          anonymousId: this._anonId(),
          properties:  Object.assign({ page: location.pathname, referrer: document.referrer }, properties || {}),
        }),
      }).catch(function() {});
    },

    identify: function(userId) {
      localStorage.setItem("_piq_user", String(userId));
      this.track("identify", { userId: userId });
    },
  };

  window.PulseIQ = PulseIQ;

  // Auto track page view
  PulseIQ.track("page_view");
})();
</script>

<!-- Usage anywhere in your HTML:
<button onclick="PulseIQ.track('button_click', { id: 'signup' })">Sign Up</button>

After login:
PulseIQ.identify("user_123");
-->`,
    },

    react: {
      label: "React / Vite",
      icon: "⚛️",
      filename: "src/lib/pulseiq.js",
      paste: "1. Save as src/lib/pulseiq.js  2. Import anywhere",
      code: `// PulseIQ Analytics — React / Vite
// Project: ${projectId}

const CONFIG = {
  apiKey:    "${apiKey}",
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

// ── Usage ──────────────────────────────────────────────
// import { track, identify } from "../lib/pulseiq";
//
// // In App.jsx — track every route change:
// const location = useLocation();
// useEffect(() => { track("page_view", { path: location.pathname }); }, [location]);
//
// // Button click:
// <button onClick={() => track("signup_click", { plan: "pro" })}>Sign Up</button>
//
// // After login:
// identify(user._id);
// ──────────────────────────────────────────────────────`,
    },

    mern: {
      label: "MERN / Node",
      icon: "🟢",
      filename: "pulseiq.js (frontend)",
      paste: "Use same React snippet above for frontend. For server-side Node.js:",
      code: `// PulseIQ Analytics — Node.js / Express (server-side)
// Project: ${projectId}
// Install: npm install node-fetch  (if Node < 18)

const PULSEIQ_API_KEY    = "${apiKey}";
const PULSEIQ_PROJECT_ID = "${projectId}";
const PULSEIQ_ENDPOINT   = "${INGEST}";

async function track(eventName, userId = null, properties = {}) {
  try {
    await fetch(PULSEIQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": PULSEIQ_API_KEY,
      },
      body: JSON.stringify({
        projectId:   PULSEIQ_PROJECT_ID,
        eventName,
        userId:      userId || undefined,
        anonymousId: "server_event",
        properties,
      }),
    });
  } catch (e) { /* silent fail */ }
}

// ── Usage in Express routes ────────────────────────────
// app.post("/api/auth/register", async (req, res) => {
//   // ... your logic
//   await track("user_registered", newUser._id, { email: newUser.email });
//   res.json({ success: true });
// });
//
// app.post("/api/orders", async (req, res) => {
//   // ... your logic
//   await track("order_placed", req.user._id, { amount: order.total });
//   res.json({ success: true });
// });

module.exports = { track };`,
    },

    wordpress: {
      label: "WordPress",
      icon: "🔵",
      filename: "functions.php (add at bottom)",
      paste: "Add to your theme's functions.php OR use Code Snippets plugin",
      code: `<?php
// PulseIQ Analytics — WordPress
// Add to: Appearance > Theme Editor > functions.php
// OR use plugin: Code Snippets > Add New

function pulseiq_analytics_script() { ?>
<script>
(function() {
  var PulseIQ = {
    apiKey:    "<?php echo esc_js("${apiKey}"); ?>",
    projectId: "<?php echo esc_js("${projectId}"); ?>",
    endpoint:  "<?php echo esc_js("${INGEST}"); ?>",

    _anonId: function() {
      var id = localStorage.getItem("_piq_anon");
      if (!id) { id = "anon_" + Math.random().toString(36).slice(2); localStorage.setItem("_piq_anon", id); }
      return id;
    },

    track: function(name, props) {
      <?php if (is_user_logged_in()) { ?>
      var userId = "<?php echo get_current_user_id(); ?>";
      <?php } else { ?>
      var userId = undefined;
      <?php } ?>
      fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": this.apiKey },
        body: JSON.stringify({ projectId: this.projectId, eventName: name, userId: userId, anonymousId: this._anonId(), properties: Object.assign({ page: location.pathname }, props || {}) }),
      }).catch(function(){});
    },
  };
  window.PulseIQ = PulseIQ;
  PulseIQ.track("page_view", { title: document.title });
})();
</script>
<?php }
add_action("wp_footer", "pulseiq_analytics_script");

// Track WooCommerce purchase (optional)
// add_action("woocommerce_thankyou", function($order_id) {
//   $order = wc_get_order($order_id);
//   // Server-side tracking via wp_remote_post if needed
// });
?>`,
    },

    reactnative: {
      label: "React Native",
      icon: "📱",
      filename: "src/lib/pulseiq.js",
      paste: "Save as src/lib/pulseiq.js in your RN project",
      code: `// PulseIQ Analytics — React Native
// Project: ${projectId}
// Works with: Expo, bare React Native
// No install needed — uses built-in fetch

import AsyncStorage from "@react-native-async-storage/async-storage";
// Install: npx expo install @react-native-async-storage/async-storage

const CONFIG = {
  apiKey:    "${apiKey}",
  projectId: "${projectId}",
  endpoint:  "${INGEST}",
};

async function getAnonId() {
  let id = await AsyncStorage.getItem("_piq_anon");
  if (!id) {
    id = "anon_" + Math.random().toString(36).slice(2, 11);
    await AsyncStorage.setItem("_piq_anon", id);
  }
  return id;
}

export async function track(eventName, properties = {}) {
  try {
    const [anonId, userId] = await Promise.all([
      getAnonId(),
      AsyncStorage.getItem("_piq_user"),
    ]);
    await fetch(CONFIG.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": CONFIG.apiKey },
      body: JSON.stringify({
        projectId:   CONFIG.projectId,
        eventName,
        userId:      userId || undefined,
        anonymousId: anonId,
        properties,
      }),
    });
  } catch (e) { /* silent fail */ }
}

export async function identify(userId) {
  await AsyncStorage.setItem("_piq_user", String(userId));
  await track("identify", { userId });
}

// ── Usage ──────────────────────────────────────────────
// import { track, identify } from "../lib/pulseiq";
//
// // In screen component:
// useFocusEffect(() => { track("screen_view", { screen: "Home" }); });
//
// // Button press:
// <TouchableOpacity onPress={() => track("button_press", { id: "login" })}>
//
// // After login:
// await identify(user.id);
// ──────────────────────────────────────────────────────`,
    },
  };

  return codes[platform];
};

/* ── Main Modal ── */
const ApiKeySetupModal = ({ apiKey, projectId, projectName, onClose, onVerified, verifySdk }) => {
  const [showKey, setShowKey]     = useState(true);
  const [activeTab, setActiveTab] = useState("html");
  const [step, setStep]           = useState(1); // 1=credentials, 2=install, 3=verify
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [pollCount, setPollCount] = useState(0);
  const pollRef = useRef(null);

  const ENDPOINT = BASE_URL;
  const code = getCode(activeTab, apiKey, projectId, ENDPOINT);

  const TABS = [
    { id: "html",        label: "HTML / JS",      icon: "🌐" },
    { id: "react",       label: "React",           icon: "⚛️" },
    { id: "mern",        label: "MERN / Node",     icon: "🟢" },
    { id: "wordpress",   label: "WordPress",       icon: "🔵" },
    { id: "reactnative", label: "React Native",    icon: "📱" },
  ];

  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadEnv = () => {
    downloadFile(
`# PulseIQ Analytics — Project: ${projectName}
# Generated: ${new Date().toLocaleString()}
#
# ⚠️  IMPORTANT:
# 1. Do NOT commit this file to git (add .env.pulseiq to .gitignore)
# 2. For React/Vite — prefix vars with VITE_ and add to your .env file
# 3. Update PULSEIQ_ENDPOINT when you deploy to production

# ── Core Credentials ──────────────────────────────────
PULSEIQ_API_KEY=${apiKey}
PULSEIQ_PROJECT_ID=${projectId}

# ── Endpoint (UPDATE THIS WHEN YOU DEPLOY) ────────────
# Local:
PULSEIQ_ENDPOINT=${ENDPOINT}/api/ingest/event

# Production (uncomment and update after deploy):
# PULSEIQ_ENDPOINT=https://YOUR-BACKEND.onrender.com/api/ingest/event

# ── For React/Vite (.env file) ────────────────────────
VITE_PULSEIQ_API_KEY=${apiKey}
VITE_PULSEIQ_PROJECT_ID=${projectId}
VITE_PULSEIQ_ENDPOINT=${ENDPOINT}/api/ingest/event
`,
      `.env.pulseiq`
    );
  };

  const downloadCode = () => downloadFile(code.code, code.filename.split(" ")[0]);

  // Poll verify endpoint every 5s
  const startVerify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    setPollCount(0);

    const check = async (count) => {
      try {
        const res = await verifySdk(projectId);
        if (res?.verified) {
          setVerifyResult({ success: true, msg: "🎉 SDK verified! Events are being received.", event: res.event });
          setVerifying(false);
          return;
        }
        if (count >= 12) { // 60 seconds max
          setVerifyResult({ success: false, msg: "No events received yet. Make sure you pasted the code and refreshed your page." });
          setVerifying(false);
          return;
        }
        setPollCount(count + 1);
        pollRef.current = setTimeout(() => check(count + 1), 5000);
      } catch {
        setVerifyResult({ success: false, msg: "Verification failed. Please try again." });
        setVerifying(false);
      }
    };
    check(0);
  };

  const stopVerify = () => {
    if (pollRef.current) clearTimeout(pollRef.current);
    setVerifying(false);
  };

  const STEPS = [
    { n: 1, label: "Your Credentials" },
    { n: 2, label: "Install SDK" },
    { n: 3, label: "Verify & Activate" },
  ];

  return (
    <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center px-3 py-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

      <motion.div className="relative w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col"
        style={{ background: "linear-gradient(160deg,#0a0f1a 0%,#060d18 100%)", border: "1px solid #f59e0b33", boxShadow: "0 0 100px #f59e0b06, 0 24px 80px #00000099", maxHeight: "95vh" }}
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }}>

        {/* Rainbow bar */}
        <div className="h-[3px] w-full flex-shrink-0"
          style={{ background: "linear-gradient(90deg,#f59e0b,#f43f8e,#a855f7,#00e5ff,#10d990)" }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a2a4a] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#f59e0b15] border border-[#f59e0b30] flex items-center justify-center">
              <Key className="w-4.5 h-4.5 text-[#f59e0b]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#e8f4ff] uppercase" style={{ fontFamily: "var(--font-display)" }}>
                SDK Setup — {projectName}
              </h3>
              <div className="flex items-center gap-1 mt-0.5">
                <AlertTriangle className="w-3 h-3 text-[#f43f8e]" />
                <p className="text-[9px] text-[#f43f8e]" style={{ fontFamily: "var(--font-mono)" }}>
                  API Key shown ONCE — save it now
                </p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl border border-[#1a2a4a] flex items-center justify-center text-[#3d6080] hover:text-[#e8f4ff] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 px-6 py-3 border-b border-[#1a2a4a] flex-shrink-0">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center">
              <button onClick={() => setStep(s.n)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all"
                style={{ background: step === s.n ? "#00e5ff15" : "transparent" }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                  style={{ background: step === s.n ? "#00e5ff" : step > s.n ? "#10d990" : "#1a2a4a", color: step >= s.n ? "#020408" : "#3d6080", fontFamily: "var(--font-display)" }}>
                  {step > s.n ? "✓" : s.n}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold hidden sm:block"
                  style={{ color: step === s.n ? "#00e5ff" : step > s.n ? "#10d990" : "#3d6080", fontFamily: "var(--font-mono)" }}>
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && <div className="w-8 h-px mx-1" style={{ background: step > s.n ? "#10d99040" : "#1a2a4a" }} />}
            </div>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── STEP 1: Credentials ── */}
          {step === 1 && (
            <div className="space-y-4">
              {/* API Key */}
              <div className="p-4 rounded-2xl bg-[#04080f] border border-[#f59e0b22]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] text-[#f59e0b] uppercase tracking-widest font-bold"
                    style={{ fontFamily: "var(--font-mono)" }}>🔑 API Key (one-time)</p>
                  <div className="flex gap-2">
                    <button onClick={() => setShowKey(s => !s)}
                      className="w-7 h-7 rounded-lg border border-[#1a2a4a] flex items-center justify-center text-[#3d6080] hover:text-[#8ab4d4] transition-colors">
                      {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <CopyBtn text={apiKey} label="Copy Key" />
                  </div>
                </div>
                <code className="block text-[11px] break-all select-all leading-relaxed py-2 px-3 rounded-xl bg-[#060d18] border border-[#1a2a4a]"
                  style={{ color: showKey ? "#10d990" : "#1a3a6b", fontFamily: "var(--font-mono)" }}>
                  {showKey ? apiKey : "•".repeat(Math.min(apiKey.length, 48))}
                </code>
              </div>

              {/* Project ID + Endpoint */}
              {[
                { label: "Project ID",       value: projectId,                      color: "#a855f7" },
                { label: "Ingest Endpoint",  value: `${ENDPOINT}/api/ingest/event`, color: "#00e5ff" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-[#04080f] border border-[#1a2a4a]">
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color, fontFamily: "var(--font-mono)" }}>{label}</p>
                    <code className="text-[11px] text-[#8ab4d4] truncate block select-all" style={{ fontFamily: "var(--font-mono)" }}>{value}</code>
                  </div>
                  <CopyBtn text={value} />
                </div>
              ))}

              {/* Download buttons */}
              <div className="grid grid-cols-2 gap-3">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={downloadEnv}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[#10d99030] bg-[#10d99010] text-[#10d990] font-bold text-[11px] uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-mono)" }}>
                  <Download className="w-3.5 h-3.5" /> Download .env
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={downloadCode}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[#00e5ff30] bg-[#00e5ff10] text-[#00e5ff] font-bold text-[11px] uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-mono)" }}>
                  <Download className="w-3.5 h-3.5" /> Download SDK
                </motion.button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Install SDK ── */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Platform tabs */}
              <div className="flex gap-2 flex-wrap">
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] uppercase tracking-wider font-bold border transition-all"
                    style={{ borderColor: activeTab === t.id ? "#00e5ff50" : "#1a2a4a", background: activeTab === t.id ? "#00e5ff15" : "transparent", color: activeTab === t.id ? "#00e5ff" : "#3d6080", fontFamily: "var(--font-mono)" }}>
                    <span>{t.icon}</span> {t.label}
                  </button>
                ))}
              </div>

              {/* Platform info */}
              <div className="p-3 rounded-xl bg-[#10d99008] border border-[#10d99020] flex items-start gap-3">
                <Terminal className="w-4 h-4 text-[#10d990] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-[#10d990] mb-0.5" style={{ fontFamily: "var(--font-mono)" }}>
                    {code.paste}
                  </p>
                  <p className="text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                    File: <span className="text-[#8ab4d4]">{code.filename}</span>
                  </p>
                </div>
              </div>

              {/* Code block */}
              <CodeBlock code={code.code} filename={code.filename} />

              {/* Download this platform's file */}
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={downloadCode}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#a855f730] bg-[#a855f710] text-[#a855f7] font-bold text-[11px] uppercase tracking-wider"
                style={{ fontFamily: "var(--font-mono)" }}>
                <Download className="w-3.5 h-3.5" /> Download {code.filename.split(" ")[0]}
              </motion.button>
            </div>
          )}

          {/* ── STEP 3: Verify ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#04080f] border border-[#1a2a4a]">
                <p className="text-[10px] text-[#3d6080] uppercase tracking-widest mb-3" style={{ fontFamily: "var(--font-mono)" }}>
                  How to verify:
                </p>
                {[
                  "Paste the SDK code in your website/app",
                  "Open your website in browser (or refresh it)",
                  `The SDK will auto-send a "page_view" event`,
                  "Click Verify below — we'll check if events arrived",
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-3 mb-2.5 last:mb-0">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-[#020408] flex-shrink-0"
                      style={{ background: ["#f59e0b","#00e5ff","#a855f7","#10d990"][i], fontFamily: "var(--font-display)" }}>
                      {i + 1}
                    </span>
                    <p className="text-[11px] text-[#8ab4d4] leading-relaxed" style={{ fontFamily: "var(--font-mono)" }}>{s}</p>
                  </div>
                ))}
              </div>

              {/* Verify button / status */}
              {!verifyResult ? (
                <motion.button whileHover={{ scale: verifying ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={verifying ? stopVerify : startVerify}
                  disabled={false}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all"
                  style={{ background: verifying ? "#1a2a4a" : "linear-gradient(135deg,#00e5ff,#10d990)", color: verifying ? "#3d6080" : "#020408", fontFamily: "var(--font-display)" }}>
                  {verifying ? (
                    <>
                      <motion.div className="w-5 h-5 rounded-full border-2 border-[#3d6080] border-t-[#00e5ff]"
                        animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
                      Listening for events... ({pollCount * 5}s) — Click to stop
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" /> Verify SDK Installation
                    </>
                  )}
                </motion.button>
              ) : null}

              {/* Result */}
              <AnimatePresence>
                {verifyResult && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl border"
                    style={{ background: verifyResult.success ? "#10d99010" : "#f43f8e10", borderColor: verifyResult.success ? "#10d99030" : "#f43f8e30" }}>
                    <div className="flex items-center gap-3 mb-2">
                      {verifyResult.success
                        ? <CheckCircle2 className="w-6 h-6 text-[#10d990]" />
                        : <AlertTriangle className="w-6 h-6 text-[#f43f8e]" />}
                      <p className="text-sm font-black" style={{ color: verifyResult.success ? "#10d990" : "#f43f8e", fontFamily: "var(--font-display)" }}>
                        {verifyResult.success ? "Verified!" : "Not Yet"}
                      </p>
                    </div>
                    <p className="text-[11px] mb-3" style={{ color: verifyResult.success ? "#8ab4d4" : "#8ab4d4", fontFamily: "var(--font-mono)" }}>
                      {verifyResult.msg}
                    </p>
                    {verifyResult.success && verifyResult.event && (
                      <div className="p-2.5 rounded-xl bg-[#04080f] border border-[#10d99020]">
                        <p className="text-[10px] text-[#3d6080] mb-1" style={{ fontFamily: "var(--font-mono)" }}>Last received event:</p>
                        <p className="text-[11px] text-[#10d990] font-bold" style={{ fontFamily: "var(--font-mono)" }}>
                          "{verifyResult.event.name}" — {verifyResult.event.time ? new Date(verifyResult.event.time).toLocaleTimeString() : "just now"}
                        </p>
                      </div>
                    )}
                    {!verifyResult.success && (
                      <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setVerifyResult(null); }}
                        className="flex items-center gap-2 text-[10px] text-[#3d6080] hover:text-[#00e5ff] transition-colors"
                        style={{ fontFamily: "var(--font-mono)" }}>
                        <RefreshCw className="w-3.5 h-3.5" /> Try again
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-[#1a2a4a] flex-shrink-0">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : null}
            disabled={step === 1}
            className="px-4 py-2.5 rounded-xl border border-[#1a2a4a] text-[#3d6080] text-xs uppercase tracking-widest disabled:opacity-30 hover:text-[#8ab4d4] transition-colors"
            style={{ fontFamily: "var(--font-mono)" }}>← Back</button>

          <div className="flex items-center gap-1.5">
            {[1,2,3].map(n => (
              <div key={n} className="w-2 h-2 rounded-full transition-all"
                style={{ background: step === n ? "#00e5ff" : step > n ? "#10d990" : "#1a2a4a" }} />
            ))}
          </div>

          {step < 3 ? (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setStep(s => s + 1)}
              className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest text-[#020408]"
              style={{ background: "#00e5ff", fontFamily: "var(--font-mono)" }}>
              Next →
            </motion.button>
          ) : (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest text-[#020408]"
              style={{ background: verifyResult?.success ? "#10d990" : "#3d6080", fontFamily: "var(--font-mono)" }}>
              {verifyResult?.success ? "Open Analytics →" : "Close"}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ApiKeySetupModal;