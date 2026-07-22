import { useContext, useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthContext } from "../../context/AuthContext";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student",
  });

  const [showPassword, setShowPassword] = useState(false);

  const { email, password, role } = formData;

  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const onChange = (e) =>
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  // Redirect after successful login
  useEffect(() => {
    if (user?.role) {
      const role = user.role.toLowerCase();

      console.log("Redirecting with role:", role);

      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "faculty") {
        navigate("/faculty/dashboard");
      } else if (role === "student") {
        navigate("/student/dashboard");
      }
    }
  }, [user, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return toast.error("Please enter email and password");
    }

    try {
      const res = await login(email, password, role);

      console.log("LOGIN RESPONSE:", res);

      // Redirect handled by useEffect
    } catch (err) {
      console.error(err);
      toast.error("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10 sm:px-6">
      <div className="absolute left-4 top-4 sm:left-8 sm:top-8">
        <Link
          to="/"
          className="font-semibold text-indigo-600 transition hover:text-indigo-800"
        >
          ← Back to Home
        </Link>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-500">Sign in to manage bookings, halls, and schedules.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Role */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Sign in as</label>
            <select
              name="role"
              value={role}
              onChange={onChange}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="admin">Admin</option>
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email address</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Password with Eye Button */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={onChange}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 pr-12 text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-indigo-600"
              >
                {showPassword ? (
                  <FaEyeSlash size={18} />
                ) : (
                  <FaEye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 p-3 font-semibold text-white transition duration-200 hover:bg-indigo-700"
          >
            Sign in
          </button>
        </form>

        {/* Register Link */}
        <p className="mt-5 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-indigo-600 transition hover:text-indigo-800"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}