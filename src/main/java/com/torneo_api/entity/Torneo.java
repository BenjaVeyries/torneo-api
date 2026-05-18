package com.torneo_api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "torneos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Torneo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    private String tipo; // Fútbol por defecto, pero flexible

    @OneToMany(mappedBy = "torneo", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Equipo> equipos = new ArrayList<>();

    @OneToMany(mappedBy = "torneo", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Partido> partidos = new ArrayList<>();
}
