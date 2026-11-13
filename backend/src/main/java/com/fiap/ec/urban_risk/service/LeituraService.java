package com.fiap.ec.urban_risk.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fiap.ec.urban_risk.dto.LeituraRequest;
import com.fiap.ec.urban_risk.exception.DadosInvalidosException;
import com.fiap.ec.urban_risk.exception.RecursoNaoEncontradoException;
import com.fiap.ec.urban_risk.model.Grandeza;
import com.fiap.ec.urban_risk.model.Leitura;
import com.fiap.ec.urban_risk.model.Origem;
import com.fiap.ec.urban_risk.model.Regiao;
import com.fiap.ec.urban_risk.model.Sensor;
import com.fiap.ec.urban_risk.model.TipoRisco;
import com.fiap.ec.urban_risk.repository.LeituraRepository;
import com.fiap.ec.urban_risk.repository.SensorRepository;

/**
 * Recebe dados brutos (leituras) de sensores e bases públicas, guarda no banco
 * e aplica as regras de CalculoRisco para decidir se viram alerta.
 */
@Service
public class LeituraService {

    private final LeituraRepository leituraRepository;
    private final SensorRepository sensorRepository;
    private final EventoService eventoService;

    public LeituraService(LeituraRepository leituraRepository,
                          SensorRepository sensorRepository,
                          EventoService eventoService) {
        this.leituraRepository = leituraRepository;
        this.sensorRepository = sensorRepository;
        this.eventoService = eventoService;
    }

    /** Entrada para sensores REAIS: POST /leituras {"codigoSensor": "...", "valor": 0.0} */
    @Transactional
    public Leitura receberDeSensor(LeituraRequest req) {
        if (req.codigoSensor() == null || req.codigoSensor().isBlank()) {
            throw new DadosInvalidosException("Informe o codigoSensor.");
        }
        if (req.valor() == null || req.valor().isNaN()) {
            throw new DadosInvalidosException("Informe o valor da leitura.");
        }
        Sensor sensor = sensorRepository.findByCodigo(req.codigoSensor().trim())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Sensor não cadastrado: " + req.codigoSensor()));
        return registrar(sensor.getRegiao(), sensor, Origem.SENSOR, sensor.getGrandeza(), req.valor(), nomeFonte(sensor));
    }

    /** Ponto único de entrada de qualquer leitura (sensor simulado, sensor real ou base pública). */
    @Transactional
    public Leitura registrar(Regiao regiao, Sensor sensor, Origem origem, Grandeza grandeza,
                             double valor, String fonte) {
        LocalDateTime agora = LocalDateTime.now();
        double valorArredondado = Math.round(valor * 10.0) / 10.0;
        Leitura leitura = leituraRepository.save(
                new Leitura(regiao, sensor, origem, grandeza, valorArredondado, fonte, agora));

        if (sensor != null) {
            sensor.setUltimoValor(valorArredondado);
            sensor.setUltimaLeitura(agora);
            sensorRepository.save(sensor);
        }
        avaliar(leitura);
        return leitura;
    }

    /** Aplica a regra da grandeza e cria/atualiza/encerra o evento correspondente. */
    private void avaliar(Leitura l) {
        double v = l.getValor();
        int peso = switch (l.getGrandeza()) {
            case NIVEL_AGUA -> CalculoRisco.severidadeNivelAgua(v);
            case PRECIPITACAO -> CalculoRisco.severidadePrecipitacao(v);
            case TEMPERATURA -> CalculoRisco.severidadeTemperatura(v);
            case ENERGIA -> CalculoRisco.severidadeEnergia(v);
        };
        TipoRisco tipo = l.getGrandeza().getRiscoRelacionado();
        Regiao r = l.getRegiao();

        if (peso == 0) {
            eventoService.normalizar(r, tipo, l.getOrigem(),
                    l.getFonte() + " voltou a registrar " + formatar(l) + ".");
            return;
        }

        String limite = CalculoRisco.limiteTexto(l.getGrandeza().name(), peso);
        String titulo;
        String descricao;
        switch (l.getGrandeza()) {
            case NIVEL_AGUA -> {
                titulo = "Alagamento em " + r.getNome();
                descricao = l.getFonte() + " mediu " + formatar(l) + " de água na via (limite deste nível: "
                        + limite + "). Evite a região e não atravesse áreas alagadas.";
            }
            case PRECIPITACAO -> {
                titulo = "Chuva forte em " + r.getNome();
                descricao = l.getFonte() + " indica chuva de " + formatar(l) + "/h (limite deste nível: "
                        + limite + "). Risco de alagamento nas próximas horas.";
            }
            case TEMPERATURA -> {
                titulo = "Calor extremo em " + r.getNome();
                descricao = l.getFonte() + " registrou " + formatar(l) + " (limite deste nível: " + limite
                        + "). Beba água, evite sol entre 10h e 16h e procure locais frescos.";
            }
            default -> {
                titulo = "Falta de energia em " + r.getNome();
                descricao = l.getFonte() + " detectou interrupção no fornecimento de energia elétrica.";
            }
        }
        eventoService.registrarPorRegra(r, tipo, l.getOrigem(), l.getFonte(), peso, titulo, descricao);
    }

    public List<Leitura> listar(Long regiaoId, Grandeza grandeza, Integer limite) {
        int max = (limite == null || limite <= 0) ? 30 : Math.min(limite, 200);
        PageRequest pagina = PageRequest.of(0, max);
        if (regiaoId != null && grandeza != null) {
            return leituraRepository.findByRegiaoIdAndGrandezaOrderByDataHoraDesc(regiaoId, grandeza, pagina);
        }
        if (regiaoId != null) {
            return leituraRepository.findByRegiaoIdOrderByDataHoraDesc(regiaoId, pagina);
        }
        return leituraRepository.findAllByOrderByDataHoraDesc(pagina);
    }

    public static String nomeFonte(Sensor sensor) {
        return "Sensor " + sensor.getCodigo() + (Boolean.TRUE.equals(sensor.getSimulado()) ? " (simulado)" : "");
    }

    private static String formatar(Leitura l) {
        return switch (l.getGrandeza()) {
            case ENERGIA -> l.getValor() >= 0.5 ? "energia normal" : "falta de energia";
            default -> String.format(Locale.forLanguageTag("pt-BR"), "%.1f %s", l.getValor(), l.getUnidade());
        };
    }
}
