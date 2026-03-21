import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ToasterComponent } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useWarmup } from "./hooks/useWarmup.js";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

// Verify flow
import VerifyEmail from "./pages/VerifyEmail";
import VerifyLink from "./pages/VerifyLink";
import VerifyOTP from "./pages/VerifyOTP";

// Password flow
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ResetPasswordOTP from "./pages/ResetPasswordOTP";

// Protected
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const BackendWarmup = () => { useWarmup(); return null; };

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <ToasterComponent />
      <BackendWarmup />

      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Email verify */}
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-email/:token" element={<VerifyLink />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />

          {/* Password */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/reset-password-otp" element={<ResetPasswordOTP />} />

          {/* ✅ Dashboards — allowedRoles array (not role prop) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["USER"]}>
                <div>User Dashboard — Coming Soon</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                <div>Admin Dashboard — Coming Soon</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer-dashboard"
            element={
              <ProtectedRoute allowedRoles={["ORGANIZER"]}>
                <div>Organizer Dashboard — Coming Soon</div>
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;