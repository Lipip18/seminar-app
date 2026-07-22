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

const getInitials = (name = "") => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function AdminLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
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
    <div className="flex min-h-screen bg-slate-50">

      {/* Overlay (mobile) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white shadow-sm transform transition-transform ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Control center</p>
            <h2 className="text-xl font-bold text-slate-900">
              Admin Panel
            </h2>
          </div>

          <button
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X />
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">

            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm">
              {getInitials(user?.name || "Admin")}
            </div>

            <div>
              <p className="text-sm font-semibold">
                {user?.name || "Admin"}
              </p>

              <p className="text-xs text-gray-500">
                Administrator
              </p>
            </div>

          </div>
        </div>

        {/* Links */}
        <nav className="flex-1 space-y-1 px-4 py-4">
          {links.map((link) => (
            <SidebarLink
              key={link.to}
              {...link}
              onClick={() => setMobileMenuOpen(false)}
            />
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-200 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-64 flex flex-col">

        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">

          <button
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu />
          </button>

          <div className="hidden text-sm font-medium text-slate-500 lg:block">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 lg:p-8">
          <Outlet />
        </div>

      </main>
    </div>
  );
}