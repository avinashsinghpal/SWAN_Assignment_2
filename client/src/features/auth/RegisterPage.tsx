import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAuth } from './AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BarFieldVisualization } from '@/components/common/BarFieldVisualization';
import { PRODUCT_NAME } from '@/constants/app';

function evaluatePasswordStrength(password: string): { label: 'Weak' | 'Fair' | 'Strong'; color: string; width: string } {
  if (password.length < 8) {
    return { label: 'Weak', color: '#D92D20', width: '33%' };
  }
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  if (hasLetters && hasNumbers && hasSpecial && password.length >= 10) {
    return { label: 'Strong', color: '#16B364', width: '100%' };
  }
  if (hasLetters && hasNumbers) {
    return { label: 'Fair', color: '#D9A100', width: '66%' };
  }
  return { label: 'Weak', color: '#D92D20', width: '33%' };
}

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const strength = evaluatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8 || !/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      setError('Password must be at least 8 characters and contain at least one letter and one number');
      return;
    }

    setIsLoading(true);

    try {
      await register({ name, email, password, confirmPassword, role });
      navigate('/app/dashboard', { replace: true });
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Registration failed. Please check your details.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Left Form Panel */}
      <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-14 max-w-xl mx-auto w-full min-h-screen">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-4 shrink-0">
          <Link to="/" className="inline-flex items-center gap-2.5 group" title="Tasklane Homepage">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                <path d="M8 10h16M8 16h10M8 22h13" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-text-primary">
              {PRODUCT_NAME}
            </span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-black/5 border border-border transition-all cursor-pointer shrink-0"
            title="Return to Landing Page"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Back to home</span>
          </Link>
        </div>

        {/* Center Form Section - Vertically Centered */}
        <div className="my-auto py-6 w-full max-w-md mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-tight text-text-primary mb-2">
              Create your account
            </h1>
            <p className="text-sm text-text-secondary">
              Get started with Tasklane in under a minute.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />

            <Input
              label="Work email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />

            <div>
              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters (letters + numbers)"
              />
              {password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1 flex-1 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{ width: strength.width, backgroundColor: strength.color }}
                    />
                  </div>
                  <span className="font-mono text-[11px] font-medium" style={{ color: strength.color }}>
                    Strength: {strength.label}
                  </span>
                </div>
              )}
            </div>

            <Input
              label="Confirm password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
            />

            {/* Account Role Selector */}
            <div className="w-full flex flex-col gap-1.5 pt-1">
              <label className="font-mono text-xs uppercase tracking-wider text-text-secondary">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    role === 'user'
                      ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                      : 'border-border bg-white text-text-secondary hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs flex items-center gap-1.5 text-text-primary">
                      <UserIcon className="w-3.5 h-3.5 stroke-[1.5] text-primary" />
                      Normal User
                    </span>
                    {role === 'user' && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <span className="text-[11px] text-text-muted leading-tight">
                    Manage assigned tasks & personal backlog
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    role === 'admin'
                      ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                      : 'border-border bg-white text-text-secondary hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs flex items-center gap-1.5 text-text-primary">
                      <ShieldCheck className="w-3.5 h-3.5 stroke-[1.5] text-primary" />
                      Admin
                    </span>
                    {role === 'admin' && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <span className="text-[11px] text-text-muted leading-tight">
                    Full organizational oversight & team controls
                  </span>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Create account
              <ArrowRight className="w-4 h-4 stroke-[1.5]" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-6 border-t border-border flex items-center justify-between text-xs text-text-muted shrink-0">
          <span>{PRODUCT_NAME} &bull; Enterprise Operations</span>
          <Link
            to="/"
            className="hover:text-text-primary flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
            Landing page
          </Link>
        </div>
      </div>

      {/* Right Decorative Panel */}
      <div className="hidden lg:flex flex-col justify-between bg-surface border-l border-border p-10 lg:p-14 min-h-screen">
        <div className="shrink-0" />

        <div className="my-auto max-w-lg w-full mx-auto space-y-6">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-primary font-semibold block mb-3">
              HIGH INTEGRITY SAAS
            </span>
            <h2 className="text-3xl font-medium tracking-tight text-text-primary leading-tight mb-3">
              Built for engineering and design teams who value focus.
            </h2>
            <p className="text-text-secondary text-base leading-relaxed">
              Experience reliable task velocity, instant CSV exports, and granular permission boundaries.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-border shadow-xs">
            <BarFieldVisualization count={44} />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-white border border-border">
              <span className="font-mono text-[11px] text-text-muted uppercase tracking-wider block">Security</span>
              <p className="text-sm font-semibold text-text-primary mt-1">Role-Based Access</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-border">
              <span className="font-mono text-[11px] text-text-muted uppercase tracking-wider block">Real-time</span>
              <p className="text-sm font-semibold text-text-primary mt-1">Kanban & Analytics</p>
            </div>
          </div>
        </div>

        <div className="font-mono text-xs text-text-muted pt-6 border-t border-border shrink-0">
          {PRODUCT_NAME} &bull; Security & Performance First
        </div>
      </div>
    </div>
  );
};
