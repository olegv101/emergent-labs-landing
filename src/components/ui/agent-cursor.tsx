'use client';

import React from 'react';
import { CustomCursor } from './custom-cursor';

interface AgentCursorProps {
  x: number;
  y: number;
  color: string;
  workflowName: string;
  isClicking: boolean;
  isTyping: boolean;
  size?: number;
}

export const AgentCursor: React.FC<AgentCursorProps> = ({ 
  x, 
  y, 
  color, 
  workflowName, 
  isClicking,
  isTyping,
  size = 26 
}) => {
  return (
    <div
      className='absolute pointer-events-none flex flex-col items-start transition-all duration-500 ease-out'
      style={{ 
        left: `${x}px`, 
        top: `${y}px`,
        zIndex: 10001,
      }}
    >
      {/* Click animation */}
      {isClicking && (
        <div 
          className='absolute w-8 h-8 rounded-full bg-white/30 animate-ping'
          style={{ 
            left: '-16px',
            top: '-16px',
          }}
        />
      )}
      
      {/* Cursor trail effect */}
      <div 
        className='absolute w-4 h-4 rounded-full opacity-40 transition-all duration-300'
        style={{ 
          backgroundColor: color,
          transform: 'translate(-50%, -50%)',
          filter: 'blur(4px)',
          left: '8px',
          top: '8px',
        }}
      />
      
      {/* Cursor icon */}
      <div className='relative'>
        <CustomCursor color={color} size={size} />
        
        {/* Typing indicator */}
        {isTyping && (
          <div className='absolute -right-2 -bottom-2'>
            <div className='flex gap-0.5'>
              <div className='w-1 h-1 bg-gray-600 rounded-full animate-bounce' style={{ animationDelay: '0ms' }} />
              <div className='w-1 h-1 bg-gray-600 rounded-full animate-bounce' style={{ animationDelay: '150ms' }} />
              <div className='w-1 h-1 bg-gray-600 rounded-full animate-bounce' style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>
      
      {/* Workflow label */}
      <div
        className='mt-2 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap shadow-lg backdrop-blur-sm'
        style={{ 
          backgroundColor: color,
          color: '#fff',
          fontWeight: 600,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)'
        }}
      >
        {workflowName}
      </div>
    </div>
  );
};