/**
 * Liquid Glass — real optical refraction for the web.
 *
 * Adapted from rizroze/liquid-glass (MIT). Generates displacement maps via
 * Canvas 2D and feeds them into SVG feDisplacementMap filters. Three passes
 * (one per RGB channel) with slightly different scale values create the
 * chromatic aberration you see on the edges of Apple's Liquid Glass.
 *
 * Chromium only. Safari / Firefox fall back to a plain backdrop-filter: blur().
 *
 * @see https://github.com/rizroze/liquid-glass
 * @license MIT
 */

export interface LiquidGlassOptions {
  width?: number;
  height?: number;
  /** Border radius in px. Default: 50 (pill shape). */
  borderRadius?: number;
  /** Base displacement strength. Negative = inward refraction. Default: -180. */
  scale?: number;
  /** Per-channel scale offsets [r, g, b] for chromatic aberration. */
  aberration?: [number, number, number];
  /** Edge blur in px for the center neutralization zone. */
  blur?: number;
  /** Neutralization inset as fraction of min(width, height). */
  border?: number;
  /** Center lightness 0-100. */
  lightness?: number;
  /** Center opacity 0-1. */
  alpha?: number;
  /** Dark frost overlay opacity 0-1. Default: 0 (clear glass). */
  frost?: number;
  /** Backdrop saturation multiplier. */
  saturation?: number;
  /** Post-displacement blur in px. */
  displaceBlur?: number;
  filterId?: string;
  /** Fallback backdrop-filter for non-Chromium browsers. */
  fallbackFilter?: string;
}

export interface LiquidGlassInstance {
  update(options: Partial<LiquidGlassOptions>): void;
  destroy(): void;
  filterElement: SVGSVGElement;
  isActive: boolean;
}

interface ResolvedConfig {
  width: number;
  height: number;
  radius: number;
  scale: number;
  border: number;
  lightness: number;
  alpha: number;
  blur: number;
  r: number;
  g: number;
  b: number;
  frost: number;
  saturation: number;
  displace: number;
}

function resolveConfig(el: HTMLElement, opts: LiquidGlassOptions): ResolvedConfig {
  const rect = el.getBoundingClientRect();
  const ab = opts.aberration ?? [0, 10, 20];
  return {
    width: opts.width ?? Math.round(rect.width),
    height: opts.height ?? Math.round(rect.height),
    radius: opts.borderRadius ?? 50,
    scale: opts.scale ?? -180,
    border: opts.border ?? 0.07,
    lightness: opts.lightness ?? 50,
    alpha: opts.alpha ?? 0.93,
    blur: opts.blur ?? 11,
    r: ab[0],
    g: ab[1],
    b: ab[2],
    frost: opts.frost ?? 0,
    saturation: opts.saturation ?? 1,
    displace: opts.displaceBlur ?? 0,
  };
}

export const isChromium =
  typeof navigator !== "undefined" && /Chrome\//.test(navigator.userAgent);

const _mapCache = new Map<string, string>();

/** Build the displacement map on a canvas. Areas outside the pill stay neutral
 *  gray (128,128,128 = zero displacement). */
function buildDisplacementMap(c: ResolvedConfig): string {
  const key = `${c.width}:${c.height}:${c.radius}:${c.scale}:${c.border}:${c.blur}:${c.lightness}:${c.alpha}`;
  const cached = _mapCache.get(key);
  if (cached) return cached;

  const maxDisplace = Math.max(Math.abs(c.scale) * 0.5, 20);
  const padX = Math.ceil(maxDisplace);
  const padY = Math.ceil(maxDisplace);
  const totalW = c.width + padX * 2;
  const totalH = c.height + padY * 2;

  const canvas = document.createElement("canvas");
  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "rgb(128, 128, 128)";
  ctx.fillRect(0, 0, totalW, totalH);

  const ox = padX;
  const oy = padY;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(ox, oy, c.width, c.height, c.radius);
  ctx.clip();

  ctx.fillStyle = "#000000";
  ctx.fillRect(ox, oy, c.width, c.height);

  const redGrad = ctx.createLinearGradient(ox + c.width, oy, ox, oy);
  redGrad.addColorStop(0, "#000000");
  redGrad.addColorStop(1, "#ff0000");
  ctx.fillStyle = redGrad;
  ctx.fillRect(ox, oy, c.width, c.height);

  ctx.globalCompositeOperation = "difference";
  const blueGrad = ctx.createLinearGradient(ox, oy, ox, oy + c.height);
  blueGrad.addColorStop(0, "#000000");
  blueGrad.addColorStop(1, "#0000ff");
  ctx.fillStyle = blueGrad;
  ctx.fillRect(ox, oy, c.width, c.height);

  ctx.globalCompositeOperation = "source-over";
  const borderPx = Math.min(c.width, c.height) * (c.border * 0.5);
  ctx.filter = `blur(${c.blur}px)`;
  ctx.fillStyle = `hsla(0, 0%, ${c.lightness}%, ${c.alpha})`;
  ctx.beginPath();
  ctx.roundRect(
    ox + borderPx,
    oy + borderPx,
    c.width - borderPx * 2,
    c.height - borderPx * 2,
    c.radius,
  );
  ctx.fill();

  ctx.restore();

  const uri = canvas.toDataURL();
  _mapCache.set(key, uri);
  return uri;
}

let _instanceCount = 0;

function createFilterSVG(id: string) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.style.cssText = "position:absolute;width:0;height:0;pointer-events:none;";

  svg.innerHTML = `
    <defs>
      <filter id="${id}" color-interpolation-filters="sRGB" x="-38%" y="-188%" width="176%" height="476%">
        <feImage result="map" preserveAspectRatio="none" />
        <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="B" result="dispRed" data-channel="red" />
        <feColorMatrix in="dispRed" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
        <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="B" result="dispGreen" data-channel="green" />
        <feColorMatrix in="dispGreen" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
        <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="B" result="dispBlue" data-channel="blue" />
        <feColorMatrix in="dispBlue" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />
        <feBlend in="red" in2="green" mode="screen" result="rg" />
        <feBlend in="rg" in2="blue" mode="screen" result="output" />
        <feGaussianBlur in="output" stdDeviation="0" />
      </filter>
    </defs>
  `;

  const filter = svg.querySelector("filter")! as unknown as SVGFilterElement;
  const feImage = svg.querySelector("feImage")! as unknown as SVGFEImageElement;
  const red = svg.querySelector('[data-channel="red"]')! as unknown as SVGFEDisplacementMapElement;
  const green = svg.querySelector('[data-channel="green"]')! as unknown as SVGFEDisplacementMapElement;
  const blue = svg.querySelector('[data-channel="blue"]')! as unknown as SVGFEDisplacementMapElement;
  const blurEl = svg.querySelector("feGaussianBlur")! as unknown as SVGFEGaussianBlurElement;

  return { svg, feImage, red, green, blue, blur: blurEl, filter };
}

function applyConfig(c: ResolvedConfig, refs: ReturnType<typeof createFilterSVG>) {
  const uri = buildDisplacementMap(c);

  const maxD = Math.max(Math.abs(c.scale) * 0.5, 20);
  const pctX = Math.ceil((maxD / c.width) * 100);
  const pctY = Math.ceil((maxD / c.height) * 100);
  refs.filter.setAttribute("x", `-${pctX}%`);
  refs.filter.setAttribute("y", `-${pctY}%`);
  refs.filter.setAttribute("width", `${100 + pctX * 2}%`);
  refs.filter.setAttribute("height", `${100 + pctY * 2}%`);

  refs.feImage.setAttributeNS("http://www.w3.org/1999/xlink", "href", uri);
  refs.feImage.setAttribute("href", uri);

  refs.red.setAttribute("scale", String(c.scale + c.r));
  refs.green.setAttribute("scale", String(c.scale + c.g));
  refs.blue.setAttribute("scale", String(c.scale + c.b));

  refs.blur.setAttribute("stdDeviation", String(c.displace));
}

export function createLiquidGlass(
  element: HTMLElement,
  options: LiquidGlassOptions = {},
): LiquidGlassInstance {
  const fallback = options.fallbackFilter ?? "blur(10px)";

  if (!isChromium) {
    element.style.backdropFilter = fallback;
    element.style.setProperty("-webkit-backdrop-filter", fallback);
    const dummySvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    return {
      isActive: false,
      filterElement: dummySvg,
      update() {},
      destroy() {
        element.style.backdropFilter = "";
        element.style.setProperty("-webkit-backdrop-filter", "");
      },
    };
  }

  const id = options.filterId ?? `liquid-glass-${++_instanceCount}`;
  const refs = createFilterSVG(id);
  document.body.appendChild(refs.svg);

  let currentOpts = { ...options };
  let config = resolveConfig(element, currentOpts);
  applyConfig(config, refs);

  const applyStyles = (c: ResolvedConfig) => {
    element.style.backdropFilter = `url(#${id}) saturate(${c.saturation})`;
    element.style.setProperty(
      "-webkit-backdrop-filter",
      `url(#${id}) saturate(${c.saturation})`,
    );
    if (c.frost > 0) {
      element.style.background = `hsl(0 0% 0% / ${c.frost})`;
    }
  };

  applyStyles(config);

  let resizeRaf = 0;
  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      if (currentOpts.width == null || currentOpts.height == null) {
        config = resolveConfig(element, currentOpts);
        applyConfig(config, refs);
        applyStyles(config);
      }
    });
  });
  ro.observe(element);

  return {
    isActive: true,
    filterElement: refs.svg,
    update(newOpts: Partial<LiquidGlassOptions>) {
      currentOpts = { ...currentOpts, ...newOpts };
      config = resolveConfig(element, currentOpts);
      applyConfig(config, refs);
      applyStyles(config);
    },
    destroy() {
      ro.disconnect();
      cancelAnimationFrame(resizeRaf);
      refs.svg.remove();
      element.style.backdropFilter = "";
      element.style.setProperty("-webkit-backdrop-filter", "");
      element.style.background = "";
    },
  };
}
