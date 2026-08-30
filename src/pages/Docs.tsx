import { useState } from "react";
import { SQL_SCHEMA, DOC_DEPLOY, DOC_README } from "../lib/data";
import { Icon, Btn, Reveal, Overline, Badge } from "../components/ui";

const SECCIONES = [
  { id: "sql", label: "Esquema MariaDB", icon: "base", contenido: SQL_SCHEMA, desc: "Tablas con índices y llaves foráneas — se ejecuta con `mysql < schema.sql`." },
  { id: "deploy", label: "Despliegue y SSL", icon: "escudo", contenido: DOC_DEPLOY, desc: "VPS, nginx, MariaDB, PM2 y Let's Encrypt con HTTPS forzado." },
  { id: "readme", label: "README del repositorio", icon: "libro", contenido: DOC_README, desc: "Cuentas demo, flujo completo de compra y checklist de seguridad." },
] as const;

export default function Docs() {
  const [sel, setSel] = useState<(typeof SECCIONES)[number]["id"]>("sql");
  const [copiado, setCopiado] = useState(false);
  const activa = SECCIONES.find(s => s.id === sel)!;

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(activa.contenido);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch { /* portapapeles bloqueado */ }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
      <Reveal><Overline>Entrega técnica · Fase 4</Overline></Reveal>
      <Reveal delay={1}>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-5xl text-ivory-50 font-bold" style={{ fontFamily: "var(--font-display)" }}>
              Documentación del <span className="text-gold-400">repositorio</span>
            </h1>
            <p className="mt-3 text-ivory-300 max-w-2xl">
              Scripts de base de datos, instrucciones de instalación y manual de entrega — también incluidos
              como <code className="text-xs bg-night-800 px-1.5 py-0.5 rounded border border-ivory-500/15">docs/schema.sql</code> y{" "}
              <code className="text-xs bg-night-800 px-1.5 py-0.5 rounded border border-ivory-500/15">README.md</code> en el código fuente.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge tono="jade"><Icon name="base" size={11} /> MariaDB 10.11</Badge>
            <Badge tono="oro"><Icon name="rayo" size={11} /> Node 20 + Express</Badge>
            <Badge tono="azul"><Icon name="escudo" size={11} /> SSL Let's Encrypt</Badge>
          </div>
        </div>
      </Reveal>

      <Reveal delay={2}>
        <div className="mt-10 flex gap-2 flex-wrap">
          {SECCIONES.map(s => (
            <button key={s.id} onClick={() => setSel(s.id)}
              className={`px-4 py-2.5 rounded-md text-sm font-medium inline-flex items-center gap-2 border transition-all cursor-pointer ${sel === s.id ? "bg-gold-500 text-night-900 border-gold-500 font-semibold" : "border-ivory-500/25 text-ivory-300 hover:border-gold-500/60 hover:text-gold-300"}`}>
              <Icon name={s.icon} size={15} /> {s.label}
            </button>
          ))}
        </div>
      </Reveal>

      <div className="mt-6 card-sacred rounded-xl overflow-hidden anim-fade-up" key={sel}>
        <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-ivory-500/12 bg-night-800/70 flex-wrap">
          <p className="text-sm text-ivory-300">{activa.desc}</p>
          <Btn tam="sm" variante={copiado ? "jade" : "ghost"} onClick={copiar}>
            <Icon name={copiado ? "check" : "copiar"} size={13} /> {copiado ? "Copiado" : "Copiar"}
          </Btn>
        </div>
        <pre className="p-6 overflow-x-auto text-[0.8rem] leading-relaxed text-ivory-300 font-mono max-h-[62vh] overflow-y-auto whitespace-pre">{activa.contenido}</pre>
      </div>

      <div className="mt-10 grid md:grid-cols-3 gap-4">
        {[
          { t: "Manual del CMS", d: "El panel de administración guía cada CRUD con formularios, previsualización y confirmaciones — pensado para no necesitar este manual." },
          { t: "Video tutorial", d: "Recorrido de 6 minutos: registro → compra con tarjeta de prueba → liberación de mandalas → impresión de la obra." },
          { t: "Pruebas E2E", d: "Flujo completo verificado: XSS (escapado de React), CSRF (tokens), inyección SQL (prepared statements) y carga con caché + lazy loading." },
        ].map((x, i) => (
          <Reveal key={x.t} delay={(i % 3) as 0 | 1 | 2}>
            <article className="card-sacred rounded-xl p-6 h-full">
              <h3 className="text-base text-ivory-50 font-semibold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                <Icon name={["libro", "ojo", "escudo"][i]} size={16} className="text-gold-500" /> {x.t}
              </h3>
              <p className="mt-2 text-sm text-ivory-500 leading-relaxed">{x.d}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
