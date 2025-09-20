import { useCallback, useState } from 'react';
import { DynamoDBService, Usuario } from '../services/DynamoService';

export const useRegistro = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const registrarUsuario = useCallback(async (usuarioData: {
    nombre: string;
    email: string;
    password: string;
    telefono?: string;
  }) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const wallet = `wallet_${Date.now()}`;
      
      const usuario: Omit<Usuario, 'fechaRegistro' | 'ultimaActualizacion' | 'estancias'> = {
        id: `USER#${Date.now()}`,
        nombre: usuarioData.nombre,
        email: usuarioData.email,
        password: usuarioData.password,
        telefono: usuarioData.telefono,
        wallet: wallet
      };

      const resultado = await DynamoDBService.crearUsuario(usuario);
      setSuccess(true);
      return resultado;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const limpiarEstado = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    loading,
    error,
    success,
    registrarUsuario,
    limpiarEstado
  };
};