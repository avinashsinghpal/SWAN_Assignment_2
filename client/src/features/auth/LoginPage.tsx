import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from './AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BarFieldVisualization } from '@/components/common/BarFieldVisualization';
import { PRODUCT_NAME } from '@/constants/app';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/app/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Invalid email or password';
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
        <div className="my-auto py-8 w-full max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-text-primary mb-2">
              Sign in to your workspace
            </h1>
            <p className="text-sm text-text-secondary">
              Enter your credentials to access your tasks and team metrics.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />

            <div className="w-full flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-text-secondary">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 pr-11 py-2.5 rounded-xl border border-border bg-white text-sm text-text-primary placeholder:text-text-muted transition-colors outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 stroke-[1.5]" />
                  ) : (
                    <Eye className="w-4 h-4 stroke-[1.5]" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign in
              <ArrowRight className="w-4 h-4 stroke-[1.5]" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Create an account
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

      {/* Right Decorative Panel with Bar-Field */}
      <div className="hidden lg:flex flex-col justify-between bg-surface border-l border-border p-10 lg:p-14 min-h-screen">
        <div className="shrink-0" />

        <div className="my-auto max-w-lg w-full mx-auto space-y-6">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-primary font-semibold block mb-3">
              STREAMLINED PRODUCTIVITY
            </span>
            <h2 className="text-3xl font-medium tracking-tight text-text-primary leading-tight mb-3">
              A serene, reliable home for every task and milestone.
            </h2>
            <p className="text-text-secondary text-base leading-relaxed">
              Keep assignments transparent, deadlines visible, and your team aligned in one calm system.
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
