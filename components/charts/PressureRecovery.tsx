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
    Legend,
} from 'recharts';
import { useSimStore } from '@/simulation/store';
import { obliqueShockBeta, totalPressureRecovery } from '@/simulation/compressible';

const MACH_VALUES = [5, 7, 10, 12];
const MACH_COLORS: Record<number, string> = {
    5: '#6ac4ff',
    7: '#00ff88',
    10: '#ff9944',
    12: '#ff4466',
};

export function PressureRecoveryChart() {
    const mach = useSimStore((s) => s.mach);
    const rampAngle = useSimStore((s) => s.rampAngle);
    const ptr = useSimStore((s) => s.computed.totalPressureRecovery);

    const data = useMemo(() => {
        const points = [];
        for (let angle = 5; angle <= 25; angle += 0.5) {
            const point: Record<string, number> = { angle };
            for (const m of MACH_VALUES) {
                try {
                    const beta = obliqueShockBeta(m, angle);
                    const Mn1 = m * Math.sin(beta * Math.PI / 180);
                    const recovery = totalPressureRecovery(Mn1) * 100;
                    point[`M${m}`] = parseFloat(recovery.toFixed(2));
                } catch {
                    point[`M${m}`] = 0;
                }
            }
            points.push(point);
        }
        return points;
    }, []);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height="90%">
                <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(106, 196, 255, 0.08)" />
                    <XAxis
                        dataKey="angle"
                        type="number"
                        domain={[5, 25]}
                        tick={{ fill: 'rgba(192, 228, 250, 0.5)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
                        label={{ value: 'θ (deg)', position: 'insideBottom', offset: -2, fill: 'rgba(192, 228, 250, 0.4)', fontSize: 9 }}
                        stroke="rgba(106, 196, 255, 0.15)"
                    />
                    <YAxis
                        domain={[0, 100]}
                        tick={{ fill: 'rgba(192, 228, 250, 0.5)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
                        label={{ value: 'η_pt (%)', angle: -90, position: 'insideLeft', offset: 10, fill: 'rgba(192, 228, 250, 0.4)', fontSize: 9 }}
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
                    {MACH_VALUES.map((m) => (
                        <Line
                            key={m}
                            type="monotone"
                            dataKey={`M${m}`}
                            stroke={MACH_COLORS[m]}
                            strokeWidth={m === Math.round(mach) ? 2.5 : 1.5}
                            strokeOpacity={m === Math.round(mach) ? 1 : 0.5}
                            dot={false}
                            name={`M=${m}`}
                        />
                    ))}
                    <ReferenceDot
                        x={rampAngle}
                        y={ptr * 100}
                        r={5}
                        fill="#00ff88"
                        stroke="#ffffff"
                        strokeWidth={2}
                    />
                    <Legend
                        wrapperStyle={{
                            fontSize: '9px',
                            fontFamily: 'var(--font-mono)',
                        }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
