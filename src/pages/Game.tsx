import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApp, navigate } from "../lib/context";
import { PALETA_SAGRADA, loadPaint, savePaint, mandalaDesbloqueado, paletaOriginal } from "../lib/data";
import { Icon, Btn, Badge, Reveal, Overline, IrA, EstadoVacio, BarraProgreso } from "../components/ui";
import { Mandala, contarRegiones } from "../components/Mandala";

type Herramienta = "relleno" | "borrador" | "cuentagotas";

/* campana suave con WebAudio */
let ctxAudio: AudioContext | null = null;
function campana(activado: boolean) {
  if (!activado) return;
  try {
    ctxAudio = ctxAudio ?? new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const t = ctxAudio.currentTime;
    [523.25, 783.99].forEach((frec, i) => {
      const osc = ctxAudio!.createOscillator();
      const gain = ctxAudio!.createGain();
      osc.type = "sine";
      osc.frequency.value = frec;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.09, t + 0.02 + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1 + i * 0.2);
      osc.connect(gain).connect(ctxAudio!.destination);
      osc.start(t + i * 0.03);
      osc.stop(t + 1.6);
    });
  } catch { /* sin audio */ }
}

const rgbAHex = (r: number, g: number, b: number) => "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
const hexARgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};

/* ================= GALERÍA DEL JUEGO ================= */
export function JuegoGaleria() {
  const { db, user } = useApp();
  if (!user) return null;
  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
      <Reveal><Overline>El juego de los Nombres</Overline></Reveal>
      <Reveal delay={1}>
        <h1 className="mt-4 text-3xl sm:text-5xl text-ivory-50 font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Elige tu <span className="text-gold-400">mandala</span>
        </h1>
        <p className="mt-3 text-ivory-300 max-w-2xl">
          Cada mandala lleva su Nombre escrito en el anillo. Tu avance se guarda automáticamente
          en esta sesión y puedes retomarlo cuando vuelvas — o imprimirlo terminado.
        </p>
      </Reveal>
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {db.mandalas.filter(m => m.activo).map((m, i) => {
          const libre = mandalaDesbloqueado(db, user.id, m.id);
          const fills = loadPaint(user.id, m.id);
          const pct = Math.round((Object.keys(fills).length / contarRegiones(m.variante)) * 100);
          return (
            <Reveal key={m.id} delay={(i % 4) as 0 | 1 | 2 | 3}>
              {libre ? (
                <IrA to={`/juego/${m.id}`} className="block group h-full">
                  <article className="card-sacred rounded-xl p-5 text-center h-full flex flex-col">
                    {m.id === "m1" && <span className="self-start"><Badge tono="jade">Gratis</Badge></span>}
                    {pct > 0 && pct < 100 && <span className="self-start"><Badge tono="oro">En progreso · {pct}%</Badge></span>}
                    {pct >= 100 && <span className="self-start"><Badge tono="jade">Obra completa</Badge></span>}
                    <div className="mx-auto w-40 h-40 my-4 transition-transform duration-700 group-hover:rotate-[25deg] group-hover:scale-105">
                      <Mandala variante={m.variante} nombreDios={m.nombreDios} fills={fills} className="w-full h-full" />
                    </div>
                    <h3 className="text-base text-ivory-50 font-semibold" style={{ fontFamily: "var(--font-display)" }}>{m.nombre}</h3>
                    <p className="mt-1 text-xs text-ivory-500 italic flex-1">{m.significado}</p>
                    <span className="mt-4 inline-flex items-center justify-center gap-2 text-gold-400 text-sm font-medium">
                      <Icon name="pincel" size={14} /> {pct > 0 ? "Continuar" : "Comenzar"}
                    </span>
                  </article>
                </IrA>
              ) : (
                <article className="rounded-xl border border-dashed border-ivory-500/25 p-5 text-center h-full flex flex-col items-center relative opacity-80">
                  <span className="w-9 h-9 grid place-items-center rounded-full bg-night-950/80 border border-gold-500/30 text-gold-400"><Icon name="candado" size={16} /></span>
                  <div className="w-36 h-36 my-4 opacity-50"><Mandala variante={m.variante} nombreDios={m.nombreDios} className="w-full h-full" /></div>
                  <h3 className="text-base text-ivory-300 font-semibold" style={{ fontFamily: "var(--font-display)" }}>{m.nombre}</h3>
                  <p className="mt-1 text-xs text-ivory-500 italic">{m.significado}</p>
                  <IrA to="/catalogo/i8" className="mt-4"><Btn tam="sm" variante="ghost"><Icon name="rayo" size={13} /> Liberar · $29</Btn></IrA>
                </article>
              )}
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

/* ================= LIENZO DE COLOREAR ================= */
export function JuegoLienzo({ mandalaId }: { mandalaId: string }) {
  const { db, user, toast } = useApp();
  const mandala = db.mandalas.find(m => m.id === mandalaId && m.activo);
  const [fills, setFills] = useState<Record<string, string>>(() => (user && mandala ? loadPaint(user.id, mandala.id) : {}));
  const [color, setColor] = useState(PALETA_SAGRADA[0]);
  const [rgb, setRgb] = useState<[number, number, number]>(hexARgb(PALETA_SAGRADA[0]));
  const [herramienta, setHerramienta] = useState<Herramienta>("relleno");
  const [historial, setHistorial] = useState<Record<string, string>[]>([]);
  const [guardadoEn, setGuardadoEn] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [sonidoOn, setSonidoOn] = useState(true);
  const [mostrarOriginal, setMostrarOriginal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [confirmaLimpiar, setConfirmaLimpiar] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = mandala ? contarRegiones(mandala.variante) : 0;
  const pintados = Object.keys(fills).length;
  const pct = total ? Math.round((pintados / total) * 100) : 0;

  /* autoguardado con debounce */
  useEffect(() => {
    if (!user || !mandala) return;
    setGuardando(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      savePaint(user.id, mandala.id, fills);
      setGuardadoEn(new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setGuardando(false);
    }, 450);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [fills, user, mandala]);

  const elegirColor = useCallback((c: string) => { setColor(c); setRgb(hexARgb(c)); }, []);

  const aplicar = useCallback((regionId: string) => {
    if (!mandala) return;
    if (herramienta === "cuentagotas") {
      const c = fills[regionId];
      if (c) { elegirColor(c); toast("info", "Color capturado", c); }
      return;
    }
    setHistorial(h => [...h.slice(-39), fills]);
    setFills(prev => {
      const next = { ...prev };
      if (herramienta === "borrador") delete next[regionId];
      else next[regionId] = color;
      return next;
    });
    if (herramienta === "relleno" && mandala.sonido && sonidoOn) campana(true);
  }, [herramienta, fills, color, mandala, sonidoOn, elegirColor, toast]);

  const deshacer = () => {
    setHistorial(h => {
      if (h.length === 0) return h;
      setFills(h[h.length - 1]);
      return h.slice(0, -1);
    });
  };

  if (!user) return null;
  if (!mandala) return <div className="max-w-2xl mx-auto px-5 py-24"><EstadoVacio icono="flor" titulo="Mandala no disponible" texto="Puede que el administrador lo haya retirado del catálogo." accion={<IrA to="/juego"><Btn>Volver al juego</Btn></IrA>} /></div>;
  if (!mandalaDesbloqueado(db, user.id, mandala.id)) return (
    <div className="max-w-2xl mx-auto px-5 py-24">
      <EstadoVacio icono="candado" titulo="Este mandala aún no es tuyo"
        texto={`«${mandala.nombre}» se libera con la Colección Mandalas Sagrados. El webhook lo abrirá al instante tras el pago.`}
        accion={<IrA to="/catalogo/i8"><Btn><Icon name="rayo" size={15} /> Liberar colección · $29</Btn></IrA>} />
    </div>
  );

  const herramientas: { id: Herramienta; icon: string; label: string }[] = [
    { id: "relleno", icon: "relleno", label: "Relleno por área" },
    { id: "borrador", icon: "borrador", label: "Devolver al papel" },
    { id: "cuentagotas", icon: "cuentagotas", label: "Cuentagotas" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
      {/* barra superior */}
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <button onClick={() => navigate("/juego")} className="w-10 h-10 grid place-items-center rounded-full border border-ivory-500/25 text-ivory-300 hover:text-gold-400 hover:border-gold-500/60 transition-all cursor-pointer shrink-0" aria-label="Volver">
            <Icon name="flecha" size={16} className="rotate-180" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl text-ivory-50 font-bold truncate" style={{ fontFamily: "var(--font-display)" }}>{mandala.nombre}</h1>
            <p className="text-xs text-ivory-500 italic truncate">{mandala.nombreDios} · {mandala.significado}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${guardando ? "border-gold-500/40 text-gold-300" : "border-jade-500/40 text-jade-400"} bg-night-800/80`}>
            <span className={`w-1.5 h-1.5 rounded-full ${guardando ? "bg-gold-400 anim-pulse-dot" : "bg-jade-400"}`} />
            {guardando ? "Guardando…" : guardadoEn ? `Guardado ${guardadoEn}` : "Guardado automático"}
          </span>
          <Btn tam="sm" variante="ghost" onClick={() => setMostrarOriginal(v => !v)}>
            <Icon name="ojo" size={13} /> {mostrarOriginal ? "Ocultar original" : "Ver original"}
          </Btn>
          <Btn tam="sm" variante="ghost" onClick={() => setSonidoOn(v => !v)}>
            <Icon name={sonidoOn ? "sonido" : "silencio"} size={13} /> {sonidoOn ? "Sonido" : "Silencio"}
          </Btn>
          <Btn tam="sm" onClick={() => { window.print(); toast("ok", "Enviado a impresión", "Tu mandala terminado, listo para el papel."); }}>
            <Icon name="imprimir" size={13} /> Imprimir obra
          </Btn>
        </div>
      </div>

      {/* progreso */}
      <div className="mt-5 flex items-center gap-4">
        <div className="flex-1"><BarraProgreso valor={pct} tono={pct >= 100 ? "jade" : "oro"} /></div>
        <span className="text-sm text-gold-300 font-semibold shrink-0" style={{ fontFamily: "var(--font-display)" }}>{pct}% · {pintados}/{total} áreas</span>
      </div>
      {pct >= 100 && (
        <p className="mt-3 text-sm text-jade-400 bg-jade-500/10 border border-jade-500/40 rounded-md px-4 py-2.5 inline-flex items-center gap-2 anim-fade-up">
          <Icon name="chispa" size={15} /> Obra completa — {mandala.nombreDios} resplandece. Imprímela o comienza de nuevo.
        </p>
      )}

      <div className="mt-6 grid lg:grid-cols-[220px_1fr_260px] gap-6 items-start">
        {/* herramientas */}
        <div className="card-sacred rounded-xl p-4 order-2 lg:order-1">
          <p className="text-[0.65rem] uppercase tracking-[0.24em] text-ivory-500 mb-3">Herramientas</p>
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
            {herramientas.map(h => (
              <button key={h.id} onClick={() => setHerramienta(h.id)} title={h.label}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm transition-all cursor-pointer ${herramienta === h.id ? "border-gold-500 bg-gold-500/15 text-gold-300" : "border-ivory-500/20 text-ivory-300 hover:border-gold-500/50"}`}>
                <Icon name={h.icon} size={16} /> <span className="hidden lg:inline text-xs">{h.label}</span>
              </button>
            ))}
          </div>
          <div className="gold-rule my-4" />
          <div className="flex items-center justify-between mb-3">
            <p className="text-[0.65rem] uppercase tracking-[0.24em] text-ivory-500">Zoom</p>
            <div className="flex gap-1.5">
              <button className="w-7 h-7 grid place-items-center rounded border border-ivory-500/25 hover:border-gold-500/60 cursor-pointer" onClick={() => setZoom(z => Math.max(0.6, +(z - 0.2).toFixed(1)))} aria-label="Alejar"><Icon name="menos" size={12} /></button>
              <span className="text-xs text-ivory-300 w-10 text-center self-center">{Math.round(zoom * 100)}%</span>
              <button className="w-7 h-7 grid place-items-center rounded border border-ivory-500/25 hover:border-gold-500/60 cursor-pointer" onClick={() => setZoom(z => Math.min(1.8, +(z + 0.2).toFixed(1)))} aria-label="Acercar"><Icon name="mas" size={12} /></button>
            </div>
          </div>
          <div className="grid gap-2">
            <Btn tam="sm" variante="ghost" onClick={deshacer} disabled={historial.length === 0}><Icon name="deshacer" size={13} /> Deshacer ({historial.length})</Btn>
            {confirmaLimpiar ? (
              <div className="rounded-lg border border-ember-500/40 bg-ember-500/10 p-3 text-xs anim-fade-up">
                <p className="text-ember-400 mb-2">¿Borrar toda la obra?</p>
                <div className="flex gap-2">
                  <Btn tam="sm" variante="peligro" onClick={() => { setHistorial(h => [...h, fills]); setFills({}); toast("info", "Lienzo en blanco", "Puedes deshacer si te arrepientes."); setConfirmaLimpiar(false); }}>Sí, limpiar</Btn>
                  <Btn tam="sm" variante="sutil" onClick={() => setConfirmaLimpiar(false)}>No</Btn>
                </div>
              </div>
            ) : (
              <Btn tam="sm" variante="peligro" onClick={() => setConfirmaLimpiar(true)} disabled={pintados === 0}><Icon name="borrador" size={13} /> Limpiar lienzo</Btn>
            )}
          </div>
        </div>

        {/* lienzo */}
        <div className="order-1 lg:order-2 relative">
          {mostrarOriginal && (
            <div className="absolute z-20 top-2 right-2 w-40 card-sacred rounded-lg p-2 anim-fade-up">
              {mandala.imagenOriginal
                ? <img src={mandala.imagenOriginal} alt="Color original" className="w-full rounded" />
                : <Mandala variante={mandala.variante} nombreDios={mandala.nombreDios} fills={paletaOriginal(mandala.variante)} conNombres={false} className="w-full" />}
              <p className="text-[0.6rem] text-center text-ivory-500 mt-1 uppercase tracking-[0.2em]">Color original</p>
            </div>
          )}
          <div className="print-area card-sacred rounded-xl p-4 sm:p-8 overflow-auto">
            <div className="mx-auto transition-transform duration-300" style={{ width: `min(100%, ${Math.round(560 * zoom)}px)` }}>
              <Mandala variante={mandala.variante} nombreDios={mandala.nombreDios} fills={fills} onRegion={aplicar} className="w-full h-auto drop-shadow-[0_18px_50px_rgba(0,0,0,0.55)]" />
            </div>
            <p className="print-title hidden print:block text-center mt-4" style={{ fontFamily: "var(--font-display)" }}>
              {mandala.nombre} · {mandala.nombreDios} — Luz Divina
            </p>
          </div>
          <p className="mt-3 text-center text-xs text-ivory-500">
            Toca un área para {herramienta === "relleno" ? `pintarla de ${color}` : herramienta === "borrador" ? "devolverla al papel" : "capturar su color"} · el avance se guarda solo
          </p>
        </div>

        {/* paleta */}
        <div className="card-sacred rounded-xl p-4 order-3">
          <p className="text-[0.65rem] uppercase tracking-[0.24em] text-ivory-500 mb-3">Paleta sagrada</p>
          <div className="grid grid-cols-6 lg:grid-cols-5 gap-2">
            {PALETA_SAGRADA.map(c => (
              <button key={c} onClick={() => elegirColor(c)} title={c}
                className={`aspect-square rounded-md border-2 transition-all cursor-pointer hover:scale-110 ${color === c ? "border-ivory-50 scale-110 shadow-[0_0_14px_rgba(227,182,95,0.5)]" : "border-night-950/60"}`}
                style={{ background: c }} aria-label={`Color ${c}`} />
            ))}
          </div>

          <div className="gold-rule my-4" />
          <p className="text-[0.65rem] uppercase tracking-[0.24em] text-ivory-500 mb-3">Mezcla RGB</p>
          {(["R", "G", "B"] as const).map((canal, i) => (
            <div key={canal} className="flex items-center gap-3 mb-2.5">
              <span className="w-4 text-xs font-bold" style={{ color: ["#e89563", "#7d9c55", "#7fc3d9"][i] }}>{canal}</span>
              <input type="range" min={0} max={255} value={rgb[i]}
                onChange={e => {
                  const nuevo: [number, number, number] = [...rgb] as [number, number, number];
                  nuevo[i] = Number(e.target.value);
                  setRgb(nuevo); setColor(rgbAHex(...nuevo));
                }}
                className="flex-1 cursor-pointer" style={{ accentColor: ["#e89563", "#7d9c55", "#7fc3d9"][i] }} />
              <span className="text-xs text-ivory-500 w-8 text-right">{rgb[i]}</span>
            </div>
          ))}
          <div className="flex items-center gap-3 mt-3">
            <span className="w-12 h-12 rounded-lg border-2 border-night-950/70 shadow-inner shrink-0 transition-colors" style={{ background: color }} />
            <div className="flex-1">
              <input value={color} onChange={e => { const v = e.target.value; setColor(v); if (/^#[0-9a-fA-F]{6}$/.test(v)) setRgb(hexARgb(v)); }}
                className="input-sacred w-full rounded-md px-3 py-2 text-sm font-mono uppercase" maxLength={7} aria-label="Color hexadecimal" />
              <p className="text-[0.65rem] text-ivory-500 mt-1">Hex · escribe #RRGGBB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
