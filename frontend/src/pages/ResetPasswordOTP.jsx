import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL;

export default function ResetPasswordOTP() {
  const params = new URLSearchParams(useLocation().search);
  const email = params.get("email");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const inputs = useRef([]);

  const handleOTP = (val, i) => {
    if (!/^[0-9]?$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[i] = val;
    setOtp(newOtp);

    if (val && i < 5) inputs.current[i + 1].focus();
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await axios.post(`${BASE_API_URL}/api/auth/reset-password-otp`, {
        email,
        otp: otp.join(""),
        password,
      });

      alert("Password Reset Successful ✅");
    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <motion.div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold text-center mb-4">
          Enter OTP 🔢
        </h2>

        {/* OTP BOXES */}
        <div className="flex justify-between mb-4">
          {otp.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              value={d}
              onChange={(e) => handleOTP(e.target.value, i)}
              maxLength={1}
              className="w-12 h-12 text-center text-xl border rounded-xl"
            />
          ))}
        </div>

        <input
          type="password"
          placeholder="New Password"
          className="w-full px-4 py-3 rounded-xl border mb-4"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl"
        >
          {loading ? "Processing..." : "Reset Password"}
        </button>
      </motion.div>
    </div>
  );
}