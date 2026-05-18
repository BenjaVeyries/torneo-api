package com.torneo_api.service;

import com.torneo_api.auth.dto.AuthResponseDTO;
import com.torneo_api.auth.dto.LoginRequestDTO;
import com.torneo_api.auth.dto.RegisterRequestDTO;
import com.torneo_api.entity.Role;
import com.torneo_api.entity.Usuario;
import com.torneo_api.repository.UsuarioRepository;
import com.torneo_api.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponseDTO register(RegisterRequestDTO request) {

        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        Role assignedRole = request.getRole() != null ? request.getRole() : Role.USER;

        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(assignedRole)
                .build();

        usuarioRepository.save(usuario);

        UserDetails userDetails = new User(
                usuario.getEmail(),
                usuario.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + usuario.getRole().name()))
        );

        String token = jwtService.generateToken(userDetails);

        return AuthResponseDTO.builder()
                .mensaje("Usuario registrado correctamente")
                .token(token)
                .build();
    }

    public AuthResponseDTO login(LoginRequestDTO request) {

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        UserDetails userDetails = new User(
                usuario.getEmail(),
                usuario.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + usuario.getRole().name()))
        );

        String token = jwtService.generateToken(userDetails);

        return AuthResponseDTO.builder()
                .mensaje("Login exitoso")
                .token(token)
                .build();
    }
}