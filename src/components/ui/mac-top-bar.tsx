'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Volume2, Search } from 'lucide-react';

interface MacTopBarProps {
  username: string;
}

export const MacTopBar: React.FC<MacTopBarProps> = ({ username }) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='h-6 bg-black/80 backdrop-blur-md border-b border-gray-700/30 flex items-center justify-between px-3 text-white text-sm select-none relative z-50'>
      {/* Left side - Apple logo and menu items */}
      <div className='flex items-center gap-4'>
        {/* Apple logo */}
        <div className='text-white text-sm font-medium cursor-pointer hover:bg-white/10 px-2 py-1 rounded'>
          
        </div>
        
        {/* Menu items */}
        <div className='flex items-center gap-0'>
          <button className='hover:bg-white/10 px-2 py-1 rounded text-xs font-medium'>
            Intelligence
          </button>
          <button className='hover:bg-white/10 px-2 py-1 rounded text-xs'>
            File
          </button>
          <button className='hover:bg-white/10 px-2 py-1 rounded text-xs'>
            Edit
          </button>
          <button className='hover:bg-white/10 px-2 py-1 rounded text-xs'>
            View
          </button>
          <button className='hover:bg-white/10 px-2 py-1 rounded text-xs'>
            Window
          </button>
          <button className='hover:bg-white/10 px-2 py-1 rounded text-xs'>
            Help
          </button>
        </div>
      </div>

      {/* Center - User's name */}
      <div className='absolute left-1/2 transform -translate-x-1/2 text-xs text-white/80 font-medium'>
        {username}
      </div>

      {/* Right side - System indicators */}
      <div className='flex items-center gap-2'>
        <div className='flex items-center gap-1'>
          {/* Battery */}
          <div className='flex items-center gap-1 hover:bg-white/10 px-1 py-0.5 rounded cursor-pointer'>
            <Battery size={12} className='text-white/80' />
            <span className='text-xs text-white/80'>84%</span>
          </div>
          
          {/* Wifi */}
          <div className='hover:bg-white/10 p-1 rounded cursor-pointer'>
            <Wifi size={12} className='text-white/80' />
          </div>
          
          {/* Volume */}
          <div className='hover:bg-white/10 p-1 rounded cursor-pointer'>
            <Volume2 size={12} className='text-white/80' />
          </div>
          
          {/* Search */}
          <div className='hover:bg-white/10 p-1 rounded cursor-pointer'>
            <Search size={12} className='text-white/80' />
          </div>
        </div>
        
        {/* Time */}
        <div className='text-xs text-white/90 font-medium ml-2'>
          {currentTime}
        </div>
      </div>
    </div>
  );
};