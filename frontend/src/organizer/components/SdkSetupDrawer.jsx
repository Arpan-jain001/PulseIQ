import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Copy,
  Check,
  Download,
  Terminal,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Code2,
  FileText,
  Sparkles,
} from "lucide-react";
import {
  SDK_PLATFORMS,
  getSdkGuide,
  getSdkAiPrompt,
  getSdkSetupDocument,
  buildIngestEndpoint,
  getDownloadFilename,
} from "../../lib/sdkGuides";

const BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

const escapeHtml = (value = "") =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const CopyBtn = ({ text, label = "Copy" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (event) => {
    event?.stopPropagation();
    const fallbackCopy = () => {
      const element = document.createElement("textarea");
      element.value = text;
      element.style.cssText = "position:fixed;top:-9999px;opacity:0";
      document.body.appendChild(element);
      element.select();
      document.execCommand("copy");
      document.body.removeChild(element);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    };

    try {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        })
        .catch(fallbackCopy);
    } catch {
      fallbackCopy();
    }
  };

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 transition-all"
      style={{
        color: copied ? "#10d990" : "#3d6080",
        borderColor: copied ? "#10d99030" : "#1a2a4a",
        background: copied ? "#10d99015" : "transparent",
        fontFamily: "var(--font-mono)",
      }}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      <span className="text-[9px] uppercase tracking-wider">{copied ? "Copied!" : label}</span>
    </motion.button>
  );
};

const CodeBlock = ({ code, filename }) => (
  <div className="overflow-hidden rounded-xl border border-[#1a2a4a] bg-[#020810]">
    <div className="flex items-center justify-between border-b border-[#1a2a4a] px-4 py-2.5">
      <div className="flex items-center gap-2.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#f43f8e55]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#f59e0b55]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#10d99055]" />
        </div>
        <span className="text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
          {filename}
        </span>
      </div>
      <CopyBtn text={code} label="Copy Code" />
    </div>
    <pre
      className="max-h-80 overflow-x-auto p-4 text-[10px] leading-relaxed"
      style={{ fontFamily: "var(--font-mono)", color: "#8ab4d4" }}
    >
      {code}
    </pre>
  </div>
);

const SdkSetupDrawer = ({ project, onClose, verifySdk }) => {
  const [activeTab, setActiveTab] = useState("html");
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [pollCount, setPollCount] = useState(0);
  const pollRef = useRef(null);

  const guide = getSdkGuide({
    platform: activeTab,
    apiKey: "YOUR_API_KEY",
    projectId: project._id,
    endpoint: BASE_URL,
  });
  const aiPrompt = getSdkAiPrompt({
    platform: activeTab,
    apiKey: "YOUR_API_KEY",
    projectId: project._id,
    endpoint: BASE_URL,
  });
  const setupGuide = getSdkSetupDocument({
    platform: activeTab,
    apiKey: "YOUR_API_KEY",
    projectId: project._id,
    endpoint: BASE_URL,
    projectName: project.name,
  });

  const downloadCode = () => {
    const blob = new Blob([guide.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = getDownloadFilename(guide.filename);
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPrompt = () => {
    const blob = new Blob([aiPrompt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = getDownloadFilename(`pulseiq-${activeTab}-ai-prompt.txt`);
    link.click();
    URL.revokeObjectURL(url);
  };

  const printGuide = () => {
    const win = window.open("", "_blank", "noopener,noreferrer,width=960,height=760");
    if (!win) return;

    win.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>PulseIQ Setup Guide</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background: #ffffff;
        color: #111827;
        margin: 32px;
        line-height: 1.5;
      }
      h1 {
        font-size: 24px;
        margin-bottom: 8px;
      }
      pre {
        white-space: pre-wrap;
        word-break: break-word;
        background: #f8fafc;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 16px;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <h1>PulseIQ Setup Guide</h1>
    <pre>${escapeHtml(setupGuide)}</pre>
  </body>
</html>`);
    win.document.close();
    win.focus();
    window.setTimeout(() => {
      win.print();
    }, 250);
  };

  const startVerify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    setPollCount(0);

    const check = async (count) => {
      try {
        const response = await verifySdk(project._id);
        if (response?.verified) {
          setVerifyResult({
            success: true,
            msg: "SDK verified. PulseIQ is receiving events from your site/app.",
            event: response.event,
          });
          setVerifying(false);
          return;
        }

        if (count >= 12) {
          setVerifyResult({
            success: false,
            msg: "No events received yet. Paste the snippet, refresh the app, then try again.",
          });
          setVerifying(false);
          return;
        }

        setPollCount(count + 1);
        pollRef.current = setTimeout(() => check(count + 1), 5000);
      } catch {
        setVerifyResult({
          success: false,
          msg: "Verification request failed. Please try again in a few seconds.",
        });
        setVerifying(false);
      }
    };

    check(0);
  };

  const stopVerify = () => {
    if (pollRef.current) clearTimeout(pollRef.current);
    setVerifying(false);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[9998] flex items-end justify-center sm:items-center sm:px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        className="relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl sm:max-w-3xl sm:rounded-2xl"
        style={{
          background: "linear-gradient(160deg,#0a0f1a,#060d18)",
          border: "1px solid #10d99022",
          boxShadow: "0 0 80px #10d99008, 0 -20px 60px #00000088",
        }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
      >
        <div className="h-[2px] flex-shrink-0" style={{ background: "linear-gradient(90deg,#10d990,#00e5ff,#a855f7)" }} />

        <div className="flex items-center justify-between border-b border-[#1a2a4a] px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#10d990] to-[#00e5ff] text-sm font-black text-[#020408]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {project.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-black text-[#e8f4ff]">{project.name}</p>
              <p className="text-[9px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                Ready-to-paste SDK integration guide
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-[#1a2a4a] text-[#3d6080] transition-colors hover:text-[#e8f4ff]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2 border-b border-[#1a2a4a] px-5 py-4">
            <p className="text-[9px] uppercase tracking-widest text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
              Project credentials
            </p>
            {[
              { label: "Project ID", value: project._id, color: "#a855f7" },
              { label: "Endpoint", value: buildIngestEndpoint(BASE_URL), color: "#00e5ff" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl border border-[#1a2a4a] bg-[#04080f] p-2.5">
                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 text-[9px] uppercase tracking-widest" style={{ color, fontFamily: "var(--font-mono)" }}>
                    {label}
                  </p>
                  <code className="block truncate text-[10px] text-[#8ab4d4]" style={{ fontFamily: "var(--font-mono)" }}>
                    {value}
                  </code>
                </div>
                <CopyBtn text={value} />
              </div>
            ))}
            <div className="flex items-center gap-2 rounded-xl border border-[#f59e0b20] bg-[#f59e0b08] p-2.5">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-[#f59e0b]" />
              <p className="text-[10px] text-[#f59e0b]" style={{ fontFamily: "var(--font-mono)" }}>
                Replace YOUR_API_KEY in the snippet below with the raw key you copied when the project was created.
              </p>
            </div>
          </div>

          <div className="px-5 pt-4">
            <p className="mb-3 text-[9px] uppercase tracking-widest text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
              Choose your platform
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              {SDK_PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setActiveTab(platform.id)}
                  className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all"
                  style={{
                    borderColor: activeTab === platform.id ? "#10d99050" : "#1a2a4a",
                    background: activeTab === platform.id ? "#10d99015" : "transparent",
                    color: activeTab === platform.id ? "#10d990" : "#3d6080",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  <span className="rounded-full border border-current/20 px-1.5 py-0.5 text-[8px]">{platform.badge}</span>
                  {platform.label}
                </button>
              ))}
            </div>

            <div className="mb-3 rounded-xl border border-[#10d99020] bg-[#10d99008] p-3">
              <div className="flex items-start gap-2">
                <Terminal className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#10d990]" />
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-[#10d990]" style={{ fontFamily: "var(--font-mono)" }}>
                    {guide.paste}
                  </p>
                  <p className="text-[10px] text-[#8ab4d4]" style={{ fontFamily: "var(--font-mono)" }}>
                    {guide.placement}
                  </p>
                  <p className="text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                    File: {guide.filename}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-3 grid gap-2 md:grid-cols-3">
              {guide.tips.map((tip) => (
                <div key={tip} className="rounded-xl border border-[#1a2a4a] bg-[#04080f] p-3">
                  <p className="text-[10px] leading-relaxed text-[#8ab4d4]" style={{ fontFamily: "var(--font-mono)" }}>
                    {tip}
                  </p>
                </div>
              ))}
            </div>

            <CodeBlock code={guide.code} filename={guide.filename} />

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={downloadCode}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#a855f730] bg-[#a855f710] py-3 text-[11px] font-bold uppercase tracking-wider text-[#a855f7]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <Download className="h-3.5 w-3.5" /> Download {guide.filename.split(" ")[0]}
            </motion.button>

            <div className="mt-5 rounded-2xl border border-[#1a2a4a] bg-[#04080f] p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-[#a855f7]" style={{ fontFamily: "var(--font-mono)" }}>
                    AI setup assist
                  </p>
                  <p className="text-[11px] text-[#8ab4d4]" style={{ fontFamily: "var(--font-mono)" }}>
                    Share this prompt with ChatGPT, Claude, Cursor, Copilot, or any coding AI so it can place the SDK in the right files automatically.
                  </p>
                </div>
                <Sparkles className="h-4 w-4 flex-shrink-0 text-[#a855f7]" />
              </div>

              <CodeBlock code={aiPrompt} filename={`pulseiq-${activeTab}-ai-prompt.txt`} />

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={downloadPrompt}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#00e5ff30] bg-[#00e5ff10] py-3 text-[11px] font-bold uppercase tracking-wider text-[#00e5ff]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <Download className="h-3.5 w-3.5" /> Download AI Prompt
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={printGuide}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#10d99030] bg-[#10d99010] py-3 text-[11px] font-bold uppercase tracking-wider text-[#10d990]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <FileText className="h-3.5 w-3.5" /> Print PDF Guide
                </motion.button>
              </div>
            </div>
          </div>

          <div className="mt-2 border-t border-[#1a2a4a] px-5 py-5">
            <div className="mb-4 flex items-center gap-2">
              <Code2 className="h-4 w-4 text-[#00e5ff]" />
              <p className="text-xs font-black uppercase text-[#e8f4ff]" style={{ fontFamily: "var(--font-display)" }}>
                Verify SDK
              </p>
            </div>
            <div className="mb-4 grid gap-2 md:grid-cols-3">
              {[
                "Paste the snippet into the file/location shown above.",
                "Open or refresh your site/app so page_view fires automatically.",
                "Click verify below and PulseIQ will listen for incoming events.",
              ].map((step, index) => (
                <div key={step} className="rounded-xl border border-[#1a2a4a] bg-[#04080f] p-3">
                  <p className="mb-1 text-[9px] uppercase tracking-widest text-[#00e5ff]" style={{ fontFamily: "var(--font-mono)" }}>
                    Step {index + 1}
                  </p>
                  <p className="text-[10px] leading-relaxed text-[#8ab4d4]" style={{ fontFamily: "var(--font-mono)" }}>
                    {step}
                  </p>
                </div>
              ))}
            </div>

            {!verifyResult ? (
              <motion.button
                whileHover={{ scale: verifying ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={verifying ? stopVerify : startVerify}
                className="flex w-full items-center justify-center gap-3 rounded-2xl py-3.5 text-sm font-black uppercase tracking-widest"
                style={{
                  background: verifying ? "#1a2a4a" : "linear-gradient(135deg,#10d990,#00e5ff)",
                  color: verifying ? "#3d6080" : "#020408",
                  fontFamily: "var(--font-display)",
                }}
              >
                {verifying ? (
                  <>
                    <motion.div
                      className="h-4 w-4 rounded-full border-2 border-[#3d6080] border-t-[#10d990]"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                    />
                    Listening... ({pollCount * 5}s)
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" /> Verify installation
                  </>
                )}
              </motion.button>
            ) : null}

            <AnimatePresence>
              {verifyResult && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-2xl border p-4"
                  style={{
                    background: verifyResult.success ? "#10d99010" : "#f43f8e10",
                    borderColor: verifyResult.success ? "#10d99030" : "#f43f8e30",
                  }}
                >
                  <div className="mb-2 flex items-center gap-2">
                    {verifyResult.success ? (
                      <CheckCircle2 className="h-5 w-5 text-[#10d990]" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-[#f43f8e]" />
                    )}
                    <p
                      className="text-sm font-black"
                      style={{
                        color: verifyResult.success ? "#10d990" : "#f43f8e",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {verifyResult.success ? "Verified" : "Not verified yet"}
                    </p>
                  </div>
                  <p className="mb-3 text-[11px] text-[#8ab4d4]" style={{ fontFamily: "var(--font-mono)" }}>
                    {verifyResult.msg}
                  </p>
                  {verifyResult.success && verifyResult.event ? (
                    <div className="rounded-xl border border-[#10d99020] bg-[#04080f] p-2.5">
                      <p className="mb-0.5 text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                        Latest event
                      </p>
                      <p className="text-[11px] font-bold text-[#10d990]" style={{ fontFamily: "var(--font-mono)" }}>
                        "{verifyResult.event.name}" at{" "}
                        {verifyResult.event.time ? new Date(verifyResult.event.time).toLocaleTimeString() : "just now"}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setVerifyResult(null)}
                      className="mt-2 flex items-center gap-1.5 text-[10px] text-[#3d6080] transition-colors hover:text-[#00e5ff]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Try again
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
