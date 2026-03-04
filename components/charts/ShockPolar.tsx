'use client';

import { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceDot,
    Area,
    AreaChart,
} from 'recharts';
import { useSimStore } from '@/simulation/store';
import { generateShockPolarData } from '@/simulation/compressible';

export function ShockPolar() {
    const mach = useSimStore((s) => s.mach);
    const rampAngle = useSimStore((s) => s.rampAngle);
    const beta1 = useSimStore((s) => s.computed.beta1);

    const { data, maxTheta } = useMemo(() => {
        return generateShockPolarData(mach);
    }, [mach]);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(106, 196, 255, 0.08)" />
                    <XAxis
                        dataKey="theta"
                        type="number"
                        domain={[0, 50]}
                        tick={{ fill: 'rgba(192, 228, 250, 0.5)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
                        label={{ value: 'θ (deg)', position: 'insideBottom', offset: -2, fill: 'rgba(192, 228, 250, 0.4)', fontSize: 9 }}
                        stroke="rgba(106, 196, 255, 0.15)"
                    />
                    <YAxis
                        domain={[0, 90]}
                        tick={{ fill: 'rgba(192, 228, 250, 0.5)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
                        label={{ value: 'β (deg)', angle: -90, position: 'insideLeft', offset: 10, fill: 'rgba(192, 228, 250, 0.4)', fontSize: 9 }}
                        stroke="rgba(106, 196, 255, 0.15)"
                    />
                    <Tooltip
                        contentStyle={{
                            background: 'rgba(6, 16, 26, 0.95)',
                            border: '1px solid rgba(106, 196, 255, 0.3)',
                            borderRadius: '6px',
                            fontSize: '10px',
                            fontFamily: 'var(--font-mono)',
                            color: '#c0e4fa',
                        }}
                    />
                    {/* Weak shock solution */}
                    <Line
                        type="monotone"
                        dataKey="betaWeak"
                        stroke="#6ac4ff"
                        strokeWidth={2}
                        dot={false}
                        name="Weak"
                    />
                    {/* Strong shock solution */}
                    <Line
                        type="monotone"
                        dataKey="betaStrong"
                        stroke="#ff6a30"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        dot={false}
                        name="Strong"
                    />
                    {/* Current operating point */}
                    <ReferenceDot
                        x={rampAngle}
                        y={beta1}
                        r={5}
                        fill="#00ff88"
                        stroke="#00ff88"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '9px',
                fontFamily: 'var(--font-mono)',
                color: 'rgba(138, 196, 234, 0.5)',
                marginTop: '4px',
                padding: '0 4px',
            }}>
                <span>M∞ = {mach.toFixed(1)}</span>
                <span>θ_max = {maxTheta.toFixed(1)}°</span>
            </div>
        </div>
    );
}
