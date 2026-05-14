import {
  BookOpen,
  Building,
  Home,
  LogOut,
  Menu,
  Settings,
  X
} from 'lucide-react';
import { useContext, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const SidebarLink = ({ to, icon: Icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        isActive
          ? 'bg-secondary text-white shadow-lg'
          : 'text-muted-foreground hover:bg-gray-100'
      }`
    }
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
  </NavLink>
);

const getInitials = (name = '') => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function StudentLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const links = [
    { to: '/student/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/student/halls', icon: Building, label: 'View Halls' },
    { to: '/student/schedule', icon: BookOpen, label: 'Schedule' },
    { to: '/student/profile', icon: Settings, label: 'Profile' },
  ];

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform transform ${
          mobileMenuOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          <h2 className="text-xl font-heading font-bold text-primary">
            Student Portal
          </h2>

          <button
            className="lg:hidden text-gray-500"
            onClick={toggleMenu}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 pb-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">

            <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-semibold text-sm">
              {getInitials(user?.name)}
            </div>

            <div className="overflow-hidden">
              <p className="text-m font-semibold text-gray-900 truncate">
                {user?.name}
              </p>

              <p className="text-xs text-secondary font-medium">
                {user?.department || 'Student'}
              </p>
            </div>

          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <SidebarLink
              key={link.to}
              to={link.to}
              icon={link.icon}
              label={link.label}
              onClick={() => setMobileMenuOpen(false)}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:text-red-600" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col lg:ml-64 w-full relative min-h-screen">
        <header className="h-16 bg-white sticky top-0 z-30 flex items-center justify-between px-6 border-b border-gray-200 shadow-sm">

          <button
            className="lg:hidden text-gray-500 hover:text-gray-800"
            onClick={toggleMenu}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden lg:block text-sm font-medium text-gray-500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </header>

        <div className="p-6 md:p-8 flex-1 w-full max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}