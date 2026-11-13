package com.fiap.ec.urban_risk.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.fiap.ec.urban_risk.dto.LeituraRequest;
import com.fiap.ec.urban_risk.model.Grandeza;
import com.fiap.ec.urban_risk.model.Leitura;
import com.fiap.ec.urban_risk.model.Sensor;
import com.fiap.ec.urban_risk.repository.SensorRepository;
import com.fiap.ec.urban_risk.service.LeituraService;

@RestController
@CrossOrigin
public class LeituraController {

    private final LeituraService service;
    private final SensorRepository sensorRepository;

    public LeituraController(LeituraService service, SensorRepository sensorRepository) {
        this.service = service;
        this.sensorRepository = sensorRepository;
    }

    /** GET /leituras?regiaoId=1&grandeza=NIVEL_AGUA&limite=30 */
    @GetMapping("/leituras")
    public List<Leitura> listar(@RequestParam(required = false) Long regiaoId,
                                @RequestParam(required = false) Grandeza grandeza,
                                @RequestParam(required = false) Integer limite) {
        return service.listar(regiaoId, grandeza, limite);
    }

    /** Entrada para sensor REAL. Body: {"codigoSensor": "NV-PAN-01", "valor": 42.5} */
    @PostMapping("/leituras")
    @ResponseStatus(HttpStatus.CREATED)
    public Leitura receber(@RequestBody LeituraRequest req) {
        return service.receberDeSensor(req);
    }

    @GetMapping("/sensores")
    public List<Sensor> sensores() {
        return sensorRepository.findAll();
    }
}
