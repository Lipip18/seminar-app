import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthContext } from "../../context/AuthContext";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student",
  });

  const { email, password, role } = formData;

  const { login, user } = useContext(AuthContext); // ✅ IMPORTANT
  const navigate = useNavigate();

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ 🔥 FINAL REDIRECT FIX (THIS SOLVES YOUR ISSUE)
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
  }, [user, navigate]); // ✅ TRIGGERS AFTER LOGIN

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return toast.error("Please enter email and password");
    }
    const res = await login(email, password, role);
console.log("LOGIN RESPONSE:", res);

    try {
      await login(email, password, role);

      // ❌ DO NOT REDIRECT HERE
      // redirect will happen automatically via useEffect

    } catch (err) {
      console.error(err);
      toast.error("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">

      {/* Back */}
      <div className="absolute top-8 left-8">
        <Link to="/" className="text-indigo-600 font-semibold">
          ← Back to Home
        </Link>
      </div>

      {/* Card */}
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
            className="w-full p-3 border rounded-lg"
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
            className="w-full p-3 border rounded-lg"
            required
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            placeholder="Password"
            className="w-full p-3 border rounded-lg"
            required
          />

          {/* Button */}
          <button
            type="submit"
            className="w-full p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-600">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}