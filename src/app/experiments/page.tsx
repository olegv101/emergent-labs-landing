'use client';

import type { FC } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { AsciiRenderer } from '@react-three/drei';
import * as THREE from 'three';
import { useRef, useMemo } from 'react';

// Noise shader material
const noiseVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const noiseFragmentShader = `
  uniform float time;
  uniform float lightness;
  varying vec2 vUv;
  
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }
  
  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  
  void main() {
    vec2 st = vUv * 5.0;
    float n = noise(st + time * 0.5);
    
    float brightness = lightness + n * 0.3;
    gl_FragColor = vec4(vec3(brightness), 1.0);
  }
`;

interface AnimatedPlaneProps {
  position: [number, number, number];
  rotation: [number, number, number];
  lightness: number;
}

const AnimatedPlane: FC<AnimatedPlaneProps> = ({ position, rotation, lightness }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      lightness: { value: lightness }
    }),
    [lightness]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <planeGeometry args={[3, 3, 16, 16]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={noiseVertexShader}
        fragmentShader={noiseFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

const Scene: FC = () => {
  // Create 5 planes with varying positions, rotations, and lightness
  const planes = [
    { position: [-2, 0, -1] as [number, number, number], rotation: [0.1, 0.2, 0.1] as [number, number, number], lightness: 0.2 },
    { position: [2, 1, -2] as [number, number, number], rotation: [-0.1, 0.1, -0.2] as [number, number, number], lightness: 0.35 },
    { position: [0, -1, -2.5] as [number, number, number], rotation: [0.2, -0.1, 0.15] as [number, number, number], lightness: 0.5 },
    { position: [-1.5, 1.5, -3] as [number, number, number], rotation: [-0.15, -0.2, 0.1] as [number, number, number], lightness: 0.65 },
    { position: [1.5, -0.5, -3.5] as [number, number, number], rotation: [0.1, 0.15, -0.1] as [number, number, number], lightness: 0.8 }
  ];

  return (
    <>
      {planes.map((plane, index) => (
        <AnimatedPlane
          key={index}
          position={plane.position}
          rotation={plane.rotation}
          lightness={plane.lightness}
        />
      ))}
    </>
  );
};

const ExperimentsPage: FC = () => {
  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* 3D ASCII Background Window */}
      <div style={{ 
        position: 'absolute', 
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px', // Adjust width as needed 100vw
        height: '400px', // Adjust height as needed ie 100vh
        overflow: 'hidden',
        zIndex: 0,
      }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <Scene />
          <AsciiRenderer 
            fgColor='#808080' 
            bgColor='transparent' 
            characters=' .:-+*=%@#' 
            invert={false}
            resolution={0.12}
          />
        </Canvas>
      </div>

      {/* Original SVG content */}
      <div style={{ 
        position: 'relative', 
        zIndex: 10, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <svg width='61' height='73' viewBox='0 0 61 73' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path 
            className='animate-draw-path'
            d='M33.199 29.2273C32.8631 29.2273 31.3463 29.2273 29.1424 28.9754C28.2519 28.8736 27.9463 28.2195 27.7733 27.708C26.8788 25.0641 31.4888 21.2668 33.7003 20.1522C35.5342 19.2278 37.7697 21.4195 39.7241 22.267C40.7672 22.7192 40.8337 24.8043 40.6658 26.8376C40.5462 28.2845 39.4798 29.2222 38.7189 30.0697C37.147 31.8203 29.1882 31.7722 24.6379 30.6754C22.2767 30.1062 22.1745 26.6926 21.495 24.6541C20.8155 22.6156 20.1385 20.5848 18.9526 18.5463C17.6195 16.2549 14.5499 14.813 12.2544 14.0444C11.0498 13.6411 9.623 14.2938 8.35309 15.0547C5.98208 16.4754 5.04217 19.0375 3.76717 21.4984C1.99546 24.9181 3.50504 31.08 6.1263 35.4878C7.2652 37.4029 8.76282 38.2159 10.3661 38.8929C13.0012 40.0054 16.8912 39.9159 20.1131 39.664C21.3417 39.5679 21.6553 38.9081 21.8284 37.3888C22.6941 29.788 22.5104 26.6926 22.9329 22.2161C23.6045 15.0986 23.1873 9.89112 23.6098 8.8757C24.7488 6.13787 28.099 4.46029 32.0767 3.44233C37.9244 1.94579 41.1595 4.62316 43.7934 5.89307C46.2832 7.09347 46.7684 10.5477 47.4479 12.9323C47.5957 13.4508 47.7864 13.9477 47.705 14.4592C47.5324 15.5434 45.5978 16.3297 43.3863 17.4317C41.4848 18.3791 38.3092 18.7016 36.3394 19.4701C34.202 20.3041 43.0122 21.0734 46.8448 22.6055C49.599 23.7064 51.8481 25.6543 54.566 29.0441C56.7615 31.7822 57.793 33.798 57.8871 37.3583C57.9476 39.6437 53.5684 39.2339 44.3482 39.239C40.6942 39.241 38.472 36.8722 36.2605 35.5947C34.9679 34.8479 34.2221 33.4722 33.7105 33.1312C32.3195 32.2039 35.9068 36.3429 37.1818 38.3813C37.7655 39.3146 37.7798 41.9315 37.5279 45.1533C37.303 48.0286 34.2271 49.2404 32.1887 50.177C30.0819 51.1449 27.2796 51.6225 24.3962 51.3705C19.0969 50.9075 23.3553 37.3812 24.0348 35.3427C24.2053 34.8312 24.3733 34.3273 24.2918 34.3197C22.5175 34.1533 22.3475 37.8698 21.411 39.9083C20.4431 42.015 19.2936 43.9776 18.0186 46.4385C16.9795 48.4442 16.9116 54.9614 17.418 59.2496C17.7029 61.6617 20.1284 63.8278 21.9098 65.8663C23.5353 67.7264 25.5541 68.7548 28.4375 69.3503C30.6176 69.8005 35.0313 69.9458 38.2812 69.3554C39.2966 68.765 40.3196 68.2509 41.2511 67.7445C41.6786 67.406 42.0146 66.9021 43.3786 65.365' 
            stroke='#2D2D2D' 
            strokeWidth='6' 
            strokeLinecap='round'
          />
        </svg>
      </div>
    </main>
  );
};

export default ExperimentsPage;