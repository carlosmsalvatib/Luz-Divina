import { useMemo } from "react";

/* ============================================================
   Mandala procedural SVG — regiones rellenables + Nombre de Dios
   ============================================================ */
const C = 300;
const pt = (r: number, a: number): [number, number] => [C + r * Math.cos(a), C + r * Math.sin(a)];
const f = (n: number) => Math.round(n * 100) / 100;

function petalo(r0: number, r1: number, a: number, w: number): string {
  const [bx1, by1] = pt(r0, a - w * 0.5);
  const [bx2, by2] = pt(r0, a + w * 0.5);
  const [tx, ty] = pt(r1, a);
  const rm = r0 + (r1 - r0) * 0.55;
  const [cx1, cy1] = pt(rm, a - w * 1.08);
  const [cx2, cy2] = pt(rm, a + w * 1.08);
  return `M${f(bx1)},${f(by1)} Q${f(cx1)},${f(cy1)} ${f(tx)},${f(ty)} Q${f(cx2)},${f(cy2)} ${f(bx2)},${f(by2)} Z`;
}
function cuna(r0: number, r1: number, a0: number, a1: number): string {
  const [x1, y1] = pt(r1, a0); const [x2, y2] = pt(r1, a1);
  const [x3, y3] = pt(r0, a1); const [x4, y4] = pt(r0, a0);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${f(x1)},${f(y1)} A${r1},${r1} 0 ${large} 1 ${f(x2)},${f(y2)} L${f(x3)},${f(y3)} A${r0},${r0} 0 ${large} 0 ${f(x4)},${f(y4)} Z`;
}
function triangulo(r0: number, r1: number, a: number, w: number): string {
  const [x1, y1] = pt(r0, a - w * 0.5); const [x2, y2] = pt(r1, a); const [x3, y3] = pt(r0, a + w * 0.5);
  return `M${f(x1)},${f(y1)} L${f(x2)},${f(y2)} L${f(x3)},${f(y3)} Z`;
}
function punto(r: number, a: number, rad: number): string {
  const [cx, cy] = pt(r, a);
  return `M${f(cx - rad)},${f(cy)} A${rad},${rad} 0 1 0 ${f(cx + rad)},${f(cy)} A${rad},${rad} 0 1 0 ${f(cx - rad)},${f(cy)} Z`;
}
function disco(r: number): string {
  return `M${f(C - r)},${C} A${r},${r} 0 1 0 ${f(C + r)},${C} A${r},${r} 0 1 0 ${f(C - r)},${C} Z`;
}

export interface Region { id: string; d: string; }

function construir(variante: number): Region[] {
  const R: Region[] = [];
  let n = 0;
  const add = (d: string) => R.push({ id: "r" + n++, d });
  const TAU = Math.PI * 2;

  if (variante === 0) {
    add(disco(34));
    for (let i = 0; i < 8; i++) add(petalo(40, 118, (i / 8) * TAU, (TAU / 8) * 0.62));
    for (let i = 0; i < 12; i++) add(petalo(124, 196, (i / 12) * TAU + TAU / 24, (TAU / 12) * 0.66));
    for (let i = 0; i < 16; i++) add(punto(214, (i / 16) * TAU, 5.5));
    for (let i = 0; i < 16; i++) { const g = 0.028; add(cuna(236, 272, (i / 16) * TAU + g, ((i + 1) / 16) * TAU - g)); }
    for (let i = 0; i < 32; i++) { const g = 0.02; add(cuna(278, 296, (i / 32) * TAU + g, ((i + 1) / 32) * TAU - g)); }
  } else if (variante === 1) {
    add(disco(30));
    for (let i = 0; i < 6; i++) add(petalo(36, 130, (i / 6) * TAU, (TAU / 6) * 0.52));
    for (let i = 0; i < 12; i++) add(triangulo(136, 202, (i / 12) * TAU + TAU / 24, (TAU / 12) * 0.8));
    for (let i = 0; i < 24; i++) { const g = 0.022; add(cuna(222, 264, (i / 24) * TAU + g, ((i + 1) / 24) * TAU - g)); }
    for (let i = 0; i < 24; i++) add(punto(281, (i / 24) * TAU + TAU / 48, 6));
  } else {
    add(disco(26));
    for (let i = 0; i < 10; i++) add(petalo(32, 104, (i / 10) * TAU, (TAU / 10) * 0.6));
    for (let i = 0; i < 10; i++) add(petalo(110, 172, (i / 10) * TAU + TAU / 20, (TAU / 10) * 0.36));
    for (let i = 0; i < 20; i++) { const g = 0.026; add(cuna(198, 248, (i / 20) * TAU + g, ((i + 1) / 20) * TAU - g)); }
    for (let i = 0; i < 40; i++) { const g = 0.018; add(cuna(256, 290, (i / 40) * TAU + g, ((i + 1) / 40) * TAU - g)); }
  }
  return R;
}

export function contarRegiones(variante: number): number {
  return construir(variante).length;
}

export const RADIO_NOMBRE: Record<number, number> = { 0: 225, 1: 212, 2: 186 };

interface Props {
  variante: number;
  fills?: Record<string, string>;
  onRegion?: (id: string) => void;
  sinColor?: string;
  nombreDios?: string;
  className?: string;
  conNombres?: boolean;
  trazo?: string;
}

export function Mandala({ variante, fills = {}, onRegion, sinColor = "#fdf8ec", nombreDios = "Elohim", className = "", conNombres = true, trazo = "#2b4d58" }: Props) {
  const regiones = useMemo(() => construir(variante), [variante]);
  const nameR = RADIO_NOMBRE[variante] ?? 220;
  const slots = variante === 2 ? 10 : 12;

  return (
    <svg viewBox="0 0 600 600" className={className} role={onRegion ? "application" : "img"} aria-label={`Mandala de ${nombreDios}`}>
      <circle cx={C} cy={C} r={299} fill="#f6eede" />
      <circle cx={C} cy={C} r={299} fill="none" stroke={trazo} strokeWidth="2" opacity="0.75" />
      <circle cx={C} cy={C} r={293} fill="none" stroke={trazo} strokeWidth="0.8" opacity="0.4" strokeDasharray="1 5" />
      {regiones.map(r => (
        <path key={r.id} d={r.d}
          fill={fills[r.id] ?? sinColor}
          stroke={trazo} strokeWidth={1.3} strokeLinejoin="round"
          className={onRegion ? "region" : undefined}
          onClick={onRegion ? () => onRegion(r.id) : undefined}
        />
      ))}
      {conNombres && Array.from({ length: slots }).map((_, i) => {
        const deg = (i / slots) * 360;
        return (
          <text key={i} x={C} y={C - nameR} textAnchor="middle"
            transform={`rotate(${deg} ${C} ${C})`}
            style={{ fontFamily: "var(--font-display)", fontSize: variante === 1 ? 15 : 17, letterSpacing: "0.18em", fontWeight: 700 }}
            fill="#8a6b34" opacity="0.85" pointerEvents="none">
            {nombreDios.toUpperCase()}
          </text>
        );
      })}
    </svg>
  );
}

/* Versión lineal decorativa (hero, fondos) */
export function MandalaLineal({ className = "", girar = false, girarInverso = false }: { className?: string; girar?: boolean; girarInverso?: boolean }) {
  const regiones = useMemo(() => construir(0), []);
  return (
    <svg viewBox="0 0 600 600" className={className} aria-hidden="true">
      <g className={girar ? "anim-spin-slow" : undefined}>
        <circle cx={C} cy={C} r={298} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        {regiones.map(r => <path key={r.id} d={r.d} fill="none" stroke="currentColor" strokeWidth="0.8" />)}
        <g className={girarInverso ? "anim-spin-slower" : undefined} style={{ transformOrigin: "300px 300px" }}>
          <circle cx={C} cy={C} r={150} fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 6" />
        </g>
      </g>
    </svg>
  );
}
