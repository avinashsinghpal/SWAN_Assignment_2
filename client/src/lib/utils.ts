import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name?: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return 'No date';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function getRelativeDueDateText(dateString?: string | null): { text: string; isOverdue: boolean } {
  if (!dateString) return { text: 'No due date', isOverdue: false };
  const due = new Date(dateString);
  if (isNaN(due.getTime())) return { text: 'Invalid date', isOverdue: false };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const days = Math.abs(diffDays);
    return { text: `Overdue by ${days} day${days === 1 ? '' : 's'}`, isOverdue: true };
  } else if (diffDays === 0) {
    return { text: 'Due today', isOverdue: false };
  } else if (diffDays === 1) {
    return { text: 'Due tomorrow', isOverdue: false };
  } else {
    return { text: `Due in ${diffDays} days`, isOverdue: false };
  }
}
