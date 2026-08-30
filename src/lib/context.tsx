import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { DB, Orden, Usuario, Rol, EstadoOrden, Item } from "./data";
import { loadDB, saveDB, hashPass } from "./data";

/* ---------------- router (hash) ---------------- */
export function useRoute() {
  const [hash, setHash] = useState(() => window.location.hash || "#/");
  useEffect(() => {
    const fn = () => { setHash(window.location.hash || "#/"); window.scrollTo({ top: 0 }); };
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  return { parts, raw: hash };
}
export const navigate = (to: string) => { window.location.hash = to.startsWith("#") ? to : "#" + to; };

/* ---------------- JWT simulado ---------------- */
const b64 = (s: string) => btoa(unescape(encodeURIComponent(s)));
function emitirToken(u: Usuario) {
  const header = b64(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64(JSON.stringify({ sub: u.id, rol: u.rol, email: u.email, iat: Date.now(), exp: Date.now() + 30 * 60 * 1000 }));
  return `${header}.${payload}.ld_${u.id}_${Date.now().toString(36)}`;
}
export function leerToken(token: string): { sub: string; rol: Rol; exp: number } | null {
  try {
    const payload = JSON.parse(decodeURIComponent(escape(atob(token.split(".")[1]))));
    return payload;
  } catch { return null; }
}

/* ---------------- tipos del contexto ---------------- */
export interface Toast { id: number; tipo: "ok" | "error" | "info"; titulo: string; texto?: string; }
export interface CartLinea { itemId: string; cantidad: number; }

interface AppCtx {
  db: DB;
  user: Usuario | null;
  token: string | null;
  tokenExp: number;
  login: (email: string, pass: string) => { ok: boolean; error?: string; usuario?: Usuario };
  register: (nombre: string, email: string, pass: string, rol: Rol) => { ok: boolean; error?: string };
  logout: () => void;
  renovarToken: () => void;
  mutate: (fn: (db: DB) => void) => void;
  carrito: CartLinea[];
  agregarCarrito: (itemId: string, cantidad?: number) => void;
  quitarCarrito: (itemId: string) => void;
  setCantidad: (itemId: string, cantidad: number) => void;
  vaciarCarrito: () => void;
  procesarPago: (metodo: "stripe" | "paypal", tarjeta: string) => Promise<{ orden: Orden; exito: boolean }>;
  forzarWebhook: (ordenId: string, resultado: "completado" | "fallido") => void;
  toasts: Toast[];
  toast: (tipo: Toast["tipo"], titulo: string, texto?: string) => void;
  cerrarToast: (id: number) => void;
}

const Ctx = createContext<AppCtx | null>(null);
export const useApp = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("AppProvider ausente");
  return v;
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
let toastSeq = 1;

export function AppProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(() => loadDB());
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tokenExp, setTokenExp] = useState(0);
  const [carrito, setCarrito] = useState<CartLinea[]>(() => {
    try { return JSON.parse(localStorage.getItem("ld_carrito") || "[]"); } catch { return []; }
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dbRef = useRef(db);
  dbRef.current = db;

  /* restaurar sesión */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("ld_sesion");
      if (!raw) return;
      const { token: t, userId } = JSON.parse(raw);
      const p = leerToken(t);
      if (p && p.exp > Date.now()) {
        const u = loadDB().usuarios.find(x => x.id === userId && x.activo);
        if (u) { setUser(u); setToken(t); setTokenExp(p.exp); }
      } else localStorage.removeItem("ld_sesion");
    } catch { /* sin sesión */ }
  }, []);

  useEffect(() => { localStorage.setItem("ld_carrito", JSON.stringify(carrito)); }, [carrito]);

  const toast = useCallback((tipo: Toast["tipo"], titulo: string, texto?: string) => {
    const id = toastSeq++;
    setToasts(t => [...t.slice(-3), { id, tipo, titulo, texto }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5200);
  }, []);
  const cerrarToast = useCallback((id: number) => setToasts(t => t.filter(x => x.id !== id)), []);

  const mutate = useCallback((fn: (db: DB) => void) => {
    setDb(prev => {
      const next: DB = JSON.parse(JSON.stringify(prev));
      fn(next);
      saveDB(next);
      return next;
    });
  }, []);

  const iniciarSesion = useCallback((u: Usuario) => {
    const t = emitirToken(u);
    setUser(u); setToken(t); setTokenExp(Date.now() + 30 * 60 * 1000);
    localStorage.setItem("ld_sesion", JSON.stringify({ token: t, userId: u.id }));
  }, []);

  const login = useCallback((email: string, pass: string) => {
    const u = dbRef.current.usuarios.find(x => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u || u.pass !== hashPass(pass)) return { ok: false, error: "Correo o contraseña incorrectos." };
    if (!u.activo) return { ok: false, error: "Esta cuenta fue desactivada por un administrador." };
    iniciarSesion(u);
    return { ok: true, usuario: u };
  }, [iniciarSesion]);

  const register = useCallback((nombre: string, email: string, pass: string, rol: Rol) => {
    if (dbRef.current.usuarios.some(x => x.email.toLowerCase() === email.trim().toLowerCase()))
      return { ok: false, error: "Ya existe una cuenta con ese correo." };
    const u: Usuario = {
      id: "u" + Date.now().toString(36), nombre: nombre.trim(), email: email.trim().toLowerCase(),
      pass: hashPass(pass), rol, activo: true, creadoEn: new Date().toISOString(), actualizadoEn: new Date().toISOString(),
    };
    mutate(d => { d.usuarios.push(u); });
    iniciarSesion(u);
    return { ok: true };
  }, [mutate, iniciarSesion]);

  const logout = useCallback(() => {
    setUser(null); setToken(null); setTokenExp(0);
    localStorage.removeItem("ld_sesion");
    navigate("/");
    toast("info", "Sesión cerrada", "Tu token JWT fue revocado.");
  }, [toast]);

  const renovarToken = useCallback(() => {
    if (!user) return;
    iniciarSesion(user);
    toast("ok", "Token renovado", "Nueva vigencia de 30 minutos.");
  }, [user, iniciarSesion, toast]);

  /* ---------------- carrito ---------------- */
  const agregarCarrito = useCallback((itemId: string, cantidad = 1) => {
    setCarrito(c => {
      const ex = c.find(l => l.itemId === itemId);
      return ex ? c.map(l => l.itemId === itemId ? { ...l, cantidad: l.cantidad + cantidad } : l) : [...c, { itemId, cantidad }];
    });
  }, []);
  const quitarCarrito = useCallback((itemId: string) => setCarrito(c => c.filter(l => l.itemId !== itemId)), []);
  const setCantidad = useCallback((itemId: string, cantidad: number) => {
    setCarrito(c => cantidad <= 0 ? c.filter(l => l.itemId !== itemId) : c.map(l => l.itemId === itemId ? { ...l, cantidad } : l));
  }, []);
  const vaciarCarrito = useCallback(() => setCarrito([]), []);

  /* ---------------- pago + webhook simulado ---------------- */
  const forzarWebhook = useCallback((ordenId: string, resultado: "completado" | "fallido") => {
    mutate(d => {
      const o = d.ordenes.find(x => x.id === ordenId);
      if (o) { o.estado = resultado; }
    });
    toast(resultado === "completado" ? "ok" : "error",
      `Webhook procesado · ${ordenId}`,
      resultado === "completado"
        ? "checkout.session.completed → orden completada. Contenido liberado."
        : "payment_intent.payment_failed → orden marcada como fallida.");
  }, [mutate, toast]);

  const procesarPago = useCallback(async (metodo: "stripe" | "paypal", tarjeta: string): Promise<{ orden: Orden; exito: boolean }> => {
    const u = user; if (!u) throw new Error("sin sesión");
    const lineas = carrito.map(l => ({ ...l, item: dbRef.current.items.find(i => i.id === l.itemId) as Item }));
    const total = lineas.reduce((s, l) => s + l.item.precio * l.cantidad, 0);
    const ordenId = "o" + Date.now().toString(36);
    const nueva: Orden = {
      id: ordenId, usuarioId: u.id, total, estado: "pendiente", metodo,
      fecha: new Date().toISOString(),
      ref: metodo === "stripe" ? "pi_" + Math.random().toString(36).slice(2, 14) : "PAYID-" + Math.random().toString(36).slice(2, 9).toUpperCase(),
    };
    mutate(d => {
      d.ordenes.push(nueva);
      lineas.forEach((l, i) => d.detalles.push({ id: "d" + Date.now().toString(36) + i, ordenId, itemId: l.itemId, cantidad: l.cantidad, precioUnitario: l.item.precio }));
    });
    toast("info", "Orden creada · pendiente", `${ordenId} espera confirmación de la pasarela (${metodo}).`);
    await sleep(1700);
    const limpia = tarjeta.replace(/[\s-]/g, "");
    const exito = metodo === "paypal" ? true : limpia.startsWith("4242424242424242");
    const final: Orden = { ...nueva, estado: exito ? "completado" : "fallido" };
    mutate(d => {
      const o = d.ordenes.find(x => x.id === ordenId);
      if (o) o.estado = final.estado as EstadoOrden;
    });
    if (exito) toast("ok", "Webhook recibido · pago completado", "Ejercicios y mandalas quedaron liberados en tu espacio.");
    else toast("error", "Webhook recibido · pago fallido", "La tarjeta fue rechazada. La orden quedó como fallida.");
    vaciarCarrito();
    return { orden: final, exito };
  }, [user, carrito, mutate, toast, vaciarCarrito]);

  const value = useMemo<AppCtx>(() => ({
    db, user, token, tokenExp, login, register, logout, renovarToken, mutate,
    carrito, agregarCarrito, quitarCarrito, setCantidad, vaciarCarrito,
    procesarPago, forzarWebhook, toasts, toast, cerrarToast,
  }), [db, user, token, tokenExp, login, register, logout, renovarToken, mutate, carrito,
    agregarCarrito, quitarCarrito, setCantidad, vaciarCarrito, procesarPago, forzarWebhook, toasts, toast, cerrarToast]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
