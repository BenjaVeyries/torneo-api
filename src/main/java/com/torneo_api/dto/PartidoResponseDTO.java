package com.torneo_api.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PartidoResponseDTO {

    private Long id;
    private Long torneoId;
    private String torneoNombre;
    private Long equipoLocalId;
    private String equipoLocalNombre;
    private Long equipoVisitanteId;
    private String equipoVisitanteNombre;
    private Integer golesLocal;
    private Integer golesVisitante;
    private boolean jugado;
    private Integer ronda;
    private List<JugadorResponseDTO> jugadoresConvocados;
}
