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
  const listRef = useRef<HTMLUListElement>(null);

  // Scroll-spy: highlight whichever section is centered in the viewport.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Slide the water-drop pill to the active item.
  const positionPill = useCallback(() => {
    const item = listRef.current?.querySelector<HTMLElement>(
      `[data-id="${active}"]`,
    );
    if (item) {
      setPill({ left: item.offsetLeft, width: item.offsetWidth, ready: true });
    }
  }, [active]);

  useEffect(() => {
    positionPill();
  }, [positionPill]);

  useEffect(() => {
    window.addEventListener("resize", positionPill);
    return () => window.removeEventListener("resize", positionPill);
  }, [positionPill]);

  const goTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const lenis = (window as unknown as { __lenis?: { scrollTo: (t: HTMLElement, o?: object) => void } }).__lenis;
    if (lenis) lenis.scrollTo(el, { offset: -90 });
    else el.scrollIntoView({ behavior: "smooth" });
    setActive(id);
  };

  return (
    <nav className="fixed top-4 left-1/2 z-50 -translate-x-1/2 glass rounded-full px-3 py-2">
      <ul ref={listRef} className="relative flex items-center gap-1">
        {pill.ready && (
          <span
            className="nav-pill"
            style={{
              transform: `translateX(${pill.left}px)`,
              width: `${pill.width}px`,
            }}
          />
        )}
        {SECTIONS.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              data-id={id}
              data-active={active === id}
              className="nav-link"
              onClick={goTo(id)}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
