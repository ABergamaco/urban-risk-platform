package com.fiap.ec.urban_risk.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fiap.ec.urban_risk.dto.CadastroUsuarioRequest;
import com.fiap.ec.urban_risk.dto.LoginRequest;
import com.fiap.ec.urban_risk.exception.AcessoNegadoException;
import com.fiap.ec.urban_risk.exception.DadosInvalidosException;
import com.fiap.ec.urban_risk.exception.RecursoDuplicadoException;
import com.fiap.ec.urban_risk.exception.RecursoNaoEncontradoException;
import com.fiap.ec.urban_risk.model.Perfil;
import com.fiap.ec.urban_risk.model.Usuario;
import com.fiap.ec.urban_risk.repository.RegiaoRepository;
import com.fiap.ec.urban_risk.repository.UsuarioRepository;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RegiaoRepository regiaoRepository;
    private final String codigoAgente;
    private final SecureRandom random = new SecureRandom();

    public UsuarioService(UsuarioRepository usuarioRepository,
                          RegiaoRepository regiaoRepository,
                          @Value("${urbanrisk.agente.codigo}") String codigoAgente) {
        this.usuarioRepository = usuarioRepository;
        this.regiaoRepository = regiaoRepository;
        this.codigoAgente = codigoAgente;
    }

    @Transactional
    public Usuario cadastrar(CadastroUsuarioRequest req) {
        if (req.nome() == null || req.nome().trim().length() < 3) {
            throw new DadosInvalidosException("Informe o nome (mínimo 3 letras).");
        }
        if (req.email() == null || !req.email().contains("@")) {
            throw new DadosInvalidosException("Informe um e-mail válido.");
        }
        if (req.senha() == null || req.senha().length() < 6) {
            throw new DadosInvalidosException("A senha deve ter pelo menos 6 caracteres.");
        }
        if (req.perfil() == null) {
            throw new DadosInvalidosException("Escolha o perfil: MORADOR ou AGENTE.");
        }
        // Agente local tem poderes extras (validar/descartar/resolver),
        // por isso o cadastro exige o código fornecido pelo órgão.
        if (req.perfil() == Perfil.AGENTE && !codigoAgente.equals(req.codigoAgente())) {
            throw new AcessoNegadoException("Código de agente inválido.");
        }
        String email = req.email().trim().toLowerCase();
        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw new RecursoDuplicadoException("Já existe uma conta com este e-mail.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(req.nome().trim());
        usuario.setEmail(email);
        usuario.setPerfil(req.perfil());
        usuario.setCriadoEm(LocalDateTime.now());
        if (req.regiaoId() != null) {
            usuario.setRegiao(regiaoRepository.findById(req.regiaoId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Região não encontrada.")));
        }
        definirSenha(usuario, req.senha());
        return usuarioRepository.save(usuario);
    }

    public Usuario login(LoginRequest req) {
        if (req.email() == null || req.senha() == null) {
            throw new DadosInvalidosException("Informe e-mail e senha.");
        }
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(req.email().trim())
                .orElseThrow(() -> new AcessoNegadoException("E-mail ou senha inválidos."));
        String hash = hash(usuario.getSalt(), req.senha());
        if (!MessageDigest.isEqual(hash.getBytes(StandardCharsets.UTF_8),
                usuario.getSenhaHash().getBytes(StandardCharsets.UTF_8))) {
            throw new AcessoNegadoException("E-mail ou senha inválidos.");
        }
        return usuario;
    }

    public Usuario buscarPorId(Long id) {
        if (id == null) {
            throw new DadosInvalidosException("Informe o usuarioId.");
        }
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));
    }

    /** Usado nas ações exclusivas de agente local. */
    public Usuario exigirAgente(Long usuarioId) {
        Usuario usuario = buscarPorId(usuarioId);
        if (usuario.getPerfil() != Perfil.AGENTE) {
            throw new AcessoNegadoException("Ação permitida apenas para agentes locais.");
        }
        return usuario;
    }

    // ================= Senha com hash + salt (nunca em texto puro) =================

    void definirSenha(Usuario usuario, String senha) {
        byte[] saltBytes = new byte[16];
        random.nextBytes(saltBytes);
        String salt = Base64.getEncoder().encodeToString(saltBytes);
        usuario.setSalt(salt);
        usuario.setSenhaHash(hash(salt, senha));
    }

    private String hash(String salt, String senha) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest((salt + senha).getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 indisponível", e);
        }
    }
}
