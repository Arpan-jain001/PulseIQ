import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ToasterComponent } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// ✅ EXISTING
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

// ✅ VERIFY FLOW
import VerifyEmail from "./pages/VerifyEmail";
import VerifyLink from "./pages/VerifyLink";
import VerifyOTP from "./pages/VerifyOTP";

// ✅ PASSWORD FLOW
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ResetPasswordOTP from "./pages/ResetPasswordOTP"; // 🔥 ADD THIS

// ✅ PROTECTED
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <ToasterComponent />

        <BrowserRouter>
          <Routes>

            {/* 🌐 PUBLIC */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* 🔐 EMAIL VERIFY */}
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/verify-email/:token" element={<VerifyLink />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />

            {/* 🔑 PASSWORD */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/reset-password-otp" element={<ResetPasswordOTP />} /> {/* 🔥 IMPORTANT */}

            {/* 🔒 DASHBOARD ROUTING */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Dashboard Page</div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute role="SUPER_ADMIN">
                  <div>Admin Dashboard</div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/organizer-dashboard"
              element={
                <ProtectedRoute role="ORGANIZER">
                  <div>Organizer Dashboard</div>
                </ProtectedRoute>
              }
            />

            {/* ❌ 404 */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;