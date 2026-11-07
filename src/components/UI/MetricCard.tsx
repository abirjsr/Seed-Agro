import React from 'react';
import { AppleCard } from './AppleCard';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  accentColor?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  icon,
  trend,
  accentColor = 'bg-[#007AFF]/10 text-[#007AFF]',
  onClick
}) => {
  return (
    <AppleCard
      hoverEffect={!!onClick}
      onClick={onClick}
      className={`relative overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
      padding="md"
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-[#8E8E93] tracking-tight">{title}</span>
          <span className="text-2xl font-bold text-[#1C1C1E] tracking-tight mt-1">{value}</span>
          {subValue && (
            <span className="text-xs text-[#636366] mt-0.5">{subValue}</span>
          )}
        </div>
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${accentColor} shrink-0 shadow-xs`}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-black/[0.04] flex items-center gap-1.5 text-xs">
          <span
            className={`inline-flex items-center gap-0.5 font-semibold ${
              trend.isPositive ? 'text-[#34C759]' : 'text-[#FF3B30]'
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {trend.value}
          </span>
          <span className="text-[#8E8E93]">{trend.label || 'vs last month'}</span>
        </div>
      )}
    </AppleCard>
  );
};
