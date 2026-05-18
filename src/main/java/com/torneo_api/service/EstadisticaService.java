package com.torneo_api.service;

import com.torneo_api.dto.EstadisticaRequestDTO;
import com.torneo_api.dto.EstadisticaResponseDTO;
import com.torneo_api.entity.Equipo;
import com.torneo_api.entity.Estadistica;
import com.torneo_api.entity.Jugador;
import com.torneo_api.entity.Partido;
import com.torneo_api.exception.BadRequestException;
import com.torneo_api.exception.ResourceNotFoundException;
import com.torneo_api.mapper.EstadisticaMapper;
import com.torneo_api.repository.EstadisticaRepository;
import com.torneo_api.repository.JugadorRepository;
import com.torneo_api.repository.PartidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EstadisticaService {

    private final EstadisticaRepository estadisticaRepository;
    private final PartidoRepository partidoRepository;
    private final JugadorRepository jugadorRepository;

    @Transactional
    public EstadisticaResponseDTO registrarEstadistica(Long partidoId, EstadisticaRequestDTO request) {
        Partido partido = partidoRepository.findById(partidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Partido no encontrado con id: " + partidoId));

        Jugador jugador = jugadorRepository.findById(request.getJugadorId())
                .orElseThrow(() -> new ResourceNotFoundException("Jugador no encontrado con id: " + request.getJugadorId()));

        Equipo equipoLocal = partido.getEquipoLocal();
        Equipo equipoVisitante = partido.getEquipoVisitante();

        // Validación 1: El jugador debe pertenecer a uno de los dos equipos
        if (jugador.getEquipo() == null || 
            (!jugador.getEquipo().getId().equals(equipoLocal.getId()) && 
             !jugador.getEquipo().getId().equals(equipoVisitante.getId()))) {
            throw new BadRequestException("El jugador " + jugador.getNombre() + 
                    " no pertenece a los planteles de los equipos que juegan este partido (" + 
                    equipoLocal.getNombre() + " vs " + equipoVisitante.getNombre() + ")");
        }

        // Validación 2 (Requisito Especial): Validar que el jugador no juegue para dos equipos del mismo torneo
        List<Estadistica> historialStatsEnTorneo = estadisticaRepository.findByJugadorIdAndPartidoTorneoId(
                jugador.getId(), 
                partido.getTorneo().getId()
        );

        for (Estadistica statPrevia : historialStatsEnTorneo) {
            // Ignorar la estadística de este mismo partido si se está actualizando
            if (statPrevia.getPartido().getId().equals(partidoId)) {
                continue;
            }
            if (!statPrevia.getEquipo().getId().equals(jugador.getEquipo().getId())) {
                throw new BadRequestException("El jugador " + jugador.getNombre() + 
                        " ya ha disputado partidos en este torneo representando a otro equipo: " + 
                        statPrevia.getEquipo().getNombre() + ". No puede jugar para dos equipos en el mismo torneo.");
            }
        }

        // Conveniencia: Si el jugador no estaba registrado en la planilla del partido, lo añadimos
        if (!partido.getJugadores().contains(jugador)) {
            partido.getJugadores().add(jugador);
            partidoRepository.save(partido);
        }

        // Buscar si ya existe una estadística para este jugador y partido (para actualizar en vez de duplicar)
        Optional<Estadistica> estadisticaExistente = estadisticaRepository.findByPartidoIdAndJugadorId(
                partidoId, 
                jugador.getId()
        );

        Estadistica estadistica;
        if (estadisticaExistente.isPresent()) {
            estadistica = estadisticaExistente.get();
            estadistica.setGoles(request.getGoles());
            estadistica.setTarjetasAmarillas(request.getTarjetasAmarillas());
            estadistica.setTarjetasRojas(request.getTarjetasRojas());
        } else {
            estadistica = Estadistica.builder()
                    .partido(partido)
                    .jugador(jugador)
                    .equipo(jugador.getEquipo())
                    .goles(request.getGoles())
                    .tarjetasAmarillas(request.getTarjetasAmarillas())
                    .tarjetasRojas(request.getTarjetasRojas())
                    .build();
        }

        Estadistica guardada = estadisticaRepository.save(estadistica);
        return EstadisticaMapper.toDTO(guardada);
    }

    public List<EstadisticaResponseDTO> obtenerEstadisticasPorPartido(Long partidoId) {
        // Verificar que el partido exista
        partidoRepository.findById(partidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Partido no encontrado con id: " + partidoId));

        return estadisticaRepository.findByPartidoId(partidoId).stream()
                .map(EstadisticaMapper::toDTO)
                .toList();
    }
}
