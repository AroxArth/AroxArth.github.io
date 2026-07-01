import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

/**
 * Premium scroll: Lenis smooth scrolling synced to GSAP's ticker, plus
 * scroll-reveal animations. Animations ALWAYS run — for reduced-motion users
 * we drop the vertical travel and keep only a gentle opacity fade (fades are
 * not vestibular triggers), so the site still feels alive without being harsh.
 */
export function initAnimations() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Lenis smooth scroll, driven by GSAP's ticker ---
  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  (window as unknown as { __lenis: Lenis }).__lenis = lenis;

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Reduced-motion: strip the initial vertical offset → pure fade, no sliding.
  if (reduce) {
    gsap.set("[data-hero], [data-animate], [data-animate-group] > *", { y: 0 });
  }

  // Hero: play on load, staggered.
  const hero = gsap.utils.toArray<HTMLElement>("[data-hero]");
  if (hero.length) {
    gsap.to(hero, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out",
      stagger: 0.1,
      delay: 0.15,
    });
  }

  // Single elements reveal on scroll.
  gsap.utils.toArray<HTMLElement>("[data-animate]").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });

  // Grouped children stagger in (chips, cards, timeline).
  gsap.utils.toArray<HTMLElement>("[data-animate-group]").forEach((group) => {
    gsap.to(group.querySelectorAll(":scope > *"), {
      opacity: 1,
      y: 0,
      duration: 0.75,
      ease: "power3.out",
      stagger: 0.09,
      scrollTrigger: { trigger: group, start: "top 84%", once: true },
    });
  });

  // --- Pinned, scrubbed "process" sequence: scroll plays it frame-by-frame ---
  const proceso = document.querySelector<HTMLElement>("[data-proceso]");
  if (proceso) {
    const phases = gsap.utils.toArray<HTMLElement>("[data-phase]", proceso);
    const fill = proceso.querySelector<HTMLElement>("[data-proceso-fill]");
    const distance = () => window.innerHeight * phases.length;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: proceso,
        start: "top top",
        end: distance,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
      },
    });

    phases.forEach((el, i) => {
      tl.fromTo(
        el,
        { opacity: 0, scale: 0.85, y: 40 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6 },
      );
      if (i < phases.length - 1) {
        tl.to(el, { opacity: 0, scale: 1.1, y: -40, duration: 0.6 }, "+=0.5");
      }
    });

    if (fill) {
      gsap.fromTo(
        fill,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: proceso,
            start: "top top",
            end: distance,
            scrub: true,
          },
        },
      );
    }
  }

  // --- Site-wide video background: image sequence scrubbed by whole-page scroll ---
  const bgCanvas = document.querySelector<HTMLCanvasElement>("[data-bg-canvas]");
  const bgCtx = bgCanvas?.getContext("2d");
  if (bgCanvas && bgCtx) {
    const FRAME_COUNT = 150;
    const images: HTMLImageElement[] = [];
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = `/frames/frame-${String(i).padStart(3, "0")}.jpg`;
      images.push(img);
    }
    const frame = { i: 0 };

    const draw = () => {
      const img = images[Math.round(frame.i)];
      if (!img || !img.complete || !img.naturalWidth) return;
      const cw = bgCanvas.width;
      const ch = bgCanvas.height;
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = cw / ch;
      let dw: number, dh: number, dx: number, dy: number;
      if (cr > ir) {
        dw = cw;
        dh = cw / ir;
        dx = 0;
        dy = (ch - dh) / 2;
      } else {
        dh = ch;
        dw = ch * ir;
        dx = (cw - dw) / 2;
        dy = 0;
      }
      bgCtx.clearRect(0, 0, cw, ch);
      bgCtx.drawImage(img, dx, dy, dw, dh);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      bgCanvas.width = Math.round(bgCanvas.clientWidth * dpr);
      bgCanvas.height = Math.round(bgCanvas.clientHeight * dpr);
      draw();
    };

    images[0].addEventListener("load", resize);
    window.addEventListener("resize", resize);
    resize();

    gsap.to(frame, {
      i: FRAME_COUNT - 1,
      ease: "none",
      onUpdate: draw,
      scrollTrigger: { start: 0, end: "max", scrub: 0.5 },
    });
  }

  window.addEventListener("load", () => ScrollTrigger.refresh());
}
