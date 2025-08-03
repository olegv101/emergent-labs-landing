'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';

import type { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js';
import { Dock } from '@/components/ui/dock';
import { MacWindow } from '@/components/ui/mac-window';
import { DesktopApp } from '@/components/ui/desktop-app';
import { TerminalApp } from '@/components/apps/terminal-app-v2';
import { TextEditApp } from '@/components/apps/text-edit-app-v2';
import { SpreadsheetApp } from '@/components/apps/spreadsheet-app-v2';
import { NotesApp } from '@/components/apps/notes-app';
import { MessagesApp } from '@/components/apps/messages-app-v2';
import { GmailApp } from '@/components/apps/gmail-app-v2';
import { CalendarApp } from '@/components/apps/calendar-app';
import { MacTopBar } from '@/components/ui/mac-top-bar';
import { CustomCursor } from '@/components/ui/custom-cursor';
import { AgentCursor } from '@/components/ui/agent-cursor';
import { AgentController } from '@/lib/agent-controller';
import { DEMO_WORKFLOWS } from '@/lib/agent-workflows';

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
  
  // Agent state
  const [agentState, setAgentState] = useState<{
    x: number;
    y: number;
    isClicking: boolean;
    isTyping: boolean;
    workflowName: string;
  } | null>(null);
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  
  const userId = useRef<string>(Math.random().toString(36).substring(2, 15));
  const userColor = useRef<string>(getRandomColor());
  const containerRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isInitialSetup = useRef<boolean>(true);
  const agentController = useRef<AgentController>(new AgentController());
  
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
      component: <MessagesApp />
    },
    {
      id: 'calendar',
      name: 'Calendar',
      icon: <Image src='/computer-apps/calendar.png' alt='Calendar' width={48} height={48} className='w-12 h-12' />,
      component: <CalendarApp />
    },
    {
      id: 'mail',
      name: 'Mail',
      icon: <Image src='/computer-apps/gmail.png' alt='Mail' width={48} height={48} className='w-12 h-12' />,
      component: <GmailApp />
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
  
  // Agent workflow execution
  const startAgentWorkflow = async (workflowId: string) => {
    const workflow = DEMO_WORKFLOWS.find(w => w.id === workflowId);
    if (!workflow || !containerRef.current) return;
    
    setIsAgentRunning(true);
    setSelectedWorkflow(workflowId);
    
    // Get logo position for cursor animation
    const logoElement = document.querySelector('[alt="Emergent Labs"]') as HTMLImageElement;
    if (logoElement) {
      const logoRect = logoElement.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Calculate center position of logo relative to container
      const logoCenterX = ((logoRect.left + logoRect.width / 2 - containerRect.left) / containerRect.width) * 100;
      const logoCenterY = ((logoRect.top + logoRect.height / 2 - containerRect.top) / containerRect.height) * 100;
      
      // Set initial cursor position behind logo (convert percentage to pixels)
      const initialX = (logoCenterX / 100) * containerRect.width;
      const initialY = (logoCenterY / 100) * containerRect.height;
      
      setAgentState({
        x: initialX,
        y: initialY,
        isClicking: false,
        isTyping: false,
        workflowName: workflow.name
      });
      
      // Wait a moment for cursor to appear
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Animate cursor moving out from behind logo
      const targetX = initialX + 100; // Move 100px to the right
      const targetY = initialY - 50; // Move 50px up
      
      setAgentState({
        x: targetX,
        y: targetY,
        isClicking: false,
        isTyping: false,
        workflowName: workflow.name
      });
      
      // Wait for cursor animation
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Set up agent controller
    agentController.current.setContainer(containerRef.current);
    agentController.current.onUpdate(setAgentState);
    
    // Execute workflow with callbacks
    agentController.current.executeWorkflow(workflow, {
      onAppOpen: (appId: string) => {
        openApp(appId);
      },
      onAppClick: (appId: string) => {
        openApp(appId);
      },
      onType: (selector: string, text: string) => {
        // Handle typing into specific elements
        // This would be enhanced to actually type into the apps
      }
    }).then(() => {
      setIsAgentRunning(false);
      setAgentState(null);
    });
  };
  
  const stopAgent = () => {
    agentController.current.stop();
    setIsAgentRunning(false);
    setAgentState(null);
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
        {/* Central Logo - Demo Trigger */}
        {!isAgentRunning && !windows.length && (
          <div 
            className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group'
            onClick={(e) => {
              e.stopPropagation();
              // Start the first workflow when logo is clicked
              const firstWorkflow = DEMO_WORKFLOWS[0];
              if (firstWorkflow) {
                startAgentWorkflow(firstWorkflow.id);
              }
            }}
          >
            <div className='relative'>
              {/* Shadow effect */}
              <div className='absolute inset-0 bg-black/20 rounded-[28px] blur-xl transform translate-y-4' />
              
              {/* Logo */}
              <Image 
                src='/computer-apps/applogo.svg' 
                alt='Emergent Labs' 
                width={108} 
                height={108} 
                className='relative z-10 transition-transform duration-300 group-hover:scale-110'
              />
              
              {/* Try me text */}
              <p className='text-center mt-4 text-sm text-gray-500 font-medium group-hover:text-gray-700 transition-colors'>
                try me!
              </p>
            </div>
          </div>
        )}
        
        {/* Agent Controls */}
      {!isAgentRunning && windows.length > 0 && (
        <div className='absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 z-50'>
          <h3 className='text-sm font-semibold mb-3'>AI Agent Demos</h3>
          <div className='space-y-2'>
            {DEMO_WORKFLOWS.map((workflow) => (
              <button
                key={workflow.id}
                onClick={() => startAgentWorkflow(workflow.id)}
                className='w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors'
              >
                <div className='font-medium text-sm'>{workflow.name}</div>
                <div className='text-xs text-gray-500'>{workflow.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Stop Agent Button */}
      {isAgentRunning && (
        <div className='absolute top-4 left-4 z-50'>
          <button
            onClick={stopAgent}
            className='bg-red-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-red-600 transition-colors flex items-center gap-2'
          >
            <span className='w-2 h-2 bg-white text-xs rounded-full animate-pulse' />
            Stop Agent
          </button>
        </div>
      )}
      
        {/* Desktop Grid for app icons - positioned on right side like macOS */}
        <div className='absolute top-0 right-0 p-4 w-80 h-full'>
          <div className='grid grid-cols-4 gap-2 content-start h-full'>
            {apps.map((app) => (
              <div key={app.id} data-app-id={app.id}>
                <DesktopApp
                  id={app.id}
                  name={app.name}
                  icon={app.icon}
                  onDoubleClick={() => openApp(app.id)}
                  isSelected={selectedApp === app.id}
                  onSelect={() => setSelectedApp(app.id)}
                />
              </div>
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
        
        {/* Render agent cursor */}
        {agentState && (
          <AgentCursor
            x={agentState.x}
            y={agentState.y}
            color='#FF5F5F'
            workflowName={agentState.workflowName}
            isClicking={agentState.isClicking}
            isTyping={agentState.isTyping}
            size={26}
          />
        )}
        
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
            <div>
              <CustomCursor color={color} size={24} />
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
      
      {/* Friends counter */}
      {Object.keys(userCursors).length > 0 && (
        <div className='absolute top-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none'>
          <div className='text-gray-400 text-xs font-medium'>
            + {Object.keys(userCursors).length} Friends!
          </div>
        </div>
      )}

      {/* macOS Dock */}
      <Dock
        items={apps.map(app => ({
          id: app.id,
          icon: app.icon,
          label: app.name,
          onClick: () => openApp(app.id),
          isActive: windows.some(w => w.app === app.id && !w.isMinimized),
          dataAttr: { 'data-dock-app-id': app.id }
        }))}
      />
    </div>
  );
}