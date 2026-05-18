package com.torneo_api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "jugadores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Jugador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    private Integer edad;

    private String posicion;

    @ManyToOne
    @JoinColumn(name = "equipo_id")
    private Equipo equipo;

    @ManyToMany(mappedBy = "jugadores")
    @Builder.Default
    private List<Partido> partidos = new ArrayList<>();

    @OneToMany(mappedBy = "jugador", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Estadistica> estadisticas = new ArrayList<>();
}