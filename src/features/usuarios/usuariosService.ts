import api from '../../lib/apiClient';
import {
  UsuarioResponse,
  UsuarioDetalhadoResponse,
  UpdateRoleRequest,
  UpdateStatusRequest,
  UsuarioUpdateCompletoRequest,
  UsuarioUpdateParcialRequest,
  UpdateSenhaRequest,
  PagedUsuarioResponse,
} from '../../types';

export const usuariosService = {
  // Listagem paginada de usuários (ADMIN, COORDENADOR)
  async obterUsuarios(page = 0, size = 10): Promise<PagedUsuarioResponse> {
    const response = await api.get<PagedUsuarioResponse>('/usuarios', {
      params: { page, size },
    });
    return response.data;
  },

  // Detalhes de um usuário específico (ADMIN, COORDENADOR)
  async obterUsuario(id: string): Promise<UsuarioDetalhadoResponse> {
    const response = await api.get<UsuarioDetalhadoResponse>(`/usuarios/${id}`);
    return response.data;
  },

  // Atualizar role de usuário (ADMIN)
  async atualizarRole(id: string, data: UpdateRoleRequest): Promise<UsuarioResponse> {
    const response = await api.patch<UsuarioResponse>(`/usuarios/${id}/role`, data);
    return response.data;
  },

  // Atualizar status de usuário (ADMIN)
  async atualizarStatus(id: string, data: UpdateStatusRequest): Promise<UsuarioResponse> {
    const response = await api.patch<UsuarioResponse>(`/usuarios/${id}/status`, data);
    return response.data;
  },

  // Atualização completa de usuário (ADMIN)
  async atualizarUsuarioCompleto(
    id: string,
    data: UsuarioUpdateCompletoRequest
  ): Promise<UsuarioDetalhadoResponse> {
    const response = await api.put<UsuarioDetalhadoResponse>(`/usuarios/${id}`, data);
    return response.data;
  },

  // Atualização parcial de usuário (ADMIN)
  async atualizarUsuarioParcial(
    id: string,
    data: UsuarioUpdateParcialRequest
  ): Promise<UsuarioDetalhadoResponse> {
    const response = await api.patch<UsuarioDetalhadoResponse>(`/usuarios/${id}`, data);
    return response.data;
  },

  // Obter dados do próprio usuário (autenticado)
  async obterDadosProprios(): Promise<UsuarioDetalhadoResponse> {
    const response = await api.get<UsuarioDetalhadoResponse>('/usuarios/me');
    return response.data;
  },

  // Atualização completa dos próprios dados (autenticado)
  async atualizarDadosPropriosCompleto(
    data: UsuarioUpdateCompletoRequest
  ): Promise<UsuarioDetalhadoResponse> {
    const response = await api.put<UsuarioDetalhadoResponse>('/usuarios/me', data);
    return response.data;
  },

  // Atualização parcial dos próprios dados (autenticado)
  async atualizarDadosPropriosParcial(
    data: UsuarioUpdateParcialRequest
  ): Promise<UsuarioDetalhadoResponse> {
    const response = await api.patch<UsuarioDetalhadoResponse>('/usuarios/me', data);
    return response.data;
  },

  // Alterar senha do próprio usuário (autenticado)
  async alterarSenha(data: UpdateSenhaRequest): Promise<void> {
    await api.patch('/usuarios/me/password', data);
  },
};
