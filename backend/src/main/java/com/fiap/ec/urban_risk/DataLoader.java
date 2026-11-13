package com.fiap.ec.urban_risk;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.fiap.ec.urban_risk.dto.CadastroUsuarioRequest;
import com.fiap.ec.urban_risk.dto.RelatoRequest;
import com.fiap.ec.urban_risk.dto.ValidacaoRequest;
import com.fiap.ec.urban_risk.model.Evento;
import com.fiap.ec.urban_risk.model.Grandeza;
import com.fiap.ec.urban_risk.model.Perfil;
import com.fiap.ec.urban_risk.model.Regiao;
import com.fiap.ec.urban_risk.model.Sensor;
import com.fiap.ec.urban_risk.model.Severidade;
import com.fiap.ec.urban_risk.model.TipoRisco;
import com.fiap.ec.urban_risk.model.TipoValidacao;
import com.fiap.ec.urban_risk.model.Usuario;
import com.fiap.ec.urban_risk.repository.RegiaoRepository;
import com.fiap.ec.urban_risk.repository.SensorRepository;
import com.fiap.ec.urban_risk.service.EventoService;
import com.fiap.ec.urban_risk.service.RelatoService;
import com.fiap.ec.urban_risk.service.UsuarioService;

/**
 * DataLoader: executado automaticamente ao iniciar o backend.
 *
 * Só cria os dados de exemplo se o banco estiver vazio (nenhuma região),
 * então é seguro reiniciar o servidor sem duplicar dados.
 *
 * Cria: 6 regiões de São Paulo, 18 sensores simulados, 3 usuários de teste
 * e 4 relatos comunitários (passando pelas mesmas regras da API).
 */
@Component
public class DataLoader implements CommandLineRunner {

    private final RegiaoRepository regiaoRepository;
    private final SensorRepository sensorRepository;
    private final UsuarioService usuarioService;
    private final RelatoService relatoService;
    private final EventoService eventoService;
    private final String codigoAgente;

    public DataLoader(RegiaoRepository regiaoRepository, SensorRepository sensorRepository,
                      UsuarioService usuarioService, RelatoService relatoService,
                      EventoService eventoService,
                      @Value("${urbanrisk.agente.codigo}") String codigoAgente) {
        this.regiaoRepository = regiaoRepository;
        this.sensorRepository = sensorRepository;
        this.usuarioService = usuarioService;
        this.relatoService = relatoService;
        this.eventoService = eventoService;
        this.codigoAgente = codigoAgente;
    }

    @Override
    public void run(String... args) {
        if (regiaoRepository.count() > 0) {
            System.out.println("DataLoader: dados já existem, pulando seed.");
            return;
        }

        // ---------- Regiões (nome, zona, lat, lon, efeito ilha de calor °C, propensa a alagamento) ----------
        Regiao pantanal = new Regiao("Jardim Pantanal", "Zona Leste", -23.4975, -46.4260, 0.5, true);
        Regiao se = new Regiao("Sé", "Centro", -23.5503, -46.6340, 4.5, false);
        Regiao bras = new Regiao("Brás", "Centro", -23.5440, -46.6160, 4.0, false);
        Regiao lapa = new Regiao("Lapa", "Zona Oeste", -23.5220, -46.7020, 1.5, true);
        Regiao ipiranga = new Regiao("Ipiranga", "Zona Sul", -23.5880, -46.6070, 2.0, true);
        Regiao capao = new Regiao("Capão Redondo", "Zona Sul", -23.6700, -46.7790, 1.0, false);
        regiaoRepository.saveAll(List.of(pantanal, se, bras, lapa, ipiranga, capao));

        // ---------- Sensores simulados: nível da água, temperatura e energia em cada região ----------
        criarSensores(pantanal, "PAN", 58.0); // Jardim Pantanal já começa alagado (demonstração)
        criarSensores(se, "SE", 2.0);
        criarSensores(bras, "BRA", 2.0);
        criarSensores(lapa, "LAP", 10.0);
        criarSensores(ipiranga, "IPI", 6.0);
        criarSensores(capao, "CAP", 2.0);

        // ---------- Usuários de teste (senha: 123456) ----------
        Usuario maria = usuarioService.cadastrar(new CadastroUsuarioRequest(
                "Maria Souza", "morador@demo.com", "123456", Perfil.MORADOR, pantanal.getId(), null));
        Usuario joao = usuarioService.cadastrar(new CadastroUsuarioRequest(
                "João Lima", "vizinho@demo.com", "123456", Perfil.MORADOR, lapa.getId(), null));
        Usuario carla = usuarioService.cadastrar(new CadastroUsuarioRequest(
                "Carla Mendes", "agente@demo.com", "123456", Perfil.AGENTE, se.getId(), codigoAgente));

        // ---------- Relatos comunitários de exemplo ----------
        Evento lapaAlagada = relatoService.criar(new RelatoRequest(joao.getId(), lapa.getId(), TipoRisco.ALAGAMENTO,
                "Rua Guaicurus com água na altura da calçada perto do viaduto. Carros desviando.",
                Severidade.ALTA, -23.5262, -46.6981));
        eventoService.validar(lapaAlagada.getId(), new ValidacaoRequest(maria.getId(), TipoValidacao.CONFIRMAR));

        Evento brasCalor = relatoService.criar(new RelatoRequest(maria.getId(), bras.getId(), TipoRisco.ILHA_DE_CALOR,
                "Calor muito forte no Largo da Concórdia, idosos passando mal no ponto de ônibus.",
                Severidade.MODERADA, null, null));
        eventoService.validar(brasCalor.getId(), new ValidacaoRequest(carla.getId(), TipoValidacao.CONFIRMAR));

        relatoService.criar(new RelatoRequest(joao.getId(), capao.getId(), TipoRisco.INTERRUPCAO_SERVICO,
                "Sem água nas torneiras desde a manhã na região da Estrada de Itapecerica.",
                Severidade.MODERADA, null, null));

        relatoService.criar(new RelatoRequest(maria.getId(), ipiranga.getId(), TipoRisco.ALAGAMENTO,
                "Bueiro entupido na Rua Silva Bueno, água começando a acumular na esquina.",
                Severidade.BAIXA, -23.5905, -46.6052));

        System.out.println("DataLoader: 6 regiões, 18 sensores, 3 usuários e 4 relatos criados!");
        System.out.println("DataLoader: logins de teste -> morador@demo.com / agente@demo.com (senha 123456)");
    }

    private void criarSensores(Regiao regiao, String sigla, double nivelInicial) {
        sensorRepository.saveAll(List.of(
                new Sensor("NV-" + sigla + "-01", Grandeza.NIVEL_AGUA, regiao, true, nivelInicial),
                new Sensor("TP-" + sigla + "-01", Grandeza.TEMPERATURA, regiao, true, null),
                new Sensor("EN-" + sigla + "-01", Grandeza.ENERGIA, regiao, true, 1.0)));
    }
}
