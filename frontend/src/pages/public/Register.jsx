import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'sonner';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Student', // Default mapping
    department: '',
    phone: '',
  });
  
  const { name, email, password, confirmPassword, role, department, phone } = formData;
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if(password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    
    try {
      const res = await register({
        name, email, password, role, department, phone
      });
      // Redirect based on role
      const userRole = res.user.role;
      if (userRole === 'Faculty') navigate('/faculty/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      // Error handled by context toaster
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-6">
      <div className="glass-panel w-full max-w-2xl p-8 md:p-10">
        <h2 className="text-3xl font-heading font-bold text-center text-white mb-2">Create Account</h2>
        <p className="text-muted-foreground text-center mb-8">Join the platform as a Faculty or Student</p>

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium mb-1 text-white/90">Full Name</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={onChange}
              className="w-full p-3 rounded-lg bg-card/80 border border-border focus:border-secondary transition-all"
              required
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium mb-1 text-white/90">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              className="w-full p-3 rounded-lg bg-card/80 border border-border focus:border-secondary transition-all"
              required
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium mb-1 text-white/90">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              className="w-full p-3 rounded-lg bg-card/80 border border-border focus:border-secondary transition-all"
              required minLength="6"
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium mb-1 text-white/90">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              className="w-full p-3 rounded-lg bg-card/80 border border-border focus:border-secondary transition-all"
              required minLength="6"
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium mb-1 text-white/90">Role</label>
            <select
              name="role"
              value={role}
              onChange={onChange}
              className="w-full p-3 rounded-lg bg-card/80 border border-border focus:border-secondary transition-all appearance-none"
            >
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
            </select>
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium mb-1 text-white/90">Department</label>
            <input
              type="text"
              name="department"
              value={department}
              onChange={onChange}
              className="w-full p-3 rounded-lg bg-card/80 border border-border focus:border-secondary transition-all"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1 text-white/90">Phone number (optional)</label>
            <input
              type="text"
              name="phone"
              value={phone}
              onChange={onChange}
              className="w-full p-3 rounded-lg bg-card/80 border border-border focus:border-secondary transition-all"
            />
          </div>

          <div className="col-span-2 mt-4">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-secondary text-white font-bold tracking-wide hover:bg-secondary/90 transition-all"
            >
              REGISTER
            </button>
          </div>
        </form>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-secondary hover:text-white transition-colors font-semibold">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
