package com.fiap.ec.urban_risk.service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.fiap.ec.urban_risk.exception.DadosInvalidosException;
import com.fiap.ec.urban_risk.exception.RecursoNaoEncontradoException;
import com.fiap.ec.urban_risk.model.Evento;
import com.fiap.ec.urban_risk.model.Grandeza;
import com.fiap.ec.urban_risk.model.Origem;
import com.fiap.ec.urban_risk.model.Regiao;
import com.fiap.ec.urban_risk.model.Sensor;
import com.fiap.ec.urban_risk.model.StatusEvento;
import com.fiap.ec.urban_risk.model.TipoRisco;
import com.fiap.ec.urban_risk.repository.EventoRepository;
import com.fiap.ec.urban_risk.repository.SensorRepository;

/**
 * SENSORES SIMULADOS (o enunciado permite "reais ou simulados").
 *
 * A cada 15 s gera uma leitura para cada sensor com simulado = true:
 * - NIVEL_AGUA: tende a um nível "normal" da região, com ruído. Se a base pública
 *   indicar chuva, o nível sobe. Regiões propensas a alagamento têm pancadas aleatórias.
 * - TEMPERATURA: temperatura REAL da cidade (Open-Meteo) + efeito ilha de calor da região.
 *   Sem internet, usa um ciclo diário aproximado.
 * - ENERGIA: normal (1), com pequena chance de queda (0) por alguns minutos.
 *
 * disparar(...) força um cenário crítico, para demonstrar alertas e notificações ao vivo.
 */
@Service
public class SimuladorSensores {

    private final SensorRepository sensorRepository;
    private final EventoRepository eventoRepository;
    private final LeituraService leituraService;
    private final OpenMeteoService openMeteoService;
    private final boolean ativo;

    private final Map<Long, Double> nivelAgua = new ConcurrentHashMap<>();
    private final Map<Long, Integer> ciclosSemEnergia = new ConcurrentHashMap<>();
    private final Map<Long, Integer> ciclosOndaDeCalor = new ConcurrentHashMap<>();
    private final Map<Long, Integer> ciclosSubidaGradual = new ConcurrentHashMap<>();

    public SimuladorSensores(SensorRepository sensorRepository,
                             EventoRepository eventoRepository,
                             LeituraService leituraService,
                             OpenMeteoService openMeteoService,
                             @Value("${urbanrisk.simulador.ativo:true}") boolean ativo) {
        this.sensorRepository = sensorRepository;
        this.eventoRepository = eventoRepository;
        this.leituraService = leituraService;
        this.openMeteoService = openMeteoService;
        this.ativo = ativo;
    }

    @Scheduled(initialDelayString = "${urbanrisk.simulador.atraso-inicial-ms:8000}",
               fixedDelayString = "${urbanrisk.simulador.intervalo-ms:15000}")
    public void gerarLeituras() {
        if (!ativo) return;
        for (Sensor sensor : sensorRepository.findBySimuladoTrue()) {
            gerarLeitura(sensor);
        }
    }

    private void gerarLeitura(Sensor sensor) {
        double valor = switch (sensor.getGrandeza()) {
            case NIVEL_AGUA -> proximoNivelAgua(sensor);
            case TEMPERATURA -> proximaTemperatura(sensor);
            case ENERGIA -> proximoStatusEnergia(sensor);
            case PRECIPITACAO -> 0.0; // chuva vem da base pública, não de sensor
        };
        leituraService.registrar(sensor.getRegiao(), sensor, Origem.SENSOR, sensor.getGrandeza(),
                valor, LeituraService.nomeFonte(sensor));
    }

    private double proximoNivelAgua(Sensor sensor) {
        Regiao r = sensor.getRegiao();
        boolean propensa = Boolean.TRUE.equals(r.getPropensaAlagamento());
        double atual = nivelAgua.computeIfAbsent(sensor.getId(),
                id -> sensor.getUltimoValor() != null ? sensor.getUltimoValor() : 3.0);

        double chuva = valorOuZero(openMeteoService.getChuvaMmHora(r.getId()));
        double alvo = (propensa ? 8.0 : 2.0) + chuva * (propensa ? 3.0 : 1.0);

        int subida = ciclosSubidaGradual.getOrDefault(sensor.getId(), 0);
        if (subida > 0) {
            // Cenário de demonstração: chuva forte contínua, água sobe ~12 cm/min
            ciclosSubidaGradual.put(sensor.getId(), subida - 1);
            double v = Math.min(150, atual + aleatorio(2.5, 3.5));
            nivelAgua.put(sensor.getId(), v);
            return v;
        }

        double novo = atual + (alvo - atual) * 0.02 + aleatorio(-1.5, 1.5);
        if (propensa && ThreadLocalRandom.current().nextDouble() < 0.004) {
            novo += aleatorio(20, 35); // pancada de chuva localizada
        }
        novo = Math.max(0, Math.min(150, novo));
        nivelAgua.put(sensor.getId(), novo);
        return novo;
    }

    private double proximaTemperatura(Sensor sensor) {
        Regiao r = sensor.getRegiao();
        Double cidade = openMeteoService.getTemperatura(r.getId());
        double base = cidade != null ? cidade : cicloDiario();
        double efeito = valorOuZero(r.getEfeitoIlhaCalor());

        int onda = ciclosOndaDeCalor.getOrDefault(sensor.getId(), 0);
        double extra = 0;
        if (onda > 0) {
            ciclosOndaDeCalor.put(sensor.getId(), onda - 1);
            // Onda de calor: pelo menos +9 °C, e no mínimo 37,5 °C no total (nível ALTA)
            extra = Math.max(9.0, 37.5 - (base + efeito));
        }
        return base + efeito + extra + aleatorio(-0.4, 0.4);
    }

    private double proximoStatusEnergia(Sensor sensor) {
        int restantes = ciclosSemEnergia.getOrDefault(sensor.getId(), 0);
        if (restantes > 0) {
            ciclosSemEnergia.put(sensor.getId(), restantes - 1);
            return 0;
        }
        if (ThreadLocalRandom.current().nextDouble() < 0.002) {
            ciclosSemEnergia.put(sensor.getId(), ThreadLocalRandom.current().nextInt(8, 20));
            return 0;
        }
        return 1;
    }

    /**
     * DEMONSTRAÇÃO: força um cenário crítico em uma região e gera a leitura na hora.
     * POST /simulador/eventos {"regiaoId": 1, "tipo": "ALAGAMENTO"}
     */
    public Evento disparar(Long regiaoId, TipoRisco tipo) {
        return disparar(regiaoId, tipo, null);
    }

    public Evento disparar(Long regiaoId, TipoRisco tipo, String modo) {
        boolean gradual = "GRADUAL".equalsIgnoreCase(modo) && tipo == TipoRisco.ALAGAMENTO;
        if (regiaoId == null || tipo == null) {
            throw new DadosInvalidosException("Informe regiaoId e tipo.");
        }
        Grandeza grandeza = switch (tipo) {
            case ALAGAMENTO -> Grandeza.NIVEL_AGUA;
            case ILHA_DE_CALOR -> Grandeza.TEMPERATURA;
            case INTERRUPCAO_SERVICO -> Grandeza.ENERGIA;
        };
        Sensor sensor = sensorRepository.findFirstByRegiaoIdAndGrandeza(regiaoId, grandeza)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Não há sensor de " + grandeza + " nesta região."));
        if (!Boolean.TRUE.equals(sensor.getSimulado())) {
            throw new DadosInvalidosException("Só é possível disparar cenários em sensores simulados.");
        }

        switch (tipo) {
            case ALAGAMENTO -> {
                if (gradual) {
                    // começa um pouco acima do limite BAIXA e sobe por ~30 ciclos (7,5 min)
                    nivelAgua.put(sensor.getId(), Math.max(nivelAgua.getOrDefault(sensor.getId(), 0.0), 16.0));
                    ciclosSubidaGradual.put(sensor.getId(), 30);
                } else {
                    nivelAgua.put(sensor.getId(), aleatorio(84, 95));
                }
            }
            case ILHA_DE_CALOR -> ciclosOndaDeCalor.put(sensor.getId(), 40);   // ~10 min
            case INTERRUPCAO_SERVICO -> ciclosSemEnergia.put(sensor.getId(), 40);
        }

        if (tipo == TipoRisco.ALAGAMENTO && !gradual) {
            // Gera a leitura com o valor forçado (sem aplicar a "descida" do próximo ciclo)
            leituraService.registrar(sensor.getRegiao(), sensor, Origem.SENSOR, grandeza,
                    nivelAgua.get(sensor.getId()), LeituraService.nomeFonte(sensor));
        } else {
            gerarLeitura(sensor);
        }

        Evento evento = eventoRepository.findFirstByStatusAndRegiaoIdAndTipoAndOrigem(
                        StatusEvento.ATIVO, regiaoId, tipo, Origem.SENSOR)
                .orElseThrow(() -> new DadosInvalidosException(
                        "A leitura gerada não ultrapassou o limite de alerta. Tente novamente."));
        // Na demonstração, sempre conta como alerta novo (para a notificação aparecer de novo)
        evento.setEscaladoEm(LocalDateTime.now());
        return eventoRepository.save(evento);
    }

    /** Sem internet: temperatura aproximada de São Paulo ao longo do dia (mín. ~18 °C às 3h, máx. ~30 °C às 15h). */
    private static double cicloDiario() {
        double hora = LocalTime.now().getHour() + LocalTime.now().getMinute() / 60.0;
        return 24.0 + 6.0 * Math.sin(2 * Math.PI * (hora - 9.0) / 24.0);
    }

    private static double aleatorio(double min, double max) {
        return ThreadLocalRandom.current().nextDouble(min, max);
    }

    private static double valorOuZero(Double v) {
        return v == null ? 0.0 : v;
    }
}
