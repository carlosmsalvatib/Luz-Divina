import { useMemo } from "react";
import { useApp } from "../lib/context";
import { NOMBRES_DE_DIOS, fmtMoney, mandalaDesbloqueado, ejercicioDesbloqueado } from "../lib/data";
import { Icon, Btn, Reveal, Overline, IrA, Badge } from "../components/ui";
import { Mandala, MandalaLineal } from "../components/Mandala";

function Particulas() {
  const pts = useMemo(() => Array.from({ length: 16 }).map((_, i) => ({
    left: `${(i * 61) % 100}%`, top: `${(i * 37 + 11) % 100}%`,
    size: 3 + (i % 4) * 2, dur: 7 + (i % 5) * 2, delay: (i % 6) * 1.3,
  })), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pts.map((p, i) => (
        <span key={i} className="particle" style={{ left: p.left, top: p.top, width: p.size, height: p.size, ["--dur" as string]: `${p.dur}s`, ["--delay" as string]: `${p.delay}s` }} />
      ))}
    </div>
  );
}

export default function Home() {
  const { db, user, agregarCarrito, toast } = useApp();
  const destacados = db.items.filter(i => i.activo && i.imagen).slice(0, 3);
  const mandalas = db.mandalas.filter(m => m.activo);

  return (
    <div className="relative">
      {/* ============ APERTURA: el mandala respira ============ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <Particulas />
        <div className="absolute inset-y-0 right-[-12%] w-[70%] opacity-[0.13] text-gold-500 pointer-events-none hidden md:block">
          <MandalaLineal className="w-full h-full" girar girarInverso />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 w-full grid lg:grid-cols-12 gap-14 items-center py-24">
          <div className="lg:col-span-6">
            <Reveal><Overline>Plataforma contemplativa · luzdivina.net</Overline></Reveal>
            <Reveal delay={1}>
              <h1 className="mt-6 font-bold leading-[1.04] text-ivory-50" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.6rem, 5.4vw, 4.6rem)" }}>
                Los Nombres de&nbsp;Dios, hechos <span className="text-gold-400">luz</span> en tus manos.
              </h1>
            </Reveal>
            <Reveal delay={2}>
              <p className="mt-6 text-lg text-ivory-300 max-w-xl leading-relaxed font-light">
                Un catálogo sagrado, ejercicios de contemplación guiada y un juego para colorear
                mandalas con los Nombres. Compra una vez y el contenido se libera al instante,
                confirmado por webhook.
              </p>
            </Reveal>
            <Reveal delay={3}>
              <div className="mt-9 flex flex-wrap gap-4">
                <IrA to="/catalogo"><Btn tam="lg"><Icon name="flor" /> Explorar el catálogo</Btn></IrA>
                <IrA to={user ? "/juego" : "/acceso"}><Btn tam="lg" variante="ghost"><Icon name="pincel" /> Colorear un mandala</Btn></IrA>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-ivory-500">
                <span className="flex items-center gap-2"><Icon name="chispa" size={15} className="text-gold-500" /> {NOMBRES_DE_DIOS.length} Nombres meditados</span>
                <span className="flex items-center gap-2"><Icon name="flor" size={15} className="text-gold-500" /> {mandalas.length} mandalas vivos</span>
                <span className="flex items-center gap-2"><Icon name="escudo" size={15} className="text-gold-500" /> Pago seguro · SSL</span>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-6 relative hidden sm:block">
            <Reveal delay={1}>
              <div className="relative mx-auto w-[min(88vw,540px)] aspect-square">
                <div className="absolute inset-[-6%] text-gold-500/50 anim-spin-slow"><MandalaLineal className="w-full h-full" /></div>
                <div className="absolute inset-[6%] anim-breathe">
                  <Mandala variante={0} conNombres nombreDios="Elohim" className="w-full h-full drop-shadow-[0_20px_60px_rgba(0,0,0,0.5)]" />
                </div>
                {["El Shaddai", "Adonai", "Emanuel", "El Elyón", "Yo Soy"].map((n, i) => (
                  <span key={n} className="absolute px-3 py-1.5 rounded-full border border-gold-500/30 bg-night-800/85 text-gold-300 text-xs tracking-[0.2em] uppercase font-medium"
                    style={{
                      animation: `drift ${7 + i}s ease-in-out infinite`, animationDelay: `${i * 0.9}s`,
                      left: ["2%", "78%", "88%", "-4%", "70%"][i], top: ["12%", "6%", "48%", "62%", "86%"][i],
                    }}>{n}</span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-ivory-500 text-xs tracking-[0.3em] uppercase flex flex-col items-center gap-2 opacity-70">
          Desciende <span className="w-px h-8 bg-gradient-to-b from-gold-500 to-transparent" />
        </div>
      </section>

      {/* ============ MARQUESINA DE NOMBRES ============ */}
      <section className="border-y border-gold-500/15 bg-night-800/60 py-4 overflow-hidden">
        <div className="flex whitespace-nowrap anim-marquee w-max">
          {[0, 1].map(k => (
            <div key={k} className="flex items-center">
              {NOMBRES_DE_DIOS.map(n => (
                <span key={n + k} className="mx-6 flex items-center gap-6 text-gold-400/90" style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", letterSpacing: "0.24em" }}>
                  {n.toUpperCase()} <Icon name="chispa" size={12} className="text-gold-600" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ============ TRES CAMINOS (bento asimétrico) ============ */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
        <Reveal><Overline>Lo que habita esta casa</Overline></Reveal>
        <Reveal delay={1}>
          <h2 className="mt-4 text-3xl sm:text-5xl text-ivory-50 font-bold max-w-2xl" style={{ fontFamily: "var(--font-display)" }}>
            Tres caminos hacia <span className="text-gold-400">la misma luz</span>
          </h2>
        </Reveal>

        <div className="mt-12 grid lg:grid-cols-12 gap-5">
          <Reveal className="lg:col-span-5">
            <IrA to={user ? "/juego" : "/acceso"} className="block h-full">
              <article className="card-sacred rounded-xl p-8 h-full relative overflow-hidden group">
                <div className="absolute -right-16 -bottom-16 w-64 h-64 opacity-90 transition-transform duration-700 group-hover:rotate-45">
                  <Mandala variante={1} nombreDios="El Shaddai" conNombres={false} className="w-full h-full" />
                </div>
                <Badge tono="oro"><Icon name="pincel" size={11} /> Juego interactivo</Badge>
                <h3 className="mt-4 text-2xl text-ivory-50 font-bold" style={{ fontFamily: "var(--font-display)" }}>Colorea los Nombres</h3>
                <p className="mt-3 text-sm text-ivory-300 max-w-xs leading-relaxed">
                  Paleta RGB, herramienta de relleno por áreas, guardado automático de tu sesión
                  e impresión de la obra terminada. Cada mandala lleva su Nombre escrito en el anillo.
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-gold-400 text-sm font-medium">
                  Entrar al taller <Icon name="flecha" size={15} className="transition-transform group-hover:translate-x-1.5" />
                </span>
              </article>
            </IrA>
          </Reveal>

          <Reveal delay={1} className="lg:col-span-7">
            <IrA to="/catalogo" className="block h-full">
              <article className="card-sacred rounded-xl overflow-hidden h-full group">
                <div className="grid sm:grid-cols-2 h-full">
                  <div className="p-8 flex flex-col justify-center">
                    <Badge tono="jade"><Icon name="carrito" size={11} /> Catálogo</Badge>
                    <h3 className="mt-4 text-2xl text-ivory-50 font-bold" style={{ fontFamily: "var(--font-display)" }}>Tienda del santuario</h3>
                    <p className="mt-3 text-sm text-ivory-300 leading-relaxed">
                      Retiros, cuencos, cursos, velas e inciensos — más las colecciones digitales
                      que liberan ejercicios y mandalas tras el pago.
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 text-gold-400 text-sm font-medium">
                      Ver {db.items.filter(i => i.activo).length} artículos <Icon name="flecha" size={15} className="transition-transform group-hover:translate-x-1.5" />
                    </span>
                  </div>
                  <div className="relative min-h-[220px] overflow-hidden">
                    <img src="https://image.qwenlm.ai/generated-images/71d5aa9b-1265-4bbd-9cc8-f70f84d3d5e0/_result.png" alt="Cuencos tibetanos" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-r from-night-800 via-night-800/20 to-transparent" />
                  </div>
                </div>
              </article>
            </IrA>
          </Reveal>

          <Reveal className="lg:col-span-7">
            <IrA to={user ? "/mi-espacio" : "/acceso"} className="block h-full">
              <article className="card-sacred rounded-xl p-8 h-full group">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge tono="azul"><Icon name="libro" size={11} /> Área del alma</Badge>
                    <h3 className="mt-4 text-2xl text-ivory-50 font-bold" style={{ fontFamily: "var(--font-display)" }}>Ejercicios contemplativos</h3>
                    <p className="mt-3 text-sm text-ivory-300 max-w-md leading-relaxed">
                      Respiración del Nombre, lectio divina y silencio habitado. Tu progreso se guarda
                      paso a paso y un guía del taller lo acompaña en tiempo real.
                    </p>
                  </div>
                  <div className="hidden md:block shrink-0 w-40">
                    {db.ejercicios.slice(0, 3).map(e => (
                      <div key={e.id} className="flex items-center gap-2 py-1.5 text-xs text-ivory-300 border-b border-ivory-500/10">
                        <Icon name="vela" size={13} className="text-gold-500" /> {e.titulo}
                      </div>
                    ))}
                  </div>
                </div>
                <span className="mt-6 inline-flex items-center gap-2 text-gold-400 text-sm font-medium">
                  Ir a mi espacio <Icon name="flecha" size={15} className="transition-transform group-hover:translate-x-1.5" />
                </span>
              </article>
            </IrA>
          </Reveal>

          <Reveal delay={1} className="lg:col-span-5">
            <article className="card-sacred rounded-xl p-8 h-full">
              <Badge tono="ember"><Icon name="rayo" size={11} /> Pagos con webhook</Badge>
              <h3 className="mt-4 text-2xl text-ivory-50 font-bold" style={{ fontFamily: "var(--font-display)" }}>Stripe y PayPal</h3>
              <p className="mt-3 text-sm text-ivory-300 leading-relaxed">
                La orden nace <em className="text-gold-400 not-italic font-medium">pendiente</em>, la pasarela responde
                y el webhook la sella como <em className="text-jade-400 not-italic font-medium">completada</em> — liberando el contenido al instante.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["checkout.session.completed", "payment_intent.failed"].map(e => (
                  <code key={e} className="text-[0.65rem] px-2 py-1 rounded bg-night-950/80 border border-ivory-500/15 text-ivory-300">{e}</code>
                ))}
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      {/* ============ COLECCIÓN DE MANDALAS ============ */}
      <section className="border-y border-gold-500/12 bg-night-900/70 py-24 relative overflow-hidden">
        <div className="absolute -left-24 top-1/2 -translate-y-1/2 w-96 h-96 text-jade-500/15 pointer-events-none"><MandalaLineal girar className="w-full h-full" /></div>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 relative">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Reveal><Overline>El juego de los Nombres</Overline></Reveal>
              <Reveal delay={1}><h2 className="mt-4 text-3xl sm:text-5xl text-ivory-50 font-bold" style={{ fontFamily: "var(--font-display)" }}>Colección de mandalas</h2></Reveal>
            </div>
            <Reveal delay={2}><IrA to={user ? "/juego" : "/acceso"}><Btn variante="ghost"><Icon name="pincel" /> Abrir el juego</Btn></IrA></Reveal>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {mandalas.map((m, i) => {
              const libre = user ? mandalaDesbloqueado(db, user.id, m.id) : m.id === "m1";
              return (
                <Reveal key={m.id} delay={(i % 4) as 0 | 1 | 2 | 3}>
                  <IrA to={user ? `/juego/${m.id}` : "/acceso"} className="block group">
                    <article className="card-sacred rounded-xl p-5 text-center relative">
                      {!libre && (
                        <span className="absolute top-3 right-3 z-10 w-8 h-8 grid place-items-center rounded-full bg-night-950/80 border border-gold-500/30 text-gold-400">
                          <Icon name="candado" size={14} />
                        </span>
                      )}
                      {m.id === "m1" && <span className="absolute top-3 left-3 z-10"><Badge tono="jade">Gratis</Badge></span>}
                      <div className="mx-auto w-40 h-40 transition-transform duration-700 group-hover:rotate-[30deg] group-hover:scale-105">
                        <Mandala variante={m.variante} nombreDios={m.nombreDios} className="w-full h-full" />
                      </div>
                      <h3 className="mt-4 text-base text-ivory-50 font-semibold" style={{ fontFamily: "var(--font-display)" }}>{m.nombre}</h3>
                      <p className="mt-1 text-xs text-ivory-500 italic">{m.significado}</p>
                    </article>
                  </IrA>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ DESTACADOS DEL CATÁLOGO ============ */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal><Overline>Del catálogo</Overline></Reveal>
            <Reveal delay={1}><h2 className="mt-4 text-3xl sm:text-5xl text-ivory-50 font-bold" style={{ fontFamily: "var(--font-display)" }}>Objetos de devoción</h2></Reveal>
          </div>
          <Reveal delay={2}><IrA to="/catalogo"><Btn variante="ghost">Catálogo completo <Icon name="flecha" size={15} /></Btn></IrA></Reveal>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {destacados.map((it, i) => (
            <Reveal key={it.id} delay={(i % 3) as 0 | 1 | 2}>
              <article className="card-sacred rounded-xl overflow-hidden group flex flex-col h-full">
                <IrA to={`/catalogo/${it.id}`} className="block relative overflow-hidden">
                  <img src={it.imagen} alt={it.nombre} loading="lazy" className="w-full h-52 object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-night-900/80 to-transparent" />
                </IrA>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg text-ivory-50 font-semibold" style={{ fontFamily: "var(--font-display)" }}>{it.nombre}</h3>
                  <p className="mt-2 text-sm text-ivory-500 line-clamp-2 flex-1">{it.descripcion}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-gold-400 text-xl font-semibold">{fmtMoney(it.precio)}</span>
                    <Btn tam="sm" onClick={() => { agregarCarrito(it.id); toast("ok", "Agregado al carrito", it.nombre); }}>
                      <Icon name="carrito" size={14} /> Agregar
                    </Btn>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ CÓMO FUNCIONA ============ */}
      <section className="border-t border-gold-500/12 bg-night-900/70 py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal><Overline>Registro → compra → acceso</Overline></Reveal>
          <Reveal delay={1}><h2 className="mt-4 text-3xl sm:text-5xl text-ivory-50 font-bold" style={{ fontFamily: "var(--font-display)" }}>Así se enciende la lámpara</h2></Reveal>
          <div className="mt-14 grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-6 left-[12%] right-[12%] border-t border-dashed border-gold-500/30" />
            {[
              { n: "I", t: "Crea tu cuenta", d: "Registro con JWT y rol asignado: cliente, trabajador o administrador." },
              { n: "II", t: "Elige tu camino", d: "Explora el catálogo con filtros por categoría y arma tu carrito." },
              { n: "III", t: "Paga seguro", d: "Stripe o PayPal con SSL. Tarjeta de prueba: 4242 4242 4242 4242." },
              { n: "IV", t: "La luz se libera", d: "El webhook confirma el pago y tus ejercicios y mandalas se abren al instante." },
            ].map((p, i) => (
              <Reveal key={p.n} delay={(i % 4) as 0 | 1 | 2 | 3}>
                <div className="relative">
                  <div className="w-12 h-12 rounded-full grid place-items-center bg-night-800 border border-gold-500/40 text-gold-400 relative z-10" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>{p.n}</div>
                  <h3 className="mt-5 text-lg text-ivory-50 font-semibold" style={{ fontFamily: "var(--font-display)" }}>{p.t}</h3>
                  <p className="mt-2 text-sm text-ivory-500 leading-relaxed">{p.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CIERRE ============ */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-28 text-center relative">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] text-gold-500/8 pointer-events-none"><MandalaLineal girar className="w-full h-full" /></div>
        <Reveal>
          <p className="text-2xl sm:text-4xl text-ivory-100 leading-snug font-light max-w-3xl mx-auto" style={{ fontFamily: "var(--font-display)" }}>
            «El Señor es mi <span className="text-gold-400 font-bold">luz</span> y mi salvación»
          </p>
          <p className="mt-4 text-sm tracking-[0.3em] uppercase text-ivory-500">Salmo 27 · 1</p>
        </Reveal>
        <Reveal delay={2}>
          <div className="mt-10 flex justify-center gap-4 flex-wrap">
            <IrA to={user ? "/juego" : "/acceso"}><Btn tam="lg">{user ? "Ir a mi juego" : "Comenzar ahora"} <Icon name="flecha" /></Btn></IrA>
          </div>
        </Reveal>
      </section>

      {/* nota de desbloqueos para autenticados */}
      {user && (
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pb-16">
          <div className="card-sacred rounded-xl px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-ivory-300">
              Hola, <span className="text-gold-300 font-medium">{user.nombre.split(" ")[0]}</span> — tienes{" "}
              {db.ejercicios.filter(e => ejercicioDesbloqueado(db, user.id, e.id)).length} ejercicios y{" "}
              {db.mandalas.filter(m => mandalaDesbloqueado(db, user.id, m.id)).length} mandalas liberados.
            </p>
            <IrA to="/mi-espacio" className="text-gold-400 text-sm font-medium inline-flex items-center gap-2 hover:gap-3 transition-all">
              Ir a mi espacio <Icon name="flecha" size={14} />
            </IrA>
          </div>
        </div>
      )}
    </div>
  );
}
