package com.fiap.ec.urban_risk.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fiap.ec.urban_risk.dto.NovosAlertasResponse;
import com.fiap.ec.urban_risk.model.Evento;
import com.fiap.ec.urban_risk.model.TipoRisco;
import com.fiap.ec.urban_risk.service.EventoService;

/** Alertas = eventos ATIVOS, já ordenados por prioridade. */
@RestController
@RequestMapping("/alertas")
@CrossOrigin
public class AlertaController {

    private final EventoService service;

    public AlertaController(EventoService service) {
        this.service = service;
    }

    /** GET /alertas?tipo=ALAGAMENTO&regiaoId=1&confiancaMinima=50&limite=20 */
    @GetMapping
    public List<Evento> listar(@RequestParam(required = false) TipoRisco tipo,
                               @RequestParam(required = false) Long regiaoId,
                               @RequestParam(required = false) Integer confiancaMinima,
                               @RequestParam(required = false) Integer limite) {
        return service.alertasPriorizados(tipo, regiaoId, confiancaMinima, limite);
    }

    /** GET /alertas/novos?desde=2026-11-12T10:00:00 -> usado pelo app para notificações. */
    @GetMapping("/novos")
    public NovosAlertasResponse novos(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde) {
        return service.novosAlertas(desde);
    }
}
