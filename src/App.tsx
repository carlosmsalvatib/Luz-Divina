import { useEffect, useMemo, useState } from "react";
import { AppProvider, useApp, useRoute, navigate } from "./lib/context";
import { Icon, Btn, Logo, RolBadge, EstadoVacio, IrA } from "./components/ui";
import Home from "./pages/Home";
import { Catalogo, DetalleItem, CarritoPage } from "./pages/Shop";
import AuthPage from "./pages/AuthPage";
import { MiEspacio, Taller } from "./pages/Spaces";
import Admin from "./pages/Admin";
import { JuegoGaleria, JuegoLienzo } from "./pages/Game";
import Docs from "./pages/Docs";

/* ---------------- guards por rol ---------------- */
function Requiere({ rol, children }: { rol?: "administrador" | "trabajador"; children: React.ReactNode }) {
  const { user } = useApp();
  if (!user) return (
    <div className="max-w-xl mx-auto px-5 py-24">
      <EstadoVacio icono="candado" titulo="Esta sala requiere tu presencia"
        texto="Necesitas una sesión activa para entrar. El token JWT dura 30 minutos y se renueva con un clic."
        accion={<IrA to="/acceso"><Btn><Icon name="usuario" size={15} /> Acceder o registrarme</Btn></IrA>} />
    </div>
  );
  if (rol && user.rol !== rol && user.rol !== "administrador") return (
    <div className="max-w-xl mx-auto px-5 py-24">
      <EstadoVacio icono="escudo" titulo="403 · Permiso denegado"
        texto={`Tu rol actual es «${user.rol}» y esta sala es para «${rol}». El middleware de la API respondería igual.`}
        accion={<IrA to="/"><Btn variante="ghost">Volver al inicio</Btn></IrA>} />
    </div>
  );
  return <>{children}</>;
}

/* ---------------- navegación ---------------- */
function Nav() {
  const { user, carrito, logout, renovarToken, tokenExp, db } = useApp();
  const { parts } = useRoute();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [usuarioAbierto, setUsuarioAbierto] = useState(false);
  const [, setTick] = useState(0);
  const pagina = parts[0] ?? "";

  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 30000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { setMenuAbierto(false); setUsuarioAbierto(false); }, [pagina]);

  const nCarrito = carrito.reduce((s, l) => s + l.cantidad, 0);
  const mins = Math.max(0, Math.round((tokenExp - Date.now()) / 60000));

  const enlaces = useMemo(() => {
    const base = [
      { to: "/", label: "Inicio", r: "" },
      { to: "/catalogo", label: "Catálogo", r: "catalogo" },
      { to: "/juego", label: "El Juego", r: "juego" },
      { to: "/docs", label: "Docs", r: "docs" },
    ];
    if (user) {
      base.splice(3, 0, { to: "/mi-espacio", label: "Mi Espacio", r: "mi-espacio" });
      if (user.rol === "trabajador" || user.rol === "administrador") base.splice(4, 0, { to: "/taller", label: "Taller", r: "taller" });
      if (user.rol === "administrador") base.push({ to: "/admin", label: "Admin · CMS", r: "admin" });
    }
    return base;
  }, [user]);

  return (
    <header className="fixed top-0 inset-x-0 z-[80] bg-night-950/85 backdrop-blur-md border-b border-gold-500/12">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[68px] flex items-center justify-between gap-4">
        <Logo />
        <nav className="hidden lg:flex items-center gap-7">
          {enlaces.map(e => (
            <a key={e.to} href={"#" + e.to} onClick={ev => { ev.preventDefault(); navigate(e.to); }}
              className={`nav-link text-sm tracking-wide ${pagina === e.r ? "active text-gold-300" : "text-ivory-300 hover:text-ivory-50"}`}>
              {e.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a href="#/carrito" onClick={e => { e.preventDefault(); navigate("/carrito"); }} aria-label="Carrito"
            className="relative w-10 h-10 grid place-items-center rounded-full border border-ivory-500/25 text-ivory-300 hover:text-gold-400 hover:border-gold-500/60 transition-all">
            <Icon name="carrito" size={17} />
            {nCarrito > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-gold-500 text-night-900 text-[0.65rem] font-bold anim-fade-up">{nCarrito}</span>
            )}
          </a>

          {user ? (
            <div className="relative">
              <button onClick={() => setUsuarioAbierto(v => !v)}
                className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full border border-ivory-500/25 hover:border-gold-500/60 transition-all cursor-pointer">
                <span className="w-7 h-7 grid place-items-center rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-300 text-xs font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  {user.nombre.charAt(0)}
                </span>
                <span className="hidden sm:block text-sm text-ivory-100 max-w-[120px] truncate">{user.nombre.split(" ")[0]}</span>
              </button>
              {usuarioAbierto && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUsuarioAbierto(false)} />
                  <div className="absolute right-0 top-12 w-72 card-sacred rounded-xl p-4 z-20 anim-fade-up">
                    <p className="text-ivory-50 font-medium truncate">{user.nombre}</p>
                    <p className="text-xs text-ivory-500 truncate mt-0.5">{user.email}</p>
                    <div className="mt-2"><RolBadge rol={user.rol} /></div>
                    <div className="mt-3 rounded-lg bg-night-950/70 border border-ivory-500/15 p-3">
                      <p className="text-[0.62rem] uppercase tracking-[0.22em] text-ivory-500">Token JWT</p>
                      <p className={`text-sm mt-1 font-medium ${mins <= 5 ? "text-ember-400" : "text-jade-400"}`}>
                        {mins > 0 ? `Expira en ${mins} min` : "Expirado — renueva"}
                      </p>
                      <Btn tam="sm" variante="ghost" className="mt-2 w-full" onClick={renovarToken}><Icon name="refrescar" size={13} /> Renovar 30 min</Btn>
                    </div>
                    <Btn tam="sm" variante="peligro" className="mt-3 w-full" onClick={logout}><Icon name="salir" size={13} /> Cerrar sesión</Btn>
                  </div>
                </>
              )}
            </div>
          ) : (
            <IrA to="/acceso"><Btn tam="sm"><Icon name="usuario" size={14} /> Acceder</Btn></IrA>
          )}

          <button className="lg:hidden w-10 h-10 grid place-items-center rounded-full border border-ivory-500/25 text-ivory-300 cursor-pointer" onClick={() => setMenuAbierto(v => !v)} aria-label="Menú">
            <Icon name={menuAbierto ? "x" : "menu"} size={18} />
          </button>
        </div>
      </div>

      {menuAbierto && (
        <nav className="lg:hidden border-t border-gold-500/12 bg-night-950/97 px-5 py-4 grid gap-1 anim-fade-up">
          {enlaces.map(e => (
            <a key={e.to} href={"#" + e.to} onClick={ev => { ev.preventDefault(); navigate(e.to); }}
              className={`px-4 py-3 rounded-md text-sm ${pagina === e.r ? "bg-night-700/70 text-gold-300" : "text-ivory-300 hover:bg-night-800"}`}>
              {e.label}
            </a>
          ))}
          <p className="px-4 pt-2 text-[0.62rem] uppercase tracking-[0.24em] text-ivory-500">{db.usuarios.length} almas en la casa · SSL activo</p>
        </nav>
      )}
    </header>
  );
}

/* ---------------- pie ---------------- */
function Footer() {
  return (
    <footer className="border-t border-gold-500/12 bg-night-900/80 mt-10">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <Logo />
          <p className="mt-4 text-sm text-ivory-500 leading-relaxed max-w-xs">
            Plataforma contemplativa: catálogo sagrado, ejercicios de los Nombres y el juego de mandalas.
          </p>
          <div className="mt-4 flex gap-2 flex-wrap">
            <span className="text-[0.62rem] px-2.5 py-1 rounded-full border border-jade-500/40 text-jade-400 flex items-center gap-1.5"><Icon name="escudo" size={10} /> HTTPS · Let's Encrypt</span>
            <span className="text-[0.62rem] px-2.5 py-1 rounded-full border border-gold-500/35 text-gold-400">luzdivina.net</span>
          </div>
        </div>
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-gold-500 font-semibold mb-4">Explorar</p>
          <ul className="space-y-2.5 text-sm text-ivory-300">
            {[["/", "Inicio"], ["/catalogo", "Catálogo"], ["/juego", "Juego de mandalas"], ["/carrito", "Carrito"], ["/docs", "Documentación"]].map(([to, lb]) => (
              <li key={to}><IrA to={to} className="hover:text-gold-300 transition-colors">{lb}</IrA></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-gold-500 font-semibold mb-4">Los tres roles</p>
          <ul className="space-y-2.5 text-sm text-ivory-300">
            <li className="flex gap-2 items-center"><Icon name="corona" size={14} className="text-gold-500" /> Administrador · CMS completo</li>
            <li className="flex gap-2 items-center"><Icon name="usuario" size={14} className="text-jade-400" /> Cliente · compra y contempla</li>
            <li className="flex gap-2 items-center"><Icon name="pincel" size={14} className="text-ivory-500" /> Trabajador · guía ejercicios</li>
          </ul>
        </div>
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-gold-500 font-semibold mb-4">Tecnología</p>
          <ul className="space-y-2.5 text-sm text-ivory-300">
            <li>React 18 + Vite + Tailwind v4</li>
            <li>API Express · JWT HS256</li>
            <li>MariaDB · índices relacionales</li>
            <li>Stripe / PayPal · webhooks firmados</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ivory-500/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-ivory-500">
          <p>© 2026 Luz Divina · Los Nombres son lámparas.</p>
          <p className="flex items-center gap-2"><Icon name="chispa" size={12} className="text-gold-500" /> Hecho con reverencia</p>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- toasts ---------------- */
function Toasts() {
  const { toasts, cerrarToast } = useApp();
  return (
    <div className="fixed top-20 right-4 z-[100] space-y-2.5 w-[min(92vw,360px)]">
      {toasts.map(t => (
        <div key={t.id} className={`anim-toast card-sacred rounded-xl p-4 flex gap-3 border-l-2 ${t.tipo === "ok" ? "border-l-jade-400" : t.tipo === "error" ? "border-l-ember-400" : "border-l-gold-500"}`}>
          <span className={`shrink-0 mt-0.5 ${t.tipo === "ok" ? "text-jade-400" : t.tipo === "error" ? "text-ember-400" : "text-gold-400"}`}>
            <Icon name={t.tipo === "ok" ? "check" : t.tipo === "error" ? "x" : "chispa"} size={16} strokeWidth={2.2} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ivory-50">{t.titulo}</p>
            {t.texto && <p className="text-xs text-ivory-300 mt-0.5 leading-relaxed">{t.texto}</p>}
          </div>
          <button onClick={() => cerrarToast(t.id)} className="text-ivory-500 hover:text-ivory-100 cursor-pointer self-start" aria-label="Cerrar aviso"><Icon name="x" size={14} /></button>
        </div>
      ))}
    </div>
  );
}

/* ---------------- 404 ---------------- */
function NoEncontrada() {
  return (
    <div className="max-w-xl mx-auto px-5 py-24">
      <EstadoVacio icono="vela" titulo="404 · Esta sala no existe"
        texto="Quizá la lámpara se apagó en el camino. Vuelve al inicio y enciende otra."
        accion={<IrA to="/"><Btn>Volver al inicio</Btn></IrA>} />
    </div>
  );
}

/* ---------------- rutas ---------------- */
function Rutas() {
  const { parts } = useRoute();
  const p = parts[0] ?? "";
  if (p === "") return <Home />;
  if (p === "catalogo") return parts[1] ? <DetalleItem key={parts[1]} id={parts[1]} /> : <Catalogo />;
  if (p === "carrito") return <CarritoPage />;
  if (p === "acceso") return <AuthPage />;
  if (p === "mi-espacio") return <Requiere><MiEspacio /></Requiere>;
  if (p === "taller") return <Requiere rol="trabajador"><Taller /></Requiere>;
  if (p === "admin") return <Requiere rol="administrador"><Admin /></Requiere>;
  if (p === "juego") return <Requiere>{parts[1] ? <JuegoLienzo key={parts[1]} mandalaId={parts[1]} /> : <JuegoGaleria />}</Requiere>;
  if (p === "docs") return <Docs />;
  return <NoEncontrada />;
}

export default function App() {
  return (
    <AppProvider>
      <div className="grain relative min-h-screen flex flex-col">
        <div className="fixed inset-0 ambient-base -z-10" />
        <Nav />
        <main className="flex-1 pt-[68px]">
          <Rutas />
        </main>
        <Footer />
        <Toasts />
      </div>
    </AppProvider>
  );
}
