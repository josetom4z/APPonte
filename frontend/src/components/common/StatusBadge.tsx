import React from 'react';
import { RequestStatus, RequestPriority } from '../../types';
import { Clock, Eye, Wrench, CheckCircle2, XCircle, Ban, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: RequestStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const configs: Record<
    RequestStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    PENDING: {
      label: 'Pendente',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    IN_REVIEW: {
      label: 'Em Análise',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      text: 'text-indigo-700 dark:text-indigo-400',
      border: 'border-indigo-200 dark:border-indigo-800',
      icon: <Eye className="w-3.5 h-3.5" />,
    },
    IN_PROGRESS: {
      label: 'Em Atendimento',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      icon: <Wrench className="w-3.5 h-3.5" />,
    },
    RESOLVED: {
      label: 'Resolvida',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    REJECTED: {
      label: 'Recusada',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-200 dark:border-rose-800',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
    CANCELLED: {
      label: 'Cancelada',
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-200 dark:border-slate-700',
      icon: <Ban className="w-3.5 h-3.5" />,
    },
  };

  const config = configs[status] || configs.PENDING;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: RequestPriority }> = ({ priority }) => {
  const configs: Record<RequestPriority, { label: string; color: string }> = {
    LOW: { label: 'Baixa', color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' },
    MEDIUM: { label: 'Média', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50' },
    HIGH: { label: 'Alta', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50' },
    URGENT: { label: 'Urgente', color: 'text-red-600 bg-red-50 dark:bg-red-950/50' },
  };

  const config = configs[priority] || configs.MEDIUM;

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${config.color}`}>
      {priority === 'URGENT' && <AlertCircle className="w-3 h-3 text-red-600 animate-pulse" />}
      {config.label}
    </span>
  );
};
