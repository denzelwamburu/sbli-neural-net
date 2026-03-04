'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useSimStore } from '@/simulation/store';

/**
 * Shock wave visualisation.
 * - Oblique shock 1 (from ramp leading edge)
 * - Oblique shock 2 (from cowl lip)
 * - Expansion fan (at nozzle)
 * - SBLI pulsing indicator
 */
export function ShockWaves() {
    const showShockWaves = useSimStore((s) => s.showShockWaves);
    const showSBLIRegion = useSimStore((s) => s.showSBLIRegion);
    const showAnnotations = useSimStore((s) => s.showAnnotations);

    if (!showShockWaves) return null;

    return (
        <group>
            <ObliqueShock1 />
            <ObliqueShock2 />
            <ExpansionFan />
            {showSBLIRegion && <SBLIIndicator showAnnotations={showAnnotations} />}
        </group>
    );
}

function ObliqueShock1() {
    const meshRef = useRef<THREE.Mesh>(null);
    const matRef = useRef<THREE.ShaderMaterial>(null);

    const shaderMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            uniforms: {
                u_time: { value: 0 },
                u_color: { value: new THREE.Color('#ff6a30') },
                u_opacity: { value: 0.6 },
            },
            vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
            fragmentShader: `
        uniform float u_time;
        uniform vec3 u_color;
        uniform float u_opacity;
        varying vec2 vUv;
        
        void main() {
          // Animated pulse along shock
          float pulse = sin(vUv.x * 20.0 - u_time * 3.0) * 0.3 + 0.7;
          // Fade at edges
          float fade = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.7, vUv.x);
          // Fresnel-like edge brightening
          float edge = 1.0 - smoothstep(0.3, 0.5, abs(vUv.y - 0.5));
          
          float alpha = u_opacity * fade * pulse * (0.5 + edge * 0.5);
          gl_FragColor = vec4(u_color * (1.0 + edge * 0.5), alpha);
        }
      `,
        });
    }, []);

    useFrame(({ clock }) => {
        const state = useSimStore.getState();
        const beta1 = state.computed.beta1;
        const rampAngle = state.rampAngle;

        if (meshRef.current) {
            const rampAngleRad = (rampAngle * Math.PI) / 180;
            const betaRad = (beta1 * Math.PI) / 180;
            // Position at ramp leading edge, rotate to shock angle
            meshRef.current.position.set(-3, 0, 0);
            meshRef.current.rotation.set(0, 0, Math.PI / 2 - betaRad);
        }

        if (matRef.current) {
            matRef.current.uniforms.u_time.value = clock.elapsedTime;
        }
        shaderMaterial.uniforms.u_time.value = clock.elapsedTime;
    });

    return (
        <mesh ref={meshRef} material={shaderMaterial}>
            <planeGeometry args={[6, 0.06]} />
        </mesh>
    );
}

function ObliqueShock2() {
    const meshRef = useRef<THREE.Mesh>(null);

    const shaderMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            uniforms: {
                u_time: { value: 0 },
                u_color: { value: new THREE.Color('#ff3c78') },
                u_opacity: { value: 0.45 },
            },
            vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
            fragmentShader: `
        uniform float u_time;
        uniform vec3 u_color;
        uniform float u_opacity;
        varying vec2 vUv;
        
        void main() {
          float pulse = sin(vUv.x * 15.0 - u_time * 2.5) * 0.25 + 0.75;
          float fade = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.6, vUv.x);
          float edge = 1.0 - smoothstep(0.3, 0.5, abs(vUv.y - 0.5));
          
          float alpha = u_opacity * fade * pulse;
          gl_FragColor = vec4(u_color * (1.0 + edge * 0.3), alpha);
        }
      `,
        });
    }, []);

    useFrame(({ clock }) => {
        const state = useSimStore.getState();
        const beta2 = state.computed.beta2;
        const rampAngle = state.rampAngle;
        const rampAngleRad = (rampAngle * Math.PI) / 180;

        if (meshRef.current) {
            const cowlY = 0.45;
            meshRef.current.position.set(0, cowlY, 0);
            const betaRad = (beta2 * Math.PI) / 180;
            meshRef.current.rotation.set(0, 0, -(Math.PI / 2 - betaRad));
        }

        shaderMaterial.uniforms.u_time.value = clock.elapsedTime;
    });

    return (
        <mesh ref={meshRef} material={shaderMaterial}>
            <planeGeometry args={[4, 0.04]} />
        </mesh>
    );
}

function ExpansionFan() {
    const fanRef = useRef<THREE.Group>(null);

    return (
        <group ref={fanRef} position={[2.5, 0.5, 0]}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
                <mesh
                    key={i}
                    rotation={[0, 0, -0.15 - i * 0.06]}
                    position={[0, 0, 0]}
                >
                    <planeGeometry args={[2.5, 0.015]} />
                    <meshBasicMaterial
                        color="#6496ff"
                        transparent
                        opacity={0.12 - i * 0.015}
                        side={THREE.DoubleSide}
                        depthWrite={false}
                    />
                </mesh>
            ))}
        </group>
    );
}

function SBLIIndicator({ showAnnotations }: { showAnnotations: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const rampAngle = useSimStore((s) => s.rampAngle);
    const mach = useSimStore((s) => s.mach);

    const rampAngleRad = (rampAngle * Math.PI) / 180;
    const rampTipY = -3 * Math.tan(rampAngleRad);

    // SBLI position: near where cowl shock meets ramp surface
    const sbliPos: [number, number, number] = [0, rampTipY + 0.1, 0];

    // Uncertainty scales with Mach and ramp angle
    const uncertainty = (0.1 + (mach - 4) * 0.05 + (rampAngle - 5) * 0.02).toFixed(3);
    const isHighUncertainty = parseFloat(uncertainty) > 0.4;

    useFrame(({ clock }) => {
        if (meshRef.current) {
            const scale = 1 + 0.3 * Math.sin(clock.elapsedTime * 3);
            meshRef.current.scale.setScalar(scale);
        }
    });

    return (
        <group position={sbliPos}>
            {/* Pulsing indicator */}
            <mesh ref={meshRef}>
                <torusGeometry args={[0.2, 0.04, 8, 32]} />
                <meshStandardMaterial
                    color="#ff4466"
                    emissive="#ff4466"
                    emissiveIntensity={2}
                    transparent
                    opacity={0.7}
                />
            </mesh>

            {/* Inner glow */}
            <mesh>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial
                    color="#ff6644"
                    emissive="#ff4422"
                    emissiveIntensity={3}
                    transparent
                    opacity={0.5}
                />
            </mesh>

            {/* HTML overlay */}
            {showAnnotations && (
                <Html
                    position={[0.5, 0.5, 0]}
                    style={{
                        pointerEvents: 'none',
                        userSelect: 'none',
                    }}
                >
                    <div
                        className="glass-panel-accent sbli-badge"
                        style={{
                            padding: '10px 14px',
                            minWidth: '220px',
                            fontSize: '11px',
                            fontFamily: 'var(--font-mono)',
                            borderColor: isHighUncertainty ? '#ff4466' : '#4a9aba',
                        }}
                    >
                        <div style={{ color: '#ff6a30', fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>
                            ⚡ SBLI REGION
                        </div>
                        <div style={{ color: '#8ac4ea', marginBottom: '2px' }}>
                            σ(ξ*) = {uncertainty}
                        </div>
                        {isHighUncertainty && (
                            <div
                                style={{
                                    marginTop: '6px',
                                    padding: '3px 8px',
                                    background: 'rgba(255, 68, 102, 0.2)',
                                    border: '1px solid #ff4466',
                                    borderRadius: '4px',
                                    color: '#ff4466',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                }}
                            >
                                🔴 ACTIVE LEARNING TRIGGER
                            </div>
                        )}
                    </div>
                </Html>
            )}
        </group>
    );
}
