package com.torneo_api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TorneoRequestDTO {

    @NotBlank(message = "El nombre del torneo es obligatorio")
    private String nombre;

    @NotBlank(message = "El tipo de torneo es obligatorio (ej: Fútbol, Básquet)")
    private String tipo;
}
