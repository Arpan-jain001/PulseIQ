import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, User, Building2, Zap, ShieldCheck, Sparkles } from "lucide-react";
import axios from "axios";
import Navbar from "../components/Navbar";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL;
const SIGNUP_TIMEOUT_MS = 30_000;

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

/* ── Signup Loader ──────────────────────────────────── */
const SignupLoader = ({ text = "Creating your account...", timeoutSec = 30, onTimeout }) => {
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
          {elapsed < timeoutSec - 5 ? "Please wait a moment…" : "Almost there…"}
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
      <h3 className="text-lg font-black text-slate-900">Account Created! 🎉</h3>
      <p className="text-sm text-slate-400 mt-1">Redirecting to verify your email…</p>
      <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <motion.div className="h-full bg-emerald-500 rounded-full"
          initial={{ width: "0%" }} animate={{ width: "100%" }}
          transition={{ duration: 1.2, ease: "easeInOut" }} />
      </div>
    </motion.div>
  </motion.div>
);

/* ── Password Strength ──────────────────────────────── */
const PasswordStrength = ({ password }) => {
  const checks = [
    { label: "8+ chars",  pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Number",    pass: /\d/.test(password) },
    { label: "Special",   pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const strength = score <= 1 ? "Weak" : score === 2 ? "Fair" : score === 3 ? "Good" : "Strong";
  const barColors   = ["bg-red-400", "bg-orange-400", "bg-amber-400", "bg-emerald-500"];
  const textColors  = ["text-red-500", "text-orange-500", "text-amber-500", "text-emerald-600"];

  if (!password) return null;

  return (
    <motion.div className="mt-2.5"
      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="flex gap-1 mb-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${i < score ? barColors[score - 1] : ""}`}
              initial={{ width: "0%" }}
              animate={{ width: i < score ? "100%" : "0%" }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between flex-wrap gap-1">
        <span className={`text-[11px] font-bold ${textColors[score - 1] || "text-slate-400"}`}>{strength}</span>
        <div className="flex gap-2 flex-wrap">
          {checks.map(({ label, pass }) => (
            <span key={label} className={`text-[10px] transition-colors ${pass ? "text-emerald-600" : "text-slate-300"}`}>
              {pass ? "✓" : "·"} {label}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

/* ── Main Signup ────────────────────────────────────── */
const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", companyName: "", email: "", password: "",
  });
  const [role, setRole] = useState("USER");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loadingText, setLoadingText] = useState("Creating your account...");
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();
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
      if (document.visibilityState === "visible" && isSubmitting && !showSuccess) {
        const t = setTimeout(() => {
          if (isMountedRef.current && isSubmitting && !showSuccess) {
            abortControllerRef.current?.abort();
            setIsSubmitting(false);
            fireToast("info", "Signup interrupted. Please try again.");
          }
        }, 300);
        return () => clearTimeout(t);
      }
    };
    const handlePopState = () => {
      if (isSubmitting && !showSuccess) { abortControllerRef.current?.abort(); setIsSubmitting(false); }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", () => abortControllerRef.current?.abort());
    window.addEventListener("popstate", handlePopState);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isSubmitting, showSuccess]);

  const fireToast = useCallback((type, message) => {
    if (!isMountedRef.current) return;
    setToast({ type, message });
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => { if (isMountedRef.current) setToast(null); }, 3500);
  }, []);

  const resetLoading = useCallback(() => { if (isMountedRef.current) setIsSubmitting(false); }, []);

  const handleLoaderTimeout = useCallback(() => {
    abortControllerRef.current?.abort();
    resetLoading();
    fireToast("error", "⏱ Request timed out. Check your connection.");
  }, [resetLoading, fireToast]);

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || showSuccess) return;

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("Please enter your full name.");
      fireToast("error", "First and last name are required.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
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
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        role,
        companyName: formData.companyName.trim() || null,
      };

      const { data } = await axios.post(`${BASE_API_URL}/api/auth/register`, payload, {
        headers: { "Content-Type": "application/json" },
        signal: abortControllerRef.current.signal,
        timeout: SIGNUP_TIMEOUT_MS,
      });

      if (data.success) {
        if (!isMountedRef.current) return;
        setIsSubmitting(false);
        setShowSuccess(true);
        fireToast("success", "Account created successfully! 🎉");

        if (data.accessToken) {
          // ✅ Sirf token save karo — user data DB se aayega
          localStorage.setItem("accessToken", data.accessToken);
          if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
          localStorage.setItem("isLoggedIn", "true");
        }

        setTimeout(() => {
          if (!isMountedRef.current) return;
          setShowSuccess(false);
          navigate("/verify-email", { state: { email: formData.email } });
        }, 1500);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      if (axios.isCancel(err) || err.name === "AbortError" || err.name === "CanceledError") { resetLoading(); return; }
      if (err.code === "ECONNABORTED" || err.code === "ERR_CANCELED") {
        resetLoading(); fireToast("error", "⏱ Request timed out."); return;
      }
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      setError(msg);
      fireToast("error", msg);
      resetLoading();
    }
  };

  const container = useMemo(() => ({
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  }), []);

  const item = useMemo(() => ({
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 220, damping: 20 } },
  }), []);

  const isDisabled = isSubmitting || showSuccess;

  const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all text-sm shadow-sm";

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
        .input-lift { transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s; }
        .input-lift:focus { transform: translateY(-1px); }
      `}</style>

      <Navbar />

      <AnimatePresence>
        {isSubmitting && !showSuccess && (
          <SignupLoader text={loadingText} timeoutSec={30} onTimeout={handleLoaderTimeout} />
        )}
      </AnimatePresence>
      <AnimatePresence>{showSuccess && <SuccessOverlay />}</AnimatePresence>
      <AnimatePresence>
        {toast && <SmsToast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-10 pt-28">

        {/* Background — same as Login */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,#e0f2fe_0%,transparent_45%),radial-gradient(circle_at_90%_15%,#e9d5ff_0%,transparent_45%),radial-gradient(circle_at_40%_90%,#dbeafe_0%,transparent_45%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]" />
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="noise-bg absolute inset-0 opacity-[0.05] pointer-events-none" />

        <motion.div className="relative w-full max-w-5xl" variants={container} initial="hidden" animate="show">
          <motion.div
            variants={item}
            className="grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden border border-white/80 bg-white/60 backdrop-blur-2xl"
            style={{ boxShadow: "0 32px 100px rgba(99,102,241,0.12), 0 8px 32px rgba(0,0,0,0.08)" }}
          >

            {/* ── LEFT PANEL — FORM ── */}
            <motion.div variants={item} className="p-7 sm:p-10 bg-white/50">

              {/* Header */}
              <div className="flex items-center justify-between mb-7">
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Create Account</h3>
                  <p className="text-sm text-slate-400 mt-0.5">Start your free trial today</p>
                </motion.div>
                <motion.span
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1.5 text-[11px] font-bold border border-emerald-100"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Free Trial
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
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Account Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "USER",      label: "Personal",  icon: <User className="w-4 h-4" />,     desc: "Individual use" },
                    { value: "ORGANIZER", label: "Team / Org", icon: <Building2 className="w-4 h-4" />, desc: "For organizations" },
                  ].map(({ value, label, icon, desc }) => (
                    <motion.button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ y: -1 }}
                      disabled={isDisabled}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left ${
                        role === value
                          ? "border-violet-500 bg-violet-50 shadow-md shadow-violet-100"
                          : "border-slate-200 bg-white/60 hover:border-slate-300 hover:bg-white"
                      }`}
                    >
                      <div className={`p-2 rounded-xl transition-colors ${role === value ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                        {icon}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${role === value ? "text-violet-700" : "text-slate-700"}`}>{label}</p>
                        <p className="text-[11px] text-slate-400">{desc}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Form */}
              <motion.form onSubmit={handleSubmit} className="space-y-4" noValidate
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>

                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: "firstName", label: "First Name", placeholder: "Arpan",  ac: "given-name" },
                    { name: "lastName",  label: "Last Name",  placeholder: "Jain",   ac: "family-name" },
                  ].map(({ name, label, placeholder, ac }) => (
                    <div key={name}>
                      <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">{label}</label>
                      <input type="text" name={name} placeholder={placeholder}
                        className={`input-lift ${inputClass}`}
                        value={formData[name]} onChange={handleChange}
                        onFocus={() => setFocusedField(name)} onBlur={() => setFocusedField(null)}
                        required disabled={isDisabled} autoComplete={ac} />
                    </div>
                  ))}
                </div>

                {/* Company — ORGANIZER required */}
                <AnimatePresence>
                  {role === "ORGANIZER" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                        Company Name <span className="text-red-400">*</span>
                      </label>
                      <input type="text" name="companyName" placeholder="Your Company"
                        className={`input-lift ${inputClass} border-violet-200 focus:border-violet-400`}
                        value={formData.companyName} onChange={handleChange}
                        disabled={isDisabled} autoComplete="organization" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Company — USER optional */}
                {role === "USER" && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Company <span className="font-normal text-slate-300">(optional)</span>
                    </label>
                    <input type="text" name="companyName" placeholder="Your company"
                      className={`input-lift ${inputClass}`}
                      value={formData.companyName} onChange={handleChange}
                      disabled={isDisabled} autoComplete="organization" />
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Work Email</label>
                  <input type="email" name="email" placeholder="you@company.com"
                    className={`input-lift ${inputClass}`}
                    value={formData.email} onChange={handleChange}
                    onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)}
                    required disabled={isDisabled} autoComplete="email" />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Password</label>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} name="password" placeholder="Min 8 characters"
                      className={`input-lift ${inputClass} pr-12`}
                      value={formData.password} onChange={handleChange}
                      onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)}
                      required minLength={8} disabled={isDisabled} autoComplete="new-password" />
                    <button type="button" onClick={() => setShowPass((p) => !p)} disabled={isDisabled} tabIndex={-1}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {formData.password && <PasswordStrength password={formData.password} />}
                  </AnimatePresence>
                </div>

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
                  whileHover={{ scale: isDisabled ? 1 : 1.01, boxShadow: isDisabled ? "none" : "0 8px 30px rgba(99,102,241,0.35)" }}
                  type="submit" disabled={isDisabled}
                  className="w-full py-3.5 mt-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white font-black rounded-2xl transition-all shadow-lg shadow-violet-200/60 flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none tracking-wide overflow-hidden relative"
                >
                  {!isDisabled && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                      initial={{ x: "-100%" }} whileHover={{ x: "200%" }} transition={{ duration: 0.6 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    {isSubmitting
                      ? <><Loader2 className="w-4 h-4 animate-spin" />Creating Account…</>
                      : <>Create Account <ArrowRight className="w-4 h-4" /></>
                    }
                  </span>
                </motion.button>
              </motion.form>

              <motion.p className="text-sm text-slate-500 text-center mt-6"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                Already have an account?{" "}
                <Link to="/login" className="text-violet-600 hover:text-violet-800 font-bold transition-colors hover:underline">
                  Sign in →
                </Link>
              </motion.p>
            </motion.div>

            {/* ── RIGHT PANEL — INFO ── */}
            <motion.div
              variants={item}
              className="relative overflow-hidden p-8 sm:p-10 bg-[radial-gradient(circle_at_20%_20%,#dbeafe_0%,transparent_50%),radial-gradient(circle_at_80%_10%,#cffafe_0%,transparent_40%),radial-gradient(circle_at_60%_90%,#e9d5ff_0%,transparent_45%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] border-t lg:border-t-0 lg:border-l border-white/60"
            >
              {/* Shine sweep */}
              <motion.div
                className="absolute -left-1/2 top-0 h-[200%] w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/60 to-transparent blur-2xl pointer-events-none"
                animate={{ x: ["-40%", "180%"] }}
                transition={{ repeat: Infinity, duration: 9, ease: "easeInOut", repeatDelay: 1 }}
              />
              {/* Decorative orbs */}
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br from-violet-200/40 to-indigo-200/20 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-gradient-to-br from-indigo-200/30 to-cyan-200/20 blur-2xl pointer-events-none" />
              <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />

              <div className="relative z-10">
                {/* Badges */}
                <motion.div className="flex flex-wrap items-center gap-2 mb-7"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs border border-slate-200/80 text-slate-600 shadow-sm font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Instant Setup
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs border border-slate-200/80 text-slate-600 shadow-sm font-semibold">
                    🔒 Enterprise Secure
                  </span>
                </motion.div>

                {/* Headline */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                  <h2 className="text-4xl sm:text-5xl font-black leading-[1.05] mb-4 animate-gradient-text">
                    Welcome to<br />PulseIQ
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                    Join thousands of teams using PulseIQ for real-time analytics and AI insights. No credit card required.
                  </p>
                </motion.div>

                {/* Feature cards */}
                <motion.div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                  {[
                    { icon: <Zap className="w-4 h-4 text-amber-500" />,         bg: "bg-amber-50 border-amber-100",   title: "Instant Access",       desc: "Start immediately after signup" },
                    { icon: <ShieldCheck className="w-4 h-4 text-violet-500" />, bg: "bg-violet-50 border-violet-100", title: "Enterprise Security",   desc: "JWT + refresh token rotation" },
                    { icon: <Sparkles className="w-4 h-4 text-indigo-500" />,    bg: "bg-indigo-50 border-indigo-100", title: "AI-Powered Analytics", desc: "Smart behavioral insights" },
                  ].map(({ icon, bg, title, desc }, i) => (
                    <motion.div key={title}
                      whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}
                      className={`rounded-2xl ${bg} border p-4 transition-all duration-300 ${i === 2 ? "sm:col-span-2" : ""}`}>
                      <div className="flex items-center gap-2 mb-1">{icon}<p className="font-bold text-slate-800 text-xs">{title}</p></div>
                      <p className="text-xs text-slate-500">{desc}</p>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Steps */}
                <motion.div className="mt-8"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">Getting started is easy</p>
                  <div className="space-y-3">
                    {[
                      { step: "01", text: "Create your free account" },
                      { step: "02", text: "Verify your email address" },
                      { step: "03", text: "Access your dashboard" },
                    ].map(({ step, text }, i) => (
                      <motion.div key={step} className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}>
                        <span className="flex-shrink-0 h-7 w-7 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-[11px] font-black flex items-center justify-center shadow-sm shadow-violet-200">
                          {step}
                        </span>
                        <span className="text-sm text-slate-600 font-medium">{text}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Bottom pill */}
                <motion.div
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-xs text-white font-semibold shadow-lg shadow-violet-200"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                  🛡️ Protected by PulseIQ Shield™
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default Signup;