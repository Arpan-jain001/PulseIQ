import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { ToasterComponent } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
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

// ── Admin pages ─────────────────────────────────────────────────────────────
import AdminOverview      from "./admin/pages/AdminOverview";
import AdminUsers         from "./admin/pages/AdminUsers";
import AdminOrganizations from "./admin/pages/AdminOrganizations";
import AdminVerifications from "./admin/pages/AdminVerifications";
import AdminAdmins        from "./admin/pages/AdminAdmins";
import AdminNotifications from "./admin/pages/AdminNotifications";
import AdminSettings      from "./admin/pages/AdminSettings";
import AdminWorkspaces    from "./admin/pages/AdminWorkspaces";
import AdminProjects      from "./admin/pages/AdminProjects";

// ── Organizer pages ──────────────────────────────────────────────────────────
import OrgDashboard       from "./organizer/pages/OrgDashboard";
import OrgWorkspaces      from "./organizer/pages/OrgWorkspaces";
import OrgProjects        from "./organizer/pages/OrgProjects";
import OrgAnalytics       from "./organizer/pages/OrgAnalytics";
import OrgMembers         from "./organizer/pages/OrgMembers";
import OrgNotifications   from "./organizer/pages/OrgNotifications";
import OrgSettings        from "./organizer/pages/OrgSettings";

// ── User pages ───────────────────────────────────────────────────────────────
import UserDashboard      from "./user/pages/UserDashboard";
import UserNotifications  from "./user/pages/UserNotifications";
import UserProfile        from "./user/pages/UserProfile";
import UserSettings           from "./user/pages/UserSettings";
import UserWorkspaces          from "./user/pages/UserWorkspaces";
import UserProjectAnalytics    from "./user/pages/UserProjectAnalytics";

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

          {/* ── User Dashboard ── */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={["USER"]}>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/notifications" element={
            <ProtectedRoute allowedRoles={["USER"]}>
              <UserNotifications />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/profile" element={
            <ProtectedRoute allowedRoles={["USER"]}>
              <UserProfile />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/settings" element={
            <ProtectedRoute allowedRoles={["USER"]}>
              <UserSettings />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/workspaces" element={
            <ProtectedRoute allowedRoles={["USER"]}>
              <UserWorkspaces />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/workspace/:workspaceId/project/:projectId" element={
            <ProtectedRoute allowedRoles={["USER"]}>
              <UserProjectAnalytics />
            </ProtectedRoute>
          } />

          {/* ── Organizer Dashboard ── */}
          <Route path="/organizer-dashboard" element={
            <ProtectedRoute allowedRoles={["ORGANIZER"]}>
              <OrgDashboard />
            </ProtectedRoute>
          } />
          <Route path="/organizer-dashboard/workspaces" element={
            <ProtectedRoute allowedRoles={["ORGANIZER"]}>
              <OrgWorkspaces />
            </ProtectedRoute>
          } />
          <Route path="/organizer-dashboard/projects" element={
            <ProtectedRoute allowedRoles={["ORGANIZER"]}>
              <OrgProjects />
            </ProtectedRoute>
          } />
          <Route path="/organizer-dashboard/analytics" element={
            <ProtectedRoute allowedRoles={["ORGANIZER"]}>
              <OrgAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/organizer-dashboard/members" element={
            <ProtectedRoute allowedRoles={["ORGANIZER"]}>
              <OrgMembers />
            </ProtectedRoute>
          } />
          <Route path="/organizer-dashboard/notifications" element={
            <ProtectedRoute allowedRoles={["ORGANIZER"]}>
              <OrgNotifications />
            </ProtectedRoute>
          } />
          <Route path="/organizer-dashboard/settings" element={
            <ProtectedRoute allowedRoles={["ORGANIZER"]}>
              <OrgSettings />
            </ProtectedRoute>
          } />

          {/* ── Admin Dashboard Routes ── */}
          <Route path="/admin-dashboard" element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <AdminOverview />
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard/users" element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard/organizations" element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <AdminOrganizations />
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard/verifications" element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <AdminVerifications />
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard/admins" element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <AdminAdmins />
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard/notifications" element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <AdminNotifications />
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard/settings" element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <AdminSettings />
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard/workspaces" element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <AdminWorkspaces />
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard/projects" element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <AdminProjects />
            </ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;