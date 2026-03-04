'use client';

import dynamic from 'next/dynamic';
import { GaugeCluster } from '@/components/ui/GaugeCluster';
import { TelemetryBar } from '@/components/ui/TelemetryBar';
import { FlowModeSelector } from '@/components/ui/FlowModeSelector';
import { CameraPresets } from '@/components/ui/CameraPresets';
import { ControlPanel } from '@/components/ui/ControlPanel';
import { ResearchAnnotations } from '@/components/ui/ResearchAnnotations';
import { ShockPolar } from '@/components/charts/ShockPolar';
import { ThrustCurve } from '@/components/charts/ThrustCurve';
import { PressureRecoveryChart } from '@/components/charts/PressureRecovery';

const ScramjetScene = dynamic(
  () => import('@/components/scene/ScramjetScene').then((mod) => ({ default: mod.ScramjetScene })),
  { ssr: false, loading: () => <SceneLoader /> }
);

function SceneLoader() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#e0e2e5',
      fontFamily: 'var(--font-mono)',
      color: '#5a7a9a',
      fontSize: '14px',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '2px solid rgba(90, 122, 154, 0.3)',
          borderTop: '2px solid #5a7a9a',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px',
        }} />
        INITIALISING SCRAMJET DIGITAL TWIN...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

function ChartLabel({ number, title }: { number: number; title: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '4px',
    }}>
      <span style={{
        width: '18px',
        height: '18px',
        borderRadius: '4px',
        background: 'rgba(106, 196, 255, 0.12)',
        border: '1px solid rgba(106, 196, 255, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        color: '#6ac4ff',
        flexShrink: 0,
      }}>
        {number}
      </span>
      <span style={{
        fontSize: '10px',
        fontFamily: 'var(--font-mono)',
        color: 'rgba(106, 196, 255, 0.5)',
        letterSpacing: '1px',
        fontWeight: 700,
      }}>
        {title}
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#03060c',
      position: 'relative',
    }}>
      {/* Header Bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '48px',
        background: 'rgba(3, 6, 12, 0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(106, 196, 255, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 30,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            fontWeight: 700,
            color: '#c0e4fa',
            letterSpacing: '1px',
          }}>
            <span style={{ color: '#ff6a30' }}>◆</span> SCRAMJET DIGITAL TWIN
          </div>
          <div style={{
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            color: 'rgba(106, 196, 255, 0.4)',
            padding: '2px 8px',
            border: '1px solid rgba(106, 196, 255, 0.15)',
            borderRadius: '4px',
          }}>
            v0.1.0 · SPRINT 1
          </div>
        </div>
        <div style={{
          fontSize: '10px',
          fontFamily: 'var(--font-mono)',
          color: 'rgba(138, 196, 234, 0.5)',
        }}>
          DISCONTINUITY-AWARE NEURAL OPERATORS FOR SBLI PREDICTION
        </div>
      </div>

      {/* 3D Scene — center area */}
      <div style={{
        position: 'absolute',
        top: '48px',
        left: '310px',
        right: '290px',
        bottom: '90px',
      }}>
        <ScramjetScene />
      </div>

      {/* LEFT PANEL — Research Context + Charts */}
      <div style={{
        position: 'absolute',
        top: '48px',
        left: 0,
        width: '310px',
        bottom: '90px',
        background: 'rgba(3, 6, 12, 0.85)',
        backdropFilter: 'blur(12px)',
        borderRight: '1px solid rgba(106, 196, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 20,
        overflow: 'hidden',
      }}>
        {/* Research Context — compact header */}
        <div style={{
          padding: '10px 12px',
          borderBottom: '1px solid rgba(106, 196, 255, 0.08)',
          flexShrink: 0,
        }}>
          <div style={{
            fontSize: '9px',
            fontFamily: 'var(--font-mono)',
            color: '#ff6a30',
            letterSpacing: '1px',
            fontWeight: 700,
            marginBottom: '4px',
          }}>
            PhD RESEARCH CONTEXT
          </div>
          <div style={{
            fontSize: '10px',
            color: '#c0e4fa',
            lineHeight: 1.4,
          }}>
            Discontinuity-Aware Neural Operators for Multi-Fidelity SBLI Prediction
          </div>
        </div>

        {/* Charts — evenly distributed */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '8px 10px',
          gap: '6px',
          overflow: 'hidden',
        }}>
          <div className="glass-panel-accent" style={{ flex: 1, padding: '8px 10px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <ChartLabel number={1} title="θ-β-M SHOCK POLAR" />
            <div style={{ flex: 1, minHeight: 0 }}>
              <ShockPolar />
            </div>
          </div>

          <div className="glass-panel-accent" style={{ flex: 1, padding: '8px 10px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <ChartLabel number={2} title="THRUST & ISP vs MACH" />
            <div style={{ flex: 1, minHeight: 0 }}>
              <ThrustCurve />
            </div>
          </div>

          <div className="glass-panel-accent" style={{ flex: 1, padding: '8px 10px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <ChartLabel number={3} title="PRESSURE RECOVERY vs RAMP ANGLE" />
            <div style={{ flex: 1, minHeight: 0 }}>
              <PressureRecoveryChart />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — Controls + Gauges */}
      <div style={{
        position: 'absolute',
        top: '48px',
        right: 0,
        width: '290px',
        bottom: '90px',
        background: 'rgba(3, 6, 12, 0.85)',
        backdropFilter: 'blur(12px)',
        borderLeft: '1px solid rgba(106, 196, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '10px 12px',
        zIndex: 20,
        overflow: 'hidden',
      }}>
        <div className="glass-panel-accent" style={{ padding: '12px', flexShrink: 0 }}>
          <ControlPanel />
        </div>

        <div className="glass-panel-accent" style={{ padding: '10px', flexShrink: 0 }}>
          <div style={{
            fontSize: '9px',
            fontFamily: 'var(--font-mono)',
            color: 'rgba(106, 196, 255, 0.5)',
            letterSpacing: '1px',
            marginBottom: '6px',
            fontWeight: 700,
          }}>
            FLOW VISUALISATION
          </div>
          <FlowModeSelector />
        </div>

        <div className="glass-panel-accent" style={{ padding: '10px', flexShrink: 0 }}>
          <div style={{
            fontSize: '9px',
            fontFamily: 'var(--font-mono)',
            color: 'rgba(106, 196, 255, 0.5)',
            letterSpacing: '1px',
            marginBottom: '6px',
            fontWeight: 700,
          }}>
            CAMERA
          </div>
          <CameraPresets />
        </div>

        {/* Gauges — 2×2 grid fills remaining space */}
        <div className="glass-panel-accent" style={{ padding: '4px', flex: 1, display: 'flex', alignItems: 'center' }}>
          <GaugeCluster />
        </div>
      </div>

      {/* Research Annotations — horizontal strip above telemetry */}
      <ResearchAnnotations />

      {/* Telemetry Bar */}
      <TelemetryBar />
    </div>
  );
}
