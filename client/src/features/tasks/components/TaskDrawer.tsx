import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  X,
  MessageSquare,
  History,
  Trash2
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getInitials, formatDate } from '@/lib/utils';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '@/constants/app';
import { zodResolver } from '@/lib/zodResolver';

const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title cannot exceed 120 characters'),
  description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional(),
  status: z.enum(['todo', 'in_progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().optional().nullable(),
  assignee: z.string().optional().nullable(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export interface TaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string | null; // null for create mode
  initialStatus?: 'todo' | 'in_progress' | 'completed';
  onTaskSaved?: () => void;
  onTaskDeleted?: () => void;
}

export const TaskDrawer: React.FC<TaskDrawerProps> = ({
  isOpen,
  onClose,
  taskId,
  initialStatus = 'todo',
  onTaskSaved,
  onTaskDeleted,
}) => {
  const { user: currentUser } = useAuth();
  const isEditMode = !!taskId;
  const isAdmin = currentUser?.role === 'admin';

  const [members, setMembers] = useState<Array<{ _id: string; name: string; email: string; initials: string }>>([]);
  const [comments, setComments] = useState<Array<any>>([]);
  const [activities, setActivities] = useState<Array<any>>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'history'>('details');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: initialStatus,
      priority: 'medium',
      dueDate: '',
      assignee: currentUser?._id || '',
    },
  });

  const selectedStatus = watch('status');
  const selectedPriority = watch('priority');

  // Load team members for assignee dropdown
  useEffect(() => {
    if (isOpen) {
      api.get('/users/members')
        .then((res) => setMembers(res.data.data.members || []))
        .catch(() => {});
    }
  }, [isOpen]);

  // Load task details when editing
  useEffect(() => {
    if (isOpen && taskId) {
      api.get(`/tasks/${taskId}`)
        .then((res) => {
          const task = res.data.data.task;
          reset({
            title: task.title,
            description: task.description || '',
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
            assignee: task.assignee?._id || '',
          });
        })
        .catch((err) => {
          toast.error(err.response?.data?.error?.message || 'Failed to load task details');
          onClose();
        });

      // Load comments & activity
      api.get(`/tasks/${taskId}/comments`)
        .then((res) => setComments(res.data.data.comments || []))
        .catch(() => {});

      api.get(`/tasks/${taskId}/activity`)
        .then((res) => setActivities(res.data.data.activities || []))
        .catch(() => {});
    } else if (isOpen && !taskId) {
      reset({
        title: '',
        description: '',
        status: initialStatus,
        priority: 'medium',
        dueDate: '',
        assignee: currentUser?._id || '',
      });
      setComments([]);
      setActivities([]);
    }
    setActiveTab('details');
    setShowDeleteConfirm(false);
  }, [isOpen, taskId, initialStatus, reset, currentUser, onClose]);

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        assignee: !isAdmin ? currentUser?._id : (data.assignee || null),
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      };

      if (isEditMode) {
        await api.patch(`/tasks/${taskId}`, payload);
        toast.success('Task updated successfully');
      } else {
        await api.post('/tasks', payload);
        toast.success('Task created successfully');
      }

      onTaskSaved?.();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !taskId) return;

    try {
      const res = await api.post(`/tasks/${taskId}/comments`, { body: newComment.trim() });
      setComments((prev) => [...prev, res.data.data.comment]);
      setNewComment('');
      toast.success('Comment added');

      // Refresh activity timeline
      api.get(`/tasks/${taskId}/activity`).then((r) => setActivities(r.data.data.activities || []));
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to post comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success('Comment deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete comment');
    }
  };

  const handleDeleteTask = async () => {
    if (!taskId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted successfully');
      onTaskDeleted?.();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xl bg-white shadow-2xl h-full flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-text-muted">
              {isEditMode ? 'Edit Task' : 'New Task'}
            </span>
            {isEditMode && <span className="font-mono text-xs text-text-muted">&bull; #{taskId?.slice(-6)}</span>}
          </div>
          <div className="flex items-center gap-2">
            {isEditMode && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4 stroke-[1.5]" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Alert Banner */}
        {showDeleteConfirm && (
          <div className="p-4 bg-danger/10 border-b border-danger/20 flex flex-col gap-2">
            <p className="text-sm font-medium text-danger">
              Are you sure you want to delete this task?
            </p>
            <p className="text-xs text-text-secondary">
              This action permanently deletes all task comments and cannot be undone.
            </p>
            <div className="flex items-center gap-3 mt-1">
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteTask}
                isLoading={isDeleting}
              >
                Delete permanently
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Tab switcher when editing */}
        {isEditMode && (
          <div className="px-6 border-b border-border flex items-center gap-6 text-sm">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`py-3 font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === 'details'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('comments')}
              className={`py-3 font-medium border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'comments'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 stroke-[1.5]" />
              Comments ({comments.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`py-3 font-medium border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'history'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <History className="w-3.5 h-3.5 stroke-[1.5]" />
              Activity ({activities.length})
            </button>
          </div>
        )}

        {/* Tab 1: Task Form Details */}
        {activeTab === 'details' && (
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Title */}
            <div>
              <Input
                label="Task title"
                placeholder="What needs to be done?"
                {...register('title')}
                error={errors.title?.message}
                autoFocus
              />
            </div>

            {/* Status Segmented Control */}
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-text-secondary block mb-2">
                Status
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-surface border border-border rounded-xl">
                {(['todo', 'in_progress', 'completed'] as const).map((st) => {
                  const isSelected = selectedStatus === st;
                  const cfg = STATUS_CONFIG[st];
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setValue('status', st)}
                      className={`py-2 px-3 rounded-lg text-xs font-mono font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-white shadow-xs text-text-primary border border-border'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority Selectable Cards */}
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-text-secondary block mb-2">
                Priority
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map((pr) => {
                  const isSelected = selectedPriority === pr;
                  const cfg = PRIORITY_CONFIG[pr];
                  return (
                    <button
                      key={pr}
                      type="button"
                      onClick={() => setValue('priority', pr)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-2 border-primary bg-primary/5 text-text-primary'
                          : 'border-border bg-white text-text-secondary hover:border-text-muted'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                        <span className="text-xs font-mono font-medium uppercase tracking-wider">{cfg.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Assignee and Due Date grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Assignee */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-mono text-xs uppercase tracking-wider text-text-secondary">
                    Assignee
                  </label>
                  {!isAdmin && (
                    <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-surface-muted text-text-muted border border-border">
                      Self only
                    </span>
                  )}
                </div>
                {isAdmin ? (
                  <select
                    {...register('assignee')}
                    className="w-full h-[42px] px-3 py-2 rounded-xl border border-border bg-white text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer truncate"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div>
                    <div className="w-full h-[42px] px-3 py-1.5 rounded-xl border border-border bg-surface-muted flex items-center gap-2.5 min-w-0 overflow-hidden">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                        {getInitials(currentUser?.name || 'U')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-text-primary truncate leading-tight">
                          {currentUser?.name || 'You'}
                        </div>
                        <div
                          className="text-[11px] text-text-muted font-mono truncate leading-tight mt-0.5"
                          title={currentUser?.email}
                        >
                          {currentUser?.email}
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-text-muted mt-1 leading-tight">
                      Only administrators can assign tasks to other team members.
                    </p>
                  </div>
                )}
              </div>

              {/* Due Date */}
              <div>
                <Input
                  label="Due date"
                  type="date"
                  min={!isEditMode ? new Date().toISOString().split('T')[0] : undefined}
                  {...register('dueDate')}
                  error={errors.dueDate?.message}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-text-secondary block mb-1.5">
                Description (optional)
              </label>
              <textarea
                rows={4}
                placeholder="Add context, specifications, or checklist items..."
                {...register('description')}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-y"
              />
              {errors.description && (
                <span className="text-xs text-danger mt-1 block">{errors.description.message}</span>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                {isEditMode ? 'Save changes' : 'Create task'}
              </Button>
            </div>
          </form>
        )}

        {/* Tab 2: Comments Thread */}
        {activeTab === 'comments' && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between">
            <div className="space-y-4 mb-6">
              {comments.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-12">
                  No comments yet. Start the conversation below.
                </p>
              ) : (
                comments.map((comment) => {
                  const canDelete =
                    currentUser?.role === 'admin' ||
                    comment.author?._id === currentUser?._id;

                  return (
                    <div key={comment._id} className="p-4 rounded-xl bg-surface border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-mono text-[10px] flex items-center justify-center font-medium">
                            {getInitials(comment.author?.name)}
                          </div>
                          <span className="text-xs font-medium text-text-primary">
                            {comment.author?.name || 'Unknown'}
                          </span>
                          <span className="text-[11px] font-mono text-text-muted">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-text-muted hover:text-danger text-xs transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                        {comment.body}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Comment input */}
            <form onSubmit={handleAddComment} className="pt-4 border-t border-border flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2 text-sm rounded-xl border border-border bg-white outline-none focus:border-primary"
              />
              <Button type="submit" variant="primary" size="sm" disabled={!newComment.trim()}>
                Post
              </Button>
            </form>
          </div>
        )}

        {/* Tab 3: Activity Timeline */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {activities.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-12">
                No activity recorded yet.
              </p>
            ) : (
              <div className="relative border-l border-border ml-3 pl-6 space-y-6">
                {activities.map((act) => (
                  <div key={act._id} className="relative">
                    <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white ring-1 ring-border" />
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-text-primary">
                        {act.actor?.name || 'System'}
                      </span>
                      <span className="text-[11px] font-mono text-text-muted">
                        {formatDate(act.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">
                      {act.type === 'task_created' && 'Created this task'}
                      {act.type === 'status_changed' && `Changed status from ${act.meta?.from} to ${act.meta?.to}`}
                      {act.type === 'priority_changed' && `Changed priority to ${act.meta?.to}`}
                      {act.type === 'assignee_changed' && `Reassigned to ${act.meta?.toName || 'member'}`}
                      {act.type === 'due_date_changed' && `Updated due date to ${act.meta?.to || 'None'}`}
                      {act.type === 'comment_added' && 'Added a discussion comment'}
                      {act.type === 'task_updated' && 'Updated task details'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
