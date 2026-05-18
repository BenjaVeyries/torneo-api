package com.torneo_api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EstadisticaResponseDTO {

    private Long id;
    private Long partidoId;
    private Long jugadorId;
    private String jugadorNombre;
    private String equipoNombre;
    private int goles;
    private int tarjetasAmarillas;
    private int tarjetasRojas;
}
