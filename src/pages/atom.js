import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import { Sphere, OrbitControls, Line, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';

extend({ OrbitControls });

// Component for the nucleus
const Nucleus = () => {
  return (
    <group>
      <Sphere args={[2, 32, 32]}>
        <meshStandardMaterial color="#FFD700" emissive="#fccb06" emissiveIntensity={0.5}  />
      </Sphere>
      <Html position={[0, 3, 1]}>
        <div style={{ color: 'white', fontSize: '1em' }}>Nucleus</div>
      </Html>
    </group>
  );
};

// Component for electrons
const Electron = ({ position, speed, color, plane, label }) => {
  const ref = useRef();
  const labelRef = useRef();
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    ref.current.position.x = position * Math.cos(time * speed);
    ref.current.position.z = position * Math.sin(time * speed);
    if (plane === 'xy') {
      ref.current.position.y = position * Math.sin(time * speed);
    } else if (plane === 'xy2') {
      ref.current.position.y = -position * Math.sin(time * speed);
    }
    labelRef.current.position.copy(ref.current.position);
  });

  const points = useMemo(() => {
    let points = [];
    for (let i = 0; i <= 100; i++) {
      const t = (i / 100) * Math.PI * 2;
      points.push(new THREE.Vector3(position * Math.cos(t), plane === 'xy' ? position * Math.sin(t) : plane === 'xy2' ? -position * Math.sin(t) : 0, position * Math.sin(t)));
    }
    return points;
  }, [position, plane]);

  return (
    <group>
      <Sphere ref={ref} args={[0.4, 32, 32]} position={[position, 0, 0]}>
        <meshStandardMaterial color={color} emissive={color} roughness={0.1} metalness={2} />
      </Sphere>
      <Line points={points} color="white" lineWidth={1.5} />
      <group ref={labelRef}>
        <Html>
          <div style={{ color: 'white', fontSize: '1em' }}>{label}</div>
        </Html>
      </group>
    </group>
  );
};

// Controls component
const Controls = () => {
    const { camera, gl } = useThree();
    camera.position.x = 18.5;
    camera.position.y = 1.5;
    camera.position.z = -0.01;
    camera.lookAt(0, 0, 0);
    const controls = useRef();
    useFrame((state) => {
      controls.current.update();
    });
    return <OrbitControls ref={controls} args={[camera, gl.domElement]} maxDistance={50} />;
  };

// Main component
const Atom = () => {
  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
    <h1 style={{ color: 'white', textAlign: 'center', position: 'absolute', top: '10px', width: '100%', zIndex: 1, fontFamily: 'math'  }}>Carbon Atom</h1>
    <Canvas style={{ background: 'black', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <ambientLight  />
      <pointLight position={[10, 10, 10]} />
      <Stars />
      <Nucleus />
      <Electron position={4} speed={1} color="#00F" plane="xz" label="Electron 1" />
      <Electron position={4} speed={2} color="#00F" plane="xz" label="Electron 2" />
      <Electron position={6} speed={1} color="#F00" plane="xz" label="Electron 3" />
      <Electron position={6} speed={4} color="#F00" plane="xy2" label="Electron 4" />
      <Electron position={6} speed={3} color="#0F0" plane="xz" label="Electron 5" />
      <Electron position={6} speed={4} color="#0F0" plane="xy" label="Electron 6" />
      <Controls />
    </Canvas>
  </div>
  
  );
};

export default Atom;
