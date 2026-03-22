import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Loader2, ShieldCheck, Zap, Sparkles } from "lucide-react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../hooks/useAuth.js";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL;
const LOGIN_TIMEOUT_MS = 30_000;

/* ── Toast ──────────────────────────────────────────── */
const SmsToast = ({ type = "info", message, onClose }) => {
  const badge = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
  const colors = {
    success: { bar: "bg-emerald-400", icon: "bg-emerald-50 border-emerald-200 text-emerald-600" },
    error:   { bar: "bg-rose-400",    icon: "bg-rose-50 border-rose-200 text-rose-600" },
    info:    { bar: "bg-violet-400",  icon: "bg-violet-50 border-violet-200 text-violet-600" },
  }[type] || { bar: "bg-violet-400", icon: "bg-violet-50 border-violet-200 text-violet-600" };

  return (
    <motion.div
      className="fixed z-[10000] bottom-6 right-6 w-[92%] max-w-sm"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <div className="rounded-2xl bg-white shadow-[0_8px_40px_rgba(0,0,0,0.12)] overflow-hidden border border-slate-100">
        <div className={`h-[3px] w-full ${colors.bar}`} />
        <div className="px-4 py-3.5 flex gap-3 items-start">
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-sm flex-shrink-0 font-bold ${colors.icon}`}>
            {badge}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-sm font-bold text-slate-900">PulseIQ</p>
            <p className="text-sm text-slate-500 mt-0.5 leading-snug">{message}</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors text-xl leading-none mt-0.5">×</button>
        </div>
      </div>
    </motion.div>
  );
};

/* ── Loader ─────────────────────────────────────────── */
const LoginLoader = ({ text = "Signing you in...", timeoutSec = 30, onTimeout }) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setElapsed((p) => {
        if (p + 1 >= timeoutSec) { clearInterval(id); onTimeout?.(); }
        return p + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timeoutSec, onTimeout]);

  return (
    <motion.div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="w-[92%] max-w-xs rounded-3xl bg-white shadow-2xl p-8 flex flex-col items-center"
        initial={{ y: 24, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 10, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      >
        <div className="relative w-16 h-16 mb-5">
          <motion.div className="absolute inset-0 rounded-full border-[3px] border-slate-100 border-t-violet-500"
            animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
          <motion.div className="absolute inset-[5px] rounded-full border-[3px] border-transparent border-b-indigo-400"
            animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div className="w-2.5 h-2.5 rounded-full bg-violet-500"
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }} />
          </div>
        </div>
        <p className="text-sm font-bold text-slate-800 text-center">{text}</p>
        <p className="mt-1 text-xs text-slate-400 text-center">
          {elapsed < timeoutSec - 5 ? "Please wait a moment…" : "Taking longer than usual…"}
        </p>
        <div className="mt-4 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
            style={{ width: `${Math.min((elapsed / timeoutSec) * 100, 100)}%` }}
            transition={{ duration: 0.4, ease: "linear" }} />
        </div>
        <p className="mt-1.5 text-[10px] text-slate-300">{timeoutSec - elapsed}s</p>
      </motion.div>
    </motion.div>
  );
};

/* ── Success Overlay ────────────────────────────────── */
const SuccessOverlay = () => (
  <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.div
      className="w-[92%] max-w-xs rounded-3xl bg-white shadow-2xl p-8 text-center"
      initial={{ y: 24, opacity: 0, scale: 0.96 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <motion.div
        className="w-16 h-16 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-4"
        initial={{ scale: 0.7 }} animate={{ scale: [0.7, 1.15, 1] }} transition={{ duration: 0.5 }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <motion.path d="M20 6L9 17l-5-5" stroke="#059669" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4 }} />
        </svg>
      </motion.div>
      <h3 className="text-lg font-black text-slate-900">Welcome back! 🎉</h3>
      <p className="text-sm text-slate-400 mt-1">Redirecting to your dashboard…</p>
      <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <motion.div className="h-full bg-emerald-500 rounded-full"
          initial={{ width: "0%" }} animate={{ width: "100%" }}
          transition={{ duration: 1.1, ease: "easeInOut" }} />
      </div>
    </motion.div>
  </motion.div>
);

/* ── Main Login ─────────────────────────────────────── */
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
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();
  const { user } = useAuth();
  const abortControllerRef = useRef(null);
  const toastTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
      clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isLoading && !showSuccess) {
        const t = setTimeout(() => {
          if (isMountedRef.current && isLoading && !showSuccess) {
            abortControllerRef.current?.abort();
            setIsLoading(false);
            fireToast("info", "Login interrupted. Please try again.");
          }
        }, 300);
        return () => clearTimeout(t);
      }
    };
    const handlePopState = () => {
      if (isLoading && !showSuccess) { abortControllerRef.current?.abort(); setIsLoading(false); }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", () => abortControllerRef.current?.abort());
    window.addEventListener("popstate", handlePopState);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isLoading, showSuccess]);

  useEffect(() => {
    if (!user) return;
    if (user.role === "SUPER_ADMIN") navigate("/admin-dashboard");
    else if (user.role === "ORGANIZER") navigate("/organizer-dashboard");
    else navigate("/dashboard");
  }, [user, navigate]);

  const fireToast = useCallback((type, message) => {
    if (!isMountedRef.current) return;
    setToast({ type, message });
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => { if (isMountedRef.current) setToast(null); }, 3500);
  }, []);

  const resetLoading = useCallback(() => { if (isMountedRef.current) setIsLoading(false); }, []);

  const handleLoaderTimeout = useCallback(() => {
    abortControllerRef.current?.abort();
    resetLoading();
    fireToast("error", "⏱ Request timed out. Check your connection.");
  }, [resetLoading, fireToast]);

  const saveAuth = useCallback((token, refreshToken) => {
    // ✅ Sirf tokens save karo — user data hamesha DB se aayega (useAuth)
    localStorage.setItem("accessToken", token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("isLoggedIn", "true");
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }, []);

  const successFlow = useCallback(async (userData) => {
    if (!isMountedRef.current) return;
    setIsLoading(false);
    setShowSuccess(true);
    fireToast("success", "Welcome back! Login successful.");
    await new Promise((r) => setTimeout(r, 1300));
    if (!isMountedRef.current) return;
    setShowSuccess(false);
    if (userData.role === "SUPER_ADMIN") navigate("/admin-dashboard");
    else if (userData.role === "ORGANIZER") navigate("/organizer-dashboard");
    else navigate("/dashboard");
  }, [navigate, fireToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || showSuccess) return;
    setError("");
    setIsLoading(true);
    setLoadingText("Signing you in...");
    abortControllerRef.current = new AbortController();
    try {
      const { data } = await axios.post(`${BASE_API_URL}/api/auth/login`,
        { email, password, role },
        { headers: { "Content-Type": "application/json" }, signal: abortControllerRef.current.signal, timeout: LOGIN_TIMEOUT_MS }
      );
      if (data.success) { saveAuth(data.accessToken, data.refreshToken); await successFlow(data.user); }
    } catch (err) {
      if (!isMountedRef.current) return;
      if (axios.isCancel(err) || err.name === "AbortError" || err.name === "CanceledError") { resetLoading(); return; }
      if (err.code === "ECONNABORTED" || err.code === "ERR_CANCELED") { resetLoading(); fireToast("error", "⏱ Request timed out."); return; }
      const msg = err.response?.data?.message;
      if (msg === "EMAIL_NOT_VERIFIED") { fireToast("error", "⚠️ Please verify your email first."); navigate("/verify-email", { state: { email } }); }
      else if (msg?.includes("role")) { fireToast("error", "❌ Wrong role selected."); }
      else { const m = msg || "Login failed. Please try again."; setError(m); fireToast("error", m); }
    } finally {
      if (isMountedRef.current && !showSuccess) setIsLoading(false);
    }
  };

  const handleGoogleError = useCallback(() => { resetLoading(); fireToast("error", "Google login cancelled."); }, [resetLoading, fireToast]);

  const handleGoogleSuccess = useCallback(async (tokenResponse) => {
    if (!isMountedRef.current || showSuccess) return;
    abortControllerRef.current = new AbortController();
    try {
      const { data } = await axios.post(`${BASE_API_URL}/api/auth/google`,
        { code: tokenResponse.code },
        { signal: abortControllerRef.current.signal, timeout: LOGIN_TIMEOUT_MS }
      );
      if (data.success) { saveAuth(data.accessToken, data.refreshToken); await successFlow(data.user); }
    } catch (err) {
      if (!isMountedRef.current) return;
      if (axios.isCancel(err) || err.name === "AbortError" || err.name === "CanceledError") { resetLoading(); return; }
      const msg = err.response?.data?.message || "Google login failed.";
      setError(msg); fireToast("error", msg); resetLoading();
    }
  }, [showSuccess, saveAuth, successFlow, resetLoading, fireToast]);

  const googleLogin = useGoogleLogin({ onSuccess: handleGoogleSuccess, onError: handleGoogleError, flow: "auth-code" });

  const handleGoogleClick = useCallback(() => {
    if (isLoading || showSuccess) return;
    setIsLoading(true);
    setLoadingText("Connecting to Google...");
    googleLogin();
  }, [isLoading, showSuccess, googleLogin]);

  const container = useMemo(() => ({
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  }), []);

  const item = useMemo(() => ({
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 220, damping: 20 } },
  }), []);

  const isDisabled = isLoading || showSuccess;

  const ROLES = [
    { id: "USER",        label: "User",      active: "bg-violet-600 text-white shadow-lg shadow-violet-200" },
    { id: "ORGANIZER",   label: "Organizer", active: "bg-indigo-600 text-white shadow-lg shadow-indigo-200" },
    { id: "SUPER_ADMIN", label: "Admin",     active: "bg-slate-800 text-white shadow-lg shadow-slate-200" },
  ];

  return (
    <>
      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-text {
          background: linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4, #6366f1);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: gradientShift 6s ease infinite;
        }
        .noise-bg {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='.3'/%3E%3C/svg%3E");
        }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px #f8faff inset !important;
          -webkit-text-fill-color: #0f172a !important;
        }
        .input-field { transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s; }
        .input-field:focus { transform: translateY(-1px); }
      `}</style>

      <Navbar />

      <AnimatePresence>
        {isLoading && !showSuccess && <LoginLoader text={loadingText} timeoutSec={30} onTimeout={handleLoaderTimeout} />}
      </AnimatePresence>
      <AnimatePresence>{showSuccess && <SuccessOverlay />}</AnimatePresence>
      <AnimatePresence>
        {toast && <SmsToast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-10 pt-28">

        {/* ✅ Pehla wala background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,#e0f2fe_0%,transparent_45%),radial-gradient(circle_at_90%_15%,#e9d5ff_0%,transparent_45%),radial-gradient(circle_at_40%_90%,#dbeafe_0%,transparent_45%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]" />
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="noise-bg absolute inset-0 opacity-[0.05] pointer-events-none" />

        <motion.div
          className="relative w-full max-w-5xl"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={item}
            className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] rounded-3xl overflow-hidden border border-white/80 bg-white/60 backdrop-blur-2xl"
            style={{ boxShadow: "0 32px_100px rgba(99,102,241,0.12), 0 8px 32px rgba(0,0,0,0.08)" }}
          >

            {/* ── LEFT PANEL ── */}
            <motion.div
              variants={item}
              className="relative overflow-hidden p-9 sm:p-11 bg-[radial-gradient(circle_at_20%_20%,#dbeafe_0%,transparent_50%),radial-gradient(circle_at_80%_10%,#cffafe_0%,transparent_40%),radial-gradient(circle_at_60%_90%,#e9d5ff_0%,transparent_45%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] border-b lg:border-b-0 lg:border-r border-white/70"
            >
              {/* Shine sweep */}
              <motion.div
                className="absolute -left-1/2 top-0 h-[200%] w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/60 to-transparent blur-2xl pointer-events-none"
                animate={{ x: ["-40%", "180%"] }}
                transition={{ repeat: Infinity, duration: 9, ease: "easeInOut", repeatDelay: 1 }}
              />
              <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />

              <div className="relative z-10">
                {/* Badges */}
                <motion.div className="flex flex-wrap items-center gap-2 mb-7"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-1.5 text-xs border border-slate-200/80 text-slate-600 shadow-sm font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Secure Login · JWT Auth
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3.5 py-1.5 text-xs border border-slate-200/80 text-slate-600 shadow-sm font-semibold">
                    🔐 Google OAuth 2.0
                  </span>
                </motion.div>

                {/* Headline */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                  <h2 className="text-4xl sm:text-5xl font-black leading-[1.05] mb-4 animate-gradient-text">
                    Welcome<br />back
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                    Sign in securely with email/password or Google OAuth. Role-based access control keeps your workspace safe.
                  </p>
                </motion.div>

                {/* Feature cards */}
                <motion.div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                  {[
                    { icon: <ShieldCheck className="w-4 h-4 text-violet-500" />, bg: "bg-violet-50 border-violet-100", title: "Bank-grade Security", desc: "JWT + refresh token rotation" },
                    { icon: <Zap className="w-4 h-4 text-amber-500" />,          bg: "bg-amber-50 border-amber-100",   title: "Instant Access",     desc: "Email, Google, or role-based" },
                    { icon: <Sparkles className="w-4 h-4 text-indigo-500" />,    bg: "bg-indigo-50 border-indigo-100", title: "AI-Powered",         desc: "Smart analytics dashboard" },
                  ].map(({ icon, bg, title, desc }, i) => (
                    <motion.div key={title}
                      whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}
                      className={`rounded-2xl ${bg} border p-4 transition-all duration-300 ${i === 2 ? "sm:col-span-2" : ""}`}>
                      <div className="flex items-center gap-2 mb-1">{icon}<p className="font-bold text-slate-800 text-xs">{title}</p></div>
                      <p className="text-xs text-slate-500">{desc}</p>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Bottom pill */}
                <motion.div
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-xs text-white font-semibold shadow-lg shadow-violet-200"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
                  🛡️ Protected by PulseIQ Shield™
                </motion.div>
              </div>
            </motion.div>

            {/* ── RIGHT PANEL ── */}
            <motion.div variants={item} className="p-8 sm:p-10 bg-white/50">

              {/* Header */}
              <div className="flex items-start justify-between mb-7">
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Sign In</h3>
                  <p className="text-sm text-slate-400 mt-0.5">Enter your credentials to continue.</p>
                </motion.div>
                <motion.span
                  className="hidden sm:inline-flex items-center rounded-full bg-gradient-to-r from-violet-50 to-indigo-50 text-violet-700 px-3 py-1.5 text-[11px] font-bold border border-violet-100"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
                  🔒 Protected
                </motion.span>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 flex items-start gap-2.5"
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}>
                    <span className="text-red-500 mt-0.5 text-sm">❌</span>
                    <span className="text-sm text-red-600 font-medium">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Role selector */}
              <motion.div className="mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Login as</label>
                <div className="flex bg-slate-100/70 border border-slate-200/70 rounded-2xl p-1 gap-1">
                  {ROLES.map(({ id, label, active }) => (
                    <motion.button key={id} onClick={() => setRole(id)} disabled={isDisabled} whileTap={{ scale: 0.96 }}
                      className={`flex-1 py-2.5 text-[11px] font-bold rounded-xl transition-all duration-200 tracking-wide ${role === id ? active : "text-slate-400 hover:text-slate-700 hover:bg-white"}`}>
                      {label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Form */}
              <motion.form onSubmit={handleSubmit} className="space-y-4" noValidate
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Email</label>
                  <input type="email" placeholder="you@company.com"
                    className="input-field w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 text-sm shadow-sm"
                    value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)}
                    required disabled={isDisabled} autoComplete="email" />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Password</label>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} placeholder="••••••••"
                      className="input-field w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all pr-12 text-sm shadow-sm"
                      value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }}
                      onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)}
                      required disabled={isDisabled} autoComplete="current-password" />
                    <button type="button" onClick={() => setShowPass((p) => !p)} disabled={isDisabled} tabIndex={-1}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors p-0.5">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer select-none">
                    <input type="checkbox" className="rounded border-slate-300 accent-violet-600 w-4 h-4"
                      checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} disabled={isDisabled} />
                    Remember me
                  </label>
                  <Link to="/forgot-password"
                    className="text-sm text-violet-600 hover:text-violet-800 font-semibold transition-colors hover:underline"
                    tabIndex={isDisabled ? -1 : 0}>
                    Forgot password?
                  </Link>
                </div>

                {/* Submit */}
                <motion.button
                  whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                  whileHover={{ scale: isDisabled ? 1 : 1.01, boxShadow: isDisabled ? "none" : "0 8px 30px rgba(99,102,241,0.35)" }}
                  type="submit" disabled={isDisabled}
                  className="w-full py-3.5 mt-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white font-black rounded-2xl transition-all shadow-lg shadow-violet-200/60 flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none tracking-wide overflow-hidden relative"
                >
                  {!isDisabled && (
                    <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                      initial={{ x: "-100%" }} whileHover={{ x: "200%" }} transition={{ duration: 0.6 }} />
                  )}
                  <span className="relative flex items-center gap-2">
                    {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing In…</> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                  </span>
                </motion.button>
              </motion.form>

              {/* Divider */}
              <motion.div className="relative my-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-[11px] uppercase tracking-widest text-slate-400 font-semibold">or continue with</span>
                </div>
              </motion.div>

              {/* Google */}
              <motion.button
                whileHover={{ scale: isDisabled ? 1 : 1.01, borderColor: "#c7d2fe", boxShadow: "0 4px 20px rgba(99,102,241,0.1)" }}
                whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                onClick={handleGoogleClick} disabled={isDisabled}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                className="w-full group relative overflow-hidden rounded-2xl bg-white border-2 border-slate-200 py-3.5 flex items-center justify-center gap-3 shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <motion.div className="absolute inset-0 bg-gradient-to-r from-violet-50/0 via-violet-50/50 to-indigo-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                ) : (
                  <motion.div className="w-5 h-5 flex-shrink-0" whileHover={{ scale: 1.1 }}>
                    <svg viewBox="0 0 48 48" className="w-full h-full">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.73 1.22 9.24 3.6l6.88-6.88C35.63 2.1 30.21 0 24 0 14.62 0 6.51 5.48 2.56 13.44l8.06 6.25C12.45 13.02 17.77 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.5 24c0-1.64-.15-3.22-.43-4.74H24v9h12.7c-.55 2.95-2.2 5.45-4.7 7.14l7.28 5.66C43.9 36.36 46.5 30.72 46.5 24z" />
                      <path fill="#FBBC05" d="M10.62 28.69A14.5 14.5 0 019.5 24c0-1.62.28-3.19.78-4.69l-8.06-6.25A23.98 23.98 0 000 24c0 3.87.93 7.52 2.56 10.56l8.06-6.25z" />
                      <path fill="#34A853" d="M24 48c6.21 0 11.42-2.05 15.23-5.56l-7.28-5.66c-2.02 1.36-4.6 2.17-7.95 2.17-6.23 0-11.55-3.52-13.38-8.69l-8.06 6.25C6.51 42.52 14.62 48 24 48z" />
                    </svg>
                  </motion.div>
                )}
                <span className="relative font-bold text-slate-700 group-hover:text-slate-900 transition-colors text-sm">
                  {isLoading ? "Connecting…" : "Continue with Google"}
                </span>
              </motion.button>

              {/* Signup */}
              <motion.p className="text-sm text-slate-500 text-center mt-6"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                Don't have an account?{" "}
                <Link to="/signup" className="text-violet-600 hover:text-violet-800 font-bold transition-colors hover:underline">
                  Sign up free →
                </Link>
              </motion.p>

              {/* Footer */}
              <motion.div className="mt-6 pt-5 border-t border-slate-100 text-center"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>
                <p className="text-[11px] text-slate-400">Protected by PulseIQ Shield™ — Enterprise Grade Security</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;   