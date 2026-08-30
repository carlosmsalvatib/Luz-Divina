import { useMemo, useState } from "react";
import { useApp } from "../lib/context";
import type { Ejercicio, EstadoSesion } from "../lib/data";
import { ejercicioDesbloqueado, mandalaDesbloqueado, loadPaint, fmtFecha } from "../lib/data";
import { Icon, Btn, Badge, Reveal, Overline, IrA, EstadoVacio, Modal, BarraProgreso, RolBadge } from "../components/ui";
import { Mandala, contarRegiones } from "../components/Mandala";
import { HistorialOrdenes } from "./Shop";

/* ---------- progreso de ejercicios (por usuario) ---------- */
function loadProg(userId: string): Record<string, number[]> {
  try { return JSON.parse(localStorage.getItem(`ld_prog_${userId}`) || "{}"); } catch { return {}; }
}
function saveProg(userId: string, p: Record<string, number[]>) {
  localStorage.setItem(`ld_prog_${userId}`, JSON.stringify(p));
}

/* ============================================================
   MI ESPACIO — área del cliente
   ============================================================ */
export function MiEspacio() {
  const { db, user, mutate, toast } = useApp();
  const [tab, setTab] = useState<"ejercicios" | "mandalas" | "compras">("ejercicios");
  const [ejActivo, setEjActivo] = useState<Ejercicio | null>(null);
  const [, force] = useState(0);
  if (!user) return null;

  const prog = loadProg(user.id);
  const desbloq = (e: Ejercicio) => ejercicioDesbloqueado(db, user.id, e.id);
  const libres = db.ejercicios.filter(desbloq).sort((a, b) => a.orden - b.orden);
  const bloqueados = db.ejercicios.filter(e => !desbloq(e));
  const mandalasLibres = db.mandalas.filter(m => m.activo && mandalaDesbloqueado(db, user.id, m.id));
  const mandalasBloq = db.mandalas.filter(m => m.activo && !mandalaDesbloqueado(db, user.id, m.id));
  const completados = libres.filter(e => (prog[e.id]?.length ?? 0) >= e.pasos.length).length;

  const pintarProgreso = (e: Ejercicio) => Math.round(((prog[e.id]?.length ?? 0) / e.pasos.length) * 100);

  const togglePaso = (e: Ejercicio, idx: number) => {
    const actual = prog[e.id] ?? [];
    const nuevo = actual.includes(idx) ? actual.filter(i => i !== idx) : [...actual, idx];
    const next = { ...prog, [e.id]: nuevo };
    saveProg(user.id, next);
    const pct = Math.round((nuevo.length / e.pasos.length) * 100);
    mutate(d => {
      const s = d.sesiones.find(x => x.usuarioId === user.id && x.ejercicioId === e.id);
      const estado: EstadoSesion = pct >= 100 ? "completada" : pct > 0 ? "en-curso" : "pendiente";
      if (s) { s.progreso = pct; s.estado = estado; s.actualizadoEn = new Date().toISOString(); }
      else d.sesiones.push({ id: "s" + Date.now().toString(36), usuarioId: user.id, ejercicioId: e.id, estado, progreso: pct, actualizadoEn: new Date().toISOString() });
    });
    if (pct >= 100) toast("ok", "Ejercicio completado", `«${e.titulo}» quedó sellado en tu camino. El taller lo verá en tiempo real.`);
    force(x => x + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
      <Reveal><Overline>Área del cliente</Overline></Reveal>
      <Reveal delay={1}>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
          <h1 className="text-3xl sm:text-5xl text-ivory-50 font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Mi espacio de <span className="text-gold-400">contemplación</span>
          </h1>
          <div className="flex gap-6 text-center">
            {[{ n: libres.length, l: "ejercicios libres" }, { n: completados, l: "completados" }, { n: mandalasLibres.length, l: "mandalas" }].map(s => (
              <div key={s.l}>
                <p className="text-3xl text-gold-400 font-bold" style={{ fontFamily: "var(--font-display)" }}>{s.n}</p>
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-ivory-500 mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={2}>
        <div className="mt-10 flex gap-2 border-b border-ivory-500/15">
          {([["ejercicios", "libro", "Mis ejercicios"], ["mandalas", "pincel", "Mis mandalas"], ["compras", "tarjeta", "Mis compras"]] as const).map(([t, ic, lb]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium inline-flex items-center gap-2 border-b-2 -mb-px transition-all cursor-pointer ${tab === t ? "border-gold-500 text-gold-300" : "border-transparent text-ivory-500 hover:text-ivory-100"}`}>
              <Icon name={ic} size={15} /> {lb}
            </button>
          ))}
        </div>
      </Reveal>

      {/* -------- ejercicios -------- */}
      {tab === "ejercicios" && (
        <div className="mt-10 grid lg:grid-cols-2 gap-5">
          {libres.map((e, i) => (
            <Reveal key={e.id} delay={(i % 2) as 0 | 1}>
              <article className="card-sacred rounded-xl p-6 h-full flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.22em] text-ivory-500">Práctica {e.orden} · {e.tipo} · {e.duracion} min</p>
                    <h3 className="mt-1.5 text-xl text-ivory-50 font-semibold" style={{ fontFamily: "var(--font-display)" }}>{e.titulo}</h3>
                  </div>
                  <span className={`w-11 h-11 rounded-full grid place-items-center border shrink-0 ${pintarProgreso(e) >= 100 ? "border-jade-500/60 text-jade-400 bg-jade-500/10" : "border-gold-500/40 text-gold-400 bg-gold-500/8"}`}>
                    <Icon name={pintarProgreso(e) >= 100 ? "check" : "vela"} size={18} />
                  </span>
                </div>
                <p className="mt-2.5 text-sm text-ivory-500 flex-1">{e.descripcion}</p>
                <div className="mt-4"><BarraProgreso valor={pintarProgreso(e)} tono={pintarProgreso(e) >= 100 ? "jade" : "oro"} /></div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-ivory-500">{pintarProgreso(e)}% del camino</span>
                  <Btn tam="sm" variante={pintarProgreso(e) >= 100 ? "jade" : "gold"} onClick={() => setEjActivo(e)}>
                    {pintarProgreso(e) >= 100 ? <><Icon name="refrescar" size={13} /> Repasar</> : <><Icon name="chispa" size={13} /> Practicar</>}
                  </Btn>
                </div>
              </article>
            </Reveal>
          ))}
          {bloqueados.map(e => (
            <article key={e.id} className="rounded-xl border border-dashed border-ivory-500/25 p-6 opacity-70">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.22em] text-ivory-500">Práctica {e.orden} · bloqueada</p>
                  <h3 className="mt-1.5 text-xl text-ivory-300 font-semibold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                    <Icon name="candado" size={16} className="text-ivory-500" /> {e.titulo}
                  </h3>
                </div>
              </div>
              <p className="mt-2.5 text-sm text-ivory-500">{e.descripcion}</p>
              <IrA to="/catalogo/i4" className="mt-4 inline-flex items-center gap-2 text-sm text-gold-400 font-medium hover:gap-3 transition-all">
                Liberar con el Camino de Contemplación · $59 <Icon name="flecha" size={14} />
              </IrA>
            </article>
          ))}
        </div>
      )}

      {/* -------- mandalas -------- */}
      {tab === "mandalas" && (
        <div className="mt-10">
          {mandalasLibres.length === 0 ? (
            <EstadoVacio icono="pincel" titulo="Aún no tienes mandalas" texto="Adquiere la Colección Mandalas Sagrados para colorear, guardar e imprimir tus obras."
              accion={<IrA to="/catalogo/i8"><Btn><Icon name="carrito" /> Ver colección · $29</Btn></IrA>} />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {mandalasLibres.map((m, i) => {
                const fills = loadPaint(user.id, m.id);
                const total = contarRegiones(m.variante);
                const pct = total ? Math.round((Object.keys(fills).length / total) * 100) : 0;
                return (
                  <Reveal key={m.id} delay={(i % 4) as 0 | 1 | 2 | 3}>
                    <IrA to={`/juego/${m.id}`} className="block group">
                      <article className="card-sacred rounded-xl p-5 text-center">
                        <div className="mx-auto w-36 h-36 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-12">
                          <Mandala variante={m.variante} nombreDios={m.nombreDios} fills={fills} className="w-full h-full" />
                        </div>
                        <h3 className="mt-4 text-base text-ivory-50 font-semibold" style={{ fontFamily: "var(--font-display)" }}>{m.nombre}</h3>
                        <div className="mt-2"><BarraProgreso valor={pct} /></div>
                        <p className="mt-2 text-xs text-ivory-500">{pct > 0 ? `${pct}% coloreado · continuar` : "Comenzar a colorear"}</p>
                      </article>
                    </IrA>
                  </Reveal>
                );
              })}
            </div>
          )}
          {mandalasBloq.length > 0 && (
            <div className="mt-10">
              <p className="text-[0.7rem] uppercase tracking-[0.26em] text-ivory-500 mb-4">Por liberar</p>
              <div className="grid sm:grid-cols-3 gap-5">
                {mandalasBloq.map(m => (
                  <article key={m.id} className="rounded-xl border border-dashed border-ivory-500/25 p-5 text-center opacity-75 relative">
                    <span className="absolute top-3 right-3 w-8 h-8 grid place-items-center rounded-full bg-night-950/80 border border-gold-500/30 text-gold-400"><Icon name="candado" size={14} /></span>
                    <div className="mx-auto w-28 h-28 opacity-60"><Mandala variante={m.variante} nombreDios={m.nombreDios} className="w-full h-full" /></div>
                    <h3 className="mt-3 text-sm text-ivory-300 font-semibold" style={{ fontFamily: "var(--font-display)" }}>{m.nombre}</h3>
                  </article>
                ))}
              </div>
              <div className="mt-6"><IrA to="/catalogo/i8"><Btn variante="ghost"><Icon name="carrito" /> Liberar la colección completa · $29</Btn></IrA></div>
            </div>
          )}
        </div>
      )}

      {/* -------- compras -------- */}
      {tab === "compras" && <div className="mt-10 max-w-3xl"><HistorialOrdenes /></div>}

      {/* -------- modal de práctica -------- */}
      <Modal abierto={!!ejActivo} onCerrar={() => setEjActivo(null)} titulo={ejActivo?.titulo ?? ""} ancho="max-w-2xl">
        {ejActivo && (
          <div>
            <p className="text-sm text-ivory-500">{ejActivo.descripcion}</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex-1"><BarraProgreso valor={pintarProgreso(ejActivo)} tono={pintarProgreso(ejActivo) >= 100 ? "jade" : "oro"} /></div>
              <span className="text-sm text-gold-300 font-semibold shrink-0">{pintarProgreso(ejActivo)}%</span>
            </div>
            <ol className="mt-6 space-y-2.5">
              {ejActivo.pasos.map((p, i) => {
                const hecho = (prog[ejActivo.id] ?? []).includes(i);
                return (
                  <li key={i}>
                    <button onClick={() => togglePaso(ejActivo, i)}
                      className={`w-full text-left flex gap-3.5 items-start rounded-lg border px-4 py-3 transition-all cursor-pointer ${hecho ? "border-jade-500/50 bg-jade-500/8" : "border-ivory-500/15 bg-night-950/50 hover:border-gold-500/50"}`}>
                      <span className={`w-6 h-6 rounded-full grid place-items-center border shrink-0 mt-0.5 transition-all ${hecho ? "bg-jade-500 border-jade-500 text-night-900" : "border-ivory-500/40 text-transparent"}`}>
                        <Icon name="check" size={13} strokeWidth={2.4} />
                      </span>
                      <span className={`text-sm leading-relaxed ${hecho ? "text-ivory-300 line-through decoration-jade-500/50" : "text-ivory-100"}`}>
                        <span className="text-gold-500 font-semibold mr-2" style={{ fontFamily: "var(--font-display)" }}>{i + 1}.</span>{p}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            {pintarProgreso(ejActivo) >= 100 && (
              <p className="mt-5 text-sm text-jade-400 bg-jade-500/10 border border-jade-500/40 rounded-md px-4 py-3 flex items-center gap-2 anim-fade-up">
                <Icon name="chispa" size={15} /> Camino completo. El guía del taller ya puede ver tu avance.
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ============================================================
   TALLER — área del trabajador (guía de ejercicios)
   ============================================================ */
export function Taller() {
  const { db, mutate, toast } = useApp();
  const [filtro, setFiltro] = useState<"todas" | EstadoSesion>("todas");

  const sesiones = useMemo(() => db.sesiones
    .filter(s => filtro === "todas" || s.estado === filtro)
    .sort((a, b) => b.actualizadoEn.localeCompare(a.actualizadoEn)), [db.sesiones, filtro]);

  const stats = {
    activas: db.sesiones.filter(s => s.estado === "en-curso").length,
    pendientes: db.sesiones.filter(s => s.estado === "pendiente").length,
    completadas: db.sesiones.filter(s => s.estado === "completada").length,
  };

  const actualizar = (id: string, campo: Partial<{ estado: EstadoSesion; progreso: number }>) => {
    mutate(d => {
      const s = d.sesiones.find(x => x.id === id);
      if (!s) return;
      Object.assign(s, campo);
      if (campo.progreso !== undefined) s.estado = campo.progreso >= 100 ? "completada" : campo.progreso > 0 ? "en-curso" : "pendiente";
      s.actualizadoEn = new Date().toISOString();
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
      <Reveal><Overline>Área del trabajador</Overline></Reveal>
      <Reveal delay={1}>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-5xl text-ivory-50 font-bold" style={{ fontFamily: "var(--font-display)" }}>El taller de <span className="text-jade-400">las almas</span></h1>
            <p className="mt-3 text-ivory-300 flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-jade-400 anim-pulse-dot" />
              Sincronizado en tiempo real con el progreso de cada cliente.
            </p>
          </div>
          <div className="flex gap-6 text-center">
            {[{ n: stats.activas, l: "en curso", t: "text-gold-400" }, { n: stats.pendientes, l: "pendientes", t: "text-ivory-300" }, { n: stats.completadas, l: "completadas", t: "text-jade-400" }].map(s => (
              <div key={s.l}>
                <p className={`text-3xl font-bold ${s.t}`} style={{ fontFamily: "var(--font-display)" }}>{s.n}</p>
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-ivory-500 mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={2}>
        <div className="mt-8 flex flex-wrap gap-2">
          {(["todas", "pendiente", "en-curso", "completada"] as const).map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-full text-sm border transition-all cursor-pointer capitalize ${filtro === f ? "bg-jade-500 text-night-900 border-jade-500 font-semibold" : "border-ivory-500/25 text-ivory-300 hover:border-jade-500/60"}`}>
              {f === "todas" ? "Todas las sesiones" : f.replace("-", " ")}
            </button>
          ))}
        </div>
      </Reveal>

      {sesiones.length === 0 ? (
        <div className="mt-12"><EstadoVacio icono="libro" titulo="Sin sesiones aquí" texto="Cuando los clientes avancen en sus ejercicios, sus sesiones aparecerán para que las acompañes." /></div>
      ) : (
        <div className="mt-8 space-y-4">
          {sesiones.map(s => {
            const u = db.usuarios.find(x => x.id === s.usuarioId);
            const e = db.ejercicios.find(x => x.id === s.ejercicioId);
            if (!u || !e) return null;
            return (
              <div key={s.id} className="card-sacred rounded-xl p-5 grid md:grid-cols-12 gap-5 items-center anim-fade-up">
                <div className="md:col-span-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full grid place-items-center bg-night-700 border border-gold-500/25 text-gold-300 font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                      {u.nombre.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-ivory-50 font-medium truncate">{u.nombre}</p>
                      <p className="text-xs text-ivory-500 flex items-center gap-1.5 mt-0.5"><RolBadge rol={u.rol} /></p>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-ivory-500">Ejercicio</p>
                  <p className="text-sm text-ivory-100 mt-1" style={{ fontFamily: "var(--font-display)" }}>{e.titulo}</p>
                </div>
                <div className="md:col-span-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-ivory-500">Progreso</span>
                    <span className={`font-semibold ${s.progreso >= 100 ? "text-jade-400" : "text-gold-300"}`}>{s.progreso}%</span>
                  </div>
                  <input type="range" min={0} max={100} step={5} value={s.progreso}
                    onChange={ev => actualizar(s.id, { progreso: Number(ev.target.value) })}
                    className="w-full accent-[#e3b65f] cursor-pointer" />
                  <p className="text-[0.65rem] text-ivory-500 mt-1.5">Actualizado {fmtFecha(s.actualizadoEn)}</p>
                </div>
                <div className="md:col-span-2 flex md:flex-col gap-2 items-center md:items-end">
                  <select value={s.estado} onChange={ev => { actualizar(s.id, { estado: ev.target.value as EstadoSesion, progreso: ev.target.value === "completada" ? 100 : s.progreso }); toast("ok", "Sesión actualizada", `${u.nombre} · ${ev.target.value.replace("-", " ")}`); }}
                    className="input-sacred rounded-md px-2.5 py-1.5 text-xs capitalize cursor-pointer">
                    <option value="pendiente">Pendiente</option>
                    <option value="en-curso">En curso</option>
                    <option value="completada">Completada</option>
                  </select>
                  <EstadoOrdenBadgeMiniSesion estado={s.estado} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EstadoOrdenBadgeMiniSesion({ estado }: { estado: EstadoSesion }) {
  return <Badge tono={estado === "completada" ? "jade" : estado === "en-curso" ? "oro" : "neutro"}>{estado.replace("-", " ")}</Badge>;
}
