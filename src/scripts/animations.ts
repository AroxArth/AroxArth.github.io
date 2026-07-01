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

  // --- "Cómo trabajo": the ONLY pinned section (a single pin is rock solid) ---
  const proceso = document.querySelector<HTMLElement>("[data-proceso]");
  if (proceso) {
    const phases = gsap.utils.toArray<HTMLElement>("[data-phase]", proceso);
    const fill = proceso.querySelector<HTMLElement>("[data-proceso-fill]");
    const canvas = proceso.querySelector<HTMLCanvasElement>("[data-proceso-canvas]");
    const dist = () => window.innerHeight * phases.length;

    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      const FRAME_COUNT = 150;
      const images: HTMLImageElement[] = [];
      for (let i = 1; i <= FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `/frames/frame-${String(i).padStart(3, "0")}.jpg`;
        images.push(img);
      }
      const frame = { i: 0 };
      const zoom = { v: 1 };

      const draw = () => {
        const img = images[Math.round(frame.i)];
        if (!img || !img.complete || !img.naturalWidth) return;
        const cw = canvas.width;
        const ch = canvas.height;
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        const canvasAR = cw / ch;

        // Largest centered source rect matching the canvas aspect (cover).
        let sW: number, sH: number;
        if (iw / ih > canvasAR) {
          sH = ih;
          sW = ih * canvasAR;
        } else {
          sW = iw;
          sH = iw / canvasAR;
        }
        // Zoom by sampling a smaller centered crop of the HIGH-RES source —
        // stays sharp, unlike CSS-scaling the already-downscaled canvas.
        sW /= zoom.v;
        sH /= zoom.v;
        const sx = (iw - sW) / 2;
        const sy = (ih - sH) / 2;

        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(img, sx, sy, sW, sH, 0, 0, cw, ch);
      };

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(canvas.clientWidth * dpr);
        canvas.height = Math.round(canvas.clientHeight * dpr);
        draw();
      };

      images[0].addEventListener("load", resize);
      window.addEventListener("resize", resize);
      resize();

      // Scrub through the frames.
      gsap.to(frame, {
        i: FRAME_COUNT - 1,
        ease: "none",
        onUpdate: draw,
        scrollTrigger: { trigger: proceso, start: "top top", end: dist, scrub: true },
      });

      // Fade the video IN at entry and OUT at exit — the aurora shows through
      // during the transitions (video starts hidden via CSS).
      gsap
        .timeline({
          scrollTrigger: { trigger: proceso, start: "top top", end: dist, scrub: true },
        })
        .fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 1, ease: "none" })
        .to(canvas, { opacity: 1, duration: 6, ease: "none" })
        .to(canvas, { opacity: 0, duration: 1, ease: "none" });

      // True source-crop zoom as you scroll — stays sharp (samples the
      // high-res frame directly instead of magnifying the canvas bitmap).
      gsap.to(zoom, {
        v: 4,
        ease: "none",
        onUpdate: draw,
        scrollTrigger: { trigger: proceso, start: "top top", end: dist, scrub: true },
      });
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: proceso,
        start: "top top",
        end: dist,
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
      tl.to(el, { duration: 0.4 }); // hold
      if (i < phases.length - 1) {
        tl.to(el, { opacity: 0, scale: 1.1, y: -40, duration: 0.6 });
      }
    });

    if (fill) {
      gsap.fromTo(
        fill,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: proceso, start: "top top", end: dist, scrub: true },
        },
      );
    }
  }

  // --- Zig-zag reveals for the (non-pinned) narrative sections ---
  gsap.utils.toArray<HTMLElement>("[data-zig]").forEach((el) => {
    const dir = el.dataset.zig === "right" ? 130 : -130;
    gsap.fromTo(
      el,
      { opacity: 0, x: reduce ? 0 : dir },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 82%", once: true },
      },
    );
  });

  ScrollTrigger.refresh();
  window.addEventListener("load", () => ScrollTrigger.refresh());
}
