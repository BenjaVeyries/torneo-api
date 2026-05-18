package com.torneo_api.dto;

import lombok.Data;

@Data
public class EquipoRequestDTO {

    private String nombre;
    private String ciudad;
    private Long capitanId;
}