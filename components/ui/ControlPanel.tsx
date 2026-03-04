'use client';

import { useSimStore } from '@/simulation/store';

export function ControlPanel() {
    const mach = useSimStore((s) => s.mach);
    const rampAngle = useSimStore((s) => s.rampAngle);
    const cowlAngle = useSimStore((s) => s.cowlAngle);
    const altitude = useSimStore((s) => s.altitude);
    const fuelFlowRate = useSimStore((s) => s.fuelFlowRate);
    const setMach = useSimStore((s) => s.setMach);
    const setRampAngle = useSimStore((s) => s.setRampAngle);
    const setCowlAngle = useSimStore((s) => s.setCowlAngle);
    const setAltitude = useSimStore((s) => s.setAltitude);
    const setFuelFlowRate = useSimStore((s) => s.setFuelFlowRate);

    // Toggles
    const showShockWaves = useSimStore((s) => s.showShockWaves);
    const showFlowParticles = useSimStore((s) => s.showFlowParticles);
    const showMachDiamonds = useSimStore((s) => s.showMachDiamonds);
    const showSBLIRegion = useSimStore((s) => s.showSBLIRegion);
    const showAnnotations = useSimStore((s) => s.showAnnotations);
    const wireframe = useSimStore((s) => s.wireframe);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Freestream */}
            <ControlGroup title="FREESTREAM">
                <SliderControl label="Mach" value={mach} min={4} max={12} step={0.1} onChange={setMach} unit="M∞" color="#6ac4ff" />
                <SliderControl label="Altitude" value={altitude} min={20} max={45} step={1} onChange={setAltitude} unit="km" color="#4a9aba" />
            </ControlGroup>

            {/* Intake Geometry */}
            <ControlGroup title="INTAKE GEOMETRY">
                <SliderControl label="Ramp Angle" value={rampAngle} min={5} max={25} step={0.5} onChange={setRampAngle} unit="°" color="#ff6a30" />
                <SliderControl label="Cowl Angle" value={cowlAngle} min={2} max={10} step={0.5} onChange={setCowlAngle} unit="°" color="#ff9944" />
            </ControlGroup>

            {/* Combustor */}
            <ControlGroup title="COMBUSTOR">
                <SliderControl label="Fuel Flow" value={fuelFlowRate} min={0} max={1} step={0.01} onChange={setFuelFlowRate} unit="" color="#00ff88" />
            </ControlGroup>

            {/* Toggles */}
            <ControlGroup title="DISPLAY">
                <ToggleControl label="Shock Waves" active={showShockWaves} onToggle={useSimStore.getState().toggleShockWaves} />
                <ToggleControl label="Flow Particles" active={showFlowParticles} onToggle={useSimStore.getState().toggleFlowParticles} />
                <ToggleControl label="SBLI Region" active={showSBLIRegion} onToggle={useSimStore.getState().toggleSBLIRegion} />
                <ToggleControl label="Annotations" active={showAnnotations} onToggle={useSimStore.getState().toggleAnnotations} />
                <ToggleControl label="Wireframe" active={wireframe} onToggle={useSimStore.getState().toggleWireframe} />
            </ControlGroup>
        </div>
    );
}

function ControlGroup({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <div style={{
                fontSize: '9px',
                fontFamily: 'var(--font-mono)',
                color: 'rgba(106, 196, 255, 0.5)',
                letterSpacing: '1.5px',
                marginBottom: '8px',
                fontWeight: 700,
            }}>
                {title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {children}
            </div>
        </div>
    );
}

interface SliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (v: number) => void;
    unit: string;
    color: string;
}

function SliderControl({ label, value, min, max, step, onChange, unit, color }: SliderProps) {
    const percent = ((value - min) / (max - min)) * 100;

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '4px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
            }}>
                <span style={{ color: 'rgba(192, 228, 250, 0.7)' }}>{label}</span>
                <span style={{ color, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    {value.toFixed(step < 1 ? (step < 0.1 ? 2 : 1) : 0)}{unit}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                style={{
                    width: '100%',
                    height: '4px',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    background: `linear-gradient(to right, ${color} 0%, ${color} ${percent}%, rgba(106, 196, 255, 0.15) ${percent}%, rgba(106, 196, 255, 0.15) 100%)`,
                    borderRadius: '2px',
                    outline: 'none',
                    cursor: 'pointer',
                    accentColor: color,
                }}
            />
        </div>
    );
}

function ToggleControl({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
    return (
        <button
            onClick={onToggle}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 0',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: active ? '#c0e4fa' : 'rgba(138, 196, 234, 0.35)',
                transition: 'color 200ms ease',
                textAlign: 'left',
                width: '100%',
                outline: 'none',
            }}
        >
            <span style={{
                width: '28px',
                height: '14px',
                borderRadius: '7px',
                background: active ? 'rgba(106, 196, 255, 0.3)' : 'rgba(106, 196, 255, 0.08)',
                border: `1px solid ${active ? '#6ac4ff' : 'rgba(106, 196, 255, 0.15)'}`,
                position: 'relative',
                transition: 'all 200ms ease',
                flexShrink: 0,
                display: 'inline-block',
            }}>
                <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: active ? '#6ac4ff' : 'rgba(138, 196, 234, 0.3)',
                    position: 'absolute',
                    top: '1px',
                    left: active ? '15px' : '1px',
                    transition: 'all 200ms ease',
                    boxShadow: active ? '0 0 6px #6ac4ff' : 'none',
                }} />
            </span>
            {label}
        </button>
    );
}

// Alias to keep JSX valid — children list passed as ControlGroup
function ToggleGroup({ title, children }: { title: string; children: React.ReactNode }) {
    return <ControlGroup title={title}>{children}</ControlGroup>;
}
