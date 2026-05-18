package com.torneo_api.repository;

import com.torneo_api.entity.Equipo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EquipoRepository extends JpaRepository<Equipo, Long> {

    List<Equipo> findByCiudad(String ciudad);
}