import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, User, Building2, Zap, ShieldCheck } from "lucide-react";
import axios from "axios";
import Navbar from "../components/Navbar";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL;

const SIGNUP_TIMEOUT_MS = 30_000;

// ─── Toast ────────────────────────────────────────────────────────────────────
const SmsToast = ({ type = "info", message, onClose }) => {
  const badge = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
  const bar =
    type === "success" ? "bg-emerald-500" : type === "error" ? "bg-red-500" : "bg-blue-500";

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

// ─── Signup Loader ────────────────────────────────────────────────────────────
const SignupLoader = ({ text = "Creating your account...", timeoutSec = 30, onTimeout }) => {
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

        <p className="mt-5 text-sm font-bold text-slate-800 text-center">{text}</p>
        <p className="mt-1 text-xs text-slate-400 text-center">
          {elapsed < timeoutSec - 5 ? "Please wait a moment…" : "Almost there…"}
        </p>

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

// ─── Success Overlay ──────────────────────────────────────────────────────────
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
      <h3 className="mt-4 text-lg font-black text-slate-900">Account Created! 🎉</h3>
      <p className="mt-1 text-sm text-slate-500">Redirecting to verify your email…</p>
      <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          className="h-full bg-emerald-500 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  </motion.div>
);

// ─── Password Strength Indicator ──────────────────────────────────────────────
const PasswordStrength = ({ password }) => {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /\d/.test(password) },
    { label: "Special char", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const strength = score <= 1 ? "Weak" : score === 2 ? "Fair" : score === 3 ? "Good" : "Strong";
  const colors = ["bg-red-400", "bg-orange-400", "bg-amber-400", "bg-emerald-500"];
  const textColors = ["text-red-500", "text-orange-500", "text-amber-500", "text-emerald-600"];

  if (!password) return null;

  return (
    <motion.div
      className="mt-2"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex gap-1 mb-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${i < score ? colors[score - 1] : ""}`}
              initial={{ width: "0%" }}
              animate={{ width: i < score ? "100%" : "0%" }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-bold ${textColors[score - 1] || "text-slate-400"}`}>
          {strength}
        </span>
        <div className="flex gap-2">
          {checks.map(({ label, pass }) => (
            <span
              key={label}
              className={`text-[10px] transition-colors ${pass ? "text-emerald-600" : "text-slate-300"}`}
            >
              {pass ? "✓" : "·"} {label}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Signup Component ────────────────────────────────────────────────────
const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    password: "",
  });
  const [role, setRole] = useState("USER");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loadingText, setLoadingText] = useState("Creating your account...");

  const navigate = useNavigate();
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
      if (document.visibilityState === "visible" && isSubmitting && !showSuccess) {
        const graceTimer = setTimeout(() => {
          if (isMountedRef.current && isSubmitting && !showSuccess) {
            abortControllerRef.current?.abort();
            setIsSubmitting(false);
            fireToast("info", "Signup was interrupted. Please try again.");
          }
        }, 300);
        return () => clearTimeout(graceTimer);
      }
    };

    const handleBeforeUnload = () => abortControllerRef.current?.abort();

    const handlePopState = () => {
      if (isSubmitting && !showSuccess) {
        abortControllerRef.current?.abort();
        setIsSubmitting(false);
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
  }, [isSubmitting, showSuccess]);

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
    if (isMountedRef.current) setIsSubmitting(false);
  }, []);

  const handleLoaderTimeout = useCallback(() => {
    abortControllerRef.current?.abort();
    resetLoading();
    fireToast("error", "⏱ Request timed out. Please check your connection and try again.");
  }, [resetLoading, fireToast]);

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }, []);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || showSuccess) return;

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("Please enter your full name.");
      fireToast("error", "First and last name are required.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      fireToast("error", "Password must be at least 8 characters.");
      return;
    }
    if (role === "ORGANIZER" && !formData.companyName.trim()) {
      setError("Company name is required for organizers.");
      fireToast("error", "Please enter your company name.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    setLoadingText("Creating your account...");

    abortControllerRef.current = new AbortController();

    try {
      const payload = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.toLowerCase(),
        password: formData.password,
        role,
        companyName: formData.companyName.trim() || null,
      };

      const { data } = await axios.post(
        `${BASE_API_URL}/api/auth/register`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
          signal: abortControllerRef.current.signal,
          timeout: SIGNUP_TIMEOUT_MS,
        }
      );

      if (data.success) {
        if (!isMountedRef.current) return;
        setIsSubmitting(false);
        setShowSuccess(true);
        fireToast("success", "Account created successfully! 🎉");

        if (data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        setTimeout(() => {
          if (!isMountedRef.current) return;
          setShowSuccess(false);
          navigate("/verify-email", { state: { email: formData.email } });
        }, 1500);
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      if (axios.isCancel(err) || err.name === "AbortError" || err.name === "CanceledError") {
        resetLoading();
        return;
      }
      if (err.code === "ECONNABORTED" || err.code === "ERR_CANCELED") {
        resetLoading();
        fireToast("error", "⏱ Request timed out. Please try again.");
        return;
      }

      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      setError(msg);
      fireToast("error", msg);
      resetLoading();
    }
  };

  // ── Animations ─────────────────────────────────────────────────────────────
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

  const isDisabled = isSubmitting || showSuccess;

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

      <AnimatePresence>
        {isSubmitting && !showSuccess && (
          <SignupLoader text={loadingText} timeoutSec={30} onTimeout={handleLoaderTimeout} />
        )}
      </AnimatePresence>
      <AnimatePresence>{showSuccess && <SuccessOverlay />}</AnimatePresence>
      <AnimatePresence>
        {toast && (
          <SmsToast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>

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
            {/* ── LEFT PANEL - FORM ── */}
            <motion.div variants={item} className="p-7 sm:p-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-7">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Create Account</h3>
                  <p className="text-sm text-slate-400 mt-0.5">Start your free trial today</p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-bold border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Free Trial
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

              {/* Role Selection */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2.5">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "USER", label: "Personal", icon: <User className="w-4 h-4" />, desc: "Individual use" },
                    { value: "ORGANIZER", label: "Team / Org", icon: <Building2 className="w-4 h-4" />, desc: "For organizations" },
                  ].map(({ value, label, icon, desc }) => (
                    <motion.button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      whileTap={{ scale: 0.97 }}
                      disabled={isDisabled}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left ${
                        role === value
                          ? "border-indigo-500 bg-indigo-50 shadow-sm shadow-indigo-100"
                          : "border-slate-200 bg-white/60 hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl transition-colors ${
                          role === value ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {icon}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${role === value ? "text-indigo-700" : "text-slate-700"}`}>
                          {label}
                        </p>
                        <p className="text-[11px] text-slate-400">{desc}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: "firstName", label: "First Name", placeholder: "Arpan" },
                    { name: "lastName", label: "Last Name", placeholder: "Jain" },
                  ].map(({ name, label, placeholder }) => (
                    <motion.div key={name} whileHover={{ y: -1 }}>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                        {label}
                      </label>
                      <input
                        type="text"
                        name={name}
                        placeholder={placeholder}
                        className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 transition-all text-sm shadow-sm"
                        value={formData[name]}
                        onChange={handleChange}
                        required
                        disabled={isDisabled}
                        autoComplete={name === "firstName" ? "given-name" : "family-name"}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Company Name — animated in/out for ORGANIZER */}
                <AnimatePresence>
                  {role === "ORGANIZER" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                        Company Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        placeholder="Your Company"
                        className="w-full bg-white/90 border border-indigo-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 transition-all text-sm shadow-sm"
                        value={formData.companyName}
                        onChange={handleChange}
                        disabled={isDisabled}
                        autoComplete="organization"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Optional company for USER */}
                {role === "USER" && (
                  <motion.div whileHover={{ y: -1 }}>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Company <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      placeholder="Your company"
                      className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 transition-all text-sm shadow-sm"
                      value={formData.companyName}
                      onChange={handleChange}
                      disabled={isDisabled}
                      autoComplete="organization"
                    />
                  </motion.div>
                )}

                {/* Email */}
                <motion.div whileHover={{ y: -1 }}>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                    Work Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@company.com"
                    className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 transition-all text-sm shadow-sm"
                    value={formData.email}
                    onChange={handleChange}
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
                      name="password"
                      placeholder="Min 8 characters"
                      className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 transition-all pr-12 text-sm shadow-sm"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      disabled={isDisabled}
                      autoComplete="new-password"
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
                  <AnimatePresence>
                    {formData.password && <PasswordStrength password={formData.password} />}
                  </AnimatePresence>
                </motion.div>

                {/* Benefits */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
                  {["Free 14-day trial", "No credit card", "Cancel anytime"].map((b) => (
                    <span key={b} className="flex items-center gap-1.5 text-xs text-slate-500">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" strokeWidth={2.5} />
                      {b}
                    </span>
                  ))}
                </div>

                {/* Submit */}
                <motion.button
                  whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                  whileHover={{ scale: isDisabled ? 1 : 1.01 }}
                  type="submit"
                  disabled={isDisabled}
                  className="w-full py-3.5 mt-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white font-black rounded-full transition-all shadow-lg shadow-indigo-200/60 hover:shadow-xl hover:shadow-indigo-300/50 hover:brightness-105 flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none tracking-wide"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Account…
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>

              <p className="text-sm text-slate-500 text-center mt-6">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-indigo-600 hover:text-indigo-800 hover:underline font-bold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </motion.div>

            {/* ── RIGHT PANEL - INFO ── */}
            <motion.div
              variants={item}
              className="relative overflow-hidden p-8 sm:p-10 bg-[radial-gradient(circle_at_20%_20%,#dbeafe_0%,transparent_50%),radial-gradient(circle_at_80%_10%,#cffafe_0%,transparent_40%),radial-gradient(circle_at_60%_90%,#e9d5ff_0%,transparent_45%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] border-t lg:border-t-0 lg:border-l border-white/70"
            >
              {/* Shine */}
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
                    Instant Setup
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs border border-slate-200/80 text-slate-700 shadow-sm font-medium">
                    🔒 Secure
                  </span>
                </div>

                <h2 className="text-3xl sm:text-[2.6rem] font-black leading-[1.1] bg-[linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4,#6366f1)] bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient">
                  Welcome to
                  <br />
                  PulseIQ
                </h2>
                <p className="mt-3 text-slate-500 text-sm leading-relaxed max-w-xs">
                  Join thousands of teams using PulseIQ for analytics and insights. No credit card required.
                </p>

                {/* Feature cards */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      icon: <Zap className="w-4 h-4 text-amber-500" />,
                      title: "Instant Access",
                      desc: "Start immediately after signup.",
                    },
                    {
                      icon: <ShieldCheck className="w-4 h-4 text-indigo-600" />,
                      title: "Enterprise Security",
                      desc: "JWT + refresh token rotation.",
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

                {/* Steps */}
                <div className="mt-8">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                    Getting started is easy
                  </p>
                  <div className="space-y-3">
                    {[
                      { step: "01", text: "Create your free account" },
                      { step: "02", text: "Verify your email address" },
                      { step: "03", text: "Access your dashboard" },
                    ].map(({ step, text }, i) => (
                      <motion.div
                        key={step}
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                      >
                        <span className="flex-shrink-0 h-7 w-7 rounded-xl bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center shadow-sm shadow-indigo-200">
                          {step}
                        </span>
                        <span className="text-sm text-slate-600 font-medium">{text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-4 py-2 text-xs text-indigo-700 font-semibold shadow-sm">
                  🛡️ Protected by PulseIQ Shield™
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default Signup;