'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { MousePointer2 } from 'lucide-react';
import type { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js';

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

// Channel name - using a unique ID to ensure both instances connect to the same channel
const CHANNEL = 'cursor-tracking-intelligence';

export default function IntelligencePage(): JSX.Element {
  const [username, setUsername] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [userCursors, setUserCursors] = useState<Record<string, UserCursor>>({});
  const [localCursorPosition, setLocalCursorPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  
  const userId = useRef<string>(Math.random().toString(36).substring(2, 15));
  const userColor = useRef<string>(getRandomColor());
  const containerRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isInitialSetup = useRef<boolean>(true);
  
  // Generate a random color for the user
  function getRandomColor(): string {
    const colors: string[] = [
      '#FF5F5F', '#5F9EFF', '#5FFF8F', '#FF5FE0', '#FFC55F', '#AC5FFF',
      '#FF9F5F', '#5FFFA7', '#5FCAFF', '#D25FFF', '#FFA75F', '#5FFFED'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
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
        const presences = state[key] as UserInfo[];
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
            (presences) => (presences as UserInfo[]).some((presence: UserInfo) => presence.user_id === id)
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
    
    // Update local cursor position
    setLocalCursorPosition(newPosition);
    
    // Broadcast position to other users
    broadcastCursorPosition(newPosition);
  }, [broadcastCursorPosition]);
  
  return (
    <div 
      className='flex flex-col h-screen bg-neutral-900 text-white antialiased'
      onMouseMove={handleMouseMove}
      ref={containerRef}
      style={{ cursor: 'none' }} // Hide the native cursor
    >
      {/* Main tracking area with grid background */}
      <div className='flex-1 overflow-hidden relative'>
        <div 
          className='w-full h-full bg-neutral-800 relative'
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(75, 85, 99, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(75, 85, 99, 0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        >
          {/* Local cursor icon (replacing native cursor) */}
          <div
            className='absolute pointer-events-none flex flex-col items-start'
            style={{ 
              left: `${localCursorPosition.x}%`, 
              top: `${localCursorPosition.y}%`,
              zIndex: 110, // Higher than other cursors
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Local cursor trail effect */}
            <div 
              className='absolute w-3 h-3 rounded-full opacity-30'
              style={{ 
                backgroundColor: userColor.current,
                transform: 'translate(-50%, -50%)',
                filter: 'blur(2px)'
              }}
            />
            
            <div style={{ color: userColor.current }}>
              <MousePointer2 strokeWidth={1.5} size={24} className='drop-shadow-md' />
            </div>
          </div>
          
          {/* Render other users' cursors */}
          {Object.entries(userCursors).map(([id, { position, username: cursorUsername, color }]) => (
            <div
              key={id}
              className='absolute pointer-events-none flex flex-col items-start'
              style={{ 
                left: `${position.x}%`, 
                top: `${position.y}%`,
                zIndex: 100,
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
      </div>
      
      {/* Connection status */}
      {!isConnected && (
        <div className='absolute top-16 left-0 right-0 flex justify-center'>
          <div className='bg-red-500/80 text-white px-4 py-2 rounded-full text-sm'>
            Connecting to Supabase Realtime...
          </div>
        </div>
      )}
      
      {/* Active users list */}
      <div className='absolute top-4 right-4 flex gap-2 flex-wrap justify-end'>
        {Object.entries(userCursors).map(([id, { username: cursorUsername, color }]) => (
          <div 
            key={id} 
            className='flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-full bg-neutral-800 text-neutral-200 text-xs font-medium'
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
          className='flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-full bg-neutral-800 text-neutral-200 text-xs font-medium'
        >
          <div 
            className='w-2 h-2 rounded-full'
            style={{ backgroundColor: userColor.current }}
          ></div>
          {username} (you)
        </div>
      </div>
      
      {/* Page title */}
      <div className='absolute top-4 left-4'>
        <h1 className='text-2xl font-bold text-white'>Intelligence</h1>
        <p className='text-sm text-neutral-400'>Real-time cursor tracking</p>
      </div>
    </div>
  );
}