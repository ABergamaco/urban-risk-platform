# Urban Risk Intelligence Platform

**Global Solution 2026.2 · Advanced Programming & Mobile Dev · Engenharia da Computação, 3º ano**

| Integrante | RM |
|---|---|
| Arthur Bergamaço Alves | RM 556207 |
| Leonardo Medeiros da Silva | RM 559220 |

Plataforma integrada de **monitoramento e análise de riscos cotidianos em áreas urbanas**: alagamentos, ilhas de calor e interrupções de serviços essenciais. Ela é dividida em duas partes:

- **Backend (Java + Spring Boot):** recebe dados de **sensores** (simulados ou reais), de uma **base pública** (Open-Meteo, com dados reais de clima) e de **relatos da comunidade**. Guarda tudo no banco e expõe uma **API REST que prioriza os alertas** e informa a **origem** e o **nível de confiança** de cada dado.
- **App mobile (React Native + Expo):** mostra um **painel de acompanhamento**, a **lista e o mapa de eventos**, **notificações de alerta** e uma interface **simples e acessível** para **moradores** e **agentes locais**.

```
urban-risk-platform/
├── backend/   → API REST Spring Boot   (detalhes: backend/README.md)
└── mobile/    → App React Native/Expo  (detalhes: mobile/README.md)
```

---

## Como executar as duas stacks

### Pré-requisitos
- **Java 17 ou superior** (testado com Temurin 21/25). Confira com `java -version`.
- **Node.js 20 ou superior**. Confira com `node -v`.
- Internet, para a base pública Open-Meteo e o mapa. Sem internet o sistema continua funcionando, só com sensores e relatos.

### 1) Backend (terminal 1)
```bash
cd backend
./mvnw spring-boot:run          # Windows: mvnw.cmd spring-boot:run
```
- A API sobe em **http://localhost:8080**. Para testar, abra http://localhost:8080/alertas.
- No primeiro start são criados os dados de exemplo: 6 regiões de SP, 18 sensores simulados, relatos e usuários de teste.

### 2) App mobile (terminal 2)
```bash
cd mobile
npm install
npm run web                     # abre no navegador (http://localhost:8081)
# ou: npm start  -> Expo Go (celular) / emulador Android
```

### Testes automatizados
```bash
cd backend && ./mvnw test        # JUnit: regras de confiança/prioridade, análise de tendência, fluxo integrado
cd mobile  && npm test           # Jest: formatação, mapa, prioridade, tratamento de erros da API
```

### Contas de teste (senha `123456`)
| E-mail | Perfil |
|---|---|
| `morador@demo.com` | Morador |
| `agente@demo.com` | Agente local |

---

## Requisitos atendidos

| Requisito | Onde |
|---|---|
| Receber e organizar dados de sensores, bases públicas e registros comunitários | `backend`: `SimuladorSensores`, `POST /leituras`, `OpenMeteoService`, `POST /relatos` |
| Persistir os dados | Spring Data JPA + H2 (`backend/src/main/java/.../model` e `repository`) |
| API REST que prioriza alertas | `GET /alertas`, ordenado por prioridade (`CalculoRisco`) |
| Recurso de IA/análise para apoiar a priorização | **Análise de tendência por regressão linear** (`AnaliseTendencia`): prevê quando o próximo nível de risco será atingido, ajusta a prioridade e emite **alerta preditivo** |
| Origem e nível de confiança de cada dado | Campos `origem`, `fonte`, `confianca` e `nivelConfianca` em todo alerta |
| Painel de acompanhamento | App: aba **Painel** |
| Lista ou mapa de eventos | App: abas **Alertas** (lista) e **Mapa** |
| Notificações de alerta | App: notificação do sistema + banner dentro do app |
| Interface simples e acessível para moradores e agentes | App: perfis Morador e Agente local, contraste AA, leitor de tela |
| Arquitetura em camadas, testes e README | `controller / service / repository / model` · testes **JUnit** (backend) e **Jest** (mobile) · este README |
| App sem travar com o backend parado e recuperação ao reconectar | `mobile/src/context/ConexaoContext.tsx` + faixa "Sem conexão / Conexão restabelecida" |
| Indicadores: tempo de atualização, qualidade dos alertas, facilidade de uso | `GET /indicadores` + card **Indicadores** no Painel do app |
| Proteção de dados pessoais | Relatos anônimos, localização aproximada, senha com hash |

## Arquitetura

```
App React Native ──HTTP/JSON──► controller ──► service ──► repository ──► H2
  (screens, components,          (REST)       (regras,      (Spring Data
   services, context)                          análise,      JPA)
                                               simulador)
                                                  ▲
                         Open-Meteo (base pública) ┘  + sensores simulados/reais + relatos
```

- **Backend em camadas:** `controller` (REST) → `service` (regras de negócio, `CalculoRisco`, `AnaliseTendencia`) → `repository` (JPA) → `model` (entidades).
- **App em camadas:** `screens` (telas) → `components` (UI reutilizável) → `services` (API com axios) + `context` (sessão e conexão) + `hooks`.

## Roteiro da apresentação

1. **API rodando:** abrir http://localhost:8080/alertas e mostrar os alertas ordenados por prioridade, com `origem` e `confianca`.
2. **App recebendo dados em tempo real:** o Painel atualiza sozinho e os sensores mudam a cada 15 s. Em **Perfil → Modo demonstração**:
   - *Alagamento → De uma vez*: em até 15 s chegam o **banner** e a **notificação**;
   - *Alagamento → Aos poucos*: o alerta mostra **"Piorando · deve atingir nível ALTA em ~X min"** (análise de tendência), seguido do **alerta preditivo**.
3. **Qualidade dos alertas:** enviar um relato no mesmo bairro, que nasce com confiança maior por cruzamento com o sensor. Entrar como agente e validar.
4. **Backend parado:** Ctrl+C no terminal do backend. O app mostra **"Sem conexão com o servidor · tentando reconectar"**, continua navegável com os últimos dados e não trava.
5. **Reconexão:** subir o backend de novo (`mvnw spring-boot:run`). O app mostra **"Conexão restabelecida"** e tudo se atualiza sozinho.
6. **Indicadores:** card **Indicadores** no Painel (tempo de atualização, qualidade dos alertas, facilidade de uso) ou `GET /indicadores`.

Mais detalhes em [`backend/README.md`](backend/README.md) e [`mobile/README.md`](mobile/README.md).
