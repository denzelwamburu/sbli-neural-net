/**
 * Compressible Flow Relations
 * 
 * Implements oblique shock, normal shock, isentropic, and expansion relations
 * for calorically perfect gas (γ = 1.4 default).
 * 
 * All angles in DEGREES for public API, radians internally.
 * A physicist WILL check these equations.
 */

const DEFAULT_GAMMA = 1.4;

function toRad(deg: number): number { return deg * Math.PI / 180; }
function toDeg(rad: number): number { return rad * 180 / Math.PI; }

/**
 * Normal shock ratios (Rankine-Hugoniot jump conditions)
 * Given upstream normal Mach number Mn1
 */
export function normalShockRatios(Mn1: number, gamma: number = DEFAULT_GAMMA) {
    const g = gamma;
    const Mn1sq = Mn1 * Mn1;

    const pRatio = 1 + 2 * g * (Mn1sq - 1) / (g + 1);
    const rhoRatio = (g + 1) * Mn1sq / ((g - 1) * Mn1sq + 2);
    const TRatio = pRatio / rhoRatio;
    const Mn2sq = ((g - 1) * Mn1sq + 2) / (2 * g * Mn1sq - (g - 1));
    const M2 = Math.sqrt(Math.max(Mn2sq, 0.01));

    return { pRatio, rhoRatio, TRatio, M2 };
}

/**
 * Oblique shock β angle solver (Newton-Raphson)
 * Solves θ-β-M relation for the WEAK shock solution.
 * 
 * tan(θ) = 2·cot(β) · [M²sin²(β) - 1] / [M²(γ + cos(2β)) + 2]
 */
export function obliqueShockBeta(M: number, thetaDeg: number, gamma: number = DEFAULT_GAMMA): number {
    const g = gamma;
    const theta = toRad(thetaDeg);

    if (thetaDeg <= 0) return toDeg(Math.asin(1 / M)); // Mach angle

    // Check if theta exceeds max deflection
    const thetaMax = maxDeflectionAngle(M, gamma);
    if (thetaDeg >= thetaMax) {
        return 90; // Detached shock (normal shock)
    }

    // Newton-Raphson on f(β) = tan(θ) - 2·cot(β)·[M²sin²(β)-1] / [M²(γ+cos(2β))+2]
    const Msq = M * M;
    const tanTheta = Math.tan(theta);

    // Initial guess: Mach angle + small offset (weak solution)
    let beta = Math.asin(1 / M) + theta * 0.5;

    for (let i = 0; i < 50; i++) {
        const sinB = Math.sin(beta);
        const cosB = Math.cos(beta);
        const sin2B = sinB * sinB;
        const tanB = sinB / cosB;

        const num = Msq * sin2B - 1;
        const den = Msq * (g + Math.cos(2 * beta)) + 2;

        const f = tanTheta - 2 * (cosB / sinB) * num / den;

        // Numerical derivative
        const db = 1e-6;
        const sinBp = Math.sin(beta + db);
        const cosBp = Math.cos(beta + db);
        const sin2Bp = sinBp * sinBp;
        const nump = Msq * sin2Bp - 1;
        const denp = Msq * (g + Math.cos(2 * (beta + db))) + 2;
        const fp = tanTheta - 2 * (cosBp / sinBp) * nump / denp;

        const dfdBeta = (fp - f) / db;

        if (Math.abs(dfdBeta) < 1e-12) break;

        const betaNew = beta - f / dfdBeta;

        if (Math.abs(betaNew - beta) < 1e-8) {
            beta = betaNew;
            break;
        }
        beta = betaNew;

        // Keep in valid range
        beta = Math.max(Math.asin(1 / M), Math.min(Math.PI / 2, beta));
    }

    return toDeg(beta);
}

/**
 * Post oblique shock conditions
 * Given freestream M, shock angle β, deflection angle θ
 */
export function postObliqueShock(M: number, betaDeg: number, thetaDeg: number, gamma: number = DEFAULT_GAMMA) {
    const beta = toRad(betaDeg);
    const theta = toRad(thetaDeg);

    // Normal component of upstream Mach
    const Mn1 = M * Math.sin(beta);

    const { pRatio, rhoRatio, TRatio, M2: Mn2 } = normalShockRatios(Mn1, gamma);

    // Downstream Mach number
    const M2 = Mn2 / Math.sin(beta - theta);

    return { M2: Math.max(M2, 0.1), pRatio, TRatio, rhoRatio };
}

/**
 * Isentropic temperature ratio T/T0
 * T/T₀ = [1 + (γ-1)/2 · M²]⁻¹
 */
export function isentropicTempRatio(M: number, gamma: number = DEFAULT_GAMMA): number {
    return 1 / (1 + (gamma - 1) / 2 * M * M);
}

/**
 * Isentropic pressure ratio p/p0
 * p/p₀ = [1 + (γ-1)/2 · M²]^(-γ/(γ-1))
 */
export function isentropicPressureRatio(M: number, gamma: number = DEFAULT_GAMMA): number {
    return Math.pow(1 + (gamma - 1) / 2 * M * M, -gamma / (gamma - 1));
}

/**
 * Total pressure recovery across oblique shock
 * p₀₂/p₀₁ using Rayleigh Pitot formula
 */
export function totalPressureRecovery(Mn1: number, gamma: number = DEFAULT_GAMMA): number {
    const g = gamma;
    const Mn1sq = Mn1 * Mn1;

    if (Mn1 <= 1.0) return 1.0;

    const term1 = Math.pow(
        (g + 1) * Mn1sq / ((g - 1) * Mn1sq + 2),
        g / (g - 1)
    );
    const term2 = Math.pow(
        (g + 1) / (2 * g * Mn1sq - (g - 1)),
        1 / (g - 1)
    );

    return Math.max(0, Math.min(1, term1 * term2));
}

/**
 * Prandtl-Meyer angle ν(M)
 * ν(M) = sqrt((γ+1)/(γ-1)) · arctan(sqrt((γ-1)(M²-1)/(γ+1))) - arctan(sqrt(M²-1))
 */
export function prandtlMeyerAngle(M: number, gamma: number = DEFAULT_GAMMA): number {
    if (M <= 1.0) return 0;

    const g = gamma;
    const Msq = M * M;
    const term = Math.sqrt((g - 1) * (Msq - 1) / (g + 1));

    const nu = Math.sqrt((g + 1) / (g - 1)) * Math.atan(term) - Math.atan(Math.sqrt(Msq - 1));
    return toDeg(nu);
}

/**
 * Maximum deflection angle before shock detachment
 * Solved numerically by finding θ that maximizes the θ-β-M relation
 */
export function maxDeflectionAngle(M: number, gamma: number = DEFAULT_GAMMA): number {
    const g = gamma;
    const Msq = M * M;

    // Search for maximum θ
    let maxTheta = 0;

    const machAngle = Math.asin(1 / M);

    for (let beta = machAngle + 0.001; beta < Math.PI / 2; beta += 0.001) {
        const sinB = Math.sin(beta);
        const cosB = Math.cos(beta);
        const sin2B = sinB * sinB;

        const num = Msq * sin2B - 1;
        const den = Msq * (g + Math.cos(2 * beta)) + 2;

        if (den === 0) continue;

        const tanTheta = 2 * (cosB / sinB) * num / den;
        const theta = Math.atan(tanTheta);

        if (theta > maxTheta) {
            maxTheta = theta;
        }
    }

    return toDeg(maxTheta);
}

/**
 * Atmospheric model — standard atmosphere
 * Returns temperature (K) and pressure (Pa) at given altitude (km)
 */
export function standardAtmosphere(altitudeKm: number) {
    // Simplified model for stratosphere/mesosphere (20-50 km)
    let T: number, p: number;

    if (altitudeKm <= 25) {
        // Lower stratosphere: isothermal at ~216.65 K
        T = 216.65;
        p = 2549.2 * Math.exp(-0.000157 * (altitudeKm - 20) * 1000);
    } else if (altitudeKm <= 47) {
        // Upper stratosphere: T increases
        T = 216.65 + (altitudeKm - 25) * 2.8; // ~2.8 K/km lapse rate
        p = 2549.2 * Math.exp(-0.000157 * (altitudeKm - 20) * 1000);
    } else {
        T = 270.65;
        p = 79.78;
    }

    return { T, p };
}

/**
 * Generate shock polar data for plotting
 * Returns array of {theta, betaWeak, betaStrong} for a given Mach number
 */
export function generateShockPolarData(M: number, gamma: number = DEFAULT_GAMMA) {
    const g = gamma;
    const Msq = M * M;
    const machAngle = Math.asin(1 / M);
    const data: { theta: number; betaWeak: number; betaStrong: number }[] = [];

    // Sweep beta from Mach angle to 90 degrees
    const betas: number[] = [];
    for (let beta = machAngle + 0.01; beta < Math.PI / 2 - 0.01; beta += 0.005) {
        betas.push(beta);
    }

    // Calculate theta for each beta
    const pairs: { theta: number; beta: number }[] = [];
    for (const beta of betas) {
        const sinB = Math.sin(beta);
        const cosB = Math.cos(beta);
        const num = Msq * sinB * sinB - 1;
        const den = Msq * (g + Math.cos(2 * beta)) + 2;

        if (den <= 0) continue;

        const tanTheta = 2 * (cosB / sinB) * num / den;
        if (tanTheta < 0) continue;

        const theta = toDeg(Math.atan(tanTheta));
        pairs.push({ theta, beta: toDeg(beta) });
    }

    // Find max theta for splitting weak/strong
    let maxTheta = 0;
    let maxIdx = 0;
    for (let i = 0; i < pairs.length; i++) {
        if (pairs[i].theta > maxTheta) {
            maxTheta = pairs[i].theta;
            maxIdx = i;
        }
    }

    // Weak solutions: indices 0 to maxIdx
    // Strong solutions: indices maxIdx to end
    // Group by theta
    const thetaMap = new Map<number, { weak: number; strong: number }>();

    for (let i = 0; i <= maxIdx; i++) {
        const thetaRounded = Math.round(pairs[i].theta * 10) / 10;
        if (!thetaMap.has(thetaRounded)) {
            thetaMap.set(thetaRounded, { weak: pairs[i].beta, strong: 90 });
        } else {
            thetaMap.get(thetaRounded)!.weak = pairs[i].beta;
        }
    }

    for (let i = maxIdx; i < pairs.length; i++) {
        const thetaRounded = Math.round(pairs[i].theta * 10) / 10;
        if (thetaMap.has(thetaRounded)) {
            thetaMap.get(thetaRounded)!.strong = pairs[i].beta;
        } else {
            thetaMap.set(thetaRounded, { weak: pairs[i].beta, strong: pairs[i].beta });
        }
    }

    // Convert to sorted array
    const thetas = Array.from(thetaMap.keys()).sort((a, b) => a - b);
    for (const theta of thetas) {
        const entry = thetaMap.get(theta)!;
        data.push({ theta, betaWeak: entry.weak, betaStrong: entry.strong });
    }

    return { data, maxTheta };
}
