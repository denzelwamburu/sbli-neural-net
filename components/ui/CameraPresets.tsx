'use client';

import { useSimStore, type CameraPreset } from '@/simulation/store';

const presets: { key: CameraPreset; label: string; icon: string }[] = [
    { key: 'full', label: 'FULL', icon: '🔭' },
    { key: 'intake', label: 'INTAKE', icon: '◁' },
    { key: 'combustor', label: 'COMB', icon: '🔥' },
    { key: 'exhaust', label: 'EXHAUST', icon: '💨' },
    { key: 'free', label: 'FREE', icon: '🎯' },
];

export function CameraPresets() {
    const cameraPreset = useSimStore((s) => s.cameraPreset);
    const setCameraPreset = useSimStore((s) => s.setCameraPreset);

    return (
        <div style={{ display: 'flex', gap: '4px' }}>
            {presets.map((preset) => (
                <button
                    key={preset.key}
                    onClick={() => setCameraPreset(preset.key)}
                    style={{
                        flex: 1,
                        padding: '5px 4px',
                        fontSize: '8px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        letterSpacing: '0.3px',
                        border: `1px solid ${cameraPreset === preset.key ? '#6ac4ff' : 'rgba(106, 196, 255, 0.12)'}`,
                        borderRadius: '4px',
                        background: cameraPreset === preset.key ? 'rgba(106, 196, 255, 0.12)' : 'rgba(6, 16, 26, 0.5)',
                        color: cameraPreset === preset.key ? '#6ac4ff' : 'rgba(138, 196, 234, 0.4)',
                        cursor: 'pointer',
                        transition: 'all 200ms ease',
                        outline: 'none',
                        textAlign: 'center',
                    }}
                >
                    <div style={{ fontSize: '12px', marginBottom: '2px' }}>{preset.icon}</div>
                    {preset.label}
                </button>
            ))}
        </div>
    );
}
