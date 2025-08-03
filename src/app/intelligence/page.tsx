'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { MousePointer2 } from 'lucide-react';
import type { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js';
import { Dock } from '@/components/ui/dock';
import { MacWindow } from '@/components/ui/mac-window';
import { DesktopApp } from '@/components/ui/desktop-app';
import { TerminalApp } from '@/components/apps/terminal-app';
import { TextEditApp } from '@/components/apps/text-edit-app';
import { SpreadsheetApp } from '@/components/apps/spreadsheet-app';
import { NotesApp } from '@/components/apps/notes-app';
import { MacTopBar } from '@/components/ui/mac-top-bar';

// Types
interface CursorPosition {
  x: number;
  y: number;
}

interface UserInfo {
  user_id: string;
  username: string;
  color: string;
  online_at: number;
}

interface UserCursor {
  username: string;
  color: string;
  position: CursorPosition;
  online_at: number;
}

interface CursorMovePayload {
  userId: string;
  x: number;
  y: number;
}

interface Window {
  id: string;
  app: string;
  title: string;
  isMinimized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface App {
  id: string;
  name: string;
  icon: React.ReactNode;
  component?: React.ReactNode;
}

// Channel name - using a unique ID to ensure both instances connect to the same channel
const CHANNEL = 'cursor-tracking-intelligence';

export default function IntelligencePage(): React.JSX.Element {
  const [username, setUsername] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [userCursors, setUserCursors] = useState<Record<string, UserCursor>>({});
  
  // Desktop state
  const [windows, setWindows] = useState<Window[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  
  const userId = useRef<string>(Math.random().toString(36).substring(2, 15));
  const userColor = useRef<string>(getRandomColor());
  const containerRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isInitialSetup = useRef<boolean>(true);
  
  // App definitions
  const apps: App[] = [
    {
      id: 'finder',
      name: 'Finder',
      icon: <Image src='/computer-apps/finder.webp' alt='Finder' width={48} height={48} className='w-12 h-12' />,
      component: <div className='p-4'>Finder coming soon...</div>
    },
    {
      id: 'terminal',
      name: 'Terminal',
      icon: <Image src='/computer-apps/terminal.webp' alt='Terminal' width={48} height={48} className='w-12 h-12' />,
      component: <TerminalApp />
    },
    {
      id: 'textedit',
      name: 'TextEdit',
      icon: <Image src='/computer-apps/word.png' alt='word' width={48} height={48} className='w-12 h-12' />,
      component: <TextEditApp />
    },
    {
      id: 'numbers',
      name: 'Numbers',
      icon: <Image src='/computer-apps/excel.png' alt='Excel' width={48} height={48} className='w-12 h-12' />,
      component: <SpreadsheetApp />
    },
    {
      id: 'notes',
      name: 'Notes',
      icon: <Image src='/computer-apps/notes.png' alt='Terminal' width={48} height={48} className='w-12 h-12' />,
      component: <NotesApp />
    },
    {
      id: 'safari',
      name: 'Safari',
      icon: <Image src='/computer-apps/safari.png' alt='Safari' width={48} height={48} className='w-12 h-12' />,
      component: <iframe src='https://emergent-labs.com' className='w-full h-full' />
    },
    {
      id: 'messages',
      name: 'Messages',
      icon: <Image src='/computer-apps/imessages.png' alt='Messages' width={48} height={48} className='w-12 h-12' />,
      component: <div className='p-4'>Messages coming soon...</div>
    },
    {
      id: 'calendar',
      name: 'Calendar',
      icon: <Image src='/computer-apps/calendar.png' alt='Calendar' width={48} height={48} className='w-12 h-12' />,
      component: <div className='p-4'>Calendar coming soon...</div>
    },
    {
      id: 'mail',
      name: 'Mail',
      icon: <Image src='/computer-apps/gmail.png' alt='Mail' width={48} height={48} className='w-12 h-12' />,
      component: <div className='p-4'>Mail coming soon...</div>
    },
  ];
  
  // Generate a random color for the user
  function getRandomColor(): string {
    const colors: string[] = [
      '#FF5F5F', '#5F9EFF', '#5FFF8F', '#FF5FE0', '#FFC55F', '#AC5FFF',
      '#FF9F5F', '#5FFFA7', '#5FCAFF', '#D25FFF', '#FFA75F', '#5FFFED'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  // Window management functions
  const openApp = (appId: string) => {
    const app = apps.find(a => a.id === appId);
    if (!app) return;
    
    const existingWindow = windows.find(w => w.app === appId);
    if (existingWindow) {
      setActiveWindowId(existingWindow.id);
      if (existingWindow.isMinimized) {
        setWindows(windows.map(w => 
          w.id === existingWindow.id ? { ...w, isMinimized: false } : w
        ));
      }
      return;
    }
    
    const newWindow: Window = {
      id: Date.now().toString(),
      app: appId,
      title: app.name,
      isMinimized: false,
      position: { 
        x: 100 + windows.length * 30, 
        y: 100 + windows.length * 30 
      },
      size: { width: 800, height: 600 }
    };
    
    setWindows([...windows, newWindow]);
    setActiveWindowId(newWindow.id);
  };
  
  const closeWindow = (windowId: string) => {
    setWindows(windows.filter(w => w.id !== windowId));
    if (activeWindowId === windowId) {
      setActiveWindowId(null);
    }
  };
  
  const minimizeWindow = (windowId: string) => {
    setWindows(windows.map(w => 
      w.id === windowId ? { ...w, isMinimized: true } : w
    ));
  };
  
  const bringToFront = (windowId: string) => {
    setActiveWindowId(windowId);
  };
  
  // Set up Supabase channel
  useEffect(() => {
    const supabase = createClient();
    
    // Generate a random username
    const adjectives: string[] = ['Happy', 'Clever', 'Brave', 'Bright', 'Kind'];
    const nouns: string[] = ['Panda', 'Tiger', 'Eagle', 'Dolphin', 'Fox'];
    const randomName = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${
      nouns[Math.floor(Math.random() * nouns.length)]
    }${Math.floor(Math.random() * 100)}`;
    setUsername(randomName);
    
    // Subscribe to channel
    const channel = supabase.channel(CHANNEL);
    channelRef.current = channel;
    
    // Handle presence for user information (not cursor positions)
    channel.on('presence', { event: 'sync' }, () => {
      const state: RealtimePresenceState = channel.presenceState();
      
      // Update user information in state
      const updatedUserInfo: Record<string, Omit<UserCursor, 'position'>> = {};
      Object.keys(state).forEach((key: string) => {
        const presences = state[key] as unknown as UserInfo[];
        if (Array.isArray(presences)) {
          presences.forEach((presence: UserInfo) => {
            // Skip our own user info
            if (presence.user_id === userId.current) return;
            
            // Store user info (but not cursor position)
            updatedUserInfo[presence.user_id] = {
              username: presence.username,
              color: presence.color,
              online_at: presence.online_at
            };
          });
        }
      });
      
      // Remove users who are no longer present
      setUserCursors((prevCursors: Record<string, UserCursor>) => {
        const newCursors: Record<string, UserCursor> = { ...prevCursors };
        
        // Add/update users from presence
        Object.keys(updatedUserInfo).forEach((id: string) => {
          newCursors[id] = {
            ...newCursors[id],
            ...updatedUserInfo[id],
            // Initialize position if it doesn't exist
            position: newCursors[id]?.position || { x: 0, y: 0 }
          };
        });
        
        // Remove users no longer in presence
        Object.keys(newCursors).forEach((id: string) => {
          const userExists = Object.values(state).some(
            (presences) => {
              const userInfoArray = presences as unknown as UserInfo[];
              return Array.isArray(userInfoArray) && userInfoArray.some((presence: UserInfo) => presence.user_id === id);
            }
          );
          
          if (!userExists) {
            delete newCursors[id];
          }
        });
        
        return newCursors;
      });
    });
    
    // Handle cursor movement broadcasts for immediate updates
    channel.on('broadcast', { event: 'cursor_move' }, (payload: { payload: CursorMovePayload }) => {
      if (payload.payload.userId === userId.current) return;
      
      const { userId: cursorUserId, x, y } = payload.payload;
      
      // Update cursor position in state, preserving other user info
      setUserCursors((prevCursors: Record<string, UserCursor>) => {
        if (!prevCursors[cursorUserId]) return prevCursors;
        
        return {
          ...prevCursors,
          [cursorUserId]: {
            ...prevCursors[cursorUserId],
            position: { x, y }
          }
        };
      });
    });
    
    // Initial subscription
    channel.subscribe(async (status: string) => {
      if (status === 'SUBSCRIBED') {
        // Initial presence tracking with user info (without cursor position)
        await channel.track({
          user_id: userId.current,
          username: randomName,
          color: userColor.current,
          online_at: new Date().getTime()
        });
        
        setIsConnected(true);
        isInitialSetup.current = false;
      }
    });
    
    // Clean up on unmount
    return () => {
      channel.unsubscribe();
    };
  }, []);
  
  // Broadcast cursor position immediately on mouse move
  const broadcastCursorPosition = useCallback((position: CursorPosition): void => {
    if (!channelRef.current || !isConnected || isInitialSetup.current) return;
    
    // Send cursor position as broadcast for immediate updates
    channelRef.current.send({
      type: 'broadcast',
      event: 'cursor_move',
      payload: {
        userId: userId.current,
        x: position.x,
        y: position.y
      }
    });
  }, [isConnected]);
  
  // Track and broadcast mouse movement
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>): void => {
    if (!containerRef.current) return;
    
    // Get container bounds
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate relative position within container (as percentage)
    const relativeX = ((e.clientX - rect.left) / rect.width) * 100;
    const relativeY = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newPosition: CursorPosition = { x: relativeX, y: relativeY };
    
    // Broadcast position to other users
    broadcastCursorPosition(newPosition);
  }, [broadcastCursorPosition]);
  
  return (
    <div 
      className='flex flex-col h-screen bg-[#ECECEC] antialiased'
      onMouseMove={handleMouseMove}
      ref={containerRef}
      style={{ cursor: 'default' }}
    >
      {/* macOS Top Bar */}
      <MacTopBar username={username} />
      
      {/* Desktop */}
      <div 
        className='flex-1 overflow-hidden relative'
        onClick={() => setSelectedApp(null)}
      >
        {/* Desktop Grid for app icons - positioned on right side like macOS */}
        <div className='absolute top-0 right-0 p-4 w-80 h-full'>
          <div className='grid grid-cols-4 gap-2 content-start h-full'>
            {apps.map((app) => (
              <DesktopApp
                key={app.id}
                id={app.id}
                name={app.name}
                icon={app.icon}
                onDoubleClick={() => openApp(app.id)}
                isSelected={selectedApp === app.id}
                onSelect={() => setSelectedApp(app.id)}
              />
            ))}
          </div>
        </div>
        
        {/* Windows */}
        {windows.map((window) => {
          const app = apps.find(a => a.id === window.app);
          if (!app || window.isMinimized) return null;
          
          return (
            <MacWindow
              key={window.id}
              id={window.id}
              title={window.title}
              defaultX={window.position.x}
              defaultY={window.position.y}
              defaultWidth={window.size.width}
              defaultHeight={window.size.height}
              isActive={activeWindowId === window.id}
              onClose={() => closeWindow(window.id)}
              onMinimize={() => minimizeWindow(window.id)}
              onFocus={() => bringToFront(window.id)}
            >
              {app.component}
            </MacWindow>
          );
        })}
        
        {/* Render other users' cursors */}
        {Object.entries(userCursors).map(([id, { position, username: cursorUsername, color }]) => (
          <div
            key={id}
            className='absolute pointer-events-none flex flex-col items-start'
            style={{ 
              left: `${position.x}%`, 
              top: `${position.y}%`,
              zIndex: 10000,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Cursor trail effect */}
            <div 
              className='absolute w-3 h-3 rounded-full opacity-40'
              style={{ 
                backgroundColor: color,
                transform: 'translate(-50%, -50%)',
                filter: 'blur(3px)'
              }}
            />
            
            {/* Cursor icon */}
            <div style={{ color }}>
              <MousePointer2 strokeWidth={1.5} size={24} className='drop-shadow-md' />
            </div>
            
            {/* Username label */}
            <div
              className='mt-2 px-2 py-1 rounded text-xs whitespace-nowrap'
              style={{ 
                backgroundColor: color,
                color: '#fff',
                fontWeight: 500,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
              }}
            >
              {cursorUsername}
            </div>
          </div>
        ))}
      </div>
      
      {/* Connection status */}
      {!isConnected && (
        <div className='absolute top-20 left-0 right-0 flex justify-center'>
          <div className='bg-red-500/80 text-white px-4 py-2 rounded-full text-sm'>
            Connecting to Supabase Realtime...
          </div>
        </div>
      )}
      
      {/* Active users list */}
      <div className='absolute top-8 right-4 flex gap-2 flex-wrap justify-end'>
        {Object.entries(userCursors).map(([id, { username: cursorUsername, color }]) => (
          <div 
            key={id} 
            className='flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-full bg-white/80 backdrop-blur text-gray-700 text-xs font-medium shadow-sm'
          >
            <div 
              className='w-2 h-2 rounded-full'
              style={{ backgroundColor: color }}
            ></div>
            {cursorUsername}
          </div>
        ))}
        {/* Include yourself in the list */}
        <div 
          className='flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-full bg-white/80 backdrop-blur text-gray-700 text-xs font-medium shadow-sm'
        >
          <div 
            className='w-2 h-2 rounded-full'
            style={{ backgroundColor: userColor.current }}
          ></div>
          {username} (you)
        </div>
      </div>

      {/* macOS Dock */}
      <Dock
        items={apps.map(app => ({
          id: app.id,
          icon: app.icon,
          label: app.name,
          onClick: () => openApp(app.id),
          isActive: windows.some(w => w.app === app.id && !w.isMinimized)
        }))}
      />
    </div>
  );
}