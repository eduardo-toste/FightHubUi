import { useState, useEffect } from 'react';
import { usuariosService } from './usuariosService';
import {
  UsuarioResponse,
  UsuarioDetalhadoResponse,
  UpdateRoleRequest,
  UpdateStatusRequest,
  UsuarioUpdateParcialRequest,
  PagedUsuarioResponse,
} from '../../types';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<PagedUsuarioResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarUsuarios = async (page = 0, size = 10) => {
    setLoading(true);
    setError(null);
    try {
      const data = await usuariosService.obterUsuarios(page, size);
      setUsuarios(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  return {
    usuarios,
    loading,
    error,
    carregarUsuarios,
  };
};

export const useUsuarioDetalhado = (id: string) => {
  const [usuario, setUsuario] = useState<UsuarioDetalhadoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarUsuario = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await usuariosService.obterUsuario(id);
      setUsuario(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar usuário');
    } finally {
      setLoading(false);
    }
  };

  const atualizarRole = async (role: UpdateRoleRequest) => {
    setLoading(true);
    setError(null);
    try {
      await usuariosService.atualizarRole(id, role);
      await carregarUsuario();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar role');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatus = async (status: UpdateStatusRequest) => {
    setLoading(true);
    setError(null);
    try {
      await usuariosService.atualizarStatus(id, status);
      await carregarUsuario();
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar status');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const atualizarUsuario = async (data: UsuarioUpdateParcialRequest) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await usuariosService.atualizarUsuarioParcial(id, data);
      setUsuario(updated);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar usuário');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuario();
  }, [id]);

  return {
    usuario,
    loading,
    error,
    atualizarRole,
    atualizarStatus,
    atualizarUsuario,
    recarregar: carregarUsuario,
  };
};

export const useMeuPerfil = () => {
  const [usuario, setUsuario] = useState<UsuarioDetalhadoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarPerfil = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usuariosService.obterDadosProprios();
      setUsuario(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const atualizarPerfil = async (data: UsuarioUpdateParcialRequest) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await usuariosService.atualizarDadosPropriosParcial(data);
      setUsuario(updated);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar perfil');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPerfil();
  }, []);

  return {
    usuario,
    loading,
    error,
    atualizarPerfil,
    recarregar: carregarPerfil,
  };
};
