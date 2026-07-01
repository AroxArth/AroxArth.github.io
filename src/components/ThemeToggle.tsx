import { useEffect, useRef, useState } from "react";
import { createLiquidGlass } from "../scripts/liquidGlass";

/**
 * Liquid-glass theme switcher. Light is the site default; the choice is
 * persisted to localStorage and read back before paint by the inline
 * script in Layout.astro (so there is no flash on reload).
 */
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Sync initial state with whatever the no-flash script already applied.
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  // Apply real liquid-glass refraction to this island's button after mount.
  useEffect(() => {
    if (!btnRef.current) return;
    const glass = createLiquidGlass(btnRef.current, {
      borderRadius: 999,
      scale: -85,
      aberration: [0, 6, 12],
      border: 0.07,
      blur: 11,
      saturation: 1.4,
      frost: 0.06,
    });
    return () => glass.destroy();
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch (_) {}
    setDark(next);
  };

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={toggle}
      className="glass-btn !p-3"
      aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}
      title={dark ? "Modo claro" : "Modo oscuro"}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
