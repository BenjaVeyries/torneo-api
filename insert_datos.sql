-- ==========================================================================
-- SCRIPT DE INSERTS SQL - DEMO DE TORNEOS DE FÚTBOL
-- Puedes ejecutar este código directamente en la pestaña "SQL" de phpMyAdmin.
-- ==========================================================================

-- Seleccionar la base de datos
USE torneo_api;

-- Desactivar restricciones de llaves foráneas temporalmente para evitar bloqueos
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar tablas para evitar registros duplicados (usamos DELETE FROM para evitar el error #1701 de TRUNCATE en MySQL)
DELETE FROM estadisticas;
DELETE FROM partido_jugadores;
DELETE FROM partidos;
DELETE FROM jugadores;
DELETE FROM equipos;
DELETE FROM torneos;
DELETE FROM usuarios;

-- Reactivar restricciones
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================================================
-- 1. REGISTRO DE USUARIOS (ADMINISTRADOR Y CAPITANES DE PRUEBA)
-- ==========================================================================
-- Las contraseñas están cifradas con el algoritmo BCrypt compatible con Spring Security:
-- * 'superpassword123' -> $2a$10$fV27PspU35gQ7d65W.N3beZ8Q3b8K9vG/E32U7Qy3X7.LhQ.V5F/C
-- * 'capitanpassword'  -> $2a$10$tZ2R4G3fG0D4Qp4W5h6jEeH9j2m1Gg42Zg7cM4PjS1N6L2J/79P/i

INSERT INTO usuarios (id, nombre, email, password, role) VALUES
(1, 'Admin Central', 'admin@torneos.com', '$2a$10$fV27PspU35gQ7d65W.N3beZ8Q3b8K9vG/E32U7Qy3X7.LhQ.V5F/C', 'ADMIN'),
(2, 'Iker Casillas', 'casillas@madrid.com', '$2a$10$tZ2R4G3fG0D4Qp4W5h6jEeH9j2m1Gg42Zg7cM4PjS1N6L2J/79P/i', 'CAPITAN'),
(3, 'Lionel Messi', 'messi@barcelona.com', '$2a$10$tZ2R4G3fG0D4Qp4W5h6jEeH9j2m1Gg42Zg7cM4PjS1N6L2J/79P/i', 'CAPITAN'),
(4, 'Thomas Müller', 'muller@bayern.com', '$2a$10$tZ2R4G3fG0D4Qp4W5h6jEeH9j2m1Gg42Zg7cM4PjS1N6L2J/79P/i', 'CAPITAN'),
(5, 'Kylian Mbappé', 'mbappe@psg.com', '$2a$10$tZ2R4G3fG0D4Qp4W5h6jEeH9j2m1Gg42Zg7cM4PjS1N6L2J/79P/i', 'CAPITAN');

-- ==========================================================================
-- 2. CREACIÓN DE TORNEO
-- ==========================================================================
INSERT INTO torneos (id, nombre, tipo) VALUES
(1, 'Champions League Amateur', 'Fútbol 11');

-- ==========================================================================
-- 3. CREACIÓN DE EQUIPOS (ASOCIADOS A CAPITANES Y PRE-INSCRITOS EN EL TORNEO)
-- ==========================================================================
INSERT INTO equipos (id, nombre, ciudad, capitan_id, torneo_id) VALUES
(1, 'Real Madrid', 'Madrid', 2, 1),
(2, 'Barcelona', 'Barcelona', 3, 1),
(3, 'Bayern Munich', 'Munich', 4, 1),
(4, 'PSG', 'Paris', 5, 1);

-- ==========================================================================
-- 4. CREACIÓN DE JUGADORES (4 PROFESIONALES POR CADA CLUB)
-- ==========================================================================
INSERT INTO jugadores (id, nombre, edad, posicion, equipo_id) VALUES
-- Real Madrid (Equipo 1)
(1, 'Raul Gonzalez', 25, 'Delantero', 1),
(2, 'Cristiano Ronaldo', 33, 'Delantero', 1),
(3, 'Sergio Ramos', 31, 'Defensor', 1),
(4, 'Thibaut Courtois', 28, 'Arquero', 1),

-- Barcelona (Equipo 2)
(5, 'Lionel Messi', 30, 'Delantero', 2),
(6, 'Andres Iniesta', 33, 'Mediocampista', 2),
(7, 'Gerard Pique', 30, 'Defensor', 2),
(8, 'Marc-Andre Ter Stegen', 25, 'Arquero', 2),

-- Bayern Munich (Equipo 3)
(9, 'Robert Lewandowski', 29, 'Delantero', 3),
(10, 'Thomas Muller', 28, 'Delantero', 3),
(11, 'Joshua Kimmich', 25, 'Mediocampista', 3),
(12, 'Manuel Neuer', 32, 'Arquero', 3),

-- PSG (Equipo 4)
(13, 'Kylian Mbappe', 21, 'Delantero', 4),
(14, 'Neymar Jr', 28, 'Delantero', 4),
(15, 'Marquinhos', 26, 'Defensor', 4),
(16, 'Keylor Navas', 33, 'Arquero', 4);
