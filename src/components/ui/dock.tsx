'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface DockItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
  dataAttr?: Record<string, string>;
}

interface DockProps {
  items: DockItem[];
  className?: string;
}

interface DockItemProps {
  item: DockItem;
  isHovered: boolean;
  neighbors: { prev: boolean; next: boolean };
  onHover: (id: string | null) => void;
}

const DockItemComponent: React.FC<DockItemProps> = ({ item, isHovered, neighbors, onHover }) => {
  const scale = isHovered ? 1.8 : (neighbors.prev || neighbors.next) ? 1.3 : 1;
  
  return (
    <div
      className={cn(
        'relative flex items-center justify-center transition-all duration-200 ease-out',
        'cursor-pointer'
      )}
      style={{
        transform: `scale(${scale}) translateY(${isHovered ? '-10px' : '0px'})`,
        marginLeft: isHovered || neighbors.prev ? '8px' : '2px',
        marginRight: isHovered || neighbors.next ? '8px' : '2px',
      }}
      onMouseEnter={() => onHover(item.id)}
      onMouseLeave={() => onHover(null)}
      onClick={item.onClick}
      {...item.dataAttr}
    >
      <div className='w-12 h-12 relative'>
        {item.icon}
        
        {/* Active indicator */}
        {item.isActive && (
          <div className='absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-gray-600 rounded-full' />
        )}
      </div>
      
      {/* Tooltip */}
      <div className={cn(
        'absolute -top-8 left-1/2 -translate-x-1/2',
        'px-3 py-1 rounded-md whitespace-nowrap',
        'bg-gray-800/90 backdrop-blur-sm',
        'text-white text-xs font-normal',
        'transition-all duration-200',
        'pointer-events-none',
        isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}>
        {item.label}
      </div>
    </div>
  );
};

export const Dock: React.FC<DockProps> = ({ items, className }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  const getNeighbors = (index: number) => {
    const hoveredIndex = items.findIndex(item => item.id === hoveredId);
    return {
      prev: hoveredIndex >= 0 && index === hoveredIndex - 1,
      next: hoveredIndex >= 0 && index === hoveredIndex + 1,
    };
  };

  return (
    <div className={cn(
      'fixed bottom-2 left-1/2 -translate-x-1/2 z-[9999]',
      className
    )}>
      <div className={cn(
        'flex items-end gap-1 px-2 py-1',
        'bg-white/70 backdrop-blur-2xl',
        'border border-gray-200/50',
        'rounded-2xl',
        'shadow-lg',
        'relative'
      )}>
        {items.map((item, index) => (
          <DockItemComponent
            key={item.id}
            item={item}
            isHovered={hoveredId === item.id}
            neighbors={getNeighbors(index)}
            onHover={setHoveredId}
          />
        ))}
      </div>
    </div>
  );
};