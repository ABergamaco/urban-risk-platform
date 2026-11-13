package com.fiap.ec.urban_risk.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fiap.ec.urban_risk.dto.AcaoAgenteRequest;
import com.fiap.ec.urban_risk.dto.ValidacaoRequest;
import com.fiap.ec.urban_risk.model.Evento;
import com.fiap.ec.urban_risk.model.Grandeza;
import com.fiap.ec.urban_risk.model.Leitura;
import com.fiap.ec.urban_risk.model.Origem;
import com.fiap.ec.urban_risk.model.StatusEvento;
import com.fiap.ec.urban_risk.model.TipoRisco;
import com.fiap.ec.urban_risk.service.EventoService;
import com.fiap.ec.urban_risk.service.LeituraService;

@RestController
@RequestMapping("/eventos")
@CrossOrigin
public class EventoController {

    private final EventoService service;
    private final LeituraService leituraService;

    public EventoController(EventoService service, LeituraService leituraService) {
        this.service = service;
        this.leituraService = leituraService;
    }

    /** Histórico completo (ativos e encerrados), com filtros opcionais. */
    @GetMapping
    public List<Evento> listar(@RequestParam(required = false) TipoRisco tipo,
                               @RequestParam(required = false) Origem origem,
                               @RequestParam(required = false) StatusEvento status,
                               @RequestParam(required = false) Long regiaoId) {
        return service.listar(tipo, origem, status, regiaoId);
    }

    /** Relatos da comunidade aguardando validação de agente. */
    @GetMapping("/pendentes")
    public List<Evento> pendentes() {
        return service.pendentesDeValidacao();
    }

    @GetMapping("/{id}")
    public Evento buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    /** Últimas leituras da região relacionadas ao tipo do evento (para o gráfico do detalhe). */
    @GetMapping("/{id}/leituras")
    public List<Leitura> leituras(@PathVariable Long id, @RequestParam(required = false) Integer limite) {
        Evento evento = service.buscarPorId(id);
        Grandeza grandeza = switch (evento.getTipo()) {
            case ALAGAMENTO -> Grandeza.NIVEL_AGUA;
            case ILHA_DE_CALOR -> Grandeza.TEMPERATURA;
            case INTERRUPCAO_SERVICO -> Grandeza.ENERGIA;
        };
        return leituraService.listar(evento.getRegiao().getId(), grandeza, limite == null ? 20 : limite);
    }

    /** Morador ou agente confirma/contesta. Body: {"usuarioId": 1, "tipo": "CONFIRMAR"} */
    @PostMapping("/{id}/validacoes")
    public Evento validar(@PathVariable Long id, @RequestBody ValidacaoRequest req) {
        return service.validar(id, req);
    }

    /** Somente agente. Body: {"usuarioId": 3, "observacao": "Água baixou"} */
    @PutMapping("/{id}/resolver")
    public Evento resolver(@PathVariable Long id, @RequestBody AcaoAgenteRequest req) {
        return service.resolver(id, req);
    }
}
