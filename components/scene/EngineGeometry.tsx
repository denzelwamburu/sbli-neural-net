'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSimStore } from '@/simulation/store';

/**
 * Procedural scramjet engine geometry.
 * 5 sections: forebody/ramp, cowl, combustor, nozzle, fairing.
 * All geometry rebuilds via useMemo when parameters change.
 * 
 * Materials optimized for light wind tunnel background.
 */
export function EngineGeometry() {
    const rampAngle = useSimStore((s) => s.rampAngle);
    const cowlAngle = useSimStore((s) => s.cowlAngle);
    const fuelFlowRate = useSimStore((s) => s.fuelFlowRate);
    const wireframe = useSimStore((s) => s.wireframe);

    const combustorRef = useRef<THREE.Mesh>(null);
    const nozzleLipRef = useRef<THREE.Mesh>(null);

    // Animate combustor glow
    useFrame(() => {
        const fuel = useSimStore.getState().fuelFlowRate;
        if (combustorRef.current) {
            const mat = combustorRef.current.material as THREE.MeshStandardMaterial;
            mat.emissiveIntensity = fuel * 3;
        }
        if (nozzleLipRef.current) {
            const mat = nozzleLipRef.current.material as THREE.MeshStandardMaterial;
            mat.emissiveIntensity = 1.5 + fuel * 4;
        }
    });

    // 1. COMPRESSION RAMP
    const rampGeo = useMemo(() => {
        const angleRad = (rampAngle * Math.PI) / 180;
        const rampLength = 3;
        const rampHeight = rampLength * Math.tan(angleRad);
        const depth = 1.2; // Z-width

        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(rampLength, -rampHeight);
        shape.lineTo(rampLength, -rampHeight - 0.08);
        shape.lineTo(0, -0.15);
        shape.lineTo(0, 0);

        const extrudeSettings = { depth, bevelEnabled: false };
        const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geo.translate(-3, 0, -depth / 2);
        return geo;
    }, [rampAngle]);

    // 2. COWL / INTAKE LIP
    const cowlGeo = useMemo(() => {
        const rampAngleRad = (rampAngle * Math.PI) / 180;
        const rampTipY = -3 * Math.tan(rampAngleRad);
        const depth = 1.2;

        const shape = new THREE.Shape();
        shape.moveTo(-1.5, 0.6);
        shape.quadraticCurveTo(-0.5, 0.55, 0, 0.45);
        shape.lineTo(0, rampTipY + 0.15);
        shape.lineTo(0, rampTipY + 0.05);
        shape.lineTo(-0.3, 0.35);
        shape.lineTo(-1.5, 0.45);
        shape.lineTo(-1.5, 0.6);

        const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
        geo.translate(0, 0, -depth / 2);
        return geo;
    }, [rampAngle, cowlAngle]);

    // 3. COMBUSTOR / ISOLATOR
    const combustorGeo = useMemo(() => {
        const rampAngleRad = (rampAngle * Math.PI) / 180;
        const rampTipY = -3 * Math.tan(rampAngleRad);
        const depth = 1.2;
        const length = 2.5;

        const shape = new THREE.Shape();
        shape.moveTo(0, 0.45);
        shape.lineTo(length, 0.5);
        shape.lineTo(length, rampTipY - 0.2);
        shape.lineTo(0, rampTipY - 0.08);
        shape.lineTo(0, rampTipY + 0.05);
        shape.lineTo(0, 0.35);
        shape.lineTo(0, 0.45);

        const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
        geo.translate(0, 0, -depth / 2);
        return geo;
    }, [rampAngle]);

    // 4. NOZZLE
    const nozzleGeo = useMemo(() => {
        const rampAngleRad = (rampAngle * Math.PI) / 180;
        const rampTipY = -3 * Math.tan(rampAngleRad);
        const depth = 1.2;
        const nozzleLength = 2;

        const shape = new THREE.Shape();
        shape.moveTo(0, 0.5);
        shape.lineTo(nozzleLength, 0.7);
        shape.lineTo(nozzleLength, rampTipY - 0.8);
        shape.lineTo(0, rampTipY - 0.2);
        shape.lineTo(0, 0.5);

        const geo = new THREE.ExtrudeGeometry(shape, { depth: depth * 1.1, bevelEnabled: false });
        geo.translate(2.5, 0, -(depth * 1.1) / 2);
        return geo;
    }, [rampAngle]);

    // 5. OUTER FAIRING / SHELL
    const fairingGeo = useMemo(() => {
        const depth = 1.4;
        const shape = new THREE.Shape();
        shape.moveTo(-3.5, 0.08);
        shape.quadraticCurveTo(-2.5, 0.75, -1, 0.7);
        shape.lineTo(2.5, 0.65);
        shape.quadraticCurveTo(3.5, 0.7, 4.5, 0.85);
        shape.lineTo(4.5, 0.75);
        shape.lineTo(2.5, 0.55);
        shape.lineTo(-1, 0.6);
        shape.quadraticCurveTo(-2.5, 0.63, -3.5, 0.0);
        shape.lineTo(-3.5, 0.08);

        const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 });
        geo.translate(0, 0, -depth / 2);
        return geo;
    }, []);

    // Stabilizer fin
    const finGeo = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(1.5, 0.8);
        shape.lineTo(2, 0.6);
        shape.lineTo(0.5, 0);
        shape.lineTo(0, 0);
        const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.04, bevelEnabled: false });
        geo.translate(-0.5, 0.65, -0.02);
        return geo;
    }, []);

    // Fuel injector struts
    const strutGeo = useMemo(() => {
        return new THREE.BoxGeometry(0.05, 0.4, 0.8);
    }, []);

    const rampAngleRad = (rampAngle * Math.PI) / 180;
    const rampTipY = -3 * Math.tan(rampAngleRad);

    return (
        <group>
            {/* Compression Ramp */}
            <mesh geometry={rampGeo} castShadow receiveShadow>
                <meshPhysicalMaterial
                    color="#8a9aac"
                    metalness={0.75}
                    roughness={0.3}
                    clearcoat={0.4}
                    wireframe={wireframe}
                />
            </mesh>

            {/* Edge highlight on ramp */}
            <lineSegments>
                <edgesGeometry args={[rampGeo, 30]} />
                <lineBasicMaterial color="#5a6a7c" linewidth={1} />
            </lineSegments>

            {/* Cowl */}
            <mesh geometry={cowlGeo} castShadow>
                <meshPhysicalMaterial
                    color="#9aabbd"
                    metalness={0.8}
                    roughness={0.25}
                    clearcoat={0.5}
                    wireframe={wireframe}
                />
            </mesh>

            {/* Combustor - darker for heat contrast */}
            <mesh ref={combustorRef} geometry={combustorGeo}>
                <meshStandardMaterial
                    color="#3a3a45"
                    metalness={0.7}
                    roughness={0.5}
                    emissive="#ff4400"
                    emissiveIntensity={fuelFlowRate * 2.5}
                    wireframe={wireframe}
                />
            </mesh>

            {/* Fuel injector struts */}
            {[0.8, 1.4, 2.0].map((x, i) => (
                <mesh key={i} geometry={strutGeo} position={[x, (0.4 + rampTipY) / 2, 0]}>
                    <meshStandardMaterial color="#4a5560" metalness={0.8} roughness={0.4} />
                </mesh>
            ))}

            {/* Nozzle */}
            <mesh geometry={nozzleGeo} castShadow>
                <meshPhysicalMaterial
                    color="#7a8a9c"
                    metalness={0.75}
                    roughness={0.35}
                    emissive="#ff4400"
                    emissiveIntensity={fuelFlowRate * 1.5}
                    wireframe={wireframe}
                />
            </mesh>

            {/* Nozzle lip */}
            <mesh ref={nozzleLipRef} position={[4.5, (0.7 + rampTipY - 0.8) / 2, 0]}>
                <torusGeometry args={[0.5, 0.04, 8, 32, Math.PI]} />
                <meshStandardMaterial
                    emissive="#ff6622"
                    emissiveIntensity={1.5 + fuelFlowRate * 4}
                    color="#ff8844"
                />
            </mesh>

            {/* Outer fairing */}
            <mesh geometry={fairingGeo}>
                <meshPhysicalMaterial
                    color="#aabbcf"
                    metalness={0.8}
                    roughness={0.25}
                    clearcoat={0.4}
                    wireframe={wireframe}
                />
            </mesh>

            {/* Stabiliser fin */}
            <mesh geometry={finGeo}>
                <meshPhysicalMaterial
                    color="#8a9aac"
                    metalness={0.75}
                    roughness={0.3}
                    clearcoat={0.3}
                />
            </mesh>

            {/* Panel lines on fairing (thin dark strips) */}
            {[-0.5, 0.5, 1.5, 2.5, 3.5].map((x, i) => (
                <mesh key={`panel-${i}`} position={[x, 0.68, 0]}>
                    <boxGeometry args={[0.01, 0.01, 1.3]} />
                    <meshBasicMaterial color="#4a5560" />
                </mesh>
            ))}

            {/* Sensor bumps */}
            {[
                [-2, 0.65, 0.3],
                [1, 0.62, -0.4],
                [3.5, 0.72, 0.2],
            ].map(([x, y, z], i) => (
                <mesh key={`sensor-${i}`} position={[x, y, z]}>
                    <sphereGeometry args={[0.04, 8, 8]} />
                    <meshStandardMaterial color="#3a5a7a" metalness={0.9} roughness={0.1} emissive="#4a9aba" emissiveIntensity={0.5} />
                </mesh>
            ))}
        </group>
    );
}
