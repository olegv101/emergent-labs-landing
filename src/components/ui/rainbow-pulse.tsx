'use client';

import { useEffect, useState, useRef } from 'react';

interface RainbowPulseProps {
  maxRadius?: number; // Maximum radius from center where effect is visible (in pixels)
  minRadius?: number; // Radius where effect reaches maximum intensity
}

export function RainbowPulse({ 
  maxRadius = 400, 
  minRadius = 100 
}: RainbowPulseProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [intensity, setIntensity] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    // Set initial window size
    setWindowSize({ 
      width: window.innerWidth, 
      height: window.innerHeight 
    });

    // Handle window resize
    const handleResize = () => {
      setWindowSize({ 
        width: window.innerWidth, 
        height: window.innerHeight 
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Cancel any pending animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Use requestAnimationFrame for smooth performance
      animationFrameRef.current = requestAnimationFrame(() => {
        const centerX = windowSize.width / 2;
        const centerY = windowSize.height / 2;
        
        // Calculate distance from center
        const distance = Math.sqrt(
          Math.pow(e.clientX - centerX, 2) + 
          Math.pow(e.clientY - centerY, 2)
        );

        // Calculate intensity based on distance
        let newIntensity = 0;
        if (distance <= maxRadius) {
          if (distance <= minRadius) {
            newIntensity = 1; // Maximum intensity
          } else {
            // Linear interpolation between minRadius and maxRadius
            newIntensity = 1 - ((distance - minRadius) / (maxRadius - minRadius));
          }
        }

        setMousePosition({ x: e.clientX, y: e.clientY });
        setIntensity(newIntensity);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [windowSize, maxRadius, minRadius]);

  // Calculate opacity multipliers for each edge based on cursor position
  const getEdgeIntensity = (edge: 'top' | 'right' | 'bottom' | 'left') => {
    if (intensity === 0) return 0;

    const centerX = windowSize.width / 2;
    const centerY = windowSize.height / 2;
    const relativeX = (mousePosition.x - centerX) / centerX;
    const relativeY = (mousePosition.y - centerY) / centerY;

    // Add directional bias based on cursor position
    switch (edge) {
      case 'bottom':
        return intensity * (1 + Math.max(0, relativeY) * 0.5);
      case 'top':
        return intensity * (1 - Math.max(0, relativeY) * 0.5);
      case 'left':
        return intensity * (1 - Math.max(0, relativeX) * 0.5);
      case 'right':
        return intensity * (1 + Math.max(0, relativeX) * 0.5);
      default:
        return intensity;
    }
  };

  return (
    <div className='pointer-events-none fixed inset-0 overflow-hidden z-[1000]'>
      {/* Bottom edge pulse */}
      <div
        className='absolute bottom-0 left-0 right-0 h-[40vh] transition-all duration-300 ease-out'
        style={{
          background: `linear-gradient(to top, 
            rgba(255, 87, 87, ${0.3 * getEdgeIntensity('bottom')}) 0%,
            rgba(255, 189, 87, ${0.25 * getEdgeIntensity('bottom')}) 20%,
            rgba(255, 255, 87, ${0.2 * getEdgeIntensity('bottom')}) 40%,
            rgba(87, 255, 87, ${0.15 * getEdgeIntensity('bottom')}) 60%,
            rgba(87, 189, 255, ${0.1 * getEdgeIntensity('bottom')}) 80%,
            rgba(189, 87, 255, ${0.05 * getEdgeIntensity('bottom')}) 90%,
            transparent 100%
          )`,
          opacity: getEdgeIntensity('bottom'),
          transform: `translateY(${(1 - getEdgeIntensity('bottom')) * 20}%)`,
          filter: `blur(${20 + (1 - intensity) * 20}px)`,
        }}
      />

      {/* Left edge pulse */}
      <div
        className='absolute left-0 top-0 bottom-0 w-[30vw] transition-all duration-300 ease-out'
        style={{
          background: `linear-gradient(to right,
            rgba(255, 87, 255, ${0.2 * getEdgeIntensity('left')}) 0%,
            rgba(87, 87, 255, ${0.15 * getEdgeIntensity('left')}) 30%,
            rgba(87, 255, 255, ${0.1 * getEdgeIntensity('left')}) 60%,
            transparent 100%
          )`,
          opacity: getEdgeIntensity('left'),
          transform: `translateX(${(1 - getEdgeIntensity('left')) * -20}%)`,
          filter: `blur(${30 + (1 - intensity) * 20}px)`,
        }}
      />

      {/* Right edge pulse */}
      <div
        className='absolute right-0 top-0 bottom-0 w-[30vw] transition-all duration-300 ease-out'
        style={{
          background: `linear-gradient(to left,
            rgba(255, 189, 87, ${0.2 * getEdgeIntensity('right')}) 0%,
            rgba(255, 87, 189, ${0.15 * getEdgeIntensity('right')}) 30%,
            rgba(189, 87, 255, ${0.1 * getEdgeIntensity('right')}) 60%,
            transparent 100%
          )`,
          opacity: getEdgeIntensity('right'),
          transform: `translateX(${(1 - getEdgeIntensity('right')) * 20}%)`,
          filter: `blur(${30 + (1 - intensity) * 20}px)`,
        }}
      />

      {/* Top edge subtle glow */}
      <div
        className='absolute top-0 left-0 right-0 h-[20vh] transition-all duration-300 ease-out'
        style={{
          background: `linear-gradient(to bottom,
            rgba(189, 87, 255, ${0.1 * getEdgeIntensity('top')}) 0%,
            rgba(87, 189, 255, ${0.05 * getEdgeIntensity('top')}) 50%,
            transparent 100%
          )`,
          opacity: getEdgeIntensity('top') * 0.6,
          transform: `translateY(${(1 - getEdgeIntensity('top')) * -20}%)`,
          filter: `blur(${40 + (1 - intensity) * 20}px)`,
        }}
      />

      {/* Corner accents - these follow overall intensity */}
      <div
        className='absolute bottom-0 left-0 w-[40vw] h-[40vh] transition-all duration-300 ease-out'
        style={{
          background: `radial-gradient(ellipse at bottom left,
            rgba(255, 87, 87, ${0.3 * intensity}) 0%,
            rgba(255, 189, 87, ${0.2 * intensity}) 30%,
            transparent 70%
          )`,
          opacity: intensity * 0.7,
          filter: `blur(${25 + (1 - intensity) * 15}px)`,
        }}
      />

      <div
        className='absolute bottom-0 right-0 w-[40vw] h-[40vh] transition-all duration-300 ease-out'
        style={{
          background: `radial-gradient(ellipse at bottom right,
            rgba(87, 189, 255, ${0.3 * intensity}) 0%,
            rgba(189, 87, 255, ${0.2 * intensity}) 30%,
            transparent 70%
          )`,
          opacity: intensity * 0.7,
          filter: `blur(${25 + (1 - intensity) * 15}px)`,
        }}
      />

      {/* Center glow effect that appears when cursor is near center */}
      <div
        className='absolute inset-0 transition-all duration-500 ease-out'
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px,
            rgba(255, 255, 255, ${0.05 * intensity}) 0%,
            rgba(255, 189, 87, ${0.03 * intensity}) 20%,
            rgba(87, 189, 255, ${0.02 * intensity}) 40%,
            transparent 60%
          )`,
          opacity: intensity,
          filter: `blur(${60 - intensity * 20}px)`,
        }}
      />
    </div>
  );
} 