'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TerminalAppProps {
  className?: string;
}

interface CommandHistory {
  command: string;
  output: string;
}

export const TerminalApp: React.FC<TerminalAppProps> = ({ className }) => {
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<CommandHistory[]>([
    {
      command: '',
      output: 'Last login: ' + new Date().toLocaleString() + ' on ttys001'
    }
  ]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const commands: Record<string, () => string> = {
    help: () => 'Available commands: help, clear, date, whoami, pwd, ls, echo [text]',
    clear: () => {
      setCommandHistory([]);
      return '';
    },
    date: () => new Date().toString(),
    whoami: () => 'emergent-user',
    pwd: () => '/Users/emergent-user/Desktop',
    ls: () => 'Applications\nDesktop\nDocuments\nDownloads\nLibrary\nMovies\nMusic\nPictures',
  };

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    const [command, ...args] = trimmedCmd.split(' ');
    
    let output = '';
    
    if (command === 'echo') {
      output = args.join(' ');
    } else if (command in commands) {
      output = commands[command]();
      if (command === 'clear') {
        return;
      }
    } else if (trimmedCmd === '') {
      output = '';
    } else {
      output = `zsh: command not found: ${command}`;
    }

    setCommandHistory(prev => [...prev, { command: trimmedCmd, output }]);
    setCurrentCommand('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(currentCommand);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const commands = commandHistory.filter(h => h.command).map(h => h.command);
      if (commands.length > 0 && historyIndex < commands.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commands[commands.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const commands = commandHistory.filter(h => h.command).map(h => h.command);
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commands[commands.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand('');
      }
    }
  };

  useEffect(() => {
    terminalRef.current?.scrollTo(0, terminalRef.current.scrollHeight);
  }, [commandHistory]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      ref={terminalRef}
      className={cn(
        'h-full bg-black text-green-400 font-mono text-sm p-4 overflow-auto',
        className
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {commandHistory.map((entry, index) => (
        <div key={index} className='mb-2'>
          {entry.command && (
            <div className='flex items-start'>
              <span className='text-blue-400 mr-2'>emergent-user@MacBook</span>
              <span className='text-gray-400 mr-2'>~$</span>
              <span>{entry.command}</span>
            </div>
          )}
          {entry.output && (
            <div className='whitespace-pre-wrap'>{entry.output}</div>
          )}
        </div>
      ))}
      
      <div className='flex items-start'>
        <span className='text-blue-400 mr-2'>emergent-user@MacBook</span>
        <span className='text-gray-400 mr-2'>~$</span>
        <input
          ref={inputRef}
          type='text'
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          className='flex-1 bg-transparent outline-none text-green-400'
          spellCheck={false}
          autoComplete='off'
        />
      </div>
    </div>
  );
};