export interface Project {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  role: string;
  tech: string[];
  /** "web" | "desktop" | "mobile" | "ai" — drives the little category label. */
  kind: string;
  /** Which group the card lives under. */
  category: "professional" | "personal";
  /** Public repo URL, or null for private client work. */
  repo: string | null;
  /** Company / client the project was built for. */
  client: string;
  /** Screenshot image paths. Empty for now — user will add real captures. */
  images: string[];
}

export const projects: Project[] = [
  {
    slug: "sisges-sssr",
    name: "Sisges SSSR",
    tagline: "Sistema de Gestión de Salud y Pensiones",
    description:
      "Reescritura completa, desde cero, de un sistema legado en VB6 del año 2000 que ya no tenía soporte. Cubre aportes, movimientos, procesos (cheques, egresos, devoluciones), cierres, cuentas bancarias y contables, y control de asociados con roles y permisos. Incluye un pipeline de migración de datos por fases desde el sistema antiguo.",
    role: "Arquitecto y desarrollador full-stack — sistema construido desde cero según las directrices de Solidaridad Sacerdotal Santa Rosa.",
    tech: ["React 19", "TypeScript", "Vite", "Tailwind CSS", "Node.js", "Prisma", "PostgreSQL"],
    kind: "Full-stack · Modernización de legacy",
    category: "professional",
    repo: null,
    client: "SSSR — Solidaridad Sacerdotal Santa Rosa",
    images: [],
  },
  {
    slug: "sisbascula",
    name: "SisBáscula",
    tagline: "Pesaje de camiones en tiempo real",
    description:
      "Aplicación de escritorio para controlar el pesaje de camiones de carga: peso de entrada y salida, tara, y trazabilidad de qué vehículo llegó, cuánto se quedó y con cuánto salió. Se conecta a una balanza física por TCP (incluye un simulador para probar sin hardware), con reportes en Excel, respaldos y base de datos cifrada.",
    role: "Desarrollador — arquitectura basada en interfaces, integración con hardware por TCP.",
    tech: [".NET 10 MAUI", "Blazor Hybrid", "MudBlazor", "C#", "SQLite (cifrado)", "ClosedXML"],
    kind: "Escritorio · Integración con hardware",
    category: "professional",
    repo: null,
    client: "SISSAC",
    images: [],
  },
  {
    slug: "washclaw",
    name: "WashClaw",
    tagline: "SaaS multi-tenant para autolavados",
    description:
      "Plataforma SaaS con aislamiento total de datos por empresa (multi-tenant) para la gestión integral de autolavados: órdenes de lavado, caja, comprobantes, inventario, suscripciones, finanzas, comisiones y propinas del personal. Desarrollada con Spec-Driven Development y cubierta por tests unitarios y E2E.",
    role: "Desarrollador full-stack — arquitectura multi-tenant, testing y despliegue con Docker.",
    tech: ["Next.js 15", "React 19", "TypeScript", "Prisma", "PostgreSQL 17", "NextAuth v5", "Docker"],
    kind: "Web · SaaS",
    category: "professional",
    repo: null,
    client: "LCT Global",
    images: [],
  },
  {
    slug: "lct-web",
    name: "LCT Global — Web",
    tagline: "Rediseño del sitio corporativo, desde cero",
    description:
      "Rediseño completo del sitio web corporativo de LCT Global. Interfaz moderna con campos de partículas WebGL en el héroe, animaciones fluidas, secciones de servicios y portafolio, páginas de empresa y páginas legales. Enfocado en identidad de marca y una experiencia pulida.",
    role: "Desarrollador front-end — diseño e implementación de toda la interfaz.",
    tech: ["React 19", "Vite", "Framer Motion", "Three.js", "Tailwind CSS"],
    kind: "Web · Front-end",
    category: "professional",
    repo: null,
    client: "LCT Global",
    images: [],
  },
  {
    slug: "notipay",
    name: "NotiPay",
    tagline: "Confirmación de pagos Yape por voz, anti-fraude",
    description:
      "App Android que anuncia por voz cada pago recibido en Yape, leyendo la notificación oficial. Resuelve un fraude real en Perú: apps falsas que simulan un pago para engañar al vendedor. Guarda historial local filtrable por día, mes o año, con totales.",
    role: "Desarrollador — proyecto personal, de la idea al prototipo funcional (APK).",
    tech: ["Kotlin", "Jetpack Compose", "MVVM", "Room", "Coroutines"],
    kind: "Móvil · Android",
    category: "personal",
    repo: "https://github.com/AroxArth/NotiPay",
    client: "Proyecto personal",
    images: [],
  },
  {
    slug: "meet-matic",
    name: "meet-matic",
    tagline: "Transcripción de reuniones 100% local",
    description:
      "Transcribe reuniones en tiempo real y de forma totalmente local: el audio nunca sale de tu PC. Separa hablantes por fuente (tu micrófono vs. participantes) y exporta a Markdown listo para procesar con IA. Sin internet tras la descarga inicial del modelo.",
    role: "Desarrollador — proyecto personal, privacidad como característica central.",
    tech: ["Python", "faster-whisper", "CustomTkinter", "VAD"],
    kind: "IA · Escritorio",
    category: "personal",
    repo: "https://github.com/AroxArth/meet-matic",
    client: "Proyecto personal",
    images: [],
  },
];
