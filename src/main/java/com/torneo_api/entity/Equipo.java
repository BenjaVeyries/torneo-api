package com.torneo_api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "equipos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Equipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    private String ciudad;

    @ManyToOne
    @JoinColumn(name = "capitan_id")
    private Usuario capitan;

    @OneToMany(mappedBy = "equipo", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Jugador> jugadores = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "torneo_id")
    private Torneo torneo;
}