package com.torneo_api.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "estadisticas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Estadistica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "partido_id", nullable = false)
    private Partido partido;

    @ManyToOne
    @JoinColumn(name = "jugador_id", nullable = false)
    private Jugador jugador;

    @ManyToOne
    @JoinColumn(name = "equipo_id", nullable = false)
    private Equipo equipo;

    @Builder.Default
    private int goles = 0;

    @Builder.Default
    private int tarjetasAmarillas = 0;

    @Builder.Default
    private int tarjetasRojas = 0;
}
