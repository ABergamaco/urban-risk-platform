package com.fiap.ec.urban_risk;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.fiap.ec.urban_risk.dto.RelatoRequest;
import com.fiap.ec.urban_risk.model.Evento;
import com.fiap.ec.urban_risk.model.Origem;
import com.fiap.ec.urban_risk.model.Regiao;
import com.fiap.ec.urban_risk.model.Severidade;
import com.fiap.ec.urban_risk.model.TipoRisco;
import com.fiap.ec.urban_risk.model.Usuario;
import com.fiap.ec.urban_risk.repository.RegiaoRepository;
import com.fiap.ec.urban_risk.repository.UsuarioRepository;
import com.fiap.ec.urban_risk.service.EventoService;
import com.fiap.ec.urban_risk.service.RelatoService;
import com.fiap.ec.urban_risk.service.SimuladorSensores;

/**
 * Teste de integração do fluxo principal (banco em memória, sem chamar a internet):
 * sensor detecta alagamento -> morador relata o mesmo -> confiança sobe por cruzamento de fontes.
 */
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:teste;DB_CLOSE_DELAY=-1",
        "urbanrisk.simulador.ativo=false",
        "urbanrisk.openmeteo.ativo=false"
})
class FluxoPlataformaTest {

    @Autowired private RegiaoRepository regiaoRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private SimuladorSensores simulador;
    @Autowired private RelatoService relatoService;
    @Autowired private EventoService eventoService;

    @Test
    void sensorERelatoDaMesmaRegiaoSeConfirmam() {
        Regiao se = regiaoRepository.findAll().stream()
                .filter(r -> r.getNome().equals("Sé")).findFirst().orElseThrow();
        Usuario morador = usuarioRepository.findByEmailIgnoreCase("morador@demo.com").orElseThrow();

        // 1) Sensor simulado detecta alagamento crítico
        Evento sensor = simulador.disparar(se.getId(), TipoRisco.ALAGAMENTO);
        assertEquals(Origem.SENSOR, sensor.getOrigem());
        assertEquals(Severidade.CRITICA, sensor.getSeveridade());
        assertEquals("VERMELHO", sensor.getNivelAlerta());

        // 2) Morador relata alagamento na mesma região
        Evento relato = relatoService.criar(new RelatoRequest(morador.getId(), se.getId(), TipoRisco.ALAGAMENTO,
                "Água subindo rápido na Praça da Sé, ônibus parados.", Severidade.ALTA, null, null));
        assertEquals(Origem.COMUNIDADE, relato.getOrigem());
        assertEquals(1, relato.getFontesCorroborando());
        assertEquals(50, relato.getConfianca()); // 35 base + 15 do sensor que confirma

        // 3) Alertas vêm ordenados por prioridade
        List<Evento> alertas = eventoService.alertasPriorizados(null, null, null, null);
        assertFalse(alertas.isEmpty());
        for (int i = 1; i < alertas.size(); i++) {
            assertTrue(alertas.get(i - 1).getPrioridade() >= alertas.get(i).getPrioridade());
        }
    }
}
