import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import { useGoogleLogin } from "@react-oauth/google"; // ✅ ONLY useGoogleLogin
import { useAuth } from "../hooks/useAuth.js";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

// SmsToast, LoginLoader, SuccessOverlay - SAME AS BEFORE (unchanged)
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

const LoginLoader = ({ text = "Logging you in..." }) => (
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
      <h3 className="mt-4 text-lg font-bold text-slate-900">Login successful</h3>
      <p className="mt-1 text-sm text-slate-600">Redirecting…</p>
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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Logging you in...");
  const [rememberMe, setRememberMe] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // ✅ ALL HANDLERS DEFINED FIRST (BEFORE useGoogleLogin)
  const fireToast = (type, message) => {
    setToast({ type, message });
    window.clearTimeout(window.__toastTimer);
    window.__toastTimer = window.setTimeout(() => setToast(null), 2600);
  };

  const saveAuth = (token, refreshToken, userData) => {
  const store = rememberMe ? localStorage : sessionStorage;
  store.setItem("isLoggedIn", "true");
  store.setItem("accessToken", token);
  store.setItem("refreshToken", refreshToken);
  store.setItem("user", JSON.stringify(userData));
  localStorage.setItem("isLoggedIn", "true");

  // 🔥 ADD THIS
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

  const successFlow = async (userData) => {
  setShowSuccess(true);
  fireToast("success", "Welcome back! ✅ Login successful.");
  await new Promise((r) => setTimeout(r, 1100));
  setShowSuccess(false);

  if (userData.role === "SUPER_ADMIN") {
    navigate("/admin-dashboard");
  } else if (userData.role === "ORGANIZER") {
    navigate("/organizer-dashboard");
  } else {
    navigate("/dashboard");
  }
};

  // ✅ Email/Password Login Handler (FIXED)
const handleSubmit = async (e) => {
  e.preventDefault();
  if (isLoading || showSuccess) return;

  setError("");
  setIsLoading(true);
  setLoadingText("Signing you in...");

  try {
    const { data } = await axios.post(
      `${BASE_API_URL}/api/auth/login`,
      {
        email,
        password,
        role,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (data.success) {
      saveAuth(data.accessToken, data.refreshToken, data.user);
      await successFlow(data.user);
    }
  } catch (err) {
    const msg = err.response?.data?.message;

    if (msg === "EMAIL_NOT_VERIFIED") {
      fireToast("error", "⚠️ Please verify your email");

      navigate("/verify-email", {
        state: { email }, // ✅ FIXED (formData ❌ hata diya)
      });

    } else if (msg === "Your role is not correct for this account") {
      fireToast("error", "❌ Wrong role selected");

    } else {
      fireToast("error", msg || "Login failed");
    }
  } finally {
    setIsLoading(false); // 🔥 MOST IMPORTANT (loader fix)
  }
};

  // ✅ Google Error Handler (PEHLE define karo)
const handleGoogleError = useCallback(() => {
  fireToast("error", "Google login cancelled.");
  setIsLoading(false);
}, []);

// ✅ Google Success Handler
const handleGoogleSuccess = useCallback(async (tokenResponse) => {
  if (isLoading || showSuccess) return;

  setIsLoading(true);
  setLoadingText("Signing in with Google...");

  try {
    const { data } = await axios.post(`${BASE_API_URL}/api/auth/google`, {
      code: tokenResponse.code, // ✅ CHANGE (NOT access_token)
    });

    if (data.success) {
      saveAuth(data.accessToken, data.refreshToken, data.user);
      await successFlow(data.user);
    }
  } catch (err) {
    const msg = err.response?.data?.message || "Google login failed.";
    setError(msg);
    fireToast("error", msg);
    setIsLoading(false);
  }
}, [isLoading, showSuccess]);

// ✅ ONLY ONE googleLogin
const googleLogin = useGoogleLogin({
  onSuccess: handleGoogleSuccess,
  onError: handleGoogleError,
  flow: "auth-code",
});

  // Auto redirect if already logged in
  useEffect(() => {
  if (user?.role === "SUPER_ADMIN") navigate("/admin-dashboard");
  else if (user?.role === "ORGANIZER") navigate("/organizer-dashboard");
  else if (user) navigate("/dashboard");
}, [user]);

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

      <AnimatePresence>{isLoading && <LoginLoader text={loadingText} />}</AnimatePresence>
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
            {/* LEFT PANEL - INFO (unchanged) */}
            <motion.div variants={item} className="relative overflow-hidden p-7 sm:p-10 bg-[radial-gradient(circle_at_20%_20%,#dbeafe_0%,transparent_45%),radial-gradient(circle_at_80%_10%,#cffafe_0%,transparent_40%),radial-gradient(circle_at_60%_90%,#e9d5ff_0%,transparent_45%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] border-b lg:border-b-0 lg:border-r border-white/70">
              {/* Your existing LEFT PANEL content - unchanged */}
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
                    Secure Login • JWT Auth
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/65 px-3 py-1 text-xs border border-slate-200 text-slate-700 shadow-sm">
                    🔐 Google OAuth
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight bg-[linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4,#6366f1)] bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient">
                  Welcome back <br className="hidden sm:block" /> to PulseIQ
                </h2>
                <p className="mt-3 text-slate-600 max-w-xl">
                  Sign in securely with email/password or Google OAuth with role-based access control.
                </p>
                <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div whileHover={{ y: -3 }} className="rounded-2xl bg-white/80 border border-slate-200 p-4 shadow-[0_12px_30px_rgba(2,6,23,0.06)] transition">
                    <p className="font-semibold text-slate-900">🔐 Secure</p>
                    <p className="text-sm text-slate-600">JWT tokens + refresh tokens.</p>
                  </motion.div>
                  <motion.div whileHover={{ y: -3 }} className="rounded-2xl bg-white/80 border border-slate-200 p-4 shadow-[0_12px_30px_rgba(2,6,23,0.06)] transition">
                    <p className="font-semibold text-slate-900">⚡ Instant</p>
                    <p className="text-sm text-slate-600">Email, Google or role-based login.</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* RIGHT PANEL - FORM */}
            <motion.div variants={item} className="p-6 sm:p-10">
              <div className="flex items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Sign In</h3>
                  <p className="text-sm text-slate-500 mt-1">Enter your credentials to continue.</p>
                </div>
                <span className="hidden sm:inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-medium border border-indigo-100">
                  🔒 Protected
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

              {/* Role Toggle */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">Login as</label>
                <div className="flex bg-white/50 border border-slate-200 rounded-2xl p-1">
                  {["USER", "ORGANIZER", "SUPER_ADMIN"].map((r) => (
                    <motion.button
                      key={r}
                      onClick={() => setRole(r)}
                      className={`flex-1 py-2.5 px-3 text-xs font-semibold rounded-xl transition-all ${
                        role === r
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-700 hover:text-slate-900"
                      }`}
                      whileTap={{ scale: 0.98 }}
                      disabled={isLoading || showSuccess}
                    >
                      {r.replace("_", " ")}
                    </motion.button>
                  ))}
                </div>
              </div>

  <form onSubmit={handleSubmit} className="space-y-4">
    <motion.div whileHover={{ y: -1 }}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
        Email
      </label>
      <input
        type="email"
        placeholder="you@company.com"
        className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 text-sm"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isLoading || showSuccess}
      />
    </motion.div>

    {/* Password Field */}
    <motion.div whileHover={{ y: -1 }}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
        Password
      </label>
      <div className="relative">
        <input
          type={showPass ? "text" : "password"}
          placeholder="••••••••"
          className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 pr-11 text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading || showSuccess}
        />
        <button
          type="button"
          onClick={() => setShowPass(!showPass)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 transition-colors"
          disabled={isLoading || showSuccess}
        >
          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </motion.div>

    {/* Remember Me + Forgot Password */}
    <div className="flex items-center justify-between">
      <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
        <input
          type="checkbox"
          className="rounded border-slate-300 accent-indigo-600 w-4 h-4"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          disabled={isLoading || showSuccess}
        />
        Remember me
      </label>
      <Link to="/forgot-password" className="text-sm text-indigo-600 hover:underline transition-colors">
        Forgot password?
      </Link>
    </div>

    {/* Sign In Button */}
    <motion.button
      whileTap={{ scale: isLoading || showSuccess ? 1 : 0.98 }}
      whileHover={{ scale: isLoading || showSuccess ? 1 : 1.01 }}
      type="submit"
      disabled={isLoading || showSuccess}
      className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white font-bold rounded-full transition-all shadow-lg hover:shadow-xl hover:brightness-105 flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Signing In...
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
    <div className="relative flex justify-center text-xs uppercase">
      <span className="bg-white px-2 text-slate-500 font-semibold">or continue with</span>
    </div>
  </div>

<motion.div
  whileHover={{ scale: isLoading || showSuccess ? 1 : 1.02 }}
  whileTap={{ scale: isLoading || showSuccess ? 1 : 0.98 }}
>
  <button
    onClick={() => {
      if (isLoading || showSuccess) return;

      setIsLoading(true);
      setLoadingText("Connecting to Google...");
      googleLogin();
    }}
    disabled={isLoading || showSuccess}
    className="w-full group relative overflow-hidden rounded-2xl bg-white border-2 border-slate-200 p-3.5 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:border-slate-300 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
  >
    {/* 🔄 Loader inside button */}
    {isLoading ? (
      <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
    ) : (
      <div className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
        <svg viewBox="0 0 48 48" className="w-full h-full">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.73 1.22 9.24 3.6l6.88-6.88C35.63 2.1 30.21 0 24 0 14.62 0 6.51 5.48 2.56 13.44l8.06 6.25C12.45 13.02 17.77 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.5 24c0-1.64-.15-3.22-.43-4.74H24v9h12.7c-.55 2.95-2.2 5.45-4.7 7.14l7.28 5.66C43.9 36.36 46.5 30.72 46.5 24z"/>
          <path fill="#FBBC05" d="M10.62 28.69A14.5 14.5 0 019.5 24c0-1.62.28-3.19.78-4.69l-8.06-6.25A23.98 23.98 0 000 24c0 3.87.93 7.52 2.56 10.56l8.06-6.25z"/>
          <path fill="#34A853" d="M24 48c6.21 0 11.42-2.05 15.23-5.56l-7.28-5.66c-2.02 1.36-4.6 2.17-7.95 2.17-6.23 0-11.55-3.52-13.38-8.69l-8.06 6.25C6.51 42.52 14.62 48 24 48z"/>
        </svg>
      </div>
    )}

    {/* Text */}
    <span className="font-semibold text-slate-900 group-hover:text-slate-800 transition-colors">
      {isLoading ? "Connecting..." : "Continue with Google"}
    </span>

    {/* Shine effect */}
    {!isLoading && (
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -skew-x-12 transform -translate-x-40 group-hover:translate-x-40" />
    )}
  </button>
</motion.div>

  {/* Sign Up Link */}
  <p className="text-sm text-slate-600 text-center mt-6">
    Don't have an account?{" "}
    <Link to="/signup" className="text-indigo-600 hover:underline font-semibold transition-colors">
      Sign up free
    </Link>
  </p>

              {/* Security Footer */}
              <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                <p className="text-xs text-slate-500">
                  Protected by PulseIQ Shield™ — Enterprise Grade Security
                </p>
              </div>
            </motion.div> {/* ✅ RIGHT PANEL END */}
          </motion.div> {/* ✅ GRID 2-COL END */}
        </motion.div> {/* ✅ MAIN MOTION WRAPPER END */}
      </div> {/* ✅ OUTER RELATIVE CONTAINER END */}
    </>
  );
};

export default Login;

