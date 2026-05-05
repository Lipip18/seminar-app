import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

// Layouts & Context
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/routing/ProtectedRoute';

// Pages - Public
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Pages - Admin
import AdminDashboard from './pages/admin/AdminDashboard';

// Pages - Faculty
import FacultyDashboard from './pages/faculty/FacultyDashboard';

// Pages - Student
import StudentDashboard from './pages/student/StudentDashboard';

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" theme="dark" richColors />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute role="Admin"><DashboardLayout role="Admin" /></ProtectedRoute>}>
             <Route path="dashboard" element={<AdminDashboard />} />
             <Route path="halls" element={<div className="text-white">Admin Manage Halls (Coming Soon)</div>} />
             <Route path="bookings" element={<div className="text-white">Admin Manage Bookings (Coming Soon)</div>} />
             <Route path="users" element={<div className="text-white">Admin Manage Users (Coming Soon)</div>} />
             <Route path="calendar" element={<div className="text-white">Admin Calendar (Coming Soon)</div>} />
             <Route path="profile" element={<div className="text-white">Admin Profile (Coming Soon)</div>} />
          </Route>

          {/* Faculty Routes */}
          <Route path="/faculty" element={<ProtectedRoute role="Faculty"><DashboardLayout role="Faculty" /></ProtectedRoute>}>
             <Route path="dashboard" element={<FacultyDashboard />} />
             <Route path="halls" element={<div className="text-white">Faculty View Halls (Coming Soon)</div>} />
             <Route path="book" element={<div className="text-white">Faculty Book Hall (Coming Soon)</div>} />
             <Route path="calendar" element={<div className="text-white">Faculty Calendar (Coming Soon)</div>} />
             <Route path="profile" element={<div className="text-white">Faculty Profile (Coming Soon)</div>} />
          </Route>

          {/* Student Routes */}
          <Route path="/student" element={<ProtectedRoute role="Student"><DashboardLayout role="Student" /></ProtectedRoute>}>
             <Route path="dashboard" element={<StudentDashboard />} />
             <Route path="halls" element={<div className="text-white">Student View Halls (Coming Soon)</div>} />
             <Route path="schedule" element={<div className="text-white">Student Schedule (Coming Soon)</div>} />
             <Route path="profile" element={<div className="text-white">Student Profile (Coming Soon)</div>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<div className="text-center p-20 text-white font-bold text-2xl">404 - Page Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
