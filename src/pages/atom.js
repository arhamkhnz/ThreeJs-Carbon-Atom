import React, { useState, useRef, useMemo } from "react";
import { Canvas, useFrame, extend, useThree } from "@react-three/fiber";
import { Sphere, OrbitControls, Line, Html, Stars } from "@react-three/drei";
import * as THREE from "three";

extend({ OrbitControls });

const Nucleus = ({ isotope = 12 }) => {
  const sphericalToCartesian = (radius, polar, azimuthal) => {
    const x = radius * Math.sin(polar) * Math.cos(azimuthal);
    const y = radius * Math.sin(polar) * Math.sin(azimuthal);
    const z = radius * Math.cos(polar);
    return [x, y, z];
  };

  const getNucleons = () => {
    const nucleons = [];
    const protonColor = "#FFD700";
    const neutronColor = "#C0C0C0";
    const protons = 6;
    let neutrons;

    switch (isotope) {
      case 13:
        neutrons = 7;
        break;
      case 14:
        neutrons = 8;
        break;
      default:
        neutrons = 6; // For Carbon-12
    }

    const totalNucleons = protons + neutrons;

    for (let i = 0; i < totalNucleons; i++) {
      const polar = Math.acos(1 - (2 * (i + 0.5)) / totalNucleons);
      const azimuthal = Math.sqrt(totalNucleons * Math.PI) * polar;
      const position = sphericalToCartesian(1.25, polar, azimuthal);

      if (i < protons) {
        nucleons.push({ color: protonColor, position });
      } else {
        nucleons.push({ color: neutronColor, position });
      }
    }

    return nucleons;
  };

  const nucleons = getNucleons();

  return (
    <group>
      {nucleons.map((nucleon, index) => (
        <>
          <Sphere key={index} args={[0.8, 32, 32]} position={nucleon.position}>
            <meshStandardMaterial
              color={nucleon.color}
              emissive={nucleon.color}
              emissiveIntensity={0.5}
            />
          </Sphere>
          <Sphere
            key={`outline-${index}`}
            args={[0.85, 32, 32]}
            position={nucleon.position}
            visible={true}
          >
            <meshLambertMaterial color="#1A1110" wireframe={true} />
          </Sphere>
        </>
      ))}
      <Html position={[0, 4, 1]}>
        <div style={{ color: "white", fontSize: "1em", whiteSpace: "nowrap" }}>
          Carbon-{isotope}
        </div>
      </Html>
    </group>
  );
};

const SOrbital = ({ position, color, label }) => {
  const ref = useRef();
  const labelRef = useRef();
  useFrame((state) => {
    labelRef.current.position.copy(ref.current.position);
  });

  return (
    <group>
      <Sphere ref={ref} args={[0.8, 32, 32]} position={position}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          roughness={0.1}
          metalness={2}
        />
      </Sphere>
      <group ref={labelRef}>
        <Html>
          <div style={{ color: "white", fontSize: "1em", whiteSpace: "nowrap" }}>{label}</div>
        </Html>
      </group>
    </group>
  );
};

const POrbital = ({ position, orientation = "x", color, label }) => {
  const ref = useRef();
  const labelRef = useRef();
  useFrame((state) => {
    labelRef.current.position.copy(ref.current.position);
  });

  const scale =
    orientation === "y"
      ? [0.4, 1.2, 0.4]
      : orientation === "z"
      ? [0.4, 0.4, 1.2]
      : [1.2, 0.4, 0.4];

  // label offset
  let labelOffset = [2, 2, 2]; // Default x-offset
  if (orientation === "y") {
    labelOffset = [0, 4, 0]; // y-offset
  } else if (orientation === "z") {
    labelOffset = [0, 0, 4]; // z-offset
  }

  return (
    <group>
      <Sphere ref={ref} args={[0.8, 32, 32]} position={position} scale={scale}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          roughness={0.1}
          metalness={2}
        />
      </Sphere>
      <group ref={labelRef} position={labelOffset}>
        <Html>
          <div style={{ color: "white", fontSize: "1em", whiteSpace: "nowrap" }}>{label}</div>
        </Html>
      </group>
    </group>
  );
};

const Electron = ({ position, speed, color, plane, label }) => {
  const ref = useRef();
  const labelRef = useRef();
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    ref.current.position.x = position * Math.cos(time * speed);
    ref.current.position.z = position * Math.sin(time * speed);
    if (plane === "xy") {
      ref.current.position.y = position * Math.sin(time * speed);
    } else if (plane === "xy2") {
      ref.current.position.y = -position * Math.sin(time * speed);
    }
    labelRef.current.position.copy(ref.current.position);
  });

  const points = useMemo(() => {
    let points = [];
    for (let i = 0; i <= 100; i++) {
      const t = (i / 100) * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          position * Math.cos(t),
          plane === "xy"
            ? position * Math.sin(t)
            : plane === "xy2"
            ? -position * Math.sin(t)
            : 0,
          position * Math.sin(t)
        )
      );
    }
    return points;
  }, [position, plane]);

  return (
    <group>
      <Sphere ref={ref} args={[0.4, 32, 32]} position={[position, 0, 0]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          roughness={0.1}
          metalness={2}
        />
      </Sphere>
      <Line points={points} color="white" lineWidth={1.5} />
      <group ref={labelRef}>
        <Html>
          <div style={{ color: "white", fontSize: "1em", whiteSpace: "nowrap" }}>{label}</div>
        </Html>
      </group>
    </group>
  );
};

const Controls = () => {
  const { camera, gl } = useThree();
  camera.position.x = 12.5;
  camera.position.y = 1.5;
  camera.position.z = -0.01;
  camera.lookAt(0, 0, 0);
  const controls = useRef();
  useFrame((state) => {
    controls.current.update();
  });
  return (
    <OrbitControls
      ref={controls}
      args={[camera, gl.domElement]}
      maxDistance={50}
    />
  );
};

const Atom = () => {
  const [isotope, setIsotope] = useState(12); // Default to Carbon-12

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw" }}>
      <h1
        style={{
          color: "white",
          textAlign: "center",
          position: "absolute",
          top: "10px",
          width: "100%",
          zIndex: 1,
          fontFamily: "math",
        }}
      >
        Carbon Atom
      </h1>

      <div
        style={{
          position: "absolute",
          top: "60px",
          right: "10px",
          zIndex: 2,
          marginTop: "1.5rem",
        }}
      >
        <label style={{ color: "white", marginRight: "10px" }}>
          Select Isotope:
        </label>
        <select
          value={isotope}
          onChange={(e) => setIsotope(parseInt(e.target.value))}
        >
          <option value={12}>Carbon-12</option>
          <option value={13}>Carbon-13</option>
          <option value={14}>Carbon-14</option>
        </select>
      </div>

      <div
        style={{
          position: "absolute",
          top: "110px",
          right: "10px",
          zIndex: 2,
          marginTop: "1.5rem",
        }}
      >
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: "#FFD700",
            display: "inline-block",
            verticalAlign: "middle",
            marginRight: "5px",
          }}
        ></div>
        <span style={{ color: "white", marginRight: "20px" }}>Protons: 6</span>

        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: "#C0C0C0",
            display: "inline-block",
            verticalAlign: "middle",
            marginRight: "5px",
          }}
        ></div>
        <span style={{ color: "white" }}>Neutrons: {isotope - 6}</span>
      </div>

      <div
        style={{
          position: "absolute",
          top: "170px",
          right: "10px",
          zIndex: 2,
          marginTop: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: "#FF0",
              marginRight: "10px",
            }}
          ></div>
          <span style={{ color: "white", marginRight: "20px" }}>
            1s Electrons
          </span>

          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: "#FFA500",
              marginRight: "10px",
            }}
          ></div>
          <span style={{ color: "white", marginRight: "20px" }}>
            2s Electrons
          </span>

          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: "#0F0",
              marginRight: "10px",
            }}
          ></div>
          <span style={{ color: "white" }}>2p Electrons</span>
        </div>
        <div style={{ color: "white", marginTop: "1rem" }}>
          The electron configuration of carbon is 1s<sup>2</sup> 2s<sup>2</sup>{" "}
          2p<sup>2</sup>.
        </div>
        <div style={{ color: "white", marginTop: "0.5rem", fontStyle: "italic", textAlign:'center' }}>
          Model is not to scale.
        </div>
      </div>

      <Canvas style={{ background: 'black', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
    <ambientLight />
    <pointLight position={[10, 10, 10]} />
    <Stars />
    <Nucleus isotope={isotope} />
    
    <SOrbital position={[0, 0, 0]} color="#00F" />
    <Electron position={3} speed={1} color="#FF0" plane="xz" label="1s Electron 1" />
    <Electron position={-3} speed={1} color="#FF0" plane="xy" label="1s Electron 2" />

    <SOrbital position={[0, 0, 0]} color="#0FF" />
    <Electron position={5} speed={1.2} color="#FFA500" plane="xz" label="2s Electron 1" />
    <Electron position={-5} speed={1.2} color="#FFA500" plane="xy" label="2s Electron 2" />
    
    <POrbital position={[0, 0, 0]} orientation="x" color="#F00" />
    <Electron position={7} speed={1.4} color="#0F0" plane="xz" label="2px Electron" />

    <POrbital position={[0, 0, 0]} orientation="y" color="#F00" />
    <Electron position={7} speed={1.4} color="#0F0" plane="xy" label="2py Electron" />

    <Controls />
      </Canvas>

    </div>
  );
};

export default Atom;
