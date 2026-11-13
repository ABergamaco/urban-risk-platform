# Urban Risk Intelligence Platform: Backend (API REST)

**Global Solution 2026.2 · Advanced Programming & Mobile Dev · 3º ano de Engenharia da Computação**

| Integrante | RM |
|---|---|
| Arthur Bergamaço Alves | RM 556207 |
| Leonardo Medeiros da Silva | RM 559220 |

App mobile (React Native) que consome esta API: pasta [`../mobile`](../mobile). Visão geral do projeto: [README principal](../README.md).

---

## 1. O que é

Esta é a API da plataforma que monitora **riscos urbanos do dia a dia** em São Paulo:

- **alagamentos**
- **ilhas de calor** (calor extremo)
- **interrupções de serviços essenciais** (energia, água)

A API recebe dados de **três origens**, guarda tudo no banco e expõe uma **API REST que prioriza os alertas**. Cada dado traz a **origem** e o **nível de confiança**.

| Origem | Como chega | Confiança inicial |
|---|---|---|
| **Sensores** (simulados, ou reais via `POST /leituras`) | Nível da água, temperatura e energia, a cada 15 s | 80% |
| **Base pública**: [Open-Meteo](https://open-meteo.com) (dados **reais**, gratuita, sem chave) | Temperatura e chuva atuais de cada região, a cada 10 min | 85% |
| **Comunidade** (relatos de moradores pelo app) | `POST /relatos` | 35% (sobe com confirmações) |

## 2. Tecnologias

- Java 17 + **Spring Boot 4** (Web MVC, Data JPA, Scheduling)
- Banco **H2** em arquivo (`./data/urbanrisk`), com console web
- `RestClient` do Spring para consumir a API Open-Meteo
- JUnit 5 nos testes

## 3. Como rodar

```bash
cd backend
./mvnw spring-boot:run        # Linux/Mac
mvnw.cmd spring-boot:run      # Windows
```

A API sobe em **http://localhost:8080**. No primeiro start, o `DataLoader` cria os dados de exemplo:

- 6 regiões: Jardim Pantanal, Sé, Brás, Lapa, Ipiranga e Capão Redondo
- 18 sensores simulados (nível da água, temperatura e energia em cada região)
- 4 relatos comunitários
- 3 usuários de teste, todos com senha **123456**:

| E-mail | Perfil |
|---|---|
| `morador@demo.com` | Morador |
| `vizinho@demo.com` | Morador |
| `agente@demo.com` | Agente local |

Outros endereços úteis:

- Console do banco: http://localhost:8080/h2-console (JDBC URL `jdbc:h2:file:./data/urbanrisk`, usuário `sa`, senha vazia)
- Para **zerar os dados**, pare o servidor e apague a pasta `data/`.
- Testes: `./mvnw test`

> A integração com a Open-Meteo precisa de internet. Sem conexão, a API continua funcionando com sensores e relatos. Nesse caso, o painel mostra a base pública como **OFFLINE**.

## 4. Arquitetura (camadas)

```
controller/   → recebe as requisições HTTP (REST) e devolve JSON
service/      → regras de negócio (confiança, prioridade, simulador, Open-Meteo)
repository/   → acesso ao banco (Spring Data JPA)
model/        → entidades JPA e enums
dto/          → objetos de entrada/saída que não são entidades
exception/    → exceções + ApiExceptionHandler (erros sempre como {"erro": "mensagem"})
```

**Fluxo de um dado:**

```
Sensor / Open-Meteo ──► Leitura ──► LeituraService (regras/limites) ──► Evento (alerta)
Morador (app)       ──► Relato  ──► RelatoService  ───────────────────► Evento (alerta)
                                                                          │
                     EventoService: cruza fontes, recalcula confiança, prioriza
                                                                          ▼
                                                   GET /alertas (ordenado por prioridade)
```

### Entidades

| Entidade | Para que serve |
|---|---|
| `Regiao` | Bairro monitorado (coordenadas, efeito ilha de calor, se é propenso a alagamento) |
| `Sensor` | Sensor instalado em uma região (simulado ou real) |
| `Leitura` | Dado bruto recebido (valor, unidade, origem, fonte, data/hora) |
| `Evento` | Ocorrência de risco: tipo, gravidade, **origem**, **fonte**, **confiança**, status |
| `Relato` | Registro comunitário (o autor é guardado, mas **nunca exposto** na API) |
| `Validacao` | Confirmação/contestação de um usuário (uma por pessoa por evento) |
| `Usuario` | Morador ou agente local (senha com hash SHA-256 + salt) |

## 5. Regras de negócio

Todas as fórmulas estão em `service/CalculoRisco.java`, testadas em `CalculoRiscoTest`.

### 5.1 Quando uma leitura vira alerta

| Medição | Baixa | Moderada | Alta | Crítica |
|---|---|---|---|---|
| Nível da água (cm) | ≥ 15 | ≥ 30 | ≥ 50 | ≥ 80 |
| Chuva (mm/h) | ≥ 5 | ≥ 10 | ≥ 25 | ≥ 50 |
| Temperatura (°C) | ≥ 30 | ≥ 32 | ≥ 35 | ≥ 38 |
| Energia | — | — | sem energia | — |

- Abaixo do primeiro limite, o evento ativo daquela origem é **encerrado automaticamente** ("normalizado").
- Um sensor que manda leitura a cada 15 s **atualiza** o mesmo evento em vez de criar outro.

### 5.2 Nível de confiança (0 a 99%)

```
confiança = base da origem (Sensor 80 | Base pública 85 | Comunidade 35)
          + 10 por confirmação de morador
          − 15 por contestação de morador
          + 15 por OUTRA fonte apontando o mesmo risco na mesma região (cruzamento de fontes)
          + 40 se um agente local validou
          − 25 se o sensor parou de mandar dados há mais de 10 min (dado desatualizado)
```

Faixas: **ALTA** ≥ 75 · **MÉDIA** ≥ 50 · **BAIXA** < 50.

Exemplo: um morador relata alagamento na Sé (35%). O sensor de nível da Sé também detecta alagamento (+15), e a confiança do relato vai para **50%**. Ao mesmo tempo, o alerta do sensor sobe de 80% para 95%.

### 5.3 Prioridade dos alertas (0 a 100)

```
prioridade = gravidade (até 50) + confiança × 0,35 (até 35) + recência (até 15, cai a zero em 6 h)
           + tendência (−5 a +10, ver 5.4)          → resultado limitado entre 0 e 100
```

| Prioridade | Nível do alerta |
|---|---|
| ≥ 75 | VERMELHO |
| ≥ 55 | LARANJA |
| ≥ 35 | AMARELO |
| < 35 | INFORMATIVO |

`GET /alertas` devolve sempre do **mais para o menos prioritário**.

### 5.4 Análise de tendência: recurso de análise para a priorização

Arquivos: `service/AnaliseTendencia.java` (cálculo puro, testado em `AnaliseTendenciaTest`) e `service/TendenciaService.java`.

A cada leitura de sensor (nível da água ou temperatura), o backend faz uma **regressão linear (mínimos quadrados)** com as **últimas 12 leituras** (≈ 3 min). Ela responde três perguntas:

| Pergunta | Como é calculado |
|---|---|
| O risco está **subindo, estável ou descendo**? | Inclinação da reta (cm/min ou °C/min) |
| É tendência real ou ruído? | Coeficiente **R²**: abaixo de 0,3 é tratado como ESTÁVEL |
| Em quanto tempo atinge o **próximo nível**? | (limite − valor atual) ÷ taxa |

Efeito na prioridade:

| Situação | Ajuste |
|---|---|
| Subindo e chega ao próximo nível em até 15 min | **+10** |
| Subindo e chega em até 60 min | +6 |
| Subindo mais devagar | +3 |
| Descendo (melhorando) | −5 |
| Estável | 0 |

A análise é aplicada a **todos** os alertas ativos daquela região e tipo, inclusive aos relatos de moradores.

**Alerta preditivo:** se a previsão indica que o próximo nível chega em até 15 min, o alerta é notificado **uma vez, antes de piorar**.

Para demonstrar: `POST /simulador/eventos` com `"modo": "GRADUAL"` faz a água subir ~12 cm/min. Consulte o resultado em `GET /analise/tendencias` ou no detalhe do alerta, no app.

### 5.5 Qualidade dos alertas (evitar alarme falso)

- **Agrupamento:** um relato igual (mesmo tipo e região, nas últimas 3 h) vira **confirmação** do relato existente, e não um alerta duplicado.
- **Notificação:** só notifica alerta **LARANJA ou VERMELHO** com confiança **pelo menos MÉDIA**. Um relato isolado aparece na lista, mas não dispara notificação para toda a cidade.
- **Oscilação:** o alerta só notifica de novo se ficar **mais grave do que já esteve**. Assim, um valor que oscila perto do limite não gera notificações repetidas.
- **Descarte:** um relato com 3 contestações e confiança mínima é descartado automaticamente. Um agente pode descartar na hora.
- Um morador **não** pode confirmar o próprio relato nem votar duas vezes.

## 6. Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Verifica se a API está no ar |
| GET | `/painel` | Resumo para o painel: totais por tipo/nível, alerta principal, situação de cada região e das fontes |
| GET | `/fontes` | Status das 3 origens de dados (online, atrasada, offline) |
| GET | `/alertas?tipo=&regiaoId=&confiancaMinima=&limite=` | **Alertas ativos ordenados por prioridade** |
| GET | `/alertas/novos?desde=` | Alertas que ficaram graves desde `desde` (usado nas notificações) |
| GET | `/eventos?tipo=&origem=&status=&regiaoId=` | Histórico completo (ativos e encerrados) |
| GET | `/eventos/{id}` | Detalhe de um evento |
| GET | `/eventos/{id}/leituras` | Últimas leituras da região ligadas ao tipo do evento |
| GET | `/eventos/pendentes` | Relatos da comunidade aguardando validação de agente |
| POST | `/eventos/{id}/validacoes` | `{"usuarioId":1,"tipo":"CONFIRMAR"\|"CONTESTAR"}` |
| PUT | `/eventos/{id}/resolver` | Somente agente: `{"usuarioId":3,"observacao":"..."}` |
| POST | `/relatos` | `{"usuarioId":1,"regiaoId":2,"tipo":"ALAGAMENTO","descricao":"...","severidade":"ALTA"}` |
| GET | `/leituras?regiaoId=&grandeza=&limite=` | Leituras brutas |
| POST | `/leituras` | **Entrada para sensor real:** `{"codigoSensor":"NV-PAN-01","valor":42.5}` |
| GET | `/sensores` | Sensores cadastrados |
| GET | `/regioes` · `/regioes/{id}` | Regiões monitoradas |
| POST | `/usuarios` | Cadastro (perfil `AGENTE` exige `codigoAgente`, que na demonstração é `DEFESA2026`) |
| POST | `/usuarios/login` | `{"email":"...","senha":"..."}` |
| GET | `/analise/tendencias` | Resultado atual da análise de tendência (regressão linear) por região |
| POST | `/simulador/eventos` | **Demonstração:** `{"regiaoId":1,"tipo":"ALAGAMENTO","modo":"IMEDIATO"\|"GRADUAL"}` |

Exemplos prontos para testar estão em **`api-exemplos.http`** (extensão REST Client do VS Code ou IntelliJ).

Erros sempre vêm como `{"erro": "mensagem"}`, com os códigos 400, 403, 404 ou 409.

## 7. Proteção de dados pessoais (LGPD)

- O autor do relato **nunca** aparece na API. Publicamente, o relato é "Relato de morador (anônimo)".
- A localização do relato é **arredondada para ~100 m**, para não expor o endereço de quem relatou.
- A senha é guardada só como **hash SHA-256 com salt aleatório** e nunca sai no JSON (`@JsonIgnore`).
- Quem confirmou ou contestou um alerta também não é exposto. O registro só existe para impedir voto repetido.

## 8. Disponibilidade, escalabilidade e tempo de atualização

- **Tolerância a falhas:** se a Open-Meteo cair, o sistema segue com sensores e relatos, e o painel mostra a fonte como OFFLINE.
- **Dado desatualizado:** um alerta de sensor sem dados há mais de 10 min fica marcado e perde confiança.
- **Retenção:** leituras brutas com mais de 24 h são apagadas a cada hora. Os eventos ficam no histórico.
- **Índices** no banco nas consultas mais usadas (status, região + tipo, região das leituras).
- **Sensor real:** qualquer dispositivo (ESP32, Arduino com Wi-Fi) pode enviar leituras por `POST /leituras`. Basta cadastrar o código do sensor.
- Tudo é configurável em `application.properties`: intervalos, limites e retenção.

## 9. Roteiro de demonstração

1. Suba o backend e o app.
2. Entre no app como `morador@demo.com`. O painel mostra o **alerta vermelho no Jardim Pantanal**, vindo do sensor que já começa alagado.
3. Na aba **Perfil → Modo demonstração**, escolha *Sé + Alagamento* e toque em **Simular evento**.
4. Em até 15 s aparece o **banner** no app e a **notificação do navegador/celular**.
5. Na aba **Relatar**, envie um alagamento na Sé. O relato já nasce com confiança 50% porque o sensor confirma o mesmo risco.
6. Saia e entre como `agente@demo.com`. Na aba **Validar**, valide ou descarte os relatos pendentes.
