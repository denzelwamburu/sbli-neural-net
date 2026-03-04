'use client';

import { useSimStore, type ColorMode } from '@/simulation/store';

const modes: { key: ColorMode; label: string; color: string; gradient: string }[] = [
    { key: 'mach', label: 'MACH', color: '#6ac4ff', gradient: 'linear-gradient(90deg, #1a3a8a, #6ac4ff, #ff4466)' },
    { key: 'pressure', label: 'PRESSURE', color: '#aa44cc', gradient: 'linear-gradient(90deg, #4a9aba, #aa44cc, #ff22aa)' },
    { key: 'temperature', label: 'TEMP', color: '#ff8830', gradient: 'linear-gradient(90deg, #2244aa, #ffaa22, #ffffff)' },
    { key: 'schlieren', label: 'SCHLIEREN', color: '#e0e8f0', gradient: 'linear-gradient(90deg, #111111, #667788, #eeffff)' },
];

export function FlowModeSelector() {
    const colorMode = useSimStore((s) => s.colorMode);
    const setColorMode = useSimStore((s) => s.setColorMode);

    const activeMode = modes.find((m) => m.key === colorMode) || modes[0];

    return (
        <div>
            <div style={{
                display: 'flex',
                gap: '4px',
                marginBottom: '8px',
            }}>
                {modes.map((mode) => (
                    <button
                        key={mode.key}
                        onClick={() => setColorMode(mode.key)}
                        style={{
                            flex: 1,
                            padding: '6px 8px',
                            fontSize: '9px',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            letterSpacing: '0.5px',
                            border: `1px solid ${colorMode === mode.key ? mode.color : 'rgba(106, 196, 255, 0.15)'}`,
                            borderRadius: '4px',
                            background: colorMode === mode.key ? `${mode.color}20` : 'rgba(6, 16, 26, 0.6)',
                            color: colorMode === mode.key ? mode.color : 'rgba(138, 196, 234, 0.5)',
                            cursor: 'pointer',
                            transition: 'all 200ms ease',
                            outline: 'none',
                        }}
                    >
                        {mode.label}
                    </button>
                ))}
            </div>

            {/* Color legend bar */}
            <div style={{
                height: '6px',
                borderRadius: '3px',
                background: activeMode.gradient,
                boxShadow: `0 0 8px ${activeMode.color}40`,
            }} />
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '8px',
                fontFamily: 'var(--font-mono)',
                color: 'rgba(138, 196, 234, 0.4)',
                marginTop: '2px',
            }}>
                <span>LOW</span>
                <span>HIGH</span>
            </div>
        </div>
    );
}
