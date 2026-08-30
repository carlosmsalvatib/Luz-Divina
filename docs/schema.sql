-- ============================================================
-- Luz Divina · Esquema MariaDB 10.11+ · utf8mb4_unicode_ci
-- Ejecutar:  sudo mysql < docs/schema.sql
-- ============================================================
CREATE DATABASE IF NOT EXISTS luzdivina CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
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

-- Webhooks: idempotencia de eventos de pago
CREATE TABLE eventos_pago (
  id VARCHAR(80) PRIMARY KEY,                 -- evt_... de Stripe
  tipo VARCHAR(60) NOT NULL,
  orden_id INT UNSIGNED,
  payload JSON,
  recibido_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO roles (nombre) VALUES ('administrador'),('cliente'),('trabajador');
