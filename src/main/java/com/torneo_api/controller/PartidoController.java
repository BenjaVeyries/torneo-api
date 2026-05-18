package com.torneo_api.controller;

import com.torneo_api.dto.PartidoMarcadorRequestDTO;
import com.torneo_api.dto.PartidoRequestDTO;
import com.torneo_api.dto.PartidoResponseDTO;
import com.torneo_api.service.PartidoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/partidos")
@RequiredArgsConstructor
public class PartidoController {

    private final PartidoService partidoService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public PartidoResponseDTO crearPartido(@Valid @RequestBody PartidoRequestDTO request) {
        return partidoService.crearPartido(request);
    }

    @GetMapping
    public List<PartidoResponseDTO> listarPartidos() {
        return partidoService.listarPartidos();
    }

    @GetMapping("/{id}")
    public PartidoResponseDTO obtenerPartido(@PathVariable Long id) {
        return partidoService.obtenerPartidoPorId(id);
    }

    @PutMapping("/{id}/marcador")
    @PreAuthorize("hasRole('ADMIN')")
    public PartidoResponseDTO actualizarMarcador(
            @PathVariable Long id, 
            @Valid @RequestBody PartidoMarcadorRequestDTO request
    ) {
        return partidoService.actualizarMarcador(id, request);
    }

    @PostMapping("/{id}/jugadores")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CAPITAN')")
    public PartidoResponseDTO registrarJugadoresEnPartido(
            @PathVariable Long id, 
            @RequestBody List<Long> jugadorIds
    ) {
        return partidoService.registrarJugadoresEnPartido(id, jugadorIds);
    }
}
