'use client';

import { VT323 } from 'next/font/google';
import { useState, useEffect } from 'react';

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
});

type LoadingStep = {
  id: number;
  text: string;
  delay: number;
  status?: 'loading' | 'success' | 'error';
};

type TerminalLoaderProps = {
  onComplete: () => void;
};

const loadingSteps: LoadingStep[] = [
  { id: 1, text: 'Emergent Labs System v2.0.1', delay: 500 },
  { id: 2, text: 'Initializing quantum processors...', delay: 800, status: 'loading' },
  { id: 3, text: 'Loading neural networks...', delay: 600, status: 'loading' },
  { id: 4, text: 'Calibrating emergence algorithms...', delay: 700, status: 'loading' },
  { id: 5, text: 'Connecting to distributed consciousness...', delay: 900, status: 'loading' },
  { id: 6, text: 'Synchronizing reality matrices...', delay: 600, status: 'loading' },
  { id: 7, text: 'System ready. Welcome to the future.', delay: 500, status: 'success' },
];

export function TerminalLoader({ onComplete }: TerminalLoaderProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showCursor, setShowCursor] = useState<boolean>(true);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  // Loading sequence
  useEffect(() => {
    if (currentStep >= loadingSteps.length) {
      setIsComplete(true);
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(completeTimer);
    }

    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, loadingSteps[currentStep]?.delay || 500);

    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  const getStatusSymbol = (status?: string): string => {
    switch (status) {
      case 'loading':
        return '[...]';
      case 'success':
        return '[OK]';
      case 'error':
        return '[ERR]';
      default:
        return '';
    }
  };

  const getStatusColor = (status?: string): string => {
    switch (status) {
      case 'loading':
        return 'text-yellow-400';
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-green-400';
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-black text-green-400 flex items-center justify-center ${vt323.className} transition-opacity duration-1000 ${isComplete ? 'opacity-0' : 'opacity-100'}`}
      style={{ zIndex: 9999 }}
    >
      <div className='max-w-2xl w-full px-6'>
        {/* Terminal header */}
        <div className='border border-green-400/30 rounded-t-lg p-3 bg-green-400/5'>
          <div className='flex items-center space-x-2'>
            <div className='w-3 h-3 rounded-full bg-red-500'></div>
            <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
            <div className='w-3 h-3 rounded-full bg-green-500'></div>
            <span className='ml-4 text-sm text-green-400/70'>boot — emergent-labs</span>
          </div>
        </div>
        
        {/* Terminal content */}
        <div className='border-l border-r border-b border-green-400/30 rounded-b-lg p-6 bg-black min-h-[400px] font-mono text-lg'>
          {/* Loading steps */}
          {loadingSteps.slice(0, currentStep).map((step, index) => (
            <div key={step.id} className={`mb-2 flex items-center ${getStatusColor(step.status)}`}>
              {step.status && (
                <span className={`mr-3 ${getStatusColor(step.status)}`}>
                  {getStatusSymbol(step.status)}
                </span>
              )}
              <span>{step.text}</span>
            </div>
          ))}
          
          {/* Current loading line with cursor */}
          {currentStep < loadingSteps.length && (
            <div className='flex items-center text-green-400'>
              <span className='mr-3 text-yellow-400'>[...]</span>
              <span>{loadingSteps[currentStep]?.text}</span>
              <span className={`ml-2 ${showCursor ? 'opacity-100' : 'opacity-0'}`}>█</span>
            </div>
          )}
          
          {/* Completion message */}
          {isComplete && (
            <div className='mt-6 text-center'>
              <div className='text-green-400 text-xl mb-2'>▲ SYSTEM ONLINE ▲</div>
              <div className='text-green-400/70'>Launching interface...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 