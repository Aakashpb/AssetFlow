import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Shield } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('alex.vance@assetflow.com');
  const [password, setPassword] = useState('password');

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login(email, password);
    if (success) {
      show('Sign In Successful', 'Welcome to the AssetFlow Enterprise Workspace.', 'success');
      navigate('/');
    } else {
      show('Authentication Failed', 'Invalid corporate credentials. Please try again.', 'error');
    }
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
            Enterprise Resource & Asset Intelligence.
          </h2>
          <p className="text-slate-400 text-sm xl:text-base leading-relaxed">
            Streamline lifecycle tracking, maintenance workflows, resource scheduling, and compliance audits in a unified, modern interface.
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
            <h1 className="font-heading font-bold text-2xl text-textPrimary">Sign in to workspace</h1>
            <p className="text-textSecondary text-sm mt-1">Enter your corporate credentials to access AssetFlow.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-textSecondary" htmlFor="email">Corporate Email</label>
              <input 
                type="email" 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-3 border border-borderCol rounded-md bg-inputBg text-textPrimary text-sm focus:border-primary focus:outline-none transition-all"
                placeholder="username@assetflow.com"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-textSecondary" htmlFor="password">Password</label>
                <a href="#forgot" className="text-xs text-primary hover:underline">Forgot?</a>
              </div>
              <input 
                type="password" 
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-3 border border-borderCol rounded-md bg-inputBg text-textPrimary text-sm focus:border-primary focus:outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full py-3 mt-2 text-sm font-semibold cursor-pointer"
            >
              Sign In
            </button>
          </form>

          <div className="text-center text-xs text-textSecondary">
            Don't have a workspace? <a href="#request" className="text-primary font-semibold hover:underline">Request setup</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
