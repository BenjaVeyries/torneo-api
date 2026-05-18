package com.torneo_api.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TorneoResponseDTO {

    private Long id;
    private String nombre;
    private String tipo;
    private List<EquipoResponseDTO> equipos;
}
