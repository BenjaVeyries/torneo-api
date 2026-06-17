# Frontend Torneo

Aplicacion React para consumir la API Spring Boot de gestion de torneos.

## Que incluye

- Pantalla inicial separada para elegir entre `Administrador` e `Invitado`.
- Login de administrador con JWT.
- Modo invitado en solo lectura.
- Panel completo para el admin.
- ABM de torneos, equipos y jugadores.
- Creacion de partidos.
- Inscripcion de equipos en torneos.
- Generacion de fixture.
- Carga de marcador.
- Registro de estadisticas por partido.
- Tabla de posiciones y goleadores.
- Creacion de perfiles solo desde el panel admin.

## Credenciales de prueba

Administrador:

```text
Email: admin@torneos.com
Password: superpassword123
```

Capitanes de prueba:

```text
casillas@madrid.com / capitanpassword
messi@barcelona.com / capitanpassword
muller@bayern.com / capitanpassword
mbappe@psg.com / capitanpassword
```

## Como correr el proyecto

### 1. Levantar el backend

Desde la carpeta raiz del proyecto:

```bash
./mvnw spring-boot:run
```

En Windows tambien podes usar:

```bash
mvnw.cmd spring-boot:run
```

La API usa una base local H2 por defecto, asi que no hace falta tener MySQL instalado para probar la demo.

### 2. Levantar el frontend

Desde la carpeta `frontend-torneo`:

```bash
npm.cmd install
npm.cmd run dev
```

La app suele quedar disponible en:

```text
http://127.0.0.1:5173
```

## Variables de entorno

El frontend apunta por defecto a:

```text
VITE_API_URL=http://localhost:8080
```

Si el backend corre en otra direccion, ajusta ese valor en `frontend-torneo/.env`.

## Reglas de acceso

- `Invitado`: solo lectura.
- `Administrador`: acceso completo a todo el panel.
- La creacion de perfiles solo esta disponible dentro del panel admin.
- Desde la interfaz no se puede crear un usuario `ADMIN`.

## Endpoints consumidos

- `POST /auth/login`
- `POST /auth/register`
- `GET /torneos`
- `POST /torneos`
- `PUT /torneos/{id}`
- `DELETE /torneos/{id}`
- `POST /torneos/{id}/equipos/{equipoId}`
- `POST /torneos/{id}/fixture`
- `GET /torneos/{id}/standings`
- `GET /torneos/{id}/goleadores`
- `GET /equipos`
- `POST /equipos`
- `PUT /equipos/{id}`
- `DELETE /equipos/{id}`
- `GET /jugadores`
- `POST /jugadores`
- `PUT /jugadores/{id}`
- `DELETE /jugadores/{id}`
- `GET /partidos`
- `POST /partidos`
- `PUT /partidos/{id}/marcador`
- `POST /partidos/{id}/jugadores`
- `GET /partidos/{partidoId}/estadisticas`
- `POST /partidos/{partidoId}/estadisticas`

## Notas

- El frontend esta construido con React + Vite + Tailwind.
- La logica de permisos depende del token JWT devuelto por la API.
- Si no inicia sesion el backend, primero verifica que el servidor Spring este corriendo en `8080`.
