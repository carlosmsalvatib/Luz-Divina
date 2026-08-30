import { useEffect, useRef } from "react";
import type { ReactNode, InputHTMLAttributes, ButtonHTMLAttributes } from "react";
import { navigate } from "../lib/context";

/* ================= iconos (SVG en línea) ================= */
const PATHS: Record<string, ReactNode> = {
  sol: <><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" /></>,
  carrito: <><circle cx="9" cy="20" r="1.4" /><circle cx="17.5" cy="20" r="1.4" /><path d="M2.5 3.5h2.6l2.3 12h11l2.1-8.5H6.2" /></>,
  usuario: <><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20.5c1.3-3.6 4.1-5.3 7.5-5.3s6.2 1.7 7.5 5.3" /></>,
  corona: <path d="M3 17l1.5-9L9 12l3-7 3 7 4.5-4L21 17H3zm1 3h16" />,
  pincel: <><path d="M14.5 3.5l6 6-8.5 8.5c-1.6 1.6-4.4 1.6-6 0s-1.6-4.4 0-6l8.5-8.5z" /><path d="M8 14l2 2" /></>,
  relleno: <><path d="M12 3l7 7-7 7-7-7 7-7z" /><path d="M12 17v4" /><circle cx="12" cy="22" r="0.6" /></>,
  borrador: <><path d="M7 20h13" /><path d="M5.5 15.5l8-8a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8l-6 6H8l-2.5-2.5a0.7 0.7 0 0 1 0-.5z" /><path d="M9 8l7 7" /></>,
  cuentagotas: <><path d="M13.5 6.5l4 4L8 20H4v-4l9.5-9.5z" /><path d="M16 4l4 4-2 2-4-4 2-2z" /></>,
  deshacer: <><path d="M8 5L3 10l5 5" /><path d="M3 10h11a6 6 0 0 1 6 6v3" /></>,
  imprimir: <><path d="M6 9V3h12v6" /><path d="M6 17H3v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6h-3" /><rect x="6" y="14" width="12" height="7" /></>,
  candado: <><rect x="5" y="11" width="14" height="9" rx="1.5" /><path d="M8 11V7.5a4 4 0 0 1 8 0V11" /></>,
  candadoAbierto: <><rect x="5" y="11" width="14" height="9" rx="1.5" /><path d="M8 11V7.5a4 4 0 0 1 7.7-1.4" /></>,
  check: <path d="M4 12.5l5 5L20 6.5" />,
  x: <path d="M5 5l14 14M19 5L5 19" />,
  mas: <path d="M12 5v14M5 12h14" />,
  menos: <path d="M5 12h14" />,
  basura: <><path d="M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13" /><path d="M10 11v5M14 11v5" /></>,
  editar: <><path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1z" /><path d="M14.5 6.5l3 3" /></>,
  flecha: <path d="M4 12h15M13 6l6 6-6 6" />,
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  buscar: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L21 21" /></>,
  sonido: <><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /></>,
  silencio: <><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M17 9l5 6M22 9l-5 6" /></>,
  ojo: <><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z" /><circle cx="12" cy="12" r="2.8" /></>,
  base: <><ellipse cx="12" cy="5.5" rx="8" ry="2.8" /><path d="M4 5.5v13c0 1.5 3.6 2.8 8 2.8s8-1.3 8-2.8v-13" /><path d="M4 12c0 1.5 3.6 2.8 8 2.8s8-1.3 8-2.8" /></>,
  escudo: <><path d="M12 2l8 3v6c0 5-3.4 8.6-8 11-4.6-2.4-8-6-8-11V5l8-3z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></>,
  tarjeta: <><rect x="2.5" y="5" width="19" height="14" rx="2" /><path d="M2.5 10h19M6 15h4" /></>,
  rayo: <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />,
  libro: <><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17.5H6.5A2.5 2.5 0 0 0 4 22V4.5z" /><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /></>,
  refrescar: <><path d="M20 12a8 8 0 1 1-2.3-5.6" /><path d="M20 3v4h-4" /></>,
  descargar: <><path d="M12 3v12M7 10l5 5 5-5" /><path d="M4 21h16" /></>,
  chispa: <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2zM19 16l.9 3.1L23 20l-3.1.9L19 24l-.9-3.1L15 20l3.1-.9L19 16z" />,
  vela: <><path d="M9 10h6v11H9z" /><path d="M12 7.5c1.2-1.2 1.2-2.6 0-4.5-1.2 1.9-1.2 3.3 0 4.5z" /><path d="M5 21h14" /></>,
  copiar: <><rect x="9" y="9" width="11" height="11" rx="1.5" /><path d="M5 15H4V4h11v1" /></>,
  salir: <><path d="M9 4H5v16h4" /><path d="M14 8l4 4-4 4M18 12H9" /></>,
  flor: <><circle cx="12" cy="12" r="2.6" /><path d="M12 9.4C12 5.5 13.5 3.5 12 2c-1.5 1.5 0 3.5 0 7.4zm0 5.2c0 3.9-1.5 5.9 0 7.4 1.5-1.5 0-3.5 0-7.4zM9.4 12c-3.9 0-5.9-1.5-7.4 0 1.5 1.5 3.5 0 7.4 0zm5.2 0c3.9 0 5.9 1.5 7.4 0-1.5-1.5-3.5 0-7.4 0z" /></>,
};

export function Icon({ name, size = 18, className = "", strokeWidth = 1.7 }: { name: string; size?: number; className?: string; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {PATHS[name] ?? PATHS.sol}
    </svg>
  );
}

/* ================= logotipo ================= */
export function Logo({ compacto = false }: { compacto?: boolean }) {
  return (
    <a href="#/" className="group flex items-center gap-3 select-none">
      <span className="relative grid place-items-center w-10 h-10">
        <svg viewBox="0 0 48 48" className="w-10 h-10 text-gold-500 transition-transform duration-700 group-hover:rotate-90" fill="none" stroke="currentColor">
          <circle cx="24" cy="24" r="21" strokeWidth="1.4" opacity="0.8" />
          <circle cx="24" cy="24" r="12" strokeWidth="1.2" opacity="0.65" />
          <circle cx="24" cy="24" r="4.5" fill="currentColor" stroke="none" />
          <g strokeWidth="1.4">
            <path d="M24 3v7M24 38v7M3 24h7M38 24h7M9.2 9.2l4.9 4.9M33.9 33.9l4.9 4.9M38.8 9.2l-4.9 4.9M14.1 33.9l-4.9 4.9" />
          </g>
        </svg>
      </span>
      {!compacto && (
        <span className="leading-none">
          <span className="block font-deco text-[1.35rem] text-gold-400 tracking-wide" style={{ fontFamily: "var(--font-deco)" }}>Luz Divina</span>
          <span className="block text-[0.6rem] tracking-[0.42em] uppercase text-ivory-500 mt-1">Nombres · Mandalas · Luz</span>
        </span>
      )}
    </a>
  );
}

/* ================= botones / badges ================= */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variante?: "gold" | "ghost" | "peligro" | "jade" | "sutil"; tam?: "sm" | "md" | "lg" };
export function Btn({ variante = "gold", tam = "md", className = "", children, ...rest }: BtnProps) {
  const base = "inline-flex items-center justify-center gap-2 font-medium tracking-wide rounded-md transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none cursor-pointer";
  const tama = { sm: "text-xs px-3 py-1.5", md: "text-sm px-5 py-2.5", lg: "text-base px-7 py-3.5" }[tam];
  const vari = {
    gold: "btn-gold font-semibold",
    ghost: "btn-ghost",
    peligro: "bg-ember-500/15 text-ember-400 border border-ember-500/40 hover:bg-ember-500/30 hover:-translate-y-0.5",
    jade: "bg-jade-500/15 text-jade-400 border border-jade-500/40 hover:bg-jade-500/30 hover:-translate-y-0.5",
    sutil: "text-ivory-300 hover:text-gold-400 hover:bg-night-700/60",
  }[variante];
  return <button className={`${base} ${tama} ${vari} ${className}`} {...rest}>{children}</button>;
}

export function Badge({ tono, children }: { tono: "oro" | "jade" | "ember" | "neutro" | "azul"; children: ReactNode }) {
  const t = {
    oro: "bg-gold-500/12 text-gold-400 border-gold-500/35",
    jade: "bg-jade-500/12 text-jade-400 border-jade-500/40",
    ember: "bg-ember-500/12 text-ember-400 border-ember-500/40",
    azul: "bg-night-600/50 text-ivory-300 border-ivory-500/25",
    neutro: "bg-night-700/60 text-ivory-500 border-ivory-500/20",
  }[tono];
  return <span className={`inline-flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] border rounded-full px-2.5 py-0.5 ${t}`}>{children}</span>;
}

export function EstadoOrdenBadge({ estado }: { estado: string }) {
  return <Badge tono={estado === "completado" ? "jade" : estado === "pendiente" ? "oro" : "ember"}>
    <span className={`w-1.5 h-1.5 rounded-full ${estado === "completado" ? "bg-jade-400" : estado === "pendiente" ? "bg-gold-400 anim-pulse-dot" : "bg-ember-400"}`} />
    {estado}
  </Badge>;
}

export function RolBadge({ rol }: { rol: string }) {
  return <Badge tono={rol === "administrador" ? "oro" : rol === "trabajador" ? "azul" : "jade"}>
    <Icon name={rol === "administrador" ? "corona" : rol === "trabajador" ? "pincel" : "usuario"} size={11} />{rol}
  </Badge>;
}

/* ================= campos ================= */
export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-[0.68rem] uppercase tracking-[0.22em] text-ivory-500 mb-1.5 font-medium">{label}</span>
      {children}
      {hint && <span className="block text-xs text-ivory-500/70 mt-1">{hint}</span>}
    </label>
  );
}
export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`input-sacred w-full rounded-md px-3.5 py-2.5 text-sm ${props.className || ""}`} />;
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`input-sacred w-full rounded-md px-3.5 py-2.5 text-sm cursor-pointer ${props.className || ""}`} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`input-sacred w-full rounded-md px-3.5 py-2.5 text-sm min-h-[90px] ${props.className || ""}`} />;
}

/* ================= modal ================= */
export function Modal({ abierto, onCerrar, titulo, children, ancho = "max-w-lg" }: { abierto: boolean; onCerrar: () => void; titulo: ReactNode; children: ReactNode; ancho?: string }) {
  useEffect(() => {
    if (!abierto) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onCerrar(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [abierto, onCerrar]);
  if (!abierto) return null;
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-night-950/80 backdrop-blur-sm" onClick={onCerrar} />
      <div className={`relative w-full ${ancho} anim-fade-up card-sacred rounded-xl overflow-hidden max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gold-500/15 bg-night-800/80 sticky top-0 z-10">
          <h3 className="font-display text-lg text-gold-300" style={{ fontFamily: "var(--font-display)" }}>{titulo}</h3>
          <button onClick={onCerrar} className="text-ivory-500 hover:text-ember-400 transition-colors cursor-pointer" aria-label="Cerrar"><Icon name="x" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ================= reveal en scroll ================= */
export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: 0 | 1 | 2 | 3 }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("is-in"); io.disconnect(); } }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${delay ? `reveal-d${delay}` : ""} ${className}`}>{children}</div>;
}

/* ================= varios ================= */
export function Spinner({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function Overline({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-gold-500 text-[0.7rem] font-semibold uppercase tracking-[0.4em]">
      <span className="w-8 h-px bg-gold-500/60" />{children}
    </p>
  );
}

export function IrA({ to, children, className = "" }: { to: string; children: ReactNode; className?: string }) {
  return <a href={"#" + to} className={className} onClick={(e) => { e.preventDefault(); navigate(to); }}>{children}</a>;
}

export function EstadoVacio({ icono, titulo, texto, accion }: { icono: string; titulo: string; texto: string; accion?: ReactNode }) {
  return (
    <div className="card-sacred rounded-xl p-10 text-center">
      <div className="mx-auto w-14 h-14 rounded-full grid place-items-center bg-night-700/70 text-gold-500 mb-4 border border-gold-500/20">
        <Icon name={icono} size={24} />
      </div>
      <h4 className="font-display text-lg text-ivory-100" style={{ fontFamily: "var(--font-display)" }}>{titulo}</h4>
      <p className="text-sm text-ivory-500 mt-2 max-w-sm mx-auto">{texto}</p>
      {accion && <div className="mt-5 flex justify-center">{accion}</div>}
    </div>
  );
}

export function BarraProgreso({ valor, tono = "oro" }: { valor: number; tono?: "oro" | "jade" }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-night-700 overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${tono === "oro" ? "bg-gradient-to-r from-gold-600 to-gold-400" : "bg-gradient-to-r from-jade-600 to-jade-400"}`}
        style={{ width: `${Math.min(100, Math.max(0, valor))}%` }} />
    </div>
  );
}
