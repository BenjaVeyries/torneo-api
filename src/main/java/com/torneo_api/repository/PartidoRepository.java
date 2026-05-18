package com.torneo_api.repository;

import com.torneo_api.entity.Partido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PartidoRepository extends JpaRepository<Partido, Long> {

    List<Partido> findByTorneoId(Long torneoId);

    List<Partido> findByTorneoIdAndRonda(Long torneoId, Integer ronda);

    @Query("SELECT p FROM Partido p WHERE p.torneo.id = :torneoId AND p.jugado = :jugado")
    List<Partido> findMatchesByTorneoAndJugadoStatus(
            @Param("torneoId") Long torneoId,
            @Param("jugado") boolean jugado
    );
}
