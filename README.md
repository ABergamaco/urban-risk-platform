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
- Testes: `./mvnw test`

### 2) App mobile (terminal 2)
```bash
cd mobile
npm install
npm run web                     # abre no navegador (http://localhost:8081)
# ou: npm start  -> Expo Go (celular) / emulador Android
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
| Arquitetura em camadas, testes e README | `controller / service / repository / model` · testes JUnit · este README |
| Proteção de dados pessoais | Relatos anônimos, localização aproximada, senha com hash |

Mais detalhes em [`backend/README.md`](backend/README.md) e [`mobile/README.md`](mobile/README.md).
