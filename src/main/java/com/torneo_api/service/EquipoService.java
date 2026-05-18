package com.torneo_api.service;

import com.torneo_api.dto.EquipoRequestDTO;
import com.torneo_api.dto.EquipoResponseDTO;
import com.torneo_api.entity.Equipo;
import com.torneo_api.entity.Usuario;
import com.torneo_api.exception.ResourceNotFoundException;
import com.torneo_api.mapper.EquipoMapper;
import com.torneo_api.repository.EquipoRepository;
import com.torneo_api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipoService {

    private final EquipoRepository equipoRepository;
    private final UsuarioRepository usuarioRepository;

    public EquipoResponseDTO crearEquipo(EquipoRequestDTO request) {
        Usuario capitan = null;

        if (request.getCapitanId() != null) {
            capitan = usuarioRepository.findById(request.getCapitanId())
                    .orElseThrow(() -> new ResourceNotFoundException("Capitán no encontrado con id: " + request.getCapitanId()));
        }

        Equipo equipo = Equipo.builder()
                .nombre(request.getNombre())
                .ciudad(request.getCiudad())
                .capitan(capitan)
                .build();

        Equipo equipoGuardado = equipoRepository.save(equipo);
        return EquipoMapper.toDTO(equipoGuardado);
    }

    public List<EquipoResponseDTO> listarEquipos() {
        return equipoRepository.findAll()
                .stream()
                .map(EquipoMapper::toDTO)
                .toList();
    }

    public EquipoResponseDTO obtenerEquipoPorId(Long id) {
        Equipo equipo = equipoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado con id: " + id));
        return EquipoMapper.toDTO(equipo);
    }

    public EquipoResponseDTO actualizarEquipo(Long id, EquipoRequestDTO request) {
        Equipo equipo = equipoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado con id: " + id));

        Usuario capitan = null;
        if (request.getCapitanId() != null) {
            capitan = usuarioRepository.findById(request.getCapitanId())
                    .orElseThrow(() -> new ResourceNotFoundException("Capitán no encontrado con id: " + request.getCapitanId()));
        }

        equipo.setNombre(request.getNombre());
        equipo.setCiudad(request.getCiudad());
        equipo.setCapitan(capitan);

        Equipo equipoGuardado = equipoRepository.save(equipo);
        return EquipoMapper.toDTO(equipoGuardado);
    }

    public void eliminarEquipo(Long id) {
        Equipo equipo = equipoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado con id: " + id));
        equipoRepository.delete(equipo);
    }
}