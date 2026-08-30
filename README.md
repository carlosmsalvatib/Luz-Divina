# ✦ Luz Divina — plataforma contemplativa

Plataforma web completa: autenticación por roles (administrador / cliente / trabajador),
catálogo con carrito, CMS de administración, juego interactivo para colorear mandalas de
los Nombres de Dios y pasarela de pago (Stripe/PayPal) con webhooks simulados que liberan
el contenido comprado.

## Cuentas de demostración

| Rol           | Correo                | Contraseña   |
|---------------|-----------------------|--------------|
| Administrador | admin@luzdivina.net   | `luz-admin`  |
| Cliente       | cliente@luzdivina.net | `luz-cliente`|
| Trabajador    | taller@luzdivina.net  | `luz-taller` |

## Flujo completo (registro → compra → acceso)

1. Regístrate como **cliente** (o entra con la cuenta demo).
2. Agrega al carrito **«Colección Mandalas Sagrados» ($29)** y/o **«Camino de Contemplación» ($59)**.
3. Paga con la tarjeta de prueba `4242 4242 4242 4242` (Stripe simulado) o con PayPal.
4. La orden nace `pendiente`; el webhook simulado la sella como `completado`
   (cualquier otra tarjeta produce `fallido`).
5. Ejercicios y mandalas quedan **liberados al instante** en *Mi Espacio* y *El Juego*.
6. El mandala de **Elohim** y el ejercicio **Respiración del «Yo Soy»** son gratuitos.

## Arquitectura

- **Frontend:** React 18 + Vite + Tailwind CSS v4 · hash-routing con guards por rol.
- **Datos:** capa en `src/lib/data.ts` que replica 1:1 el esquema MariaDB de `docs/schema.sql`.
- **Auth:** JWT simulado (HS256) con expiración de 30 min y renovación; contraseñas con hash.
- **Juego:** mandalas SVG procedurales con ~70–90 regiones rellenables, paleta RGB,
  cuentagotas, borrador, deshacer, zoom, autoguardado por usuario+mandala e impresión.
- **Pagos:** Stripe/PayPal simulados con webhooks (`checkout.session.completed`,
  `payment_intent.payment_failed`) e idempotencia documentada en `eventos_pago`.

## Seguridad (checklist Fase 4)

- Contraseñas hasheadas, nunca en texto plano.
- Guards de rol en cada ruta (403 para rol equivocado) — espejo del middleware de la API.
- React escapa XSS por defecto; inputs validados en formularios.
- Webhook con verificación de firma + tabla de idempotencia.
- SQL solo con *prepared statements* en la API de referencia.

## Despliegue (VPS + MariaDB + SSL)

Guía completa dentro de la app: **Docs → Despliegue y SSL**, y en `docs/schema.sql`.
Resumen: Ubuntu 22.04 + nginx + MariaDB + Node 20/PM2 + Certbot (HTTPS forzado).
