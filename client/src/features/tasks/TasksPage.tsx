import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Download,
  Plus,
  ArrowUpDown,
  RefreshCw,
  CheckCircle2,
  Calendar,
  X
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { PriorityBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { getInitials, formatDate, getRelativeDueDateText } from '@/lib/utils';
import { toast } from 'sonner';

export const TasksPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL Query state
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const priority = searchParams.get('priority') || '';
  const assignee = searchParams.get('assignee') || '';
  const overdue = searchParams.get('overdue') === 'true';
  const sort = searchParams.get('sort') || 'dueDate';
  const order = searchParams.get('order') || 'asc';

  const [tasks, setTasks] = useState<any[]>([]);
  const [meta, setMeta] = useState<{ total: number; totalPages: number; page: number; limit: number }>({
    total: 0,
    totalPages: 1,
    page: 1,
    limit: 20,
  });
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Debounced search local input
  const [searchInput, setSearchInput] = useState(search);

  // Sync search input if URL changes externally
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Debounce search update to URL (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateQuery({ search: searchInput || undefined, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load team members for assignee filter
  useEffect(() => {
    api.get('/users/members')
      .then((res) => setMembers(res.data.data.members || []))
      .catch(() => {});
  }, []);

  const updateQuery = (updates: Record<string, any>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === '' || v === false) {
        next.delete(k);
      } else {
        next.set(k, String(v));
      }
    });
    setSearchParams(next);
  };

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const queryString = searchParams.toString();
      const res = await api.get(`/tasks?${queryString}`);
      setTasks(res.data.data.tasks || []);
      setMeta(res.data.meta || { total: 0, totalPages: 1, page: 1, limit: 20 });
    } catch (err) {
      setIsError(true);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Listen for task data updates
  useEffect(() => {
    const handleUpdate = () => fetchTasks();
    window.addEventListener('task-data-updated', handleUpdate);
    return () => window.removeEventListener('task-data-updated', handleUpdate);
  }, [fetchTasks]);

  // Inline status update
  const handleStatusChange = async (taskId: string, newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
      toast.success('Status updated');
      window.dispatchEvent(new Event('task-data-updated'));
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to update status');
    }
  };

  // CSV Export
  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const queryString = searchParams.toString();
      const res = await api.get(`/tasks/export/csv?${queryString}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tasklane-tasks-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV export downloaded');
    } catch (err) {
      toast.error('Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const openTaskModal = (taskId: string | null = null) => {
    window.dispatchEvent(new CustomEvent('open-task-drawer', { detail: { taskId } }));
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchInput('');
  };

  const hasActiveFilters = !!(search || status || priority || assignee || overdue);

  return (
    <div className="space-y-6">
      {/* 1. Header Actions & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search by title */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 stroke-[1.5]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted outline-none focus:border-primary"
            />
          </div>

          {/* Status Multi-Select Filter */}
          <select
            value={status}
            onChange={(e) => updateQuery({ status: e.target.value || undefined, page: 1 })}
            className="px-3 py-2 text-xs rounded-xl border border-border bg-white text-text-primary outline-none focus:border-primary cursor-pointer font-mono"
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {/* Priority Multi-Select Filter */}
          <select
            value={priority}
            onChange={(e) => updateQuery({ priority: e.target.value || undefined, page: 1 })}
            className="px-3 py-2 text-xs rounded-xl border border-border bg-white text-text-primary outline-none focus:border-primary cursor-pointer font-mono"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={assignee}
            onChange={(e) => updateQuery({ assignee: e.target.value || undefined, page: 1 })}
            className="px-3 py-2 text-xs rounded-xl border border-border bg-white text-text-primary outline-none focus:border-primary cursor-pointer font-mono"
          >
            <option value="">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Overdue only toggle */}
          <button
            type="button"
            onClick={() => updateQuery({ overdue: !overdue, page: 1 })}
            className={`px-3 py-2 text-xs rounded-xl border font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
              overdue
                ? 'bg-danger/10 border-danger/30 text-danger font-medium'
                : 'bg-white border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>Overdue only</span>
          </button>

          {/* Clear filters pill */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-text-muted hover:text-text-primary font-mono flex items-center gap-1 underline underline-offset-2 cursor-pointer"
            >
              <X className="w-3.5 h-3.5 stroke-[1.5]" />
              Clear filters
            </button>
          )}
        </div>

        {/* Right Action: CSV Export */}
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCsv}
            isLoading={isExporting}
            className="border-border bg-white hover:bg-surface text-text-primary"
          >
            <Download className="w-3.5 h-3.5 stroke-[1.5]" />
            Export CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => openTaskModal(null)}>
            <Plus className="w-3.5 h-3.5 stroke-[1.5]" />
            New task
          </Button>
        </div>
      </div>

      {/* 2. Tasks Table Container */}
      <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <p className="text-sm text-danger mb-4">Error loading tasks from server.</p>
            <Button variant="secondary" size="sm" onClick={fetchTasks}>
              <RefreshCw className="w-3.5 h-3.5 stroke-[1.5]" />
              Retry
            </Button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12">
            {hasActiveFilters ? (
              <EmptyState
                icon={Search}
                title="No tasks match your filters"
                description="Try clearing your search query or broadening the selected status and priority filters."
                actionLabel="Clear all filters"
                onAction={clearFilters}
              />
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title="No tasks in this workspace yet"
                description="Create your first task to start organizing sprints, tracking deadlines, and assigning teammates."
                actionLabel="Create your first task"
                onAction={() => openTaskModal(null)}
              />
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View (hidden on mobile, visible on md+) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface border-b border-border text-[11px] font-mono uppercase tracking-wider text-text-muted select-none">
                    <th className="py-3 px-5 font-medium">Task</th>
                    <th className="py-3 px-4 font-medium">Assignee</th>
                    <th className="py-3 px-4 font-medium">Priority</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th
                      className="py-3 px-4 font-medium cursor-pointer hover:text-text-primary"
                      onClick={() =>
                        updateQuery({
                          sort: 'dueDate',
                          order: sort === 'dueDate' && order === 'asc' ? 'desc' : 'asc',
                        })
                      }
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Due date</span>
                        <ArrowUpDown className="w-3 h-3 stroke-[1.5]" />
                      </div>
                    </th>
                    <th className="py-3 px-5 text-right font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {tasks.map((task) => {
                    const relativeDue = getRelativeDueDateText(task.dueDate);
                    return (
                      <tr
                        key={task._id}
                        onClick={() => openTaskModal(task._id)}
                        className="hover:bg-surface/60 transition-colors cursor-pointer group"
                      >
                        {/* Title & Description */}
                        <td className="py-4 px-5 max-w-xs sm:max-w-md">
                          <p className="font-medium text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-text-muted line-clamp-1 mt-0.5">
                              {task.description}
                            </p>
                          )}
                        </td>

                        {/* Assignee */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {task.assignee ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-mono text-[10px] flex items-center justify-center font-medium">
                                {getInitials(task.assignee.name)}
                              </div>
                              <span className="text-xs text-text-primary">{task.assignee.name}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-text-muted italic">Unassigned</span>
                          )}
                        </td>

                        {/* Priority */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <PriorityBadge priority={task.priority} />
                        </td>

                        {/* Status Dropdown */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task._id, e.target.value, e as any)}
                              className="font-mono text-xs px-2.5 py-1 rounded-full border border-border bg-white text-text-primary outline-none focus:border-primary cursor-pointer"
                            >
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </td>

                        {/* Due Date */}
                        <td className="py-4 px-4 whitespace-nowrap font-mono text-xs">
                          {task.dueDate ? (
                            <div
                              className={`flex items-center gap-1.5 ${
                                relativeDue.isOverdue && task.status !== 'completed'
                                ? 'text-danger font-medium'
                                : 'text-text-secondary'
                              }`}
                            >
                              <Calendar className="w-3.5 h-3.5 stroke-[1.5]" />
                              <span>{relativeDue.text}</span>
                            </div>
                          ) : (
                            <span className="text-text-muted">&mdash;</span>
                          )}
                        </td>

                        {/* Updated date */}
                        <td className="py-4 px-5 text-right whitespace-nowrap font-mono text-xs text-text-muted">
                          {formatDate(task.updatedAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View (visible on mobile < 768px) */}
            <div className="block md:hidden divide-y divide-border">
              {tasks.map((task) => {
                const relativeDue = getRelativeDueDateText(task.dueDate);
                return (
                  <div
                    key={task._id}
                    onClick={() => openTaskModal(task._id)}
                    className="p-4 space-y-3 hover:bg-surface/50 active:bg-surface transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm text-text-primary line-clamp-2 leading-snug">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-xs text-text-muted line-clamp-2 mt-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <PriorityBadge priority={task.priority} />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                      {/* Inline Status Picker */}
                      <div onClick={(e) => e.stopPropagation()}>
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task._id, e.target.value, e as any)}
                          className="font-mono text-xs px-2.5 py-1 rounded-lg border border-border bg-white text-text-primary outline-none"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                      {/* Due date */}
                      {task.dueDate ? (
                        <div
                          className={`font-mono text-xs flex items-center gap-1.5 ${
                            relativeDue.isOverdue && task.status !== 'completed'
                              ? 'text-danger font-medium'
                              : 'text-text-secondary'
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5 stroke-[1.5]" />
                          <span>{relativeDue.text}</span>
                        </div>
                      ) : (
                        <span className="text-text-muted font-mono text-xs">No due date</span>
                      )}

                      {/* Assignee */}
                      {task.assignee && (
                        <div className="flex items-center gap-1.5 ml-auto">
                          <div className="w-5 h-5 rounded-full bg-primary/10 text-primary font-mono text-[9px] flex items-center justify-center font-medium">
                            {getInitials(task.assignee.name)}
                          </div>
                          <span className="text-xs text-text-secondary truncate max-w-[100px]">
                            {task.assignee.name.split(' ')[0]}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* 3. Server-side Pagination Pager */}
        {!isLoading && tasks.length > 0 && (
          <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface">
            <span className="font-mono text-xs text-text-muted">
              Showing {(meta.page - 1) * meta.limit + 1}-
              {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={meta.page <= 1}
                onClick={() => updateQuery({ page: meta.page - 1 })}
                className="px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-mono text-text-primary disabled:opacity-40 disabled:pointer-events-none hover:bg-surface cursor-pointer"
              >
                Previous
              </button>
              <span className="font-mono text-xs text-text-secondary px-2">
                Page {meta.page} of {meta.totalPages || 1}
              </span>
              <button
                disabled={meta.page >= meta.totalPages}
                onClick={() => updateQuery({ page: meta.page + 1 })}
                className="px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-mono text-text-primary disabled:opacity-40 disabled:pointer-events-none hover:bg-surface cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
