package com.fiap.ec.urban_risk.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fiap.ec.urban_risk.model.Evento;
import com.fiap.ec.urban_risk.model.Origem;
import com.fiap.ec.urban_risk.model.StatusEvento;
import com.fiap.ec.urban_risk.model.TipoRisco;

public interface EventoRepository extends JpaRepository<Evento, Long> {

    List<Evento> findByStatus(StatusEvento status);

    List<Evento> findByStatusAndRegiaoIdAndTipo(StatusEvento status, Long regiaoId, TipoRisco tipo);

    Optional<Evento> findFirstByStatusAndRegiaoIdAndTipoAndOrigem(
            StatusEvento status, Long regiaoId, TipoRisco tipo, Origem origem);

    List<Evento> findByStatusAndOrigemAndAtualizadoEmBefore(
            StatusEvento status, Origem origem, LocalDateTime limite);

    List<Evento> findByStatusAndEscaladoEmAfter(StatusEvento status, LocalDateTime desde);

    List<Evento> findByStatusAndOrigemAndValidadoPorAgenteFalseOrderByCriadoEmDesc(
            StatusEvento status, Origem origem);

    List<Evento> findAllByOrderByAtualizadoEmDesc();

    List<Evento> findByCriadoEmAfter(LocalDateTime desde);
}
