import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ProtectedRoute, RoleRoute } from '@/routes/guards';

const LandingPage = lazy(() => import('@/features/landing/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('@/features/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const AppShell = lazy(() => import('@/components/layout/AppShell').then(m => ({ default: m.AppShell })));
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const TasksPage = lazy(() => import('@/features/tasks/TasksPage').then(m => ({ default: m.TasksPage })));
const BoardPage = lazy(() => import('@/features/board/BoardPage').then(m => ({ default: m.BoardPage })));
const TeamPage = lazy(() => import('@/features/team/TeamPage').then(m => ({ default: m.TeamPage })));
const ActivityPage = lazy(() => import('@/features/activity/ActivityPage').then(m => ({ default: m.ActivityPage })));
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage').then(m => ({ default: m.ProfilePage })));

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-surface">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Application Routes */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="board" element={<BoardPage />} />
              <Route
                path="team"
                element={
                  <RoleRoute requiredRole="admin">
                    <TeamPage />
                  </RoleRoute>
                }
              />
              <Route path="activity" element={<ActivityPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>

      {/* Global Toast Provider */}
      <Toaster position="bottom-right" richColors={false} />
    </AuthProvider>
  );
};

export default App;
