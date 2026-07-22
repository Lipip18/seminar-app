import {
    BookOpen,
    Building,
    Calendar,
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

export default function FacultyLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const links = [
    { to: '/faculty/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/faculty/halls', icon: Building, label: 'View Halls' },
    { to: '/faculty/book', icon: BookOpen, label: 'Book Hall' },
    { to: '/faculty/calendar', icon: Calendar, label: 'My Calendar' },
    { to: '/faculty/profile', icon: Settings, label: 'Profile' },
  ];

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <div className="flex min-h-screen bg-slate-50 text-foreground">
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
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Faculty workspace</p>
            <h2 className="text-xl font-heading font-bold text-primary">
              Faculty Portal
            </h2>
          </div>
          <button
            className="lg:hidden text-gray-500"
            onClick={toggleMenu}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 pb-4">
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
            <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-semibold text-sm">
              {getInitials(user?.name)}
            </div>

            <div className="overflow-hidden">
              <p className="text-m font-semibold text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-secondary font-medium">
                {user?.department || 'Faculty'}
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

        <div className="border-t border-gray-200 p-4">
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

        <div className="mx-auto flex-1 w-full max-w-7xl p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}