export const PRODUCT_NAME = 'Tasklane';
export const PRODUCT_TAGLINE = 'Calm task management for focused teams';

const rawApiUrl = ((import.meta as any).env?.VITE_API_URL as string | undefined)?.trim();
export const API_BASE_URL = rawApiUrl
  ? rawApiUrl.endsWith('/api/v1')
    ? rawApiUrl
    : `${rawApiUrl.replace(/\/+$/, '')}/api/v1`
  : '/api/v1';

export const STATUS_CONFIG = {
  todo: {
    label: 'To Do',
    color: '#64748B',
    bgColor: 'rgba(100, 116, 139, 0.08)',
    borderColor: 'rgba(100, 116, 139, 0.25)',
  },
  in_progress: {
    label: 'In Progress',
    color: '#156D95',
    bgColor: 'rgba(21, 109, 149, 0.08)',
    borderColor: 'rgba(21, 109, 149, 0.25)',
  },
  completed: {
    label: 'Completed',
    color: '#16B364',
    bgColor: 'rgba(22, 179, 100, 0.08)',
    borderColor: 'rgba(22, 179, 100, 0.25)',
  },
} as const;

export const PRIORITY_CONFIG = {
  low: {
    label: 'Low',
    color: '#64748B',
    bgColor: 'rgba(100, 116, 139, 0.08)',
  },
  medium: {
    label: 'Medium',
    color: '#D9A100',
    bgColor: 'rgba(217, 161, 0, 0.08)',
  },
  high: {
    label: 'High',
    color: '#D92D20',
    bgColor: 'rgba(217, 45, 32, 0.08)',
  },
} as const;
