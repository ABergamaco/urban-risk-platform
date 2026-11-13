package com.fiap.ec.urban_risk.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fiap.ec.urban_risk.model.Grandeza;
import com.fiap.ec.urban_risk.model.Leitura;
import com.fiap.ec.urban_risk.model.Origem;

public interface LeituraRepository extends JpaRepository<Leitura, Long> {

    List<Leitura> findByRegiaoIdAndGrandezaOrderByDataHoraDesc(Long regiaoId, Grandeza grandeza, Pageable pageable);

    List<Leitura> findByRegiaoIdAndGrandezaAndOrigemOrderByDataHoraDesc(
            Long regiaoId, Grandeza grandeza, Origem origem, Pageable pageable);

    List<Leitura> findByRegiaoIdOrderByDataHoraDesc(Long regiaoId, Pageable pageable);

    List<Leitura> findAllByOrderByDataHoraDesc(Pageable pageable);

    Optional<Leitura> findFirstByRegiaoIdAndGrandezaAndOrigemOrderByDataHoraDesc(
            Long regiaoId, Grandeza grandeza, Origem origem);

    Optional<Leitura> findFirstByOrigemOrderByDataHoraDesc(Origem origem);

    /** Limpeza periódica: apaga leituras antigas para o banco não crescer sem limite. */
    @Modifying
    @Query("delete from Leitura l where l.dataHora < :limite")
    int apagarAnterioresA(@Param("limite") LocalDateTime limite);
}
