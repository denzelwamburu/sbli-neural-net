'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls, Grid } from '@react-three/drei';

/**
 * Wind tunnel test section environment.
 * Light gray background for optimal flow visualization visibility.
 * Reference grid floor for scale and experimental aesthetic.
 */
export function SceneEnvironment() {
    const gridRef = useRef<THREE.Group>(null);

    return (
        <>
            {/* Camera controls */}
            <OrbitControls
                enableDamping
                dampingFactor={0.05}
                minDistance={3}
                maxDistance={30}
                target={[2, 0, 0]}
            />

            {/* Lighting - adjusted for light wind tunnel environment */}
            <ambientLight intensity={0.6} color="#ffffff" />
            
            {/* Main overhead lighting (typical wind tunnel setup) */}
            <directionalLight
                position={[5, 15, 8]}
                intensity={0.9}
                color="#ffffff"
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera={{ left: -10, right: 10, top: 10, bottom: -10 }}
            />
            
            {/* Fill light from opposite side */}
            <directionalLight
                position={[-8, 8, -5]}
                intensity={0.4}
                color="#e8e8f0"
            />
            
            {/* Rim light for model definition */}
            <pointLight position={[-5, 2, -5]} intensity={0.3} color="#4a90d9" />
            
            {/* Warm accent from below (reflection off tunnel floor) */}
            <pointLight position={[3, -1, 3]} intensity={0.2} color="#f5f5f5" />

            {/* Fog - light gray for depth cueing in wind tunnel */}
            <fog attach="fog" args={['#e0e2e5', 15, 50]} />

            {/* Wind tunnel floor with checkered reference pattern */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial
                    color="#d0d2d5"
                    roughness={0.7}
                    metalness={0.1}
                />
            </mesh>

            {/* Reference grid - measurement lines like real wind tunnels */}
            <Grid
                position={[0, -1.99, 0]}
                args={[50, 50]}
                cellSize={1}
                cellThickness={0.8}
                cellColor="#a0a5ac"
                sectionSize={5}
                sectionThickness={1.2}
                sectionColor="#70757d"
                fadeDistance={40}
                fadeStrength={0.5}
                infiniteGrid
            />

            {/* Side wall datum lines (vertical reference) */}
            <group position={[-8, 0, -5]}>
                <mesh>
                    <planeGeometry args={[0.02, 20]} />
                    <meshBasicMaterial color="#c0c5cc" transparent opacity={0.5} />
                </mesh>
            </group>
            <group position={[12, 0, -5]}>
                <mesh>
                    <planeGeometry args={[0.02, 20]} />
                    <meshBasicMaterial color="#c0c5cc" transparent opacity={0.5} />
                </mesh>
            </group>
        </>
    );
}
