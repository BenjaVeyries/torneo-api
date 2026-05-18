package com.torneo_api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class JugadorRequestDTO {

    @NotBlank(message = "El nombre del jugador es obligatorio")
    private String nombre;

    @NotNull(message = "La edad del jugador es obligatoria")
    @Min(value = 5, message = "La edad mínima admisible es 5 años")
    private Integer edad;

    @NotBlank(message = "La posición es obligatoria (ej: Delantero, Portero)")
    private String posicion;

    @NotNull(message = "El ID del equipo es obligatorio")
    private Long equipoId;
}
