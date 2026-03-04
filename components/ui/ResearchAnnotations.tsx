'use client';

import { useSimStore } from '@/simulation/store';

/**
 * Research annotation cards — SBLI Interaction, CST Parameterisation, Validation Target.
 * Positioned as a horizontal strip above the telemetry bar.
 */
export function ResearchAnnotations() {
    const showAnnotations = useSimStore((s) => s.showAnnotations);
    const mach = useSimStore((s) => s.mach);
    const rampAngle = useSimStore((s) => s.rampAngle);
    const computed = useSimStore((s) => s.computed);

    if (!showAnnotations) return null;

    const uncertainty = (0.1 + (mach - 4) * 0.05 + (rampAngle - 5) * 0.02);
    const isHighUncertainty = uncertainty > 0.4;

    return (
        <div style={{
            position: 'fixed',
            bottom: '38px',
            left: 0,
            right: 0,
            height: '52px',
            background: 'rgba(3, 6, 12, 0.88)',
            backdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(106, 196, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '0 16px',
            zIndex: 40,
        }}>
            {/* SBLI Interaction */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 12px',
                background: isHighUncertainty ? 'rgba(255, 68, 102, 0.08)' : 'rgba(106, 196, 255, 0.04)',
                border: `1px solid ${isHighUncertainty ? 'rgba(255, 68, 102, 0.3)' : 'rgba(106, 196, 255, 0.12)'}`,
                borderRadius: '6px',
            }}>
                <div style={{
                    fontSize: '9px',
                    fontFamily: 'var(--font-mono)',
                    color: '#ff4466',
                    letterSpacing: '1px',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                }}>
                    ⚡ SBLI INTERACTION
                </div>
                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: '#c0e4fa',
                }}>
                    σ(ξ*) = <span style={{ color: isHighUncertainty ? '#ff4466' : '#00ff88', fontWeight: 700 }}>
                        {uncertainty.toFixed(3)}
                    </span>
                </div>
                {isHighUncertainty && (
                    <div style={{
                        padding: '2px 6px',
                        background: 'rgba(255, 68, 102, 0.15)',
                        border: '1px solid rgba(255, 68, 102, 0.4)',
                        borderRadius: '3px',
                        fontSize: '8px',
                        fontFamily: 'var(--font-mono)',
                        color: '#ff4466',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                    }}>
                        🔴 ACTIVE LEARNING: LES
                    </div>
                )}
            </div>

            {/* CST Parameterisation */}
            <div style={{
                flex: 1,
                padding: '6px 12px',
                background: 'rgba(106, 196, 255, 0.04)',
                border: '1px solid rgba(74, 154, 186, 0.2)',
                borderRadius: '6px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        fontSize: '9px',
                        fontFamily: 'var(--font-mono)',
                        color: '#4a9aba',
                        letterSpacing: '1px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                    }}>
                        CST PARAMETERISATION
                    </div>
                    <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: 'rgba(192, 228, 250, 0.7)',
                        whiteSpace: 'nowrap',
                    }}>
                        d ≈ 8–12 · θ = {rampAngle.toFixed(1)}° · M∞ = {mach.toFixed(1)} · q∞ = {computed.dynamicPressure.toFixed(1)} kPa
                    </div>
                </div>
            </div>

            {/* Validation Target */}
            <div style={{
                flex: 1,
                padding: '6px 12px',
                background: 'rgba(106, 196, 255, 0.04)',
                border: '1px solid rgba(0, 255, 136, 0.15)',
                borderRadius: '6px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        fontSize: '9px',
                        fontFamily: 'var(--font-mono)',
                        color: '#00ff88',
                        letterSpacing: '1px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                    }}>
                        VALIDATION TARGET
                    </div>
                    <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: 'rgba(192, 228, 250, 0.7)',
                        whiteSpace: 'nowrap',
                    }}>
                        HyShot / CUBRC · <span style={{ color: 'rgba(106, 196, 255, 0.5)' }}>Mach 5–12 intake</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
