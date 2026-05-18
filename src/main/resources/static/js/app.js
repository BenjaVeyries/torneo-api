/**
 * CONTROLADOR PRINCIPAL DEL FRONTEND - TORNEO API
 * Diseñado con Javascript Vanilla moderno (ES6) y animaciones interactivas.
 */

// ==========================================================================
// ESTADO GLOBAL DE LA APLICACIÓN
// ==========================================================================
const state = {
    token: localStorage.getItem('token') || null,
    currentUser: null,
    torneos: [],
    equipos: [],
    players: [],
    selectedTorneoId: localStorage.getItem('selectedTorneoId') || null,
    activeRound: 1,
    currentPartidoId: null // Para el modal de marcador y estadísticas
};

// Configuración de la API Base URL (Origen Relativo ya que corren en el mismo puerto)
const API_BASE = '';

// ==========================================================================
// DECODIFICACIÓN DE JWT
// ==========================================================================
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Error al decodificar el token JWT:', e);
        return null;
    }
}

// ==========================================================================
// HELPER PARA PETICIONES FETCH (INYECCIÓN DE JWT)
// ==========================================================================
async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    
    // Configurar cabeceras por defecto
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    // Inyectar el token Bearer si existe sesión activa
    if (state.token) {
        headers['Authorization'] = `Bearer ${state.token}`;
    }
    
    const config = {
        ...options,
        headers
    };
    
    const response = await fetch(url, config);
    
    if (response.status === 204) {
        return null;
    }
    
    const contentType = response.headers.get('content-type');
    if (!response.ok) {
        let errorMessage = 'Ha ocurrido un error inesperado';
        if (contentType && contentType.includes('application/json')) {
            const errData = await response.json();
            errorMessage = errData.mensaje || errData.error || errorMessage;
            
            // Validaciones DTO específicas
            if (errData.campos) {
                errorMessage = 'Errores de validación:\n' + 
                    Object.entries(errData.campos).map(([k, v]) => `- ${k}: ${v}`).join('\n');
            }
        } else {
            errorMessage = await response.text() || errorMessage;
        }
        throw new Error(errorMessage);
    }
    
    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    }
    return await response.text();
}

// ==========================================================================
// COMPONENTE: TOAST NOTIFICATIONS (NOTIFICACIONES DINÁMICAS)
// ==========================================================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'warning' ? 'toast-warning' : ''}`;
    
    let icon = '✔️';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';
    
    toast.innerHTML = `
        <span>${icon}</span>
        <div style="flex-grow: 1;">${message.replace(/\n/g, '<br>')}</div>
    `;
    
    container.appendChild(toast);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4500);
}

// ==========================================================================
// INICIALIZACIÓN Y CONTROL DE VISTAS (UI CONTROLLER)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
});

function initApp() {
    // 1. Restaurar sesión JWT
    if (state.token) {
        const decoded = parseJwt(state.token);
        if (decoded) {
            state.currentUser = decoded;
            updateAuthUI(true);
        } else {
            logout();
        }
    } else {
        updateAuthUI(false);
    }
    
    // 2. Cargar datos base
    loadTorneosList();
    loadEquiposList();
    loadPlayersList();
}

function updateAuthUI(isLoggedIn) {
    const loggedOutSection = document.getElementById('logged-out-section');
    const loggedInSection = document.getElementById('logged-in-section');
    
    const createEquipoGuest = document.getElementById('crear-equipo-guest-view');
    const createEquipoAuthed = document.getElementById('crear-equipo-authed-view');
    
    const createJugadorGuest = document.getElementById('crear-jugador-guest-view');
    const createJugadorAuthed = document.getElementById('crear-jugador-authed-view');
    
    const adminGuest = document.getElementById('admin-guest-view');
    const adminAuthed = document.getElementById('admin-authed-view');
    const navAdminTab = document.getElementById('nav-admin-tab');

    if (isLoggedIn && state.currentUser) {
        loggedOutSection.style.display = 'none';
        loggedInSection.style.display = 'flex';
        
        document.getElementById('user-display-name').textContent = state.currentUser.sub;
        
        const role = state.currentUser.role || 'ROLE_USER';
        const roleTag = document.getElementById('user-display-role');
        roleTag.textContent = role.replace('ROLE_', '');
        roleTag.className = `role-tag ${role === 'ROLE_ADMIN' ? 'role-admin' : 'role-capitan'}`;
        
        // Vistas de Equipos y Jugadores
        createEquipoGuest.style.display = 'none';
        createEquipoAuthed.style.display = 'block';
        createJugadorGuest.style.display = 'none';
        createJugadorAuthed.style.display = 'block';
        
        // Vista de Admin (solo para ADMIN)
        if (role === 'ROLE_ADMIN') {
            adminGuest.style.display = 'none';
            adminAuthed.style.display = 'block';
            navAdminTab.style.display = 'block';
        } else {
            adminGuest.style.display = 'block';
            adminAuthed.style.display = 'none';
        }
    } else {
        loggedOutSection.style.display = 'flex';
        loggedInSection.style.display = 'none';
        
        createEquipoGuest.style.display = 'block';
        createEquipoAuthed.style.display = 'none';
        createJugadorGuest.style.display = 'block';
        createJugadorAuthed.style.display = 'none';
        
        adminGuest.style.display = 'block';
        adminAuthed.style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem('token');
    state.token = null;
    state.currentUser = null;
    updateAuthUI(false);
    showToast('Sesión cerrada correctamente');
}

// ==========================================================================
// CONFIGURACIÓN DE EVENT LISTENERS (DOM EVENTS)
// ==========================================================================
function setupEventListeners() {
    // 1. Navegación por pestañas (Tabs)
    const tabButtons = document.querySelectorAll('.tab-btn[data-tab]');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Cambiar estados de botones de tab
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Cambiar estados de vistas de contenido
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
        });
    });

    // 2. Modales (Abrir / Cerrar)
    document.getElementById('btn-show-login').addEventListener('click', () => openModal('modal-login'));
    document.getElementById('btn-close-login').addEventListener('click', () => closeModal('modal-login'));
    document.getElementById('btn-admin-prompt-login').addEventListener('click', () => openModal('modal-login'));
    document.getElementById('btn-close-marcador').addEventListener('click', () => closeModal('modal-marcador'));
    
    // Cerrar modales haciendo click fuera del contenedor
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            closeModal(e.target.id);
        }
    });

    // 3. Toggle de Login y Registro en el Modal
    const toggleLogin = document.getElementById('toggle-tab-login');
    const toggleRegister = document.getElementById('toggle-tab-register');
    const formLogin = document.getElementById('form-login-payload');
    const formRegister = document.getElementById('form-register-payload');
    const modalTitle = document.getElementById('modal-login-title');

    toggleLogin.addEventListener('click', () => {
        toggleLogin.classList.add('active');
        toggleRegister.classList.remove('active');
        formLogin.style.display = 'block';
        formRegister.style.display = 'none';
        modalTitle.textContent = 'Acceder al Sistema';
    });

    toggleRegister.addEventListener('click', () => {
        toggleRegister.classList.add('active');
        toggleLogin.classList.remove('active');
        formLogin.style.display = 'none';
        formRegister.style.display = 'block';
        modalTitle.textContent = 'Crear Nueva Cuenta';
    });

    // 4. Formulario de Acceso (Login)
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const data = await apiFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            
            localStorage.setItem('token', data.token);
            state.token = data.token;
            state.currentUser = parseJwt(data.token);
            
            updateAuthUI(true);
            closeModal('modal-login');
            showToast('¡Bienvenido al sistema!', 'success');
            
            // Recargar listas dependientes de rol
            loadEquiposList();
            loadPlayersList();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    // 5. Formulario de Registro
    formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('reg-nombre').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const role = document.getElementById('reg-role').value;
        
        try {
            const data = await apiFetch('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ nombre, email, password, role })
            });
            
            localStorage.setItem('token', data.token);
            state.token = data.token;
            state.currentUser = parseJwt(data.token);
            
            updateAuthUI(true);
            closeModal('modal-login');
            showToast('¡Registro exitoso y sesión iniciada!', 'success');
            
            // Recargar
            loadEquiposList();
            loadPlayersList();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    // 6. Botones de Logout
    document.getElementById('btn-logout-action').addEventListener('click', logout);

    // 7. Botones Demo (Precarga)
    document.getElementById('btn-demo-admin').addEventListener('click', () => loginDemoUser('admin@torneos.com', 'superpassword123', 'Admin Central', 'ADMIN'));
    document.getElementById('btn-demo-capitan').addEventListener('click', () => loginDemoUser('casillas@madrid.com', 'capitanpassword', 'Iker Casillas', 'CAPITAN'));

    // 8. Selector de Torneo Global
    document.getElementById('global-torneo-select').addEventListener('change', (e) => {
        const id = e.target.value;
        state.selectedTorneoId = id ? parseInt(id) : null;
        if (state.selectedTorneoId) {
            localStorage.setItem('selectedTorneoId', state.selectedTorneoId);
            loadTorneoDetails();
        } else {
            localStorage.removeItem('selectedTorneoId');
            clearTorneoView();
        }
    });

    // 9. Formulario: Crear Torneo
    document.getElementById('form-crear-torneo').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('torneo-nombre').value;
        const tipo = document.getElementById('torneo-tipo').value;
        
        try {
            const data = await apiFetch('/torneos', {
                method: 'POST',
                body: JSON.stringify({ nombre, tipo })
            });
            
            showToast(`¡Torneo "${data.nombre}" creado con éxito!`);
            document.getElementById('form-crear-torneo').reset();
            
            // Recargar selectores
            await loadTorneosList();
            
            // Seleccionar automáticamente el torneo recién creado
            document.getElementById('global-torneo-select').value = data.id;
            state.selectedTorneoId = data.id;
            localStorage.setItem('selectedTorneoId', data.id);
            loadTorneoDetails();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    // 10. Formulario: Crear Equipo
    document.getElementById('form-crear-equipo').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('equipo-nombre').value;
        const ciudad = document.getElementById('equipo-ciudad').value;
        const capitanId = parseInt(document.getElementById('equipo-capitan').value);
        
        try {
            const data = await apiFetch('/equipos', {
                method: 'POST',
                body: JSON.stringify({ nombre, ciudad, capitanId })
            });
            
            showToast(`¡Equipo "${data.nombre}" registrado correctamente!`);
            document.getElementById('form-crear-equipo').reset();
            loadEquiposList();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    // 11. Formulario: Crear Jugador
    document.getElementById('form-crear-jugador').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('jugador-nombre').value;
        const edad = parseInt(document.getElementById('jugador-edad').value);
        const posicion = document.getElementById('jugador-posicion').value;
        const equipoId = parseInt(document.getElementById('jugador-equipo').value);
        
        try {
            await apiFetch('/jugadores', {
                method: 'POST',
                body: JSON.stringify({ nombre, edad, posicion, equipoId })
            });
            
            showToast(`¡Jugador "${nombre}" inscrito exitosamente!`);
            document.getElementById('form-crear-jugador').reset();
            
            // Recargar listas de planteles y jugadores
            loadPlayersList();
            loadEquiposList();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    // 12. Formulario: Inscribir Equipo en Torneo Activo
    document.getElementById('form-inscribir-equipo').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!state.selectedTorneoId) {
            showToast('Por favor selecciona un torneo primero en la cabecera', 'warning');
            return;
        }
        
        const equipoId = parseInt(document.getElementById('inscribir-equipo-select').value);
        
        try {
            await apiFetch(`/torneos/${state.selectedTorneoId}/equipos/${equipoId}`, {
                method: 'POST'
            });
            
            showToast('¡Equipo inscrito con éxito en el torneo!');
            document.getElementById('form-inscribir-equipo').reset();
            
            // Recargar detalles y standings
            loadTorneoDetails();
            loadEquiposList(); // Actualizar mapeo de equipos/torneos
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    // 13. Acción: Generar Fixture Automático
    document.getElementById('btn-generar-fixture').addEventListener('click', async () => {
        if (!state.selectedTorneoId) {
            showToast('Selecciona un torneo primero', 'warning');
            return;
        }
        
        if (!confirm('¿Estás seguro de que quieres generar el Fixture automático? Se eliminarán los partidos anteriores.')) {
            return;
        }
        
        try {
            await apiFetch(`/torneos/${state.selectedTorneoId}/fixture`, {
                method: 'POST'
            });
            
            showToast('⚽ ¡Calendario completo generado con éxito mediante el algoritmo de Berger!', 'success');
            
            // Recargar partidos y fixture
            loadTorneoDetails();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    // 14. Formulario: Guardar Marcador del Partido
    document.getElementById('form-cargar-marcador').addEventListener('submit', async (e) => {
        e.preventDefault();
        const golesLocal = parseInt(document.getElementById('marcador-goles-local').value);
        const golesVisitante = parseInt(document.getElementById('marcador-goles-visitante').value);
        
        try {
            await apiFetch(`/partidos/${state.currentPartidoId}/marcador`, {
                method: 'PUT',
                body: JSON.stringify({ golesLocal, golesVisitante })
            });
            
            showToast('🏆 Marcador registrado correctamente');
            
            // Recargar calendario y standings
            loadTorneoDetails();
            
            // No cerrar modal de inmediato, permitir registrar goles/incidencias de jugadores
            document.getElementById('marcador-goles-local').disabled = true;
            document.getElementById('marcador-goles-visitante').disabled = true;
            document.querySelector('#form-cargar-marcador button[type="submit"]').style.display = 'none';
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    // 15. Sub-Formulario de Estadísticas (Goles / Tarjetas de Jugadores)
    const btnShowAddStat = document.getElementById('btn-show-add-stat');
    const containerAddStatForm = document.getElementById('container-add-stat-form');
    
    btnShowAddStat.addEventListener('click', () => {
        containerAddStatForm.style.display = 'block';
        btnShowAddStat.style.display = 'none';
    });
    
    document.getElementById('btn-cancel-stat').addEventListener('click', () => {
        containerAddStatForm.style.display = 'none';
        btnShowAddStat.style.display = 'block';
    });

    document.getElementById('form-registrar-estadistica').addEventListener('submit', async (e) => {
        e.preventDefault();
        const jugadorId = parseInt(document.getElementById('stat-jugador-select').value);
        const goles = parseInt(document.getElementById('stat-goles').value);
        const tarjetasAmarillas = parseInt(document.getElementById('stat-amarillas').value);
        const tarjetasRojas = parseInt(document.getElementById('stat-rojas').value);
        
        try {
            await apiFetch(`/partidos/${state.currentPartidoId}/estadisticas`, {
                method: 'POST',
                body: JSON.stringify({ jugadorId, goles, tarjetasAmarillas, tarjetasRojas })
            });
            
            showToast('⚽ Incidencia registrada correctamente');
            document.getElementById('form-registrar-estadistica').reset();
            
            // Recargar lista de estadísticas del modal y ranking global de goleadores
            loadPartidoStatsInModal(state.currentPartidoId);
            loadGoleadores(state.selectedTorneoId);
        } catch (err) {
            showToast(err.message, 'error');
        }
    });
}

// ==========================================================================
// ENLACE DIRECTO DE USUARIOS DEMO (REGISTRA O LOGUEA EN UN CLICK)
// ==========================================================================
async function loginDemoUser(email, password, nombre, role) {
    try {
        // 1. Intentar Loguear primero
        const data = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        localStorage.setItem('token', data.token);
        state.token = data.token;
        state.currentUser = parseJwt(data.token);
        updateAuthUI(true);
        closeModal('modal-login');
        showToast(`Sesión iniciada como Demo ${role}!`);
        
        loadEquiposList();
        loadPlayersList();
        loadTorneoDetails();
    } catch (err) {
        // 2. Si falla porque no existe, lo registramos primero
        if (err.message.includes('Usuario no encontrado') || err.message.includes('email ya está registrado') === false) {
            try {
                const regData = await apiFetch('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({ nombre, email, password, role })
                });
                
                localStorage.setItem('token', regData.token);
                state.token = regData.token;
                state.currentUser = parseJwt(regData.token);
                updateAuthUI(true);
                closeModal('modal-login');
                showToast(`¡Usuario Demo ${role} creado y conectado automáticamente!`);
                
                loadEquiposList();
                loadPlayersList();
                loadTorneoDetails();
            } catch (regErr) {
                showToast(regErr.message, 'error');
            }
        } else {
            showToast(err.message, 'error');
        }
    }
}

// ==========================================================================
// OPERACIONES DE CARGA AJAX (API CLIENT)
// ==========================================================================

// 1. Cargar Lista de Torneos
async function loadTorneosList() {
    try {
        const torneos = await apiFetch('/torneos');
        state.torneos = torneos;
        
        const select = document.getElementById('global-torneo-select');
        select.innerHTML = '<option value="">-- Seleccionar Torneo --</option>';
        
        torneos.forEach(t => {
            select.innerHTML += `<option value="${t.id}">${t.nombre} (${t.tipo})</option>`;
        });
        
        // Restaurar torneo guardado
        if (state.selectedTorneoId && torneos.some(t => t.id === parseInt(state.selectedTorneoId))) {
            select.value = state.selectedTorneoId;
            loadTorneoDetails();
        } else {
            clearTorneoView();
        }
    } catch (err) {
        console.error('Error al listar torneos:', err);
    }
}

// 2. Cargar Lista de Equipos
async function loadEquiposList() {
    try {
        const equipos = await apiFetch('/equipos');
        state.equipos = equipos;
        
        // Rellenar selector de equipos a inscribir en el Admin
        const selectInscribir = document.getElementById('inscribir-equipo-select');
        selectInscribir.innerHTML = '<option value="">Seleccione equipo...</option>';
        
        // Rellenar selector de equipos en Carga de Jugadores
        const selectJugadores = document.getElementById('jugador-equipo');
        selectJugadores.innerHTML = '<option value="">Seleccione un Equipo...</option>';
        
        equipos.forEach(eq => {
            selectInscribir.innerHTML += `<option value="${eq.id}">${eq.nombre} - ${eq.ciudad}</option>`;
            selectJugadores.innerHTML += `<option value="${eq.id}">${eq.nombre} (${eq.ciudad})</option>`;
        });
        
        // Renderizar lista en Pestaña 2
        renderEquiposGrid();
    } catch (err) {
        console.error('Error al cargar equipos:', err);
    }
}

// 3. Cargar Lista de Jugadores
async function loadPlayersList() {
    try {
        const players = await apiFetch('/jugadores');
        state.players = players;
        
        // Cargar Capitanes disponibles para el formulario de Crear Equipo
        // Como no hay endpoint de usuarios, usamos los Capitanes de prueba + IDs genéricas
        const selectCapitan = document.getElementById('equipo-capitan');
        selectCapitan.innerHTML = `
            <option value="">Seleccione un Capitán...</option>
            <option value="1">Admin Central (ID 1)</option>
            <option value="2">Iker Casillas (ID 2)</option>
            <option value="3">Lionel Messi (ID 3)</option>
            <option value="4">Cristiano Ronaldo (ID 4)</option>
        `;
        
        // Renderizar si estamos listando
        renderEquiposGrid();
    } catch (err) {
        console.error('Error al listar jugadores:', err);
    }
}

// 4. Cargar Detalles del Torneo Activo
async function loadTorneoDetails() {
    if (!state.selectedTorneoId) return;
    
    // Actualizar nombre de torneo en el Admin
    const torneoObj = state.torneos.find(t => t.id === parseInt(state.selectedTorneoId));
    if (torneoObj) {
        document.getElementById('inscribir-torneo-display').value = torneoObj.nombre;
    }
    
    try {
        // Cargar Standings
        loadStandings(state.selectedTorneoId);
        
        // Cargar Goleadores
        loadGoleadores(state.selectedTorneoId);
        
        // Cargar Partidos y configurar el Fixture
        loadFixture(state.selectedTorneoId);
        
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// Limpiar vistas si no hay torneo seleccionado
function clearTorneoView() {
    document.getElementById('inscribir-torneo-display').value = 'Ninguno seleccionado';
    document.getElementById('admin-equipos-count').textContent = '0';
    
    document.getElementById('standings-tbody').innerHTML = `
        <tr>
            <td colspan="6" class="empty-state">Selecciona un torneo para cargar posiciones</td>
        </tr>
    `;
    
    document.getElementById('goleadores-tbody').innerHTML = `
        <tr>
            <td colspan="4" class="empty-state">Selecciona un torneo para cargar goleadores</td>
        </tr>
    `;
    
    document.getElementById('rondas-container').innerHTML = `
        <div class="empty-state" style="padding: 1rem;">No hay rondas disponibles</div>
    `;
    
    document.getElementById('partidos-container').innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">⚽</div>
            <p>Selecciona un torneo para ver sus partidos</p>
        </div>
    `;
}

// ==========================================================================
// RENDERERS (DIBUJO DE ELEMENTOS EN EL DOM)
// ==========================================================================

// 1. Dibujar Acordeón de Equipos y sus Jugadores
function renderEquiposGrid() {
    const container = document.getElementById('equipos-lista-container');
    if (!container) return;
    
    if (state.equipos.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay equipos creados todavía</div>';
        return;
    }
    
    container.innerHTML = '';
    
    state.equipos.forEach(eq => {
        // Buscar jugadores asignados a este equipo
        const eqPlayers = state.players.filter(p => p.equipoId === eq.id);
        
        const card = document.createElement('div');
        card.className = 'glass-card team-card';
        
        let playersHTML = '';
        if (eqPlayers.length === 0) {
            playersHTML = '<div class="empty-state" style="padding: 0.5rem; font-size: 0.8rem;">Sin jugadores inscritos</div>';
        } else {
            eqPlayers.forEach(p => {
                playersHTML += `
                    <div class="player-row">
                        <span>🏃 ${p.nombre}</span>
                        <span class="player-pos-badge">${p.posicion}</span>
                    </div>
                `;
            });
        }
        
        card.innerHTML = `
            <div class="team-card-header">
                <div>
                    <h3 style="font-family: var(--font-heading); font-size: 1.1rem; color: #fff;">${eq.nombre}</h3>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">📍 ${eq.ciudad} | Capitán: ${eq.capitanNombre}</span>
                </div>
                <div class="team-card-actions">
                    <button class="btn-small" onclick="quickSelectTeamForPlayer(${eq.id})">+ Jugador</button>
                </div>
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.03); padding-top: 0.75rem;">
                <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 0.5rem;">Plantel (${eqPlayers.length})</span>
                <div style="max-height: 200px; overflow-y: auto;">
                    ${playersHTML}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function quickSelectTeamForPlayer(teamId) {
    // Scroll al formulario y seleccionar el equipo
    document.getElementById('jugador-equipo').value = teamId;
    document.getElementById('jugador-nombre').focus();
    showToast('Equipo seleccionado en el formulario');
}

// 2. Cargar y Dibujar Standings (Posiciones)
async function loadStandings(torneoId) {
    const tbody = document.getElementById('standings-tbody');
    try {
        const standings = await apiFetch(`/torneos/${torneoId}/standings`);
        
        if (standings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No hay estadísticas procesadas. Genera el fixture y juega partidos.</td></tr>';
            return;
        }
        
        tbody.innerHTML = '';
        standings.forEach((st, idx) => {
            const tr = document.createElement('tr');
            tr.className = `pos-${st.posicion}`;
            if (st.posicion <= 3) tr.style.background = 'rgba(255,255,255,0.01)';
            
            tr.innerHTML = `
                <td><span class="pos-badge">${st.posicion}</span></td>
                <td>
                    <div class="team-cell-name">${st.equipoNombre}</div>
                </td>
                <td class="text-center pts-column">${st.puntos}</td>
                <td class="text-center">${st.partidosJugados}</td>
                <td class="text-center" style="font-weight: 700; color: ${st.diferenciaGoles > 0 ? 'var(--primary)' : st.diferenciaGoles < 0 ? 'var(--danger)' : 'var(--text-muted)'}">
                    ${st.diferenciaGoles > 0 ? '+' : ''}${st.diferenciaGoles}
                </td>
                <td class="text-center" style="color: var(--text-muted);">${st.golesAFavor}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state" style="color: var(--danger);">Error al cargar standings: ${err.message}</td></tr>`;
    }
}

// 3. Cargar y Dibujar Goleadores
async function loadGoleadores(torneoId) {
    const tbody = document.getElementById('goleadores-tbody');
    try {
        const goleadores = await apiFetch(`/torneos/${torneoId}/goleadores`);
        
        if (goleadores.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Sin goles anotados aún</td></tr>';
            return;
        }
        
        tbody.innerHTML = '';
        goleadores.forEach((g, idx) => {
            const tr = document.createElement('tr');
            tr.className = `pos-${idx + 1}`;
            
            let posMarkup = `<span class="pos-badge">${idx + 1}</span>`;
            if (idx === 0) posMarkup = '👑';
            
            tr.innerHTML = `
                <td>${posMarkup}</td>
                <td style="font-weight: 700;">🏃 ${g.jugadorNombre}</td>
                <td style="color: var(--text-muted); font-size: 0.8rem;">${g.equipoNombre}</td>
                <td class="text-center goles-tag" style="font-size: 1.05rem;">⚽ ${g.goles}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty-state" style="color: var(--danger);">Error al cargar goleadores</td></tr>`;
    }
}

// 4. Cargar y Dibujar Fixture (Calendario)
async function loadFixture(torneoId) {
    try {
        // Nota: para obtener los partidos de este torneo, listamos todos y filtramos
        const todosPartidos = await apiFetch('/partidos');
        const partidos = todosPartidos.filter(p => p.torneoId === parseInt(torneoId));
        
        // Actualizar contador de equipos inscritos en el Admin
        // Buscamos equipos únicos del fixture
        const equipIdsInscritos = new Set();
        partidos.forEach(p => {
            equipIdsInscritos.add(p.equipoLocalId);
            equipIdsInscritos.add(p.equipoVisitanteId);
        });
        
        // Si no hay fixture, estimamos por equipos inscritos asociados al torneo
        const torneoInfo = await apiFetch(`/torneos/${torneoId}`);
        const countInscritos = torneoInfo.equipos ? torneoInfo.equipos.length : 0;
        document.getElementById('admin-equipos-count').textContent = countInscritos;
        
        if (partidos.length === 0) {
            document.getElementById('rondas-container').innerHTML = '';
            document.getElementById('partidos-container').innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📅</div>
                    <h3 style="color: var(--text-muted); margin-bottom: 0.5rem;">Sin fixture generado</h3>
                    <p style="font-size: 0.85rem; margin-bottom: 1.5rem;">Aún no se han programado encuentros para este torneo.</p>
                    ${state.currentUser && state.currentUser.role === 'ROLE_ADMIN' 
                        ? '<p style="color: var(--primary);">⚠️ Ve a la pestaña "Panel de Control" para autogenerar el calendario.</p>' 
                        : '<p>Contacta al Administrador para generar el Fixture de partidos.</p>'}
                </div>
            `;
            return;
        }
        
        // Identificar todas las rondas/jornadas
        const rondas = [...new Set(partidos.map(p => p.ronda))].sort((a, b) => a - b);
        
        // Renderizar Rondas pills
        const rondasContainer = document.getElementById('rondas-container');
        rondasContainer.innerHTML = '';
        
        // Asegurar que la ronda activa siga existiendo
        if (!rondas.includes(state.activeRound)) {
            state.activeRound = rondas[0];
        }
        
        rondas.forEach(r => {
            const pill = document.createElement('div');
            pill.className = `ronda-pill ${state.activeRound === r ? 'active' : ''}`;
            pill.textContent = `Jornada ${r}`;
            pill.addEventListener('click', () => {
                state.activeRound = r;
                // Activar pill
                document.querySelectorAll('.ronda-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                // Renderizar partidos de la ronda
                renderPartidosDeRonda(partidos);
            });
            rondasContainer.appendChild(pill);
        });
        
        // Renderizar partidos de la ronda activa
        renderPartidosDeRonda(partidos);
        
    } catch (err) {
        console.error(err);
        document.getElementById('partidos-container').innerHTML = `<div class="empty-state" style="color: var(--danger);">Error al procesar el fixture</div>`;
    }
}

function renderPartidosDeRonda(todosPartidos) {
    const container = document.getElementById('partidos-container');
    container.innerHTML = '';
    
    const partidosDeRonda = todosPartidos.filter(p => p.ronda === state.activeRound);
    
    if (partidosDeRonda.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay partidos en esta jornada</div>';
        return;
    }
    
    partidosDeRonda.forEach(partido => {
        const card = document.createElement('div');
        card.className = 'partido-card';
        
        const localScore = partido.golesLocal !== null ? partido.golesLocal : '-';
        const visitanteScore = partido.golesVisitante !== null ? partido.golesVisitante : '-';
        
        // Determinar incidencias (goles, tarjetas) del partido
        let statsMarkup = '';
        if (partido.jugado) {
            // Buscaremos estadísticas asociadas llamándolas por API al renderizar o usando un cargador dinámico
            statsMarkup = `
                <div class="partido-stats-summary" id="stats-summary-${partido.id}">
                    <div style="font-size: 0.65rem; color: var(--text-muted); text-align: center;">Cargando incidencias...</div>
                </div>
            `;
            // Cargar de fondo las estadísticas para este partido
            loadPartidoStatsSummary(partido.id);
        } else {
            statsMarkup = `
                <div class="partido-stats-summary" style="background: rgba(245, 158, 11, 0.04); border: 1px dashed rgba(245, 158, 11, 0.15); text-align: center; color: var(--warning);">
                    📅 Partido Programado - Pendiente de Juego
                </div>
            `;
        }
        
        // Botón de Marcador exclusivo para ADMIN
        let actionBtnHTML = '';
        if (state.currentUser && state.currentUser.role === 'ROLE_ADMIN') {
            actionBtnHTML = `
                <div class="partido-card-footer">
                    <button class="btn-small btn-small-primary" onclick="openMarcadorModal(${partido.id}, '${partido.equipoLocalNombre}', '${partido.equipoVisitanteNombre}', ${partido.golesLocal}, ${partido.golesVisitante}, ${partido.jugado})">
                        ${partido.jugado ? '⚙️ Modificar Marcador/Goles' : '✏️ Registrar Marcador'}
                    </button>
                </div>
            `;
        }
        
        card.innerHTML = `
            <div class="partido-header">
                <span>ENCUENTRO ID: #${partido.id}</span>
                <span class="partido-estado ${partido.jugado ? 'estado-jugado' : 'estado-pendiente'}">
                    ${partido.jugado ? 'Finalizado' : 'Pendiente'}
                </span>
            </div>
            
            <div class="partido-score-view">
                <div class="score-team local">
                    <span>${partido.equipoLocalNombre}</span>
                    <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: normal;">Local</span>
                </div>
                
                <div class="score-numbers">
                    <span class="score-val">${localScore}</span>
                    <span class="score-divider">:</span>
                    <span class="score-val">${visitanteScore}</span>
                </div>
                
                <div class="score-team visitante">
                    <span>${partido.equipoVisitanteNombre}</span>
                    <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: normal;">Visitante</span>
                </div>
            </div>
            
            ${statsMarkup}
            ${actionBtnHTML}
        `;
        
        container.appendChild(card);
    });
}

// Cargar estadísticas breves para colocar en las tarjetas del Fixture
async function loadPartidoStatsSummary(partidoId) {
    const summaryContainer = document.getElementById(`stats-summary-${partidoId}`);
    if (!summaryContainer) return;
    
    try {
        const stats = await apiFetch(`/partidos/${partidoId}/estadisticas`);
        if (stats.length === 0) {
            summaryContainer.innerHTML = '<div style="font-size: 0.7rem; color: var(--text-muted); text-align: center;">Sin incidencias individuales registradas</div>';
            return;
        }
        
        // Filtrar goles y tarjetas
        let htmlList = '';
        stats.forEach(st => {
            let details = [];
            if (st.goles > 0) details.push(`⚽ ${st.goles} ${st.goles > 1 ? 'goles' : 'gol'}`);
            if (st.tarjetasAmarillas > 0) details.push(`<span class="badge-yellow-card"></span> ${st.tarjetasAmarillas}`);
            if (st.tarjetasRojas > 0) details.push(`<span class="badge-red-card"></span> Expulsado`);
            
            if (details.length > 0) {
                htmlList += `
                    <div class="partido-stat-item">
                        <span style="font-weight: 700;">${st.jugadorNombre} (${st.equipoNombre})</span>
                        <span>${details.join(' | ')}</span>
                    </div>
                `;
            }
        });
        
        summaryContainer.innerHTML = `
            <div class="partido-stats-title">Estadísticas e Incidencias</div>
            <div class="partido-stats-list">${htmlList || 'Sin incidencias'}</div>
        `;
    } catch (err) {
        summaryContainer.innerHTML = '<div style="color: var(--danger); font-size: 0.7rem;">Error al cargar incidencias</div>';
    }
}

// Cargar estadísticas detalladas en el modal interactivo de carga de resultados
async function loadPartidoStatsInModal(partidoId) {
    const listContainer = document.getElementById('modal-partido-stats-list');
    listContainer.innerHTML = '<div style="text-align: center; color: var(--text-muted);">Cargando...</div>';
    
    try {
        const stats = await apiFetch(`/partidos/${partidoId}/estadisticas`);
        if (stats.length === 0) {
            listContainer.innerHTML = '<div style="color: var(--text-muted); font-size: 0.75rem; text-align: center; padding: 0.5rem 0;">Ninguna estadística registrada todavía. ¡Carga goles o tarjetas!</div>';
            return;
        }
        
        listContainer.innerHTML = '';
        stats.forEach(st => {
            const item = document.createElement('div');
            item.className = 'partido-stat-item';
            item.style.padding = '0.4rem 0';
            item.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
            
            let badges = [];
            if (st.goles > 0) badges.push(`<span style="color: var(--accent-gold); font-weight: 800;">⚽ ${st.goles} G</span>`);
            if (st.tarjetasAmarillas > 0) badges.push(`<span style="color: var(--warning);">🟨 ${st.tarjetasAmarillas} A</span>`);
            if (st.tarjetasRojas > 0) badges.push(`<span style="color: var(--danger); font-weight: bold;">🟥 EXP</span>`);
            
            item.innerHTML = `
                <div>
                    <span style="font-weight: 700; color: #fff;">${st.jugadorNombre}</span>
                    <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">${st.equipoNombre}</span>
                </div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    ${badges.join(' ')}
                </div>
            `;
            listContainer.appendChild(item);
        });
    } catch (err) {
        listContainer.innerHTML = '<div style="color: var(--danger); font-size: 0.75rem;">Error al recuperar incidencias</div>';
    }
}

// ==========================================================================
// CONTROLADORES DE MODALES ESPECIALES
// ==========================================================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Apertura y preparación dinámica del modal de marcador y estadísticas
async function openMarcadorModal(partidoId, localName, visitanteName, currentLocal, currentVisitante, jugado) {
    state.currentPartidoId = partidoId;
    
    // Configurar campos iniciales
    document.getElementById('marcador-partido-id').value = partidoId;
    document.getElementById('label-local-name').textContent = localName;
    document.getElementById('label-visitante-name').textContent = visitanteName;
    
    const inputLocal = document.getElementById('marcador-goles-local');
    const inputVisitante = document.getElementById('marcador-goles-visitante');
    const submitBtn = document.querySelector('#form-cargar-marcador button[type="submit"]');
    
    inputLocal.value = jugado ? currentLocal : '';
    inputVisitante.value = jugado ? currentVisitante : '';
    
    // Si ya está jugado, permitir modificar pero re-habilitar campos
    inputLocal.disabled = false;
    inputVisitante.disabled = false;
    submitBtn.style.display = 'block';
    
    // Ocultar formulario de agregar estadísticas por defecto
    document.getElementById('container-add-stat-form').style.display = 'none';
    document.getElementById('btn-show-add-stat').style.display = 'block';
    
    // Cargar estadísticas actuales en el modal
    loadPartidoStatsInModal(partidoId);
    
    // Recuperar jugadores de ambos equipos para cargarlos en el dropdown de estadísticas
    const selectJugador = document.getElementById('stat-jugador-select');
    selectJugador.innerHTML = '<option value="">Cargando plantilla...</option>';
    
    try {
        // Encontrar los equipos buscando en state
        const equipoLocal = state.equipos.find(e => e.nombre === localName);
        const equipoVisitante = state.equipos.find(e => e.nombre === visitanteName);
        
        if (equipoLocal && equipoVisitante) {
            // Filtrar en state.players
            const locales = state.players.filter(p => p.equipoId === equipoLocal.id);
            const visitantes = state.players.filter(p => p.equipoId === equipoVisitante.id);
            
            selectJugador.innerHTML = '<option value="">Seleccione jugador...</option>';
            
            const localOptGroup = document.createElement('optgroup');
            localOptGroup.label = localName;
            locales.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = p.nombre;
                localOptGroup.appendChild(opt);
            });
            
            const visitOptGroup = document.createElement('optgroup');
            visitOptGroup.label = visitanteName;
            visitantes.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = p.nombre;
                visitOptGroup.appendChild(opt);
            });
            
            selectJugador.appendChild(localOptGroup);
            selectJugador.appendChild(visitOptGroup);
        } else {
            selectJugador.innerHTML = '<option value="">Error al indexar equipos</option>';
        }
    } catch (err) {
        selectJugador.innerHTML = '<option value="">No se pudo cargar plantel</option>';
    }
    
    openModal('modal-marcador');
}
