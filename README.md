<div align="center">

<h1>⚔️ FightHub UI</h1>

<p>
  <strong>Interface administrativa completa para o sistema FightHub</strong><br/>
  Plataforma web moderna para gerenciamento de academias de Jiu-Jitsu — alunos, turmas, aulas, professores, responsáveis, presenças e muito mais.
</p>

<p>
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5.1-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
</p>

</div>

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Stack Tecnológica](#-stack-tecnológica)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Execução](#-instalação-e-execução)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Rotas da Aplicação](#-rotas-da-aplicação)
- [Sistema de Design](#-sistema-de-design)
- [Integração com a API](#-integração-com-a-api)
- [Controle de Permissões](#-controle-de-permissões)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Build e Deploy](#-build-e-deploy)
- [Adicionando Novas Features](#-adicionando-novas-features)

---

## 🎯 Visão Geral

O **FightHub UI** é a camada de apresentação do ecossistema FightHub, construída com React 18 e TypeScript. A interface oferece um painel administrativo completo para academias de artes marciais, com suporte a múltiplos perfis de acesso (Admin, Coordenador, Professor, Responsável e Aluno), modo claro/escuro, notificações em tempo real e uma experiência de usuário otimizada para desktop e mobile.

O frontend se comunica exclusivamente com a [API REST do FightHub](../FightHub) via Axios, utilizando autenticação por JWT com refresh token automático.

---

## ✨ Funcionalidades

### 🥋 Alunos
- Listagem com filtros avançados (nome, status, graduação)
- Cadastro e edição completa de dados
- Controle de matrícula (ativar / inativar)
- Sistema de graduação: promover e rebaixar faixa e grau
- Vinculação de responsáveis para menores de idade
- Visualização de desempenho e histórico de presenças

### 🏫 Turmas
- Listagem, criação e gerenciamento de turmas
- Detalhamento por turma com alunos matriculados
- Controle de horários e dias de aula

### 📅 Aulas
- Gerenciamento completo de aulas (criação, edição, remoção)
- Registro e controle de presenças por aula
- Visualização de aulas por professor
- Painel de aulas para alunos dependentes (menores de idade)

### 👨‍🏫 Professores
- Cadastro e gerenciamento de professores
- Visualização de aulas ministradas e turmas vinculadas

### 👨‍👩‍👦 Responsáveis
- Cadastro de responsáveis legais
- Vinculação com alunos menores de idade
- Painel exclusivo de acompanhamento de dependentes

### 👥 Usuários & Perfis
- Gerenciamento de usuários do sistema
- Edição de perfil pessoal com foto
- Troca de senha e configurações de conta

### 📊 Dashboard & Estatísticas
- Painel principal com indicadores gerais da academia
- Estatísticas detalhadas por alunos
- Análise de desempenho individual
- Acompanhamento de performance por dependente

### 🔔 Notificações
- Painel de notificações persistentes
- Toast notifications com 4 variantes: `success`, `error`, `warning`, `info`
- Auto-dismiss configurável e feedback visual em todas as operações

### 🔐 Autenticação & Segurança
- Login com e-mail e senha
- Autenticação via JWT com refresh token automático
- Fluxo de ativação de conta por e-mail
- Recuperação de senha
- Timeout de inatividade com aviso ao usuário
- Proteção de rotas por papel (role-based guards)
- Bloqueio de acesso para menores sem responsável vinculado

### 🎨 Interface
- Design responsivo para desktop e mobile
- Tema claro e escuro com persistência
- Animações e transições suaves
- Loading states e skeletons
- Modais de confirmação para ações críticas

---

## 🚀 Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | React | 18.2 |
| Linguagem | TypeScript | 5.4 |
| Build Tool | Vite | 5.1 |
| Estilização | TailwindCSS | 3.4 |
| Roteamento | React Router DOM | 6.14 |
| HTTP Client | Axios | 1.4 |
| Formulários | React Hook Form | 7.45 |
| Validação | Zod | 3.23 |
| Server State | TanStack React Query | 4.36 |
| Ícones | Lucide React | 0.268 |
| Linting | ESLint + eslint-plugin-react | 8.44 |
| Formatação | Prettier | 2.8 |

---

## 📦 Pré-requisitos

- **Node.js** `>= 18.x`
- **npm** `>= 9.x` (ou Yarn / pnpm equivalente)
- **Backend FightHub** em execução (padrão: `http://localhost:8080`)

---

## 🛠️ Instalação e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/FightHubUi.git
cd FightHubUi
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` conforme necessário (ver seção abaixo).

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em **`http://localhost:3000`**.

---

## 🔑 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| `VITE_API_BASE_URL` | URL base da API REST do FightHub | `http://localhost:8080` |

> Quando `VITE_API_BASE_URL` está vazio, a aplicação utiliza os **mocks** locais definidos em `src/mocks/`.

---

## 📁 Estrutura do Projeto

```
FightHubUi/
├── public/                     # Assets estáticos públicos
├── src/
│   ├── api/                    # Módulos de integração com a API REST
│   │   ├── alunos.ts
│   │   ├── aulas.ts
│   │   ├── dashboard.ts
│   │   ├── inscricoes.ts
│   │   ├── notificacoes.ts
│   │   ├── presencas.ts
│   │   ├── professores.ts
│   │   ├── responsaveis.ts
│   │   ├── turmas.ts
│   │   └── usuarios.ts
│   ├── app/
│   │   ├── providers.tsx       # Composition root de todos os Context Providers
│   │   └── router.tsx          # Definição das rotas e guards de autenticação
│   ├── components/             # Componentes reutilizáveis (UI Kit)
│   │   ├── AuthCard.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Charts.tsx
│   │   ├── ConfirmModal.tsx
│   │   ├── EditAlunoModal.tsx
│   │   ├── InactivityWarningModal.tsx
│   │   ├── Input.tsx
│   │   ├── Layout.tsx
│   │   ├── Modal.tsx
│   │   ├── NotificationsPanel.tsx
│   │   ├── Pagination.tsx
│   │   ├── Sidebar.tsx
│   │   ├── StatCard.tsx
│   │   ├── Table.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── Toast.tsx
│   │   └── ...
│   ├── context/                # Estado global via React Context
│   │   ├── AuthContext.tsx     # Sessão do usuário autenticado
│   │   ├── NotificationContext.tsx
│   │   ├── ThemeContext.tsx    # Tema claro/escuro
│   │   └── ToastContext.tsx
│   ├── features/               # Módulos de feature isolados
│   │   ├── dashboard/
│   │   └── usuarios/
│   ├── hooks/                  # Hooks customizados
│   │   ├── useAuth.tsx
│   │   ├── useAppNotifications.ts
│   │   ├── useInactivityTimeout.ts
│   │   ├── useNotifications.ts
│   │   └── usePageTitle.ts
│   ├── lib/                    # Utilitários e configurações centrais
│   │   ├── apiClient.ts        # Instância Axios com interceptadores
│   │   └── auth.ts             # Helpers de token JWT
│   ├── mocks/                  # Dados mockados para desenvolvimento offline
│   ├── pages/                  # Páginas agrupadas por domínio
│   │   ├── alunos/
│   │   │   ├── AlunoCreate.tsx
│   │   │   ├── AlunoDetail.tsx
│   │   │   └── AlunosList.tsx
│   │   ├── aulas/
│   │   │   ├── AulaCreate.tsx
│   │   │   ├── AulaDetail.tsx
│   │   │   └── AulasList.tsx
│   │   ├── professores/
│   │   │   ├── ProfessorCreate.tsx
│   │   │   ├── ProfessorDetail.tsx
│   │   │   └── ProfessoresList.tsx
│   │   ├── responsaveis/
│   │   │   ├── ResponsavelCreate.tsx
│   │   │   ├── ResponsavelDetail.tsx
│   │   │   └── ResponsaveisList.tsx
│   │   ├── turmas/
│   │   │   ├── TurmaCreate.tsx
│   │   │   ├── TurmaDetail.tsx
│   │   │   └── TurmasList.tsx
│   │   ├── usuarios/
│   │   │   ├── MeuPerfil.tsx
│   │   │   ├── UsuarioDetail.tsx
│   │   │   └── UsuariosList.tsx
│   │   ├── Ativacao.tsx
│   │   ├── Aulas.tsx
│   │   ├── AulasDependentes.tsx
│   │   ├── AulasProfessor.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DesempenhoDosDependentes.tsx
│   │   ├── Estatisticas.tsx
│   │   ├── EstatisticasAlunos.tsx
│   │   ├── EstatisticasPorAluno.tsx
│   │   ├── Login.tsx
│   │   ├── MeuDesempenho.tsx
│   │   └── MinhasAulas.tsx
│   ├── styles/                 # Estilos e variáveis globais de tema
│   ├── types/                  # Definições de tipos TypeScript
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── postcss.config.cjs
├── tailwind.config.cjs
├── tsconfig.json
└── vite.config.ts
```

---

## 🗺️ Rotas da Aplicação

| Rota | Componente | Acesso |
|---|---|---|
| `/login` | `Login` | Público |
| `/ativar` | `Ativacao` | Público |
| `/dashboard` | `Dashboard` | Autenticado |
| `/alunos` | `AlunosList` | Autenticado |
| `/alunos/novo` | `AlunoCreate` | Admin / Coordenador |
| `/alunos/:id` | `AlunoDetail` | Autenticado |
| `/aulas` | `AulasList` | Autenticado |
| `/aulas/novo` | `AulaCreate` | Admin / Coordenador |
| `/aulas/:id` | `AulaDetail` | Autenticado |
| `/minhas-aulas` | `MinhasAulas` | Aluno / Professor |
| `/turmas` | `TurmasList` | Autenticado |
| `/turmas/nova` | `TurmaCreate` | Admin / Coordenador |
| `/turmas/:id` | `TurmaDetail` | Autenticado |
| `/professores` | `ProfessoresList` | Autenticado |
| `/professores/novo` | `ProfessorCreate` | Admin |
| `/professores/:id` | `ProfessorDetail` | Autenticado |
| `/responsaveis` | `ResponsaveisList` | Autenticado |
| `/responsaveis/novo` | `ResponsavelCreate` | Admin / Coordenador |
| `/responsaveis/:id` | `ResponsavelDetail` | Autenticado |
| `/usuarios` | `UsuariosList` | Admin |
| `/usuarios/:id` | `UsuarioDetail` | Admin |
| `/meu-perfil` | `MeuPerfil` | Autenticado |
| `/estatisticas` | `Estatisticas` | Admin / Coordenador |
| `/estatisticas/alunos` | `EstatisticasAlunos` | Admin / Coordenador |
| `/estatisticas/alunos/:id` | `EstatisticasPorAluno` | Admin / Coordenador |
| `/meu-desempenho` | `MeuDesempenho` | Aluno |
| `/dependentes/desempenho` | `DesempenhoDosDependentes` | Responsável |

---

## 🎨 Sistema de Design

### Paleta de Cores

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#d72638` | Ações principais, CTAs |
| `primary-dark` | `#b21d2c` | Hover / pressed states |
| `primary-light` | `#f56b76` | Backgrounds de destaque |
| `accent` | `#0ea5a4` | Destaques secundários |
| `fh-bg` | `#f4f6f8` | Background da página |
| `fh-card` | `#ffffff` | Background de cards |
| `fh-text` | `#111827` | Texto primário |
| `fh-muted` | `#6b7280` | Texto secundário |
| `fh-border` | `#e6e9ee` | Bordas e divisores |

### Tipografia

- **Família:** `"Segoe UI"`, `system-ui`, `Arial`, `sans-serif`

### Componentes de UI

| Componente | Variantes |
|---|---|
| `Button` | `primary`, `secondary`, `ghost`, `outline`, `danger` |
| `Toast` | `success`, `error`, `warning`, `info` |
| `Badge` | Status de matrícula, faixa e graduação |
| `Card` | Default com `border-radius: 16px` e `box-shadow` suave |
| `Input` | Default com focus ring na cor primária |
| `Modal` | Base + `ConfirmModal`, `EditAlunoModal`, `RecuperarSenhaModal`, `ChangeProfilePhotoModal` |
| `Table` | Genérica com paginação integrada |

---

## 🔌 Integração com a API

O cliente HTTP é configurado em `src/lib/apiClient.ts` com:
- **Base URL** via `VITE_API_BASE_URL`
- **Interceptador de request:** injeta o Bearer token JWT em todas as requisições
- **Interceptador de response:** realiza refresh automático do token em erros `401` e redireciona para `/login` quando o refresh falha

### Endpoints por Domínio

<details>
<summary><strong>Alunos</strong></summary>

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/alunos` | Listar com paginação e filtros |
| `GET` | `/alunos/:id` | Buscar por ID |
| `POST` | `/alunos` | Criar aluno |
| `PATCH` | `/alunos/:id/matricula` | Atualizar status de matrícula |
| `PATCH` | `/alunos/:id/data-nascimento` | Atualizar data de nascimento |
| `PATCH` | `/alunos/:id/data-matricula` | Atualizar data de matrícula |
| `PATCH` | `/alunos/:id/promover/faixa` | Promover faixa |
| `PATCH` | `/alunos/:id/rebaixar/faixa` | Rebaixar faixa |
| `PATCH` | `/alunos/:id/promover/grau` | Promover grau |
| `PATCH` | `/alunos/:id/rebaixar/grau` | Rebaixar grau |

</details>

<details>
<summary><strong>Aulas / Turmas / Professores / Responsáveis / Usuários / Presenças / Inscrições</strong></summary>

Cada domínio segue o padrão REST com endpoints em `src/api/*.ts` correspondentes às rotas do backend FightHub.

</details>

---

## 🔒 Controle de Permissões

A aplicação utiliza um sistema de **Role-Based Access Control (RBAC)** com os seguintes papéis:

| Role | Descrição |
|---|---|
| `ADMIN` | Acesso completo ao sistema |
| `COORDENADOR` | Gerenciamento de alunos, turmas, aulas e responsáveis |
| `PROFESSOR` | Gerenciamento de graduações e aulas ministradas |
| `RESPONSAVEL` | Visualização de dependentes e acompanhamento de desempenho |
| `ALUNO` | Acesso às próprias aulas, presença e desempenho |

> Rotas protegidas são verificadas via `PrivateRoute` em `src/app/router.tsx`. O contexto de autenticação (`AuthContext`) expõe o `user` atual com seu `role` para renderização condicional de elementos na interface.

---

## 🧪 Scripts Disponíveis

```bash
# Inicia o servidor de desenvolvimento com hot-reload
npm run dev

# Gera o build otimizado para produção em /dist
npm run build

# Visualiza o build de produção localmente
npm run preview

# Executa o linter ESLint
npm run lint

# Formata o código com Prettier
npm run format
```

---

## 🚀 Build e Deploy

### Build de Produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `/dist`.

### Deploy

A aplicação pode ser publicada em qualquer host de assets estáticos:

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod --dir=dist

# Servidor próprio (exemplo com nginx)
# Copie o conteúdo de /dist para o diretório raiz do nginx
# Configure o nginx para redirecionar todas as rotas para index.html (SPA)
```

> **Importante:** por ser uma SPA, configure o servidor para redirecionar todas as rotas para `index.html`.

---

## ➕ Adicionando Novas Features

Siga o padrão estabelecido no projeto:

1. **Tipos:** Defina as interfaces em `src/types/`
2. **API:** Implemente os chamadas em `src/api/<dominio>.ts`
3. **Componentes:** Crie os componentes visuais em `src/components/`
4. **Páginas:** Implemente as telas em `src/pages/<dominio>/`
5. **Rotas:** Registre as novas rotas em `src/app/router.tsx`
6. **Context / Hooks:** Se necessário, adicione estado global em `src/context/` e hooks em `src/hooks/`

---

<div align="center">
  <sub>Desenvolvido com dedicação para academias que levam as artes marciais a sério. 🥋</sub>
</div>
