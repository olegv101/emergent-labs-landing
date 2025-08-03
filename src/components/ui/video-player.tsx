'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Video {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
}

interface VideoPlayerProps {
  videos: Video[];
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videos, className }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const currentVideo = videos[currentVideoIndex];

  // Generate static noise
  const generateNoise = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const value = Math.random() * 255;
      data[i] = value;     // red
      data[i + 1] = value; // green
      data[i + 2] = value; // blue
      data[i + 3] = 255;   // alpha
    }

    ctx.putImageData(imageData, 0, 0);
  };

  // Animate static noise
  useEffect(() => {
    if (!isPlaying && canvasRef.current) {
      const animate = () => {
        generateNoise();
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  // YouTube Player API
  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Initialize player when API is ready
    (window as any).onYouTubeIframeAPIReady = () => {
      if (iframeRef.current) {
        playerRef.current = new (window as any).YT.Player(iframeRef.current, {
          videoId: currentVideo.youtubeId,
          playerVars: {
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            cc_load_policy: 0,
            fs: 0,
            disablekb: 1,
          },
          events: {
            onReady: () => {
              setIsLoading(false);
            },
            onStateChange: (event: any) => {
              if (event.data === (window as any).YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (event.data === (window as any).YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              }
            },
          },
        });
      }
    };

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [currentVideo.youtubeId]);

  const togglePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  };

  const nextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      setIsPlaying(false);
      setIsLoading(true);
    }
  };

  const previousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
      setIsPlaying(false);
      setIsLoading(true);
    }
  };

  const fastForward = () => {
    if (playerRef.current && playerRef.current.getCurrentTime) {
      const currentTime = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(currentTime + 10, true);
    }
  };

  const rewind = () => {
    if (playerRef.current && playerRef.current.getCurrentTime) {
      const currentTime = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(Math.max(currentTime - 10, 0), true);
    }
  };

  return (
    <div className={cn('h-full', className)}>
      {/* Video Container */}
      <div 
        className='relative aspect-video bg-black rounded-lg overflow-hidden group cursor-pointer'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* YouTube Player */}
        <iframe
          ref={iframeRef}
          className={cn(
            'absolute inset-0 w-full h-full',
            !isPlaying && 'opacity-0'
          )}
          src={`https://www.youtube.com/embed/${currentVideo.youtubeId}?enablejsapi=1`}
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        />
        
        {/* Static Noise Overlay */}
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className={cn(
            'absolute inset-0 w-full h-full',
            isPlaying && 'opacity-0',
            'transition-opacity duration-300'
          )}
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Hover Overlay - Dark Tint */}
        <div 
          className={cn(
            'absolute inset-0 bg-black/30 transition-opacity duration-300',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* Description Overlay - Top */}
        <div 
          className={cn(
            'absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent transition-all duration-300',
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          )}
        >
          <h3 className='text-white font-semibold text-lg mb-1'>
            {currentVideo.title}
          </h3>
          <p className='text-gray-200 text-sm'>
            {currentVideo.description}
          </p>
        </div>

        {/* Controls Overlay - Center */}
        <div 
          className={cn(
            'absolute inset-0 flex items-center justify-center transition-all duration-300',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div className='flex items-center gap-6'>
            {/* Previous Video */}
            <button
              onClick={previousVideo}
              disabled={currentVideoIndex === 0}
              className={cn(
                'w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all',
                'hover:bg-black/70 hover:scale-110',
                currentVideoIndex === 0 
                  ? 'opacity-30 cursor-not-allowed' 
                  : 'text-white hover:text-green-400'
              )}
            >
              <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M8.445 14.832A1 1 0 0010 14v-8a1 1 0 00-1.555-.832L3 9.168a1 1 0 000 1.664l5.445 4z' />
                <rect x='11' y='5' width='2' height='10' rx='0.5' />
              </svg>
            </button>

            {/* Rewind */}
            <button
              onClick={rewind}
              className='w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 hover:scale-110 hover:text-green-400 transition-all'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z' />
              </svg>
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlayPause}
              className='w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-lg'
            >
              {isPlaying ? (
                <svg className='w-8 h-8 text-black' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z' clipRule='evenodd' />
                </svg>
              ) : (
                <svg className='w-8 h-8 text-black ml-1' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z' clipRule='evenodd' />
                </svg>
              )}
            </button>

            {/* Fast Forward */}
            <button
              onClick={fastForward}
              className='w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 hover:scale-110 hover:text-green-400 transition-all'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z' />
              </svg>
            </button>

            {/* Next Video */}
            <button
              onClick={nextVideo}
              disabled={currentVideoIndex === videos.length - 1}
              className={cn(
                'w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all',
                'hover:bg-black/70 hover:scale-110',
                currentVideoIndex === videos.length - 1 
                  ? 'opacity-30 cursor-not-allowed' 
                  : 'text-white hover:text-green-400'
              )}
            >
              <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 10.832a1 1 0 000-1.664L4.555 5.168z' />
                <rect x='13' y='5' width='2' height='10' rx='0.5' />
              </svg>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className='absolute inset-0 flex items-center justify-center bg-black'>
            <div className='text-green-400 font-mono text-sm animate-pulse'>
              LOADING...
            </div>
          </div>
        )}

        {/* Video Counter - Bottom Right */}
        <div 
          className={cn(
            'absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm font-mono transition-all duration-300',
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          )}
        >
          {currentVideoIndex + 1} / {videos.length}
        </div>
      </div>
    </div>
  );
};