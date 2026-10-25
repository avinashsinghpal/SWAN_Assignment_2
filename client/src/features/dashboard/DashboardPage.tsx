import React, { useState, useEffect, useCallback } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area
} from 'recharts';
import {
  Calendar,
  ArrowRight
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/AuthContext';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scope, setScope] = useState<'all' | 'my'>(user?.role === 'admin' ? 'all' : 'my');
  const [timelineDays, setTimelineDays] = useState<'7' | '14' | '30'>('14');

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/stats/overview?scope=${scope}&days=${timelineDays}`);
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [scope, timelineDays]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Listen for task data updates
  useEffect(() => {
    const handleUpdate = () => fetchStats();
    window.addEventListener('task-data-updated', handleUpdate);
    return () => window.removeEventListener('task-data-updated', handleUpdate);
  }, [fetchStats]);

  // Greeting based on local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  // Donut chart data for status
  const statusData = [
    { name: 'To Do', value: stats?.byStatus?.todo || 0, color: '#64748B' },
    { name: 'In Progress', value: stats?.byStatus?.in_progress || 0, color: '#156D95' },
    { name: 'Completed', value: stats?.byStatus?.completed || 0, color: '#16B364' },
  ].filter((item) => item.value > 0);

  // Bar chart data for priority
  const priorityData = [
    { name: 'Low', count: stats?.byPriority?.low || 0, fill: '#64748B' },
    { name: 'Medium', count: stats?.byPriority?.medium || 0, fill: '#D9A100' },
    { name: 'High', count: stats?.byPriority?.high || 0, fill: '#D92D20' },
  ];

  const handleEditTask = (taskId: string) => {
    window.dispatchEvent(new CustomEvent('open-task-drawer', { detail: { taskId } }));
  };

  return (
    <div className="space-y-8">
      {/* 1. Header with greeting and admin scope switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-text-primary">
            {getGreeting()}, {firstName}
          </h2>
          <p className="font-mono text-xs uppercase tracking-wider text-text-muted mt-1">
            {todayFormatted}
          </p>
        </div>

        {user?.role === 'admin' && (
          <div className="inline-flex items-center p-1 bg-white border border-border rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setScope('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap ${
                scope === 'all'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              All Tasks
            </button>
            <button
              onClick={() => setScope('my')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap ${
                scope === 'my'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              My Tasks Only
            </button>
          </div>
        )}
      </div>

      {/* 2. Four Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Tasks */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-border shadow-2xs">
          <span className="font-mono text-xs uppercase tracking-wider text-text-muted font-medium block mb-2">
            Total Tasks
          </span>
          {isLoading ? (
            <Skeleton className="h-9 w-16 mb-1" />
          ) : (
            <span className="text-3xl font-medium text-text-primary">
              {stats?.totals?.total || 0}
            </span>
          )}
          <span className="text-xs text-text-secondary block mt-1">Active backlog scope</span>
        </div>

        {/* Pending Tasks */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-border shadow-2xs">
          <span className="font-mono text-xs uppercase tracking-wider text-text-muted font-medium block mb-2">
            Pending Tasks
          </span>
          {isLoading ? (
            <Skeleton className="h-9 w-16 mb-1" />
          ) : (
            <span className="text-3xl font-medium text-primary">
              {stats?.totals?.pending || 0}
            </span>
          )}
          <span className="text-xs text-text-secondary block mt-1">To Do &bull; In Progress</span>
        </div>

        {/* Completed Tasks */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-border shadow-2xs">
          <span className="font-mono text-xs uppercase tracking-wider text-text-muted font-medium block mb-2">
            Completed Tasks
          </span>
          {isLoading ? (
            <Skeleton className="h-9 w-16 mb-1" />
          ) : (
            <span className="text-3xl font-medium text-success">
              {stats?.totals?.completed || 0}
            </span>
          )}
          <span className="text-xs text-text-secondary block mt-1">Successfully finished</span>
        </div>

        {/* Overdue Tasks */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-border shadow-2xs">
          <span className="font-mono text-xs uppercase tracking-wider text-text-muted font-medium block mb-2">
            Overdue Tasks
          </span>
          {isLoading ? (
            <Skeleton className="h-9 w-16 mb-1" />
          ) : (
            <span
              className={`text-3xl font-medium ${
                (stats?.totals?.overdue || 0) > 0 ? 'text-danger' : 'text-text-muted'
              }`}
            >
              {stats?.totals?.overdue || 0}
            </span>
          )}
          <span className="text-xs text-text-secondary block mt-1">Due before today</span>
        </div>
      </div>

      {/* 3. Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Donut Distribution by Status */}
        <div className="p-6 rounded-2xl bg-white border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-text-primary">Tasks by Status</h3>
            <span className="font-mono text-xs text-text-muted">Distribution</span>
          </div>

          {isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : statusData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-text-muted text-xs font-mono">
              No tasks recorded
            </div>
          ) : (
            <div className="h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E5E5E5',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-2 font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#64748B]" />
              <span className="text-text-secondary">To Do ({stats?.byStatus?.todo || 0})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#156D95]" />
              <span className="text-text-secondary">In Prog ({stats?.byStatus?.in_progress || 0})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#16B364]" />
              <span className="text-text-secondary">Done ({stats?.byStatus?.completed || 0})</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Priority Distribution Bar */}
        <div className="p-6 rounded-2xl bg-white border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-text-primary">Tasks by Priority</h3>
            <span className="font-mono text-xs text-text-muted">Count</span>
          </div>

          {isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#7C7F88" fontSize={12} tickLine={false} />
                  <YAxis stroke="#7C7F88" fontSize={12} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E5E5E5',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {priorityData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 mt-2 font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#64748B]" />
              <span className="text-text-secondary">Low</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D9A100]" />
              <span className="text-text-secondary">Medium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D92D20]" />
              <span className="text-text-secondary">High</span>
            </div>
          </div>
        </div>

        {/* Chart 3: Created vs Completed Timeline */}
        <div className="p-6 rounded-2xl bg-white border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-text-primary">Velocity Timeline</h3>
            {/* Segmented Range Switcher */}
            <div className="inline-flex p-0.5 rounded-lg bg-surface border border-border">
              {(['7', '14', '30'] as const).map((days) => (
                <button
                  key={days}
                  onClick={() => setTimelineDays(days)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                    timelineDays === days
                      ? 'bg-white shadow-2xs font-semibold text-text-primary'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats?.timeline || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#156D95" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#156D95" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16B364" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#16B364" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#7C7F88" fontSize={10} tickLine={false} />
                  <YAxis stroke="#7C7F88" fontSize={11} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E5E5E5',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="created"
                    stroke="#156D95"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#createdGrad)"
                    name="Created"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#16B364"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#completedGrad)"
                    name="Completed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 mt-2 font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#156D95]" />
              <span className="text-text-secondary">Tasks Created</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#16B364]" />
              <span className="text-text-secondary">Tasks Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Upcoming Deadlines Section */}
      <div className="p-6 rounded-2xl bg-white border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-medium text-text-primary">Upcoming Deadlines</h3>
            <p className="text-xs text-text-secondary">Next active tasks due</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => (window.location.href = '/app/tasks')}>
            View all tasks
            <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (stats?.upcomingDeadlines || []).length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-text-muted">No upcoming deadlines at this time.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {stats.upcomingDeadlines.map((task: any) => (
              <div
                key={task._id}
                onClick={() => handleEditTask(task._id)}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-surface/50 px-2 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <StatusBadge status={task.status} />
                  <span className="text-sm font-medium text-text-primary truncate">
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <PriorityBadge priority={task.priority} />
                  <div
                    className={`font-mono text-xs flex items-center gap-1.5 ${
                      task.isOverdue ? 'text-danger font-medium' : 'text-text-secondary'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span>{task.relativeText}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
