'use client';

import { VT323 } from 'next/font/google';
import Image from 'next/image';
import { useState } from 'react';
import { ProgressiveBlur } from '@/components/ui/progressive-blur';
// import { TerminalLoader } from '@/components/ui/terminal-loader';
import { SvgLoader } from '@/components/ui/svg-loader';
import { AsciiAnimation } from '@/components/ui/ascii-animation';

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
});

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleLoadingComplete = (): void => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <SvgLoader onComplete={handleLoadingComplete} />;
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-[#E0E0E0] flex-col space-y-6 opacity-0 animate-fade-in relative'>
      {/* ASCII Animation Background */}
      <div 
        style={{ 
          position: 'absolute', 
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
        }}
      >
        <AsciiAnimation 
          width='100vw' 
          height='100vh'
          style={{ opacity: 0.3 }}
        />
      </div>

      {/* Main Content */}
      <div className='relative z-10'>
        <div className='flex flex-col items-center justify-center group'>
          <h1
            className={`relative flex flex-col uppercase text-4xl font-bold text-[#2D2D2D] ${vt323.className}`}
          >

            <span className='text-start'>
              Emergent
            </span>

            <div className='relative my-4 overflow-hidden rounded-[4px] group-hover:scale-105 transition-all duration-300'>
              
              <Image
                src='/background-emergent-labs.png'
                alt='bg'
                width={250}
                height={250}
              />
              <ProgressiveBlur
                className='pointer-events-none absolute bottom-0 left-0 h-[60%] w-full'
                blurIntensity={2}
              />
              <div className='absolute bottom-3 left-3'>
                <div className='flex flex-col items-center justify-center max-w-[200px]'>
                  <h2 className='text-xs font-mono font-normal text-white text-start md:opacity-70 opacity-100 group-hover:opacity-100 transition-all duration-300'>
                    working on making work colourful.
                  </h2>
                </div>
              </div>
            </div>

            <span className='text-end'>Labs</span>
          </h1>
        </div>
      </div>
      {/* <div className="flex flex-col items-center justify-center max-w-[200px]">
        <h2 className="text-sm font-normal text-[#2D2D2D] text-center">
          working on making work colourful.
        </h2>
      </div>
      <div className="flex flex-col items-center justify-center ">
        <h2 className="uppercase text-sm font-normal text-[#2D2D2D] text-center">
          tryconnectus.com
        </h2>
      </div> */}
      {/* <div>
        <Image
          src="/background-emergent-labs.png"
          alt="bg"
          width={100}
          height={100}
        />
      </div> */}
    </div>
  );
}
