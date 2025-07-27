'use client';

import { VT323 } from 'next/font/google';
import { useState, useEffect } from 'react';

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
});

type TerminalLine = {
  id: number;
  text: string;
  isCommand?: boolean;
};

export default function Home() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: 1, text: 'Emergent Labs Terminal v1.0.0', isCommand: false },
    { id: 2, text: 'Copyright (c) 2024 Emergent Labs. All rights reserved.', isCommand: false },
    { id: 3, text: '', isCommand: false },
    { id: 4, text: 'Type "help" for available commands.', isCommand: false },
    { id: 5, text: '', isCommand: false },
  ]);
  
  const [currentInput, setCurrentInput] = useState<string>('');
  const [showCursor, setShowCursor] = useState<boolean>(true);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  const addLine = (text: string, isCommand = false): void => {
    setLines(prev => [...prev, { id: Date.now(), text, isCommand }]);
  };

  const executeCommand = (command: string): void => {
    const trimmedCommand = command.trim().toLowerCase();
    
    // Add command to history
    if (trimmedCommand) {
      setCommandHistory(prev => [...prev, trimmedCommand]);
    }
    
    // Add the command line to display
    addLine(`$ ${command}`, true);
    
    // Execute command
    switch (trimmedCommand) {
      case 'help':
        addLine('Available commands:');
        addLine('  help     - Show this help message');
        addLine('  about    - About Emergent Labs');
        addLine('  contact  - Contact information');
        addLine('  clear    - Clear terminal');
        addLine('  whoami   - Display current user');
        addLine('  date     - Show current date and time');
        addLine('  echo     - Echo text (usage: echo <text>)');
        break;
      
      case 'about':
        addLine('Emergent Labs - Building the future through emergent technologies');
        addLine('We specialize in cutting-edge research and development');
        addLine('in artificial intelligence and complex systems.');
        break;
      
      case 'contact':
        addLine('Contact Emergent Labs:');
        addLine('Email: hello@emergentlabs.com');
        addLine('Web:   https://emergentlabs.com');
        break;
      
      case 'clear':
        setLines([
          { id: Date.now(), text: 'Emergent Labs Terminal v1.0.0', isCommand: false },
          { id: Date.now() + 1, text: '', isCommand: false },
        ]);
        break;
      
      case 'whoami':
        addLine('visitor');
        break;
      
      case 'date':
        addLine(new Date().toString());
        break;
      
      case '':
        // Empty command, just add new prompt
        break;
      
      default:
        if (trimmedCommand.startsWith('echo ')) {
          const echoText = command.slice(5);
          addLine(echoText);
        } else {
          addLine(`Command not found: ${trimmedCommand}`);
          addLine('Type "help" for available commands.');
        }
    }
    
    addLine('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      executeCommand(currentInput);
      setCurrentInput('');
      setHistoryIndex(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
        }
      }
    }
  };

  return (
    <div 
      className={`min-h-screen bg-black text-green-400 p-6 ${vt323.className}`}
      onClick={() => document.getElementById('terminal-input')?.focus()}
    >
      <div className='max-w-4xl mx-auto'>
        {/* Terminal header */}
        <div className='border border-green-400/30 rounded-t-lg p-2 bg-green-400/5'>
          <div className='flex items-center space-x-2'>
            <div className='w-3 h-3 rounded-full bg-red-500'></div>
            <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
            <div className='w-3 h-3 rounded-full bg-green-500'></div>
            <span className='ml-4 text-sm text-green-400/70'>terminal — emergent-labs</span>
          </div>
        </div>
        
        {/* Terminal content */}
        <div className='border-l border-r border-b border-green-400/30 rounded-b-lg p-4 bg-black min-h-[70vh] font-mono text-sm'>
          {/* Previous lines */}
          {lines.map((line) => (
            <div key={line.id} className={`${line.isCommand ? 'text-green-300' : 'text-green-400'} whitespace-pre-wrap`}>
              {line.text}
            </div>
          ))}
          
          {/* Current input line */}
          <div className='flex items-center text-green-300'>
            <span className='text-green-400'>$ </span>
            <input
              id='terminal-input'
              type='text'
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className='bg-transparent border-none outline-none flex-1 text-green-400 caret-transparent'
              autoFocus
            />
            <span className={`ml-0 ${showCursor ? 'opacity-100' : 'opacity-0'} text-green-400`}>█</span>
          </div>
        </div>
      </div>
    </div>
  );
}
