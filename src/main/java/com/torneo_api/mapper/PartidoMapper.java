package com.torneo_api.mapper;

import com.torneo_api.dto.PartidoResponseDTO;
import com.torneo_api.entity.Partido;

import java.util.Collections;

public class PartidoMapper {

    public static PartidoResponseDTO toDTO(Partido partido) {
        if (partido == null) {
            return null;
        }

        return PartidoResponseDTO.builder()
                .id(partido.getId())
                .torneoId(partido.getTorneo() != null ? partido.getTorneo().getId() : null)
                .torneoNombre(partido.getTorneo() != null ? partido.getTorneo().getNombre() : null)
                .equipoLocalId(partido.getEquipoLocal() != null ? partido.getEquipoLocal().getId() : null)
                .equipoLocalNombre(partido.getEquipoLocal() != null ? partido.getEquipoLocal().getNombre() : null)
                .equipoVisitanteId(partido.getEquipoVisitante() != null ? partido.getEquipoVisitante().getId() : null)
                .equipoVisitanteNombre(partido.getEquipoVisitante() != null ? partido.getEquipoVisitante().getNombre() : null)
                .golesLocal(partido.getGolesLocal())
                .golesVisitante(partido.getGolesVisitante())
                .jugado(partido.isJugado())
                .ronda(partido.getRonda())
                .jugadoresConvocados(
                        partido.getJugadores() != null
                                ? partido.getJugadores().stream().map(JugadorMapper::toDTO).toList()
                                : Collections.emptyList()
                )
                .build();
    }
}
