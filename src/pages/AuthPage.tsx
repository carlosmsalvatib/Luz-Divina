import { useEffect, useState } from "react";
import { useApp, navigate } from "../lib/context";
import type { Rol } from "../lib/data";
import { Icon, Btn, Field, Input, Select, Reveal, Badge, RolBadge } from "../components/ui";
import { Mandala } from "../components/Mandala";

const DEMOS = [
  { rol: "administrador" as Rol, email: "admin@luzdivina.net", pass: "luz-admin" },
  { rol: "cliente" as Rol, email: "cliente@luzdivina.net", pass: "luz-cliente" },
  { rol: "trabajador" as Rol, email: "taller@luzdivina.net", pass: "luz-taller" },
];

export default function AuthPage() {
  const { login, register, toast, user } = useApp();
  const [modo, setModo] = useState<"entrar" | "registro">("entrar");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [rol, setRol] = useState<Rol>("cliente");
  const [error, setError] = useState("");

  useEffect(() => { setError(""); }, [modo]);

  if (user) {
    const destinoUser = user.rol === "administrador" ? "/admin" : user.rol === "trabajador" ? "/taller" : "/mi-espacio";
    return (
      <div className="max-w-xl mx-auto px-5 py-24">
        <div className="card-sacred rounded-xl p-8 text-center anim-fade-up">
          <div className="mx-auto w-14 h-14 rounded-full grid place-items-center bg-jade-500/15 border border-jade-500/50 text-jade-400"><Icon name="check" size={24} /></div>
          <h1 className="mt-5 text-2xl text-ivory-50 font-bold" style={{ fontFamily: "var(--font-display)" }}>Ya tienes sesión activa</h1>
          <p className="mt-2 text-sm text-ivory-500">Estás dentro como <span className="text-gold-300">{user.nombre}</span> · rol <span className="text-gold-300 capitalize">{user.rol}</span>.</p>
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <Btn onClick={() => navigate(destinoUser)}>Ir a mi sala <Icon name="flecha" size={14} /></Btn>
            <Btn variante="ghost" onClick={() => navigate("/catalogo")}>Ver catálogo</Btn>
          </div>
        </div>
      </div>
    );
  }

  const destino = (r: Rol) => r === "administrador" ? "/admin" : r === "trabajador" ? "/taller" : "/mi-espacio";

  const enviar = () => {
    setError("");
    if (modo === "registro") {
      if (nombre.trim().length < 2) return setError("Escribe tu nombre completo.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("El correo no parece válido.");
      if (pass.length < 6) return setError("La contraseña necesita al menos 6 caracteres.");
      const r = register(nombre, email, pass, rol);
      if (!r.ok) return setError(r.error ?? "No fue posible registrarte.");
      toast("ok", `Bienvenida, alma nueva`, "Tu cuenta fue creada y tu token JWT emitido (30 min).");
      navigate(destino(rol));
    } else {
      const r = login(email, pass);
      if (!r.ok) return setError(r.error ?? "No fue posible entrar.");
      toast("ok", `La paz sea contigo, ${r.usuario!.nombre.split(" ")[0]}`, `Sesión JWT activa como ${r.usuario!.rol}.`);
      navigate(destino(r.usuario!.rol));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 grid lg:grid-cols-2 gap-14 items-center min-h-[80vh]">
      <Reveal>
        <div className="card-sacred rounded-xl p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 text-gold-500/10"><Mandala variante={2} conNombres={false} nombreDios="Adonai" className="w-full h-full" /></div>
          <p className="text-[0.7rem] uppercase tracking-[0.32em] text-gold-500 font-semibold">Puerta del santuario</p>
          <h1 className="mt-3 text-3xl text-ivory-50 font-bold" style={{ fontFamily: "var(--font-display)" }}>
            {modo === "entrar" ? "Vuelve a la luz" : "Crea tu cuenta"}
          </h1>
          <p className="mt-2 text-sm text-ivory-500">
            {modo === "entrar" ? "Autenticación JWT con roles: administrador, cliente y trabajador." : "Registro con token JWT de 30 minutos y rol asignado."}
          </p>

          <div className="mt-6 grid grid-cols-2 rounded-md overflow-hidden border border-ivory-500/20">
            {(["entrar", "registro"] as const).map(m => (
              <button key={m} onClick={() => setModo(m)}
                className={`py-2.5 text-sm font-semibold uppercase tracking-[0.18em] transition-all cursor-pointer ${modo === m ? "bg-gold-500 text-night-900" : "bg-night-950/60 text-ivory-500 hover:text-gold-300"}`}>
                {m === "entrar" ? "Entrar" : "Registrarme"}
              </button>
            ))}
          </div>

          <form className="mt-6 space-y-4" onSubmit={e => { e.preventDefault(); enviar(); }}>
            {modo === "registro" && (
              <>
                <Field label="Nombre completo"><Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="María de la Luz" autoComplete="name" /></Field>
                <Field label="Quiero entrar como">
                  <Select value={rol} onChange={e => setRol(e.target.value as Rol)}>
                    <option value="cliente">Cliente — compro y contemplo</option>
                    <option value="trabajador">Trabajador — guío ejercicios</option>
                  </Select>
                </Field>
              </>
            )}
            <Field label="Correo"><Input value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.net" type="email" autoComplete="email" /></Field>
            <Field label="Contraseña"><Input value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" type="password" autoComplete="current-password" /></Field>
            {error && (
              <p className="text-sm text-ember-400 bg-ember-500/10 border border-ember-500/30 rounded-md px-3.5 py-2.5 flex items-center gap-2 anim-fade-up">
                <Icon name="x" size={14} /> {error}
              </p>
            )}
            <Btn tam="lg" className="w-full" type="submit">
              <Icon name={modo === "entrar" ? "candadoAbierto" : "chispa"} /> {modo === "entrar" ? "Entrar con JWT" : "Crear cuenta y entrar"}
            </Btn>
          </form>

          <div className="mt-7">
            <p className="text-[0.68rem] uppercase tracking-[0.26em] text-ivory-500 mb-3">Cuentas de demostración · un clic</p>
            <div className="grid sm:grid-cols-3 gap-2">
              {DEMOS.map(d => (
                <button key={d.email} onClick={() => { setModo("entrar"); setEmail(d.email); setPass(d.pass); }}
                  className="text-left rounded-lg border border-ivory-500/20 bg-night-950/60 px-3 py-2.5 hover:border-gold-500/60 hover:-translate-y-0.5 transition-all cursor-pointer">
                  <RolBadge rol={d.rol} />
                  <span className="block mt-1.5 text-[0.7rem] text-ivory-300 truncate">{d.email}</span>
                  <span className="block text-[0.65rem] text-ivory-500 font-mono">{d.pass}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={2} className="hidden lg:block">
        <div className="relative">
          <div className="w-[420px] mx-auto anim-breathe"><Mandala variante={0} nombreDios="Yo Soy" className="w-full h-full" /></div>
          <blockquote className="mt-8 text-center max-w-md mx-auto">
            <p className="text-xl text-ivory-100 font-light leading-relaxed" style={{ fontFamily: "var(--font-display)" }}>
              «Acércate, que la lámpara ya está encendida para ti.»
            </p>
            <footer className="mt-3 text-xs uppercase tracking-[0.3em] text-ivory-500">Libro de la casa · I, 4</footer>
          </blockquote>
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <Badge tono="jade"><Icon name="escudo" size={11} /> Contraseñas con hash</Badge>
            <Badge tono="oro"><Icon name="rayo" size={11} /> Token 30 min · renovable</Badge>
            <Badge tono="azul"><Icon name="usuario" size={11} /> 3 roles con permisos</Badge>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
