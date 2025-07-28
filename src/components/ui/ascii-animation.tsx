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
    // SPEED CONTROL: Lower values = slower movement (was 0.5, now 0.15 for much slower movement)
    float n = noise(st + time * 0.15);
    
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

  // SPEED CONTROL: This updates the time uniform every frame - the time value itself drives the animation speed
  useFrame((state) => {
    if (materialRef.current) {
      // TIME SOURCE: state.clock.getElapsedTime() provides the base time - could multiply by a factor here for global speed control
      materialRef.current.uniforms.time.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <planeGeometry args={[6, 6, 16, 16]} /> {/* 3, 3, 16, 16 */}
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

interface AsciiAnimationProps {
  width?: string;
  height?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const AsciiAnimation: FC<AsciiAnimationProps> = ({ 
  width = '100vw', 
  height = '100vh', 
  className = '',
  style = {}
}) => {
  return (
    <div 
      className={className}
      style={{ 
        width,
        height,
        overflow: 'hidden',
        ...style
      }}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <Scene />
        <AsciiRenderer 
          fgColor='#808080' 
          bgColor='transparent' 
          characters=' .:-+*=%@\|`^' 
          invert={false}
          resolution={0.16}
        />
      </Canvas>
    </div>
  );
}; 