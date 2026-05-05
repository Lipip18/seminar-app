import { Route, Routes } from 'react-router-dom';

// Auth Route Wrappers
import RoleRoute from './RoleRoute';

// Layouts
import AdminLayout from '../components/layout/AdminLayout';
import FacultyLayout from '../components/layout/FacultyLayout';
import StudentLayout from '../components/layout/StudentLayout';

// Public Pages
import NotFound from '../pages/NotFound';
import Home from '../pages/public/Home';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';

// Admin Pages
import AdminCalendar from "../pages/admin/Calendar";
import AdminDashboard from "../pages/admin/Dashboard";
import ManageBookings from "../pages/admin/ManageBookings";
import ManageHalls from "../pages/admin/ManageHalls";
import ManageUsers from "../pages/admin/ManageUsers";
import AdminProfile from "../pages/admin/Profile"; // ✅ FIX ADDED

// Faculty Pages
import FacultyBookHall from '../pages/faculty/BookHall';
import FacultyCalendar from '../pages/faculty/Calendar';
import FacultyDashboard from '../pages/faculty/Dashboard';
import FacultyProfile from '../pages/faculty/Profile';
import FacultyViewHalls from '../pages/faculty/ViewHalls';

// Student Pages
import StudentDashboard from '../pages/student/Dashboard';
import StudentProfile from '../pages/student/Profile';
import StudentSchedule from '../pages/student/Schedule';
import StudentViewHalls from '../pages/student/ViewHalls';

export default function AppRoutes() {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <RoleRoute allowedRoles={['admin']}> {/* ✅ FIX lowercase */}
            <AdminLayout />
          </RoleRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="halls" element={<ManageHalls />} />
        <Route path="bookings" element={<ManageBookings />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="calendar" element={<AdminCalendar />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* Faculty Routes */}
      <Route 
        path="/faculty" 
        element={
          <RoleRoute allowedRoles={['faculty']}> {/* ✅ FIX */}
            <FacultyLayout />
          </RoleRoute>
        }
      >
        <Route path="dashboard" element={<FacultyDashboard />} />
        <Route path="halls" element={<FacultyViewHalls />} />
        <Route path="book" element={<FacultyBookHall />} />
        <Route path="calendar" element={<FacultyCalendar />} />
        <Route path="profile" element={<FacultyProfile />} />
      </Route>

      {/* Student Routes */}
      <Route 
        path="/student" 
        element={
          <RoleRoute allowedRoles={['student']}> {/* ✅ FIX */}
            <StudentLayout />
          </RoleRoute>
        }
      >
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="halls" element={<StudentViewHalls />} />
        <Route path="schedule" element={<StudentSchedule />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}