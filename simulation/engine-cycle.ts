/**
 * Brayton Cycle Engine Thermodynamics
 * 
 * Station-by-station analysis:
 * 0: Freestream
 * 1: Post ramp shock (compression)
 * 2: Post cowl shock (further compression)
 * 3: Combustor entry (after isolator)
 * 4: Combustor exit (after heat addition)
 * 5: Nozzle exit (expansion)
 */

import {
    obliqueShockBeta,
    postObliqueShock,
    isentropicTempRatio,
    totalPressureRecovery,
    standardAtmosphere,
} from './compressible';

export interface StationConditions {
    M: number;
    T: number;  // K
    p: number;  // Pa
    rho: number; // kg/m³
}

export interface EnginePerformance {
    stations: StationConditions[];
    thrust: number;           // kN
    specificImpulse: number;  // seconds
    combustorTemperature: number; // K
    exhaustMach: number;
    totalPressureRecoveryVal: number;
    beta1: number;           // deg
    beta2: number;           // deg
    postShock1: { M: number; pRatio: number; TRatio: number; rhoRatio: number };
    postShock2: { M: number; pRatio: number; TRatio: number; rhoRatio: number };
    freestreamTemperature: number;
    totalTemperature: number;
    dynamicPressure: number;  // kPa
}

const R_AIR = 287; // J/(kg·K)
const GAMMA = 1.4;
const CP = GAMMA * R_AIR / (GAMMA - 1); // ~1004.5 J/(kg·K)
const H2_HEAT = 120e6; // J/kg hydrogen heating value

export function braytonCycle(
    M_inf: number,
    altitudeKm: number,
    rampAngleDeg: number,
    cowlAngleDeg: number,
    fuelFlowRate: number // 0-1 normalised
): EnginePerformance {
    // Station 0: Freestream
    const { T: T0, p: p0 } = standardAtmosphere(altitudeKm);
    const rho0 = p0 / (R_AIR * T0);
    const a0 = Math.sqrt(GAMMA * R_AIR * T0);
    const V0 = M_inf * a0;
    const dynamicPressure = 0.5 * rho0 * V0 * V0 / 1000; // kPa

    // Total (stagnation) temperature
    const T0_total = T0 / isentropicTempRatio(M_inf);

    // Station 1: After oblique shock from compression ramp
    const beta1 = obliqueShockBeta(M_inf, rampAngleDeg);
    const shock1 = postObliqueShock(M_inf, beta1, rampAngleDeg);

    const Mn1 = M_inf * Math.sin(beta1 * Math.PI / 180);
    const ptr1 = totalPressureRecovery(Mn1);

    const T1 = T0 * shock1.TRatio;
    const p1 = p0 * shock1.pRatio;
    const rho1 = rho0 * shock1.rhoRatio;

    // Station 2: After cowl shock
    const effectiveCowl = Math.min(cowlAngleDeg, rampAngleDeg * 0.8);
    const beta2 = obliqueShockBeta(shock1.M2, effectiveCowl);
    const shock2 = postObliqueShock(shock1.M2, beta2, effectiveCowl);

    const Mn2 = shock1.M2 * Math.sin(beta2 * Math.PI / 180);
    const ptr2 = totalPressureRecovery(Mn2);

    const T2 = T1 * shock2.TRatio;
    const p2 = p1 * shock2.pRatio;
    const rho2 = rho1 * shock2.rhoRatio;

    // Combined total pressure recovery
    const totalPR = ptr1 * ptr2;

    // Station 3: Combustor entry (isolator — assume ~10% additional losses)
    const M3 = Math.max(shock2.M2 * 0.95, 1.5); // Still supersonic in scramjet
    const T3 = T2 * 1.05; // Slight friction heating
    const p3 = p2 * 0.95;
    const rho3 = p3 / (R_AIR * T3);

    // Station 4: Combustor exit (heat addition)
    // Hydrogen fuel: q = fuelFlowRate * stoichiometric * H2_heating_value
    const fuelAirRatio = fuelFlowRate * 0.029; // stoich for H2 is ~0.029
    const qAdd = fuelAirRatio * H2_HEAT; // J/kg of air

    const T4 = T3 + qAdd / CP;
    const combustorTemp = T4;

    // Rayleigh flow approximation for combustor Mach drop
    const heatRatio = T4 / T3;
    const M4 = Math.max(M3 / Math.sqrt(heatRatio) * 0.85, 0.8);
    const p4 = p3 * (1 + GAMMA * M3 * M3) / (1 + GAMMA * M4 * M4);
    const rho4 = p4 / (R_AIR * T4);

    // Station 5: Nozzle exit (isentropic expansion)
    // Expand to near-freestream pressure
    const expansionRatio = p4 / Math.max(p0, 10);
    const M5 = Math.min(
        Math.sqrt(2 / (GAMMA - 1) * (Math.pow(expansionRatio, (GAMMA - 1) / GAMMA) - 1)),
        M_inf * 1.2 // Can't exceed this in a scramjet
    );
    const exhaustMach = Math.max(M5, 1.5);

    const T5 = T4 * isentropicTempRatio(exhaustMach) / isentropicTempRatio(M4);
    const a5 = Math.sqrt(GAMMA * R_AIR * Math.max(T5, 200));
    const V5 = exhaustMach * a5;

    // Thrust calculation
    // F = mdot * (V5 - V0) + (p5 - p0) * Ae
    const mdot = rho0 * V0 * 0.1; // Capture area ~0.1 m² for this model
    const thrust = Math.max(0, mdot * (V5 - V0) / 1000); // kN

    // Specific impulse
    const mdotFuel = mdot * fuelAirRatio;
    const Isp = mdotFuel > 0 ? (thrust * 1000) / (mdotFuel * 9.81) : 0;

    return {
        stations: [
            { M: M_inf, T: T0, p: p0, rho: rho0 },
            { M: shock1.M2, T: T1, p: p1, rho: rho1 },
            { M: shock2.M2, T: T2, p: p2, rho: rho2 },
            { M: M3, T: T3, p: p3, rho: rho3 },
            { M: M4, T: T4, p: p4, rho: rho4 },
            { M: exhaustMach, T: Math.max(T5, 200), p: p0, rho: p0 / (R_AIR * Math.max(T5, 200)) },
        ],
        thrust,
        specificImpulse: Math.min(Isp, 5000),
        combustorTemperature: combustorTemp,
        exhaustMach,
        totalPressureRecoveryVal: totalPR,
        beta1,
        beta2,
        postShock1: { M: shock1.M2, pRatio: shock1.pRatio, TRatio: shock1.TRatio, rhoRatio: shock1.rhoRatio },
        postShock2: { M: shock2.M2, pRatio: shock2.pRatio, TRatio: shock2.TRatio, rhoRatio: shock2.rhoRatio },
        freestreamTemperature: T0,
        totalTemperature: T0_total,
        dynamicPressure,
    };
}
