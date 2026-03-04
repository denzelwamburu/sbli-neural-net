'use client';

import { Environment, Stars, OrbitControls, MeshReflectorMaterial } from '@react-three/drei';

export function SceneEnvironment() {
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

            {/* Lighting */}
            <ambientLight intensity={0.15} color="#8ac4ea" />
            <directionalLight
                position={[8, 12, 5]}
                intensity={0.8}
                color="#ffffff"
                castShadow
                shadow-mapSize={[2048, 2048]}
            />
            {/* Rim light — blue tint from behind */}
            <pointLight position={[-5, 3, -5]} intensity={0.3} color="#4a9aba" />
            {/* Warm accent from below-right */}
            <pointLight position={[8, -2, 3]} intensity={0.15} color="#ff6a30" />

            {/* Environment */}
            <Environment preset="night" />

            {/* Atmosphere */}
            <Stars radius={100} depth={50} count={3000} factor={4} saturation={0.2} fade speed={0.5} />

            {/* Fog */}
            <fog attach="fog" args={['#030810', 20, 60]} />

            {/* Ground plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <MeshReflectorMaterial
                    mirror={0.3}
                    blur={[300, 100]}
                    resolution={1024}
                    mixBlur={1}
                    mixStrength={0.5}
                    roughness={1}
                    depthScale={1.2}
                    minDepthThreshold={0.4}
                    maxDepthThreshold={1.4}
                    color="#050a14"
                    metalness={0.5}
                />
            </mesh>
        </>
    );
}
