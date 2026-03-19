import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import axios from "axios";
import Navbar from "@/components/Navbar";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL;

const SmsToast = ({ type = "info", message, onClose }) => {
  const badge = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
  const bar = type === "success" ? "bg-emerald-500" : type === "error" ? "bg-red-500" : "bg-blue-500";

  return (
    <motion.div
      className="fixed z-[10000] bottom-5 right-5 w-[92%] max-w-sm"
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
    >
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        <div className={`h-1 w-full ${bar}`} />
        <div className="px-4 py-3 flex gap-3 items-start">
          <div className="h-10 w-10 rounded-2xl bg-[#6366f1] text-white flex items-center justify-center text-sm font-bold shadow-sm">
            PI
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <span>{badge}</span>
              <span>PulseIQ</span>
            </div>
            <div className="text-sm text-slate-600 mt-0.5">{message}</div>
          </div>
          <button onClick={onClose} className="text-xs text-slate-500 hover:text-slate-700">✕</button>
        </div>
      </div>
    </motion.div>
  );
};

const SignupLoader = ({ text = "Creating your account..." }) => (
  <motion.div
    className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/35 backdrop-blur-md"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="w-[92%] max-w-sm rounded-3xl bg-white shadow-2xl p-7 flex flex-col items-center border border-white/60"
      initial={{ y: 18, opacity: 0, scale: 0.98 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 10, opacity: 0, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
    >
      <div className="relative">
        <motion.div
          className="h-14 w-14 rounded-full border-4 border-gray-200 border-t-[#6366f1]"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0 m-auto h-3 w-3 rounded-full bg-[#6366f1]"
          animate={{ scale: [1, 1.35, 1] }}
          transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }}
        />
      </div>
      <p className="mt-4 text-sm text-slate-800 text-center font-medium">{text}</p>
      <p className="mt-1 text-xs text-slate-500 text-center">Please wait a moment…</p>
    </motion.div>
  </motion.div>
);

const SuccessOverlay = () => (
  <motion.div
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-md"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="w-[92%] max-w-sm rounded-3xl bg-white shadow-2xl p-7 border border-white/60 text-center"
      initial={{ y: 18, opacity: 0, scale: 0.98 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
    >
      <motion.div
        className="mx-auto h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center"
        initial={{ scale: 0.9 }}
        animate={{ scale: [0.9, 1.08, 1] }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <motion.path
            d="M20 6L9 17l-5-5"
            stroke="#059669"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          />
        </svg>
      </motion.div>
      <h3 className="mt-4 text-lg font-bold text-slate-900">Account created!</h3>
      <p className="mt-1 text-sm text-slate-600">Redirecting to login...</p>
      <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          className="h-full bg-emerald-500"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.05, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  </motion.div>
);

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

  const fireToast = (type, message) => {
    setToast({ type, message });
    window.clearTimeout(window.__toastTimer);
    window.__toastTimer = window.setTimeout(() => setToast(null), 2600);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (isSubmitting || showSuccess) return;

  // ✅ Password validation
  if (formData.password.length < 8) {
    setError("Password must be at least 8 characters long");
    fireToast("error", "Password must be at least 8 characters");
    return;
  }

  // ✅ Organizer validation (IMPORTANT)
  if (role === "ORGANIZER" && !formData.companyName.trim()) {
    setError("Company name is required for organizers");
    fireToast("error", "Please enter your company name");
    return;
  }

  // ✅ Name validation
  if (!formData.firstName.trim() || !formData.lastName.trim()) {
    setError("Please enter your full name");
    fireToast("error", "First and last name required");
    return;
  }

  setError("");
  setIsSubmitting(true);
  setLoadingText("Creating account...");

  try {
    const payload = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email.toLowerCase(), // ✅ normalize
      password: formData.password,
      role,
      companyName: formData.companyName || null, // ✅ safe
    };

    const { data } = await axios.post(
      `${BASE_API_URL}/api/auth/register`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (data.success) {
      setIsSubmitting(false);
      setShowSuccess(true);
      fireToast("success", "Account created successfully! 🎉");

      setTimeout(() => {
        setShowSuccess(false);
        localStorage.setItem("accessToken", data.accessToken);
localStorage.setItem("user", JSON.stringify(data.user));

navigate("/verify-email", {
  state: { email: formData.email },
});
      }, 1500);
    }
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      "Registration failed. Please try again.";

    setError(msg);
    fireToast("error", msg);
    setIsSubmitting(false);
    setLoadingText("Creating your account...");
  }
};

  const container = useMemo(
    () => ({
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { staggerChildren: 0.08 } },
    }),
    []
  );

  const item = useMemo(
    () => ({
      hidden: { opacity: 0, y: 16, scale: 0.99 },
      show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 220, damping: 18 },
      },
    }),
    []
  );

  useEffect(() => {
    return () => {
      window.clearTimeout(window.__toastTimer);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradientMove 7s ease infinite;
        }
        .noise {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E");
        }
      `}</style>

      <Navbar />

      <AnimatePresence>{isSubmitting && <SignupLoader text={loadingText} />}</AnimatePresence>
      <AnimatePresence>{showSuccess && <SuccessOverlay />}</AnimatePresence>
      <AnimatePresence>
        {toast && (
          <SmsToast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>

      <div className="relative min-h-[calc(100vh-120px)] flex items-center justify-center overflow-hidden px-4 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,#e0f2fe_0%,transparent_45%),radial-gradient(circle_at_90%_15%,#e9d5ff_0%,transparent_45%),radial-gradient(circle_at_40%_90%,#dbeafe_0%,transparent_45%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]" />
        <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="noise absolute inset-0 opacity-[0.06] pointer-events-none" />

        <motion.div className="relative w-full max-w-6xl" variants={container} initial="hidden" animate="show">
          <motion.div
            variants={item}
            className="grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-[0_30px_90px_rgba(2,6,23,0.16)] border border-white/70 bg-white/65 backdrop-blur-xl"
          >
            {/* LEFT PANEL - FORM */}
            <motion.div variants={item} className="p-6 sm:p-10">
              <div className="flex items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Create Account</h3>
                  <p className="text-sm text-slate-500 mt-1">Start your free trial today</p>
                </div>
                <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-medium border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4" />
                  Free Trial
                </span>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Role Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">Account Type</label>
                <div className="flex bg-white/50 border border-slate-200 rounded-2xl p-1">
                  {["USER", "ORGANIZER"].map((r) => (
                    <motion.button
                      key={r}
                      onClick={() => setRole(r)}
                      className={`flex-1 py-2.5 px-3 text-xs font-semibold rounded-xl transition-all ${
                        role === r
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-700 hover:text-slate-900 hover:bg-white/60"
                      }`}
                      whileTap={{ scale: 0.98 }}
                    >
                      {r === "ORGANIZER" ? "Team/Org" : "Personal"}
                    </motion.button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {role === "ORGANIZER" ? "For teams & organizations" : "For individual use"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <motion.div whileHover={{ y: -1 }}>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Arpan"
                      className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 text-sm"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting || showSuccess}
                    />
                  </motion.div>

                  <motion.div whileHover={{ y: -1 }}>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Jain"
                      className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 text-sm"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting || showSuccess}
                    />
                  </motion.div>
                </div>

                <motion.div whileHover={{ y: -1 }}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    placeholder={role === "ORGANIZER" ? "Your Company" : "Optional"}
                    className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 text-sm"
                    value={formData.companyName}
                    onChange={handleChange}
                    disabled={isSubmitting || showSuccess}
                  />
                </motion.div>

                <motion.div whileHover={{ y: -1 }}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Work Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@company.com"
                    className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 text-sm"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting || showSuccess}
                  />
                </motion.div>

                <motion.div whileHover={{ y: -1 }}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      name="password"
                      placeholder="Min 8 characters"
                      className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 pr-11 text-sm"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      disabled={isSubmitting || showSuccess}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 transition-colors"
                      disabled={isSubmitting || showSuccess}
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>

                <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600 pt-1">
                  {["Free 14-day trial", "No credit card", "Cancel anytime"].map((benefit) => (
                    <span key={benefit} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
                      {benefit}
                    </span>
                  ))}
                </div>

                <motion.button
                  whileTap={{ scale: isSubmitting || showSuccess ? 1 : 0.98 }}
                  whileHover={{ scale: isSubmitting || showSuccess ? 1 : 1.01 }}
                  type="submit"
                  disabled={isSubmitting || showSuccess}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white font-bold rounded-full transition-all shadow-lg hover:shadow-xl hover:brightness-105 flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>

              <p className="text-sm text-slate-600 text-center mt-6">
                Already have an account?{" "}
                <Link to="/login" className="text-indigo-600 hover:underline font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </motion.div>

            {/* RIGHT PANEL - INFO */}
            <motion.div
              variants={item}
              className="relative overflow-hidden p-7 sm:p-10 bg-[radial-gradient(circle_at_20%_20%,#dbeafe_0%,transparent_45%),radial-gradient(circle_at_80%_10%,#cffafe_0%,transparent_40%),radial-gradient(circle_at_60%_90%,#e9d5ff_0%,transparent_45%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] border-t lg:border-t-0 lg:border-l border-white/70"
            >
              <motion.div
                className="absolute -left-1/2 top-0 h-[220%] w-1/3 rotate-12 bg-white/60 blur-2xl"
                animate={{ x: ["-30%", "155%"] }}
                transition={{ repeat: Infinity, duration: 7.0, ease: "easeInOut" }}
              />
              <div className="absolute inset-0 bg-white/35 backdrop-blur-[2px]" />

              <div className="relative">
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1 text-xs border border-slate-200 text-slate-700 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Instant Setup
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/65 px-3 py-1 text-xs border border-slate-200 text-slate-700 shadow-sm">
                    🔒 Secure
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight bg-[linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4,#6366f1)] bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient">
                  Welcome to <br className="hidden sm:block" /> PulseIQ
                </h2>

                <p className="mt-3 text-slate-600 max-w-xl">
                  Join thousands of teams using PulseIQ for analytics and insights. No credit card required.
                </p>

                <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div whileHover={{ y: -3 }} className="rounded-2xl bg-white/80 border border-slate-200 p-4 shadow-[0_12px_30px_rgba(2,6,23,0.06)] transition">
                    <p className="font-semibold text-slate-900">🚀 Instant Access</p>
                    <p className="text-sm text-slate-600">Start immediately after signup</p>
                  </motion.div>
                  <motion.div whileHover={{ y: -3 }} className="rounded-2xl bg-white/80 border border-slate-200 p-4 shadow-[0_12px_30px_rgba(2,6,23,0.06)] transition">
                    <p className="font-semibold text-slate-900">🛡️ Enterprise Security</p>
                    <p className="text-sm text-slate-600">JWT protected with refresh tokens</p>
                  </motion.div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                  <p className="text-xs text-slate-500">
                    Protected by PulseIQ Shield™ — Enterprise Grade Security
                  </p>
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
