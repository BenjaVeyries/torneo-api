package com.torneo_api.repository;

import com.torneo_api.entity.Estadistica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EstadisticaRepository extends JpaRepository<Estadistica, Long> {

    List<Estadistica> findByPartidoId(Long partidoId);

    Optional<Estadistica> findByPartidoIdAndJugadorId(Long partidoId, Long jugadorId);

    // Consulta para verificar si un jugador ya tiene estadísticas registradas en un torneo específico
    List<Estadistica> findByJugadorIdAndPartidoTorneoId(Long jugadorId, Long torneoId);

    // Consulta personalizada para calcular los goleadores de un torneo
    @Query("SELECT e.jugador, SUM(e.goles) as totalGoles " +
           "FROM Estadistica e " +
           "WHERE e.partido.torneo.id = :torneoId " +
           "GROUP BY e.jugador " +
           "ORDER BY totalGoles DESC")
    List<Object[]> findTopScorersByTorneoId(@Param("torneoId") Long torneoId);
}
