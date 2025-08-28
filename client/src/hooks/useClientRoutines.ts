import { useState, useEffect } from 'react';
import { clientApi } from '../services/api';

interface Routine {
  id: string;
  name: string;
  description?: string;
  exercises?: any[];
  estimatedDuration?: number;
  difficulty?: string;
  createdAt: string;
  updatedAt: string;
}

interface UseClientRoutinesReturn {
  routines: Routine[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useClientRoutines = (): UseClientRoutinesReturn => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutines = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Obteniendo rutinas asignadas...');
      
      const response = await clientApi.getAssignedRoutines();
      console.log('✅ Rutinas obtenidas:', response);
      console.log('📊 Datos de rutinas:', response.data);
      console.log('📈 Cantidad de rutinas:', response.data?.length || 0);
      
      if (response.success) {
        const routinesData = response.data || [];
        console.log('🎯 Estableciendo rutinas:', routinesData);
        setRoutines(routinesData);
      } else {
        console.log('❌ Respuesta no exitosa:', response);
        setError('Error al obtener las rutinas');
      }
    } catch (err: any) {
      console.error('❌ Error al obtener rutinas:', err);
      setError(err.response?.data?.message || 'Error al cargar las rutinas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  return {
    routines,
    loading,
    error,
    refetch: fetchRoutines
  };
};