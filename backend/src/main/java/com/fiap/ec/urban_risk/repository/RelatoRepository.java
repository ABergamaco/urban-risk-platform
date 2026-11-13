package com.fiap.ec.urban_risk.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fiap.ec.urban_risk.model.Relato;

public interface RelatoRepository extends JpaRepository<Relato, Long> {

    List<Relato> findByEventoIdOrderByCriadoEmDesc(Long eventoId);

    boolean existsByEventoIdAndAutorId(Long eventoId, Long autorId);

    long countByEventoId(Long eventoId);

    Optional<Relato> findFirstByOrderByCriadoEmDesc();
}
