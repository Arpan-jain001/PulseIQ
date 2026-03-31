import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Loader2, MailCheck, RefreshCw, CheckCircle2 } from "lucide-react";
import Navbar from "../components/Navbar";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL;
const TIMEOUT_MS = 30_000;

// ─── Toast ────────────────────────────────────────────────────────────────────
const SmsToast = ({ type = "info", message, onClose }) => {
  const badge = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
  const bar = type === "success" ? "bg-emerald-500" : type === "error" ? "bg-red-500" : "bg-blue-500";
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
          <div className="h-9 w-9 rounded-xl bg-[#6366f1] text-white flex items-center justify-center text-xs font-black flex-shrink-0">PI</div>
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><span>{badge}</span><span>PulseIQ</span></div>
            <div className="text-sm text-slate-600 mt-0.5">{message}</div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-lg leading-none mt-0.5">×</button>
        </div>
      </div>
    </motion.div>
  );
};

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState("");

  const inputs = useRef([]);
  const abortRef = useRef(null);
  const toastTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    if (!email) navigate("/login");
    return () => {
      isMountedRef.current = false;
      abortRef.current?.abort();
      clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((p) => p - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const fireToast = useCallback((type, message) => {
    if (!isMountedRef.current) return;
    setToast({ type, message });
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) setToast(null);
    }, 3500);
  }, []);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputs.current[index + 1]?.focus();
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    const nextIndex = Math.min(pasted.length, 5);
    inputs.current[nextIndex]?.focus();
  };

  const finalOTP = otp.join("");

  const verifyOTP = async () => {
    if (finalOTP.length < 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }
    if (isLoading) return;

    setIsLoading(true);
    setError("");
    abortRef.current = new AbortController();

    try {
      await axios.post(
        `${BASE_API_URL}/api/auth/verify-email-otp`,
        { email, otp: finalOTP },
        { signal: abortRef.current.signal, timeout: TIMEOUT_MS }
      );

      if (!isMountedRef.current) return;
      setSuccess(true);
      fireToast("success", "Email verified! Redirecting to login…");

      setTimeout(() => {
        if (isMountedRef.current) navigate("/login");
      }, 1800);
    } catch (err) {
      if (!isMountedRef.current) return;
      if (axios.isCancel(err) || err.name === "AbortError") return;
      const msg = err.response?.data?.message || "Invalid OTP. Please try again.";
      setError(msg);
      fireToast("error", msg);
      // Clear OTP on wrong entry
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    if (timer > 0 || isResending) return;
    setIsResending(true);

    try {
      await axios.post(
        `${BASE_API_URL}/api/auth/resend-verification`,
        { email },
        { timeout: TIMEOUT_MS }
      );
      if (!isMountedRef.current) return;
      setTimer(60);
      fireToast("success", "New OTP sent! Check your email.");
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } catch (err) {
      if (!isMountedRef.current) return;
      fireToast("error", err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      if (isMountedRef.current) setIsResending(false);
    }
  };

  return (
    <>
      <Navbar />
      <AnimatePresence>
        {toast && <SmsToast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden px-4 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,#e0f2fe_0%,transparent_45%),radial-gradient(circle_at_90%_15%,#e9d5ff_0%,transparent_45%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]" />
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:64px_64px]" />

        <motion.div
          className="relative w-full max-w-md"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
        >
          <div className="rounded-3xl overflow-hidden shadow-[0_32px_96px_rgba(2,6,23,0.14)] border border-white/70 bg-white/60 backdrop-blur-xl p-8 sm:p-10">
            {/* Icon */}
            <motion.div
              animate={{ scale: [1, 1.07, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6 shadow-sm mx-auto"
            >
              <MailCheck className="w-7 h-7 text-indigo-600" />
            </motion.div>

            <h2 className="text-2xl font-black text-slate-900 text-center mb-1">Verify Your Email</h2>
            <p className="text-sm text-slate-400 text-center mb-1">OTP sent to</p>
            <motion.p
              className="text-sm font-bold text-indigo-600 text-center mb-7"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            >
              {email}
            </motion.p>

            {/* OTP Input */}
            <div className="flex justify-between gap-2 mb-5" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <motion.input
                  key={i}
                  ref={(el) => (inputs.current[i] = el)}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  maxLength={1}
                  inputMode="numeric"
                  whileFocus={{ scale: 1.08, borderColor: "#6366f1" }}
                  className={`w-12 h-14 text-center text-xl font-black rounded-xl border-2 transition-all focus:outline-none bg-white/90 text-slate-900 ${digit
                      ? "border-indigo-400 bg-indigo-50/50 shadow-sm shadow-indigo-100"
                      : "border-slate-200 hover:border-slate-300"
                    } ${error ? "border-red-300 bg-red-50/30" : ""}`}
                  disabled={isLoading || success}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-red-500 text-center mb-4"
                >
                  ❌ {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Progress indicator */}
            <div className="flex gap-1.5 justify-center mb-5">
              {otp.map((d, i) => (
                <div
                  key={i}
                  className={`h-1 w-6 rounded-full transition-all duration-300 ${d ? "bg-indigo-500" : "bg-slate-200"}`}
                />
              ))}
            </div>

            {/* Verify Button */}
            <motion.button
              whileTap={{ scale: isLoading || success ? 1 : 0.98 }}
              whileHover={{ scale: isLoading || success ? 1 : 1.01 }}
              onClick={verifyOTP}
              disabled={isLoading || success || finalOTP.length < 6}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white font-black rounded-full transition-all shadow-lg shadow-indigo-200/60 hover:brightness-105 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Verifying…</>
              ) : success ? (
                <><CheckCircle2 className="w-4 h-4" />Verified!</>
              ) : (
                "Verify OTP"
              )}
            </motion.button>

            {/* Resend */}
            <div className="text-center mt-5">
              {timer > 0 ? (
                <p className="text-sm text-slate-400">
                  Resend OTP in{" "}
                  <span className="font-bold text-indigo-600 tabular-nums">{timer}s</span>
                </p>
              ) : (
                <button
                  onClick={resendOTP}
                  disabled={isResending}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-bold transition-colors flex items-center gap-1.5 mx-auto"
                >
                  {isResending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  {isResending ? "Sending…" : "Resend OTP"}
                </button>
              )}
            </div>

            {/* Timer progress bar */}
            {timer > 0 && (
              <div className="mt-4 h-0.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-400 rounded-full"
                  style={{ width: `${(timer / 60) * 100}%` }}
                  transition={{ duration: 0.5, ease: "linear" }}
                />
              </div>
            )}

            {/* Success overlay */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-3xl"
                >
                  <motion.div
                    className="w-[90%] max-w-xs rounded-3xl bg-white shadow-2xl p-8 text-center"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <motion.div
                      className="w-20 h-20 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-4"
                      initial={{ scale: 0.5 }}
                      animate={{ scale: [0.5, 1.2, 1] }}
                      transition={{ duration: 0.5 }}
                    >
                      <svg width="36" height="36" viewBox="0 0 24 24">
                        <motion.path
                          d="M20 6L9 17l-5-5"
                          stroke="#059669"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.4 }}
                        />
                      </svg>
                    </motion.div>

                    <h3 className="text-xl font-black text-slate-900 mb-1">
                      Password Reset! 🎉
                    </h3>

                    <p className="text-sm text-slate-500">
                      Redirecting to login...
                    </p>

                    <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-emerald-500"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2 }}
                      />
                    </div>
                  </motion.div>
                </motion.div>

              )}
            </AnimatePresence>

            <div className="mt-7 pt-5 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400">Protected by PulseIQ Shield™</p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default VerifyEmail;