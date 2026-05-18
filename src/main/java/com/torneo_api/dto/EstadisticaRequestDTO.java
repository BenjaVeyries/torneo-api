package com.torneo_api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EstadisticaRequestDTO {

    @NotNull(message = "El ID del jugador es obligatorio")
    private Long jugadorId;

    @Min(value = 0, message = "Los goles no pueden ser negativos")
    private int goles;

    @Min(value = 0, message = "Las tarjetas amarillas no pueden ser negativas")
    private int tarjetasAmarillas;

    @Min(value = 0, message = "Las tarjetas rojas no pueden ser negativas")
    private int tarjetasRojas;
}
