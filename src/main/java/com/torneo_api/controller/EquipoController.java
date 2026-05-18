package com.torneo_api.controller;

import com.torneo_api.dto.EquipoRequestDTO;
import com.torneo_api.dto.EquipoResponseDTO;
import com.torneo_api.service.EquipoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/equipos")
@RequiredArgsConstructor
public class EquipoController {

    private final EquipoService equipoService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN') or hasRole('CAPITAN')")
    public EquipoResponseDTO crearEquipo(@Valid @RequestBody EquipoRequestDTO request) {
        return equipoService.crearEquipo(request);
    }

    @GetMapping
    public List<EquipoResponseDTO> listarEquipos() {
        return equipoService.listarEquipos();
    }

    @GetMapping("/{id}")
    public EquipoResponseDTO obtenerEquipo(@PathVariable Long id) {
        return equipoService.obtenerEquipoPorId(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isCapitanDeEquipo(#id)")
    public EquipoResponseDTO actualizarEquipo(
            @PathVariable Long id, 
            @Valid @RequestBody EquipoRequestDTO request
    ) {
        return equipoService.actualizarEquipo(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void eliminarEquipo(@PathVariable Long id) {
        equipoService.eliminarEquipo(id);
    }
}
