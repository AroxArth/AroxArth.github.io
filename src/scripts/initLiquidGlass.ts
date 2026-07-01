import { createLiquidGlass, type LiquidGlassInstance } from "./liquidGlass";

/**
 * Finds every element marked with `data-liquid-glass` and applies real optical
 * refraction to it. Per-element tuning is read from data attributes:
 *   data-lg-radius   border radius in px (default: pill / 999)
 *   data-lg-scale    displacement strength (default: -140)
 *   data-lg-frost    dark frost overlay 0-1 (default: 0, clear glass)
 */
const instances = new WeakMap<HTMLElement, LiquidGlassInstance>();

export function initLiquidGlass(root: ParentNode = document) {
  const els = root.querySelectorAll<HTMLElement>("[data-liquid-glass]");
  els.forEach((el) => {
    if (instances.has(el)) return;

    const radius = el.dataset.lgRadius ? Number(el.dataset.lgRadius) : 999;
    const scale = el.dataset.lgScale ? Number(el.dataset.lgScale) : -110;
    const frost = el.dataset.lgFrost ? Number(el.dataset.lgFrost) : 0.06;

    const instance = createLiquidGlass(el, {
      borderRadius: radius,
      scale, // strong enough to see the rim bend the backdrop
      aberration: [0, 6, 12], // visible chromatic edge, not chaotic
      border: 0.07, // small neutral center — keep the displacement alive
      blur: 11,
      saturation: 1.4,
      frost, // faint neutral body so it reads as glass over busy photos
      fallbackFilter: "blur(9px) saturate(1.4)",
    });
    instances.set(el, instance);
  });
}
