import {
  Building,
  Calendar,
  CreditCard,
  Home,
  LogOut,
  Menu,
  Settings,
  Users,
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
          : 'text-muted-foreground hover:bg-white/5 hover:text-white'
      }`
    }
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
  </NavLink>
);

export default function DashboardLayout({ role }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const adminLinks = [
    { to: '/admin/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/admin/halls', icon: Building, label: 'Manage Halls' },
    { to: '/admin/bookings', icon: CreditCard, label: 'Manage Bookings' },
    { to: '/admin/users', icon: Users, label: 'Manage Users' },
    { to: '/admin/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/admin/profile', icon: Settings, label: 'Profile' },
  ];

  const facultyLinks = [
    { to: '/faculty/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/faculty/halls', icon: Building, label: 'Browse Halls' },
    { to: '/faculty/book', icon: CreditCard, label: 'Book Hall' },
    { to: '/faculty/calendar', icon: Calendar, label: 'My Calendar' },
    { to: '/faculty/profile', icon: Settings, label: 'Profile' },
  ];

  const studentLinks = [
    { to: '/student/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/student/halls', icon: Building, label: 'View Halls' },
    { to: '/student/schedule', icon: Calendar, label: 'Schedule' },
    { to: '/student/profile', icon: Settings, label: 'Profile' },
  ];

  const links = 
    role === 'Admin' ? adminLinks : 
    role === 'Faculty' ? facultyLinks : 
    studentLinks;

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 glass border-r-0 border-r-white/5 flex flex-col transition-transform transform ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          <h2 className="text-xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary">
            Seminar<br/>System
          </h2>
          <button className="lg:hidden text-white" onClick={toggleMenu}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 pb-4">
           <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
              <div className="overflow-hidden">
                 <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                 <p className="text-xs text-accent">{user?.role}</p>
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

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-muted-foreground hover:bg-destructive/20 hover:text-white transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:text-red-400" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:ml-64 w-full relative min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 glass sticky top-0 z-30 flex items-center justify-between px-6 border-b border-b-white/5 border-l-0 border-t-0 border-r-0">
          <button className="lg:hidden text-white" onClick={toggleMenu}>
             <Menu className="w-6 h-6" />
          </button>
          <div className="hidden lg:block text-sm font-medium text-muted-foreground">
             {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 md:p-8 flex-1 w-full max-w-7xl mx-auto">
           <Outlet />
        </div>
      </main>
    </div>
  );
}
