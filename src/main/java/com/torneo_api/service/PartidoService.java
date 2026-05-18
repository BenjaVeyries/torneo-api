package com.torneo_api.service;

import com.torneo_api.dto.PartidoMarcadorRequestDTO;
import com.torneo_api.dto.PartidoRequestDTO;
import com.torneo_api.dto.PartidoResponseDTO;
import com.torneo_api.entity.Equipo;
import com.torneo_api.entity.Jugador;
import com.torneo_api.entity.Partido;
import com.torneo_api.entity.Torneo;
import com.torneo_api.exception.BadRequestException;
import com.torneo_api.exception.ResourceNotFoundException;
import com.torneo_api.mapper.PartidoMapper;
import com.torneo_api.repository.EquipoRepository;
import com.torneo_api.repository.JugadorRepository;
import com.torneo_api.repository.PartidoRepository;
import com.torneo_api.repository.TorneoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PartidoService {

    private final PartidoRepository partidoRepository;
    private final TorneoRepository torneoRepository;
    private final EquipoRepository equipoRepository;
    private final JugadorRepository jugadorRepository;

    public PartidoResponseDTO crearPartido(PartidoRequestDTO request) {
        Torneo torneo = torneoRepository.findById(request.getTorneoId())
                .orElseThrow(() -> new ResourceNotFoundException("Torneo no encontrado con id: " + request.getTorneoId()));

        Equipo local = equipoRepository.findById(request.getEquipoLocalId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipo local no encontrado con id: " + request.getEquipoLocalId()));

        Equipo visitante = equipoRepository.findById(request.getEquipoVisitanteId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipo visitante no encontrado con id: " + request.getEquipoVisitanteId()));

        if (local.getId().equals(visitante.getId())) {
            throw new BadRequestException("Un equipo no puede jugar contra sí mismo");
        }

        // Validar que ambos equipos pertenecen al torneo
        if (local.getTorneo() == null || !local.getTorneo().getId().equals(torneo.getId())) {
            throw new BadRequestException("El equipo local no está registrado en este torneo");
        }
        if (visitante.getTorneo() == null || !visitante.getTorneo().getId().equals(torneo.getId())) {
            throw new BadRequestException("El equipo visitante no está registrado en este torneo");
        }

        Partido partido = Partido.builder()
                .torneo(torneo)
                .equipoLocal(local)
                .equipoVisitante(visitante)
                .ronda(request.getRonda())
                .jugado(false)
                .build();

        return PartidoMapper.toDTO(partidoRepository.save(partido));
    }

    public List<PartidoResponseDTO> listarPartidos() {
        return partidoRepository.findAll().stream()
                .map(PartidoMapper::toDTO)
                .toList();
    }

    public PartidoResponseDTO obtenerPartidoPorId(Long id) {
        Partido partido = partidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partido no encontrado con id: " + id));
        return PartidoMapper.toDTO(partido);
    }

    @Transactional
    public PartidoResponseDTO actualizarMarcador(Long partidoId, PartidoMarcadorRequestDTO request) {
        Partido partido = partidoRepository.findById(partidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Partido no encontrado con id: " + partidoId));

        partido.setGolesLocal(request.getGolesLocal());
        partido.setGolesVisitante(request.getGolesVisitante());
        partido.setJugado(true);

        return PartidoMapper.toDTO(partidoRepository.save(partido));
    }

    @Transactional
    public PartidoResponseDTO registrarJugadoresEnPartido(Long partidoId, List<Long> jugadorIds) {
        Partido partido = partidoRepository.findById(partidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Partido no encontrado con id: " + partidoId));

        List<Jugador> jugadoresConvocados = new ArrayList<>();

        for (Long jugadorId : jugadorIds) {
            Jugador jugador = jugadorRepository.findById(jugadorId)
                    .orElseThrow(() -> new ResourceNotFoundException("Jugador no encontrado con id: " + jugadorId));

            // Validación 1: El jugador debe pertenecer a uno de los dos equipos del partido
            Equipo equipoLocal = partido.getEquipoLocal();
            Equipo equipoVisitante = partido.getEquipoVisitante();

            if (jugador.getEquipo() == null || 
                (!jugador.getEquipo().getId().equals(equipoLocal.getId()) && 
                 !jugador.getEquipo().getId().equals(equipoVisitante.getId()))) {
                throw new BadRequestException("El jugador " + jugador.getNombre() + 
                        " no pertenece a ninguno de los equipos que disputan este partido (" + 
                        equipoLocal.getNombre() + " vs " + equipoVisitante.getNombre() + ")");
            }

            jugadoresConvocados.add(jugador);
        }

        partido.setJugadores(jugadoresConvocados);
        return PartidoMapper.toDTO(partidoRepository.save(partido));
    }
}
