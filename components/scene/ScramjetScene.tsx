'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import * as THREE from 'three';
import { SceneEnvironment } from './SceneEnvironment';
import { EngineGeometry } from './EngineGeometry';
import { ShockWaves } from './ShockWaves';
import { ExhaustPlume } from './ExhaustPlume';
import { FlowField } from './FlowField';

function LoadingFallback() {
    return (
        <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#6a8aaa" wireframe />
        </mesh>
    );
}

/**
 * Main scramjet scene component.
 * Wind tunnel aesthetic with light gray background for optimal visibility
 * of shock waves, flow particles, and exhaust plume.
 */
export function ScramjetScene() {
    return (
        <Canvas
            camera={{ position: [0, 3, 10], fov: 50 }}
            gl={{
                antialias: true,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.1,
            }}
            style={{ 
                width: '100%', 
                height: '100%',
                background: '#e0e2e5' // Light wind tunnel gray background
            }}
            dpr={[1, 2]}
        >
            <Suspense fallback={<LoadingFallback />}>
                <SceneEnvironment />
                <EngineGeometry />
                <ShockWaves />
                <ExhaustPlume />
                <FlowField />
            </Suspense>
        </Canvas>
    );
}
