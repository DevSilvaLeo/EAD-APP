# Relatório para implementação do backend — EADAPP (Angular)

Este documento descreve os **contratos consumidos pelo front**, **modelos TypeScript**, **armazenamento local**, **rotas da SPA** e **cenários de mock** para que o backend possa ser implementado alinhado ao app, alterando apenas `environment` (principalmente `apiUrl` e `useMock`).

---

## 1. Configuração do front

| Arquivo | Descrição |
|--------|-----------|
| `src/environments/environment.ts` | Desenvolvimento: `apiUrl` base (sem `/` final), `useMock: true` para mocks. |
| `src/environments/environment.prod.ts` | Produção: `useMock: false`, `apiUrl` do servidor real. |

**Integração:** defina `useMock: false` e `apiUrl` apontando para a API (ex.: `http://localhost:5000`). Os serviços passam a usar `HttpClient` com **Bearer** (ver interceptor).

**CORS (backend):** incluir a origem do Angular (ex.: `http://localhost:4200`) em `Cors:Origins`.

---

## 2. Base URL das requisições

- Autenticação: `{apiUrl}/api/auth/{endpoint}`
- Demais APIs: `{apiUrl}/api/{controller}/...` (ex.: `/api/avisos`)

---

## 3. Modelos — autenticação (`src/app/core/models/auth.models.ts`)

Propriedades em **camelCase** no JSON (padrão System.Text.Json).

Resumo: `LoginRequestDto` (`email`, `senha`), `LoginResponseDto` (`token`, `dataHoraAcesso`, `mensagem`), fluxos de esqueci senha / primeiro acesso / validar código / trocar senha / reseta primeiro acesso / recuperar senha — ver arquivo fonte.

---

## 4. Interceptor HTTP e perfil (JWT)

- **`authInterceptor`** (`src/app/core/interceptors/auth.interceptor.ts`): adiciona `Authorization: Bearer {ead_access_token}` em requisições cujo URL começa com `environment.apiUrl`.
- **Papel do usuário:** após login, o claim `role` (ou equivalente .NET) é lido do JWT e salvo em `sessionStorage` (`ead_user_role`). Em **mock**, o papel é definido no fluxo de login simulado.
- **Mocks de login:**
  - `aluno@teste.com` / `Senha@123` → papel **Aluno**
  - `admin@teste.com` / `Senha@123` → papel **Administrador**
- **`adminGuard`:** libera rotas `/home/admin/*` apenas se `ead_user_role === 'Administrador'`.

---

## 5. Modelos — área logada (`src/app/core/models/aluno-area.models.ts`)

| Modelo | Campos principais |
|--------|---------------------|
| `AvisoDto` | `id`, `titulo`, `mensagem`, `data`, `lido` |
| `FinanceiroItemDto` | `id`, `cursoId`, `nomeCurso`, `status` (`pago` \| `pendente` \| `atrasado` \| `cancelado`) |
| `EventoCalendarioDto` | `id`, `title`, `start`, `end?`, `backgroundColor?` |
| `TarefaPendenteFrontendDto` | `id`, `titulo`, `descricao`, `dataLimite`, `concluida` |
| `EntregarTarefaRequestDto` | `texto?`, `urlArquivo?` |
| `MensagemSimplesResponseDto` | `mensagem` |
| `DadosAlunoSolicitacaoDto` | `nome`, `email`, `dataSolicitacao` |
| `TipoSolicitacaoDto` | `id`, `descricao` |
| `SolicitacaoAcademicaRequestDto` | `tipoSolicitacaoId`, `descricao` |
| `SolicitacaoAcademicaResponseDto` | `id`, `mensagem` |

**Cursos e fórum:** ver `src/app/core/models/cursos-forum.models.ts` e seção **12** abaixo.

---

## 6. Rotas HTTP — área SomenteAluno (e serviços)

| Método | Rota | Serviço | Resposta / body |
|--------|------|---------|-----------------|
| GET | `/api/avisos` | `AvisosService.listar()` | `AvisoDto[]` |
| GET | `/api/financeiro` | `FinanceiroService.listar()` | `FinanceiroItemDto[]` |
| GET | `/api/calendario/eventos` | `CalendarioService.listarEventos()` | `EventoCalendarioDto[]` |
| GET | `/api/tarefas/pendentes` | `TarefasService.listarPendentes()` | `TarefaPendenteFrontendDto[]` |
| POST | `/api/tarefas/{conteudoId}/entregar` | `TarefasService.entregar(conteudoId, body)` | `MensagemSimplesResponseDto` — body `EntregarTarefaRequestDto` |
| GET | `/api/solicitacoes-academicas/meus-dados` | `SolicitacoesAcademicasService.meusDados()` | `DadosAlunoSolicitacaoDto` (404 possível) |
| GET | `/api/solicitacoes-academicas/tipos` | `SolicitacoesAcademicasService.tipos()` | `TipoSolicitacaoDto[]` |
| POST | `/api/solicitacoes-academicas` | `SolicitacoesAcademicasService.enviar()` | `SolicitacaoAcademicaResponseDto` — body `SolicitacaoAcademicaRequestDto` |
| GET | `/api/cursos` | `CursosService.listar()` | `CursoListaFrontendItemDto[]` |
| GET | `/api/cursos/{id}` | `CursosService.getById(id)` | `CursoDetalheFrontendDto` |
| POST | `/api/cursos/{cursoId}/aulas/{aulaId}/concluir` | `CursosService.concluirAula` | `MensagemSimplesResponseDto` |
| POST | `/api/cursos/{cursoId}/conteudos/{conteudoId}/concluir` | `CursosService.concluirConteudo` | `MensagemSimplesResponseDto` |
| GET | `/api/forum/{tipo}/{id}` | `ForumService.getThread` | `ForumThreadResponseDto` — `tipo`: `disciplina` \| `conteudo` (case-insensitive na API) |
| POST | `/api/forum/{tipo}/{id}` | `ForumService.post` | `MensagemSimplesResponseDto` — body `ForumPostRequestDto` |

**Nota:** no front, o parâmetro da rota de entrega de tarefa é o **`id`** retornado em `TarefaPendenteFrontendDto`; o backend documenta `{conteudoId}` — alinhar se o `id` do DTO for de fato o `conteudoId`.

---

## 7. Chaves de armazenamento (browser)

| Chave | Tipo | Conteúdo |
|-------|------|----------|
| `ead_access_token` | `localStorage` | JWT de acesso |
| `ead_user_role` | `sessionStorage` | `Aluno` ou `Administrador` (mock ou claim do JWT) |
| `ead_chave_verificacao` | `sessionStorage` | Fluxo esqueci / primeiro acesso |
| `ead_redefinicao_token` | `sessionStorage` | Redefinição de senha |
| `ead_primeiro_acesso_token_aux` | `sessionStorage` | Opcional API reseta primeiro acesso |

---

## 8. Rotas da SPA (`app.routes.ts`)

| Rota | Componente | Guard |
|------|------------|--------|
| `/login`, `/esqueci-senha`, `/primeiro-acesso` | Auth | — |
| `/home` | `HomeShellComponent` | `authGuard` |
| `/home/dashboard` | `HomeDashboardComponent` (calendário FullCalendar + avisos + tarefas) | herdado |
| `/home/meus-cursos` | `MeusCursosPageComponent` | herdado |
| `/home/cursos/:cursoId` | `CursoPlayerPageComponent` + `CursoPlayerComponent` | herdado |
| `/home/financeiro` | `FinanceiroPageComponent` | herdado |
| `/home/solicitacoes-academicas` | `SolicitacoesAcademicasPageComponent` | herdado |
| `/home/admin/cursos`, `.../eventos-calendario`, `.../avisos`, `.../produtos` | `AdminPlaceholderPageComponent` | `authGuard` + `adminGuard` |

Redirecionamentos: `/` → `/login`; `/home` → `/home/dashboard`; login com sucesso → `/home/dashboard`.

---

## 9. Bibliotecas relevantes

- **FullCalendar** (`@fullcalendar/angular`, `daygrid`, `interaction`) — calendário do painel inicial.

---

## 10. Dados mock (auth)

| Cenário | Credenciais / ação |
|---------|---------------------|
| Aluno | `aluno@teste.com` / `Senha@123` |
| Administrador | `admin@teste.com` / `Senha@123` |
| Demais cenários | Ver versão anterior do relatório (pendente, CPF 111…, código 123456, etc.) |

---

## 11. Checklist backend (área logada)

1. Implementar endpoints da seção 6 com política **SomenteAluno** (e rotas admin com **SomenteAdmin** quando os CRUDs forem implementados).  
2. Garantir JSON **camelCase** ou alinhar serialização com o front.  
3. Enviar claim **Role** no JWT (`Aluno` / `Administrador`) para o interceptor e menus funcionarem sem mock.  
4. `GET /api/cursos` e `GET /api/cursos/{id}` com `id` **Guid** (string).  

---

## 12. Cursos (player) e fórum — contratos

### DTOs (`cursos-forum.models.ts`)

- **`CursoListaFrontendItemDto`:** `id`, `nome`, `percentualConcluido`
- **`CursoDetalheFrontendDto`:** `id`, `nome`, `percentualConcluidoGeral`, `sequencial`, `aulas[]`
- **`AulaFrontendDto`:** `id`, `titulo`, `tipo`, `urlVideo?`, `urlSlides?`, `conteudoTexto?`, `ordem`, `concluida`, `percentualConcluido`, `duracaoSegundos?`, `modulo?` (opcional — agrupamento UI)

Tipos de `tipo` aceitos no front (exibição): `video`, `leitura`, `slides`, `tarefa` (comparar com `toLowerCase()`).

### Front

- **`sequencial`:** se `true`, aulas com `ordem` maior ficam bloqueadas até a anterior estar `concluida` (regra calculada no cliente; o backend deve refletir o mesmo estado).
- **Vídeo:** `VideoPlaybackService` tenta `fetch` + `blob:` para não exibir a URL original no atributo `src` quando CORS permite; **não** impede a URL na aba Network — mascaramento total exige streaming pelo backend.
- **Fórum curso:** `GET/POST /api/forum/disciplina/{cursoId}` — todos podem publicar e responder.
- **Fórum aula:** `GET/POST /api/forum/conteudo/{aulaId}` — todos publicam dúvidas; **respostas a uma entrada** só para **Administrador** (`ead_user_role`).

---

*Seções detalhadas de validação de senha e componentes de auth permanecem válidas conforme implementação anterior.*
