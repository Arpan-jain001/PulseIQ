import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  Download,
  AlertTriangle,
  X,
  Zap,
  CheckCircle2,
  RefreshCw,
  Terminal,
} from "lucide-react";
import {
  SDK_PLATFORMS,
  getSdkGuide,
  getEnvTemplate,
  getSdkQuickStartSteps,
  buildIngestEndpoint,
  getDownloadFilename,
} from "../../lib/sdkGuides";

const BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

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
      className="max-h-72 overflow-x-auto p-4 text-[10px] leading-relaxed"
      style={{ fontFamily: "var(--font-mono)", color: "#8ab4d4" }}
    >
      {code}
    </pre>
  </div>
);

const STEPS = [
  { n: 1, label: "Credentials" },
  { n: 2, label: "Install SDK" },
  { n: 3, label: "Verify" },
];

const ApiKeySetupModal = ({ apiKey, projectId, projectName, onClose, onVerified, verifySdk }) => {
  const [showKey, setShowKey] = useState(true);
  const [activeTab, setActiveTab] = useState("html");
  const [step, setStep] = useState(1);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [pollCount, setPollCount] = useState(0);
  const pollRef = useRef(null);

  const guide = getSdkGuide({
    platform: activeTab,
    apiKey,
    projectId,
    endpoint: BASE_URL,
  });

  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadEnv = () => {
    downloadFile(
      getEnvTemplate({ apiKey, projectId, endpoint: BASE_URL, projectName }),
      ".env.pulseiq"
    );
  };

  const downloadCode = () => {
    downloadFile(guide.code, getDownloadFilename(guide.filename));
  };

  const startVerify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    setPollCount(0);

    const check = async (count) => {
      try {
        const response = await verifySdk(projectId);
        if (response?.verified) {
          setVerifyResult({
            success: true,
            msg: "SDK verified. PulseIQ is now receiving events from your integration.",
            event: response.event,
          });
          setVerifying(false);
          onVerified?.();
          return;
        }

        if (count >= 12) {
          setVerifyResult({
            success: false,
            msg: "No events received yet. Paste the SDK, refresh the app, and try verification again.",
          });
          setVerifying(false);
          return;
        }

        setPollCount(count + 1);
        pollRef.current = setTimeout(() => check(count + 1), 5000);
      } catch {
        setVerifyResult({
          success: false,
          msg: "Verification failed. Please try again after refreshing your site/app.",
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

  const quickSteps = getSdkQuickStartSteps();

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-3 py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

      <motion.div
        className="relative flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl"
        style={{
          background: "linear-gradient(160deg,#0a0f1a 0%,#060d18 100%)",
          border: "1px solid #f59e0b33",
          boxShadow: "0 0 100px #f59e0b06, 0 24px 80px #00000099",
        }}
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        <div className="h-[3px] w-full flex-shrink-0" style={{ background: "linear-gradient(90deg,#f59e0b,#f43f8e,#a855f7,#00e5ff,#10d990)" }} />

        <div className="flex items-center justify-between border-b border-[#1a2a4a] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#f59e0b30] bg-[#f59e0b15]">
              <Key className="h-4.5 w-4.5 text-[#f59e0b]" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-[#e8f4ff]" style={{ fontFamily: "var(--font-display)" }}>
                SDK setup - {projectName}
              </h3>
              <div className="mt-0.5 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-[#f43f8e]" />
                <p className="text-[9px] text-[#f43f8e]" style={{ fontFamily: "var(--font-mono)" }}>
                  Save this API key now. It will not be shown again.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#1a2a4a] text-[#3d6080] transition-colors hover:text-[#e8f4ff]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-0 border-b border-[#1a2a4a] px-6 py-3">
          {STEPS.map((item, index) => (
            <div key={item.n} className="flex items-center">
              <button
                onClick={() => setStep(item.n)}
                className="flex items-center gap-2 rounded-xl px-3 py-1.5 transition-all"
                style={{ background: step === item.n ? "#00e5ff15" : "transparent" }}
              >
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black"
                  style={{
                    background: step === item.n ? "#00e5ff" : step > item.n ? "#10d990" : "#1a2a4a",
                    color: step >= item.n ? "#020408" : "#3d6080",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {step > item.n ? "OK" : item.n}
                </span>
                <span
                  className="hidden text-[10px] font-bold uppercase tracking-wider sm:block"
                  style={{
                    color: step === item.n ? "#00e5ff" : step > item.n ? "#10d990" : "#3d6080",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {item.label}
                </span>
              </button>
              {index < STEPS.length - 1 ? <div className="mx-1 h-px w-8 bg-[#1a2a4a]" /> : null}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#f59e0b22] bg-[#04080f] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#f59e0b]" style={{ fontFamily: "var(--font-mono)" }}>
                    API key
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowKey((value) => !value)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#1a2a4a] text-[#3d6080] transition-colors hover:text-[#8ab4d4]"
                    >
                      {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    <CopyBtn text={apiKey} label="Copy Key" />
                  </div>
                </div>
                <code
                  className="block break-all rounded-xl border border-[#1a2a4a] bg-[#060d18] px-3 py-2 text-[11px] leading-relaxed"
                  style={{ color: showKey ? "#10d990" : "#1a3a6b", fontFamily: "var(--font-mono)" }}
                >
                  {showKey ? apiKey : "•".repeat(Math.min(apiKey.length, 48))}
                </code>
              </div>

              {[
                { label: "Project ID", value: projectId, color: "#a855f7" },
                { label: "Ingest endpoint", value: buildIngestEndpoint(BASE_URL), color: "#00e5ff" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl border border-[#1a2a4a] bg-[#04080f] p-3">
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-[9px] uppercase tracking-widest" style={{ color, fontFamily: "var(--font-mono)" }}>
                      {label}
                    </p>
                    <code className="block truncate text-[11px] text-[#8ab4d4]" style={{ fontFamily: "var(--font-mono)" }}>
                      {value}
                    </code>
                  </div>
                  <CopyBtn text={value} />
                </div>
              ))}

              <div className="grid gap-4 md:grid-cols-3">
                {quickSteps.map((item, index) => (
                  <div key={item.id} className="rounded-xl border border-[#1a2a4a] bg-[#04080f] p-4">
                    <p className="mb-2 text-3xl font-black text-[#1a3a6b]" style={{ fontFamily: "var(--font-display)" }}>
                      0{index + 1}
                    </p>
                    <p className="mb-1 text-xs font-bold text-[#e8f4ff]">{item.title}</p>
                    <p className="text-[10px] leading-relaxed text-[#8ab4d4]" style={{ fontFamily: "var(--font-mono)" }}>
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={downloadEnv}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#10d99030] bg-[#10d99010] py-3 text-[11px] font-bold uppercase tracking-wider text-[#10d990]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <Download className="h-3.5 w-3.5" /> Download .env
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={downloadCode}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#00e5ff30] bg-[#00e5ff10] py-3 text-[11px] font-bold uppercase tracking-wider text-[#00e5ff]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <Download className="h-3.5 w-3.5" /> Download SDK
                </motion.button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {SDK_PLATFORMS.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setActiveTab(platform.id)}
                    className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-all"
                    style={{
                      borderColor: activeTab === platform.id ? "#00e5ff50" : "#1a2a4a",
                      background: activeTab === platform.id ? "#00e5ff15" : "transparent",
                      color: activeTab === platform.id ? "#00e5ff" : "#3d6080",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    <span className="rounded-full border border-current/20 px-1.5 py-0.5 text-[8px]">{platform.badge}</span>
                    {platform.label}
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-[#10d99020] bg-[#10d99008] p-3">
                <div className="flex items-start gap-3">
                  <Terminal className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#10d990]" />
                  <div>
                    <p className="text-[11px] font-bold text-[#10d990]" style={{ fontFamily: "var(--font-mono)" }}>
                      {guide.paste}
                    </p>
                    <p className="mt-1 text-[10px] text-[#8ab4d4]" style={{ fontFamily: "var(--font-mono)" }}>
                      {guide.placement}
                    </p>
                    <p className="mt-1 text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                      File: {guide.filename}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-3">
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
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#a855f730] bg-[#a855f710] py-3 text-[11px] font-bold uppercase tracking-wider text-[#a855f7]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <Download className="h-3.5 w-3.5" /> Download {guide.filename.split(" ")[0]}
              </motion.button>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#1a2a4a] bg-[#04080f] p-4">
                <p className="mb-3 text-[10px] uppercase tracking-widest text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                  Verification checklist
                </p>
                {[
                  "Paste the SDK code into the correct file shown in step 2.",
                  "Open the target website/app and refresh once so page_view is sent.",
                  "If login exists, optionally call identify after login success.",
                  "Click verify below and wait for PulseIQ to detect the first event.",
                ].map((item, index) => (
                  <div key={item} className="mb-2.5 flex items-start gap-3 last:mb-0">
                    <span
                      className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-black text-[#020408]"
                      style={{
                        background: ["#f59e0b", "#00e5ff", "#a855f7", "#10d990"][index],
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {index + 1}
                    </span>
                    <p className="text-[11px] leading-relaxed text-[#8ab4d4]" style={{ fontFamily: "var(--font-mono)" }}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              {!verifyResult ? (
                <motion.button
                  whileHover={{ scale: verifying ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={verifying ? stopVerify : startVerify}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-sm font-black uppercase tracking-widest transition-all"
                  style={{
                    background: verifying ? "#1a2a4a" : "linear-gradient(135deg,#00e5ff,#10d990)",
                    color: verifying ? "#3d6080" : "#020408",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {verifying ? (
                    <>
                      <motion.div
                        className="h-5 w-5 rounded-full border-2 border-[#3d6080] border-t-[#00e5ff]"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                      />
                      Listening for events... ({pollCount * 5}s)
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" /> Verify SDK installation
                    </>
                  )}
                </motion.button>
              ) : null}

              <AnimatePresence>
                {verifyResult ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border p-5"
                    style={{
                      background: verifyResult.success ? "#10d99010" : "#f43f8e10",
                      borderColor: verifyResult.success ? "#10d99030" : "#f43f8e30",
                    }}
                  >
                    <div className="mb-2 flex items-center gap-3">
                      {verifyResult.success ? (
                        <CheckCircle2 className="h-6 w-6 text-[#10d990]" />
                      ) : (
                        <AlertTriangle className="h-6 w-6 text-[#f43f8e]" />
                      )}
                      <p
                        className="text-sm font-black"
                        style={{
                          color: verifyResult.success ? "#10d990" : "#f43f8e",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {verifyResult.success ? "Verified" : "Not yet"}
                      </p>
                    </div>
                    <p className="mb-3 text-[11px] text-[#8ab4d4]" style={{ fontFamily: "var(--font-mono)" }}>
                      {verifyResult.msg}
                    </p>
                    {verifyResult.success && verifyResult.event ? (
                      <div className="rounded-xl border border-[#10d99020] bg-[#04080f] p-2.5">
                        <p className="mb-1 text-[10px] text-[#3d6080]" style={{ fontFamily: "var(--font-mono)" }}>
                          Latest event received
                        </p>
                        <p className="text-[11px] font-bold text-[#10d990]" style={{ fontFamily: "var(--font-mono)" }}>
                          "{verifyResult.event.name}" at{" "}
                          {verifyResult.event.time ? new Date(verifyResult.event.time).toLocaleTimeString() : "just now"}
                        </p>
                      </div>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setVerifyResult(null)}
                        className="flex items-center gap-2 text-[10px] text-[#3d6080] transition-colors hover:text-[#00e5ff]"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Try again
                      </motion.button>
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#1a2a4a] px-6 py-4">
          <button
            onClick={() => (step > 1 ? setStep((value) => value - 1) : null)}
            disabled={step === 1}
            className="rounded-xl border border-[#1a2a4a] px-4 py-2.5 text-xs uppercase tracking-widest text-[#3d6080] transition-colors hover:text-[#8ab4d4] disabled:opacity-30"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Back
          </button>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((value) => (
              <div
                key={value}
                className="h-2 w-2 rounded-full transition-all"
                style={{ background: step === value ? "#00e5ff" : step > value ? "#10d990" : "#1a2a4a" }}
              />
            ))}
          </div>

          {step < 3 ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep((value) => value + 1)}
              className="rounded-xl bg-[#00e5ff] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-[#020408]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Next
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-[#020408]"
              style={{ background: verifyResult?.success ? "#10d990" : "#3d6080", fontFamily: "var(--font-mono)" }}
            >
              {verifyResult?.success ? "Open analytics" : "Close"}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ApiKeySetupModal;
