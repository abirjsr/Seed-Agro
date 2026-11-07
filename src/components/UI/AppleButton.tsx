import React from 'react';

interface AppleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: React.ReactNode;
  children?: React.ReactNode;
  isLoading?: boolean;
}

export const AppleButton: React.FC<AppleButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  isLoading,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none cursor-pointer whitespace-nowrap';

  const sizeClasses = {
    sm: 'text-xs px-3.5 py-1.5 rounded-full gap-1.5 tracking-tight',
    md: 'text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full gap-2 tracking-tight',
    lg: 'text-sm sm:text-base px-6 py-3 rounded-full gap-2.5 tracking-tight font-semibold',
    icon: 'p-2 rounded-full w-9 h-9 flex items-center justify-center'
  };

  const variantClasses = {
    primary: 'bg-[#007AFF] text-white hover:bg-[#0066D6] shadow-[0_2px_8px_rgba(0,122,255,0.25)] hover:shadow-[0_4px_14px_rgba(0,122,255,0.35)]',
    dark: 'bg-[#1C1C1E] text-white hover:bg-black shadow-[0_2px_8px_rgba(0,0,0,0.15)] hover:opacity-90',
    secondary: 'bg-[#F2F2F7] text-[#1C1C1E] hover:bg-[#E5E5EA] border border-black/[0.04]',
    outline: 'bg-white text-[#1C1C1E] hover:bg-gray-50 border border-gray-200 shadow-2xs',
    ghost: 'bg-transparent text-[#1C1C1E] hover:bg-black/[0.05]',
    danger: 'bg-[#FF3B30] text-white hover:bg-[#D70015] shadow-[0_2px_8px_rgba(255,59,48,0.25)]',
    success: 'bg-[#34C759] text-white hover:bg-[#28A745] shadow-[0_2px_8px_rgba(52,199,89,0.25)]'
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
};
