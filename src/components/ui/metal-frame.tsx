'use client';

import React from 'react';

interface MetalFrameProps {
  className?: string;
  horizontalThickness?: string;
  verticalThickness?: string;
  thickness?: string; // Fallback for uniform thickness
}

export const MetalFrame: React.FC<MetalFrameProps> = ({ 
  className = '', 
  horizontalThickness,
  verticalThickness,
  thickness = '2.5vw'
}) => {
  const frameStyles = {
    '--frame-thickness-horizontal': horizontalThickness || thickness,
    '--frame-thickness-vertical': verticalThickness || thickness,
  } as React.CSSProperties;

  return (
    <div 
      className={`metal-frame-container ${className}`}
      style={frameStyles}
    >
      {/* Top Frame */}
      <div className='metal-frame metal-frame-top' />
      
      {/* Right Frame */}
      <div className='metal-frame metal-frame-right' />
      
      {/* Bottom Frame */}
      <div className='metal-frame metal-frame-bottom' />
      
      {/* Left Frame */}
      <div className='metal-frame metal-frame-left' />
    </div>
  );
}; 