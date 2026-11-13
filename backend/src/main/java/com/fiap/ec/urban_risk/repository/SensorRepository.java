package com.fiap.ec.urban_risk.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fiap.ec.urban_risk.model.Grandeza;
import com.fiap.ec.urban_risk.model.Sensor;

public interface SensorRepository extends JpaRepository<Sensor, Long> {

    Optional<Sensor> findByCodigo(String codigo);

    List<Sensor> findBySimuladoTrue();

    Optional<Sensor> findFirstByRegiaoIdAndGrandeza(Long regiaoId, Grandeza grandeza);

    List<Sensor> findByRegiaoId(Long regiaoId);
}
