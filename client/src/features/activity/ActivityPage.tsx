import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  Clock,
  MessageSquare,
  UserCheck,
  Trash2,
  PlusCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export const ActivityPage: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = typeFilter ? `?type=${typeFilter}` : '';
      const res = await api.get(`/activity${query}`);
      setActivities(res.data.data.activities || []);
    } catch {
      toast.error('Failed to load activity logs');
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_created':
        return <PlusCircle className="w-4 h-4 text-primary stroke-[1.5]" />;
      case 'status_changed':
        return <CheckCircle2 className="w-4 h-4 text-success stroke-[1.5]" />;
      case 'comment_added':
        return <MessageSquare className="w-4 h-4 text-[#156D95] stroke-[1.5]" />;
      case 'assignee_changed':
        return <UserCheck className="w-4 h-4 text-text-primary stroke-[1.5]" />;
      case 'task_deleted':
        return <Trash2 className="w-4 h-4 text-danger stroke-[1.5]" />;
      default:
        return <Clock className="w-4 h-4 text-text-muted stroke-[1.5]" />;
    }
  };

  const formatActivityMessage = (act: any) => {
    const actorName = act.actor?.name || 'A team member';
    const taskTitle = act.taskTitle || act.task?.title || 'task';

    switch (act.type) {
      case 'task_created':
        return (
          <>
            <span className="font-medium text-text-primary">{actorName}</span> created task{' '}
            <span className="font-medium text-primary">"{taskTitle}"</span>
          </>
        );
      case 'status_changed':
        return (
          <>
            <span className="font-medium text-text-primary">{actorName}</span> changed status of{' '}
            <span className="font-medium text-text-primary">"{taskTitle}"</span> from{' '}
            <span className="font-mono text-xs text-text-muted">{act.meta?.from}</span> to{' '}
            <span className="font-mono text-xs font-medium text-primary">{act.meta?.to}</span>
          </>
        );
      case 'priority_changed':
        return (
          <>
            <span className="font-medium text-text-primary">{actorName}</span> changed priority of{' '}
            <span className="font-medium text-text-primary">"{taskTitle}"</span> to{' '}
            <span className="font-mono text-xs font-medium text-warning">{act.meta?.to}</span>
          </>
        );
      case 'assignee_changed':
        return (
          <>
            <span className="font-medium text-text-primary">{actorName}</span> reassigned{' '}
            <span className="font-medium text-text-primary">"{taskTitle}"</span> to{' '}
            <span className="font-medium text-primary">{act.meta?.toName || 'member'}</span>
          </>
        );
      case 'comment_added':
        return (
          <>
            <span className="font-medium text-text-primary">{actorName}</span> commented on{' '}
            <span className="font-medium text-text-primary">"{taskTitle}"</span>
          </>
        );
      case 'task_deleted':
        return (
          <>
            <span className="font-medium text-text-primary">{actorName}</span> deleted task{' '}
            <span className="line-through text-text-muted">"{taskTitle}"</span>
          </>
        );
      default:
        return (
          <>
            <span className="font-medium text-text-primary">{actorName}</span> updated{' '}
            <span className="font-medium text-text-primary">"{taskTitle}"</span>
          </>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium tracking-tight text-text-primary">
            Workspace Activity
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Audit history of task lifecycle events, discussions, and updates.
          </p>
        </div>

        {/* Filter by action type */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-xl border border-border bg-white text-text-primary outline-none focus:border-primary font-mono cursor-pointer"
        >
          <option value="">All Action Types</option>
          <option value="task_created">Task Created</option>
          <option value="status_changed">Status Changed</option>
          <option value="priority_changed">Priority Changed</option>
          <option value="assignee_changed">Assignee Changed</option>
          <option value="comment_added">Comment Added</option>
          <option value="task_deleted">Task Deleted</option>
        </select>
      </div>

      {/* Activity Timeline List */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : activities.length === 0 ? (
          <div className="py-12 text-center text-sm text-text-muted">
            No activity events found for the selected filter.
          </div>
        ) : (
          <div className="relative border-l border-border ml-3 pl-6 space-y-6">
            {activities.map((act) => (
              <div key={act._id} className="relative">
                {/* Event Marker */}
                <div className="absolute -left-[35px] top-0.5 w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center">
                  {getActivityIcon(act.type)}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <div className="text-sm text-text-secondary leading-relaxed">
                    {formatActivityMessage(act)}
                  </div>
                  <span className="font-mono text-xs text-text-muted whitespace-nowrap shrink-0">
                    {formatDate(act.createdAt)}
                  </span>
                </div>

                {act.meta?.preview && (
                  <p className="text-xs text-text-muted bg-surface p-2.5 rounded-lg border border-border mt-1.5 italic">
                    "{act.meta.preview}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
