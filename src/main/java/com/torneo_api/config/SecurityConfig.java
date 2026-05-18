package com.torneo_api.config;

import com.torneo_api.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        // Endpoints de registro e inicio de sesión son públicos
                        .requestMatchers("/auth/**").permitAll()
                        // Consultas de datos son públicas para todos los usuarios (según requerimiento)
                        .requestMatchers(HttpMethod.GET, "/torneos/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/equipos/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/jugadores/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/partidos/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/estadisticas/**").permitAll()
                        // Todas las demás operaciones (POST, PUT, DELETE) requieren autenticación
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}