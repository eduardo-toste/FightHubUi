# Módulo de Usuários - FightHub UI

## Visão Geral

O módulo de usuários foi implementado com controle completo de permissões, aproveitando todos os endpoints disponíveis na API do FightHub.

## Estrutura de Arquivos

```
src/
├── features/usuarios/
│   ├── usuariosService.ts    # Serviço API com todos os endpoints
│   └── useUsuarios.ts         # Hooks React para gerenciamento de estado
├── pages/usuarios/
│   ├── UsuariosList.tsx       # Listagem paginada de usuários
│   ├── UsuarioDetail.tsx      # Detalhes e edição de usuário (ADMIN)
│   └── MeuPerfil.tsx          # Perfil do usuário autenticado
└── types/index.ts             # Interfaces TypeScript
```

## Permissões por Role

### ADMIN
- ✅ Visualizar lista de todos os usuários
- ✅ Visualizar detalhes de qualquer usuário
- ✅ Editar dados de qualquer usuário
- ✅ Alterar role de usuários
- ✅ Ativar/desativar usuários
- ✅ Gerenciar próprio perfil
- ✅ Alterar própria senha

### COORDENADOR
- ✅ Visualizar lista de todos os usuários
- ✅ Visualizar detalhes de qualquer usuário
- ❌ Não pode alterar role
- ❌ Não pode alterar status
- ❌ Não pode editar outros usuários
- ✅ Gerenciar próprio perfil
- ✅ Alterar própria senha

### PROFESSOR, ALUNO, RESPONSAVEL
- ❌ Não tem acesso à lista de usuários
- ✅ Gerenciar próprio perfil
- ✅ Alterar própria senha

## Funcionalidades Implementadas

### 1. Listagem de Usuários (`/usuarios`)
**Permissão:** ADMIN, COORDENADOR

- Tabela paginada com todos os usuários
- Busca por nome, email ou CPF
- Exibição de role com badges coloridos
- Status ativo/inativo visual
- Paginação automática (10 usuários por página)
- Click na linha abre detalhes do usuário

### 2. Detalhes do Usuário (`/usuarios/:id`)
**Permissão:** ADMIN, COORDENADOR

**Visualização (todos):**
- Informações pessoais completas
- Endereço (se cadastrado)
- Badges de status e role
- Indicador de login social

**Edição (apenas ADMIN):**
- ✏️ Editar nome, email, telefone, CPF
- 🔄 Alterar role (modal dedicado)
- ⚡ Ativar/desativar usuário (modal dedicado)
- 💾 Atualização parcial (PATCH) - envia apenas campos alterados

### 3. Meu Perfil (`/perfil`)
**Permissão:** Todos os usuários autenticados

- Visualização de foto (avatar com inicial)
- Edição de informações pessoais
- Visualização de endereço completo
- Alteração de senha com validação
- Não permite alterar senha para usuários com login social

### 4. Alteração de Role (ADMIN)
Modal exclusivo para ADMIN com:
- Select com todas as roles disponíveis
- Confirmação antes de alterar
- Feedback visual de sucesso/erro

### 5. Alteração de Status (ADMIN)
Modal exclusivo para ADMIN com:
- Confirmação de ativação/desativação
- Texto dinâmico baseado no status atual
- Botões com cores semânticas (verde/vermelho)

### 6. Alteração de Senha
Funcionalidade para qualquer usuário autenticado:
- Campo de senha atual
- Campo de senha nova
- Confirmação de senha
- Validações:
  - Mínimo 6 caracteres
  - Senhas devem coincidir
  - Senha atual obrigatória
- Toggle para mostrar/ocultar senha
- Desabilitado para login social

## Endpoints da API Utilizados

### Gerenciamento (ADMIN/COORDENADOR)
```typescript
GET    /usuarios                    // Lista paginada
GET    /usuarios/{id}               // Detalhes específicos
PATCH  /usuarios/{id}/role          // Alterar role (ADMIN)
PATCH  /usuarios/{id}/status        // Alterar status (ADMIN)
PUT    /usuarios/{id}               // Atualização completa (ADMIN)
PATCH  /usuarios/{id}               // Atualização parcial (ADMIN)
```

### Próprios Dados (Autenticado)
```typescript
GET    /usuarios/me                 // Dados do usuário logado
PUT    /usuarios/me                 // Atualização completa própria
PATCH  /usuarios/me                 // Atualização parcial própria
PATCH  /usuarios/me/password        // Alterar senha
```

## Tipos TypeScript

### Role
```typescript
type Role = 'ADMIN' | 'PROFESSOR' | 'ALUNO' | 'RESPONSAVEL' | 'COORDENADOR';
```

### UsuarioResponse
```typescript
interface UsuarioResponse {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone?: string;
  role: Role;
  ativo: boolean;
}
```

### UsuarioDetalhadoResponse
```typescript
interface UsuarioDetalhadoResponse {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone?: string;
  foto?: string;
  role: Role;
  loginSocial: boolean;
  ativo: boolean;
  endereco?: EnderecoResponse;
}
```

### Requests
```typescript
interface UpdateRoleRequest {
  role: Role;
}

interface UpdateStatusRequest {
  usuarioAtivo: boolean;
}

interface UsuarioUpdateParcialRequest {
  nome?: string;
  email?: string;
  foto?: string;
  telefone?: string;
  cpf?: string;
  endereco?: EnderecoResponse;
  role?: Role;
  ativo?: boolean;
}

interface UpdateSenhaRequest {
  senhaAtual: string;
  senhaNova: string;
}
```

## Hooks Customizados

### useUsuarios()
Gerencia a listagem de usuários:
```typescript
const { usuarios, loading, error, carregarUsuarios } = useUsuarios();
```

### useUsuarioDetalhado(id)
Gerencia detalhes e edição de um usuário específico:
```typescript
const {
  usuario,
  loading,
  error,
  atualizarRole,
  atualizarStatus,
  atualizarUsuario,
  recarregar
} = useUsuarioDetalhado(id);
```

### useMeuPerfil()
Gerencia o perfil do usuário autenticado:
```typescript
const {
  usuario,
  loading,
  error,
  atualizarPerfil,
  recarregar
} = useMeuPerfil();
```

## Navegação

### Menu Sidebar
O link "Usuários" aparece apenas para:
- ✅ ADMIN
- ✅ COORDENADOR

### Avatar do Usuário
Click no avatar abre o perfil (`/perfil`) para qualquer usuário autenticado.

## Dark Mode

Todas as páginas do módulo têm suporte completo ao dark mode:
- Backgrounds adaptativos
- Borders suaves
- Badges com cores semânticas
- Modals com tema consistente
- Inputs e selects com tema escuro

## Validações e Segurança

1. **Verificação de Permissões:**
   - Redirecionamento automático se usuário sem permissão tentar acessar
   - Botões de edição visíveis apenas para roles autorizados

2. **Validação de Formulários:**
   - Campos obrigatórios
   - Validação de email
   - Senha mínima de 6 caracteres
   - Confirmação de senha

3. **Feedback Visual:**
   - Loading states em todas as operações
   - Mensagens de erro claras
   - Confirmações em modais para ações críticas

## Melhorias Futuras

- [ ] Upload de foto de perfil
- [ ] Edição de endereço no perfil
- [ ] Histórico de alterações
- [ ] Filtros avançados na listagem
- [ ] Exportação de dados (CSV/PDF)
- [ ] Logs de auditoria
