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
} from 'recharts';
import { useSimStore } from '@/simulation/store';
import { braytonCycle } from '@/simulation/engine-cycle';

export function ThrustCurve() {
    const mach = useSimStore((s) => s.mach);
    const altitude = useSimStore((s) => s.altitude);
    const rampAngle = useSimStore((s) => s.rampAngle);
    const cowlAngle = useSimStore((s) => s.cowlAngle);
    const fuelFlowRate = useSimStore((s) => s.fuelFlowRate);
    const thrust = useSimStore((s) => s.computed.thrust);
    const isp = useSimStore((s) => s.computed.specificImpulse);

    const data = useMemo(() => {
        const points = [];
        for (let m = 4; m <= 12; m += 0.5) {
            try {
                const result = braytonCycle(m, altitude, rampAngle, cowlAngle, fuelFlowRate);
                points.push({
                    mach: m,
                    thrust: parseFloat(result.thrust.toFixed(2)),
                    isp: parseFloat(Math.min(result.specificImpulse, 5000).toFixed(0)),
                });
            } catch {
                points.push({ mach: m, thrust: 0, isp: 0 });
            }
        }
        return points;
    }, [altitude, rampAngle, cowlAngle, fuelFlowRate]);

    return (
        <div>
            <div style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                color: 'rgba(106, 196, 255, 0.5)',
                letterSpacing: '1px',
                marginBottom: '6px',
                fontWeight: 700,
            }}>
                THRUST & ISP vs MACH
            </div>
            <ResponsiveContainer width="100%" height={160}>
                <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(106, 196, 255, 0.08)" />
                    <XAxis
                        dataKey="mach"
                        type="number"
                        domain={[4, 12]}
                        tick={{ fill: 'rgba(192, 228, 250, 0.5)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
                        label={{ value: 'M∞', position: 'insideBottom', offset: -2, fill: 'rgba(192, 228, 250, 0.4)', fontSize: 9 }}
                        stroke="rgba(106, 196, 255, 0.15)"
                    />
                    <YAxis
                        yAxisId="thrust"
                        tick={{ fill: 'rgba(0, 255, 136, 0.5)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
                        label={{ value: 'F (kN)', angle: -90, position: 'insideLeft', offset: 10, fill: 'rgba(0, 255, 136, 0.4)', fontSize: 9 }}
                        stroke="rgba(106, 196, 255, 0.15)"
                    />
                    <YAxis
                        yAxisId="isp"
                        orientation="right"
                        tick={{ fill: 'rgba(170, 102, 255, 0.5)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
                        label={{ value: 'Isp (s)', angle: 90, position: 'insideRight', offset: 10, fill: 'rgba(170, 102, 255, 0.4)', fontSize: 9 }}
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
                    <Line
                        yAxisId="thrust"
                        type="monotone"
                        dataKey="thrust"
                        stroke="#00ff88"
                        strokeWidth={2}
                        dot={false}
                        name="Thrust (kN)"
                    />
                    <Line
                        yAxisId="isp"
                        type="monotone"
                        dataKey="isp"
                        stroke="#aa66ff"
                        strokeWidth={1.5}
                        strokeDasharray="6 3"
                        dot={false}
                        name="Isp (s)"
                    />
                    <ReferenceDot
                        xAxisId={0}
                        yAxisId="thrust"
                        x={mach}
                        y={thrust}
                        r={5}
                        fill="#00ff88"
                        stroke="#00ff88"
                        strokeWidth={2}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
