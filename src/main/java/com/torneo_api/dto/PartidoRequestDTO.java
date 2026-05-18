package com.torneo_api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PartidoRequestDTO {

    @NotNull(message = "El torneo ID es obligatorio")
    private Long torneoId;

    @NotNull(message = "El equipo local ID es obligatorio")
    private Long equipoLocalId;

    @NotNull(message = "El equipo visitante ID es obligatorio")
    private Long equipoVisitanteId;

    @NotNull(message = "El número de ronda es obligatorio")
    private Integer ronda;
}
