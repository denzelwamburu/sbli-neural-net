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
 * - SBLI enhanced visualization with uncertainty overlay
 * 
 * Colors adjusted for light wind tunnel background visibility.
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
                // Darker red-orange for visibility on light background
                u_color: { value: new THREE.Color('#cc2200') },
                u_opacity: { value: 0.75 },
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
          // Animated pulse along shock - faster for more visibility
          float pulse = sin(vUv.x * 25.0 - u_time * 4.0) * 0.35 + 0.75;
          // Fade at edges
          float fade = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.65, vUv.x);
          // Fresnel-like edge brightening - stronger for visibility
          float edge = 1.0 - smoothstep(0.25, 0.5, abs(vUv.y - 0.5));
          
          float alpha = u_opacity * fade * pulse * (0.6 + edge * 0.6);
          // Boost brightness for light background
          vec3 finalColor = u_color * (1.2 + edge * 0.8);
          gl_FragColor = vec4(finalColor, alpha);
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
            <planeGeometry args={[6, 0.08]} />
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
                // Deep magenta-red for contrast
                u_color: { value: new THREE.Color('#cc0044') },
                u_opacity: { value: 0.65 },
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
          float pulse = sin(vUv.x * 20.0 - u_time * 3.0) * 0.3 + 0.8;
          float fade = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.55, vUv.x);
          float edge = 1.0 - smoothstep(0.25, 0.5, abs(vUv.y - 0.5));
          
          float alpha = u_opacity * fade * pulse * (0.7 + edge * 0.5);
          vec3 finalColor = u_color * (1.3 + edge * 0.6);
          gl_FragColor = vec4(finalColor, alpha);
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
            <planeGeometry args={[4, 0.06]} />
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
                    <planeGeometry args={[2.5, 0.02]} />
                    <meshBasicMaterial
                        color="#0066cc"
                        transparent
                        opacity={0.25 - i * 0.03}
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
            const scale = 1 + 0.4 * Math.sin(clock.elapsedTime * 4);
            meshRef.current.scale.setScalar(scale);
        }
    });

    return (
        <group position={sbliPos}>
            {/* Outer uncertainty halo */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.25, 0.35, 32]} />
                <meshBasicMaterial
                    color={isHighUncertainty ? '#ff0044' : '#6600cc'}
                    transparent
                    opacity={0.3}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Pulsing indicator ring */}
            <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.15, 0.22, 32]} />
                <meshStandardMaterial
                    color={isHighUncertainty ? '#ff0044' : '#aa00ff'}
                    emissive={isHighUncertainty ? '#ff0044' : '#aa00ff'}
                    emissiveIntensity={2.5}
                    transparent
                    opacity={0.85}
                />
            </mesh>

            {/* Inner glow */}
            <mesh>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial
                    color={isHighUncertainty ? '#ff2244' : '#cc44ff'}
                    emissive={isHighUncertainty ? '#ff0044' : '#8800ff'}
                    emissiveIntensity={4}
                    transparent
                    opacity={0.6}
                />
            </mesh>

            {/* Separation bubble indicator (elongated region) */}
            <mesh position={[-0.3, 0.05, 0]} rotation={[0, 0, 0.2]}>
                <capsuleGeometry args={[0.06, 0.6, 8, 16]} />
                <meshBasicMaterial
                    color="#ff6600"
                    transparent
                    opacity={0.15}
                />
            </mesh>

            {/* HTML overlay */}
            {showAnnotations && (
                <Html
                    position={[0.6, 0.6, 0]}
                    style={{
                        pointerEvents: 'none',
                        userSelect: 'none',
                    }}
                >
                    <div
                        className="glass-panel-accent sbli-badge"
                        style={{
                            padding: '12px 16px',
                            minWidth: '240px',
                            fontSize: '11px',
                            fontFamily: 'var(--font-mono)',
                            borderColor: isHighUncertainty ? '#ff0044' : '#6600cc',
                            background: 'rgba(255, 255, 255, 0.95)',
                        }}
                    >
                        <div style={{ 
                            color: isHighUncertainty ? '#ff0044' : '#6600cc', 
                            fontWeight: 700, 
                            fontSize: '12px', 
                            marginBottom: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <span style={{ fontSize: '14px' }}>⚡</span> 
                            SBLI REGION
                            {isHighUncertainty && <span style={{ fontSize: '10px', color: '#ff0044' }}>●</span>}
                        </div>
                        <div style={{ color: '#445', marginBottom: '4px' }}>
                            σ(ξ*) = <span style={{ fontWeight: 700, color: '#223' }}>{uncertainty}</span>
                        </div>
                        <div style={{ color: '#667', fontSize: '10px', marginBottom: '4px' }}>
                            Separation onset → Reattachment
                        </div>
                        {isHighUncertainty ? (
                            <div
                                style={{
                                    marginTop: '8px',
                                    padding: '4px 10px',
                                    background: 'rgba(255, 0, 68, 0.1)',
                                    border: '1px solid #ff0044',
                                    borderRadius: '4px',
                                    color: '#ff0044',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                }}
                            >
                                🔴 ACTIVE LEARNING TRIGGER
                            </div>
                        ) : (
                            <div
                                style={{
                                    marginTop: '8px',
                                    padding: '4px 10px',
                                    background: 'rgba(102, 0, 204, 0.08)',
                                    border: '1px solid #6600cc',
                                    borderRadius: '4px',
                                    color: '#6600cc',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                }}
                            >
                                ✓ SURROGATE CONFIDENT
                            </div>
                        )}
                    </div>
                </Html>
            )}
        </group>
    );
}
