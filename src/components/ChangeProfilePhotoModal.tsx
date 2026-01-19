import { useState, useRef } from 'react';
import { Camera, X, Loader2, AlertCircle } from 'lucide-react';
import { usuariosApi } from '../api/usuarios';

interface ChangeProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhotoUrl?: string;
  onPhotoChanged?: (newPhotoUrl: string) => void;
}

export default function ChangeProfilePhotoModal({
  isOpen,
  onClose,
  currentPhotoUrl,
  onPhotoChanged,
}: ChangeProfilePhotoModalProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Formato inválido. Use JPG, PNG ou WebP.');
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsLoading(true);
      setError(null);
      const photoUrl = await usuariosApi.uploadFoto(selectedFile);
      const fullUrl = usuariosApi.getPhotoUrl(photoUrl);
      onPhotoChanged?.(fullUrl || '');
      handleClose();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erro ao fazer upload da foto';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await usuariosApi.removerFoto();
      onPhotoChanged?.('');
      handleClose();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erro ao remover foto';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPreview(null);
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[var(--fh-card)] rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--fh-text)]">Alterar Foto de Perfil</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-[var(--fh-muted)] hover:text-[var(--fh-text)] transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-600 rounded-lg flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Current Photo */}
        {currentPhotoUrl && !preview && (
          <div className="mb-4">
            <p className="text-xs text-[var(--fh-muted)] mb-2">Foto Atual:</p>
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-[var(--fh-gray-50)]">
              <img
                src={currentPhotoUrl}
                alt="Foto atual"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="mb-4">
            <p className="text-xs text-[var(--fh-muted)] mb-2">Pré-visualização:</p>
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-[var(--fh-gray-50)]">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* File Input Area */}
        {!preview && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="mb-4 p-6 border-2 border-dashed border-[var(--fh-border)] hover:border-[var(--fh-primary)] rounded-lg cursor-pointer transition-colors text-center"
          >
            <Camera className="w-8 h-8 text-[var(--fh-muted)] mx-auto mb-2" />
            <p className="text-sm font-medium text-[var(--fh-text)] mb-1">
              Clique para selecionar uma foto
            </p>
            <p className="text-xs text-[var(--fh-muted)]">
              JPG, PNG ou WebP até 5MB
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          disabled={isLoading}
          className="hidden"
        />

        {/* Actions */}
        <div className="flex gap-3">
          {preview && (
            <>
              <button
                onClick={() => {
                  setPreview(null);
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-[var(--fh-border)] text-[var(--fh-text)] font-medium rounded-lg hover:bg-[var(--fh-gray-50)] dark:hover:bg-[var(--fh-gray-900)] transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-[var(--fh-primary)] hover:opacity-90 text-white font-medium rounded-lg transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? 'Enviando...' : 'Confirmar'}
              </button>
            </>
          )}

          {!preview && (
            <>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-[var(--fh-border)] text-[var(--fh-text)] font-medium rounded-lg hover:bg-[var(--fh-gray-50)] dark:hover:bg-[var(--fh-gray-900)] transition-colors disabled:opacity-50"
              >
                Fechar
              </button>
              {currentPhotoUrl && (
                <button
                  onClick={handleRemovePhoto}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Removendo...' : 'Remover'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
