import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  Calendar,
  Search
} from 'lucide-react';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { getInitials, getRelativeDueDateText } from '@/lib/utils';
import { PRIORITY_CONFIG } from '@/constants/app';
import { toast } from 'sonner';

// Sortable Kanban Card component
const KanbanCard: React.FC<{
  task: any;
  onClick: () => void;
  onStatusChange: (newStatus: string) => void;
}> = ({ task, onClick, onStatusChange }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const relativeDue = getRelativeDueDateText(task.dueDate);
  const priorityCfg = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="p-4 rounded-xl bg-white border border-border shadow-2xs hover:border-primary/40 transition-all cursor-grab active:cursor-grabbing group select-none"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: priorityCfg.color }}
          />
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            {task.priority}
          </span>
        </div>

        {/* Mobile / Fallback Status dropdown */}
        <div onClick={(e) => e.stopPropagation()}>
          <select
            value={task.status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="text-[11px] font-mono px-2 py-0.5 rounded border border-border bg-surface text-text-secondary outline-none md:hidden cursor-pointer"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Prog</option>
            <option value="completed">Done</option>
          </select>
        </div>
      </div>

      <h4 className="text-sm font-medium text-text-primary line-clamp-2 mb-3 leading-snug">
        {task.title}
      </h4>

      <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
        {task.dueDate ? (
          <div
            className={`font-mono text-[11px] flex items-center gap-1 ${
              relativeDue.isOverdue && task.status !== 'completed'
                ? 'text-danger font-medium'
                : 'text-text-muted'
            }`}
          >
            <Calendar className="w-3 h-3 stroke-[1.5]" />
            <span>{relativeDue.text}</span>
          </div>
        ) : (
          <span className="text-text-muted text-[11px] font-mono">&mdash;</span>
        )}

        {task.assignee ? (
          <div
            className="w-6 h-6 rounded-full bg-primary/10 text-primary font-mono text-[10px] flex items-center justify-center font-medium"
            title={task.assignee.name}
          >
            {getInitials(task.assignee.name)}
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full border border-dashed border-border flex items-center justify-center text-text-muted font-mono text-[10px]">
            &minus;
          </div>
        )}
      </div>
    </div>
  );
};

// Drag preview overlay card
const DragOverlayCard: React.FC<{ task: any }> = ({ task }) => {
  const priorityCfg = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;
  return (
    <div className="p-4 rounded-xl bg-white border-2 border-primary shadow-xl rotate-2 select-none w-72">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: priorityCfg.color }} />
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            {task.priority}
          </span>
        </div>
      </div>
      <h4 className="text-sm font-medium text-text-primary line-clamp-2 mb-3">
        {task.title}
      </h4>
    </div>
  );
};

export const BoardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const priority = searchParams.get('priority') || '';

  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<any | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/tasks?limit=100&sort=order&order=asc&search=${search}&priority=${priority}`);
      setTasks(res.data.data.tasks || []);
    } catch {
      toast.error('Failed to load board tasks');
    } finally {
      setIsLoading(false);
    }
  }, [search, priority]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Listen for task data updates
  useEffect(() => {
    const handleUpdate = () => fetchTasks();
    window.addEventListener('task-data-updated', handleUpdate);
    return () => window.removeEventListener('task-data-updated', handleUpdate);
  }, [fetchTasks]);

  const columns = [
    { id: 'todo', label: 'To Do', color: '#64748B' },
    { id: 'in_progress', label: 'In Progress', color: '#156D95' },
    { id: 'completed', label: 'Completed', color: '#16B364' },
  ];

  const getColumnTasks = (status: string) => {
    return tasks.filter((t) => t.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTaskItem = tasks.find((t) => t._id === activeId);
    if (!activeTaskItem) return;

    // Is hovering over a column container directly?
    const isOverColumn = columns.some((c) => c.id === overId);
    if (isOverColumn && activeTaskItem.status !== overId) {
      setTasks((prev) =>
        prev.map((t) => (t._id === activeId ? { ...t, status: overId } : t))
      );
      return;
    }

    // Is hovering over another task in another column?
    const overTaskItem = tasks.find((t) => t._id === overId);
    if (overTaskItem && activeTaskItem.status !== overTaskItem.status) {
      setTasks((prev) =>
        prev.map((t) => (t._id === activeId ? { ...t, status: overTaskItem.status } : t))
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTaskItem = tasks.find((t) => t._id === activeId);
    if (!activeTaskItem) return;

    // Target status
    let targetStatus = activeTaskItem.status;
    const isOverColumn = columns.some((c) => c.id === overId);
    if (isOverColumn) {
      targetStatus = overId;
    } else {
      const overTaskItem = tasks.find((t) => t._id === overId);
      if (overTaskItem) {
        targetStatus = overTaskItem.status;
      }
    }

    // Calculate order within target column
    const columnTasks = tasks.filter((t) => t.status === targetStatus && t._id !== activeId);
    let newOrder = 1000;
    if (columnTasks.length > 0) {
      const highestOrder = Math.max(...columnTasks.map((t) => t.order || 0));
      newOrder = highestOrder + 1000;
    }

    // Optimistically update
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) =>
        t._id === activeId ? { ...t, status: targetStatus, order: newOrder } : t
      )
    );

    try {
      await api.patch(`/tasks/${activeId}/status`, {
        status: targetStatus,
        order: newOrder,
      });
      window.dispatchEvent(new Event('task-data-updated'));
    } catch (err: any) {
      // Rollback on failure
      setTasks(previousTasks);
      toast.error(err.response?.data?.error?.message || 'Failed to update task order');
    }
  };

  const handleQuickAdd = (status: 'todo' | 'in_progress' | 'completed') => {
    window.dispatchEvent(new CustomEvent('open-task-drawer', { detail: { taskId: null, initialStatus: status } }));
  };

  const handleCardClick = (taskId: string) => {
    window.dispatchEvent(new CustomEvent('open-task-drawer', { detail: { taskId } }));
  };

  const handleInlineStatusChange = async (taskId: string, newStatus: string) => {
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

  const [mobileActiveColumn, setMobileActiveColumn] = useState<string>('all');

  return (
    <div className="space-y-6">
      {/* Search and Filter strip */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 stroke-[1.5]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                const next = new URLSearchParams(searchParams);
                if (e.target.value) next.set('search', e.target.value);
                else next.delete('search');
                setSearchParams(next);
              }}
              placeholder="Filter board..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-border bg-white outline-none focus:border-primary font-mono"
            />
          </div>

          <select
            value={priority}
            onChange={(e) => {
              const next = new URLSearchParams(searchParams);
              if (e.target.value) next.set('priority', e.target.value);
              else next.delete('priority');
              setSearchParams(next);
            }}
            className="px-3 py-1.5 text-xs rounded-xl border border-border bg-white outline-none focus:border-primary font-mono cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <Button variant="primary" size="sm" onClick={() => handleQuickAdd('todo')}>
          <Plus className="w-4 h-4 stroke-[1.5]" />
          New task
        </Button>
      </div>

      {/* Mobile Column View Tabs (only visible on mobile) */}
      <div className="flex md:hidden p-1 bg-surface border border-border rounded-xl gap-1">
        <button
          onClick={() => setMobileActiveColumn('all')}
          className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors ${
            mobileActiveColumn === 'all'
              ? 'bg-white shadow-2xs text-text-primary'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          All ({tasks.length})
        </button>
        {columns.map((c) => {
          const count = getColumnTasks(c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setMobileActiveColumn(c.id)}
              className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors ${
                mobileActiveColumn === c.id
                  ? 'bg-white shadow-2xs text-text-primary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {c.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Kanban Columns Container with horizontal scroll snap on mobile */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-4 snap-x">
            {columns
              .filter(
                (col) =>
                  mobileActiveColumn === 'all' || mobileActiveColumn === col.id
              )
              .map((column) => {
                const columnTasks = getColumnTasks(column.id);
                return (
                  <div
                    key={column.id}
                    id={column.id}
                    className="rounded-2xl border border-border bg-surface p-4 flex flex-col min-w-full sm:min-w-[300px] md:min-w-0 snap-center"
                  >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: column.color }}
                      />
                      <span className="font-mono text-xs uppercase tracking-wider font-semibold text-text-primary">
                        {column.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white border border-border font-mono text-[11px] text-text-muted">
                        {columnTasks.length}
                      </span>
                    </div>

                    <button
                      onClick={() => handleQuickAdd(column.id as any)}
                      className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-white transition-colors cursor-pointer"
                      title={`Add task to ${column.label}`}
                    >
                      <Plus className="w-4 h-4 stroke-[1.5]" />
                    </button>
                  </div>

                  {/* Column Cards Drop Area */}
                  <SortableContext
                    id={column.id}
                    items={columnTasks.map((t) => t._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex-1 space-y-3 min-h-[160px]">
                      {columnTasks.map((task) => (
                        <KanbanCard
                          key={task._id}
                          task={task}
                          onClick={() => handleCardClick(task._id)}
                          onStatusChange={(newStatus) =>
                            handleInlineStatusChange(task._id, newStatus)
                          }
                        />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              );
            })}
          </div>

          <DragOverlay>
            {activeTask ? <DragOverlayCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
};
