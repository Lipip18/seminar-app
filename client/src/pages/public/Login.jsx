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
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      {/* Back Button */}
      <div className="absolute top-8 left-8">
        <Link
          to="/"
          className="text-indigo-600 font-semibold hover:text-indigo-800"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md p-8 bg-white shadow-xl rounded-xl">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-900">
          Welcome Back
        </h2>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Role */}
          <select
            name="role"
            value={role}
            onChange={onChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="admin">Admin</option>
            <option value="faculty">Faculty</option>
            <option value="student">Student</option>
          </select>

          {/* Email */}
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            placeholder="Email"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          {/* Password with Eye Button */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Password"
              className="w-full p-3 border rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
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

          {/* Login Button */}
          <button
            type="submit"
            className="w-full p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
          >
            Login
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center mt-4 text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-600 font-medium hover:text-indigo-800"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}