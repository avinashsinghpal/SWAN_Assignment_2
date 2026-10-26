import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  pointerWithin,
  CollisionDetection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
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
    opacity: isDragging ? 0.35 : 1,
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

        {/* Quick Status Dropdown (Accessible on all viewports, stops drag initiation) */}
        <div
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <select
            value={task.status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="text-[11px] font-mono px-2 py-0.5 rounded border border-border bg-surface text-text-secondary outline-none cursor-pointer hover:border-primary/50 transition-colors"
            title="Change status"
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

// Droppable Kanban Column component
const KanbanColumn: React.FC<{
  column: { id: string; label: string; color: string };
  columnTasks: any[];
  onQuickAdd: (status: any) => void;
  onCardClick: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: string) => void;
}> = ({ column, columnTasks, onQuickAdd, onCardClick, onStatusChange }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      columnId: column.id,
    },
  });

  return (
    <div
      ref={setNodeRef}
      id={column.id}
      className={`rounded-2xl border transition-colors p-4 flex flex-col min-w-full sm:min-w-[300px] md:min-w-0 snap-center ${
        isOver ? 'border-primary/50 bg-primary/[0.02]' : 'border-border bg-surface'
      }`}
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
          onClick={() => onQuickAdd(column.id as any)}
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
        <div className="flex-1 flex flex-col space-y-3 min-h-[220px]">
          {columnTasks.map((task) => (
            <KanbanCard
              key={task._id}
              task={task}
              onClick={() => onCardClick(task._id)}
              onStatusChange={(newStatus) =>
                onStatusChange(task._id, newStatus)
              }
            />
          ))}

          {columnTasks.length === 0 && (
            <div
              className={`flex-1 min-h-[160px] flex items-center justify-center border border-dashed rounded-xl p-6 text-center font-mono text-xs transition-colors ${
                isOver
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-border/80 text-text-muted'
              }`}
            >
              Drop tasks here
            </div>
          )}
        </div>
      </SortableContext>
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
  const originalStatusRef = useRef<string | null>(null);

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
    return tasks
      .filter((t) => t.status === status)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const findContainer = useCallback(
    (id: string | null) => {
      if (!id) return null;
      if (columns.some((c) => c.id === id)) {
        return id;
      }
      const task = tasks.find((t) => t._id === id);
      return task ? task.status : null;
    },
    [tasks]
  );

  // Custom collision detection: prioritize items within pointer collisions, otherwise detect column
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      const pointerCollisions = pointerWithin(args);
      if (pointerCollisions.length > 0) {
        const itemCollision = pointerCollisions.find((c) =>
          tasks.some((t) => t._id === c.id)
        );
        if (itemCollision) {
          return [itemCollision];
        }
        return pointerCollisions;
      }
      return closestCorners(args);
    },
    [tasks]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    if (task) {
      setActiveTask(task);
      originalStatusRef.current = task.status;
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    // Optimistically move task across columns during hover
    setTasks((prev) =>
      prev.map((t) => (t._id === activeId ? { ...t, status: overContainer } : t))
    );
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const initialStatus = originalStatusRef.current;
    setActiveTask(null);
    originalStatusRef.current = null;

    if (!over) {
      // Revert if dropped outside
      if (initialStatus) {
        setTasks((prev) =>
          prev.map((t) => (t._id === active.id ? { ...t, status: initialStatus } : t))
        );
      }
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    const targetStatus = overContainer || activeContainer;
    if (!targetStatus) return;

    const activeTaskItem = tasks.find((t) => t._id === activeId);
    if (!activeTaskItem) return;

    // Calculate order within target column adhering to ADR #3
    const targetColumnTasks = tasks
      .filter((t) => t.status === targetStatus && t._id !== activeId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    let newOrder = 1000;
    if (targetColumnTasks.length === 0) {
      newOrder = 1000;
    } else if (overId === targetStatus) {
      // Dropped directly on column drop area -> append at the bottom
      const lastOrder = targetColumnTasks[targetColumnTasks.length - 1].order || 1000;
      newOrder = lastOrder + 1000;
    } else {
      const overIndex = targetColumnTasks.findIndex((t) => t._id === overId);
      if (overIndex === -1) {
        const lastOrder = targetColumnTasks[targetColumnTasks.length - 1].order || 1000;
        newOrder = lastOrder + 1000;
      } else if (overIndex === 0) {
        const firstOrder = targetColumnTasks[0].order || 1000;
        newOrder = firstOrder > 1000 ? firstOrder - 1000 : Math.max(1, firstOrder / 2);
      } else {
        const prevOrder = targetColumnTasks[overIndex - 1].order || 0;
        const currentOrder = targetColumnTasks[overIndex].order || prevOrder + 1000;
        newOrder = (prevOrder + currentOrder) / 2;
      }
    }

    const previousTasks = [...tasks];

    // Optimistically update status and order
    setTasks((prev) =>
      prev
        .map((t) =>
          t._id === activeId ? { ...t, status: targetStatus, order: newOrder } : t
        )
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    );

    try {
      await api.patch(`/tasks/${activeId}/status`, {
        status: targetStatus,
        order: newOrder,
      });
      window.dispatchEvent(new Event('task-data-updated'));
    } catch (err: any) {
      if (initialStatus) {
        setTasks((prev) =>
          prev.map((t) => (t._id === activeId ? { ...t, status: initialStatus } : t))
        );
      } else {
        setTasks(previousTasks);
      }
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

      {/* Mobile Column View Tabs */}
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

      {/* Kanban Columns Container */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetectionStrategy}
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
              .map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  columnTasks={getColumnTasks(column.id)}
                  onQuickAdd={handleQuickAdd}
                  onCardClick={handleCardClick}
                  onStatusChange={handleInlineStatusChange}
                />
              ))}
          </div>

          <DragOverlay>
            {activeTask ? <DragOverlayCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
};
