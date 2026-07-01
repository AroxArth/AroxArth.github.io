import { useCallback, useEffect, useRef, useState } from "react";

const SECTIONS = [
  { id: "hero", label: "Inicio" },
  { id: "about", label: "Sobre mí" },
  { id: "stack", label: "Stack" },
  { id: "experience", label: "Experiencia" },
  { id: "projects", label: "Proyectos" },
  { id: "contact", label: "Contacto" },
];

export default function Navbar() {
  const [active, setActive] = useState("hero");
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false });
  const [pressed, setPressed] = useState(false);

  const listRef = useRef<HTMLUListElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const accentRef = useRef<HTMLUListElement>(null);
  const draggingRef = useRef(false);
  const navigatingRef = useRef(false);
  const navTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const positionPillTo = useCallback((id: string) => {
    const item = listRef.current?.querySelector<HTMLElement>(`[data-id="${id}"]`);
    if (item) {
      setPill({ left: item.offsetLeft, width: item.offsetWidth, ready: true });
    }
  }, []);

  // The pill snaps to the active item — except while dragging, when it follows
  // the pointer freely (positioned in onPointerMove). It re-snaps on release.
  useEffect(() => {
    if (draggingRef.current) return;
    positionPillTo(active);
  }, [active, positionPillTo]);

  // Stable, position-based scroll-spy. Paused while dragging or navigating.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      if (draggingRef.current || navigatingRef.current) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const line = window.innerHeight * 0.4;
        let current = SECTIONS[0].id;
        for (const s of SECTIONS) {
          const el = document.getElementById(s.id);
          if (el && el.getBoundingClientRect().top <= line) current = s.id;
        }
        setActive(current);
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const onResize = () => positionPillTo(active);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active, positionPillTo]);

  // Clip the accent layer to the pill's LIVE (animating) position, so while the
  // pill glides between items both labels paint at once — like Apple's glass.
  useEffect(() => {
    let raf = 0;
    const sync = () => {
      const p = pillRef.current;
      const ul = listRef.current;
      const a = accentRef.current;
      if (p && ul && a) {
        const pr = p.getBoundingClientRect();
        const ur = ul.getBoundingClientRect();
        const left = Math.max(0, pr.left - ur.left);
        const right = Math.max(0, ur.right - pr.right);
        const clip = `inset(0px ${right}px 0px ${left}px round 999px)`;
        a.style.clipPath = clip;
        a.style.setProperty("-webkit-clip-path", clip);
      }
      raf = requestAnimationFrame(sync);
    };
    raf = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(raf);
  }, []);

  const idFromClientX = (clientX: number): string | null => {
    const items = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>("[data-id]") ?? [],
    );
    if (!items.length) return null;
    for (const item of items) {
      const r = item.getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right) return item.dataset.id ?? null;
    }
    let nearest = items[0];
    let best = Infinity;
    for (const item of items) {
      const r = item.getBoundingClientRect();
      const d = Math.abs(clientX - (r.left + r.right) / 2);
      if (d < best) {
        best = d;
        nearest = item;
      }
    }
    return nearest.dataset.id ?? null;
  };

  const navigate = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setActive(id);
    positionPillTo(id); // snap the pill even if `active` didn't change (plain click)
    navigatingRef.current = true;
    if (navTimeout.current) clearTimeout(navTimeout.current);
    navTimeout.current = setTimeout(() => {
      navigatingRef.current = false;
    }, 1200);

    const lenis = (
      window as unknown as {
        __lenis?: { scrollTo: (t: HTMLElement, o?: object) => void };
      }
    ).__lenis;
    if (lenis) lenis.scrollTo(el, { offset: -90, duration: 1.1 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    setPressed(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    const id = idFromClientX(e.clientX);
    if (id) {
      setActive(id);
      positionPillTo(id); // move the pill to the pressed item right away
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const ul = listRef.current;
    if (!ul) return;
    // Free drag: the pill follows the pointer while held. It takes the width of
    // the nearest item and snaps to the nearest one only on release.
    const id = idFromClientX(e.clientX);
    const item = id ? ul.querySelector<HTMLElement>(`[data-id="${id}"]`) : null;
    const w = item ? item.offsetWidth : pill.width;
    const rect = ul.getBoundingClientRect();
    let left = e.clientX - rect.left - w / 2;
    left = Math.max(0, Math.min(left, ul.clientWidth - w));
    setPill({ left, width: w, ready: true });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setPressed(false);
    const id = idFromClientX(e.clientX) ?? active;
    navigate(id);
  };

  return (
    <nav
      className="nav-bar fixed bottom-4 left-1/2 z-50 glass rounded-full px-3 py-2 sm:bottom-auto sm:top-4"
      style={{ transform: `translateX(-50%) scale(${pressed ? 1.05 : 1})` }}
    >
      <div className="relative inline-flex">
        <ul
          ref={listRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="relative flex touch-none select-none items-center gap-1"
        >
          {pill.ready && (
            <span
              ref={pillRef}
              className="nav-pill"
              style={{
                transform: `translateX(${pill.left}px) scale(${pressed ? 1.14 : 1})`,
                width: `${pill.width}px`,
              }}
            />
          )}
          {SECTIONS.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                data-id={id}
                className="nav-link"
                draggable={false}
                onClick={(e) => e.preventDefault()}
              >
                <span className="sm:hidden">
                  <NavIcon id={id} />
                </span>
                <span className="hidden sm:inline">{label}</span>
              </a>
            </li>
          ))}
        </ul>

        <ul
          ref={accentRef}
          aria-hidden="true"
          className="nav-accent pointer-events-none absolute inset-0 flex items-center gap-1"
        >
          {SECTIONS.map(({ id, label }) => (
            <li key={id}>
              <span className="nav-link">
                <span className="sm:hidden">
                  <NavIcon id={id} />
                </span>
                <span className="hidden sm:inline">{label}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function NavIcon({ id }: { id: string }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (id) {
    case "hero":
      return (
        <svg {...common}>
          <path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
        </svg>
      );
    case "about":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20a8 8 0 0 1 16 0" />
        </svg>
      );
    case "stack":
      return (
        <svg {...common}>
          <path d="m12 3 9 5-9 5-9-5 9-5Z" />
          <path d="m3 13 9 5 9-5" />
        </svg>
      );
    case "experience":
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case "projects":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "contact":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      );
    default:
      return null;
  }
}
