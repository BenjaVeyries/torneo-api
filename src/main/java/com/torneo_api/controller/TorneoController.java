package com.torneo_api.controller;

import com.torneo_api.dto.GoleadorResponseDTO;
import com.torneo_api.dto.StandingResponseDTO;
import com.torneo_api.dto.TorneoRequestDTO;
import com.torneo_api.dto.TorneoResponseDTO;
import com.torneo_api.entity.Partido;
import com.torneo_api.mapper.PartidoMapper;
import com.torneo_api.dto.PartidoResponseDTO;
import com.torneo_api.service.TorneoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/torneos")
@RequiredArgsConstructor
public class TorneoController {

    private final TorneoService torneoService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public TorneoResponseDTO crearTorneo(@Valid @RequestBody TorneoRequestDTO request) {
        return torneoService.crearTorneo(request);
    }

    @GetMapping
    public List<TorneoResponseDTO> listarTorneos() {
        return torneoService.listarTorneos();
    }

    @GetMapping("/{id}")
    public TorneoResponseDTO obtenerTorneo(@PathVariable Long id) {
        return torneoService.obtenerTorneoPorId(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public TorneoResponseDTO actualizarTorneo(
            @PathVariable Long id, 
            @Valid @RequestBody TorneoRequestDTO request
    ) {
        return torneoService.actualizarTorneo(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void eliminarTorneo(@PathVariable Long id) {
        torneoService.eliminarTorneo(id);
    }

    @PostMapping("/{id}/equipos/{equipoId}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isCapitanDeEquipo(#equipoId)")
    public TorneoResponseDTO agregarEquipoATorneo(
            @PathVariable Long id, 
            @PathVariable Long equipoId
    ) {
        return torneoService.agregarEquipoATorneo(id, equipoId);
    }

    @PostMapping("/{id}/fixture")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public List<PartidoResponseDTO> generarFixture(@PathVariable Long id) {
        List<Partido> partidos = torneoService.generarFixture(id);
        return partidos.stream()
                .map(PartidoMapper::toDTO)
                .toList();
    }

    @GetMapping("/{id}/standings")
    public List<StandingResponseDTO> obtenerTablaPosiciones(@PathVariable Long id) {
        return torneoService.calcularTablaPosiciones(id);
    }

    @GetMapping("/{id}/goleadores")
    public List<GoleadorResponseDTO> obtenerGoleadores(@PathVariable Long id) {
        return torneoService.calcularGoleadores(id);
    }
}
