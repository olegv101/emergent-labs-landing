'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface DesktopAppProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  onDoubleClick: () => void;
  isSelected?: boolean;
  onSelect?: () => void;
  useWhiteText?: boolean; // Controls if the text below the icon is white
}

export const DesktopApp: React.FC<DesktopAppProps> = ({
  id,
  name,
  icon,
  onDoubleClick,
  isSelected = false,
  onSelect,
  useWhiteText = false,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick();
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer select-none',
        'hover:bg-gray-200/50 transition-colors',
        isSelected && 'bg-blue-200/50'
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div className='w-16 h-16 flex items-center justify-center mb-1'>
        {icon}
      </div>
      <span className={cn(
        'text-xs text-center max-w-[80px] px-1 py-0.5 rounded',
        isSelected ? 'bg-blue-500 text-white' : useWhiteText ? 'text-white' : 'text-gray-700'
      )}>
        {name}
      </span>
    </div>
  );
};