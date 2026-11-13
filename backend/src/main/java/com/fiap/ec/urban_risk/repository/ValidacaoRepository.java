package com.fiap.ec.urban_risk.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fiap.ec.urban_risk.model.Validacao;

public interface ValidacaoRepository extends JpaRepository<Validacao, Long> {

    boolean existsByEventoIdAndUsuarioId(Long eventoId, Long usuarioId);
}
