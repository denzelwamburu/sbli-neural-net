/**
 * Zustand Simulation Store
 * Single source of truth for all simulation state.
 * 3D scene reads via getState() in useFrame (non-reactive).
 * UI reads via selectors.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { braytonCycle, type EnginePerformance } from './engine-cycle';

export type ColorMode = 'mach' | 'pressure' | 'temperature' | 'schlieren';
export type CameraPreset = 'full' | 'intake' | 'combustor' | 'exhaust' | 'free';

interface ComputedState {
    beta1: number;
    beta2: number;
    postShock1: { M: number; pRatio: number; TRatio: number; rhoRatio: number };
    postShock2: { M: number; pRatio: number; TRatio: number; rhoRatio: number };
    totalPressureRecovery: number;
    combustorTemperature: number;
    exhaustMach: number;
    thrust: number;
    specificImpulse: number;
    freestreamTemperature: number;
    totalTemperature: number;
    dynamicPressure: number;
}

export interface SimulationStore {
    // Input parameters
    mach: number;
    rampAngle: number;
    cowlAngle: number;
    altitude: number;
    fuelFlowRate: number;

    // Computed physics
    computed: ComputedState;

    // Visualisation flags
    colorMode: ColorMode;
    showShockWaves: boolean;
    showFlowParticles: boolean;
    showBoundaryLayer: boolean;
    showMachDiamonds: boolean;
    showSBLIRegion: boolean;
    showAnnotations: boolean;
    wireframe: boolean;
    cameraPreset: CameraPreset;

    // Actions
    setMach: (v: number) => void;
    setRampAngle: (v: number) => void;
    setCowlAngle: (v: number) => void;
    setAltitude: (v: number) => void;
    setFuelFlowRate: (v: number) => void;
    setColorMode: (mode: ColorMode) => void;
    setCameraPreset: (preset: CameraPreset) => void;
    toggleShockWaves: () => void;
    toggleFlowParticles: () => void;
    toggleBoundaryLayer: () => void;
    toggleMachDiamonds: () => void;
    toggleSBLIRegion: () => void;
    toggleAnnotations: () => void;
    toggleWireframe: () => void;
    recompute: () => void;
}

function computePhysics(mach: number, rampAngle: number, cowlAngle: number, altitude: number, fuelFlowRate: number): ComputedState {
    const result: EnginePerformance = braytonCycle(mach, altitude, rampAngle, cowlAngle, fuelFlowRate);

    return {
        beta1: result.beta1,
        beta2: result.beta2,
        postShock1: result.postShock1,
        postShock2: result.postShock2,
        totalPressureRecovery: result.totalPressureRecoveryVal,
        combustorTemperature: result.combustorTemperature,
        exhaustMach: result.exhaustMach,
        thrust: result.thrust,
        specificImpulse: result.specificImpulse,
        freestreamTemperature: result.freestreamTemperature,
        totalTemperature: result.totalTemperature,
        dynamicPressure: result.dynamicPressure,
    };
}

const initialMach = 7;
const initialRamp = 12;
const initialCowl = 5;
const initialAlt = 30;
const initialFuel = 0.5;

export const useSimStore = create<SimulationStore>()(
    subscribeWithSelector((set, get) => ({
        mach: initialMach,
        rampAngle: initialRamp,
        cowlAngle: initialCowl,
        altitude: initialAlt,
        fuelFlowRate: initialFuel,

        computed: computePhysics(initialMach, initialRamp, initialCowl, initialAlt, initialFuel),

        colorMode: 'mach',
        showShockWaves: true,
        showFlowParticles: true,
        showBoundaryLayer: true,
        showMachDiamonds: true,
        showSBLIRegion: true,
        showAnnotations: true,
        wireframe: true,
        cameraPreset: 'full',

        setMach: (v) => { set({ mach: v }); get().recompute(); },
        setRampAngle: (v) => { set({ rampAngle: v }); get().recompute(); },
        setCowlAngle: (v) => { set({ cowlAngle: v }); get().recompute(); },
        setAltitude: (v) => { set({ altitude: v }); get().recompute(); },
        setFuelFlowRate: (v) => { set({ fuelFlowRate: v }); get().recompute(); },
        setColorMode: (mode) => set({ colorMode: mode }),
        setCameraPreset: (preset) => set({ cameraPreset: preset }),
        toggleShockWaves: () => set((s) => ({ showShockWaves: !s.showShockWaves })),
        toggleFlowParticles: () => set((s) => ({ showFlowParticles: !s.showFlowParticles })),
        toggleBoundaryLayer: () => set((s) => ({ showBoundaryLayer: !s.showBoundaryLayer })),
        toggleMachDiamonds: () => set((s) => ({ showMachDiamonds: !s.showMachDiamonds })),
        toggleSBLIRegion: () => set((s) => ({ showSBLIRegion: !s.showSBLIRegion })),
        toggleAnnotations: () => set((s) => ({ showAnnotations: !s.showAnnotations })),
        toggleWireframe: () => set((s) => ({ wireframe: !s.wireframe })),

        recompute: () => {
            const { mach, rampAngle, cowlAngle, altitude, fuelFlowRate } = get();
            const computed = computePhysics(mach, rampAngle, cowlAngle, altitude, fuelFlowRate);
            set({ computed });
        },
    }))
);
