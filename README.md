# FightHub Admin UI

Interface administrativa completa para FightHub - sistema de gerenciamento para academias de Jiu-Jitsu.

## ✨ Funcionalidades

### 🥋 Gerenciamento de Alunos
- **Lista de alunos** com filtros avançados (nome, status, graduação)
- **Visualização detalhada** com todas as informações do aluno
- **Controle de matrícula** (ativar/inativar)
- **Sistema de graduação** (promover/rebaixar faixa e grau)
- **Edição de dados** (datas de nascimento e matrícula)
- **Responsáveis vinculados** para menores de idade

### 🎯 Sistema de Notificações
- **Toast notifications** com 4 variantes (success, error, warning, info)
- **Auto-dismiss** configurável
- **Feedback visual** para todas as operações

### 🔐 Autenticação & Segurança  
- **Login seguro** com JWT tokens
- **Refresh tokens** automático
- **Controle de permissões** por role (ADMIN, COORDENADOR, PROFESSOR)
- **Interceptadores** para tratamento de erros

### 🎨 Interface Moderna
- **Design responsivo** otimizado para desktop e mobile
- **Paleta de cores** inspirada no Jiu-Jitsu
- **Animações suaves** e transições elegantes
- **Loading states** e skeletons
- **Modais de confirmação** para ações críticas

## 🚀 Stack Tecnológica

- **Frontend:** Vite + React 18 + TypeScript
- **Roteamento:** React Router DOM v6
- **Estilização:** TailwindCSS com tema personalizado
- **HTTP Client:** Axios com interceptadores
- **Ícones:** Lucide React
- **Formulários:** React Hook Form + Zod
- **Estado:** Context API + hooks customizados

## 🛠️ Instalação e Uso

### Pré-requisitos
- Node.js 18+
- NPM ou Yarn
- Backend FightHub rodando em localhost:8080

### Configuração

1. **Clone e instale dependências:**
```bash
git clone <repo-url>
cd FightHubUi
npm install
```

2. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
```

Arquivo `.env`:
```
VITE_API_BASE_URL=http://localhost:8080
```

3. **Execute em modo desenvolvimento:**
```bash
npm run dev
```

4. **Acesse a aplicação:**
- URL: `http://localhost:3000`
- Credenciais padrão: `admin@fighthub.test` / qualquer senha

## 📁 Estrutura do Projeto

```
src/
├── api/                    # Clientes da API
│   └── alunos.ts          # Endpoints dos alunos
├── app/                   # Configuração da aplicação
│   ├── providers.tsx      # Context providers
│   └── router.tsx         # Configuração das rotas
├── components/            # Componentes reutilizáveis
│   ├── Button.tsx         # Botão com variantes
│   ├── ConfirmModal.tsx   # Modal de confirmação
│   ├── Toast.tsx          # Sistema de notificações
│   └── Table.tsx          # Tabela genérica
├── context/               # Contexts React
│   ├── AuthContext.tsx    # Autenticação
│   └── ToastContext.tsx   # Notificações
├── hooks/                 # Hooks customizados
│   └── useAuth.tsx        # Hook de autenticação
├── lib/                   # Utilitários
│   ├── apiClient.ts       # Cliente HTTP configurado
│   └── auth.ts            # Helpers de autenticação
├── pages/                 # Páginas da aplicação
│   ├── alunos/
│   │   ├── AlunosList.tsx # Lista de alunos
│   │   └── AlunoDetail.tsx# Detalhes do aluno
│   ├── Dashboard.tsx      # Dashboard principal
│   └── Login.tsx          # Página de login
├── styles/                # Estilos globais
│   └── theme.ts           # Tema personalizado
└── types/                 # Definições TypeScript
    └── index.ts           # Tipos da aplicação
```

## 🎨 Sistema de Design

### Paleta de Cores
- **Primária:** `#c2410c` (laranja terroso)
- **Secundária:** `#1e3a8a` (azul profundo) 
- **Faixas:** Cores representando graduações do Jiu-Jitsu
- **Neutros:** Escala de cinzas harmoniosa

### Componentes
- **Botões:** 4 variantes (primary, secondary, ghost, outline)
- **Cards:** Bordas arredondadas com sombras suaves
- **Inputs:** Focus states com cores da marca
- **Badges:** Indicadores visuais para status

## 🔌 API Integration

### Endpoints Implementados

#### Alunos (`/alunos`)
- `GET /alunos` - Listar com paginação
- `GET /alunos/:id` - Buscar por ID
- `POST /alunos` - Criar novo aluno
- `PATCH /alunos/:id/matricula` - Atualizar status matrícula
- `PATCH /alunos/:id/data-nascimento` - Atualizar data nascimento
- `PATCH /alunos/:id/data-matricula` - Atualizar data matrícula
- `PATCH /alunos/:id/promover/faixa` - Promover faixa
- `PATCH /alunos/:id/rebaixar/faixa` - Rebaixar faixa
- `PATCH /alunos/:id/promover/grau` - Promover grau
- `PATCH /alunos/:id/rebaixar/grau` - Rebaixar grau

### Autenticação
- **Token JWT** armazenado em localStorage
- **Refresh automático** antes da expiração
- **Redirecionamento** para login em caso de erro 401

## 🧪 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Verificação do ESLint
npm run lint:fix     # Correção automática do ESLint
```

## 🔒 Controle de Permissões

### Roles de Usuário
- **ADMIN:** Acesso completo ao sistema
- **COORDENADOR:** Gerenciamento de alunos e matrículas
- **PROFESSOR:** Gerenciamento de graduações

### Restrições por Funcionalidade
- **Editar dados:** ADMIN, COORDENADOR
- **Controle de matrícula:** ADMIN, COORDENADOR  
- **Graduações:** ADMIN, PROFESSOR

## 🚀 Build e Deploy

```bash
# Build para produção
npm run build

# Preview local do build
npm run preview

# Deploy (configure seu provedor)
# Exemplo para Vercel:
vercel --prod
```

## 🔧 Configurações Avançadas

### Customização do Tema
Edite `src/styles/theme.ts` e `src/index.css` para personalizar:
- Cores da marca
- Espaçamentos
- Tipografia
- Sombras e bordas

### Adição de Novas Features
1. Crie os tipos em `src/types/index.ts`
2. Implemente a API em `src/api/`
3. Desenvolva os componentes em `src/components/`
4. Crie as páginas em `src/pages/`
5. Configure as rotas em `src/app/router.tsx`

---

💪 **Desenvolvido para academias que levam o Jiu-Jitsu a sério!**
- `src/lib` - apiClient, auth, env
- `src/mocks` - mocks usados quando `VITE_API_BASE_URL` vazio

# FightHubUi
