import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'sonner';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'Student', // Default
  });
  
  const { email, password, role } = formData;
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
        return toast.error("Please enter email and password");
    }
    try {
      const res = await login(email, password, role);
      // Redirect based on role
      const userRole = res.user.role;
      if (userRole === 'Admin') navigate('/admin/dashboard');
      else if (userRole === 'Faculty') navigate('/faculty/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
       // Handled by context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute top-8 left-8">
         <Link to="/" className="text-secondary hover:text-accent font-semibold flex items-center gap-2">
            &larr; Back to Home
         </Link>
      </div>

      <div className="glass-panel w-full max-w-md p-8 md:p-10 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/30 rounded-full blur-3xl -mx-10 -my-10 z-0"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl -mx-10 -my-10 z-0"></div>

        <div className="relative z-10">
          <h2 className="text-3xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-white mb-2 text-center">
            Welcome Back
          </h2>
          <p className="text-muted-foreground text-center mb-8">Sign in to manage your seminar halls</p>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                name="role"
                value={role}
                onChange={onChange}
                className="w-full p-3 rounded-lg bg-card/80 border border-border focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all appearance-none"
              >
                <option value="Admin">Admin</option>
                <option value="Faculty">Faculty</option>
                <option value="Student">Student</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-white/90">Email Address</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                className="w-full p-3 rounded-lg bg-card/80 border border-border focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all text-white placeholder-white/30"
                placeholder="you@university.edu"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex justify-between">
                 <span className="text-white/90">Password</span>
                 <a href="#" className="text-xs tracking-wider text-secondary hover:text-accent transition-colors">Forgot Password?</a>
              </label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                className="w-full p-3 rounded-lg bg-card/80 border border-border focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all text-white placeholder-white/30"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-4 rounded-xl relative overflow-hidden group bg-secondary hover:bg-secondary/90 transition-all shadow-[0_4px_20px_rgba(79,70,229,0.3)]"
            >
               <span className="relative z-10 font-bold tracking-wide">SIGN IN</span>
            </button>
          </form>

          <div className="text-center mt-8 text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent hover:text-white font-semibold transition-colors">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
