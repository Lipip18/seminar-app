import { useContext, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthContext } from '../../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Student',
    department: '',
    phone: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { name, email, password, confirmPassword, role, department, phone } =
    formData;

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const onChange = (e) =>
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    try {
      const res = await register({
        name,
        email,
        password,
        role,
        department,
        phone,
      });

      console.log('REGISTER RESPONSE:', res);

      const userRole = res.role?.toLowerCase();

      if (userRole === 'faculty') {
        navigate('/faculty/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      console.log('REGISTER ERROR:', err);
      toast.error(
        err?.response?.data?.message || 'Registration failed'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6">
      <div className="glass-panel w-full max-w-2xl border border-gray-200 bg-white p-8 shadow-xl md:p-10">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-heading font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-gray-500">
            Join the platform as a faculty member or student.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Full Name */}
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={onChange}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-900 outline-none transition-all focus:border-secondary"
              required
            />
          </div>

          {/* Email */}
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-900 outline-none transition-all focus:border-secondary"
              required
            />
          </div>

          {/* Password */}
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={onChange}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 pr-12 text-gray-900 outline-none transition-all focus:border-secondary"
                required
                minLength="6"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600"
              >
                {showPassword ? (
                  <FaEyeSlash size={18} />
                ) : (
                  <FaEye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={confirmPassword}
                onChange={onChange}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 pr-12 text-gray-900 outline-none transition-all focus:border-secondary"
                required
                minLength="6"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600"
              >
                {showConfirmPassword ? (
                  <FaEyeSlash size={18} />
                ) : (
                  <FaEye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Role */}
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Role
            </label>
            <select
              name="role"
              value={role}
              onChange={onChange}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-900 outline-none transition-all focus:border-secondary"
            >
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
            </select>
          </div>

          {/* Department */}
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={department}
              onChange={onChange}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-900 outline-none transition-all focus:border-secondary"
              required
            />
          </div>

          {/* Phone */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Phone Number (Optional)
            </label>
            <input
              type="text"
              name="phone"
              value={phone}
              onChange={onChange}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-900 outline-none transition-all focus:border-secondary"
            />
          </div>

          {/* Register Button */}
          <div className="col-span-2 mt-4">
            <button
              type="submit"
              className="w-full rounded-xl bg-secondary py-3 font-bold tracking-wide text-white shadow-md transition-all hover:-translate-y-[1px] hover:bg-secondary/90"
            >
              REGISTER
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-secondary transition-colors hover:text-primary"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}