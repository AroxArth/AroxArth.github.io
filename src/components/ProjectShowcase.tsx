import { useEffect, useState } from "react";
import type { Project } from "../data/projects";

interface Props {
  projects: Project[];
}

/**
 * Compact project grid. Each card shows just enough; "Ver más" opens a glass
 * modal with the full story and a screenshots gallery.
 */
export default function ProjectShowcase({ projects }: Props) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [shot, setShot] = useState(0);

  const current = projects.find((p) => p.slug === openSlug) ?? null;

  const open = (slug: string) => {
    setShot(0);
    setOpenSlug(slug);
  };
  const close = () => setOpenSlug(null);

  const professional = projects.filter((p) => p.category === "professional");
  const personal = projects.filter((p) => p.category === "personal");

  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (current.images.length > 1) {
        if (e.key === "ArrowRight") setShot((s) => (s + 1) % current.images.length);
        if (e.key === "ArrowLeft") setShot((s) => (s - 1 + current.images.length) % current.images.length);
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [current]);

  return (
    <>
      <div className="space-y-16">
        <ProjectGroup title="Trabajo profesional" items={professional} onOpen={open} />
        <ProjectGroup title="Proyectos personales" items={personal} onOpen={open} />
      </div>

      {current && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-md"
          style={{ animation: "backdropIn 0.25s ease" }}
          onClick={close}
        >
          <div
            className="glass-card my-auto w-full max-w-2xl overflow-hidden p-6 sm:p-8"
            style={{ animation: "modalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Accent glow strip along the top edge. */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-60"
              style={{
                background:
                  "radial-gradient(60% 100% at 50% 0%, color-mix(in srgb, var(--accent) 45%, transparent), transparent)",
              }}
            />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                  {current.kind}
                </p>
                <h3 className="mt-1 text-2xl font-semibold tracking-tight">
                  {current.name}
                </h3>
                <p className="text-[var(--muted)]">{current.tagline}</p>
              </div>
              <button
                type="button"
                className="glass-btn shrink-0 !p-2.5"
                aria-label="Cerrar"
                onClick={close}
              >
                <CloseIcon />
              </button>
            </div>

            {/* Screenshots */}
            <div className="mt-6">
              {current.images.length > 0 ? (
                <figure>
                  <img
                    src={current.images[shot]}
                    alt={`${current.name} captura ${shot + 1}`}
                    className="max-h-[55vh] w-full rounded-xl object-contain"
                  />
                  {current.images.length > 1 && (
                    <div className="mt-3 flex items-center justify-center gap-4">
                      <button className="glass-btn !p-2" aria-label="Anterior" onClick={() => setShot((s) => (s - 1 + current.images.length) % current.images.length)}>
                        <ArrowIcon flip />
                      </button>
                      <span className="text-sm text-[var(--muted)]">
                        {shot + 1} / {current.images.length}
                      </span>
                      <button className="glass-btn !p-2" aria-label="Siguiente" onClick={() => setShot((s) => (s + 1) % current.images.length)}>
                        <ArrowIcon />
                      </button>
                    </div>
                  )}
                </figure>
              ) : (
                <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-xl border border-[var(--glass-border)]">
                  <div
                    className="absolute inset-0 opacity-50"
                    style={{
                      background:
                        "linear-gradient(135deg, color-mix(in srgb, var(--accent) 40%, transparent), transparent 65%)",
                    }}
                  />
                  <div className="relative flex flex-col items-center gap-2 text-center">
                    <CameraIcon />
                    <p className="text-sm text-muted">Capturas próximamente</p>
                  </div>
                </div>
              )}
            </div>

            <p className="mt-6 leading-relaxed text-[var(--muted)]">
              {current.description}
            </p>

            <div className="mt-5 space-y-3 text-sm">
              <p>
                <span className="font-semibold">Mi rol: </span>
                <span className="text-[var(--muted)]">{current.role}</span>
              </p>
              <p>
                <span className="font-semibold">Cliente: </span>
                <span className="text-[var(--muted)]">{current.client}</span>
              </p>
            </div>

            <ul className="mt-5 flex flex-wrap gap-2">
              {current.tech.map((t) => (
                <li key={t} className="chip">{t}</li>
              ))}
            </ul>

            {current.repo && (
              <a
                href={current.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-btn mt-6 inline-flex text-sm"
              >
                Ver repositorio
                <ArrowIcon />
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ProjectGroup({
  title,
  items,
  onOpen,
}: {
  title: string;
  items: Project[];
  onOpen: (slug: string) => void;
}) {
  return (
    <div>
      <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-muted">
        {title}
      </h3>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((p) => (
          <article
            key={p.slug}
            className="project-card glass-card flex cursor-pointer flex-col gap-3 p-6"
            onClick={() => onOpen(p.slug)}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              {p.kind}
            </p>
            <div>
              <h4 className="text-xl font-semibold tracking-tight">{p.name}</h4>
              <p className="text-sm text-muted">{p.tagline}</p>
            </div>
            <ul className="mt-1 flex flex-wrap gap-2">
              {p.tech.slice(0, 3).map((t) => (
                <li key={t} className="chip">
                  {t}
                </li>
              ))}
              {p.tech.length > 3 && (
                <li className="chip opacity-70">+{p.tech.length - 3}</li>
              )}
            </ul>
            <div className="mt-auto pt-2">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                Ver más
                <ArrowIcon />
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ArrowIcon({ flip = false }: { flip?: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={flip ? { transform: "rotate(180deg)" } : undefined}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-[var(--muted)]">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
