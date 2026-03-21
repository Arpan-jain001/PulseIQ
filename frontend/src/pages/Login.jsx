import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Loader2, ShieldCheck, Zap } from "lucide-react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../hooks/useAuth.js";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL;

// ─── Constants ────────────────────────────────────────────────────────────────
const LOGIN_TIMEOUT_MS = 30_000; // 30s timeout

// ─── Toast ────────────────────────────────────────────────────────────────────
const SmsToast = ({ type = "info", message, onClose }) => {
  const badge = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
  const bar =
    type === "success"
      ? "bg-emerald-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500";

  return (
    <motion.div
      className="fixed z-[10000] bottom-5 right-5 w-[92%] max-w-sm"
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 280, damping: 20 }}
    >
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        <div className={`h-[3px] w-full ${bar}`} />
        <div className="px-4 py-3 flex gap-3 items-start">
          <div className="h-9 w-9 rounded-xl bg-[#6366f1] text-white flex items-center justify-center text-xs font-black shadow-sm flex-shrink-0">
            PI
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>{badge}</span>
              <span>PulseIQ</span>
            </div>
            <div className="text-sm text-slate-600 mt-0.5 leading-snug">{message}</div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors text-lg leading-none mt-0.5"
          >
            ×
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Login Loader ──────────────────────────────────────────────────────────────
const LoginLoader = ({ text = "Signing you in...", timeoutSec = 30, onTimeout }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed((p) => {
        if (p + 1 >= timeoutSec) {
          clearInterval(id);
          onTimeout?.();
        }
        return p + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timeoutSec, onTimeout]);

  const progress = Math.min((elapsed / timeoutSec) * 100, 100);

  return (
    <motion.div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-[92%] max-w-xs rounded-3xl bg-white shadow-2xl p-8 flex flex-col items-center border border-white/60"
        initial={{ y: 20, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 10, opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 240, damping: 20 }}
      >
        {/* Spinner */}
        <div className="relative h-16 w-16">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-[#6366f1]"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.85, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent border-b-purple-400"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="h-2.5 w-2.5 rounded-full bg-[#6366f1]"
              animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
            />
          </div>
        </div>

        <p className="mt-5 text-sm font-semibold text-slate-800 text-center">{text}</p>
        <p className="mt-1 text-xs text-slate-400 text-center">
          {elapsed < timeoutSec - 5
            ? "Please wait a moment…"
            : "Taking longer than usual…"}
        </p>

        {/* Progress bar */}
        <div className="mt-4 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "linear" }}
          />
        </div>
        <p className="mt-1.5 text-[10px] text-slate-300">{timeoutSec - elapsed}s</p>
      </motion.div>
    </motion.div>
  );
};

// ─── Success Overlay ───────────────────────────────────────────────────────────
const SuccessOverlay = () => (
  <motion.div
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 backdrop-blur-md"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="w-[92%] max-w-xs rounded-3xl bg-white shadow-2xl p-8 border border-white/60 text-center"
      initial={{ y: 20, opacity: 0, scale: 0.97 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 20 }}
    >
      <motion.div
        className="mx-auto h-16 w-16 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center"
        initial={{ scale: 0.8 }}
        animate={{ scale: [0.8, 1.1, 1] }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <motion.path
            d="M20 6L9 17l-5-5"
            stroke="#059669"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </svg>
      </motion.div>
      <h3 className="mt-4 text-lg font-black text-slate-900">Login Successful!</h3>
      <p className="mt-1 text-sm text-slate-500">Redirecting to your dashboard…</p>
      <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          className="h-full bg-emerald-500 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  </motion.div>
);

// ─── Main Login Component ──────────────────────────────────────────────────────
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Signing you in...");
  const [rememberMe, setRememberMe] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  // Refs for cleanup
  const abortControllerRef = useRef(null);
  const toastTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  // ── Cleanup on unmount ──────────────────────────────────────────────────────
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
      clearTimeout(toastTimerRef.current);
    };
  }, []);

  // ── Back button / tab-switch: reset loader ─────────────────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      // If user switches tab and comes back while loading (not success), reset
      if (document.visibilityState === "visible" && isLoading && !showSuccess) {
        // Give a small grace period — if still loading after coming back, reset
        const graceTimer = setTimeout(() => {
          if (isMountedRef.current && isLoading && !showSuccess) {
            abortControllerRef.current?.abort();
            setIsLoading(false);
            fireToast("info", "Login was interrupted. Please try again.");
          }
        }, 300);
        return () => clearTimeout(graceTimer);
      }
    };

    const handleBeforeUnload = () => {
      abortControllerRef.current?.abort();
    };

    const handlePopState = () => {
      // Back button pressed during loading
      if (isLoading && !showSuccess) {
        abortControllerRef.current?.abort();
        setIsLoading(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isLoading, showSuccess]);

  // ── Auto redirect if already logged in ────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    if (user.role === "SUPER_ADMIN") navigate("/admin-dashboard");
    else if (user.role === "ORGANIZER") navigate("/organizer-dashboard");
    else navigate("/dashboard");
  }, [user, navigate]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const fireToast = useCallback((type, message) => {
    if (!isMountedRef.current) return;
    setToast({ type, message });
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) setToast(null);
    }, 3000);
  }, []);

  const resetLoading = useCallback(() => {
    if (isMountedRef.current) setIsLoading(false);
  }, []);

  // Called when LoginLoader's countdown reaches 0
  const handleLoaderTimeout = useCallback(() => {
    abortControllerRef.current?.abort();
    resetLoading();
    fireToast("error", "⏱ Request timed out. Please check your connection and try again.");
  }, [resetLoading, fireToast]);

  const saveAuth = useCallback(
    (token, refreshToken, userData) => {
      const store = rememberMe ? localStorage : sessionStorage;
      store.setItem("isLoggedIn", "true");
      store.setItem("accessToken", token);
      store.setItem("refreshToken", refreshToken);
      store.setItem("user", JSON.stringify(userData));
      localStorage.setItem("isLoggedIn", "true");
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    },
    [rememberMe]
  );

  const successFlow = useCallback(
    async (userData) => {
      if (!isMountedRef.current) return;
      setIsLoading(false);
      setShowSuccess(true);
      fireToast("success", "Welcome back! ✅ Login successful.");
      await new Promise((r) => setTimeout(r, 1200));
      if (!isMountedRef.current) return;
      setShowSuccess(false);
      if (userData.role === "SUPER_ADMIN") navigate("/admin-dashboard");
      else if (userData.role === "ORGANIZER") navigate("/organizer-dashboard");
      else navigate("/dashboard");
    },
    [navigate, fireToast]
  );

  // ── Email/Password Submit ──────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || showSuccess) return;

    setError("");
    setIsLoading(true);
    setLoadingText("Signing you in...");

    // Create fresh AbortController
    abortControllerRef.current = new AbortController();

    try {
      const { data } = await axios.post(
        `${BASE_API_URL}/api/auth/login`,
        { email, password, role },
        {
          headers: { "Content-Type": "application/json" },
          signal: abortControllerRef.current.signal,
          timeout: LOGIN_TIMEOUT_MS,
        }
      );

      if (data.success) {
        saveAuth(data.accessToken, data.refreshToken, data.user);
        await successFlow(data.user);
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      // Aborted (timeout or back button) — already handled
      if (axios.isCancel(err) || err.name === "AbortError" || err.name === "CanceledError") {
        resetLoading();
        return;
      }

      // Axios timeout
      if (err.code === "ECONNABORTED" || err.code === "ERR_CANCELED") {
        resetLoading();
        fireToast("error", "⏱ Request timed out. Please try again.");
        return;
      }

      const msg = err.response?.data?.message;
      if (msg === "EMAIL_NOT_VERIFIED") {
        fireToast("error", "⚠️ Please verify your email before logging in.");
        navigate("/verify-email", { state: { email } });
      } else if (msg === "Your role is not correct for this account") {
        fireToast("error", "❌ Wrong role selected for this account.");
      } else {
        const errorMsg = msg || "Login failed. Please try again.";
        setError(errorMsg);
        fireToast("error", errorMsg);
      }
    } finally {
      // Always reset loading unless success flow is running
      if (isMountedRef.current && !showSuccess) {
        setIsLoading(false);
      }
    }
  };

  // ── Google Login ───────────────────────────────────────────────────────────
  const handleGoogleError = useCallback(() => {
    resetLoading();
    fireToast("error", "Google login was cancelled.");
  }, [resetLoading, fireToast]);

  const handleGoogleSuccess = useCallback(
    async (tokenResponse) => {
      if (!isMountedRef.current || showSuccess) return;

      abortControllerRef.current = new AbortController();

      try {
        const { data } = await axios.post(
          `${BASE_API_URL}/api/auth/google`,
          { code: tokenResponse.code },
          {
            signal: abortControllerRef.current.signal,
            timeout: LOGIN_TIMEOUT_MS,
          }
        );

        if (data.success) {
          saveAuth(data.accessToken, data.refreshToken, data.user);
          await successFlow(data.user);
        }
      } catch (err) {
        if (!isMountedRef.current) return;
        if (axios.isCancel(err) || err.name === "AbortError" || err.name === "CanceledError") {
          resetLoading();
          return;
        }
        if (err.code === "ECONNABORTED" || err.code === "ERR_CANCELED") {
          resetLoading();
          fireToast("error", "⏱ Google login timed out. Please try again.");
          return;
        }
        const msg = err.response?.data?.message || "Google login failed.";
        setError(msg);
        fireToast("error", msg);
        resetLoading();
      }
    },
    [showSuccess, saveAuth, successFlow, resetLoading, fireToast]
  );

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    flow: "auth-code",
  });

  const handleGoogleClick = useCallback(() => {
    if (isLoading || showSuccess) return;
    setIsLoading(true);
    setLoadingText("Connecting to Google...");
    googleLogin();
  }, [isLoading, showSuccess, googleLogin]);

  // ── Animation variants ─────────────────────────────────────────────────────
  const container = useMemo(
    () => ({
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { staggerChildren: 0.07 } },
    }),
    []
  );

  const item = useMemo(
    () => ({
      hidden: { opacity: 0, y: 18, scale: 0.99 },
      show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 230, damping: 20 },
      },
    }),
    []
  );

  const isDisabled = isLoading || showSuccess;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes gradientMove {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient { animation: gradientMove 7s ease infinite; }
        .noise {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E");
        }
        input:autofill, input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px #f8faff inset !important;
          -webkit-text-fill-color: #0f172a !important;
        }
      `}</style>

      <Navbar />

      {/* Overlays */}
      <AnimatePresence>
        {isLoading && !showSuccess && (
          <LoginLoader
            text={loadingText}
            timeoutSec={30}
            onTimeout={handleLoaderTimeout}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>{showSuccess && <SuccessOverlay />}</AnimatePresence>
      <AnimatePresence>
        {toast && (
          <SmsToast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Page */}
      <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden px-4 py-10">
        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,#e0f2fe_0%,transparent_45%),radial-gradient(circle_at_90%_15%,#e9d5ff_0%,transparent_45%),radial-gradient(circle_at_40%_90%,#dbeafe_0%,transparent_45%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]" />
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="noise absolute inset-0 opacity-[0.05] pointer-events-none" />

        <motion.div
          className="relative w-full max-w-5xl"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={item}
            className="grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-[0_32px_96px_rgba(2,6,23,0.14)] border border-white/70 bg-white/60 backdrop-blur-xl"
          >
            {/* ── LEFT PANEL ── */}
            <motion.div
              variants={item}
              className="relative overflow-hidden p-8 sm:p-10 bg-[radial-gradient(circle_at_20%_20%,#dbeafe_0%,transparent_50%),radial-gradient(circle_at_80%_10%,#cffafe_0%,transparent_40%),radial-gradient(circle_at_60%_90%,#e9d5ff_0%,transparent_45%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] border-b lg:border-b-0 lg:border-r border-white/70"
            >
              {/* Shine sweep */}
              <motion.div
                className="absolute -left-1/2 top-0 h-[220%] w-1/3 rotate-12 bg-white/50 blur-2xl pointer-events-none"
                animate={{ x: ["-30%", "155%"] }}
                transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              />
              <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />

              <div className="relative">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-7">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs border border-slate-200/80 text-slate-700 shadow-sm font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Secure Login · JWT Auth
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs border border-slate-200/80 text-slate-700 shadow-sm font-medium">
                    🔐 Google OAuth
                  </span>
                </div>

                {/* Headline */}
                <h2 className="text-3xl sm:text-[2.6rem] font-black leading-[1.1] bg-[linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4,#6366f1)] bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient">
                  Welcome back
                  <br />
                  to PulseIQ
                </h2>
                <p className="mt-3 text-slate-500 text-sm leading-relaxed max-w-xs">
                  Sign in securely with email/password or Google OAuth with role-based access control.
                </p>

                {/* Feature cards */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      icon: <ShieldCheck className="w-4 h-4 text-indigo-600" />,
                      title: "Secure",
                      desc: "JWT + refresh token rotation.",
                    },
                    {
                      icon: <Zap className="w-4 h-4 text-amber-500" />,
                      title: "Instant",
                      desc: "Email, Google, or role-based.",
                    },
                  ].map(({ icon, title, desc }) => (
                    <motion.div
                      key={title}
                      whileHover={{ y: -2 }}
                      className="rounded-2xl bg-white/80 border border-slate-200/80 p-4 shadow-[0_8px_24px_rgba(2,6,23,0.06)]"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {icon}
                        <p className="font-bold text-slate-900 text-sm">{title}</p>
                      </div>
                      <p className="text-xs text-slate-500 leading-snug">{desc}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Decorative pill */}
                <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-4 py-2 text-xs text-indigo-700 font-semibold shadow-sm">
                  🛡️ Protected by PulseIQ Shield™
                </div>
              </div>
            </motion.div>

            {/* ── RIGHT PANEL ── */}
            <motion.div variants={item} className="p-7 sm:p-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-7">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Sign In</h3>
                  <p className="text-sm text-slate-400 mt-0.5">Enter your credentials to continue.</p>
                </div>
                <span className="hidden sm:inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-semibold border border-indigo-100">
                  🔒 Protected
                </span>
              </div>

              {/* Error banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <span className="mt-0.5">❌</span>
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Role Toggle */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2.5">
                  Login as
                </label>
                <div className="flex bg-slate-100/70 border border-slate-200/70 rounded-2xl p-1 gap-1">
                  {["USER", "ORGANIZER", "SUPER_ADMIN"].map((r) => (
                    <motion.button
                      key={r}
                      onClick={() => setRole(r)}
                      className={`flex-1 py-2.5 px-2 text-[11px] font-bold rounded-xl transition-all tracking-wide ${
                        role === r
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                      whileTap={{ scale: 0.97 }}
                      disabled={isDisabled}
                    >
                      {r.replace("_", " ")}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Email */}
                <motion.div whileHover={{ y: -1 }}>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 transition-all text-sm shadow-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isDisabled}
                    autoComplete="email"
                  />
                </motion.div>

                {/* Password */}
                <motion.div whileHover={{ y: -1 }}>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 transition-all pr-12 text-sm shadow-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isDisabled}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-0.5"
                      disabled={isDisabled}
                      tabIndex={-1}
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 accent-indigo-600 w-4 h-4 cursor-pointer"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={isDisabled}
                    />
                    <span>Remember me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline transition-colors font-medium"
                    tabIndex={isDisabled ? -1 : 0}
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                  whileHover={{ scale: isDisabled ? 1 : 1.01 }}
                  type="submit"
                  disabled={isDisabled}
                  className="w-full py-3.5 mt-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white font-black rounded-full transition-all shadow-lg shadow-indigo-200/60 hover:shadow-xl hover:shadow-indigo-300/50 hover:brightness-105 flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none tracking-wide"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing In…
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-[11px] uppercase tracking-widest text-slate-400 font-semibold">
                    or continue with
                  </span>
                </div>
              </div>

              {/* Google Button */}
              <motion.button
                whileHover={{ scale: isDisabled ? 1 : 1.015 }}
                whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                onClick={handleGoogleClick}
                disabled={isDisabled}
                className="w-full group relative overflow-hidden rounded-2xl bg-white border-2 border-slate-200 p-3.5 flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:border-slate-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                ) : (
                  <div className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    <svg viewBox="0 0 48 48" className="w-full h-full">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.73 1.22 9.24 3.6l6.88-6.88C35.63 2.1 30.21 0 24 0 14.62 0 6.51 5.48 2.56 13.44l8.06 6.25C12.45 13.02 17.77 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.5 24c0-1.64-.15-3.22-.43-4.74H24v9h12.7c-.55 2.95-2.2 5.45-4.7 7.14l7.28 5.66C43.9 36.36 46.5 30.72 46.5 24z" />
                      <path fill="#FBBC05" d="M10.62 28.69A14.5 14.5 0 019.5 24c0-1.62.28-3.19.78-4.69l-8.06-6.25A23.98 23.98 0 000 24c0 3.87.93 7.52 2.56 10.56l8.06-6.25z" />
                      <path fill="#34A853" d="M24 48c6.21 0 11.42-2.05 15.23-5.56l-7.28-5.66c-2.02 1.36-4.6 2.17-7.95 2.17-6.23 0-11.55-3.52-13.38-8.69l-8.06 6.25C6.51 42.52 14.62 48 24 48z" />
                    </svg>
                  </div>
                )}
                <span className="font-bold text-slate-800 group-hover:text-slate-900 transition-colors text-sm">
                  {isLoading ? "Connecting…" : "Continue with Google"}
                </span>
                {/* Shine */}
                {!isLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -skew-x-12 -translate-x-full group-hover:translate-x-full transform" />
                )}
              </motion.button>

              {/* Sign up link */}
              <p className="text-sm text-slate-500 text-center mt-6">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-indigo-600 hover:text-indigo-800 hover:underline font-bold transition-colors"
                >
                  Sign up free
                </Link>
              </p>

              {/* Footer */}
              <div className="mt-7 pt-5 border-t border-slate-100 text-center">
                <p className="text-[11px] text-slate-400">
                  Protected by PulseIQ Shield™ — Enterprise Grade Security
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;