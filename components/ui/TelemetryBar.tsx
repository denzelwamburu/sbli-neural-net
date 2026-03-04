'use client';

import { useSimStore } from '@/simulation/store';

export function TelemetryBar() {
    const computed = useSimStore((s) => s.computed);
    const mach = useSimStore((s) => s.mach);
    const rampAngle = useSimStore((s) => s.rampAngle);

    return (
        <div
            className="data-readout"
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: '38px',
                background: 'rgba(3, 6, 12, 0.92)',
                backdropFilter: 'blur(12px)',
                borderTop: '1px solid rgba(106, 196, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'rgba(192, 228, 250, 0.8)',
                zIndex: 50,
                gap: '16px',
                overflowX: 'auto',
            }}
        >
            {/* Left: Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#00ff88',
                    boxShadow: '0 0 8px #00ff88',
                    display: 'inline-block',
                }} />
                <span style={{ color: '#00ff88', fontWeight: 700, fontSize: '10px' }}>LIVE</span>
            </div>

            {/* Center: Telemetry values */}
            <div style={{ display: 'flex', gap: '16px', whiteSpace: 'nowrap', flexWrap: 'nowrap' }}>
                <TelemetryValue label="M∞" value={mach.toFixed(1)} />
                <TelemetrySep />
                <TelemetryValue label="θ" value={`${rampAngle.toFixed(1)}°`} />
                <TelemetrySep />
                <TelemetryValue label="β₁" value={`${computed.beta1.toFixed(1)}°`} />
                <TelemetrySep />
                <TelemetryValue label="β₂" value={`${computed.beta2.toFixed(1)}°`} />
                <TelemetrySep />
                <TelemetryValue label="p₂/p₁" value={computed.postShock1.pRatio.toFixed(2)} />
                <TelemetrySep />
                <TelemetryValue label="T₀" value={`${computed.totalTemperature.toFixed(0)}K`} />
                <TelemetrySep />
                <TelemetryValue label="η_pt" value={`${(computed.totalPressureRecovery * 100).toFixed(1)}%`} />
                <TelemetrySep />
                <TelemetryValue label="F" value={`${computed.thrust.toFixed(1)}kN`} />
            </div>

            {/* Right: Solver info */}
            <div style={{ whiteSpace: 'nowrap', fontSize: '9px', color: 'rgba(106, 196, 255, 0.5)' }}>
                γ=1.4 · RANKINE-HUGONIOT · θ-β-M
            </div>
        </div>
    );
}

function TelemetryValue({ label, value }: { label: string; value: string }) {
    return (
        <span>
            <span style={{ color: 'rgba(106, 196, 255, 0.5)' }}>{label}</span>
            {' '}
            <span style={{ color: '#c0e4fa', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        </span>
    );
}

function TelemetrySep() {
    return <span style={{ color: 'rgba(106, 196, 255, 0.2)' }}>│</span>;
}
