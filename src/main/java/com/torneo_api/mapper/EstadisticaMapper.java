package com.torneo_api.mapper;

import com.torneo_api.dto.EstadisticaResponseDTO;
import com.torneo_api.entity.Estadistica;

public class EstadisticaMapper {

    public static EstadisticaResponseDTO toDTO(Estadistica estadistica) {
        if (estadistica == null) {
            return null;
        }

        return EstadisticaResponseDTO.builder()
                .id(estadistica.getId())
                .partidoId(estadistica.getPartido() != null ? estadistica.getPartido().getId() : null)
                .jugadorId(estadistica.getJugador() != null ? estadistica.getJugador().getId() : null)
                .jugadorNombre(estadistica.getJugador() != null ? estadistica.getJugador().getNombre() : null)
                .equipoNombre(
                        estadistica.getJugador() != null && estadistica.getJugador().getEquipo() != null
                                ? estadistica.getJugador().getEquipo().getNombre()
                                : null
                )
                .goles(estadistica.getGoles())
                .tarjetasAmarillas(estadistica.getTarjetasAmarillas())
                .tarjetasRojas(estadistica.getTarjetasRojas())
                .build();
    }
}
