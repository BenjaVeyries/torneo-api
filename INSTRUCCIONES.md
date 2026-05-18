# 📘 Manual de Instalación, Configuración y Demostración

¡Bienvenido al sistema de **Gestión de Torneos de Fútbol**! Este proyecto es una solución integral que consta de una **API REST robusta en Spring Boot 3**, base de datos relacional **MySQL**, seguridad basada en **JWT** y un **Dashboard Web interactivo premium** servido directamente por el backend.

Sigue las siguientes instrucciones detalladas para instalar, configurar y probar la aplicación en cualquier computadora.

---

## 📋 1. Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:
1.  **Java Development Kit (JDK 17 o superior)**.
2.  **MySQL Server** (Recomendado a través de **XAMPP**, Laragon, o como servidor independiente).
3.  Un navegador web moderno (Chrome, Edge, Firefox, etc.).
4.  Opcional: Un IDE como **IntelliJ IDEA** o **Eclipse (STS)**.

---

## 🗄️ 2. Configuración de la Base de Datos

El sistema está diseñado para conectarse a una base de datos local de MySQL llamada `torneo_api`.

1.  Inicia el módulo de **MySQL** en tu panel de control de **XAMPP**.
2.  Ingresa a **phpMyAdmin** (`http://localhost/phpmyadmin/`) o a tu gestor de base de datos preferido.
3.  Crea una base de datos nueva llamada `torneo_api` ejecutando la siguiente consulta:
    ```sql
    CREATE DATABASE torneo_api;
    ```
4.  **Carga de datos iniciales (Dos alternativas):**
    *   **Alternativa A (Automática - ¡Recomendada!):** No hagas nada. Spring Boot incluye un cargador automático (`DatabaseSeeder.java`). La primera vez que arranques el servidor, detectará que la base de datos está vacía e insertará automáticamente el torneo, 4 equipos pre-inscritos, 16 jugadores de renombre mundial y las cuentas de usuario para la demo.
    *   **Alternativa B (Manual por SQL):** Si deseas realizar una carga limpia manual desde la base de datos, abre el archivo `insert_datos.sql` ubicado en la raíz del proyecto, copia todo su contenido, ve a la pestaña **SQL** de phpMyAdmin en la base de datos `torneo_api`, pega el código y presiona **Continuar (Go)**.

---

## 🚀 3. Ejecución del Proyecto

Tienes dos formas de iniciar el servidor web del backend:

### Opción A: Desde tu IDE (IntelliJ / Eclipse)
1.  Importa el proyecto Maven `torneo-api` en tu entorno.
2.  Navega hasta la clase principal: `src/main/java/com/torneo_api/TorneoApiApplication.java`.
3.  Haz clic derecho sobre ella y selecciona **Run 'TorneoApiApplication'** (o presiona la flecha verde de Play).

### Opción B: Desde la Consola (CMD / PowerShell)
1.  Abre una terminal en la carpeta raíz del proyecto.
2.  Ejecuta el asistente de Maven incluido en el proyecto:
    ```powershell
    .\mvnw.cmd spring-boot:run
    ```

> El servidor iniciará correctamente y estará escuchando peticiones en el puerto **`8080`**. Verás el mensaje:  
> `Tomcat started on port 8080 (http) with context path '/'` y `Started TorneoApiApplication in X.XXX seconds`.

---

## 💻 4. Acceso y Uso del Dashboard Web

Con el servidor encendido, abre tu navegador e ingresa a:
👉 **`http://localhost:8080/`**

La aplicación cargará una interfaz gráfica Single Page Application (SPA) responsiva con diseño oscuro premium, glassmorphism, micro-animaciones y soporte para roles de usuario.

---

## 🏆 5. Guía de Demostración Rápida (Paso a Paso)

Sigue este flujo secuencial para realizar una demostración impecable y libre de errores en solo 3 minutos:

### Paso 1: Autenticación rápida con 1 Clic
*   Haz clic en **🔑 Iniciar Sesión** en la barra superior del sitio web.
*   En la ventana emergente, presiona el botón brillante 🛡️ **Demo Admin**.
*   El sistema completará las credenciales del Administrador Central automáticamente, validará los accesos con el backend por JWT y verás cambiar tu sesión activa con el badge de rol **`ADMIN`** en verde neón.

### Paso 2: Consultar los Planteles y Equipos Creados
*   Ve a la pestaña **🛡️ Gestión de Planteles**.
*   Verás los **4 equipos de demostración** cargados automáticamente (*Real Madrid*, *Barcelona*, *Bayern Munich*, *PSG*).
*   Haz clic en cualquiera de ellos para desplegar su plantilla (cada uno cuenta con 4 jugadores de renombre iniciales y su respectiva posición).

### Paso 3: Selección de Torneo Activo
*   En la cabecera superior, haz clic en el selector global y elige el torneo pre-cargado: **"Champions League Amateur (Fútbol 11)"**.
*   Las pantallas se actualizarán automáticamente con la información ligada a este torneo.

### Paso 4: Generación de Fixture con el Algoritmo de Berger
*   Ve a la pestaña **⚙️ Panel de Control** (visible solo para usuarios administradores).
*   En la sección de la derecha verás los equipos listos. Haz clic en el botón verde grande: **⚙️ AUTOGENERAR FIXTURE DE IDA**.
*   El sistema ejecutará de forma transparente en Java el **Algoritmo de Berger**, programando todas las jornadas del campeonato alternando localías matemáticamente.

### Paso 5: Jugar Partidos y Recalcular Posiciones en Tiempo Real
*   Ve a la pestaña **📊 Resultados y Posiciones**.
*   El fixture de partidos ya estará disponible, ordenado en jornadas (Jornada 1, 2 y 3).
*   Busca el primer partido y haz clic en **Registrar Marcador**.
*   Ingresa un resultado (ej. *Local: 3 - Visitante: 1*) y presiona **Guardar Marcador**.
*   **Registrar Goleador**: Haz clic en **+ Agregar Goles/Tarjetas**, selecciona al jugador estrella del Real Madrid *Raul Gonzalez*, ponle **2** goles y haz clic en **Guardar Incidencia**.
*   **¡Mira la magia!** Al cerrar el modal, la **Tabla de Posiciones** habrá sumado los 3 puntos al Real Madrid, calculado su diferencia de goles y goles a favor. Además, la tabla de **Máximos Goleadores** coronará dinámicamente a *Raul Gonzalez* con una corona dorada.

---

## 🔑 6. Credenciales de Prueba (Demo Accounts)

Para agilizar la evaluación, puedes usar estas cuentas pre-cargadas en el sistema:

| Nombre de Usuario | Correo Electrónico | Contraseña | Rol asignado | Permisos clave |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Central** | `admin@torneos.com` | `superpassword123` | `ROLE_ADMIN` | Control total del torneo, fixture, marcadores, planteles y jugadores. |
| **Iker Casillas** | `casillas@madrid.com` | `capitanpassword` | `ROLE_CAPITAN` | Capitán del Real Madrid. Puede crear, modificar y eliminar jugadores *únicamente* del Real Madrid. |
| **Lionel Messi** | `messi@barcelona.com` | `capitanpassword` | `ROLE_CAPITAN` | Capitán del Barcelona. Puede crear, modificar y eliminar jugadores *únicamente* del Barcelona. |

---
*Manual elaborado para la presentación formal del proyecto. Desarrollado con tecnologías limpias y de alto rendimiento.*
