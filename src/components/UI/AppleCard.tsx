import React from 'react';

interface AppleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glass?: boolean;
  dark?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const AppleCard: React.FC<AppleCardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  glass = false,
  dark = false,
  padding = 'md',
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-6 sm:p-8'
  };

  let bgClasses = 'bg-white border border-gray-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)]';
  if (dark) {
    bgClasses = 'bg-[#1C1C1E] text-white border border-white/10 shadow-sm';
  } else if (glass) {
    bgClasses = 'bg-white/85 backdrop-blur-xl border border-gray-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)]';
  }

  const hoverClass = hoverEffect 
    ? 'transition-all duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-gray-300/80 hover:-translate-y-0.5' 
    : '';

  return (
    <div
      className={`rounded-[28px] md:rounded-[32px] ${bgClasses} ${paddingClasses[padding]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
