package com.torneo_api.service;

import com.torneo_api.dto.EquipoResponseDTO;
import com.torneo_api.dto.GoleadorResponseDTO;
import com.torneo_api.dto.StandingResponseDTO;
import com.torneo_api.dto.TorneoRequestDTO;
import com.torneo_api.dto.TorneoResponseDTO;
import com.torneo_api.entity.Equipo;
import com.torneo_api.entity.Jugador;
import com.torneo_api.entity.Partido;
import com.torneo_api.entity.Torneo;
import com.torneo_api.exception.BadRequestException;
import com.torneo_api.exception.ResourceNotFoundException;
import com.torneo_api.mapper.EquipoMapper;
import com.torneo_api.mapper.TorneoMapper;
import com.torneo_api.repository.EquipoRepository;
import com.torneo_api.repository.EstadisticaRepository;
import com.torneo_api.repository.PartidoRepository;
import com.torneo_api.repository.TorneoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TorneoService {

    private final TorneoRepository torneoRepository;
    private final EquipoRepository equipoRepository;
    private final PartidoRepository partidoRepository;
    private final EstadisticaRepository estadisticaRepository;

    public TorneoResponseDTO crearTorneo(TorneoRequestDTO request) {
        Torneo torneo = Torneo.builder()
                .nombre(request.getNombre())
                .tipo(request.getTipo())
                .build();
        return TorneoMapper.toDTO(torneoRepository.save(torneo));
    }

    public List<TorneoResponseDTO> listarTorneos() {
        return torneoRepository.findAll().stream()
                .map(TorneoMapper::toDTO)
                .toList();
    }

    public TorneoResponseDTO obtenerTorneoPorId(Long id) {
        Torneo torneo = torneoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Torneo no encontrado con id: " + id));
        return TorneoMapper.toDTO(torneo);
    }

    public TorneoResponseDTO actualizarTorneo(Long id, TorneoRequestDTO request) {
        Torneo torneo = torneoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Torneo no encontrado con id: " + id));
        torneo.setNombre(request.getNombre());
        torneo.setTipo(request.getTipo());
        return TorneoMapper.toDTO(torneoRepository.save(torneo));
    }

    public void eliminarTorneo(Long id) {
        Torneo torneo = torneoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Torneo no encontrado con id: " + id));
        torneoRepository.delete(torneo);
    }

    @Transactional
    public TorneoResponseDTO agregarEquipoATorneo(Long torneoId, Long equipoId) {
        Torneo torneo = torneoRepository.findById(torneoId)
                .orElseThrow(() -> new ResourceNotFoundException("Torneo no encontrado con id: " + torneoId));

        Equipo equipo = equipoRepository.findById(equipoId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado con id: " + equipoId));

        if (equipo.getTorneo() != null) {
            if (equipo.getTorneo().getId().equals(torneoId)) {
                throw new BadRequestException("El equipo ya está registrado en este torneo");
            } else {
                throw new BadRequestException("El equipo ya está registrado en otro torneo (" + equipo.getTorneo().getNombre() + ")");
            }
        }

        equipo.setTorneo(torneo);
        equipoRepository.save(equipo);

        // Recargar el torneo de la base de datos para obtener la lista actualizada de equipos
        Torneo torneoActualizado = torneoRepository.findById(torneoId).orElse(torneo);
        return TorneoMapper.toDTO(torneoActualizado);
    }

    @Transactional
    public List<Partido> generarFixture(Long torneoId) {
        Torneo torneo = torneoRepository.findById(torneoId)
                .orElseThrow(() -> new ResourceNotFoundException("Torneo no encontrado con id: " + torneoId));

        List<Equipo> equipos = new ArrayList<>(torneo.getEquipos());

        if (equipos.size() < 2) {
            throw new BadRequestException("Se necesitan al menos 2 equipos en el torneo para generar un fixture");
        }

        // Validar que no haya partidos jugados antes de regenerar
        boolean tienePartidosJugados = torneo.getPartidos().stream().anyMatch(Partido::isJugado);
        if (tienePartidosJugados) {
            throw new BadRequestException("No se puede regenerar el fixture porque ya hay partidos jugados con resultados registrados");
        }

        // Eliminar partidos previos si los hay
        if (!torneo.getPartidos().isEmpty()) {
            partidoRepository.deleteAll(torneo.getPartidos());
            torneo.getPartidos().clear();
        }

        int n = equipos.size();
        boolean impar = n % 2 != 0;
        if (impar) {
            // Añadimos un valor nulo para representar la ronda libre (BYE)
            equipos.add(null);
            n++;
        }

        int numRondas = n - 1;
        List<Partido> partidosFixture = new ArrayList<>();

        for (int ronda = 0; ronda < numRondas; ronda++) {
            for (int i = 0; i < n / 2; i++) {
                int localIndex = (ronda + i) % (n - 1);
                int visitanteIndex = (n - 1 - i + ronda) % (n - 1);

                if (i == 0) {
                    localIndex = n - 1;
                }

                Equipo local = equipos.get(localIndex);
                Equipo visitante = equipos.get(visitanteIndex);

                // Si alguno es nulo, significa que el otro equipo tiene fecha libre en esta ronda
                if (local == null || visitante == null) {
                    continue;
                }

                // Alternar localía por ronda para balancear
                Equipo localDefinitivo = (ronda % 2 == 0) ? local : visitante;
                Equipo visitanteDefinitivo = (ronda % 2 == 0) ? visitante : local;

                Partido partido = Partido.builder()
                        .torneo(torneo)
                        .equipoLocal(localDefinitivo)
                        .equipoVisitante(visitanteDefinitivo)
                        .ronda(ronda + 1)
                        .jugado(false)
                        .build();

                partidosFixture.add(partido);
            }
        }

        return partidoRepository.saveAll(partidosFixture);
    }

    public List<StandingResponseDTO> calcularTablaPosiciones(Long torneoId) {
        Torneo torneo = torneoRepository.findById(torneoId)
                .orElseThrow(() -> new ResourceNotFoundException("Torneo no encontrado con id: " + torneoId));

        List<Equipo> equipos = torneo.getEquipos();
        Map<Long, StandingResponseDTO> tablaMap = new HashMap<>();

        // Inicializar tabla para cada equipo del torneo
        for (Equipo equipo : equipos) {
            tablaMap.put(equipo.getId(), StandingResponseDTO.builder()
                    .equipoId(equipo.getId())
                    .equipoNombre(equipo.getNombre())
                    .puntos(0)
                    .partidosJugados(0)
                    .partidosGanados(0)
                    .partidosEmpatados(0)
                    .partidosPerdidos(0)
                    .golesAFavor(0)
                    .golesEnContra(0)
                    .diferenciaGoles(0)
                    .build());
        }

        List<Partido> partidos = partidoRepository.findByTorneoId(torneoId);

        // Procesar partidos jugados
        for (Partido partido : partidos) {
            if (partido.isJugado() && partido.getGolesLocal() != null && partido.getGolesVisitante() != null) {
                StandingResponseDTO localStats = tablaMap.get(partido.getEquipoLocal().getId());
                StandingResponseDTO visitanteStats = tablaMap.get(partido.getEquipoVisitante().getId());

                if (localStats == null || visitanteStats == null) {
                    continue; // Seguridad si hay equipos corruptos
                }

                int golesLoc = partido.getGolesLocal();
                int golesVis = partido.getGolesVisitante();

                localStats.setPartidosJugados(localStats.getPartidosJugados() + 1);
                visitanteStats.setPartidosJugados(visitanteStats.getPartidosJugados() + 1);

                localStats.setGolesAFavor(localStats.getGolesAFavor() + golesLoc);
                localStats.setGolesEnContra(localStats.getGolesEnContra() + golesVis);

                visitanteStats.setGolesAFavor(visitanteStats.getGolesAFavor() + golesVis);
                visitanteStats.setGolesEnContra(visitanteStats.getGolesEnContra() + golesLoc);

                if (golesLoc > golesVis) {
                    localStats.setPuntos(localStats.getPuntos() + 3);
                    localStats.setPartidosGanados(localStats.getPartidosGanados() + 1);
                    visitanteStats.setPartidosPerdidos(visitanteStats.getPartidosPerdidos() + 1);
                } else if (golesLoc < golesVis) {
                    visitanteStats.setPuntos(visitanteStats.getPuntos() + 3);
                    visitanteStats.setPartidosGanados(visitanteStats.getPartidosGanados() + 1);
                    localStats.setPartidosPerdidos(localStats.getPartidosPerdidos() + 1);
                } else {
                    localStats.setPuntos(localStats.getPuntos() + 1);
                    visitanteStats.setPuntos(visitanteStats.getPuntos() + 1);
                    localStats.setPartidosEmpatados(localStats.getPartidosEmpatados() + 1);
                    visitanteStats.setPartidosEmpatados(visitanteStats.getPartidosEmpatados() + 1);
                }
            }
        }

        List<StandingResponseDTO> standingsList = new ArrayList<>(tablaMap.values());

        // Calcular diferencias de goles
        for (StandingResponseDTO row : standingsList) {
            row.setDiferenciaGoles(row.getGolesAFavor() - row.getGolesEnContra());
        }

        // Ordenar según criterios oficiales de fútbol:
        // 1. Puntos (descendente)
        // 2. Diferencia de Goles (descendente)
        // 3. Goles a Favor (descendente)
        // 4. Nombre del equipo (alfabético ascendente)
        standingsList.sort(Comparator
                .comparingInt(StandingResponseDTO::getPuntos).reversed()
                .thenComparingInt(StandingResponseDTO::getDiferenciaGoles).reversed()
                .thenComparingInt(StandingResponseDTO::getGolesAFavor).reversed()
                .thenComparing(StandingResponseDTO::getEquipoNombre)
        );

        // Asignar rangos de posición
        for (int idx = 0; idx < standingsList.size(); idx++) {
            standingsList.get(idx).setPosicion(idx + 1);
        }

        return standingsList;
    }

    public List<GoleadorResponseDTO> calcularGoleadores(Long torneoId) {
        // Verificar que el torneo exista
        torneoRepository.findById(torneoId)
                .orElseThrow(() -> new ResourceNotFoundException("Torneo no encontrado con id: " + torneoId));

        List<Object[]> rawScorers = estadisticaRepository.findTopScorersByTorneoId(torneoId);
        List<GoleadorResponseDTO> topScorers = new ArrayList<>();

        for (Object[] row : rawScorers) {
            Jugador jugador = (Jugador) row[0];
            Long goles = (Long) row[1];

            topScorers.add(GoleadorResponseDTO.builder()
                    .jugadorId(jugador.getId())
                    .jugadorNombre(jugador.getNombre())
                    .equipoNombre(jugador.getEquipo() != null ? jugador.getEquipo().getNombre() : "Sin equipo")
                    .goles(goles.intValue())
                    .build());
        }

        return topScorers;
    }
}
