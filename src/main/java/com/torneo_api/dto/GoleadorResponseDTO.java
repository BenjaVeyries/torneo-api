package com.torneo_api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoleadorResponseDTO {

    private Long jugadorId;
    private String jugadorNombre;
    private String equipoNombre;
    private int goles;
}
