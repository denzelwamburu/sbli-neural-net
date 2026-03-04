'use client';

import dynamic from 'next/dynamic';
import { GaugeCluster } from '@/components/ui/GaugeCluster';
import { TelemetryBar } from '@/components/ui/TelemetryBar';
import { FlowModeSelector } from '@/components/ui/FlowModeSelector';
import { CameraPresets } from '@/components/ui/CameraPresets';
import { ControlPanel } from '@/components/ui/ControlPanel';
import { ResearchOverlay } from '@/components/ui/ResearchOverlay';
import { ShockPolar } from '@/components/charts/ShockPolar';
import { ThrustCurve } from '@/components/charts/ThrustCurve';
import { PressureRecoveryChart } from '@/components/charts/PressureRecovery';

// Dynamic import for Three.js scene (no SSR)
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
      background: '#03060c',
      fontFamily: 'var(--font-mono)',
      color: '#4a9aba',
      fontSize: '14px',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '2px solid rgba(106, 196, 255, 0.2)',
          borderTop: '2px solid #6ac4ff',
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

      {/* 3D Scene (full viewport) */}
      <div style={{
        position: 'absolute',
        top: '48px',
        left: 0,
        right: 0,
        bottom: '38px',
      }}>
        <ScramjetScene />
      </div>

      {/* Research Overlay (left side) */}
      <ResearchOverlay />

      {/* Right Panel — Controls + Charts */}
      <div style={{
        position: 'absolute',
        top: '56px',
        right: '12px',
        width: '280px',
        maxHeight: 'calc(100vh - 110px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 20,
        paddingBottom: '8px',
      }}>
        {/* Control Panel */}
        <div className="glass-panel" style={{ padding: '14px' }}>
          <ControlPanel />
        </div>

        {/* Flow Mode */}
        <div className="glass-panel" style={{ padding: '12px' }}>
          <div style={{
            fontSize: '9px',
            fontFamily: 'var(--font-mono)',
            color: 'rgba(106, 196, 255, 0.5)',
            letterSpacing: '1px',
            marginBottom: '8px',
            fontWeight: 700,
          }}>
            FLOW VISUALISATION
          </div>
          <FlowModeSelector />
        </div>

        {/* Camera Presets */}
        <div className="glass-panel" style={{ padding: '12px' }}>
          <div style={{
            fontSize: '9px',
            fontFamily: 'var(--font-mono)',
            color: 'rgba(106, 196, 255, 0.5)',
            letterSpacing: '1px',
            marginBottom: '8px',
            fontWeight: 700,
          }}>
            CAMERA
          </div>
          <CameraPresets />
        </div>

        {/* Gauges */}
        <div className="glass-panel" style={{ padding: '8px 4px' }}>
          <GaugeCluster />
        </div>

        {/* Shock Polar */}
        <div className="glass-panel" style={{ padding: '12px' }}>
          <ShockPolar />
        </div>

        {/* Thrust Curve */}
        <div className="glass-panel" style={{ padding: '12px' }}>
          <ThrustCurve />
        </div>

        {/* Pressure Recovery */}
        <div className="glass-panel" style={{ padding: '12px' }}>
          <PressureRecoveryChart />
        </div>
      </div>

      {/* Telemetry Bar */}
      <TelemetryBar />
    </div>
  );
}
