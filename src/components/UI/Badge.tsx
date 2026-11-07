import React from 'react';

export type BadgeVariant = 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'gray' | 'teal' | 'indigo';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'blue',
  size = 'md',
  icon,
  dot = false,
  className = ''
}) => {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; dotColor: string; border: string }> = {
    blue: {
      bg: 'bg-[#007AFF]/10',
      text: 'text-[#007AFF]',
      dotColor: 'bg-[#007AFF]',
      border: 'border-[#007AFF]/20'
    },
    green: {
      bg: 'bg-[#34C759]/12',
      text: 'text-[#28A745]',
      dotColor: 'bg-[#34C759]',
      border: 'border-[#34C759]/20'
    },
    orange: {
      bg: 'bg-[#FF9500]/12',
      text: 'text-[#D97706]',
      dotColor: 'bg-[#FF9500]',
      border: 'border-[#FF9500]/25'
    },
    purple: {
      bg: 'bg-[#AF52DE]/12',
      text: 'text-[#9333EA]',
      dotColor: 'bg-[#AF52DE]',
      border: 'border-[#AF52DE]/20'
    },
    red: {
      bg: 'bg-[#FF3B30]/12',
      text: 'text-[#DC2626]',
      dotColor: 'bg-[#FF3B30]',
      border: 'border-[#FF3B30]/20'
    },
    gray: {
      bg: 'bg-[#8E8E93]/12',
      text: 'text-[#636366]',
      dotColor: 'bg-[#8E8E93]',
      border: 'border-[#8E8E93]/20'
    },
    teal: {
      bg: 'bg-[#30B0C7]/12',
      text: 'text-[#0E7490]',
      dotColor: 'bg-[#30B0C7]',
      border: 'border-[#30B0C7]/20'
    },
    indigo: {
      bg: 'bg-[#5856D6]/12',
      text: 'text-[#4F46E5]',
      dotColor: 'bg-[#5856D6]',
      border: 'border-[#5856D6]/20'
    }
  };

  const style = variantStyles[variant];
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeClass} tracking-tight whitespace-nowrap select-none ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${style.dotColor} shrink-0 animate-pulse`} />}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
