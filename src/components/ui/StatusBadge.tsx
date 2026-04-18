import { CheckCircle, Clock, LogOut, XCircle, AlertCircle, HelpCircle, Coffee } from 'lucide-react';

export type AttendanceStatus = 'waiting' | 'on-time' | 'late' | 'early-leave' | 'late-and-early' | 'absent' | 'rest';

interface StatusBadgeProps {
  status: AttendanceStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = {
    waiting: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      label: 'Gözlənilir',
      icon: Clock,
    },
    'on-time': {
      bg: 'bg-green-50',
      text: 'text-green-700',
      label: 'Vaxtında',
      icon: CheckCircle,
    },
    late: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      label: 'Gecikib',
      icon: AlertCircle,
    },
    'early-leave': {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      label: 'Tez çıxıb',
      icon: LogOut,
    },
    'late-and-early': {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      label: 'Gecikib və tez çıxıb',
      icon: AlertCircle,
    },
    absent: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      label: 'İşə gəlməyib',
      icon: XCircle,
    },
    rest: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      label: 'İstirahət',
      icon: Coffee,
    },
  };

  const currentConfig = config[status] || config.waiting;
  const { bg, text, label, icon: Icon } = currentConfig;

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-base px-4 py-2' : 'text-sm px-3 py-1';
  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${bg} ${text} ${sizeClass} font-medium border border-current/10`}>
      <Icon className={iconSize} />
      {label}
    </span>
  );
}