import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Register = () => {
  const { user, register } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user]);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'Research & Development'
  });
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (form.password.length < 6) {
      show('Validation Warning', 'Password must be at least 6 characters long.', 'error');
      return;
    }

    if (form.password !== form.confirmPassword) {
      show('Validation Warning', 'Passwords do not match. Please verify.', 'error');
      return;
    }

    setLoading(true);

    // Simulate database transaction latency
    setTimeout(() => {
      const response = register(form.name, form.email, form.password, form.department);
      setLoading(false);

      if (response.success) {
        show('Registration Complete', 'Corporate user account provisioned successfully.', 'success');
        navigate('/login');
      } else {
        show('Registration Failed', response.error, 'error');
      }
    }, 800);
  };

  return (
    <div className="flex min-h-screen w-screen bg-mainBg">
      {/* Sidebar marketing panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-sidebarBg to-indigo-950 text-white flex-[1.2] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(37,99,235,0.15),transparent_70%)] blur-2xl" />
        
        <div className="flex items-center gap-3 z-10">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold text-lg">
            AF
          </div>
          <span className="font-heading font-bold text-xl">AssetFlow</span>
        </div>

        <div className="max-w-md z-10 text-left my-auto">
          <h2 className="font-heading font-bold text-3xl xl:text-4xl text-white leading-tight mb-4">
            Join the Enterprise Intelligence Network.
          </h2>
          <p className="text-slate-400 text-sm xl:text-base leading-relaxed">
            Create an account to register resources, schedule bookings, request departmental transfers, and maintain corporate compliance.
          </p>
        </div>

        <div className="text-xs text-slate-500 z-10 text-left">
          &copy; 2026 AssetFlow Technologies. All rights reserved.
        </div>
      </div>

      {/* Auth Form Card */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 bg-cardBg">
        <div className="w-full max-w-sm flex flex-col gap-6 text-left">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold text-lg">
              AF
            </div>
            <span className="font-heading font-bold text-xl text-textPrimary">AssetFlow</span>
          </div>

          <div>
            <h1 className="font-heading font-bold text-2xl text-textPrimary">Create workspace account</h1>
            <p className="text-textSecondary text-sm mt-1">Submit your details to request workspace credentials.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-textSecondary">Full Name</label>
              <input 
                type="text" 
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                className="form-control text-sm"
                placeholder="e.g. Alexander Vance"
                required
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-textSecondary">Corporate Email</label>
              <input 
                type="email" 
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                className="form-control text-sm"
                placeholder="e.g. alex.vance@assetflow.com"
                required
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-textSecondary">Department Unit</label>
              <select
                value={form.department}
                onChange={(e) => setForm({...form, department: e.target.value})}
                className="form-control text-sm"
                disabled={loading}
              >
                <option value="Research & Development">Research & Development</option>
                <option value="IT Operations">IT Operations</option>
                <option value="Operations">Operations</option>
                <option value="Legal">Legal</option>
                <option value="Executive Office">Executive Office</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-textSecondary">Password</label>
                <input 
                  type="password" 
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  className="form-control text-sm"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-textSecondary">Confirm Password</label>
                <input 
                  type="password" 
                  value={form.confirmPassword}
                  onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                  className="form-control text-sm"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full py-3 mt-2 text-sm font-semibold cursor-pointer flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing Setup...</span>
                </>
              ) : (
                <span>Register Account</span>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-textSecondary">
            Already have an account? <a href="#/login" className="text-primary font-semibold hover:underline">Sign In</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
