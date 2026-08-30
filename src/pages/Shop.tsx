import { useMemo, useState } from "react";
import { useApp, navigate } from "../lib/context";
import type { Item } from "../lib/data";
import { fmtMoney, fmtFecha } from "../lib/data";
import { Icon, Btn, Badge, Reveal, Overline, IrA, EstadoVacio, Spinner, Input, Field, EstadoOrdenBadge as EstadoOrdenBadgeMini } from "../components/ui";
import { Mandala } from "../components/Mandala";

function TipoItemBadge({ tipo }: { tipo: string }) {
  return tipo === "producto"
    ? <Badge tono="neutro">Producto</Badge>
    : tipo === "ejercicio" ? <Badge tono="azul"><Icon name="libro" size={10} /> Digital · Ejercicios</Badge>
      : <Badge tono="oro"><Icon name="pincel" size={10} /> Digital · Mandalas</Badge>;
}

function ThumbItem({ item, className = "h-52" }: { item: Item; className?: string }) {
  if (item.imagen) return <img src={item.imagen} alt={item.nombre} loading="lazy" className={`w-full ${className} object-cover`} />;
  return (
    <div className={`w-full ${className} grid place-items-center bg-night-800 relative overflow-hidden`}>
      <div className="w-36 h-36"><Mandala variante={item.tipo === "mandala" ? 2 : 1} nombreDios={item.tipo === "mandala" ? "El Shaddai" : "Yo Soy"} conNombres={false} className="w-full h-full" /></div>
    </div>
  );
}

/* ================= CATÁLOGO ================= */
export function Catalogo() {
  const { db, agregarCarrito, toast } = useApp();
  const [cat, setCat] = useState("todas");
  const [q, setQ] = useState("");
  const items = useMemo(() => db.items.filter(i =>
    i.activo &&
    (cat === "todas" || i.categoriaId === cat) &&
    (q.trim() === "" || (i.nombre + " " + i.descripcion).toLowerCase().includes(q.toLowerCase()))
  ), [db.items, cat, q]);

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
      <Reveal><Overline>Catálogo sagrado</Overline></Reveal>
      <Reveal delay={1}>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
          <h1 className="text-3xl sm:text-5xl text-ivory-50 font-bold" style={{ fontFamily: "var(--font-display)" }}>La tienda del santuario</h1>
          <div className="relative w-full sm:w-72">
            <Icon name="buscar" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ivory-500" />
            <Input placeholder="Buscar artículos…" value={q} onChange={e => setQ(e.target.value)} className="pl-10" />
          </div>
        </div>
      </Reveal>

      <Reveal delay={2}>
        <div className="mt-8 flex flex-wrap gap-2">
          {[{ id: "todas", nombre: "Todo" }, ...db.categorias].map(c => (
            <button key={c.id} onClick={() => setCat(c.id)}
              className={`px-4 py-2 rounded-full text-sm border transition-all cursor-pointer ${cat === c.id ? "bg-gold-500 text-night-900 border-gold-500 font-semibold shadow-[0_8px_24px_-10px_rgba(227,182,95,0.7)]" : "border-ivory-500/25 text-ivory-300 hover:border-gold-500/60 hover:text-gold-300"}`}>
              {c.nombre}
            </button>
          ))}
        </div>
      </Reveal>

      {items.length === 0 ? (
        <div className="mt-14"><EstadoVacio icono="buscar" titulo="Nada por aquí" texto="Ningún artículo coincide con tu búsqueda. Prueba con otra palabra o categoría." /></div>
      ) : (
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it, i) => {
            const catNombre = db.categorias.find(c => c.id === it.categoriaId)?.nombre;
            return (
              <Reveal key={it.id} delay={(i % 3) as 0 | 1 | 2}>
                <article className="card-sacred rounded-xl overflow-hidden group flex flex-col h-full">
                  <IrA to={`/catalogo/${it.id}`} className="block relative overflow-hidden">
                    <ThumbItem item={it} />
                    <div className="absolute top-3 left-3"><TipoItemBadge tipo={it.tipo} /></div>
                  </IrA>
                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-[0.65rem] uppercase tracking-[0.24em] text-ivory-500">{catNombre}</p>
                    <IrA to={`/catalogo/${it.id}`}>
                      <h3 className="mt-1.5 text-lg text-ivory-50 font-semibold leading-snug hover:text-gold-300 transition-colors" style={{ fontFamily: "var(--font-display)" }}>{it.nombre}</h3>
                    </IrA>
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
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ================= DETALLE ================= */
export function DetalleItem({ id }: { id: string }) {
  const { db, agregarCarrito, toast } = useApp();
  const [cant, setCant] = useState(1);
  const item = db.items.find(i => i.id === id && i.activo);
  if (!item) return <div className="max-w-3xl mx-auto px-5 py-24"><EstadoVacio icono="buscar" titulo="Artículo no encontrado" texto="Puede que el administrador lo haya desactivado." accion={<IrA to="/catalogo"><Btn>Volver al catálogo</Btn></IrA>} /></div>;
  const cat = db.categorias.find(c => c.id === item.categoriaId);
  const relacionados = db.items.filter(i => i.activo && i.categoriaId === item.categoriaId && i.id !== item.id).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
      <button onClick={() => navigate("/catalogo")} className="inline-flex items-center gap-2 text-sm text-ivory-500 hover:text-gold-400 transition-colors cursor-pointer">
        <Icon name="flecha" size={14} className="rotate-180" /> Volver al catálogo
      </button>
      <div className="mt-8 grid lg:grid-cols-2 gap-12 items-start">
        <Reveal>
          <div className="card-sacred rounded-xl overflow-hidden relative">
            <ThumbItem item={item} className="h-[320px] sm:h-[420px]" />
            <div className="absolute top-4 left-4"><TipoItemBadge tipo={item.tipo} /></div>
          </div>
        </Reveal>
        <Reveal delay={1}>
          <p className="text-[0.7rem] uppercase tracking-[0.3em] text-gold-500 font-semibold">{cat?.nombre}</p>
          <h1 className="mt-3 text-3xl sm:text-4xl text-ivory-50 font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>{item.nombre}</h1>
          <p className="mt-5 text-ivory-300 leading-relaxed">{item.descripcion}</p>

          {item.tipo !== "producto" && (
            <div className="mt-6 rounded-lg border border-gold-500/25 bg-gold-500/8 p-4 flex gap-3">
              <Icon name="rayo" size={18} className="text-gold-400 shrink-0 mt-0.5" />
              <p className="text-sm text-ivory-300">
                <span className="text-gold-300 font-medium">Contenido digital:</span> al completarse el pago, el webhook libera{" "}
                {item.tipo === "mandala" ? "los mandalas de la colección" : "la biblioteca de ejercicios"} en tu espacio personal. Sin envíos, sin esperas.
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-6">
            <span className="text-4xl text-gold-400 font-bold" style={{ fontFamily: "var(--font-display)" }}>{fmtMoney(item.precio)}</span>
            <div className="flex items-center border border-ivory-500/25 rounded-md overflow-hidden">
              <button className="px-3 py-2 hover:bg-night-700 text-ivory-300 cursor-pointer" onClick={() => setCant(c => Math.max(1, c - 1))} aria-label="Menos"><Icon name="menos" size={14} /></button>
              <span className="px-4 text-ivory-100 font-medium min-w-[2.5rem] text-center">{cant}</span>
              <button className="px-3 py-2 hover:bg-night-700 text-ivory-300 cursor-pointer" onClick={() => setCant(c => c + 1)} aria-label="Más"><Icon name="mas" size={14} /></button>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Btn tam="lg" onClick={() => { agregarCarrito(item.id, cant); toast("ok", "Agregado al carrito", `${cant} × ${item.nombre}`); }}>
              <Icon name="carrito" /> Agregar al carrito
            </Btn>
            <IrA to="/carrito"><Btn tam="lg" variante="ghost">Ver carrito</Btn></IrA>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ivory-500">
            <span className="flex items-center gap-2"><Icon name="escudo" size={13} className="text-jade-400" /> Pago cifrado SSL/TLS</span>
            <span className="flex items-center gap-2"><Icon name="rayo" size={13} className="text-gold-500" /> Webhook de confirmación</span>
            <span className="flex items-center gap-2"><Icon name="check" size={13} className="text-jade-400" /> Garantía de 7 días</span>
          </div>
        </Reveal>
      </div>

      {relacionados.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl text-ivory-50 font-bold" style={{ fontFamily: "var(--font-display)" }}>También en {cat?.nombre}</h2>
          <div className="mt-6 grid sm:grid-cols-3 gap-5">
            {relacionados.map(r => (
              <IrA key={r.id} to={`/catalogo/${r.id}`} className="block group">
                <article className="card-sacred rounded-xl overflow-hidden">
                  <ThumbItem item={r} className="h-36" />
                  <div className="p-4 flex items-center justify-between gap-3">
                    <h3 className="text-sm text-ivory-100 font-medium group-hover:text-gold-300 transition-colors">{r.nombre}</h3>
                    <span className="text-gold-400 text-sm font-semibold shrink-0">{fmtMoney(r.precio)}</span>
                  </div>
                </article>
              </IrA>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= CARRITO + CHECKOUT ================= */
type FasePago = "revision" | "pagando" | "exito" | "fallo";

export function CarritoPage() {
  const { db, user, carrito, setCantidad, quitarCarrito, vaciarCarrito, procesarPago, toast } = useApp();
  const [metodo, setMetodo] = useState<"stripe" | "paypal">("stripe");
  const [tarjeta, setTarjeta] = useState("4242 4242 4242 4242");
  const [fase, setFase] = useState<FasePago>("revision");
  const [refPago, setRefPago] = useState("");

  const lineas = carrito.map(l => ({ ...l, item: db.items.find(i => i.id === l.itemId) })).filter(l => l.item);
  const total = lineas.reduce((s, l) => s + (l.item as Item).precio * l.cantidad, 0);

  const pagar = async () => {
    setFase("pagando");
    const { orden, exito } = await procesarPago(metodo, tarjeta);
    setRefPago(orden.ref);
    setFase(exito ? "exito" : "fallo");
  };

  if (fase === "exito") return (
    <div className="max-w-2xl mx-auto px-5 py-24 text-center">
      <div className="mx-auto w-20 h-20 rounded-full grid place-items-center bg-jade-500/15 border border-jade-500/50 text-jade-400 anim-fade-up">
        <Icon name="check" size={38} strokeWidth={2.2} />
      </div>
      <h1 className="mt-8 text-3xl sm:text-4xl text-ivory-50 font-bold" style={{ fontFamily: "var(--font-display)" }}>La luz se ha liberado</h1>
      <p className="mt-4 text-ivory-300">
        El webhook <code className="text-xs bg-night-800 px-2 py-0.5 rounded border border-jade-500/30 text-jade-400">checkout.session.completed</code>{" "}
        confirmó tu pago <span className="text-gold-300">{refPago}</span>. Tus ejercicios y mandalas ya están disponibles.
      </p>
      <div className="mt-10 flex justify-center gap-4 flex-wrap">
        <IrA to="/mi-espacio"><Btn tam="lg"><Icon name="libro" /> Ir a mi espacio</Btn></IrA>
        <IrA to="/juego"><Btn tam="lg" variante="ghost"><Icon name="pincel" /> Colorear mandalas</Btn></IrA>
      </div>
    </div>
  );

  if (fase === "fallo") return (
    <div className="max-w-2xl mx-auto px-5 py-24 text-center">
      <div className="mx-auto w-20 h-20 rounded-full grid place-items-center bg-ember-500/15 border border-ember-500/50 text-ember-400 anim-fade-up">
        <Icon name="x" size={38} strokeWidth={2.2} />
      </div>
      <h1 className="mt-8 text-3xl sm:text-4xl text-ivory-50 font-bold" style={{ fontFamily: "var(--font-display)" }}>El pago fue rechazado</h1>
      <p className="mt-4 text-ivory-300">
        El webhook <code className="text-xs bg-night-800 px-2 py-0.5 rounded border border-ember-500/30 text-ember-400">payment_intent.payment_failed</code>{" "}
        marcó la orden <span className="text-gold-300">{refPago}</span> como fallida. Recuerda: la tarjeta de prueba es{" "}
        <code className="text-xs bg-night-800 px-2 py-0.5 rounded text-gold-300">4242 4242 4242 4242</code>.
      </p>
      <div className="mt-10 flex justify-center gap-4 flex-wrap">
        <Btn tam="lg" onClick={() => setFase("revision")}><Icon name="refrescar" /> Reintentar</Btn>
        <IrA to="/catalogo"><Btn tam="lg" variante="ghost">Volver al catálogo</Btn></IrA>
      </div>
    </div>
  );

  if (lineas.length === 0) return (
    <div className="max-w-2xl mx-auto px-5 py-24">
      <EstadoVacio icono="carrito" titulo="Tu carrito está vacío"
        texto="Recorre el catálogo: hay retiros, cuencos, velas, inciensos y las colecciones digitales que liberan el juego de mandalas."
        accion={<IrA to="/catalogo"><Btn><Icon name="flor" /> Explorar el catálogo</Btn></IrA>} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
      <Reveal><Overline>Paso final</Overline></Reveal>
      <Reveal delay={1}><h1 className="mt-4 text-3xl sm:text-5xl text-ivory-50 font-bold" style={{ fontFamily: "var(--font-display)" }}>Tu carrito de luz</h1></Reveal>

      <div className="mt-12 grid lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3 space-y-4">
          {lineas.map(l => (
            <div key={l.itemId} className="card-sacred rounded-xl p-4 flex items-center gap-4 anim-fade-up">
              <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-gold-500/15"><ThumbItem item={l.item as Item} className="h-20" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="text-ivory-50 font-medium truncate" style={{ fontFamily: "var(--font-display)" }}>{(l.item as Item).nombre}</h3>
                <p className="text-sm text-ivory-500 mt-0.5">{fmtMoney((l.item as Item).precio)} c/u</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center border border-ivory-500/25 rounded-md overflow-hidden">
                    <button className="px-2.5 py-1 hover:bg-night-700 cursor-pointer" onClick={() => setCantidad(l.itemId, l.cantidad - 1)} aria-label="Menos"><Icon name="menos" size={12} /></button>
                    <span className="px-3 text-sm">{l.cantidad}</span>
                    <button className="px-2.5 py-1 hover:bg-night-700 cursor-pointer" onClick={() => setCantidad(l.itemId, l.cantidad + 1)} aria-label="Más"><Icon name="mas" size={12} /></button>
                  </div>
                  <button className="text-ivory-500 hover:text-ember-400 transition-colors text-xs uppercase tracking-widest cursor-pointer inline-flex items-center gap-1" onClick={() => { quitarCarrito(l.itemId); toast("info", "Retirado del carrito", (l.item as Item).nombre); }}>
                    <Icon name="basura" size={13} /> Quitar
                  </button>
                </div>
              </div>
              <span className="text-gold-400 font-semibold text-lg shrink-0">{fmtMoney((l.item as Item).precio * l.cantidad)}</span>
            </div>
          ))}
          <button onClick={() => { vaciarCarrito(); toast("info", "Carrito vaciado"); }} className="text-xs text-ivory-500 hover:text-ember-400 uppercase tracking-[0.2em] cursor-pointer transition-colors">
            Vaciar carrito
          </button>
        </div>

        <div className="lg:col-span-2">
          <div className="card-sacred rounded-xl p-6 sticky top-24">
            <h2 className="text-xl text-ivory-50 font-bold" style={{ fontFamily: "var(--font-display)" }}>Resumen de la orden</h2>
            <div className="mt-4 space-y-2 text-sm">
              {lineas.map(l => (
                <div key={l.itemId} className="flex justify-between text-ivory-300">
                  <span className="truncate pr-3">{l.cantidad} × {(l.item as Item).nombre}</span>
                  <span className="shrink-0">{fmtMoney((l.item as Item).precio * l.cantidad)}</span>
                </div>
              ))}
              <div className="gold-rule my-3" />
              <div className="flex justify-between text-lg font-semibold text-ivory-50" style={{ fontFamily: "var(--font-display)" }}>
                <span>Total</span><span className="text-gold-400">{fmtMoney(total)}</span>
              </div>
            </div>

            {!user ? (
              <div className="mt-6 rounded-lg border border-gold-500/25 bg-night-950/60 p-4">
                <p className="text-sm text-ivory-300">Necesitas una cuenta para completar la compra y liberar tu contenido.</p>
                <IrA to="/acceso"><Btn className="mt-3 w-full"><Icon name="usuario" /> Acceder o registrarme</Btn></IrA>
              </div>
            ) : fase === "pagando" ? (
              <div className="mt-6 text-center py-8">
                <Spinner size={34} />
                <p className="mt-4 text-sm text-ivory-300">Procesando en la pasarela <span className="text-gold-300 font-medium uppercase">{metodo}</span>…</p>
                <p className="mt-1 text-xs text-ivory-500">La orden ya está creada como «pendiente».</p>
              </div>
            ) : (
              <>
                <div className="mt-6 grid grid-cols-2 gap-2">
                  {(["stripe", "paypal"] as const).map(m => (
                    <button key={m} onClick={() => setMetodo(m)}
                      className={`py-2.5 rounded-md border text-sm font-semibold uppercase tracking-widest transition-all cursor-pointer ${metodo === m ? "border-gold-500 bg-gold-500/15 text-gold-300" : "border-ivory-500/25 text-ivory-500 hover:border-gold-500/50"}`}>
                      {m === "stripe" ? "Stripe · Tarjeta" : "PayPal"}
                    </button>
                  ))}
                </div>

                {metodo === "stripe" ? (
                  <div className="mt-4 space-y-3">
                    <Field label="Número de tarjeta" hint="Prueba: 4242 4242 4242 4242 · cualquier otra será rechazada">
                      <Input value={tarjeta} onChange={e => setTarjeta(e.target.value)} inputMode="numeric" />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Vigencia"><Input defaultValue="12 / 27" /></Field>
                      <Field label="CVC"><Input defaultValue="314" maxLength={4} /></Field>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-ivory-500 rounded-md border border-ivory-500/20 bg-night-950/60 p-3">
                    Serás redirigido a PayPal. En esta demostración el pago se aprueba automáticamente.
                  </p>
                )}

                <Btn tam="lg" className="mt-5 w-full" onClick={pagar}>
                  <Icon name="tarjeta" /> Pagar {fmtMoney(total)}
                </Btn>
                <p className="mt-3 text-[0.68rem] text-ivory-500 flex items-center gap-2 justify-center">
                  <Icon name="escudo" size={12} className="text-jade-400" /> Conexión HTTPS · webhook verifica la firma del evento
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= HISTORIAL (mi espacio) ================= */
export function HistorialOrdenes() {
  const { db, user } = useApp();
  if (!user) return null;
  const ordenes = db.ordenes.filter(o => o.usuarioId === user.id).sort((a, b) => b.fecha.localeCompare(a.fecha));
  if (ordenes.length === 0) return <EstadoVacio icono="tarjeta" titulo="Sin compras aún" texto="Cuando completes un pago, tus órdenes y su estado de webhook aparecerán aquí." />;
  return (
    <div className="space-y-3">
      {ordenes.map(o => (
        <div key={o.id} className="card-sacred rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-ivory-50 font-medium" style={{ fontFamily: "var(--font-display)" }}>Orden {o.id} · <span className="text-gold-400">{fmtMoney(o.total)}</span></p>
              <p className="text-xs text-ivory-500 mt-1">{fmtFecha(o.fecha)} · {o.metodo.toUpperCase()} · ref {o.ref}</p>
            </div>
            <EstadoOrdenBadgeMini estado={o.estado} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {db.detalles.filter(d => d.ordenId === o.id).map(d => {
              const it = db.items.find(i => i.id === d.itemId);
              return <span key={d.id} className="text-xs px-2.5 py-1 rounded-full bg-night-950/70 border border-ivory-500/15 text-ivory-300">{d.cantidad} × {it?.nombre ?? d.itemId}</span>;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

