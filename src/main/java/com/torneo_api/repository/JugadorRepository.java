package com.torneo_api.repository;

import com.torneo_api.entity.Jugador;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JugadorRepository extends JpaRepository<Jugador, Long> {

    List<Jugador> findByPosicion(String posicion);
}