import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL;

const VerifyLink = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        await axios.get(`${BASE_API_URL}/api/auth/verify-email/${token}`);
        alert("Email Verified ✅");
        navigate("/login");
      } catch {
        alert("Invalid or expired link");
      }
    };

    verify();
  }, []);

  return <div className="text-center mt-20">Verifying...</div>;
};

export default VerifyLink;