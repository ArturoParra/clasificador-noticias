import type { NewsCategory } from '../types/types';
import { ShieldCheck, ShieldAlert, Laugh, AlertTriangle } from 'lucide-react';

interface CredibilityBadgeProps {
  category: Exclude<NewsCategory, 'all'>;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

const badgeConfig = {
  real: {
    label: 'Verdadera',
    icon: ShieldCheck,
    bgColor: 'bg-green-600',
    textColor: 'text-white',
    borderColor: '',
  },
  /* fake: {
    label: 'Falsa',
    icon: ShieldAlert,
    bgColor: 'bg-red-600',
    textColor: 'text-white',
    borderColor: 'border-2 border-red-400',
  },
  satire: {
    label: 'Sátira',
    icon: Laugh,
    bgColor: 'bg-yellow-500',
    textColor: 'text-black',
    borderColor: '',
  }, */
  misleading: {
    label: 'Engañosa',
    icon: AlertTriangle,
    bgColor: 'bg-orange-600',
    textColor: 'text-white',
    borderColor: '',
  },
};

export function CredibilityBadge({ category, score, size = 'md' }: CredibilityBadgeProps) {
  const config = badgeConfig[category];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-[10px]',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm',
  };

  const iconSizes = {
    sm: 'size-3',
    md: 'size-3.5',
    lg: 'size-5',
  };

  return (
    <div className={`${config.bgColor} ${config.textColor} ${config.borderColor || ''} ${sizeClasses[size]} rounded-full flex items-center gap-1.5 font-semibold shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-110`}>
      <Icon className={iconSizes[size]} />
      <span>{config.label}</span>
      {score !== undefined && <span className="opacity-80 ml-1">| {score}%</span>}
    </div>
  );
}