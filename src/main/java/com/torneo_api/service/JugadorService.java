package com.torneo_api.service;

import com.torneo_api.dto.JugadorRequestDTO;
import com.torneo_api.dto.JugadorResponseDTO;
import com.torneo_api.entity.Equipo;
import com.torneo_api.entity.Jugador;
import com.torneo_api.exception.ResourceNotFoundException;
import com.torneo_api.mapper.JugadorMapper;
import com.torneo_api.repository.EquipoRepository;
import com.torneo_api.repository.JugadorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JugadorService {

    private final JugadorRepository jugadorRepository;
    private final EquipoRepository equipoRepository;

    public JugadorResponseDTO crearJugador(JugadorRequestDTO request) {
        Equipo equipo = equipoRepository.findById(request.getEquipoId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado con id: " + request.getEquipoId()));

        Jugador jugador = Jugador.builder()
                .nombre(request.getNombre())
                .edad(request.getEdad())
                .posicion(request.getPosicion())
                .equipo(equipo)
                .build();

        return JugadorMapper.toDTO(jugadorRepository.save(jugador));
    }

    public List<JugadorResponseDTO> listarJugadores() {
        return jugadorRepository.findAll().stream()
                .map(JugadorMapper::toDTO)
                .toList();
    }

    public JugadorResponseDTO obtenerJugadorPorId(Long id) {
        Jugador jugador = jugadorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Jugador no encontrado con id: " + id));
        return JugadorMapper.toDTO(jugador);
    }

    public JugadorResponseDTO actualizarJugador(Long id, JugadorRequestDTO request) {
        Jugador jugador = jugadorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Jugador no encontrado con id: " + id));

        Equipo equipo = equipoRepository.findById(request.getEquipoId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado con id: " + request.getEquipoId()));

        jugador.setNombre(request.getNombre());
        jugador.setEdad(request.getEdad());
        jugador.setPosicion(request.getPosicion());
        jugador.setEquipo(equipo);

        return JugadorMapper.toDTO(jugadorRepository.save(jugador));
    }

    public void eliminarJugador(Long id) {
        Jugador jugador = jugadorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Jugador no encontrado con id: " + id));
        jugadorRepository.delete(jugador);
    }
}
