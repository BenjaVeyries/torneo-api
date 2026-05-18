package com.torneo_api.mapper;

import com.torneo_api.dto.TorneoResponseDTO;
import com.torneo_api.entity.Torneo;

import java.util.Collections;

public class TorneoMapper {

    public static TorneoResponseDTO toDTO(Torneo torneo) {
        if (torneo == null) {
            return null;
        }

        return TorneoResponseDTO.builder()
                .id(torneo.getId())
                .nombre(torneo.getNombre())
                .tipo(torneo.getTipo())
                .equipos(
                        torneo.getEquipos() != null
                                ? torneo.getEquipos().stream().map(EquipoMapper::toDTO).toList()
                                : Collections.emptyList()
                )
                .build();
    }
}
