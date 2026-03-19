import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL;

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");

  const handleReset = async () => {
    try {
      await axios.post(`${BASE_API_URL}/api/auth/reset-password/${token}`, {
        password,
      });

      alert("Password Updated ✅");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-xl w-96">
        <input
          type="password"
          placeholder="New Password"
          className="w-full border px-3 py-2 mb-3"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleReset}
          className="w-full bg-indigo-600 text-white py-2 rounded"
        >
          Reset
        </button>
      </div>
    </div>
  );
}