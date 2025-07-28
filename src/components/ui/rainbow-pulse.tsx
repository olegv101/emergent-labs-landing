'use client';

import { useEffect, useState } from 'react';

interface RainbowPulseProps {
  interval?: number; // Time between pulses in milliseconds
  duration?: number; // Duration of each pulse animation
}

export function RainbowPulse({ 
  interval = 8000, 
  duration = 3000 
}: RainbowPulseProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Start first animation after a short delay
    const initialTimeout = setTimeout(() => {
      setIsAnimating(true);
    }, 1000);

    // Set up interval for subsequent animations
    const animationInterval = setInterval(() => {
      setIsAnimating(true);
      
      // Reset animation after duration with extra time for gentle exit
      setTimeout(() => {
        setIsAnimating(false);
      }, duration);
    }, interval);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(animationInterval);
    };
  }, [interval, duration]);

  const exitDuration = duration * 1.5; // Make exit 50% longer than entrance

  return (
    <div className='pointer-events-none fixed inset-0 overflow-hidden z-[1000]'>
      {/* Bottom edge pulse */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-[40vh] transition-all ${
          isAnimating ? 'ease-out' : 'ease-in-out'
        } ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: `linear-gradient(to top, 
            rgba(255, 87, 87, 0.3) 0%,
            rgba(255, 189, 87, 0.25) 20%,
            rgba(255, 255, 87, 0.2) 40%,
            rgba(87, 255, 87, 0.15) 60%,
            rgba(87, 189, 255, 0.1) 80%,
            rgba(189, 87, 255, 0.05) 90%,
            transparent 100%
          )`,
          transform: isAnimating ? 'translateY(0)' : 'translateY(100%)',
          transitionDuration: isAnimating ? `${duration}ms` : `${exitDuration}ms`,
          filter: 'blur(20px)',
        }}
      />

      {/* Left edge pulse */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-[30vw] transition-all ${
          isAnimating ? 'ease-out' : 'ease-in-out'
        } ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: `linear-gradient(to right,
            rgba(255, 87, 255, 0.2) 0%,
            rgba(87, 87, 255, 0.15) 30%,
            rgba(87, 255, 255, 0.1) 60%,
            transparent 100%
          )`,
          transform: isAnimating ? 'translateX(0)' : 'translateX(-100%)',
          transitionDuration: isAnimating ? `${duration}ms` : `${exitDuration}ms`,
          transitionDelay: isAnimating ? '200ms' : '0ms',
          filter: 'blur(30px)',
        }}
      />

      {/* Right edge pulse */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-[30vw] transition-all ${
          isAnimating ? 'ease-out' : 'ease-in-out'
        } ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: `linear-gradient(to left,
            rgba(255, 189, 87, 0.2) 0%,
            rgba(255, 87, 189, 0.15) 30%,
            rgba(189, 87, 255, 0.1) 60%,
            transparent 100%
          )`,
          transform: isAnimating ? 'translateX(0)' : 'translateX(100%)',
          transitionDuration: isAnimating ? `${duration}ms` : `${exitDuration}ms`,
          transitionDelay: isAnimating ? '200ms' : '0ms',
          filter: 'blur(30px)',
        }}
      />

      {/* Top edge subtle glow */}
      <div
        className={`absolute top-0 left-0 right-0 h-[20vh] transition-all ${
          isAnimating ? 'ease-out' : 'ease-in-out'
        } ${isAnimating ? 'opacity-60' : 'opacity-0'}`}
        style={{
          background: `linear-gradient(to bottom,
            rgba(189, 87, 255, 0.1) 0%,
            rgba(87, 189, 255, 0.05) 50%,
            transparent 100%
          )`,
          transform: isAnimating ? 'translateY(0)' : 'translateY(-100%)',
          transitionDuration: isAnimating ? `${duration}ms` : `${exitDuration}ms`,
          transitionDelay: isAnimating ? '400ms' : '200ms',
          filter: 'blur(40px)',
        }}
      />

      {/* Corner accents */}
      <div
        className={`absolute bottom-0 left-0 w-[40vw] h-[40vh] transition-all ${
          isAnimating ? 'ease-out' : 'ease-in-out'
        } ${isAnimating ? 'opacity-70' : 'opacity-0'}`}
        style={{
          background: `radial-gradient(ellipse at bottom left,
            rgba(255, 87, 87, 0.3) 0%,
            rgba(255, 189, 87, 0.2) 30%,
            transparent 70%
          )`,
          transitionDuration: isAnimating ? `${duration}ms` : `${exitDuration}ms`,
          transitionDelay: isAnimating ? '100ms' : '100ms',
          filter: 'blur(25px)',
        }}
      />

      <div
        className={`absolute bottom-0 right-0 w-[40vw] h-[40vh] transition-all ${
          isAnimating ? 'ease-out' : 'ease-in-out'
        } ${isAnimating ? 'opacity-70' : 'opacity-0'}`}
        style={{
          background: `radial-gradient(ellipse at bottom right,
            rgba(87, 189, 255, 0.3) 0%,
            rgba(189, 87, 255, 0.2) 30%,
            transparent 70%
          )`,
          transitionDuration: isAnimating ? `${duration}ms` : `${exitDuration}ms`,
          transitionDelay: isAnimating ? '100ms' : '100ms',
          filter: 'blur(25px)',
        }}
      />
    </div>
  );
} 