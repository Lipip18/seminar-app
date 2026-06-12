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

      const userRole = res.user.role?.toLowerCase();

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
    <div className="min-h-screen flex items-center justify-center py-12 px-6 bg-background">
      <div className="glass-panel w-full max-w-2xl p-8 md:p-10 bg-white border border-gray-200 shadow-xl">
        <h2 className="text-3xl font-heading font-bold text-center text-gray-900 mb-2">
          Create Account
        </h2>

        <p className="text-gray-500 text-center mb-8">
          Join the platform as a Faculty or Student
        </p>

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
              className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-secondary transition-all outline-none text-gray-900"
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
              className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-secondary transition-all outline-none text-gray-900"
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
                className="w-full p-3 pr-12 rounded-lg bg-gray-50 border border-gray-200 focus:border-secondary transition-all outline-none text-gray-900"
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
                className="w-full p-3 pr-12 rounded-lg bg-gray-50 border border-gray-200 focus:border-secondary transition-all outline-none text-gray-900"
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
              className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-secondary transition-all appearance-none outline-none text-gray-900"
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
              className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-secondary transition-all outline-none text-gray-900"
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
              className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-secondary transition-all outline-none text-gray-900"
            />
          </div>

          {/* Register Button */}
          <div className="col-span-2 mt-4">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-secondary text-white font-bold tracking-wide hover:bg-secondary/90 transition-all shadow-md transform hover:-translate-y-[1px]"
            >
              REGISTER
            </button>
          </div>
        </form>

        <div className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-secondary hover:text-primary transition-colors font-semibold"
          >
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}