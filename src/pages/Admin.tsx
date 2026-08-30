import { useMemo, useRef, useState } from "react";
import { useApp } from "../lib/context";
import type { Categoria, Item, Mandala as MandalaT, Rol, Usuario } from "../lib/data";
import { fmtMoney, fmtFecha, hashPass, NOMBRES_DE_DIOS, paletaOriginal } from "../lib/data";
import { Icon, Btn, Badge, Reveal, Overline, Modal, Field, Input, Select, Textarea, EstadoOrdenBadge, RolBadge, EstadoVacio } from "../components/ui";
import { Mandala } from "../components/Mandala";

type Tab = "panel" | "usuarios" | "catalogo" | "mandalas" | "ordenes";

export default function Admin() {
  const { user } = useApp();
  const [tab, setTab] = useState<Tab>("panel");
  if (!user || user.rol !== "administrador") return null;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "panel", label: "Panel", icon: "sol" },
    { id: "usuarios", label: "Usuarios", icon: "usuario" },
    { id: "catalogo", label: "Catálogo", icon: "carrito" },
    { id: "mandalas", label: "Mandalas", icon: "flor" },
    { id: "ordenes", label: "Órdenes", icon: "tarjeta" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
      <Reveal><Overline>CMS · acceso exclusivo del administrador</Overline></Reveal>
      <Reveal delay={1}>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
          <h1 className="text-3xl sm:text-4xl text-ivory-50 font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Gobierno de la <span className="text-gold-400">casa</span>
          </h1>
          <p className="text-sm text-ivory-500 flex items-center gap-2"><RolBadge rol={user.rol} /> {user.email}</p>
        </div>
      </Reveal>

      <Reveal delay={2}>
        <nav className="mt-8 flex gap-2 flex-wrap border-b border-ivory-500/15 pb-px">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 rounded-t-md text-sm font-medium inline-flex items-center gap-2 border transition-all cursor-pointer ${tab === t.id ? "bg-night-700/80 border-gold-500/40 text-gold-300 border-b-transparent" : "border-transparent text-ivory-500 hover:text-ivory-100 hover:bg-night-800/60"}`}>
              <Icon name={t.icon} size={15} /> {t.label}
            </button>
          ))}
        </nav>
      </Reveal>

      <div className="mt-8 anim-fade-up" key={tab}>
        {tab === "panel" && <Panel irA={setTab} />}
        {tab === "usuarios" && <Usuarios />}
        {tab === "catalogo" && <CatalogoAdmin />}
        {tab === "mandalas" && <MandalasAdmin />}
        {tab === "ordenes" && <OrdenesAdmin />}
      </div>
    </div>
  );
}

/* ================= PANEL ================= */
function Panel({ irA }: { irA: (t: Tab) => void }) {
  const { db } = useApp();
  const ingresos = db.ordenes.filter(o => o.estado === "completado").reduce((s, o) => s + o.total, 0);
  const pendientes = db.ordenes.filter(o => o.estado === "pendiente").length;
  const stats = [
    { l: "Ingresos confirmados", v: fmtMoney(ingresos), icon: "tarjeta", t: "text-gold-400" },
    { l: "Usuarios", v: String(db.usuarios.length), icon: "usuario", t: "text-jade-400" },
    { l: "Órdenes pendientes", v: String(pendientes), icon: "rayo", t: "text-ember-400" },
    { l: "Mandalas activos", v: String(db.mandalas.filter(m => m.activo).length), icon: "flor", t: "text-ivory-100" },
  ];
  const recientes = [...db.ordenes].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5);

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.l} className="card-sacred rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-[0.65rem] uppercase tracking-[0.22em] text-ivory-500">{s.l}</p>
              <Icon name={s.icon} size={16} className={s.t} />
            </div>
            <p className={`mt-3 text-2xl font-bold ${s.t}`} style={{ fontFamily: "var(--font-display)" }}>{s.v}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 card-sacred rounded-xl p-6">
          <h3 className="text-lg text-ivory-50 font-semibold" style={{ fontFamily: "var(--font-display)" }}>Órdenes recientes</h3>
          <div className="mt-4 space-y-2.5">
            {recientes.map(o => {
              const u = db.usuarios.find(x => x.id === o.usuarioId);
              return (
                <div key={o.id} className="flex items-center justify-between gap-3 rounded-lg bg-night-950/50 border border-ivory-500/10 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm text-ivory-100 truncate">{u?.nombre ?? o.usuarioId} · <span className="text-gold-300">{fmtMoney(o.total)}</span></p>
                    <p className="text-xs text-ivory-500">{fmtFecha(o.fecha)} · {o.metodo}</p>
                  </div>
                  <EstadoOrdenBadge estado={o.estado} />
                </div>
              );
            })}
          </div>
          <Btn variante="ghost" tam="sm" className="mt-4" onClick={() => irA("ordenes")}>Gestionar órdenes y webhooks <Icon name="flecha" size={13} /></Btn>
        </div>

        <div className="card-sacred rounded-xl p-6">
          <h3 className="text-lg text-ivory-50 font-semibold" style={{ fontFamily: "var(--font-display)" }}>Salud del sistema</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {[
              { ok: true, t: "SSL Let's Encrypt · HTTPS forzado" },
              { ok: true, t: "MariaDB 10.11 · réplicas diarias" },
              { ok: true, t: "API Express + JWT (HS256)" },
              { ok: pendientes === 0, t: pendientes === 0 ? "Webhooks al día" : `${pendientes} webhook(s) por confirmar` },
              { ok: true, t: "Stripe webhooks · firma verificada" },
            ].map(x => (
              <li key={x.t} className="flex items-center gap-2.5">
                <span className={`w-5 h-5 rounded-full grid place-items-center border ${x.ok ? "border-jade-500/60 text-jade-400 bg-jade-500/10" : "border-gold-500/60 text-gold-400 bg-gold-500/10"}`}>
                  <Icon name={x.ok ? "check" : "rayo"} size={11} />
                </span>
                <span className="text-ivory-300">{x.t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ================= USUARIOS ================= */
function Usuarios() {
  const { db, user, mutate, toast } = useApp();
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [creando, setCreando] = useState(false);
  const [borrarId, setBorrarId] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: "", email: "", rol: "cliente" as Rol, activo: true, pass: "" });

  const abrirEdicion = (u: Usuario) => { setForm({ nombre: u.nombre, email: u.email, rol: u.rol, activo: u.activo, pass: "" }); setEditando(u); };
  const guardar = () => {
    if (!editando) return;
    if (form.nombre.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast("error", "Datos inválidos", "Revisa nombre y correo."); return; }
    mutate(d => {
      const u = d.usuarios.find(x => x.id === editando.id);
      if (!u) return;
      u.nombre = form.nombre.trim(); u.email = form.email.trim().toLowerCase(); u.rol = form.rol; u.activo = form.activo;
      u.actualizadoEn = new Date().toISOString();
      if (form.pass.length >= 6) u.pass = hashPass(form.pass);
    });
    toast("ok", "Usuario actualizado", form.nombre);
    setEditando(null);
  };
  const crear = () => {
    if (form.nombre.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast("error", "Datos inválidos", "Revisa nombre y correo."); return; }
    if (form.pass.length < 6) { toast("error", "Contraseña corta", "Mínimo 6 caracteres."); return; }
    if (db.usuarios.some(u => u.email.toLowerCase() === form.email.trim().toLowerCase())) { toast("error", "Correo duplicado", "Ya existe ese correo."); return; }
    mutate(d => d.usuarios.push({
      id: "u" + Date.now().toString(36), nombre: form.nombre.trim(), email: form.email.trim().toLowerCase(),
      pass: hashPass(form.pass), rol: form.rol, activo: form.activo, creadoEn: new Date().toISOString(), actualizadoEn: new Date().toISOString(),
    }));
    toast("ok", "Usuario creado", `${form.nombre} · ${form.rol}`);
    setCreando(false);
  };
  const eliminar = (id: string) => {
    mutate(d => { d.usuarios = d.usuarios.filter(u => u.id !== id); });
    toast("info", "Usuario eliminado", "Se conservan sus órdenes por contabilidad.");
    setBorrarId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-xl text-ivory-50 font-semibold" style={{ fontFamily: "var(--font-display)" }}>{db.usuarios.length} almas registradas</h2>
        <Btn onClick={() => { setForm({ nombre: "", email: "", rol: "cliente", activo: true, pass: "" }); setCreando(true); }}><Icon name="mas" size={15} /> Nuevo usuario</Btn>
      </div>

      <div className="mt-5 card-sacred rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-[0.65rem] uppercase tracking-[0.22em] text-ivory-500 border-b border-ivory-500/12">
              <th className="px-5 py-3.5">Usuario</th><th className="px-5 py-3.5">Rol</th><th className="px-5 py-3.5">Alta</th><th className="px-5 py-3.5">Estado</th><th className="px-5 py-3.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {db.usuarios.map(u => (
              <tr key={u.id} className="border-b border-ivory-500/8 hover:bg-night-700/30 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="text-ivory-100 font-medium">{u.nombre} {u.id === user?.id && <span className="text-gold-500 text-xs">(tú)</span>}</p>
                  <p className="text-xs text-ivory-500">{u.email}</p>
                </td>
                <td className="px-5 py-3.5"><RolBadge rol={u.rol} /></td>
                <td className="px-5 py-3.5 text-ivory-500">{fmtFecha(u.creadoEn)}</td>
                <td className="px-5 py-3.5"><Badge tono={u.activo ? "jade" : "ember"}>{u.activo ? "activo" : "inactivo"}</Badge></td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-2">
                    {borrarId === u.id ? (
                      <>
                        <Btn tam="sm" variante="peligro" onClick={() => eliminar(u.id)}>Confirmar</Btn>
                        <Btn tam="sm" variante="sutil" onClick={() => setBorrarId(null)}>No</Btn>
                      </>
                    ) : (
                      <>
                        <Btn tam="sm" variante="sutil" onClick={() => abrirEdicion(u)}><Icon name="editar" size={13} /></Btn>
                        <Btn tam="sm" variante="sutil" disabled={u.id === user?.id} onClick={() => setBorrarId(u.id)} className="hover:text-ember-400"><Icon name="basura" size={13} /></Btn>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal abierto={!!editando || creando} onCerrar={() => { setEditando(null); setCreando(false); }} titulo={editando ? `Editar · ${editando.nombre}` : "Nuevo usuario"}>
        <div className="space-y-4">
          <Field label="Nombre"><Input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} /></Field>
          <Field label="Correo"><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Rol">
              <Select value={form.rol} onChange={e => setForm(f => ({ ...f, rol: e.target.value as Rol }))}>
                <option value="cliente">cliente</option><option value="trabajador">trabajador</option><option value="administrador">administrador</option>
              </Select>
            </Field>
            <Field label="Estado">
              <Select value={form.activo ? "1" : "0"} onChange={e => setForm(f => ({ ...f, activo: e.target.value === "1" }))}>
                <option value="1">activo</option><option value="0">inactivo</option>
              </Select>
            </Field>
          </div>
          <Field label={editando ? "Nueva contraseña (opcional)" : "Contraseña"} hint="Se guarda con hash, nunca en texto plano.">
            <Input value={form.pass} onChange={e => setForm(f => ({ ...f, pass: e.target.value }))} type="password" placeholder={editando ? "Dejar en blanco para no cambiar" : "mínimo 6"} />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Btn variante="sutil" onClick={() => { setEditando(null); setCreando(false); }}>Cancelar</Btn>
            <Btn onClick={editando ? guardar : crear}><Icon name="check" size={15} /> {editando ? "Guardar cambios" : "Crear usuario"}</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ================= CATÁLOGO ================= */
function CatalogoAdmin() {
  const { db, mutate, toast } = useApp();
  const [itemEdit, setItemEdit] = useState<Item | null | "nuevo">(null);
  const [catEdit, setCatEdit] = useState<Categoria | null | "nueva">(null);
  const [borrarItem, setBorrarItem] = useState<string | null>(null);
  const [borrarCat, setBorrarCat] = useState<string | null>(null);
  const [f, setF] = useState({ nombre: "", descripcion: "", precio: "0", categoriaId: "c1", tipo: "producto" as Item["tipo"], vinculoId: "", imagen: "", activo: true });
  const [fc, setFc] = useState({ nombre: "", descripcion: "" });

  const abrirItem = (it: Item | "nuevo") => {
    if (it === "nuevo") setF({ nombre: "", descripcion: "", precio: "0", categoriaId: db.categorias[0]?.id ?? "c1", tipo: "producto", vinculoId: "", imagen: "", activo: true });
    else setF({ nombre: it.nombre, descripcion: it.descripcion, precio: String(it.precio), categoriaId: it.categoriaId, tipo: it.tipo, vinculoId: it.vinculoId, imagen: it.imagen, activo: it.activo });
    setItemEdit(it);
  };
  const guardarItem = () => {
    const precio = parseFloat(f.precio);
    if (f.nombre.trim().length < 2 || isNaN(precio) || precio < 0) { toast("error", "Datos inválidos", "Revisa nombre y precio."); return; }
    mutate(d => {
      if (itemEdit === "nuevo") {
        d.items.push({ id: "i" + Date.now().toString(36), nombre: f.nombre.trim(), descripcion: f.descripcion.trim(), precio, categoriaId: f.categoriaId, tipo: f.tipo, vinculoId: f.tipo === "producto" ? "" : (f.vinculoId || "*"), imagen: f.imagen.trim(), activo: f.activo });
      } else {
        const it = d.items.find(x => x.id === (itemEdit as Item).id);
        if (it) Object.assign(it, { nombre: f.nombre.trim(), descripcion: f.descripcion.trim(), precio, categoriaId: f.categoriaId, tipo: f.tipo, vinculoId: f.tipo === "producto" ? "" : (f.vinculoId || "*"), imagen: f.imagen.trim(), activo: f.activo });
      }
    });
    toast("ok", itemEdit === "nuevo" ? "Artículo creado" : "Artículo actualizado", f.nombre);
    setItemEdit(null);
  };
  const guardarCat = () => {
    if (fc.nombre.trim().length < 2) { toast("error", "Nombre muy corto", "Escribe el nombre de la categoría."); return; }
    mutate(d => {
      if (catEdit === "nueva") d.categorias.push({ id: "c" + Date.now().toString(36), nombre: fc.nombre.trim(), descripcion: fc.descripcion.trim() });
      else {
        const c = d.categorias.find(x => x.id === (catEdit as Categoria).id);
        if (c) { c.nombre = fc.nombre.trim(); c.descripcion = fc.descripcion.trim(); }
      }
    });
    toast("ok", "Categoría guardada", fc.nombre);
    setCatEdit(null);
  };

  return (
    <div className="space-y-10">
      {/* categorías */}
      <div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl text-ivory-50 font-semibold" style={{ fontFamily: "var(--font-display)" }}>Categorías</h2>
          <Btn tam="sm" variante="ghost" onClick={() => { setFc({ nombre: "", descripcion: "" }); setCatEdit("nueva"); }}><Icon name="mas" size={13} /> Nueva categoría</Btn>
        </div>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {db.categorias.map(c => (
            <div key={c.id} className="card-sacred rounded-lg p-4">
              <p className="text-ivory-50 font-medium text-sm" style={{ fontFamily: "var(--font-display)" }}>{c.nombre}</p>
              <p className="text-xs text-ivory-500 mt-1 line-clamp-2">{c.descripcion}</p>
              <p className="text-[0.65rem] text-gold-500 mt-2">{db.items.filter(i => i.categoriaId === c.id).length} artículos</p>
              <div className="mt-3 flex gap-2">
                <Btn tam="sm" variante="sutil" onClick={() => { setFc({ nombre: c.nombre, descripcion: c.descripcion }); setCatEdit(c); }}><Icon name="editar" size={12} /></Btn>
                {borrarCat === c.id ? (
                  <Btn tam="sm" variante="peligro" onClick={() => { mutate(d => { d.categorias = d.categorias.filter(x => x.id !== c.id); }); toast("info", "Categoría eliminada", c.nombre); setBorrarCat(null); }}>Confirmar</Btn>
                ) : (
                  <Btn tam="sm" variante="sutil" className="hover:text-ember-400" onClick={() => setBorrarCat(c.id)}><Icon name="basura" size={12} /></Btn>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* items */}
      <div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl text-ivory-50 font-semibold" style={{ fontFamily: "var(--font-display)" }}>Artículos del catálogo</h2>
          <Btn onClick={() => abrirItem("nuevo")}><Icon name="mas" size={15} /> Nuevo artículo</Btn>
        </div>
        <div className="mt-5 card-sacred rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-left text-[0.65rem] uppercase tracking-[0.22em] text-ivory-500 border-b border-ivory-500/12">
                <th className="px-5 py-3.5">Artículo</th><th className="px-5 py-3.5">Tipo</th><th className="px-5 py-3.5">Categoría</th><th className="px-5 py-3.5">Precio</th><th className="px-5 py-3.5">Visible</th><th className="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {db.items.map(it => (
                <tr key={it.id} className="border-b border-ivory-500/8 hover:bg-night-700/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {it.imagen
                        ? <img src={it.imagen} alt="" className="w-11 h-11 rounded-md object-cover border border-gold-500/20" />
                        : <span className="w-11 h-11 rounded-md grid place-items-center bg-night-700 text-gold-500 border border-gold-500/20"><Icon name={it.tipo === "mandala" ? "flor" : "libro"} size={16} /></span>}
                      <div>
                        <p className="text-ivory-100 font-medium">{it.nombre}</p>
                        {it.tipo !== "producto" && <p className="text-[0.65rem] text-gold-500">libera: {it.vinculoId === "*" ? "toda la colección" : it.vinculoId}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 capitalize text-ivory-300">{it.tipo}</td>
                  <td className="px-5 py-3 text-ivory-500">{db.categorias.find(c => c.id === it.categoriaId)?.nombre ?? "—"}</td>
                  <td className="px-5 py-3 text-gold-400 font-medium">{fmtMoney(it.precio)}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => { mutate(d => { const x = d.items.find(i => i.id === it.id); if (x) x.activo = !x.activo; }); toast("info", it.activo ? "Artículo ocultado" : "Artículo visible", it.nombre); }}
                      className={`cursor-pointer w-10 h-5.5 rounded-full relative transition-colors ${it.activo ? "bg-jade-500/70" : "bg-night-600"}`} style={{ height: "22px" }} aria-label="Activar">
                      <span className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-ivory-50 transition-all ${it.activo ? "left-5" : "left-0.5"}`} style={{ width: 18, height: 18 }} />
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      {borrarItem === it.id ? (
                        <Btn tam="sm" variante="peligro" onClick={() => { mutate(d => { d.items = d.items.filter(x => x.id !== it.id); }); toast("info", "Artículo eliminado", it.nombre); setBorrarItem(null); }}>Confirmar</Btn>
                      ) : (
                        <>
                          <Btn tam="sm" variante="sutil" onClick={() => abrirItem(it)}><Icon name="editar" size={13} /></Btn>
                          <Btn tam="sm" variante="sutil" className="hover:text-ember-400" onClick={() => setBorrarItem(it.id)}><Icon name="basura" size={13} /></Btn>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* modal item */}
      <Modal abierto={!!itemEdit} onCerrar={() => setItemEdit(null)} titulo={itemEdit === "nuevo" ? "Nuevo artículo" : "Editar artículo"} ancho="max-w-2xl">
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nombre"><Input value={f.nombre} onChange={e => setF(x => ({ ...x, nombre: e.target.value }))} /></Field>
            <Field label="Precio (USD)"><Input value={f.precio} onChange={e => setF(x => ({ ...x, precio: e.target.value }))} inputMode="decimal" /></Field>
          </div>
          <Field label="Descripción"><Textarea value={f.descripcion} onChange={e => setF(x => ({ ...x, descripcion: e.target.value }))} /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Categoría">
              <Select value={f.categoriaId} onChange={e => setF(x => ({ ...x, categoriaId: e.target.value }))}>
                {db.categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </Select>
            </Field>
            <Field label="Tipo">
              <Select value={f.tipo} onChange={e => setF(x => ({ ...x, tipo: e.target.value as Item["tipo"] }))}>
                <option value="producto">producto</option><option value="ejercicio">ejercicio (digital)</option><option value="mandala">mandala (digital)</option>
              </Select>
            </Field>
          </div>
          {f.tipo !== "producto" && (
            <Field label="Vínculo de liberación" hint="«*» libera toda la colección; o escribe un id específico (ej. m2, e3).">
              <Input value={f.vinculoId} onChange={e => setF(x => ({ ...x, vinculoId: e.target.value }))} placeholder="*" />
            </Field>
          )}
          <Field label="Imagen (URL)" hint="Déjala vacía y se generará un arte de mandala automático.">
            <Input value={f.imagen} onChange={e => setF(x => ({ ...x, imagen: e.target.value }))} placeholder="/img/… o https://…" />
          </Field>
          <label className="flex items-center gap-3 cursor-pointer text-sm text-ivory-300">
            <input type="checkbox" checked={f.activo} onChange={e => setF(x => ({ ...x, activo: e.target.checked }))} className="accent-[#e3b65f] w-4 h-4" />
            Visible en el catálogo público
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Btn variante="sutil" onClick={() => setItemEdit(null)}>Cancelar</Btn>
            <Btn onClick={guardarItem}><Icon name="check" size={15} /> Guardar artículo</Btn>
          </div>
        </div>
      </Modal>

      {/* modal categoría */}
      <Modal abierto={!!catEdit} onCerrar={() => setCatEdit(null)} titulo={catEdit === "nueva" ? "Nueva categoría" : "Editar categoría"}>
        <div className="space-y-4">
          <Field label="Nombre"><Input value={fc.nombre} onChange={e => setFc(x => ({ ...x, nombre: e.target.value }))} /></Field>
          <Field label="Descripción"><Textarea value={fc.descripcion} onChange={e => setFc(x => ({ ...x, descripcion: e.target.value }))} /></Field>
          <div className="flex justify-end gap-3 pt-2">
            <Btn variante="sutil" onClick={() => setCatEdit(null)}>Cancelar</Btn>
            <Btn onClick={guardarCat}><Icon name="check" size={15} /> Guardar</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ================= MANDALAS ================= */
function MandalasAdmin() {
  const { db, mutate, toast } = useApp();
  const [edit, setEdit] = useState<MandalaT | null | "nuevo">(null);
  const [borrar, setBorrar] = useState<string | null>(null);
  const [f, setF] = useState({ nombre: "", nombreDios: "Elohim", significado: "", variante: 0, sonido: true, activo: true, imagenOriginal: null as string | null });
  const fileRef = useRef<HTMLInputElement>(null);

  const abrir = (m: MandalaT | "nuevo") => {
    if (m === "nuevo") setF({ nombre: "", nombreDios: "Elohim", significado: "", variante: 0, sonido: true, activo: true, imagenOriginal: null });
    else setF({ nombre: m.nombre, nombreDios: m.nombreDios, significado: m.significado, variante: m.variante, sonido: m.sonido, activo: m.activo, imagenOriginal: m.imagenOriginal });
    setEdit(m);
  };
  const subirImagen = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 900_000) { toast("error", "Imagen muy grande", "Usa una imagen menor a 900 KB."); return; }
    const r = new FileReader();
    r.onload = () => setF(x => ({ ...x, imagenOriginal: String(r.result) }));
    r.readAsDataURL(file);
    toast("ok", "Imagen cargada", file.name);
  };
  const guardar = () => {
    if (f.nombre.trim().length < 2) { toast("error", "Falta el nombre", "Cada mandala necesita su nombre."); return; }
    mutate(d => {
      if (edit === "nuevo") {
        d.mandalas.push({ id: "m" + Date.now().toString(36), nombre: f.nombre.trim(), nombreDios: f.nombreDios, significado: f.significado.trim(), variante: f.variante, imagenOriginal: f.imagenOriginal, sonido: f.sonido, activo: f.activo, creadoEn: new Date().toISOString() });
      } else {
        const m = d.mandalas.find(x => x.id === (edit as MandalaT).id);
        if (m) Object.assign(m, { nombre: f.nombre.trim(), nombreDios: f.nombreDios, significado: f.significado.trim(), variante: f.variante, imagenOriginal: f.imagenOriginal, sonido: f.sonido, activo: f.activo });
      }
    });
    toast("ok", edit === "nuevo" ? "Mandala creado" : "Mandala actualizado", f.nombre);
    setEdit(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-xl text-ivory-50 font-semibold" style={{ fontFamily: "var(--font-display)" }}>Mandalas de los Nombres</h2>
        <Btn onClick={() => abrir("nuevo")}><Icon name="mas" size={15} /> Nuevo mandala</Btn>
      </div>
      {db.mandalas.length === 0 ? (
        <div className="mt-8"><EstadoVacio icono="flor" titulo="Sin mandalas" texto="Crea el primer mandala: elige la geometría, el Nombre y su sonido." /></div>
      ) : (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {db.mandalas.map(m => (
            <article key={m.id} className={`card-sacred rounded-xl p-5 text-center relative ${m.activo ? "" : "opacity-60"}`}>
              <div className="absolute top-3 left-3"><Badge tono={m.activo ? "jade" : "neutro"}>{m.activo ? "activo" : "oculto"}</Badge></div>
              {m.sonido && <span className="absolute top-3 right-3 text-gold-400" title="Con sonido"><Icon name="sonido" size={15} /></span>}
              <div className="mx-auto w-36 h-36 mt-4">
                <Mandala variante={m.variante} nombreDios={m.nombreDios} fills={paletaOriginal(m.variante)} className="w-full h-full" />
              </div>
              <h3 className="mt-4 text-base text-ivory-50 font-semibold" style={{ fontFamily: "var(--font-display)" }}>{m.nombre}</h3>
              <p className="text-xs text-gold-500 tracking-[0.2em] uppercase mt-1">{m.nombreDios}</p>
              {m.imagenOriginal && <img src={m.imagenOriginal} alt="original" className="mt-3 mx-auto w-16 h-16 object-cover rounded-md border border-gold-500/25" />}
              <div className="mt-4 flex justify-center gap-2">
                {borrar === m.id ? (
                  <Btn tam="sm" variante="peligro" onClick={() => { mutate(d => { d.mandalas = d.mandalas.filter(x => x.id !== m.id); }); toast("info", "Mandala eliminado", m.nombre); setBorrar(null); }}>Confirmar</Btn>
                ) : (
                  <>
                    <Btn tam="sm" variante="sutil" onClick={() => abrir(m)}><Icon name="editar" size={13} /> Editar</Btn>
                    <Btn tam="sm" variante="sutil" className="hover:text-ember-400" onClick={() => setBorrar(m.id)}><Icon name="basura" size={13} /></Btn>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal abierto={!!edit} onCerrar={() => setEdit(null)} titulo={edit === "nuevo" ? "Nuevo mandala" : "Editar mandala"} ancho="max-w-2xl">
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nombre del mandala"><Input value={f.nombre} onChange={e => setF(x => ({ ...x, nombre: e.target.value }))} placeholder="Mandala de…" /></Field>
            <Field label="Nombre de Dios">
              <Select value={f.nombreDios} onChange={e => setF(x => ({ ...x, nombreDios: e.target.value }))}>
                {NOMBRES_DE_DIOS.map(n => <option key={n} value={n}>{n}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Significado"><Input value={f.significado} onChange={e => setF(x => ({ ...x, significado: e.target.value }))} placeholder="El Creador · la multiplicidad que surge del Uno" /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Geometría (variante)">
              <Select value={String(f.variante)} onChange={e => setF(x => ({ ...x, variante: Number(e.target.value) }))}>
                <option value="0">Flor de pétalos anchos</option>
                <option value="1">Montaña de triángulos</option>
                <option value="2">Lámpara de diez llamas</option>
              </Select>
            </Field>
            <Field label="Previsualización">
              <div className="w-full aspect-square max-w-[150px] mx-auto"><Mandala variante={f.variante} nombreDios={f.nombreDios} fills={paletaOriginal(f.variante)} className="w-full h-full" /></div>
            </Field>
          </div>
          <Field label="Imagen original en color (referencia)" hint="PNG/JPG hasta 900 KB. Se guarda como vista previa del color terminado.">
            <div className="flex items-center gap-3 flex-wrap">
              <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={e => subirImagen(e.target.files?.[0])} />
              <Btn variante="ghost" tam="sm" onClick={() => fileRef.current?.click()}><Icon name="descargar" size={13} /> Subir imagen</Btn>
              {f.imagenOriginal && (
                <>
                  <img src={f.imagenOriginal} alt="original" className="w-12 h-12 object-cover rounded-md border border-gold-500/30" />
                  <Btn variante="sutil" tam="sm" onClick={() => setF(x => ({ ...x, imagenOriginal: null }))}><Icon name="x" size={12} /> Quitar</Btn>
                </>
              )}
            </div>
          </Field>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 cursor-pointer text-sm text-ivory-300">
              <input type="checkbox" checked={f.sonido} onChange={e => setF(x => ({ ...x, sonido: e.target.checked }))} className="accent-[#e3b65f] w-4 h-4" />
              Campana de sonido al colorear
            </label>
            <label className="flex items-center gap-3 cursor-pointer text-sm text-ivory-300">
              <input type="checkbox" checked={f.activo} onChange={e => setF(x => ({ ...x, activo: e.target.checked }))} className="accent-[#e3b65f] w-4 h-4" />
              Visible para los usuarios
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Btn variante="sutil" onClick={() => setEdit(null)}>Cancelar</Btn>
            <Btn onClick={guardar}><Icon name="check" size={15} /> Guardar mandala</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ================= ÓRDENES ================= */
function OrdenesAdmin() {
  const { db, forzarWebhook } = useApp();
  const ordenes = useMemo(() => [...db.ordenes].sort((a, b) => b.fecha.localeCompare(a.fecha)), [db.ordenes]);
  const [expandida, setExpandida] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-xl text-ivory-50 font-semibold" style={{ fontFamily: "var(--font-display)" }}>Órdenes y webhooks</h2>
        <p className="text-xs text-ivory-500">Simula la respuesta de la pasarela sobre órdenes pendientes.</p>
      </div>
      <div className="mt-5 space-y-3">
        {ordenes.map(o => {
          const u = db.usuarios.find(x => x.id === o.usuarioId);
          const dets = db.detalles.filter(d => d.ordenId === o.id);
          const abierta = expandida === o.id;
          return (
            <div key={o.id} className="card-sacred rounded-xl overflow-hidden">
              <button className="w-full text-left px-5 py-4 flex flex-wrap items-center gap-4 cursor-pointer hover:bg-night-700/25 transition-colors" onClick={() => setExpandida(abierta ? null : o.id)}>
                <span className="text-ivory-500"><Icon name="flecha" size={14} className={`transition-transform ${abierta ? "rotate-90" : ""}`} /></span>
                <div className="flex-1 min-w-[180px]">
                  <p className="text-ivory-100 font-medium" style={{ fontFamily: "var(--font-display)" }}>{o.id} · {u?.nombre ?? "usuario eliminado"}</p>
                  <p className="text-xs text-ivory-500 mt-0.5">{fmtFecha(o.fecha)} · {o.metodo.toUpperCase()} · ref {o.ref}</p>
                </div>
                <span className="text-gold-400 font-semibold">{fmtMoney(o.total)}</span>
                <EstadoOrdenBadge estado={o.estado} />
              </button>
              {abierta && (
                <div className="px-5 pb-5 pt-1 border-t border-ivory-500/10 anim-fade-up">
                  <div className="grid sm:grid-cols-2 gap-4 mt-3">
                    <div className="space-y-1.5">
                      {dets.map(d => {
                        const it = db.items.find(i => i.id === d.itemId);
                        return <p key={d.id} className="text-sm text-ivory-300 flex justify-between"><span>{d.cantidad} × {it?.nombre ?? d.itemId}</span><span className="text-ivory-500">{fmtMoney(d.precioUnitario * d.cantidad)}</span></p>;
                      })}
                    </div>
                    <div className="rounded-lg bg-night-950/60 border border-ivory-500/12 p-4">
                      <p className="text-[0.65rem] uppercase tracking-[0.22em] text-ivory-500 mb-3">Simulador de webhook</p>
                      {o.estado === "pendiente" ? (
                        <div className="flex flex-wrap gap-2">
                          <Btn tam="sm" variante="jade" onClick={() => forzarWebhook(o.id, "completado")}><Icon name="check" size={13} /> pago exitoso</Btn>
                          <Btn tam="sm" variante="peligro" onClick={() => forzarWebhook(o.id, "fallido")}><Icon name="x" size={13} /> pago fallido</Btn>
                        </div>
                      ) : (
                        <p className="text-xs text-ivory-500">Esta orden ya fue resuelta por la pasarela. Estado sellado: <span className={o.estado === "completado" ? "text-jade-400" : "text-ember-400"}>{o.estado}</span>.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
