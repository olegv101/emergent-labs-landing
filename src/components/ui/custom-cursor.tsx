'use client';

import React from 'react';

interface CustomCursorProps {
  color: string;
  size?: number;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ color, size = 26 }) => {
  const scale = size / 26; // Scale based on original width of 26
  const height = Math.round(31 * scale);

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={height}
      fill='none'
      viewBox='0 0 26 31'
      className='drop-shadow-md'
    >
      <g clipPath='url(#a)'>
        <path
          fill={color}
          fillRule='evenodd'
          stroke='#fff'
          strokeLinecap='square'
          strokeWidth={2}
          d='M21.993 14.425 2.549 2.935l4.444 23.108 4.653-10.002z'
          clipRule='evenodd'
        />
      </g>
      <defs>
        <clipPath id='a'>
          <path fill={color} d='M0 0h26v31H0z' />
        </clipPath>
      </defs>
    </svg>
  );
};