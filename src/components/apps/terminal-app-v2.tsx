'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTerminalState } from '@/lib/use-app-state';

interface TerminalAppProps {
  className?: string;
}

export const TerminalApp: React.FC<TerminalAppProps> = ({ className }) => {
  const { commands, currentDirectory, executeCommand } = useTerminalState();
  const [inputValue, setInputValue] = React.useState('');
  const [historyIndex, setHistoryIndex] = React.useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Auto-scroll to bottom when new commands are added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commands]);
  
  const handleCommand = (command: string) => {
    if (command.trim()) {
      // Simulate command execution
      let output = '';
      
      if (command === 'ls') {
        output = 'agent-controller.ts  app-state-store.ts  utils.ts  README.md';
      } else if (command === 'pwd') {
        output = currentDirectory;
      } else if (command.startsWith('cd ')) {
        const dir = command.substring(3);
        output = ''; // cd doesn't output anything
      } else if (command === 'clear') {
        // Clear is handled separately
        return;
      } else if (command === 'python analyze_data.py') {
        output = `Analyzing data...
Processing 1000 records...
Analysis complete:
- Average performance: 87.3%
- Peak efficiency: 95.2%
- Optimization potential: 12.7%`;
      } else if (command.startsWith('echo ')) {
        output = command.substring(5);
      } else if (command === 'help') {
        output = `Available commands:
  ls     - List directory contents
  pwd    - Print working directory
  cd     - Change directory
  echo   - Display text
  clear  - Clear terminal
  python - Run Python scripts
  help   - Show this help message`;
      } else {
        output = `${command}: command not found`;
      }
      
      executeCommand(command, output);
      setInputValue('');
      setHistoryIndex(-1);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(inputValue);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commands.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInputValue(commands[commands.length - 1 - newIndex].command);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInputValue(commands[commands.length - 1 - newIndex].command);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputValue('');
      }
    }
  };
  
  return (
    <div 
      className={cn('h-full bg-black text-green-400 font-mono text-sm p-4 overflow-hidden flex flex-col', className)}
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={terminalRef} className='flex-1 overflow-y-auto'>
        {/* Terminal header */}
        <div className='mb-4'>
          <div className='text-green-500'>Emergent Labs Terminal v1.0.0</div>
          <div className='text-green-500'>Type &apos;help&apos; for available commands</div>
          <div className='text-green-500'>{'─'.repeat(50)}</div>
        </div>
        
        {/* Command history */}
        {commands.map((cmd, index) => (
          <div key={cmd.id} className='mb-2'>
            <div className='flex items-start'>
              <span className='text-green-500 mr-2'>$</span>
              <span className='flex-1'>{cmd.command}</span>
            </div>
            {cmd.output && (
              <div className='mt-1 ml-4 text-green-300 whitespace-pre-wrap'>
                {cmd.output}
              </div>
            )}
          </div>
        ))}
        
        {/* Current input line */}
        <div className='flex items-start'>
          <span className='text-green-500 mr-2'>$</span>
          <input
            ref={inputRef}
            type='text'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className='flex-1 bg-transparent border-none outline-none text-green-400'
            autoFocus
            spellCheck={false}
          />
        </div>
      </div>
      
      {/* Status bar */}
      <div className='mt-2 pt-2 border-t border-green-800 text-green-600 text-xs flex justify-between'>
        <span>{currentDirectory}</span>
        <span>{new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
};