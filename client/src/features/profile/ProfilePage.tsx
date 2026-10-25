import React, { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, KeyRound } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { toast } from 'sonner';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();

  // Profile update state
  const [name, setName] = useState(user?.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const res = await api.patch('/auth/me', { name: name.trim() });
      updateUser(res.data.data.user);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8 || !/(?=.*[A-Za-z])(?=.*\d)/.test(newPassword)) {
      toast.error('Password must be at least 8 characters and contain at least one letter and one number');
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.patch('/auth/me/password', {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      toast.success('Password changed successfully. Please sign in again.');
      // Session revoked on password change
      window.location.href = '/login';
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-xl font-medium tracking-tight text-text-primary">
          Account Settings
        </h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Manage your personal profile and security credentials.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 rounded-2xl bg-white border border-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary font-mono text-lg font-semibold flex items-center justify-center">
            {getInitials(user?.name)}
          </div>
          <div>
            <h3 className="text-base font-medium text-text-primary">{user?.name}</h3>
            <span className="text-xs text-text-muted">{user?.email}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-medium uppercase tracking-wider bg-navy/10 text-navy border border-navy/20">
            <ShieldCheck className="w-3.5 h-3.5 stroke-[1.5]" />
            {user?.role}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-medium bg-success/10 text-success border border-success/20">
            Active
          </span>
        </div>
      </div>

      {/* Update Name Form */}
      <div className="p-6 rounded-2xl bg-white border border-border">
        <h3 className="text-base font-medium text-text-primary mb-1">Display Name</h3>
        <p className="text-xs text-text-secondary mb-4">
          This name is shown across assigned tasks, audit logs, and team discussions.
        </p>

        <form onSubmit={handleUpdateName} className="space-y-4">
          <Input
            label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="sm" isLoading={isUpdatingProfile}>
              Save changes
            </Button>
          </div>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="p-6 rounded-2xl bg-white border border-border">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound className="w-4 h-4 text-text-primary stroke-[1.5]" />
          <h3 className="text-base font-medium text-text-primary">Change Password</h3>
        </div>
        <p className="text-xs text-text-secondary mb-4">
          Changing your password will invalidate active sessions and require re-authentication.
        </p>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            placeholder="Enter current password"
          />

          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="At least 8 characters (letters + numbers)"
          />

          <Input
            label="Confirm new password"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
            placeholder="Re-enter new password"
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              isLoading={isChangingPassword}
              className="border-border hover:border-text-muted"
            >
              Update password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
