import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Kanban,
  Users,
  Activity,
  User as UserIcon,
  LogOut,
  Plus,
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { PRODUCT_NAME } from '@/constants/app';
import { Button } from '@/components/ui/Button';
import { TaskDrawer } from '@/features/tasks/components/TaskDrawer';
import { getInitials } from '@/lib/utils';

export const AppShell: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Global Task Drawer State
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Global search input & shortcut
  const [globalSearch, setGlobalSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener for '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle global search enter: redirects to /app/tasks?search=...
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/app/tasks?search=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Tasks', path: '/app/tasks', icon: CheckSquare },
    { label: 'Board', path: '/app/board', icon: Kanban },
    ...(user?.role === 'admin'
      ? [{ label: 'Team', path: '/app/team', icon: Users }]
      : []),
    { label: 'Activity', path: '/app/activity', icon: Activity },
    { label: 'Profile', path: '/app/profile', icon: UserIcon },
  ];

  // Helper to open task drawer in create mode
  const openNewTaskModal = () => {
    setActiveTaskId(null);
    setIsTaskDrawerOpen(true);
  };

  // Listen for custom event to open drawer for editing from anywhere
  useEffect(() => {
    const handleOpenTask = (e: CustomEvent<{ taskId?: string }>) => {
      setActiveTaskId(e.detail?.taskId || null);
      setIsTaskDrawerOpen(true);
    };
    window.addEventListener('open-task-drawer' as any, handleOpenTask);
    return () => window.removeEventListener('open-task-drawer' as any, handleOpenTask);
  }, []);

  const getPageTitle = () => {
    const p = location.pathname;
    if (p.includes('/app/dashboard')) return 'Dashboard';
    if (p.includes('/app/tasks')) return 'Tasks';
    if (p.includes('/app/board')) return 'Board';
    if (p.includes('/app/team')) return 'Team Management';
    if (p.includes('/app/activity')) return 'Activity History';
    if (p.includes('/app/profile')) return 'My Profile';
    return 'Workspace';
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row text-text-primary antialiased">
      {/* 1. Desktop Left Sidebar */}
      <aside
        className={`hidden md:flex flex-col justify-between border-r border-border bg-surface transition-all duration-300 z-30 shrink-0 sticky top-0 h-screen overflow-hidden ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Brand header */}
          <div className="h-16 px-5 border-b border-border flex items-center justify-between shrink-0">
            <NavLink to="/app/dashboard" className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shrink-0">
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                  <path d="M8 10h16M8 16h10M8 22h13" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>
              {!isSidebarCollapsed && (
                <span className="font-extrabold text-xl tracking-tight text-text-primary truncate">
                  {PRODUCT_NAME}
                </span>
              )}
            </NavLink>
            <div className="flex items-center gap-1">
              {!isSidebarCollapsed && (
                <NavLink
                  to="/"
                  className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-black/5 transition-colors cursor-pointer"
                  title="Return to Landing Page"
                >
                  <Home className="w-4 h-4 stroke-[1.5]" />
                </NavLink>
              )}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-black/5 transition-colors cursor-pointer"
                title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isSidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4 stroke-[1.5]" />
                ) : (
                  <ChevronLeft className="w-4 h-4 stroke-[1.5]" />
                )}
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-text-secondary hover:text-text-primary hover:bg-black/5'
                    } ${isSidebarCollapsed ? 'justify-center' : ''}`
                  }
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0 stroke-[1.5]" />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User profile block at bottom - always visible on normal window sizes */}
        <div
          className={`p-3 border-t border-border flex ${
            isSidebarCollapsed ? 'flex-col gap-2 items-center' : 'items-center justify-between gap-1'
          } shrink-0 bg-surface`}
        >
          <NavLink
            to="/app/profile"
            className={({ isActive }) =>
              `rounded-xl flex items-center gap-3 transition-colors ${
                isSidebarCollapsed ? 'p-2 justify-center w-full' : 'flex-1 min-w-0 p-2'
              } ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-black/5 text-text-primary'
              }`
            }
            title={isSidebarCollapsed ? `${user?.name} (${user?.role}) - Open Profile` : 'Open Profile Settings'}
          >
            <div className="w-8 h-8 rounded-full bg-primary/15 text-primary font-mono text-xs font-semibold flex items-center justify-center shrink-0">
              {getInitials(user?.name)}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate text-text-primary">{user?.name}</p>
                <span className="font-mono text-[10px] uppercase tracking-wider text-primary font-medium">
                  {user?.role}
                </span>
              </div>
            )}
          </NavLink>

          <button
            type="button"
            onClick={() => logout()}
            className={`p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer shrink-0 ${
              isSidebarCollapsed ? 'w-full flex justify-center' : ''
            }`}
            title="Sign out"
          >
            <LogOut className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>
      </aside>

      {/* 2. Mobile Top Bar */}
      <div className="md:hidden h-16 bg-white border-b border-border px-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-1.5 text-text-primary hover:bg-surface rounded-lg cursor-pointer"
            aria-label="Open navigation"
          >
            <Menu className="w-6 h-6 stroke-[1.5]" />
          </button>
          <span className="font-extrabold text-xl tracking-tight text-text-primary">
            {PRODUCT_NAME}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <NavLink
            to="/app/profile"
            className="w-8 h-8 rounded-full bg-primary/15 text-primary font-mono text-xs font-semibold flex items-center justify-center border border-primary/20"
            title="My Profile"
          >
            {getInitials(user?.name)}
          </NavLink>
          <Button variant="primary" size="sm" onClick={openNewTaskModal}>
            <Plus className="w-4 h-4 stroke-[1.5]" />
            Task
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-64 bg-white h-full flex flex-col justify-between p-4 z-10 shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <span className="font-extrabold text-xl tracking-tight text-text-primary">
                  {PRODUCT_NAME}
                </span>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-lg text-text-muted hover:text-text-primary cursor-pointer"
                >
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                          isActive
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 stroke-[1.5]" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="pt-3 border-t border-border flex flex-col gap-1.5">
              <NavLink
                to="/"
                onClick={() => setMobileDrawerOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
              >
                <Home className="w-4 h-4 stroke-[1.5]" />
                <span>Landing page</span>
              </NavLink>
              <NavLink
                to="/app/profile"
                onClick={() => setMobileDrawerOpen(false)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-primary/15 text-primary font-mono text-xs font-semibold flex items-center justify-center shrink-0">
                  {getInitials(user?.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{user?.name}</p>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-primary font-medium">
                    {user?.role}
                  </span>
                </div>
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-danger hover:bg-danger/10 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4 stroke-[1.5]" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar inside content area */}
        <header className="h-16 px-6 lg:px-8 border-b border-border bg-white flex items-center justify-between gap-4 sticky top-0 z-20">
          <h1 className="text-xl font-medium text-text-primary tracking-tight shrink-0">
            {getPageTitle()}
          </h1>

          <div className="flex items-center gap-4">
            {/* Global Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-64 lg:w-80">
              <Search className="w-4 h-4 stroke-[1.5] text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-border bg-surface text-text-primary placeholder:text-text-muted outline-none focus:border-primary focus:bg-white transition-colors"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] px-1.5 py-0.5 rounded border border-border bg-white text-text-muted">
                /
              </span>
            </form>

            {/* New Task Pill CTA Button */}
            <Button variant="primary" size="sm" onClick={openNewTaskModal}>
              <Plus className="w-4 h-4 stroke-[1.5]" />
              New task
            </Button>

            {/* Profile Quick Pill in Header */}
            <NavLink
              to="/app/profile"
              className={({ isActive }) =>
                `flex items-center gap-2 py-1 px-2.5 rounded-full border text-xs font-medium transition-all ${
                  isActive
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-white text-text-primary hover:border-primary/50 hover:bg-surface'
                }`
              }
              title="My Profile & Settings"
            >
              <div className="w-5 h-5 rounded-full bg-primary/15 text-primary font-mono text-[9px] font-semibold flex items-center justify-center shrink-0">
                {getInitials(user?.name)}
              </div>
              <span className="hidden sm:inline">Profile</span>
            </NavLink>
          </div>
        </header>

        {/* Nested Route Pages */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* 4. Mobile Floating Action Button (FAB) */}
      <button
        onClick={openNewTaskModal}
        className="md:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center hover:bg-primary-dark active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Create new task"
      >
        <Plus className="w-6 h-6 stroke-[2]" />
      </button>

      {/* 5. Global Task Drawer */}
      <TaskDrawer
        isOpen={isTaskDrawerOpen}
        onClose={() => setIsTaskDrawerOpen(false)}
        taskId={activeTaskId}
        onTaskSaved={() => {
          // Dispatch event so tasks list, board, and dashboard reload their data automatically
          window.dispatchEvent(new Event('task-data-updated'));
        }}
        onTaskDeleted={() => {
          window.dispatchEvent(new Event('task-data-updated'));
        }}
      />
    </div>
  );
};
