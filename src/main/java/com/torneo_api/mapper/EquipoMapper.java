package com.torneo_api.mapper;

import com.torneo_api.dto.EquipoResponseDTO;
import com.torneo_api.entity.Equipo;

public class EquipoMapper {

    public static EquipoResponseDTO toDTO(Equipo equipo) {

        return EquipoResponseDTO.builder()
                .id(equipo.getId())
                .nombre(equipo.getNombre())
                .ciudad(equipo.getCiudad())
                .capitanNombre(
                        equipo.getCapitan() != null
                                ? equipo.getCapitan().getNombre()
                                : null
                )
                .build();
    }
}