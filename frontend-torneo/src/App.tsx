import React, { useEffect, useMemo, useState } from 'react';
import axios, { AxiosError } from 'axios';

type Role = 'USER' | 'CAPITAN' | 'ADMIN';
type Tab = 'torneos' | 'equipos' | 'jugadores' | 'partidos' | 'estadisticas' | 'usuarios';

type Torneo = { id: number; nombre: string; tipo: string; equipos?: Equipo[] };
type Equipo = { id: number; nombre: string; ciudad?: string; capitanId?: number; capitanNombre?: string };
type Jugador = { id: number; nombre: string; edad: number; posicion: string; equipoId: number; equipoNombre?: string };
type Partido = {
  id: number;
  torneoId: number;
  torneoNombre?: string;
  equipoLocalId: number;
  equipoLocalNombre?: string;
  equipoVisitanteId: number;
  equipoVisitanteNombre?: string;
  golesLocal?: number;
  golesVisitante?: number;
  jugado: boolean;
  ronda: number;
  jugadoresConvocados?: Jugador[];
};
type Estadistica = {
  id: number;
  partidoId: number;
  jugadorId: number;
  jugadorNombre?: string;
  equipoNombre?: string;
  goles: number;
  tarjetasAmarillas: number;
  tarjetasRojas: number;
};
type Standing = {
  posicion: number;
  equipoId: number;
  equipoNombre: string;
  puntos: number;
  partidosGanados: number;
  partidosEmpatados: number;
  partidosPerdidos: number;
  diferenciaGoles: number;
};
type Goleador = { jugadorId: number; jugadorNombre: string; equipoNombre: string; goles: number };
type AuthState = { token: string; mensaje: string; email: string; role: Role };
type Notice = { type: 'success' | 'error'; text: string } | null;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

const tabs: Array<{ id: Tab; label: string }> = [
  { id: 'torneos', label: 'Torneos' },
  { id: 'equipos', label: 'Equipos' },
  { id: 'jugadores', label: 'Jugadores' },
  { id: 'partidos', label: 'Partidos' },
  { id: 'estadisticas', label: 'Estadisticas' },
  { id: 'usuarios', label: 'Usuarios' },
];

const emptyTorneo = { nombre: '', tipo: 'Futbol' };
const emptyEquipo = { nombre: '', ciudad: '', capitanId: '' };
const emptyJugador = { nombre: '', edad: 18, posicion: '', equipoId: '' };
const emptyPartido = { torneoId: '', equipoLocalId: '', equipoVisitanteId: '', ronda: 1 };

const getErrorText = (error: unknown) => {
  const axiosError = error as AxiosError<any>;
  return axiosError.response?.data?.message || axiosError.response?.data?.error || axiosError.message || 'Ocurrio un error';
};

const asNumberOrNull = (value: unknown) => {
  if (value === '' || value === undefined || value === null) return null;
  return Number(value);
};

function App() {
  const [tab, setTab] = useState<Tab>('torneos');
  const [auth, setAuth] = useState<AuthState | null>(() => {
    const raw = localStorage.getItem('torneo-auth');
    return raw ? JSON.parse(raw) : null;
  });
  const [showAuthScreen, setShowAuthScreen] = useState(() => !localStorage.getItem('torneo-auth'));
  const [accessStep, setAccessStep] = useState<'choose' | 'admin-login'>('choose');
  const [notice, setNotice] = useState<Notice>(null);
  const [loading, setLoading] = useState(false);
  const [recentProfiles, setRecentProfiles] = useState<Array<{ nombre: string; email: string; role: Exclude<Role, 'ADMIN'> }>>([]);

  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadistica[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [goleadores, setGoleadores] = useState<Goleador[]>([]);

  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [profileForm, setProfileForm] = useState({ nombre: '', email: '', password: '', role: 'USER' as Exclude<Role, 'ADMIN'> });
  const [torneoForm, setTorneoForm] = useState<any>(emptyTorneo);
  const [equipoForm, setEquipoForm] = useState<any>(emptyEquipo);
  const [jugadorForm, setJugadorForm] = useState<any>(emptyJugador);
  const [partidoForm, setPartidoForm] = useState<any>(emptyPartido);
  const [scoreForm, setScoreForm] = useState({ partidoId: '', golesLocal: 0, golesVisitante: 0 });
  const [relacionForm, setRelacionForm] = useState({ torneoId: '', equipoId: '', partidoId: '', jugadorIds: [] as number[] });
  const [statForm, setStatForm] = useState({ partidoId: '', jugadorId: '', goles: 0, tarjetasAmarillas: 0, tarjetasRojas: 0 });
  const [editing, setEditing] = useState<{ type: 'torneo' | 'equipo' | 'jugador'; id: number } | null>(null);

  useEffect(() => {
    const interceptor = api.interceptors.request.use((config) => {
      const raw = localStorage.getItem('torneo-auth');
      const savedAuth: AuthState | null = raw ? JSON.parse(raw) : null;
      if (savedAuth?.token) config.headers.Authorization = `Bearer ${savedAuth.token}`;
      return config;
    });
    return () => api.interceptors.request.eject(interceptor);
  }, []);

  const selectedTorneo = useMemo(
    () => torneos.find((torneo) => torneo.id === Number(relacionForm.torneoId)) || torneos[0],
    [relacionForm.torneoId, torneos],
  );
  const selectedPartido = useMemo(
    () => partidos.find((partido) => partido.id === Number(relacionForm.partidoId || statForm.partidoId)) || partidos[0],
    [partidos, relacionForm.partidoId, statForm.partidoId],
  );
  const visibleTabs = auth?.role === 'ADMIN' ? tabs : tabs.filter((item) => item.id !== 'usuarios');
  const pendingMatches = partidos.filter((partido) => !partido.jugado).length;
  const playedMatches = partidos.length - pendingMatches;
  const isGuestMode = !auth && !showAuthScreen;

  const refresh = async () => {
    setLoading(true);
    try {
      const [torneosRes, equiposRes, jugadoresRes, partidosRes] = await Promise.all([
        api.get<Torneo[]>('/torneos'),
        api.get<Equipo[]>('/equipos'),
        api.get<Jugador[]>('/jugadores'),
        api.get<Partido[]>('/partidos'),
      ]);
      setTorneos(torneosRes.data);
      setEquipos(equiposRes.data);
      setJugadores(jugadoresRes.data);
      setPartidos(partidosRes.data);

      const torneoId = Number(relacionForm.torneoId) || torneosRes.data[0]?.id;
      if (torneoId) {
        const [standingsRes, goleadoresRes] = await Promise.all([
          api.get<Standing[]>(`/torneos/${torneoId}/standings`),
          api.get<Goleador[]>(`/torneos/${torneoId}/goleadores`),
        ]);
        setStandings(standingsRes.data);
        setGoleadores(goleadoresRes.data);
      }

      const partidoId = Number(statForm.partidoId || relacionForm.partidoId) || partidosRes.data[0]?.id;
      if (partidoId) {
        const statsRes = await api.get<Estadistica[]>(`/partidos/${partidoId}/estadisticas`);
        setEstadisticas(statsRes.data);
      } else {
        setEstadisticas([]);
      }
    } catch (error) {
      setNotice({ type: 'error', text: getErrorText(error) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const run = async (action: () => Promise<unknown>, ok: string) => {
    try {
      await action();
      setNotice({ type: 'success', text: ok });
      await refresh();
    } catch (error) {
      setNotice({ type: 'error', text: getErrorText(error) });
    }
  };

  const submitAuth = async () => {
    try {
      const response = await api.post('/auth/login', authForm);
      const nextAuth = { ...response.data, email: authForm.email, role: 'ADMIN' as Role };
      localStorage.setItem('torneo-auth', JSON.stringify(nextAuth));
      setAuth(nextAuth);
      setShowAuthScreen(false);
      setAccessStep('choose');
      setNotice({ type: 'success', text: response.data.mensaje || 'Sesion iniciada' });
    } catch (error) {
      setNotice({ type: 'error', text: getErrorText(error) });
    }
  };

  const createProfile = async () => {
    if (auth?.role !== 'ADMIN') {
      setNotice({ type: 'error', text: 'Solo un administrador puede crear perfiles.' });
      return;
    }

    try {
      await api.post('/auth/register', {
        nombre: profileForm.nombre,
        email: profileForm.email,
        password: profileForm.password,
        role: profileForm.role,
      });
      setRecentProfiles((prev) => [{ nombre: profileForm.nombre, email: profileForm.email, role: profileForm.role }, ...prev].slice(0, 5));
      setProfileForm({ nombre: '', email: '', password: '', role: 'USER' });
      setNotice({ type: 'success', text: 'Perfil creado correctamente' });
    } catch (error) {
      setNotice({ type: 'error', text: getErrorText(error) });
    }
  };

  const logout = () => {
    localStorage.removeItem('torneo-auth');
    setAuth(null);
    setAccessStep('choose');
    setShowAuthScreen(true);
  };

  const saveTorneo = () => {
    const payload = { nombre: torneoForm.nombre, tipo: torneoForm.tipo };
    if (editing?.type === 'torneo') run(() => api.put(`/torneos/${editing.id}`, payload), 'Torneo actualizado');
    else run(() => api.post('/torneos', payload), 'Torneo creado');
    setEditing(null);
    setTorneoForm(emptyTorneo);
  };

  const saveEquipo = () => {
    const payload = { nombre: equipoForm.nombre, ciudad: equipoForm.ciudad, capitanId: asNumberOrNull(equipoForm.capitanId) };
    if (editing?.type === 'equipo') run(() => api.put(`/equipos/${editing.id}`, payload), 'Equipo actualizado');
    else run(() => api.post('/equipos', payload), 'Equipo creado');
    setEditing(null);
    setEquipoForm(emptyEquipo);
  };

  const saveJugador = () => {
    const payload = {
      nombre: jugadorForm.nombre,
      edad: Number(jugadorForm.edad),
      posicion: jugadorForm.posicion,
      equipoId: Number(jugadorForm.equipoId),
    };
    if (editing?.type === 'jugador') run(() => api.put(`/jugadores/${editing.id}`, payload), 'Jugador actualizado');
    else run(() => api.post('/jugadores', payload), 'Jugador creado');
    setEditing(null);
    setJugadorForm(emptyJugador);
  };

  const savePartido = () => {
    run(
      () =>
        api.post('/partidos', {
          torneoId: Number(partidoForm.torneoId),
          equipoLocalId: Number(partidoForm.equipoLocalId),
          equipoVisitanteId: Number(partidoForm.equipoVisitanteId),
          ronda: Number(partidoForm.ronda),
        }),
      'Partido creado',
    );
    setPartidoForm(emptyPartido);
  };

  const editTorneo = (torneo: Torneo) => {
    setEditing({ type: 'torneo', id: torneo.id });
    setTorneoForm({ nombre: torneo.nombre, tipo: torneo.tipo });
    setTab('torneos');
  };
  const editEquipo = (equipo: Equipo) => {
    setEditing({ type: 'equipo', id: equipo.id });
    setEquipoForm({ nombre: equipo.nombre, ciudad: equipo.ciudad || '', capitanId: equipo.capitanId || '' });
    setTab('equipos');
  };
  const editJugador = (jugador: Jugador) => {
    setEditing({ type: 'jugador', id: jugador.id });
    setJugadorForm({ nombre: jugador.nombre, edad: jugador.edad, posicion: jugador.posicion, equipoId: jugador.equipoId });
    setTab('jugadores');
  };

  const formDisabled = !auth;

  if (!auth && showAuthScreen) {
    return (
      <AuthScreen
        authForm={authForm}
        setAuthForm={setAuthForm}
        onSubmit={submitAuth}
        onGuest={() => setShowAuthScreen(false)}
        accessStep={accessStep}
        setAccessStep={setAccessStep}
        notice={notice}
        onCloseNotice={() => setNotice(null)}
      />
    );
  }

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1500px] gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="glass sticky top-4 h-fit rounded-3xl p-5">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-cyan-300 text-xl font-black text-slate-950">T</div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white">Torneo API</h1>
              <p className="text-sm text-slate-400">Panel de gestion</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {visibleTabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                  tab === item.id ? 'bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-950/30' : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                {item.label}
                {item.id !== 'usuarios' && (
                  <span className="text-xs opacity-70">{countForTab(item.id, torneos, equipos, jugadores, partidos, estadisticas)}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Sesion</p>
            {auth ? (
              <>
                <p className="mt-2 truncate text-sm font-bold text-white">{auth.email}</p>
                <p className="text-xs text-cyan-200">{auth.role}</p>
                {auth.role === 'ADMIN' && (
                  <button className="btn btn-ghost mt-2 w-full" onClick={() => setTab('usuarios')}>
                    Crear perfiles
                  </button>
                )}
                <button className="btn btn-ghost mt-4 w-full" onClick={logout}>
                  Cerrar sesion
                </button>
              </>
            ) : (
              <>
                <p className="mt-2 text-xs text-cyan-200">{isGuestMode ? 'Invitado' : 'Sin acceso activo'}</p>
                <p className="mt-2 text-sm text-slate-400">{isGuestMode ? 'Estas navegando como invitado, con acceso de solo lectura.' : 'Modo lectura. Inicia sesion para modificar datos.'}</p>
                <button
                  className="btn btn-primary mt-4 w-full"
                  onClick={() => {
                    setAccessStep('choose');
                    setShowAuthScreen(true);
                  }}
                >
                  {isGuestMode ? 'Cambiar acceso' : 'Iniciar sesion'}
                </button>
              </>
            )}
          </div>
        </aside>

        <main className="space-y-5">
          <section className="glass overflow-hidden rounded-3xl">
            <div className="grid gap-6 p-6 lg:grid-cols-[1fr_420px] lg:p-8">
              <div className="max-w-3xl">
                <span className="pill border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                  {auth ? `Sesion activa - ${auth.role}` : isGuestMode ? 'Modo invitado' : 'Consulta publica'}
                </span>
                <h2 className="mt-5 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
                  Torneos, fixtures y estadisticas en una interfaz clara.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                  Gestiona torneos, inscribe equipos, registra jugadores, carga resultados y consulta posiciones con los endpoints reales del backend.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button className="btn btn-primary" onClick={refresh} disabled={loading}>
                    {loading ? 'Actualizando...' : 'Actualizar datos'}
                  </button>
                  <button className="btn btn-ghost" onClick={() => setTab('partidos')}>
                    Ver partidos
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Metric label="Torneos" value={torneos.length} />
                <Metric label="Equipos" value={equipos.length} />
                <Metric label="Jugadores" value={jugadores.length} />
                <Metric label="Jugados" value={playedMatches} />
              </div>
            </div>
          </section>

          {tab === 'torneos' && (
            <Section>
              <FormPanel title={editing?.type === 'torneo' ? 'Editar torneo' : 'Nuevo torneo'} disabled={formDisabled} onSave={saveTorneo}>
                <Field label="Nombre" value={torneoForm.nombre} onChange={(value) => setTorneoForm({ ...torneoForm, nombre: value })} />
                <Field label="Tipo" value={torneoForm.tipo} onChange={(value) => setTorneoForm({ ...torneoForm, tipo: value })} />
              </FormPanel>
              <Grid
                items={torneos}
                render={(torneo) => (
                  <article className="card" key={torneo.id}>
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">{torneo.tipo}</p>
                        <h3 className="mt-1 text-2xl font-black text-white">{torneo.nombre}</h3>
                      </div>
                      <span className="pill">{torneo.equipos?.length || 0} equipos</span>
                    </div>
                    <Actions disabled={formDisabled} onEdit={() => editTorneo(torneo)} onDelete={() => run(() => api.delete(`/torneos/${torneo.id}`), 'Torneo eliminado')} />
                  </article>
                )}
              />
            </Section>
          )}

          {tab === 'equipos' && (
            <Section>
              <FormPanel title={editing?.type === 'equipo' ? 'Editar equipo' : 'Nuevo equipo'} disabled={formDisabled} onSave={saveEquipo}>
                <Field label="Nombre" value={equipoForm.nombre} onChange={(value) => setEquipoForm({ ...equipoForm, nombre: value })} />
                <Field label="Ciudad" value={equipoForm.ciudad} onChange={(value) => setEquipoForm({ ...equipoForm, ciudad: value })} />
                <Field label="Capitan ID" type="number" value={equipoForm.capitanId} onChange={(value) => setEquipoForm({ ...equipoForm, capitanId: value })} />
              </FormPanel>
              <FormPanel title="Inscribir equipo en torneo" disabled={formDisabled} onSave={() => run(() => api.post(`/torneos/${relacionForm.torneoId}/equipos/${relacionForm.equipoId}`), 'Equipo inscripto')}>
                <SelectField label="Torneo" value={relacionForm.torneoId} onChange={(value) => setRelacionForm({ ...relacionForm, torneoId: value })} options={torneos} />
                <SelectField label="Equipo" value={relacionForm.equipoId} onChange={(value) => setRelacionForm({ ...relacionForm, equipoId: value })} options={equipos} />
              </FormPanel>
              <Grid
                items={equipos}
                render={(equipo) => (
                  <article className="card" key={equipo.id}>
                    <h3 className="text-2xl font-black text-white">{equipo.nombre}</h3>
                    <p className="mt-2 text-sm text-slate-400">{equipo.ciudad || 'Sin ciudad cargada'}</p>
                    <p className="mt-1 text-sm text-slate-400">Capitan: {equipo.capitanNombre || '-'}</p>
                    <Actions disabled={formDisabled} onEdit={() => editEquipo(equipo)} onDelete={() => run(() => api.delete(`/equipos/${equipo.id}`), 'Equipo eliminado')} />
                  </article>
                )}
              />
            </Section>
          )}

          {tab === 'jugadores' && (
            <Section>
              <FormPanel title={editing?.type === 'jugador' ? 'Editar jugador' : 'Nuevo jugador'} disabled={formDisabled} onSave={saveJugador}>
                <Field label="Nombre" value={jugadorForm.nombre} onChange={(value) => setJugadorForm({ ...jugadorForm, nombre: value })} />
                <Field label="Edad" type="number" value={jugadorForm.edad} onChange={(value) => setJugadorForm({ ...jugadorForm, edad: value })} />
                <Field label="Posicion" value={jugadorForm.posicion} onChange={(value) => setJugadorForm({ ...jugadorForm, posicion: value })} />
                <SelectField label="Equipo" value={jugadorForm.equipoId} onChange={(value) => setJugadorForm({ ...jugadorForm, equipoId: value })} options={equipos} />
              </FormPanel>
              <Grid
                items={jugadores}
                render={(jugador) => (
                  <article className="card" key={jugador.id}>
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-2xl font-black text-white">{jugador.nombre}</h3>
                        <p className="mt-1 text-sm text-slate-400">{jugador.equipoNombre || `Equipo ${jugador.equipoId}`}</p>
                      </div>
                      <span className="pill">{jugador.edad} anios</span>
                    </div>
                    <span className="pill border-teal-300/20 bg-teal-300/10 text-teal-100">{jugador.posicion}</span>
                    <Actions disabled={formDisabled} onEdit={() => editJugador(jugador)} onDelete={() => run(() => api.delete(`/jugadores/${jugador.id}`), 'Jugador eliminado')} />
                  </article>
                )}
              />
            </Section>
          )}

          {tab === 'partidos' && (
            <Section>
              <FormPanel title="Nuevo partido" disabled={formDisabled} onSave={savePartido}>
                <SelectField label="Torneo" value={partidoForm.torneoId} onChange={(value) => setPartidoForm({ ...partidoForm, torneoId: value })} options={torneos} />
                <SelectField label="Equipo local" value={partidoForm.equipoLocalId} onChange={(value) => setPartidoForm({ ...partidoForm, equipoLocalId: value })} options={equipos} />
                <SelectField label="Equipo visitante" value={partidoForm.equipoVisitanteId} onChange={(value) => setPartidoForm({ ...partidoForm, equipoVisitanteId: value })} options={equipos} />
                <Field label="Ronda" type="number" value={partidoForm.ronda} onChange={(value) => setPartidoForm({ ...partidoForm, ronda: value })} />
              </FormPanel>
              <div className="grid gap-4 xl:grid-cols-3">
                <FormPanel title="Generar fixture" disabled={formDisabled} onSave={() => run(() => api.post(`/torneos/${relacionForm.torneoId}/fixture`), 'Fixture generado')}>
                  <SelectField label="Torneo" value={relacionForm.torneoId} onChange={(value) => setRelacionForm({ ...relacionForm, torneoId: value })} options={torneos} />
                </FormPanel>
                <FormPanel title="Cargar marcador" disabled={formDisabled} onSave={() => run(() => api.put(`/partidos/${scoreForm.partidoId}/marcador`, { golesLocal: Number(scoreForm.golesLocal), golesVisitante: Number(scoreForm.golesVisitante) }), 'Marcador actualizado')}>
                  <SelectField label="Partido" value={scoreForm.partidoId} onChange={(value) => setScoreForm({ ...scoreForm, partidoId: value })} options={partidoOptions(partidos)} />
                  <Field label="Local" type="number" value={scoreForm.golesLocal} onChange={(value) => setScoreForm({ ...scoreForm, golesLocal: Number(value) })} />
                  <Field label="Visitante" type="number" value={scoreForm.golesVisitante} onChange={(value) => setScoreForm({ ...scoreForm, golesVisitante: Number(value) })} />
                </FormPanel>
                <FormPanel title="Convocar jugadores" disabled={formDisabled} onSave={() => run(() => api.post(`/partidos/${relacionForm.partidoId}/jugadores`, relacionForm.jugadorIds), 'Jugadores registrados')}>
                  <SelectField label="Partido" value={relacionForm.partidoId} onChange={(value) => setRelacionForm({ ...relacionForm, partidoId: value })} options={partidoOptions(partidos)} />
                  <MultiSelect label="Jugadores" values={relacionForm.jugadorIds} onChange={(values) => setRelacionForm({ ...relacionForm, jugadorIds: values })} options={jugadores} />
                </FormPanel>
              </div>
              <Grid
                items={partidos}
                render={(partido) => (
                  <article className="card" key={partido.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Ronda {partido.ronda}</p>
                        <h3 className="mt-1 text-xl font-black text-white">
                          {partido.equipoLocalNombre || partido.equipoLocalId} vs {partido.equipoVisitanteNombre || partido.equipoVisitanteId}
                        </h3>
                        <p className="mt-1 text-sm text-slate-400">{partido.torneoNombre || `Torneo ${partido.torneoId}`}</p>
                      </div>
                      <span className={`pill ${partido.jugado ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100' : ''}`}>
                        {partido.jugado ? `${partido.golesLocal} - ${partido.golesVisitante}` : 'Pendiente'}
                      </span>
                    </div>
                    <p className="mt-5 text-sm text-slate-400">Convocados: {partido.jugadoresConvocados?.length || 0}</p>
                  </article>
                )}
              />
            </Section>
          )}

          {tab === 'estadisticas' && (
            <Section>
              <FormPanel title="Registrar estadistica" disabled={formDisabled} onSave={() => run(() => api.post(`/partidos/${statForm.partidoId}/estadisticas`, { jugadorId: Number(statForm.jugadorId), goles: Number(statForm.goles), tarjetasAmarillas: Number(statForm.tarjetasAmarillas), tarjetasRojas: Number(statForm.tarjetasRojas) }), 'Estadistica registrada')}>
                <SelectField label="Partido" value={statForm.partidoId} onChange={(value) => setStatForm({ ...statForm, partidoId: value })} options={partidoOptions(partidos)} />
                <SelectField label="Jugador" value={statForm.jugadorId} onChange={(value) => setStatForm({ ...statForm, jugadorId: value })} options={jugadores} />
                <Field label="Goles" type="number" value={statForm.goles} onChange={(value) => setStatForm({ ...statForm, goles: Number(value) })} />
                <Field label="Amarillas" type="number" value={statForm.tarjetasAmarillas} onChange={(value) => setStatForm({ ...statForm, tarjetasAmarillas: Number(value) })} />
                <Field label="Rojas" type="number" value={statForm.tarjetasRojas} onChange={(value) => setStatForm({ ...statForm, tarjetasRojas: Number(value) })} />
              </FormPanel>

              <div className="grid gap-4 xl:grid-cols-2">
                <TablePanel title={`Tabla de posiciones${selectedTorneo ? ` - ${selectedTorneo.nombre}` : ''}`}>
                  {standings.map((row) => (
                    <div className="grid grid-cols-[32px_1fr_auto] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2" key={row.equipoId}>
                      <span className="font-black text-cyan-200">{row.posicion}</span>
                      <span className="font-bold text-white">{row.equipoNombre}</span>
                      <span className="text-sm text-slate-300">
                        {row.puntos} pts / DG {row.diferenciaGoles}
                      </span>
                    </div>
                  ))}
                </TablePanel>
                <TablePanel title="Goleadores">
                  {goleadores.map((row) => (
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2" key={row.jugadorId}>
                      <div>
                        <p className="font-bold text-white">{row.jugadorNombre}</p>
                        <p className="text-sm text-slate-400">{row.equipoNombre}</p>
                      </div>
                      <span className="pill border-cyan-300/20 bg-cyan-300/10 text-cyan-100">{row.goles}</span>
                    </div>
                  ))}
                </TablePanel>
              </div>

              <TablePanel title={`Estadisticas${selectedPartido ? ` del partido ${selectedPartido.id}` : ''}`}>
                <Grid
                  items={estadisticas}
                  render={(stat) => (
                    <article className="card" key={stat.id}>
                      <h3 className="text-lg font-black text-white">{stat.jugadorNombre || `Jugador ${stat.jugadorId}`}</h3>
                      <p className="text-sm text-slate-400">{stat.equipoNombre}</p>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <MiniStat label="Goles" value={stat.goles} />
                        <MiniStat label="Amarillas" value={stat.tarjetasAmarillas} />
                        <MiniStat label="Rojas" value={stat.tarjetasRojas} />
                      </div>
                    </article>
                  )}
                />
              </TablePanel>
            </Section>
          )}

          {tab === 'usuarios' && auth?.role === 'ADMIN' && (
            <Section>
              <FormPanel title="Crear perfil" disabled={false} onSave={createProfile}>
                <Field label="Nombre" value={profileForm.nombre} onChange={(value) => setProfileForm({ ...profileForm, nombre: value })} />
                <Field label="Email" type="email" value={profileForm.email} onChange={(value) => setProfileForm({ ...profileForm, email: value })} />
                <Field
                  label="Password"
                  type="password"
                  value={profileForm.password}
                  onChange={(value) => setProfileForm({ ...profileForm, password: value })}
                />
                <SelectField
                  label="Rol"
                  value={profileForm.role}
                  onChange={(value) => setProfileForm({ ...profileForm, role: value as Exclude<Role, 'ADMIN'> })}
                  options={[
                    { id: 'USER', nombre: 'USER' },
                    { id: 'CAPITAN', nombre: 'CAPITAN' },
                  ]}
                />
              </FormPanel>

              <TablePanel title="Perfiles creados recientemente">
                {recentProfiles.length ? (
                  recentProfiles.map((profile) => (
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2" key={`${profile.email}-${profile.role}`}>
                      <div>
                        <p className="font-bold text-white">{profile.nombre}</p>
                        <p className="text-sm text-slate-400">{profile.email}</p>
                      </div>
                      <span className="pill">{profile.role}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">Aun no se crearon perfiles en esta sesion.</p>
                )}
              </TablePanel>
            </Section>
          )}
        </main>
      </div>

      {notice && (
        <div className={`fixed bottom-5 right-5 z-50 max-w-md rounded-2xl border px-4 py-3 text-sm font-bold shadow-2xl ${notice.type === 'success' ? 'border-emerald-300/30 bg-emerald-950 text-emerald-100' : 'border-rose-300/30 bg-rose-950 text-rose-100'}`}>
          <div className="flex items-start gap-3">
            <span>{notice.type === 'success' ? 'OK' : 'Error'}</span>
            <p>{notice.text}</p>
            <button className="ml-2 text-white/60 hover:text-white" onClick={() => setNotice(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function countForTab(tab: Tab, torneos: Torneo[], equipos: Equipo[], jugadores: Jugador[], partidos: Partido[], estadisticas: Estadistica[]) {
  const map = { torneos: torneos.length, equipos: equipos.length, jugadores: jugadores.length, partidos: partidos.length, estadisticas: estadisticas.length };
  return map[tab];
}

function partidoOptions(partidos: Partido[]) {
  return partidos.map((partido) => ({
    id: partido.id,
    nombre: `R${partido.ronda}: ${partido.equipoLocalNombre || partido.equipoLocalId} vs ${partido.equipoVisitanteNombre || partido.equipoVisitanteId}`,
  }));
}

function Section({ children }: { children: React.ReactNode }) {
  return <section className="space-y-4">{children}</section>;
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-3 text-4xl font-black text-white">{value}</p>
    </div>
  );
}

function FormPanel({ title, disabled, onSave, children }: { title: string; disabled: boolean; onSave: () => void; children: React.ReactNode }) {
  return (
    <section className="panel p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-white">{title}</h3>
          <p className="text-sm text-slate-400">{disabled ? 'Inicia sesion para habilitar esta accion.' : 'Completa los campos requeridos.'}</p>
        </div>
        <button className="btn btn-primary" disabled={disabled} onClick={onSave}>
          Guardar
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string | number; onChange: (value: string) => void; type?: string }) {
  return (
    <label>
      <span className="label">{label}</span>
      <input className="field" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: Array<{ id: number | string; nombre?: string }>;
}) {
  return (
    <label>
      <span className="label">{label}</span>
      <select className="field" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Seleccionar</option>
        {options.map((item) => (
          <option key={item.id} value={item.id}>
            {item.nombre || item.id}
          </option>
        ))}
      </select>
    </label>
  );
}

function MultiSelect({
  label,
  values,
  onChange,
  options,
}: {
  label: string;
  values: number[];
  onChange: (value: number[]) => void;
  options: Jugador[];
}) {
  return (
    <label>
      <span className="label">{label}</span>
      <select
        className="field h-28 py-2"
        multiple
        value={values.map(String)}
        onChange={(event) => onChange(Array.from(event.target.selectedOptions).map((option) => Number(option.value)))}
      >
        {options.map((item) => (
          <option key={item.id} value={item.id}>
            {item.nombre} - {item.equipoNombre || item.equipoId}
          </option>
        ))}
      </select>
    </label>
  );
}

function Actions({ disabled, onEdit, onDelete }: { disabled: boolean; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="mt-6 flex gap-2">
      <button className="btn btn-ghost flex-1" disabled={disabled} onClick={onEdit}>
        Editar
      </button>
      <button className="btn btn-danger flex-1" disabled={disabled} onClick={onDelete}>
        Borrar
      </button>
    </div>
  );
}

function Grid<T>({ items, render }: { items: T[]; render: (item: T) => React.ReactNode }) {
  if (!items.length) {
    return <div className="panel p-8 text-center text-slate-400">No hay registros para mostrar.</div>;
  }
  return <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{items.map(render)}</div>;
}

function TablePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel p-5">
      <h3 className="mb-4 text-lg font-black text-white">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
      <p className="text-lg font-black text-white">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function AuthScreen({
  authForm,
  setAuthForm,
  onSubmit,
  onGuest,
  accessStep,
  setAccessStep,
  notice,
  onCloseNotice,
}: {
  authForm: { email: string; password: string };
  setAuthForm: React.Dispatch<React.SetStateAction<{ email: string; password: string }>>;
  onSubmit: () => void;
  onGuest: () => void;
  accessStep: 'choose' | 'admin-login';
  setAccessStep: (value: 'choose' | 'admin-login') => void;
  notice: Notice;
  onCloseNotice: () => void;
}) {
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100svh-3rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60 shadow-2xl shadow-black/40 backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative flex flex-col justify-between overflow-hidden p-8 sm:p-10 lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_34%)]" />
          <div className="relative z-10">
            <span className="pill border-cyan-300/20 bg-cyan-300/10 text-cyan-100">Sistema de torneos</span>
            <h1 className="mt-5 max-w-xl text-5xl font-black tracking-tight text-white sm:text-6xl">
              Elegi como queres entrar.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
              El administrador accede al panel completo. El invitado entra directo al modo lectura, sin formularios intermedios ni permisos de edicion.
            </p>
            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
              <MiniPanel title="Administrador" text="Login privado y panel completo." />
              <MiniPanel title="Invitado" text="Solo lectura y sin cambios." />
              <MiniPanel title="Perfiles" text="Solo el admin crea cuentas." />
            </div>
          </div>

          <div className="relative z-10 mt-10 flex flex-wrap gap-3">
            <button className="btn btn-ghost" onClick={onGuest}>
              Entrar como invitado
            </button>
            <button className="btn btn-primary" onClick={() => setAccessStep('admin-login')}>
              Iniciar como administrador
            </button>
          </div>
        </section>

        <section className="border-t border-white/10 bg-slate-950/80 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
          {accessStep === 'choose' ? (
            <div className="grid h-full place-items-center text-center">
              <div className="max-w-sm">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Acceso</p>
                <h2 className="mt-3 text-3xl font-black text-white">Administrador o invitado</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Elegi primero el tipo de acceso para que la pagina arranque ordenada desde el comienzo.
                </p>
                <div className="mt-8 grid gap-3">
                  <button className="btn btn-primary w-full" onClick={() => setAccessStep('admin-login')}>
                    Soy administrador
                  </button>
                  <button className="btn btn-ghost w-full" onClick={onGuest}>
                    Soy invitado
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <button className="mb-4 text-sm font-bold text-cyan-200 hover:text-cyan-100" onClick={() => setAccessStep('choose')}>
                  Volver
                </button>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Acceso admin</p>
                <h2 className="mt-2 text-3xl font-black text-white">Iniciar sesion</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Solo el administrador puede entrar aqui para usar todas las acciones y crear perfiles.
                </p>
              </div>

              <div className="space-y-4">
                <label>
                  <span className="label">Email</span>
                  <input className="field" type="email" value={authForm.email} onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))} />
                </label>
                <label>
                  <span className="label">Password</span>
                  <input
                    className="field"
                    type="password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))}
                  />
                </label>
                <button className="btn btn-primary w-full" onClick={onSubmit}>
                  Ingresar como admin
                </button>
                <button className="btn btn-ghost w-full" onClick={onGuest}>
                  Entrar como invitado
                </button>
              </div>

              {notice && (
                <div
                  className={`mt-6 rounded-2xl border px-4 py-3 text-sm font-bold ${
                    notice.type === 'success'
                      ? 'border-emerald-300/30 bg-emerald-950 text-emerald-100'
                      : 'border-rose-300/30 bg-rose-950 text-rose-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span>{notice.type === 'success' ? 'OK' : 'Error'}</span>
                    <p className="flex-1">{notice.text}</p>
                    <button className="text-white/60 hover:text-white" onClick={onCloseNotice}>
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function MiniPanel({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
      <p className="text-sm font-black text-white">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-400">{text}</p>
    </div>
  );
}

export default App;
