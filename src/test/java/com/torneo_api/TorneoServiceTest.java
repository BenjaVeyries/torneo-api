package com.torneo_api;

import com.torneo_api.dto.EstadisticaRequestDTO;
import com.torneo_api.dto.StandingResponseDTO;
import com.torneo_api.dto.TorneoRequestDTO;
import com.torneo_api.dto.TorneoResponseDTO;
import com.torneo_api.entity.Equipo;
import com.torneo_api.entity.Jugador;
import com.torneo_api.entity.Partido;
import com.torneo_api.entity.Role;
import com.torneo_api.entity.Usuario;
import com.torneo_api.exception.BadRequestException;
import com.torneo_api.repository.EquipoRepository;
import com.torneo_api.repository.JugadorRepository;
import com.torneo_api.repository.PartidoRepository;
import com.torneo_api.repository.TorneoRepository;
import com.torneo_api.repository.UsuarioRepository;
import com.torneo_api.service.EstadisticaService;
import com.torneo_api.service.PartidoService;
import com.torneo_api.service.TorneoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class TorneoServiceTest {

    @Autowired
    private TorneoService torneoService;

    @Autowired
    private PartidoService partidoService;

    @Autowired
    private EstadisticaService estadisticaService;

    @Autowired
    private TorneoRepository torneoRepository;

    @Autowired
    private EquipoRepository equipoRepository;

    @Autowired
    private JugadorRepository jugadorRepository;

    @Autowired
    private PartidoRepository partidoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private Long torneoId;
    private Long equipoAId;
    private Long equipoBId;
    private Long equipoCId;
    private Long equipoDId;

    @BeforeEach
    void setUp() {
        partidoRepository.deleteAll();
        jugadorRepository.deleteAll();
        equipoRepository.deleteAll();
        torneoRepository.deleteAll();
        usuarioRepository.deleteAll();

        // 1. Crear Torneo
        TorneoRequestDTO tReq = new TorneoRequestDTO();
        tReq.setNombre("Champions League");
        tReq.setTipo("Fútbol");
        TorneoResponseDTO tResp = torneoService.crearTorneo(tReq);
        torneoId = tResp.getId();

        // Crear capitán de prueba
        Usuario capitan = Usuario.builder()
                .nombre("Capitan 1")
                .email("capitan1@torneo.com")
                .password("123456")
                .role(Role.CAPITAN)
                .build();
        usuarioRepository.save(capitan);

        // 2. Crear 4 Equipos
        Equipo eA = Equipo.builder().nombre("Real Madrid").ciudad("Madrid").capitan(capitan).build();
        Equipo eB = Equipo.builder().nombre("Barcelona").ciudad("Barcelona").capitan(capitan).build();
        Equipo eC = Equipo.builder().nombre("Bayern Munich").ciudad("Munich").capitan(capitan).build();
        Equipo eD = Equipo.builder().nombre("PSG").ciudad("Paris").capitan(capitan).build();

        equipoAId = equipoRepository.save(eA).getId();
        equipoBId = equipoRepository.save(eB).getId();
        equipoCId = equipoRepository.save(eC).getId();
        equipoDId = equipoRepository.save(eD).getId();

        // 3. Registrar Equipos en el Torneo
        torneoService.agregarEquipoATorneo(torneoId, equipoAId);
        torneoService.agregarEquipoATorneo(torneoId, equipoBId);
        torneoService.agregarEquipoATorneo(torneoId, equipoCId);
        torneoService.agregarEquipoATorneo(torneoId, equipoDId);
    }

    @Test
    void testGenerarFixtureBergerExito() {
        // Ejecutar generación automática de fixture
        List<Partido> partidos = torneoService.generarFixture(torneoId);

        // Para 4 equipos, el fixture round-robin de ida debe generar exactamente 6 partidos
        // N * (N - 1) / 2 = 4 * 3 / 2 = 6
        assertNotNull(partidos);
        assertEquals(6, partidos.size());

        // Verificar que todos los partidos están programados y no jugados
        partidos.forEach(partido -> {
            assertEquals(torneoId, partido.getTorneo().getId());
            assertFalse(partido.isJugado());
            assertNull(partido.getGolesLocal());
            assertNull(partido.getGolesVisitante());
        });
    }

    @Test
    void testCalcularTablaPosicionesExito() {
        // 1. Generar partidos
        List<Partido> partidos = torneoService.generarFixture(torneoId);
        assertFalse(partidos.isEmpty());

        // 2. Registrar el resultado del primer partido (Local Real Madrid vs Visitante Barcelona)
        Partido primerPartido = partidos.get(0);
        primerPartido.setGolesLocal(3);
        primerPartido.setGolesVisitante(1);
        primerPartido.setJugado(true);
        partidoRepository.save(primerPartido);

        // 3. Calcular standings
        List<StandingResponseDTO> standings = torneoService.calcularTablaPosiciones(torneoId);

        assertNotNull(standings);
        assertEquals(4, standings.size());

        // El primer equipo de la tabla debería ser el ganador (Real Madrid) con 3 puntos y dif +2
        StandingResponseDTO lider = standings.get(0);
        assertEquals("Real Madrid", lider.getEquipoNombre());
        assertEquals(3, lider.getPuntos());
        assertEquals(1, lider.getPartidosJugados());
        assertEquals(1, lider.getPartidosGanados());
        assertEquals(3, lider.getGolesAFavor());
        assertEquals(1, lider.getGolesEnContra());
        assertEquals(2, lider.getDiferenciaGoles());

        // El último equipo de la tabla debería ser el perdedor (Barcelona) con 0 puntos y dif -2
        StandingResponseDTO colero = standings.get(standings.size() - 1);
        assertEquals("Barcelona", colero.getEquipoNombre());
        assertEquals(0, colero.getPuntos());
        assertEquals(1, colero.getPartidosJugados());
        assertEquals(1, colero.getPartidosPerdidos());
        assertEquals(1, colero.getGolesAFavor());
        assertEquals(3, colero.getGolesEnContra());
        assertEquals(-2, colero.getDiferenciaGoles());
    }

    @Test
    void testValidacionJugadorDosEquiposMismoTorneo() {
        // 1. Generar fixture y obtener un partido
        List<Partido> partidos = torneoService.generarFixture(torneoId);
        Partido partido = partidos.get(0); // Supongamos que juegan Equipo A vs Equipo B

        Equipo local = partido.getEquipoLocal();
        Equipo visitante = partido.getEquipoVisitante();

        // 2. Crear un jugador y registrarlo en Equipo A
        Jugador jugador = Jugador.builder()
                .nombre("Luis Suarez")
                .edad(35)
                .posicion("Delantero")
                .equipo(local)
                .build();
        jugador = jugadorRepository.save(jugador);

        // 3. Registrar una estadística para este jugador en el partido representando a Equipo A
        EstadisticaRequestDTO statReq = new EstadisticaRequestDTO();
        statReq.setJugadorId(jugador.getId());
        statReq.setGoles(2);
        statReq.setTarjetasAmarillas(1);
        statReq.setTarjetasRojas(0);

        estadisticaService.registrarEstadistica(partido.getId(), statReq);

        // 4. Supongamos que el jugador se transfiere al Equipo B (visitante)
        jugador.setEquipo(visitante);
        jugadorRepository.save(jugador);

        // 5. El jugador intenta jugar en OTRO partido de este torneo para Equipo B
        Partido otroPartido = partidos.get(1); // Otro partido del torneo
        // Modificar las selecciones para simular que Equipo B juega este otro partido
        otroPartido.setEquipoLocal(visitante);
        partidoRepository.save(otroPartido);

        EstadisticaRequestDTO statReq2 = new EstadisticaRequestDTO();
        statReq2.setJugadorId(jugador.getId());
        statReq2.setGoles(1);

        // Debe lanzar BadRequestException porque ya jugó para el Equipo A en este mismo torneo!
        assertThrows(BadRequestException.class, () -> 
                estadisticaService.registrarEstadistica(otroPartido.getId(), statReq2)
        );
    }
}
