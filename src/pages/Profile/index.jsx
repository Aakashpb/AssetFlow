import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { User, Shield, Mail, Key, ShieldCheck } from 'lucide-react';

const Profile = () => {
  const { user, changeSimulatedRole } = useAuth();
  const { show } = useToast();

  const [form, setForm] = useState({
    name: user?.name || 'Alexander Vance',
    email: user?.email || 'alex.vance@assetflow.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdateInfo = (e) => {
    e.preventDefault();
    show('Profile Updated', 'Corporate profile information saved.', 'success');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      show('Mismatch Error', 'New passwords do not match.', 'error');
      return;
    }
    show('Password Changed', 'Security credentials updated successfully.', 'success');
    setForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold font-heading text-textPrimary">User Settings</h2>
        <p className="text-xs text-textSecondary">Manage your account details, change passwords, and simulate workflows.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Details Card */}
        <div className="bg-cardBg border border-borderCol rounded-lg shadow-sm p-6 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary text-white font-bold text-2xl flex items-center justify-center border-4 border-hoverBg shadow-sm">
            {user?.avatar || 'AV'}
          </div>
          <h3 className="font-heading font-semibold text-lg text-textPrimary mt-4">{user?.name}</h3>
          <p className="text-xs text-textMuted">{user?.email}</p>
          
          <div className="mt-6 w-full divide-y divide-borderCol text-xs text-left">
            <div className="py-2.5 flex justify-between">
              <span className="text-textSecondary">System Role</span>
              <strong className="text-textPrimary font-semibold">{user?.role}</strong>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-textSecondary">Active Workspace</span>
              <strong className="text-textPrimary font-semibold">HQ - Global Ops</strong>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-textSecondary">System Security</span>
              <strong className="text-emerald-500 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Compliant
              </strong>
            </div>
          </div>
        </div>

        {/* Change info form */}
        <div className="lg:col-span-2 bg-cardBg border border-borderCol rounded-lg shadow-sm p-6 space-y-6">
          <form onSubmit={handleUpdateInfo} className="space-y-4">
            <h4 className="font-heading font-semibold text-sm text-textPrimary flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Profile Information
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-textSecondary">Full Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-textSecondary">Corporate Email</label>
                <input 
                  type="email" 
                  className="form-control"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  required
                  disabled
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <button type="submit" className="btn btn-primary text-xs font-semibold cursor-pointer">Save Changes</button>
            </div>
          </form>

          {/* Change Password form */}
          <form onSubmit={handleChangePassword} className="border-t border-borderCol pt-6 space-y-4">
            <h4 className="font-heading font-semibold text-sm text-textPrimary flex items-center gap-2">
              <Key className="w-4 h-4 text-warning" /> Security Credentials
            </h4>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-textSecondary">Current Password</label>
              <input 
                type="password" 
                className="form-control"
                value={form.currentPassword}
                onChange={(e) => setForm({...form, currentPassword: e.target.value})}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-textSecondary">New Password</label>
                <input 
                  type="password" 
                  className="form-control"
                  value={form.newPassword}
                  onChange={(e) => setForm({...form, newPassword: e.target.value})}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-textSecondary">Confirm New Password</label>
                <input 
                  type="password" 
                  className="form-control"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <button type="submit" className="btn btn-primary text-xs font-semibold cursor-pointer">Change Password</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
