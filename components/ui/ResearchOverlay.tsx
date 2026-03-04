'use client';

import { useSimStore } from '@/simulation/store';

/**
 * Research context overlay — positioned in the UI (not 3D) as informational cards.
 * Links the visual demo to the PhD research questions.
 */
export function ResearchOverlay() {
    const showAnnotations = useSimStore((s) => s.showAnnotations);
    const mach = useSimStore((s) => s.mach);
    const rampAngle = useSimStore((s) => s.rampAngle);
    const computed = useSimStore((s) => s.computed);

    if (!showAnnotations) return null;

    const uncertainty = (0.1 + (mach - 4) * 0.05 + (rampAngle - 5) * 0.02);
    const isHighUncertainty = uncertainty > 0.4;

    return (
        <div style={{
            position: 'absolute',
            top: '60px',
            left: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            zIndex: 20,
            maxWidth: '280px',
        }}>
            {/* Research header */}
            <div className="glass-panel" style={{
                padding: '12px 14px',
                borderLeft: '3px solid #ff6a30',
            }}>
                <div style={{
                    fontSize: '9px',
                    fontFamily: 'var(--font-mono)',
                    color: '#ff6a30',
                    letterSpacing: '1px',
                    marginBottom: '6px',
                    fontWeight: 700,
                }}>
                    PhD RESEARCH CONTEXT
                </div>
                <div style={{
                    fontSize: '11px',
                    color: '#c0e4fa',
                    lineHeight: 1.4,
                    marginBottom: '8px',
                }}>
                    Discontinuity-Aware Neural Operators for Multi-Fidelity SBLI Prediction
                </div>
                <div style={{
                    fontSize: '10px',
                    color: 'rgba(138, 196, 234, 0.6)',
                    lineHeight: 1.4,
                }}>
                    Can a neural operator predict separation onset at the SBLI region with calibrated uncertainty?
                </div>
            </div>

            {/* SBLI Card */}
            <div className="glass-panel-accent" style={{
                padding: '10px 12px',
                borderColor: isHighUncertainty ? 'rgba(255, 68, 102, 0.4)' : undefined,
            }}>
                <div style={{
                    fontSize: '9px',
                    fontFamily: 'var(--font-mono)',
                    color: '#ff4466',
                    letterSpacing: '1px',
                    marginBottom: '4px',
                    fontWeight: 700,
                }}>
                    ⚡ SBLI INTERACTION
                </div>
                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: '#c0e4fa',
                    marginBottom: '4px',
                }}>
                    Ensemble σ(ξ*) = <span style={{ color: isHighUncertainty ? '#ff4466' : '#00ff88', fontWeight: 700 }}>
                        {uncertainty.toFixed(3)}
                    </span>
                </div>
                {isHighUncertainty && (
                    <div style={{
                        padding: '4px 8px',
                        background: 'rgba(255, 68, 102, 0.15)',
                        border: '1px solid rgba(255, 68, 102, 0.4)',
                        borderRadius: '4px',
                        fontSize: '9px',
                        fontFamily: 'var(--font-mono)',
                        color: '#ff4466',
                        fontWeight: 700,
                        marginTop: '4px',
                    }}>
                        🔴 ACTIVE LEARNING: LES recommended
                    </div>
                )}
            </div>

            {/* CST Params Card */}
            <div className="glass-panel" style={{
                padding: '10px 12px',
                borderLeft: '3px solid #4a9aba',
            }}>
                <div style={{
                    fontSize: '9px',
                    fontFamily: 'var(--font-mono)',
                    color: '#4a9aba',
                    letterSpacing: '1px',
                    marginBottom: '4px',
                    fontWeight: 700,
                }}>
                    CST PARAMETERISATION
                </div>
                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'rgba(192, 228, 250, 0.7)',
                    lineHeight: 1.6,
                }}>
                    d ≈ 8–12 parameters<br />
                    θ_ramp = {rampAngle.toFixed(1)}° · M∞ = {mach.toFixed(1)}<br />
                    q∞ = {computed.dynamicPressure.toFixed(1)} kPa
                </div>
            </div>

            {/* Validation Card */}
            <div className="glass-panel" style={{
                padding: '10px 12px',
                borderLeft: '3px solid #00ff88',
            }}>
                <div style={{
                    fontSize: '9px',
                    fontFamily: 'var(--font-mono)',
                    color: '#00ff88',
                    letterSpacing: '1px',
                    marginBottom: '4px',
                    fontWeight: 700,
                }}>
                    VALIDATION TARGET
                </div>
                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'rgba(192, 228, 250, 0.7)',
                    lineHeight: 1.6,
                }}>
                    HyShot / CUBRC experimental data<br />
                    <span style={{ color: 'rgba(106, 196, 255, 0.5)' }}>Mach 5–12 intake characterisation</span>
                </div>
            </div>
        </div>
    );
}
