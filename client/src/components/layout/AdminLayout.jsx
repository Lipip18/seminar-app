import {
  Building,
  Calendar,
  CreditCard,
  Home,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useContext, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const SidebarLink = ({ to, icon: Icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        isActive
          ? "bg-indigo-600 text-white shadow-md"
          : "text-gray-600 hover:bg-gray-100"
      }`
    }
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
  </NavLink>
);

export default function AdminLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login"); // ✅ better redirect
  };

  const links = [
    { to: "/admin/dashboard", icon: Home, label: "Dashboard" },
    { to: "/admin/halls", icon: Building, label: "Manage Halls" },
    { to: "/admin/bookings", icon: CreditCard, label: "Manage Bookings" },
    { to: "/admin/users", icon: Users, label: "Manage Users" },
    { to: "/admin/calendar", icon: Calendar, label: "Calendar" },
    { to: "/admin/profile", icon: Settings, label: "Profile" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Overlay (mobile) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-indigo-600">Admin Panel</h2>
          <button className="lg:hidden" onClick={() => setMobileMenuOpen(false)}>
            <X />
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
            <img
              src={user?.profilePhoto || "https://via.placeholder.com/150"}
              alt="profile"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="text-sm font-semibold">
                {user?.name || "Admin"}
              </p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>

        {/* Links */}
        <nav className="px-4 space-y-1">
          {links.map((link) => (
            <SidebarLink
              key={link.to}
              {...link}
              onClick={() => setMobileMenuOpen(false)}
            />
          ))}
        </nav>

        {/* Logout */}
        <div className="mt-auto p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-red-100 text-red-600"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-64 flex flex-col">

        {/* Topbar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <button className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
            <Menu />
          </button>

          <div className="text-sm text-gray-500 hidden lg:block">
            {new Date().toDateString()}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 flex-1">
          <Outlet /> {/* ✅ CRITICAL */}
        </div>

      </main>
    </div>
  );
}