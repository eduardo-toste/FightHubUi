import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface UseInactivityTimeoutProps {
  /**
   * Tempo de inatividade em minutos antes de mostrar aviso
   * @default 12 (para token de 15 minutos)
   */
  warningMinutes?: number;
  /**
   * Tempo de inatividade em minutos antes de fazer logout
   * @default 15 (sincronizado com expiração do token JWT)
   */
  logoutMinutes?: number;
  /**
   * Callback quando inatividade é detectada (aviso)
   */
  onWarning?: () => void;
  /**
   * Callback quando logout por inatividade ocorre
   */
  onLogout?: () => void;
}

export function useInactivityTimeout({
  warningMinutes = 12,
  logoutMinutes = 15,
  onWarning,
  onLogout,
}: UseInactivityTimeoutProps = {}) {
  const { logout, user } = useAuth();
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const warningMs = warningMinutes * 60 * 1000;
  const logoutMs = logoutMinutes * 60 * 1000;

  const resetTimers = () => {
    // Limpar timers anteriores
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    setIsWarningVisible(false);

    // Timeout de aviso
    warningTimeoutRef.current = setTimeout(() => {
      setIsWarningVisible(true);
      onWarning?.();
    }, warningMs);

    // Timeout de logout
    timeoutRef.current = setTimeout(() => {
      setIsWarningVisible(false);
      onLogout?.();
      logout();
    }, logoutMs);
  };

  const dismissWarning = () => {
    setIsWarningVisible(false);
    resetTimers();
  };

  useEffect(() => {
    // Só ativar se usuário estiver logado
    if (!user) return;

    const events = [
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'click',
      'mousemove',
    ];

    const handleActivity = () => {
      resetTimers();
    };

    // Iniciar timers
    resetTimers();

    // Adicionar listeners para atividade do usuário
    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [user]);

  return {
    isWarningVisible,
    dismissWarning,
  };
}
