# FightHub Admin UI

Painel administrativo inicial para FightHub (academia de Jiu-Jitsu) usando Vite + React + TypeScript.

Stack incluída:

- Vite + React + TypeScript
- React Router DOM
- TailwindCSS
- TanStack Query
- Axios com interceptors
- React Hook Form + Zod
- Componentes básicos (Button, Card, Input)
- ESLint + Prettier

Rodando o projeto

1. Instale dependências:

```bash
npm install
```

2. Rodar em modo dev:

```bash
npm run dev
```

Configuração de ambiente

- Defina `VITE_API_BASE_URL` no `.env` se quiser usar uma API real. Se deixar vazio, o projeto usará mocks locais (`src/mocks`).

Exemplo `.env`:

```
VITE_API_BASE_URL=
```

Credenciais (modo mock)

- email: `admin@fighthub.test`
- senha: qualquer string (mock aceita e retorna token)

Estrutura principal

- `src/app` - providers e router
- `src/pages` - Login, Dashboard, Aulas
- `src/components` - componentes reutilizáveis
- `src/features` - lógica de features (dashboard)
- `src/lib` - apiClient, auth, env
- `src/mocks` - mocks usados quando `VITE_API_BASE_URL` vazio

# FightHubUi
