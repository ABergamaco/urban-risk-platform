package com.fiap.ec.urban_risk.model;

import java.time.Duration;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fiap.ec.urban_risk.service.CalculoRisco;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Evento = uma ocorrência de risco (alagamento, ilha de calor ou interrupção de serviço)
 * em uma região. É o que o app mostra como "alerta".
 *
 * Todo evento informa:
 * - origem (SENSOR, BASE_PUBLICA ou COMUNIDADE) e fonte (nome legível)
 * - confianca (0-99) e nivelConfianca (ALTA / MEDIA / BAIXA)
 * - prioridade (0-100) e nivelAlerta (VERMELHO / LARANJA / AMARELO / INFORMATIVO)
 *
 * prioridade e nivelAlerta são calculados na hora (não ficam no banco),
 * porque dependem de quanto tempo passou desde o evento.
 */
@Entity
@Table(name = "eventos", indexes = {
        @Index(name = "idx_evento_status", columnList = "status"),
        @Index(name = "idx_evento_regiao_tipo", columnList = "regiao_id, tipo")
})
public class Evento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoRisco tipo;

    @ManyToOne
    @JoinColumn(name = "regiao_id", nullable = false)
    private Regiao regiao;

    @Column(nullable = false)
    private String titulo;

    @Column(length = 1000)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severidade severidade;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Origem origem;

    /** Nome legível da fonte. Ex.: "Sensor NV-PAN-01 (simulado)", "Open-Meteo", "Relato de morador (anônimo)". */
    private String fonte;

    @Column(nullable = false)
    private Integer confianca;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusEvento status;

    private Double latitude;
    private Double longitude;

    private Integer confirmacoes = 0;
    private Integer contestacoes = 0;
    private Integer fontesCorroborando = 0;
    private Boolean validadoPorAgente = false;
    private Boolean desatualizado = false;

    @Column(nullable = false)
    private LocalDateTime criadoEm;

    /** Última vez que o dado foi recebido/atualizado. */
    @Column(nullable = false)
    private LocalDateTime atualizadoEm;

    /** Última vez que o evento ficou mais grave (usado para disparar notificações). */
    @Column(nullable = false)
    private LocalDateTime escaladoEm;

    private LocalDateTime encerradoEm;

    private String observacaoAgente;

    /** Maior gravidade já atingida. Evita notificar de novo quando o valor oscila perto do limite. */
    @JsonIgnore
    private Integer pesoMaximo;

    public Evento() {}

    // ================= Campos calculados (aparecem no JSON) =================

    /**
     * Recalcula a confiança a partir das contagens. Chamado pelos services.
     * Se a confiança acabou de chegar em MÉDIA (>= 50), o evento conta como "escalado",
     * para que o app notifique os moradores (antes ele não era confiável o bastante).
     */
    public void recalcularConfianca() {
        int anterior = this.confianca == null ? 0 : this.confianca;
        this.confianca = CalculoRisco.confianca(
                origem.getConfiancaBase(),
                valor(confirmacoes), valor(contestacoes), valor(fontesCorroborando),
                Boolean.TRUE.equals(validadoPorAgente),
                Boolean.TRUE.equals(desatualizado));
        if (escaladoEm != null && anterior < CalculoRisco.CONFIANCA_MEDIA
                && this.confianca >= CalculoRisco.CONFIANCA_MEDIA) {
            this.escaladoEm = LocalDateTime.now();
        }
    }

    @JsonProperty("prioridade")
    public double getPrioridade() {
        long minutos = Duration.between(escaladoEm, LocalDateTime.now()).toMinutes();
        return CalculoRisco.prioridade(severidade.getPeso(), confianca, minutos);
    }

    @JsonProperty("nivelAlerta")
    public String getNivelAlerta() {
        if (status != StatusEvento.ATIVO) return "ENCERRADO";
        return CalculoRisco.nivelAlerta(getPrioridade());
    }

    @JsonProperty("nivelConfianca")
    public String getNivelConfianca() {
        return CalculoRisco.nivelConfianca(confianca);
    }

    @JsonProperty("tipoDescricao")
    public String getTipoDescricao() {
        return tipo.getDescricao();
    }

    @JsonProperty("origemDescricao")
    public String getOrigemDescricao() {
        return origem.getDescricao();
    }

    private static int valor(Integer i) {
        return i == null ? 0 : i;
    }

    // ================= Getters e setters =================

    public Long getId() { return id; }
    public TipoRisco getTipo() { return tipo; }
    public Regiao getRegiao() { return regiao; }
    public String getTitulo() { return titulo; }
    public String getDescricao() { return descricao; }
    public Severidade getSeveridade() { return severidade; }
    public Origem getOrigem() { return origem; }
    public String getFonte() { return fonte; }
    public Integer getConfianca() { return confianca; }
    public StatusEvento getStatus() { return status; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public Integer getConfirmacoes() { return confirmacoes; }
    public Integer getContestacoes() { return contestacoes; }
    public Integer getFontesCorroborando() { return fontesCorroborando; }
    public Boolean getValidadoPorAgente() { return validadoPorAgente; }
    public Boolean getDesatualizado() { return desatualizado; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
    public LocalDateTime getAtualizadoEm() { return atualizadoEm; }
    public LocalDateTime getEscaladoEm() { return escaladoEm; }
    public LocalDateTime getEncerradoEm() { return encerradoEm; }
    public String getObservacaoAgente() { return observacaoAgente; }
    public Integer getPesoMaximo() { return pesoMaximo; }

    public void setId(Long id) { this.id = id; }
    public void setTipo(TipoRisco tipo) { this.tipo = tipo; }
    public void setRegiao(Regiao regiao) { this.regiao = regiao; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public void setSeveridade(Severidade severidade) { this.severidade = severidade; }
    public void setOrigem(Origem origem) { this.origem = origem; }
    public void setFonte(String fonte) { this.fonte = fonte; }
    public void setConfianca(Integer confianca) { this.confianca = confianca; }
    public void setStatus(StatusEvento status) { this.status = status; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public void setConfirmacoes(Integer confirmacoes) { this.confirmacoes = confirmacoes; }
    public void setContestacoes(Integer contestacoes) { this.contestacoes = contestacoes; }
    public void setFontesCorroborando(Integer fontesCorroborando) { this.fontesCorroborando = fontesCorroborando; }
    public void setValidadoPorAgente(Boolean validadoPorAgente) { this.validadoPorAgente = validadoPorAgente; }
    public void setDesatualizado(Boolean desatualizado) { this.desatualizado = desatualizado; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }
    public void setAtualizadoEm(LocalDateTime atualizadoEm) { this.atualizadoEm = atualizadoEm; }
    public void setEscaladoEm(LocalDateTime escaladoEm) { this.escaladoEm = escaladoEm; }
    public void setEncerradoEm(LocalDateTime encerradoEm) { this.encerradoEm = encerradoEm; }
    public void setObservacaoAgente(String observacaoAgente) { this.observacaoAgente = observacaoAgente; }
    public void setPesoMaximo(Integer pesoMaximo) { this.pesoMaximo = pesoMaximo; }
}
