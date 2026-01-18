import { CheckCircle, Clock, LogOut, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'on-time' | 'late' | 'early-leave' | 'absent';
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = {
    'on-time': {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: 'Vaxtında',
      icon: CheckCircle,
    },
    late: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      label: 'Gecikdi',
      icon: Clock,
    },
    'early-leave': {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      label: 'Erkən Çıxdı',
      icon: LogOut,
    },
    absent: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      label: 'İşə gəlmədi',
      icon: XCircle,
    },
  };

  const { bg, text, label, icon: Icon } = config[status];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-base px-4 py-2' : 'text-sm px-3 py-1';
  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${bg} ${text} ${sizeClass} font-medium`}>
      <Icon className={iconSize} />
      {label}
    </span>
  );
}