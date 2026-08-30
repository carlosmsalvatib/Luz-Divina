/* ============================================================
   LUZ DIVINA — capa de datos (simula la API Express + MariaDB)
   ============================================================ */

export type Rol = "administrador" | "cliente" | "trabajador";

export interface Usuario {
  id: string; nombre: string; email: string; pass: string;
  rol: Rol; activo: boolean; creadoEn: string; actualizadoEn: string;
}
export interface Categoria { id: string; nombre: string; descripcion: string; }
export type TipoItem = "producto" | "ejercicio" | "mandala";
export interface Item {
  id: string; nombre: string; descripcion: string; precio: number;
  categoriaId: string; imagen: string; tipo: TipoItem; vinculoId: string; activo: boolean;
}
export interface Ejercicio {
  id: string; titulo: string; descripcion: string; tipo: "lectura" | "audio" | "practica" | "video";
  orden: number; duracion: number; pasos: string[];
}
export interface Mandala {
  id: string; nombre: string; nombreDios: string; significado: string;
  variante: number; imagenOriginal: string | null; sonido: boolean; activo: boolean; creadoEn: string;
}
export type EstadoOrden = "pendiente" | "completado" | "fallido";
export interface Orden {
  id: string; usuarioId: string; total: number; estado: EstadoOrden;
  metodo: "stripe" | "paypal"; fecha: string; ref: string;
}
export interface DetalleOrden { id: string; ordenId: string; itemId: string; cantidad: number; precioUnitario: number; }
export type EstadoSesion = "pendiente" | "en-curso" | "completada";
export interface Sesion { id: string; usuarioId: string; ejercicioId: string; estado: EstadoSesion; progreso: number; actualizadoEn: string; }

export interface DB {
  usuarios: Usuario[]; categorias: Categoria[]; items: Item[];
  ejercicios: Ejercicio[]; mandalas: Mandala[]; ordenes: Orden[];
  detalles: DetalleOrden[]; sesiones: Sesion[];
}

/* ---------------- nombres de Dios ---------------- */
export const NOMBRES_DE_DIOS = ["Elohim", "Yahweh", "Jehová", "Adonai", "El Shaddai", "El Elyón", "Emanuel", "El Olam", "El Roi", "Yo Soy"];

/* ---------------- paleta del juego ---------------- */
export const PALETA_SAGRADA = [
  "#e3b65f", "#c99b45", "#f0d9a6", "#fdf6e3", "#e89563", "#d97941",
  "#b8552f", "#8a3b3b", "#4e9c8b", "#6fbfa9", "#2e6e63", "#1b414d",
  "#3f7f9e", "#7fc3d9", "#cfe8ef", "#9a8fc2", "#5e548e", "#3d3566",
  "#7d9c55", "#b5cf8e", "#f2e4c9", "#0e2028",
];

export function hashPass(p: string) {
  let h = 5381;
  for (let i = 0; i < p.length; i++) h = ((h << 5) + h + p.charCodeAt(i)) | 0;
  return "h$" + (h >>> 0).toString(16) + "$" + p.length.toString(16);
}

const now = () => new Date().toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 864e5).toISOString();

/* ---------------- seed ---------------- */
export function seedDB(): DB {
  return {
    usuarios: [
      { id: "u1", nombre: "Hna. Miriam del Valle", email: "admin@luzdivina.net", pass: hashPass("luz-admin"), rol: "administrador", activo: true, creadoEn: daysAgo(210), actualizadoEn: daysAgo(2) },
      { id: "u2", nombre: "Sofía Herrera", email: "cliente@luzdivina.net", pass: hashPass("luz-cliente"), rol: "cliente", activo: true, creadoEn: daysAgo(60), actualizadoEn: daysAgo(1) },
      { id: "u3", nombre: "Daniel Ortega", email: "taller@luzdivina.net", pass: hashPass("luz-taller"), rol: "trabajador", activo: true, creadoEn: daysAgo(120), actualizadoEn: daysAgo(4) },
      { id: "u4", nombre: "Mateo Aguirre", email: "mateo@luzdivina.net", pass: hashPass("gracia2024"), rol: "cliente", activo: true, creadoEn: daysAgo(9), actualizadoEn: daysAgo(9) },
    ],
    categorias: [
      { id: "c1", nombre: "Experiencias", descripcion: "Retiros, sesiones y encuentros presenciales de contemplación." },
      { id: "c2", nombre: "Formación", descripcion: "Cursos y caminos guiados sobre los Nombres de Dios." },
      { id: "c3", nombre: "Hogar Sagrado", descripcion: "Objetos de devoción para convertir tu casa en un santuario." },
      { id: "c4", nombre: "Digital y Mandalas", descripcion: "Contenido descargable y colecciones del juego de mandalas." },
    ],
    items: [
      { id: "i1", nombre: "Retiro «Amanecer Sagrado»", descripcion: "Fin de semana de silencio, lectio divina y contemplación del Nombre en la sierra. Incluye hospedaje, alimentos y guía espiritual. Cupo limitado a 14 almas.", precio: 189, categoriaId: "c1", imagen: "https://image.qwenlm.ai/generated-images/5e25ed54-36bb-492e-b582-9aff816f2d1c/_result.png", tipo: "producto", vinculoId: "", activo: true },
      { id: "i2", nombre: "Sesión de Cuencos Tibetanos", descripcion: "Sesión individual de 60 minutos de sanación sonora con cuencos antiguos afinados. El sonido abre el corazón antes de la meditación del Nombre.", precio: 45, categoriaId: "c1", imagen: "https://image.qwenlm.ai/generated-images/71d5aa9b-1265-4bbd-9cc8-f70f84d3d5e0/_result.png", tipo: "producto", vinculoId: "", activo: true },
      { id: "i3", nombre: "Curso «Los 7 Nombres de Dios»", descripcion: "Siete semanas de estudio profundo: etimología hebrea, historia y práctica contemplativa de cada Nombre. Con manuscrito iluminado digital de regalo.", precio: 120, categoriaId: "c2", imagen: "https://image.qwenlm.ai/generated-images/17cda1ab-967d-4516-a94b-1e6e6b12426d/_result.png", tipo: "producto", vinculoId: "", activo: true },
      { id: "i4", nombre: "Camino de Contemplación", descripcion: "Acceso completo a la biblioteca de ejercicios contemplativos: respiración del Nombre, lectio divina y prácticas de silencio, con seguimiento de un guía.", precio: 59, categoriaId: "c2", imagen: "", tipo: "ejercicio", vinculoId: "*", activo: true },
      { id: "i5", nombre: "Kit de Mandalas para Imprimir", descripcion: "Doce mandalas de los Nombres en papel de algodón 200 g, más set de lápices pigmentados. El arte sagrado llega a tu puerta.", precio: 24, categoriaId: "c3", imagen: "https://image.qwenlm.ai/generated-images/b60ab147-a8b4-4fe8-a862-50c3da209eae/_result.png", tipo: "producto", vinculoId: "", activo: true },
      { id: "i6", nombre: "Vela Ritual de Miel y Ámbar", descripcion: "Vela artesanal de cera de abeja con miel y ámbar gris. 40 horas de llama serena para acompañar la oración del Nombre.", precio: 18, categoriaId: "c3", imagen: "https://image.qwenlm.ai/generated-images/61c84da0-af2f-4195-81e4-ff297bb3733c/_result.png", tipo: "producto", vinculoId: "", activo: true },
      { id: "i7", nombre: "Incienso de Olíbano", descripcion: "Resina pura de olíbano de Omán con carbón vegetal y cucharilla de latón. El humo que sube como oración.", precio: 15, categoriaId: "c3", imagen: "https://image.qwenlm.ai/generated-images/e82f7edb-9de8-4d4e-97ea-bb2b2ccf9130/_result.png", tipo: "producto", vinculoId: "", activo: true },
      { id: "i8", nombre: "Colección «Mandalas Sagrados»", descripcion: "Desbloquea todos los mandalas del juego interactivo: El Shaddai, Adonai, Emanuel y futuras incorporaciones. Colorea, guarda e imprime tus obras.", precio: 29, categoriaId: "c4", imagen: "", tipo: "mandala", vinculoId: "*", activo: true },
    ],
    ejercicios: [
      { id: "e1", titulo: "Respiración del «Yo Soy»", descripcion: "Práctica introductoria y gratuita: unir la respiración con el Nombre que es presencia pura.", tipo: "practica", orden: 1, duracion: 10, pasos: ["Enciende una vela y siéntate con la espalda erguida, manos abiertas sobre las rodillas.", "Inhala en cuatro tiempos diciendo interiormente «Yo»; sostén cuatro tiempos; exhala en seis diciendo «Soy».", "Repite el ciclo diez veces, dejando que el pecho se vuelva lámpara.", "Permanece un minuto en silencio: la presencia ya está contigo.", "Cierra agradeciendo con una inclinación de cabeza."] },
      { id: "e2", titulo: "Lectio Divina de Elohim", descripcion: "Lectura orante de Génesis 1 con el Nombre del Creador: leer, meditar, orar, contemplar.", tipo: "lectura", orden: 2, duracion: 25, pasos: ["Lee Génesis 1, 1-5 en voz baja, sin prisa.", "Repite una palabra que te haya tocado; saboréala un minuto entero.", "Convierte esa palabra en una oración breve dirigida a Elohim.", "Escribe una línea sobre qué está creando Dios en ti hoy.", "Termina con un salmo breve: «Vio Dios que la luz era buena»."] },
      { id: "e3", titulo: "Meditación El Shaddai", descripcion: "El Todopoderoso como montaña interior: práctica de firmeza y refugio en la tormenta.", tipo: "audio", orden: 3, duracion: 20, pasos: ["Escucha la campana inicial y cierra los ojos.", "Visualiza una montaña que no se mueve aunque cambie el clima.", "Coloca tu nombre en la cima; el Nombre El Shaddai la sostiene.", "Respira hacia la base de la montaña: raíces profundas.", "Al final, guarda la imagen en el corazón y abre los ojos despacio."] },
      { id: "e4", titulo: "Salmo de Luz con Adonai", descripcion: "Recitación contemplativa del Salmo 27: «El Señor es mi luz y mi salvación».", tipo: "lectura", orden: 4, duracion: 15, pasos: ["Proclama el versículo 1 tres veces, cada vez más lento.", "Identifica una sombra concreta de esta semana y nómbrala ante Adonai.", "Sobre esa sombra, repite: «El Señor es mi luz».", "Enciende tu vela como signo visible de la palabra.", "Anota en tu cuaderno la luz que pediste."] },
      { id: "e5", titulo: "Silencio en Emanuel", descripcion: "Práctica de la presencia acompañada: veinte minutos de silencio habitado, «Dios con nosotros».", tipo: "practica", orden: 5, duracion: 20, pasos: ["Prepara un rincón con tu mandala coloreado como icono.", "Suena la campana y entra en silencio total.", "Cuando llegue un pensamiento, ofrécelo con la palabra «Emanuel».", "Sostén el silencio veinte minutos; la compañía no se anuncia.", "Despídete escribiendo una sola palabra en tu diario."] },
    ],
    mandalas: [
      { id: "m1", nombre: "Mandala de Elohim", nombreDios: "Elohim", significado: "El Creador · la multiplicidad que surge del Uno", variante: 0, imagenOriginal: null, sonido: true, activo: true, creadoEn: daysAgo(90) },
      { id: "m2", nombre: "Mandala de El Shaddai", nombreDios: "El Shaddai", significado: "El Todopoderoso · la montaña que sostiene", variante: 1, imagenOriginal: null, sonido: true, activo: true, creadoEn: daysAgo(75) },
      { id: "m3", nombre: "Mandala de Adonai", nombreDios: "Adonai", significado: "El Señor · la lámpara que no se apaga", variante: 2, imagenOriginal: null, sonido: false, activo: true, creadoEn: daysAgo(60) },
      { id: "m4", nombre: "Mandala de Emanuel", nombreDios: "Emanuel", significado: "Dios con nosotros · el abrazo del centro", variante: 1, imagenOriginal: null, sonido: true, activo: true, creadoEn: daysAgo(30) },
    ],
    ordenes: [
      { id: "o1", usuarioId: "u2", total: 88, estado: "completado", metodo: "stripe", fecha: daysAgo(12), ref: "pi_3OqLdK2eZvKYlo" },
      { id: "o2", usuarioId: "u4", total: 120, estado: "pendiente", metodo: "paypal", fecha: daysAgo(1), ref: "PAYID-MXK42QA" },
      { id: "o3", usuarioId: "u2", total: 42, estado: "completado", metodo: "stripe", fecha: daysAgo(40), ref: "pi_3OpXwE8vBnRt" },
    ],
    detalles: [
      { id: "d1", ordenId: "o1", itemId: "i4", cantidad: 1, precioUnitario: 59 },
      { id: "d2", ordenId: "o1", itemId: "i8", cantidad: 1, precioUnitario: 29 },
      { id: "d3", ordenId: "o2", itemId: "i3", cantidad: 1, precioUnitario: 120 },
      { id: "d4", ordenId: "o3", itemId: "i5", cantidad: 1, precioUnitario: 24 },
      { id: "d5", ordenId: "o3", itemId: "i6", cantidad: 1, precioUnitario: 18 },
    ],
    sesiones: [
      { id: "s1", usuarioId: "u2", ejercicioId: "e2", estado: "en-curso", progreso: 60, actualizadoEn: daysAgo(2) },
      { id: "s2", usuarioId: "u4", ejercicioId: "e1", estado: "pendiente", progreso: 0, actualizadoEn: daysAgo(1) },
      { id: "s3", usuarioId: "u2", ejercicioId: "e5", estado: "completada", progreso: 100, actualizadoEn: daysAgo(6) },
      { id: "s4", usuarioId: "u2", ejercicioId: "e3", estado: "en-curso", progreso: 35, actualizadoEn: daysAgo(3) },
    ],
  };
}

/* ---------------- desbloqueos ---------------- */
export function mandalaDesbloqueado(db: DB, userId: string, mandalaId: string) {
  if (mandalaId === "m1") return true; // mandala gratuito de bienvenida
  return db.ordenes.some(o =>
    o.usuarioId === userId && o.estado === "completado" &&
    db.detalles.some(d => {
      if (d.ordenId !== o.id) return false;
      const it = db.items.find(i => i.id === d.itemId);
      return it?.tipo === "mandala" && (it.vinculoId === "*" || it.vinculoId === mandalaId);
    }));
}
export function ejercicioDesbloqueado(db: DB, userId: string, ejercicioId: string) {
  if (ejercicioId === "e1") return true;
  return db.ordenes.some(o =>
    o.usuarioId === userId && o.estado === "completado" &&
    db.detalles.some(d => {
      if (d.ordenId !== o.id) return false;
      const it = db.items.find(i => i.id === d.itemId);
      return it?.tipo === "ejercicio" && (it.vinculoId === "*" || it.vinculoId === ejercicioId);
    }));
}

/* ---------------- paleta original de cada mandala ---------------- */
export function paletaOriginal(variante: number): Record<string, string> {
  const esquemas = [
    ["#e3b65f", "#4e9c8b", "#d97941", "#f0d9a6", "#2e6e63", "#c99b45", "#7fc3d9", "#1b414d"],
    ["#c99b45", "#3f7f9e", "#e89563", "#6fbfa9", "#5e548e", "#f0d9a6", "#35766a", "#e3b65f"],
    ["#d97941", "#e3b65f", "#2e6e63", "#f2e4c9", "#7d9c55", "#c99b45", "#3d3566", "#6fbfa9"],
  ];
  const esq = esquemas[variante % esquemas.length];
  const fills: Record<string, string> = {};
  for (let i = 0; i < 240; i++) fills["r" + i] = esq[i % esq.length];
  return fills;
}

/* ---------------- persistencia ---------------- */
const KEY = "luzdivina_db_v3";
export function loadDB(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as DB;
  } catch { /* seed */ }
  const db = seedDB();
  saveDB(db);
  return db;
}
export function saveDB(db: DB) {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* quota */ }
}
export function loadPaint(userId: string, mandalaId: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(`ld_paint_${userId}_${mandalaId}`);
    if (raw) return JSON.parse(raw);
  } catch { /* vacío */ }
  return {};
}
export function savePaint(userId: string, mandalaId: string, fills: Record<string, string>) {
  try { localStorage.setItem(`ld_paint_${userId}_${mandalaId}`, JSON.stringify(fills)); } catch { /* quota */ }
}

export const fmtMoney = (n: number) => "$" + n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmtFecha = (iso: string) => new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });

/* ============================================================
   DOCUMENTACIÓN: esquema SQL MariaDB + despliegue (Fase 1 y 4)
   ============================================================ */
export const SQL_SCHEMA = `-- Luz Divina · Esquema MariaDB 10.11+ · utf8mb4_unicode_ci
CREATE DATABASE luzdivina CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE luzdivina;

CREATE TABLE roles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre ENUM('administrador','cliente','trabajador') NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  pass_hash VARCHAR(255) NOT NULL,            -- bcrypt (cost 12)
  rol_id INT UNSIGNED NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                 ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_usuarios_email (email),
  CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES roles(id)
) ENGINE=InnoDB;

CREATE TABLE categorias (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  descripcion TEXT
) ENGINE=InnoDB;

CREATE TABLE items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(140) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  categoria_id INT UNSIGNED NOT NULL,
  imagen VARCHAR(255),
  tipo ENUM('producto','ejercicio','mandala') NOT NULL DEFAULT 'producto',
  vinculo_id VARCHAR(40) DEFAULT NULL,        -- '*' libera toda la colección
  activo TINYINT(1) NOT NULL DEFAULT 1,
  INDEX idx_items_categoria (categoria_id),
  INDEX idx_items_activo (activo),
  CONSTRAINT fk_items_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id)
) ENGINE=InnoDB;

CREATE TABLE ejercicios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(140) NOT NULL,
  descripcion TEXT,
  archivo VARCHAR(255),
  tipo ENUM('lectura','audio','video','practica') NOT NULL,
  orden INT NOT NULL DEFAULT 0,
  INDEX idx_ejercicios_orden (orden)
) ENGINE=InnoDB;

CREATE TABLE ordenes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  estado ENUM('pendiente','completado','fallido') NOT NULL DEFAULT 'pendiente',
  metodo ENUM('stripe','paypal') NOT NULL DEFAULT 'stripe',
  referencia_pago VARCHAR(80),
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ordenes_usuario (usuario_id),
  INDEX idx_ordenes_estado (estado),
  CONSTRAINT fk_ordenes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

CREATE TABLE detalles_orden (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  orden_id INT UNSIGNED NOT NULL,
  item_id INT UNSIGNED NOT NULL,
  cantidad INT UNSIGNED NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  INDEX idx_detalles_orden (orden_id),
  CONSTRAINT fk_detalles_orden FOREIGN KEY (orden_id) REFERENCES ordenes(id) ON DELETE CASCADE,
  CONSTRAINT fk_detalles_item FOREIGN KEY (item_id) REFERENCES items(id)
) ENGINE=InnoDB;

CREATE TABLE mandalas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  nombre_dios VARCHAR(60) NOT NULL,
  imagen_original VARCHAR(255),
  imagen_coloreable VARCHAR(255),
  sonido_url VARCHAR(255),
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE mandalas_usuario (              -- progreso de coloreado
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  mandala_id INT UNSIGNED NOT NULL,
  fills_json LONGTEXT,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                 ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_progreso (usuario_id, mandala_id),
  CONSTRAINT fk_mu_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_mu_mandala FOREIGN KEY (mandala_id) REFERENCES mandalas(id)
) ENGINE=InnoDB;

-- Webhooks: tabla de idempotencia para pagos
CREATE TABLE eventos_pago (
  id VARCHAR(80) PRIMARY KEY,                 -- evt_... de Stripe
  tipo VARCHAR(60) NOT NULL,
  orden_id INT UNSIGNED,
  payload JSON,
  recibido_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO roles (nombre) VALUES ('administrador'),('cliente'),('trabajador');`;

export const DOC_DEPLOY = `# Despliegue — VPS + MariaDB + SSL (Fase 1 y 4)

## 1. Servidor y dominio
· Contrata un VPS (Ubuntu 22.04, 2 vCPU / 4 GB) y apunta tu dominio
  luzdivina.net (registro a 2 años) al DNS del servidor (registro A).
· Fuerza HTTPS: el propio Certbot agrega la redirección 301 en nginx.

## 2. Stack
    sudo apt update && sudo apt upgrade -y
    sudo apt install nginx mariadb-server certbot python3-certbot-nginx -y
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install nodejs -y && sudo npm i -g pm2

## 3. Base de datos
    sudo mysql_secure_installation
    sudo mysql < server/schema.sql
    CREATE USER 'luz'@'localhost' IDENTIFIED BY 'CLAVE_FUERTE';
    GRANT SELECT, INSERT, UPDATE, DELETE ON luzdivina.* TO 'luz'@'localhost';

## 4. API Express + JWT
    cd api && npm ci && cp .env.example .env   # llena los secretos
    pm2 start ecosystem.config.js && pm2 save && pm2 startup

## 5. Frontend estático (este build de Vite)
    npm run build → copia dist/ a /var/www/luzdivina
    nginx: root /var/www/luzdivina; try_files $uri /index.html;

## 6. SSL gratuito (Let's Encrypt)
    sudo certbot --nginx -d luzdivina.net -d www.luzdivina.net
    # renovación automática ya instalada: certbot renew --dry-run

## 7. Webhooks de Stripe
    Endpoint: https://luzdivina.net/api/webhooks/stripe
    Eventos:  checkout.session.completed · payment_intent.payment_failed
    El handler verifica la firma (stripe.webhooks.constructEvent),
    guarda idempotencia en eventos_pago y actualiza:
    ordenes.estado  pendiente → completado | fallido
    → libera ejercicios/mandalas vía tabla items.vinculo_id.`;

export const DOC_README = `# Luz Divina — plataforma contemplativa

## Cuentas de demostración
    Administrador  admin@luzdivina.net   luz-admin
    Cliente        cliente@luzdivina.net luz-cliente  (ya tiene compras)
    Trabajador     taller@luzdivina.net  luz-taller

## Flujo completo (registro → compra → acceso)
    1. Regístrate como cliente.
    2. Agrega «Colección Mandalas Sagrados» y «Camino de Contemplación».
    3. Paga con la tarjeta de prueba 4242 4242 4242 4242 (Stripe simulado).
    4. El webhook simulado marca la orden «completado».
    5. El contenido se libera al instante en «Mi Espacio» y «El Juego».
    · Cualquier otro número de tarjeta genera una orden «fallido».

## Arquitectura
    React 18 + Vite + Tailwind v4  ·  hash-routing con guards por rol
    Capa de datos en src/lib/data.ts replica el esquema MariaDB
    (src/lib/data.ts → server/schema.sql) 1 a 1.
    JWT simulado con expiración de 30 min y botón de renovación.

## Seguridad aplicada (checklist Fase 4)
    · Contraseñas con hash, nunca en texto plano.
    · Guards de rol en cada ruta (403 para rol equivocado).
    · Sanitización: React escapa XSS por defecto; inputs validados.
    · Webhook con verificación de firma + idempotencia (eventos_pago).
    · SQL: queries parametrizadas con prepared statements en la API.`;
