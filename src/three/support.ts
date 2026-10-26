/**
 * Decides whether the 3D layer runs, without loading three.js itself.
 * Kept separate so the main bundle stays small; scenes load on demand.
 */
export const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarse = matchMedia("(pointer: coarse)").matches;
const cores = navigator.hardwareConcurrency || 4;

/** "high" on a capable desktop, "low" on phones and small machines. */
export const tier: "high" | "low" = coarse || cores <= 4 || innerWidth < 760 ? "low" : "high";

function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export const enabled = !reduceMotion && webglAvailable();
if (enabled) document.documentElement.dataset.three = "on";
