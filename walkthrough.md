# Guía de Uso y Demostración - API de Torneos de Fútbol

Esta guía explica detalladamente la arquitectura de la API que hemos construido, cómo satisface cada requerimiento del profesor y proporciona los comandos exactos y payloads JSON para que puedas realizar una demostración impecable de todo el flujo.

---

## 1. Estructura y Componentes Creados

Hemos organizado el proyecto siguiendo las mejores prácticas de la arquitectura en capas de Spring Boot:

*   **`com.torneo_api.entity`**: Modelos JPA de base de datos con relaciones completas.
    *   `Torneo.java`: Mantiene la lista de equipos (`OneToMany`) y partidos.
    *   `Equipo.java`: Mapeado a un torneo (`ManyToOne`) y capitan (`ManyToOne`), y contiene sus jugadores (`OneToMany`).
    *   `Jugador.java`: Contiene la relación con el equipo, partidos en que participó (`ManyToMany`) y estadísticas (`OneToMany`).
    *   `Partido.java`: Enlaza dos equipos, la ronda, los jugadores que jugaron y sus estadísticas.
    *   `Estadistica.java`: **Relación compleja**. Almacena goles y tarjetas de un jugador en un partido específico, manteniendo constancia de para qué club jugó en ese momento (`ManyToOne` a `Equipo`).
*   **`com.torneo_api.dto`**: Clases DTO para validación estricta de payloads REST (usando `@NotBlank`, `@NotNull`, `@Min`, `@Email`).
*   **`com.torneo_api.mapper`**: Clases con mapeadores estáticos limpios para evitar dependencias innecesarias de librerías de mapeo y garantizar rendimiento óptimo.
*   **`com.torneo_api.repository`**: Repositorios de Spring Data JPA con búsquedas personalizadas e implementaciones JPQL avanzadas.
*   **`com.torneo_api.security`**: Infraestructura JWT (generador/validador de tokens y filtro de intercepción) y configuración stateless.
*   **`com.torneo_api.exception`**: GlobalExceptionHandler para formatear respuestas JSON uniformes de error (400, 403, 404, 500) y de validación.

---

## 2. Flujo Completo de Demostración (Payloads y URLs)

Para probar la API, asegúrate de levantar tu servidor MySQL (XAMPP) y crear la base de datos `torneo_api`. El proyecto creará las tablas automáticamente mediante `hibernate.ddl-auto=update`.

A continuación, sigue este orden para realizar una simulación real:

### Paso 1: Registro de Usuarios (Registro de Admin y Capitanes)
La API cuenta con endpoints públicos para registrar e iniciar sesión. Crearemos un Administrador y un Capitán de equipo.

#### A. Registrar un Administrador
*   **POST** `/auth/register`
*   **Payload JSON**:
```json
{
  "nombre": "Admin Central",
  "email": "admin@torneos.com",
  "password": "superpassword123",
  "role": "ADMIN"
}
```
*   **Respuesta esperada** (200 OK):
```json
{
  "mensaje": "Usuario registrado correctamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
> [!IMPORTANT]
> Copia el valor del campo `token` devuelto. Deberás añadirlo como cabecera `Authorization: Bearer <TU_TOKEN>` en las peticiones que requieran rol de `ADMIN`.

#### B. Registrar un Capitán de Equipo
*   **POST** `/auth/register`
*   **Payload JSON**:
```json
{
  "nombre": "Iker Casillas",
  "email": "casillas@madrid.com",
  "password": "capitanpassword",
  "role": "CAPITAN"
}
```

---

### Paso 2: Crear Equipos y Jugadores (Administración o Capitanía)
Los capitanes pueden gestionar su propio equipo y agregar jugadores a su plantel.

#### A. Crear un Equipo (Admin o Capitán)
*   **POST** `/equipos`
*   **Cabecera**: `Authorization: Bearer <TOKEN_ADMIN_O_CAPITAN>`
*   **Payload JSON**:
```json
{
  "nombre": "Real Madrid",
  "ciudad": "Madrid",
  "capitanId": 2
}
```
*   **Respuesta esperada** (210 Created):
```json
{
  "id": 1,
  "nombre": "Real Madrid",
  "ciudad": "Madrid",
  "capitanNombre": "Iker Casillas"
}
```

#### B. Agregar Jugadores al Equipo (Admin o Capitán del Real Madrid)
*   **POST** `/jugadores`
*   **Cabecera**: `Authorization: Bearer <TOKEN_ADMIN_O_CAPITAN>`
*   **Payload JSON**:
```json
{
  "nombre": "Raul Gonzalez",
  "edad": 25,
  "posicion": "Delantero",
  "equipoId": 1
}
```
*   **Respuesta esperada**:
```json
{
  "id": 1,
  "nombre": "Raul Gonzalez",
  "edad": 25,
  "posicion": "Delantero",
  "equipoId": 1,
  "equipoNombre": "Real Madrid"
}
```

*(Crea otros 3 equipos y asóciales jugadores para completar el torneo de 4 equipos de prueba: Barcelona, Bayern Munich y PSG).*

---

### Paso 3: Crear Torneo y Agregar Equipos (Solo ADMIN)

#### A. Crear Torneo
*   **POST** `/torneos`
*   **Cabecera**: `Authorization: Bearer <TOKEN_ADMIN>`
*   **Payload JSON**:
```json
{
  "nombre": "Champions League Amateur",
  "tipo": "Fútbol"
}
```
*   **Respuesta**:
```json
{
  "id": 1,
  "nombre": "Champions League Amateur",
  "tipo": "Fútbol",
  "equipos": []
}
```

#### B. Agregar Equipos al Torneo (ID 1)
*   **POST** `/torneos/1/equipos/1` (Agrega el Real Madrid)
*   **POST** `/torneos/1/equipos/2` (Agrega el Barcelona)
*   **POST** `/torneos/1/equipos/3` (Agrega el Bayern Munich)
*   **POST** `/torneos/1/equipos/4` (Agrega el PSG)
*   **Cabecera**: `Authorization: Bearer <TOKEN_ADMIN>`

---

### Paso 4: Generación Automática de Fixture (Solo ADMIN)
Una vez que el torneo tiene los 4 equipos registrados, el Admin autogenera el calendario completo de ida usando el **Algoritmo de Berger**.

*   **POST** `/torneos/1/fixture`
*   **Cabecera**: `Authorization: Bearer <TOKEN_ADMIN>`
*   **Respuesta esperada** (Generará exactamente 6 partidos programados, distribuidos en 3 rondas balanceadas):
```json
[
  {
    "id": 1,
    "torneoId": 1,
    "torneoNombre": "Champions League Amateur",
    "equipoLocalId": 1,
    "equipoLocalNombre": "Real Madrid",
    "equipoVisitanteId": 2,
    "equipoVisitanteNombre": "Barcelona",
    "golesLocal": null,
    "golesVisitante": null,
    "jugado": false,
    "ronda": 1,
    "jugadoresConvocados": []
  },
  ...
]
```

---

### Paso 5: Registrar Marcadores y Estadísticas (ADMIN y Capitanes)

#### A. Registrar Marcador del Partido (Solo ADMIN)
Supongamos que finalizó el partido Real Madrid vs Barcelona (ID de partido 1):
*   **PUT** `/partidos/1/marcador`
*   **Cabecera**: `Authorization: Bearer <TOKEN_ADMIN>`
*   **Payload JSON**:
```json
{
  "golesLocal": 3,
  "golesVisitante": 1
}
```

#### B. Registrar Estadísticas del Jugador (Solo ADMIN)
Registramos que el delantero "Raul Gonzalez" (ID 1) del Real Madrid metió 2 goles en este partido:
*   **POST** `/partidos/1/estadisticas`
*   **Cabecera**: `Authorization: Bearer <TOKEN_ADMIN>`
*   **Payload JSON**:
```json
{
  "jugadorId": 1,
  "goles": 2,
  "tarjetasAmarillas": 1,
  "tarjetasRojas": 0
}
```
*   **Respuesta**:
```json
{
  "id": 1,
  "partidoId": 1,
  "jugadorId": 1,
  "jugadorNombre": "Raul Gonzalez",
  "equipoNombre": "Real Madrid",
  "goles": 2,
  "tarjetasAmarillas": 1,
  "tarjetasRojas": 0
}
```

---

### Paso 6: Consultar Resultados y Estadísticas (Público - Sin Token)

#### A. Tabla de Posiciones Automática
Cualquier usuario común puede consultar la tabla en tiempo real:
*   **GET** `/torneos/1/standings`
*   **Respuesta** (Real Madrid lidera con 3 puntos, dif +2, Barcelona colero con 0 puntos, dif -2):
```json
[
  {
    "posicion": 1,
    "equipoId": 1,
    "equipoNombre": "Real Madrid",
    "puntos": 3,
    "partidosJugados": 1,
    "partidosGanados": 1,
    "partidosEmpatados": 0,
    "partidosPerdidos": 0,
    "golesAFavor": 3,
    "golesEnContra": 1,
    "diferenciaGoles": 2
  },
  {
    "posicion": 2,
    "equipoId": 3,
    "equipoNombre": "Bayern Munich",
    "puntos": 0,
    "partidosJugados": 0,
    "partidosGanados": 0,
    "partidosEmpatados": 0,
    "partidosPerdidos": 0,
    "golesAFavor": 0,
    "golesEnContra": 0,
    "diferenciaGoles": 0
  },
  ...
]
```

#### B. Ranking de Goleadores del Torneo
Cualquier usuario puede consultar la tabla de goleadores:
*   **GET** `/torneos/1/goleadores`
*   **Respuesta**:
```json
[
  {
    "jugadorId": 1,
    "jugadorNombre": "Raul Gonzalez",
    "equipoNombre": "Real Madrid",
    "goles": 2
  }
]
```

---

### Demostración de las Validaciones de Seguridad y Negocio
Para impresionar al profesor, muéstrale los siguientes dos escenarios de error:

1.  **Fallo de Doble Equipo en un Torneo**:
    Si transfieres a "Raul Gonzalez" al Barcelona (`PUT /jugadores/1` cambiando `equipoId` a 2) e intentas registrar estadísticas para él con el Barcelona en otro partido del torneo:
    *   La API bloqueará el registro con un `400 Bad Request` y el siguiente mensaje:
    ```json
    {
      "error": "Petición incorrecta",
      "mensaje": "El jugador Raul Gonzalez ya ha disputado partidos en este torneo representando a otro equipo: Real Madrid. No puede jugar para dos equipos en el mismo torneo."
    }
    ```
2.  **Fallo de Autorización (403 Forbidden)**:
    Si inicias sesión como un usuario regular o no envías token e intentas crear un torneo (`POST /torneos`):
    *   La API responderá de inmediato:
    ```json
    {
      "error": "Acceso denegado",
      "mensaje": "No tienes permisos suficientes para realizar esta acción"
    }
    ```
3.  **Fallo de Validación DTO (400 Bad Request)**:
    Si creas un jugador con edad negativa o en blanco:
    *   La API responderá listando de forma exacta el error por cada campo:
    ```json
    {
      "error": "Validación fallida",
      "campos": {
        "edad": "La edad mínima admisible es 5 años",
        "nombre": "El nombre del jugador es obligatorio"
      }
    }
    ```

---

## 3. Conclusión
El sistema está 100% completo, sigue un diseño de código limpio en español, está completamente adaptado a la terminología del fútbol y listo para que lo presentes y apruebes la materia con la máxima calificación. ¡Mucho éxito en la entrega!
