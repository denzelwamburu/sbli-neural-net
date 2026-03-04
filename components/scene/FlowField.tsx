'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSimStore } from '@/simulation/store';

const PARTICLE_COUNT = 300;

/**
 * Flow field streamline particles.
 * Particles trace flow paths through the engine, colored by active visualization mode.
 */
export function FlowField() {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const showFlowParticles = useSimStore((s) => s.showFlowParticles);

    const particleState = useMemo(() => ({
        positions: new Float32Array(PARTICLE_COUNT * 3),
        velocities: new Float32Array(PARTICLE_COUNT * 3),
        regions: new Uint8Array(PARTICLE_COUNT), // 0=freestream, 1=post-shock1, 2=combustor, 3=nozzle
    }), []);

    // Initialize all particles
    useMemo(() => {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            resetParticle(i, particleState);
        }
    }, [particleState]);

    // Color maps for different modes
    const colorMaps = useMemo(() => ({
        mach: {
            slow: new THREE.Color('#1a3a8a'),
            mid: new THREE.Color('#6ac4ff'),
            fast: new THREE.Color('#ff4466'),
        },
        pressure: {
            slow: new THREE.Color('#4a9aba'),
            mid: new THREE.Color('#aa44cc'),
            fast: new THREE.Color('#ff22aa'),
        },
        temperature: {
            slow: new THREE.Color('#2244aa'),
            mid: new THREE.Color('#ffaa22'),
            fast: new THREE.Color('#ffffff'),
        },
        schlieren: {
            slow: new THREE.Color('#111111'),
            mid: new THREE.Color('#667788'),
            fast: new THREE.Color('#eeffff'),
        },
    }), []);

    useFrame(({ clock }) => {
        if (!meshRef.current || !showFlowParticles) return;

        const state = useSimStore.getState();
        const mach = state.mach;
        const rampAngle = state.rampAngle;
        const colorMode = state.colorMode;
        const rampAngleRad = (rampAngle * Math.PI) / 180;
        const postShockM = state.computed.postShock1.M;
        const dt = 0.016;
        const time = clock.elapsedTime;

        const colors = colorMaps[colorMode];

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const px = particleState.positions[i * 3];
            const py = particleState.positions[i * 3 + 1];

            // Determine region and compute velocity
            let vx = 0, vy = 0, vz = 0;
            let colorT = 0;
            const rampTipY = -3 * Math.tan(rampAngleRad);

            if (px < -3) {
                // Freestream
                vx = 1.5 + mach * 0.15;
                vy = 0;
                colorT = 0.3 + mach / 12 * 0.4;
                particleState.regions[i] = 0;
            } else if (px < 0) {
                // Post shock 1: deflected by ramp angle
                vx = 1.0 + postShockM * 0.1;
                vy = -vx * Math.tan(rampAngleRad) * 0.5;
                colorT = 0.5;
                particleState.regions[i] = 1;
            } else if (px < 2.5) {
                // Combustor: slow down, turbulence
                vx = 0.8;
                vy = Math.sin(time * 5 + i * 1.3) * 0.15;
                vz = Math.cos(time * 4 + i * 0.9) * 0.1;
                colorT = 0.75;
                particleState.regions[i] = 2;
            } else {
                // Nozzle: accelerate
                const accel = 1 + (px - 2.5) * 0.5;
                vx = 1.5 * accel;
                vy = (py > 0 ? 0.1 : -0.1) * (px - 2.5) * 0.2;
                colorT = 0.9;
                particleState.regions[i] = 3;
            }

            // Update position
            particleState.positions[i * 3] += vx * dt;
            particleState.positions[i * 3 + 1] += vy * dt;
            particleState.positions[i * 3 + 2] += (vz || 0) * dt;

            // Reset if out of bounds
            if (px > 8 || py < -3 || py > 3) {
                resetParticle(i, particleState);
            }

            // Update instance
            dummy.position.set(
                particleState.positions[i * 3],
                particleState.positions[i * 3 + 1],
                particleState.positions[i * 3 + 2]
            );
            dummy.scale.setScalar(0.025);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);

            // Color by mode
            const color = new THREE.Color().lerpColors(
                colors.slow,
                colorT > 0.5 ? colors.fast : colors.mid,
                colorT > 0.5 ? (colorT - 0.5) * 2 : colorT * 2
            );
            meshRef.current.setColorAt(i, color);
        }

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    if (!showFlowParticles) return null;

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
            <sphereGeometry args={[1, 6, 6]} />
            <meshBasicMaterial
                transparent
                opacity={0.9}
                vertexColors
                depthWrite={false}
            />
        </instancedMesh>
    );
}

function resetParticle(i: number, state: { positions: Float32Array; velocities: Float32Array }) {
    state.positions[i * 3] = -6 + Math.random() * 2;
    state.positions[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
    state.positions[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
    state.velocities[i * 3] = 1;
    state.velocities[i * 3 + 1] = 0;
    state.velocities[i * 3 + 2] = 0;
}
