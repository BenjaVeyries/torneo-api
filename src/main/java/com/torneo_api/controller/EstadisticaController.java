package com.torneo_api.controller;

import com.torneo_api.dto.EstadisticaRequestDTO;
import com.torneo_api.dto.EstadisticaResponseDTO;
import com.torneo_api.service.EstadisticaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class EstadisticaController {

    private final EstadisticaService estadisticaService;

    @PostMapping("/partidos/{partidoId}/estadisticas")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public EstadisticaResponseDTO registrarEstadistica(
            @PathVariable Long partidoId, 
            @Valid @RequestBody EstadisticaRequestDTO request
    ) {
        return estadisticaService.registrarEstadistica(partidoId, request);
    }

    @GetMapping("/partidos/{partidoId}/estadisticas")
    public List<EstadisticaResponseDTO> obtenerEstadisticasPorPartido(@PathVariable Long partidoId) {
        return estadisticaService.obtenerEstadisticasPorPartido(partidoId);
    }
}
