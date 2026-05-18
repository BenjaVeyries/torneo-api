package com.torneo_api.mapper;

import com.torneo_api.dto.JugadorResponseDTO;
import com.torneo_api.entity.Jugador;

public class JugadorMapper {

    public static JugadorResponseDTO toDTO(Jugador jugador) {
        if (jugador == null) {
            return null;
        }

        return JugadorResponseDTO.builder()
                .id(jugador.getId())
                .nombre(jugador.getNombre())
                .edad(jugador.getEdad())
                .posicion(jugador.getPosicion())
                .equipoId(jugador.getEquipo() != null ? jugador.getEquipo().getId() : null)
                .equipoNombre(jugador.getEquipo() != null ? jugador.getEquipo().getNombre() : null)
                .build();
    }
}
