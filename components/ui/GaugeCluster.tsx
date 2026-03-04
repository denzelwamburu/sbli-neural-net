'use client';

import { useSimStore } from '@/simulation/store';

interface GaugeProps {
    label: string;
    value: number;
    min: number;
    max: number;
    unit: string;
    color: string;
    decimals?: number;
}

function Gauge({ label, value, min, max, unit, color, decimals = 1 }: GaugeProps) {
    const normalized = Math.min(1, Math.max(0, (value - min) / (max - min)));
    const angle = normalized * 270; // 270 degree arc
    const circumference = 2 * Math.PI * 42;
    const arcLength = (angle / 360) * circumference;

    return (
        <div style={{ textAlign: 'center', minWidth: '110px' }}>
            <svg viewBox="0 0 100 100" width="110" height="110">
                {/* Background arc */}
                <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="rgba(106, 196, 255, 0.1)"
                    strokeWidth="6"
                    strokeDasharray={`${(270 / 360) * circumference} ${circumference}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    transform="rotate(135 50 50)"
                />
                {/* Filled arc */}
                <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke={color}
                    strokeWidth="6"
                    strokeDasharray={`${arcLength} ${circumference}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    transform="rotate(135 50 50)"
                    style={{
                        transition: 'stroke-dasharray 300ms ease',
                        filter: `drop-shadow(0 0 6px ${color})`,
                    }}
                />
                {/* Value */}
                <text
                    x="50"
                    y="46"
                    textAnchor="middle"
                    fill="#c0e4fa"
                    fontSize="16"
                    fontFamily="var(--font-mono)"
                    fontWeight="700"
                >
                    {value.toFixed(decimals)}
                </text>
                {/* Unit */}
                <text
                    x="50"
                    y="60"
                    textAnchor="middle"
                    fill="rgba(138, 196, 234, 0.6)"
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                >
                    {unit}
                </text>
            </svg>
            <div style={{
                fontSize: '10px',
                color: 'rgba(138, 196, 234, 0.7)',
                marginTop: '-4px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.5px',
            }}>
                {label}
            </div>
        </div>
    );
}

export function GaugeCluster() {
    const mach = useSimStore((s) => s.mach);
    const computed = useSimStore((s) => s.computed);

    return (
        <div style={{
            display: 'flex',
            gap: '8px',
            padding: '12px 16px',
            flexWrap: 'wrap',
            justifyContent: 'center',
        }}>
            <Gauge
                label="MACH"
                value={mach}
                min={0}
                max={15}
                unit="M∞"
                color="#6ac4ff"
            />
            <Gauge
                label="P. RECOVERY"
                value={computed.totalPressureRecovery * 100}
                min={0}
                max={100}
                unit="%"
                color="#00ff88"
                decimals={1}
            />
            <Gauge
                label="COMB. TEMP"
                value={computed.combustorTemperature}
                min={0}
                max={4000}
                unit="K"
                color="#ff6a30"
                decimals={0}
            />
            <Gauge
                label="ISP"
                value={computed.specificImpulse}
                min={0}
                max={5000}
                unit="s"
                color="#aa66ff"
                decimals={0}
            />
        </div>
    );
}
