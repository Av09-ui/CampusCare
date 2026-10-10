import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    info: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    PENDING: { label: 'Pending', variant: 'warning' },
    ASSIGNED: { label: 'Assigned', variant: 'info' },
    IN_PROGRESS: { label: 'In Progress', variant: 'default' },
    RESOLVED: { label: 'Resolved', variant: 'success' },
    CLOSED: { label: 'Closed', variant: 'gray' },
  };

  const config = statusConfig[status] || { label: status, variant: 'gray' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const priorityConfig: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    LOW: { label: 'Low', variant: 'success' },
    MEDIUM: { label: 'Medium', variant: 'warning' },
    HIGH: { label: 'High', variant: 'danger' },
    CRITICAL: { label: 'Critical', variant: 'danger' },
  };

  const config = priorityConfig[priority] || { label: priority, variant: 'gray' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function CategoryBadge({ category }: { category: string }) {
  return <Badge variant="info">{category}</Badge>;
}