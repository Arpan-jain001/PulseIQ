// src/admin/components/AdminLayout.jsx
import AdminNavbar from "./AdminNavbar";
import AdminFooter from "./AdminFooter";

const AdminLayout = ({ children }) => (
  <div className="min-h-screen bg-[#020408] text-[#e8f4ff] flex flex-col">
    <AdminNavbar />
    <main className="flex-1 pt-16">
      {children}
    </main>
    <AdminFooter />
  </div>
);

export default AdminLayout;