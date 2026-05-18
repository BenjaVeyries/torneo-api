package com.torneo_api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "partidos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Partido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "torneo_id", nullable = false)
    private Torneo torneo;

    @ManyToOne
    @JoinColumn(name = "equipo_local_id", nullable = false)
    private Equipo equipoLocal;

    @ManyToOne
    @JoinColumn(name = "equipo_visitante_id", nullable = false)
    private Equipo equipoVisitante;

    private Integer golesLocal;

    private Integer golesVisitante;

    @Builder.Default
    private boolean jugado = false;

    private Integer ronda;

    @ManyToMany
    @JoinTable(
            name = "partido_jugadores",
            joinColumns = @JoinColumn(name = "partido_id"),
            inverseJoinColumns = @JoinColumn(name = "jugador_id")
    )
    @Builder.Default
    private List<Jugador> jugadores = new ArrayList<>();

    @OneToMany(mappedBy = "partido", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Estadistica> estadisticas = new ArrayList<>();
}
