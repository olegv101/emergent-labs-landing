'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MacWindowProps {
  id: string;
  title: string;
  children: ReactNode;
  defaultWidth?: number;
  defaultHeight?: number;
  defaultX?: number;
  defaultY?: number;
  onClose?: () => void;
  onMinimize?: () => void;
  onFocus?: () => void;
  isActive?: boolean;
  className?: string;
  minWidth?: number;
  minHeight?: number;
}

export const MacWindow: React.FC<MacWindowProps> = ({
  id,
  title,
  children,
  defaultWidth = 600,
  defaultHeight = 400,
  defaultX = 100,
  defaultY = 100,
  onClose,
  onMinimize,
  onFocus,
  isActive = false,
  className,
  minWidth = 300,
  minHeight = 200,
}) => {
  const [position, setPosition] = useState({ x: defaultX, y: defaultY });
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('window-header')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
      onFocus?.();
    }
  };

  // Handle resize
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      width: size.width,
      height: size.height,
      x: e.clientX,
      y: e.clientY,
    });
    onFocus?.();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      } else if (isResizing) {
        const newWidth = Math.max(minWidth, resizeStart.width + (e.clientX - resizeStart.x));
        const newHeight = Math.max(minHeight, resizeStart.height + (e.clientY - resizeStart.y));
        setSize({
          width: newWidth,
          height: newHeight,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, minWidth, minHeight]);

  return (
    <div
      ref={windowRef}
      className={cn(
        'absolute bg-white rounded-lg shadow-2xl overflow-hidden',
        'border border-gray-200',
        isActive ? 'z-50' : 'z-30',
        className
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
      onMouseDown={() => onFocus?.()}
    >
      {/* Window Header */}
      <div
        className='window-header h-11 bg-gradient-to-b from-gray-100 to-gray-200 border-b border-gray-300 flex items-center px-4 select-none cursor-move'
        onMouseDown={handleMouseDown}
      >
        {/* Traffic Lights */}
        <div className='flex items-center gap-2'>
          <button
            onClick={onClose}
            className='w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors group relative'
          >
            <span className='opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center text-[8px] text-red-900 font-bold'>
              ×
            </span>
          </button>
          <button
            onClick={onMinimize}
            className='w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors group relative'
          >
            <span className='opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center text-[8px] text-yellow-900 font-bold'>
              −
            </span>
          </button>
          <button className='w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors group relative'>
            <span className='opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center text-[8px] text-green-900 font-bold'>
              +
            </span>
          </button>
        </div>

        {/* Window Title */}
        <div className='flex-1 text-center'>
          <span className='text-sm font-medium text-gray-700'>{title}</span>
        </div>

        {/* Spacer for balance */}
        <div className='w-[52px]'></div>
      </div>

      {/* Window Content */}
      <div className='flex-1 overflow-auto bg-white' style={{ height: `calc(100% - 44px)` }}>
        {children}
      </div>

      {/* Resize Handle */}
      <div
        className='absolute bottom-0 right-0 w-4 h-4 cursor-se-resize'
        onMouseDown={handleResizeMouseDown}
      >
        <div className='absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-gray-400'></div>
      </div>
    </div>
  );
};