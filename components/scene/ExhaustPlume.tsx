'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSimStore } from '@/simulation/store';

const PARTICLE_COUNT = 3000;

/**
 * GPU-accelerated exhaust plume using InstancedMesh.
 * Particles spawn at nozzle exit and travel downstream with turbulence.
 */
export function ExhaustPlume() {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Particle state arrays
    const particleState = useMemo(() => ({
        positions: new Float32Array(PARTICLE_COUNT * 3),
        velocities: new Float32Array(PARTICLE_COUNT * 3),
        lifetimes: new Float32Array(PARTICLE_COUNT),
        sizes: new Float32Array(PARTICLE_COUNT),
        ages: new Float32Array(PARTICLE_COUNT),
    }), []);

    // Initialize particles
    useMemo(() => {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particleState.lifetimes[i] = 0; // Start dead, will be spawned
            particleState.sizes[i] = 0;
        }
    }, [particleState]);

    // Color ramp: white-yellow → orange → dark red
    const colorRamp = useMemo(() => {
        return [
            new THREE.Color('#ffffee'), // Birth
            new THREE.Color('#ffcc44'), // Young
            new THREE.Color('#ff8830'), // Mid
            new THREE.Color('#cc4400'), // Old
            new THREE.Color('#441100'), // Dying
        ];
    }, []);

    useFrame(({ clock }) => {
        if (!meshRef.current) return;

        const state = useSimStore.getState();
        const fuel = state.fuelFlowRate;
        const exhaustMach = state.computed.exhaustMach;
        const rampAngle = state.rampAngle;
        const rampAngleRad = (rampAngle * Math.PI) / 180;
        const rampTipY = -3 * Math.tan(rampAngleRad);

        // Nozzle exit position and size
        const nozzleX = 4.5;
        const nozzleYCenter = (0.7 + rampTipY - 0.8) / 2;
        const nozzleHeight = Math.abs(0.7 - (rampTipY - 0.8));
        const dt = 0.016;
        const time = clock.elapsedTime;

        // Spawn rate proportional to fuel flow
        const spawnRate = Math.floor(fuel * 40);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            if (particleState.lifetimes[i] <= 0) {
                // Dead particle — potentially respawn
                if (spawnRate > 0 && Math.random() < spawnRate / PARTICLE_COUNT * 3) {
                    // Spawn at nozzle exit
                    particleState.positions[i * 3] = nozzleX + Math.random() * 0.2;
                    particleState.positions[i * 3 + 1] = nozzleYCenter + (Math.random() - 0.5) * nozzleHeight * 0.6;
                    particleState.positions[i * 3 + 2] = (Math.random() - 0.5) * 0.8;

                    // Velocity: mainly +X, proportional to exhaust Mach
                    const speed = 2 + exhaustMach * 0.5;
                    particleState.velocities[i * 3] = speed * (0.8 + Math.random() * 0.4);
                    particleState.velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
                    particleState.velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5;

                    particleState.lifetimes[i] = 1.0;
                    particleState.ages[i] = 0;
                    particleState.sizes[i] = 0.02 + Math.random() * 0.04;
                }
                continue;
            }

            // Update living particle
            const distFromNozzle = particleState.positions[i * 3] - nozzleX;

            // Add turbulence (simple noise approximation)
            const turbulence = Math.sin(time * 3 + i * 0.7) * 0.1 * Math.min(distFromNozzle * 0.3, 1);

            particleState.positions[i * 3] += particleState.velocities[i * 3] * dt;
            particleState.positions[i * 3 + 1] += particleState.velocities[i * 3 + 1] * dt + turbulence * dt;
            particleState.positions[i * 3 + 2] += particleState.velocities[i * 3 + 2] * dt + Math.cos(time * 2.5 + i * 1.3) * 0.05 * dt;

            // Spread out over distance
            particleState.velocities[i * 3 + 1] += (Math.random() - 0.5) * 0.3 * dt;
            particleState.velocities[i * 3 + 2] += (Math.random() - 0.5) * 0.3 * dt;

            // Age and lifetime
            particleState.ages[i] += dt * 0.8;
            particleState.lifetimes[i] -= dt * 0.3;

            // Size: grow then shrink
            const life = particleState.lifetimes[i];
            const sizeScale = life > 0.5 ? (1 - life) * 4 : life * 2;
            const size = particleState.sizes[i] * Math.max(sizeScale, 0.1);

            // Kill conditions
            if (particleState.lifetimes[i] <= 0 || particleState.positions[i * 3] > nozzleX + 15) {
                particleState.lifetimes[i] = 0;
                dummy.scale.setScalar(0);
                dummy.position.set(0, -100, 0);
                dummy.updateMatrix();
                meshRef.current.setMatrixAt(i, dummy.matrix);

                // Color for dead particle
                const deadColor = new THREE.Color('#000000');
                meshRef.current.setColorAt(i, deadColor);
                continue;
            }

            // Update instance matrix
            dummy.position.set(
                particleState.positions[i * 3],
                particleState.positions[i * 3 + 1],
                particleState.positions[i * 3 + 2]
            );
            dummy.scale.setScalar(size);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);

            // Color based on lifetime (temperature ramp)
            const t = 1 - life; // 0 = birth, 1 = death
            const colorIdx = Math.min(Math.floor(t * (colorRamp.length - 1)), colorRamp.length - 2);
            const colorT = (t * (colorRamp.length - 1)) - colorIdx;
            const color = new THREE.Color().lerpColors(colorRamp[colorIdx], colorRamp[colorIdx + 1], colorT);
            meshRef.current.setColorAt(i, color);
        }

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
            <sphereGeometry args={[1, 4, 4]} />
            <meshBasicMaterial
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                vertexColors
            />
        </instancedMesh>
    );
}
