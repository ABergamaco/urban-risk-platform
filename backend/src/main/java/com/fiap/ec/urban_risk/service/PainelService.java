package com.fiap.ec.urban_risk.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.fiap.ec.urban_risk.dto.FonteStatus;
import com.fiap.ec.urban_risk.dto.PainelResponse;
import com.fiap.ec.urban_risk.dto.RegiaoResumo;
import com.fiap.ec.urban_risk.model.Evento;
import com.fiap.ec.urban_risk.model.Grandeza;
import com.fiap.ec.urban_risk.model.Leitura;
import com.fiap.ec.urban_risk.model.Origem;
import com.fiap.ec.urban_risk.model.Regiao;
import com.fiap.ec.urban_risk.model.Sensor;
import com.fiap.ec.urban_risk.model.StatusEvento;
import com.fiap.ec.urban_risk.model.TipoRisco;
import com.fiap.ec.urban_risk.repository.EventoRepository;
import com.fiap.ec.urban_risk.repository.LeituraRepository;
import com.fiap.ec.urban_risk.repository.RegiaoRepository;
import com.fiap.ec.urban_risk.repository.RelatoRepository;
import com.fiap.ec.urban_risk.repository.SensorRepository;

/** Monta o painel de acompanhamento (tela inicial do app) e o status das fontes de dados. */
@Service
public class PainelService {

    private static final List<String> ORDEM_NIVEIS = List.of("VERMELHO", "LARANJA", "AMARELO", "INFORMATIVO");

    private final EventoRepository eventoRepository;
    private final RegiaoRepository regiaoRepository;
    private final SensorRepository sensorRepository;
    private final LeituraRepository leituraRepository;
    private final RelatoRepository relatoRepository;
    private final OpenMeteoService openMeteoService;

    public PainelService(EventoRepository eventoRepository, RegiaoRepository regiaoRepository,
                         SensorRepository sensorRepository, LeituraRepository leituraRepository,
                         RelatoRepository relatoRepository, OpenMeteoService openMeteoService) {
        this.eventoRepository = eventoRepository;
        this.regiaoRepository = regiaoRepository;
        this.sensorRepository = sensorRepository;
        this.leituraRepository = leituraRepository;
        this.relatoRepository = relatoRepository;
        this.openMeteoService = openMeteoService;
    }

    public PainelResponse montarPainel() {
        List<Evento> ativos = eventoRepository.findByStatus(StatusEvento.ATIVO);

        Map<String, Long> porTipo = new LinkedHashMap<>();
        for (TipoRisco t : TipoRisco.values()) {
            porTipo.put(t.name(), ativos.stream().filter(e -> e.getTipo() == t).count());
        }
        Map<String, Long> porNivel = new LinkedHashMap<>();
        for (String nivel : ORDEM_NIVEIS) {
            porNivel.put(nivel, ativos.stream().filter(e -> nivel.equals(e.getNivelAlerta())).count());
        }

        Evento principal = ativos.stream().max(Comparator.comparingDouble(Evento::getPrioridade)).orElse(null);

        List<RegiaoResumo> regioes = new ArrayList<>();
        for (Regiao r : regiaoRepository.findAll()) {
            regioes.add(resumir(r, ativos));
        }
        // Regiões mais críticas primeiro
        regioes.sort(Comparator.comparingInt((RegiaoResumo rr) -> ordemNivel(rr.nivelRisco()))
                .thenComparing(RegiaoResumo::nome));

        return new PainelResponse(LocalDateTime.now(), ativos.size(), porNivel.get("VERMELHO"),
                porTipo, porNivel, principal, regioes, statusFontes());
    }

    private RegiaoResumo resumir(Regiao r, List<Evento> ativos) {
        List<Evento> daRegiao = ativos.stream().filter(e -> e.getRegiao().getId().equals(r.getId())).toList();
        String nivel = daRegiao.stream()
                .map(Evento::getNivelAlerta)
                .min(Comparator.comparingInt(PainelService::ordemNivel))
                .orElse("NORMAL");

        Double temperatura = null;
        Double nivelAgua = null;
        LocalDateTime atualizado = null;
        for (Sensor s : sensorRepository.findByRegiaoId(r.getId())) {
            if (s.getGrandeza() == Grandeza.TEMPERATURA) temperatura = s.getUltimoValor();
            if (s.getGrandeza() == Grandeza.NIVEL_AGUA) nivelAgua = s.getUltimoValor();
            if (s.getUltimaLeitura() != null && (atualizado == null || s.getUltimaLeitura().isAfter(atualizado))) {
                atualizado = s.getUltimaLeitura();
            }
        }
        if (temperatura == null) temperatura = openMeteoService.getTemperatura(r.getId());
        Double chuva = openMeteoService.getChuvaMmHora(r.getId());

        return new RegiaoResumo(r.getId(), r.getNome(), r.getZona(), r.getLatitude(), r.getLongitude(),
                daRegiao.size(), nivel, arred(temperatura), arred(chuva), arred(nivelAgua), atualizado);
    }

    /** Situação de cada uma das 3 origens de dados. */
    public List<FonteStatus> statusFontes() {
        LocalDateTime agora = LocalDateTime.now();
        List<FonteStatus> fontes = new ArrayList<>();

        // 1) Sensores
        LocalDateTime ultimaSensor = leituraRepository.findFirstByOrigemOrderByDataHoraDesc(Origem.SENSOR)
                .map(Leitura::getDataHora).orElse(null);
        long totalSensores = sensorRepository.count();
        long simulados = sensorRepository.findBySimuladoTrue().size();
        fontes.add(new FonteStatus("SENSOR", "Rede de sensores", statusPorIdade(ultimaSensor, agora, 2, 10),
                ultimaSensor, totalSensores + " sensores (" + simulados + " simulados)",
                Origem.SENSOR.getConfiancaBase()));

        // 2) Base pública
        String statusPublica;
        String detalhe;
        if (!openMeteoService.isAtivo()) {
            statusPublica = "DESATIVADA";
            detalhe = "Integração desligada em application.properties";
        } else if (openMeteoService.getUltimoSucesso() == null) {
            statusPublica = openMeteoService.getUltimaTentativa() == null ? "SEM_DADOS" : "OFFLINE";
            detalhe = openMeteoService.getUltimoErro() != null ? "Sem conexão com a API" : "Aguardando primeira consulta";
        } else {
            statusPublica = statusPorIdade(openMeteoService.getUltimoSucesso(), agora, 20, 60);
            detalhe = "Temperatura e chuva atuais, a cada 10 min";
        }
        fontes.add(new FonteStatus("BASE_PUBLICA", OpenMeteoService.NOME_FONTE, statusPublica,
                openMeteoService.getUltimoSucesso(), detalhe, Origem.BASE_PUBLICA.getConfiancaBase()));

        // 3) Comunidade
        LocalDateTime ultimoRelato = relatoRepository.findFirstByOrderByCriadoEmDesc()
                .map(rel -> rel.getCriadoEm()).orElse(null);
        fontes.add(new FonteStatus("COMUNIDADE", "Relatos de moradores",
                ultimoRelato == null ? "SEM_DADOS" : "ONLINE", ultimoRelato,
                relatoRepository.count() + " relatos recebidos", Origem.COMUNIDADE.getConfiancaBase()));

        return fontes;
    }

    private static String statusPorIdade(LocalDateTime ultima, LocalDateTime agora, int minOnline, int minAtrasada) {
        if (ultima == null) return "SEM_DADOS";
        long minutos = Duration.between(ultima, agora).toMinutes();
        if (minutos < minOnline) return "ONLINE";
        if (minutos < minAtrasada) return "ATRASADA";
        return "OFFLINE";
    }

    private static int ordemNivel(String nivel) {
        int i = ORDEM_NIVEIS.indexOf(nivel);
        return i < 0 ? ORDEM_NIVEIS.size() : i;
    }

    private static Double arred(Double v) {
        return v == null ? null : Math.round(v * 10.0) / 10.0;
    }
}
