package com.torneo_api.controller;

import com.torneo_api.dto.JugadorRequestDTO;
import com.torneo_api.dto.JugadorResponseDTO;
import com.torneo_api.service.JugadorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jugadores")
@RequiredArgsConstructor
public class JugadorController {

    private final JugadorService jugadorService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN') or @securityService.isCapitanDeEquipo(#request.equipoId)")
    public JugadorResponseDTO crearJugador(@Valid @RequestBody JugadorRequestDTO request) {
        return jugadorService.crearJugador(request);
    }

    @GetMapping
    public List<JugadorResponseDTO> listarJugadores() {
        return jugadorService.listarJugadores();
    }

    @GetMapping("/{id}")
    public JugadorResponseDTO obtenerJugador(@PathVariable Long id) {
        return jugadorService.obtenerJugadorPorId(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isCapitanDeEquipo(#request.equipoId)")
    public JugadorResponseDTO actualizarJugador(
            @PathVariable Long id, 
            @Valid @RequestBody JugadorRequestDTO request
    ) {
        return jugadorService.actualizarJugador(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN') or @securityService.isCapitanDeEquipo(@jugadorService.obtenerJugadorPorId(#id).equipoId)")
    public void eliminarJugador(@PathVariable Long id) {
        jugadorService.eliminarJugador(id);
    }
}
