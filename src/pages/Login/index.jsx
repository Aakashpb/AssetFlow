import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import BaseModal from '../../components/Modals/BaseModal';

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('alex.vance@assetflow.com');
  const [password, setPassword] = useState('password');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  
  // Google account picker modal state
  const [isGooglePickerOpen, setIsGooglePickerOpen] = useState(false);

  useEffect(() => {
    // Dynamically insert Google Identity Services script if not already present
    if (!document.getElementById('google-gsi-client')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleAuth;
      document.head.appendChild(script);
    } else {
      initializeGoogleAuth();
    }
  }, []);

  const initializeGoogleAuth = () => {
    if (window.google) {
      /* global google */
      google.accounts.id.initialize({
        client_id: "816937494129-qlo971fs0eavbk195e0fu3fkak01pfrh.apps.googleusercontent.com",
        callback: handleGoogleCredentialResponse,
      });
    }
  };

  const handleGoogleCredentialResponse = (response) => {
    setLoading(true);
    setTimeout(() => {
      loginWithGoogle({
        email: 'corporate.user@assetflow.com',
        name: 'Corporate User',
        department: 'IT Operations'
      });
      setLoading(false);
      show('Google Sign In Complete', 'Signed in successfully via Google Workspace credentials.', 'success');
      navigate('/');
    }, 800);
  };

  const handleGoogleAccountSelect = (selectedEmail, name, dept) => {
    setIsGooglePickerOpen(false);
    setLoading(true);
    
    // Simulate database transaction latency
    setTimeout(() => {
      loginWithGoogle({
        email: selectedEmail,
        name: name,
        department: dept
      });
      setLoading(false);
      show('Google Sign In Complete', `Signed in successfully as ${selectedEmail}.`, 'success');
      navigate('/');
    }, 850);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const response = login(email, password);
      setLoading(false);

      if (response.success) {
        show('Sign In Successful', 'Welcome to the AssetFlow Enterprise Workspace.', 'success');
        navigate('/');
      } else {
        show('Authentication Failed', response.error, 'error');
      }
    }, 600);
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    show('Password Reset Sent', `If an account exists for ${forgotEmail}, a password recovery link has been dispatched.`, 'info');
    setIsForgotOpen(false);
    setForgotEmail('');
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
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-textSecondary" htmlFor="password">Password</label>
                <button 
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  className="text-xs text-primary hover:underline font-semibold bg-transparent border-0 cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <input 
                type="password" 
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-3 border border-borderCol rounded-md bg-inputBg text-textPrimary text-sm focus:border-primary focus:outline-none transition-all"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-borderCol text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                disabled={loading}
              />
              <label htmlFor="remember" className="text-xs text-textSecondary cursor-pointer select-none">
                Remember Me
              </label>
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
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Social separator */}
          <div className="relative my-2 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-borderCol"></div>
            </div>
            <span className="relative px-3 bg-cardBg text-xs text-textSecondary uppercase">Or</span>
          </div>

          {/* Google SSO Button triggering account selection popup */}
          <div className="space-y-3">
            <button 
              type="button"
              onClick={() => setIsGooglePickerOpen(true)}
              className="btn btn-secondary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer border border-borderCol hover:bg-hoverBg hover-btn-scale"
              disabled={loading}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="text-center text-xs text-textSecondary mt-2">
            Don't have a workspace? <a href="#/register" className="text-primary font-semibold hover:underline">Create Account</a>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <BaseModal isOpen={isForgotOpen} onClose={() => setIsForgotOpen(false)} title="Reset Workspace Password">
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 text-left">
          <p className="text-xs text-textSecondary leading-relaxed">
            Provide your corporate email address below. If your account is registered, we'll send a password recovery token.
          </p>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-textSecondary">Corporate Email</label>
            <input 
              type="email" 
              className="form-control"
              placeholder="e.g. alex.vance@assetflow.com"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsForgotOpen(false)} className="btn btn-secondary text-xs">Cancel</button>
            <button type="submit" className="btn btn-primary text-xs">Send Recovery Link</button>
          </div>
        </form>
      </BaseModal>

      {/* Google Account Picker Modal Simulation */}
      <BaseModal isOpen={isGooglePickerOpen} onClose={() => setIsGooglePickerOpen(false)} title="Choose a Google Account">
        <div className="space-y-4 text-left">
          <p className="text-xs text-textSecondary leading-relaxed">
            to continue securely to <strong>AssetFlow – Enterprise Asset Management</strong>
          </p>

          <div className="divide-y divide-borderCol">
            {/* Account 1 */}
            <button 
              type="button"
              onClick={() => handleGoogleAccountSelect('alex.vance@assetflow.com', 'Alexander Vance', 'Executive Office')}
              className="w-full flex items-center gap-3.5 py-3 hover:bg-hoverBg/50 text-left cursor-pointer transition-colors px-1"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                AV
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-textPrimary">Alexander Vance</div>
                <div className="text-[10px] text-textSecondary">alex.vance@assetflow.com</div>
              </div>
              <span className="text-[10px] text-emerald-500 font-semibold px-2 py-0.5 bg-emerald-500/10 rounded-full">Signed In</span>
            </button>

            {/* Account 2 */}
            <button 
              type="button"
              onClick={() => handleGoogleAccountSelect('corporate.user@assetflow.com', 'Corporate User', 'IT Operations')}
              className="w-full flex items-center gap-3.5 py-3 hover:bg-hoverBg/50 text-left cursor-pointer transition-colors px-1"
            >
              <div className="w-9 h-9 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-bold text-xs">
                CU
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-textPrimary">Corporate User</div>
                <div className="text-[10px] text-textSecondary">corporate.user@assetflow.com</div>
              </div>
              <span className="text-[10px] text-textMuted px-2 py-0.5 bg-hoverBg rounded-full">Logged Out</span>
            </button>
          </div>

          <button 
            type="button"
            onClick={() => handleGoogleAccountSelect('new.member@assetflow.com', 'New Employee', 'Research & Development')}
            className="w-full text-center text-xs text-primary font-semibold py-2 hover:underline cursor-pointer border border-dashed border-borderCol rounded-md"
          >
            Use another account
          </button>
        </div>
      </BaseModal>
    </div>
  );
};

export default Login;
