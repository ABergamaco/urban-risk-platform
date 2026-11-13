package com.fiap.ec.urban_risk.service;

import java.net.http.HttpClient;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fiap.ec.urban_risk.model.Grandeza;
import com.fiap.ec.urban_risk.model.Origem;
import com.fiap.ec.urban_risk.model.Regiao;
import com.fiap.ec.urban_risk.repository.RegiaoRepository;

/**
 * BASE PÚBLICA: busca dados REAIS de clima na API gratuita Open-Meteo
 * (https://open-meteo.com, sem cadastro e sem chave de API).
 *
 * A cada 10 minutos, para cada região: temperatura atual e chuva.
 * Cada valor vira uma Leitura de origem BASE_PUBLICA e passa pelas mesmas regras
 * dos sensores (chuva forte -> risco de alagamento; calor -> ilha de calor).
 *
 * Se a API estiver fora do ar ou sem internet, o sistema continua funcionando
 * com os sensores e relatos, e o painel mostra a fonte como OFFLINE.
 */
@Service
public class OpenMeteoService {

    private static final Logger log = LoggerFactory.getLogger(OpenMeteoService.class);
    public static final String NOME_FONTE = "Open-Meteo (dados reais)";

    private final RegiaoRepository regiaoRepository;
    private final LeituraService leituraService;
    private final RestClient restClient;
    private final String url;
    private final boolean ativo;

    // Estado da fonte (mostrado em GET /fontes)
    private volatile LocalDateTime ultimoSucesso;
    private volatile LocalDateTime ultimaTentativa;
    private volatile String ultimoErro;

    // Últimos valores por região (usados pelo simulador e pelo painel)
    private final Map<Long, Double> temperaturaPorRegiao = new ConcurrentHashMap<>();
    private final Map<Long, Double> chuvaPorRegiao = new ConcurrentHashMap<>();

    public OpenMeteoService(RegiaoRepository regiaoRepository,
                            LeituraService leituraService,
                            @Value("${urbanrisk.openmeteo.url}") String url,
                            @Value("${urbanrisk.openmeteo.ativo:true}") boolean ativo) {
        this.regiaoRepository = regiaoRepository;
        this.leituraService = leituraService;
        this.ativo = ativo;
        this.url = url;

        HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(httpClient);
        factory.setReadTimeout(Duration.ofSeconds(10));
        this.restClient = RestClient.builder().requestFactory(factory).build();
    }

    @Scheduled(initialDelayString = "${urbanrisk.openmeteo.atraso-inicial-ms:5000}",
               fixedDelayString = "${urbanrisk.openmeteo.intervalo-ms:600000}")
    public void atualizar() {
        if (!ativo) return;
        List<Regiao> regioes = regiaoRepository.findAll();
        if (regioes.isEmpty()) return;

        ultimaTentativa = LocalDateTime.now();
        int sucessos = 0;
        for (Regiao regiao : regioes) {
            try {
                RespostaOpenMeteo resposta = restClient.get()
                        .uri(url + "?latitude={lat}&longitude={lon}&current=temperature_2m,precipitation&timezone=auto",
                                regiao.getLatitude(), regiao.getLongitude())
                        .retrieve()
                        .body(RespostaOpenMeteo.class);

                if (resposta == null || resposta.current() == null) continue;
                Atual atual = resposta.current();

                if (atual.temperatura() != null) {
                    temperaturaPorRegiao.put(regiao.getId(), atual.temperatura());
                    leituraService.registrar(regiao, null, Origem.BASE_PUBLICA, Grandeza.TEMPERATURA,
                            atual.temperatura(), NOME_FONTE);
                }
                if (atual.precipitacao() != null) {
                    // "precipitation" do bloco current = chuva dos últimos 15 min.
                    // Multiplicamos por 4 para estimar a intensidade em mm/h.
                    double mmPorHora = atual.precipitacao() * 4.0;
                    chuvaPorRegiao.put(regiao.getId(), mmPorHora);
                    leituraService.registrar(regiao, null, Origem.BASE_PUBLICA, Grandeza.PRECIPITACAO,
                            mmPorHora, NOME_FONTE);
                }
                sucessos++;
            } catch (Exception e) {
                ultimoErro = e.getClass().getSimpleName() + ": " + e.getMessage();
                log.warn("Open-Meteo indisponível para {}: {}", regiao.getNome(), e.getMessage());
            }
        }
        if (sucessos > 0) {
            ultimoSucesso = LocalDateTime.now();
            ultimoErro = null;
            log.info("Open-Meteo: dados atualizados para {} de {} regiões.", sucessos, regioes.size());
        }
    }

    public Double getTemperatura(Long regiaoId) { return temperaturaPorRegiao.get(regiaoId); }
    public Double getChuvaMmHora(Long regiaoId) { return chuvaPorRegiao.get(regiaoId); }
    public LocalDateTime getUltimoSucesso() { return ultimoSucesso; }
    public LocalDateTime getUltimaTentativa() { return ultimaTentativa; }
    public String getUltimoErro() { return ultimoErro; }
    public boolean isAtivo() { return ativo; }

    // ===== Formato da resposta JSON da Open-Meteo (só os campos usados) =====

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record RespostaOpenMeteo(Atual current) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Atual(
            String time,
            @JsonProperty("temperature_2m") Double temperatura,
            @JsonProperty("precipitation") Double precipitacao) {}
}
