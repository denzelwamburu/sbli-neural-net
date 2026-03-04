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
            <meshStandardMaterial color="#1a3a5a" wireframe />
        </mesh>
    );
}

export function ScramjetScene() {
    return (
        <Canvas
            camera={{ position: [0, 3, 10], fov: 50 }}
            gl={{
                antialias: true,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.2,
            }}
            style={{ width: '100%', height: '100%' }}
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
