package com.torneo_api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class JugadorResponseDTO {

    private Long id;
    private String nombre;
    private Integer edad;
    private String posicion;
    private Long equipoId;
    private String equipoNombre;
}
