import React from 'react';
import { motion } from 'motion/react';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className = ''
}: SegmentedControlProps<T>) {
  const containerPadding = size === 'sm' ? 'p-1' : 'p-1';
  const itemPadding = size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-xs sm:text-sm';

  return (
    <div
      className={`inline-flex items-center rounded-full bg-gray-100/90 border border-gray-200/60 ${containerPadding} ${className}`}
      role="tablist"
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`relative flex items-center justify-center gap-1.5 font-medium rounded-full transition-colors cursor-pointer select-none ${itemPadding} ${
              isSelected ? 'text-[#1C1C1E] font-semibold' : 'text-gray-500 hover:text-black'
            }`}
            role="tab"
            aria-selected={isSelected}
          >
            {isSelected && (
              <motion.div
                layoutId="segmented-indicator"
                className="absolute inset-0 bg-white rounded-full shadow-2xs"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5 whitespace-nowrap">
              {option.icon && <span className="shrink-0">{option.icon}</span>}
              <span>{option.label}</span>
              {option.count !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                    isSelected
                      ? 'bg-[#1C1C1E] text-white'
                      : 'bg-gray-200/80 text-gray-600'
                  }`}
                >
                  {option.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

