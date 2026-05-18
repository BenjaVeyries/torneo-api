package com.torneo_api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EquipoResponseDTO {

    private Long id;
    private String nombre;
    private String ciudad;
    private String capitanNombre;
}