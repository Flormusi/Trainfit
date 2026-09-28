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
      console.log("✅ Rutinas obtenidas:");
      console.log("📊 Datos de rutinas:");
      console.log("📈 Cantidad de rutinas:");
      
      const routinesData = response.data || response || [];
      console.log("🎯 Estableciendo rutinas:");
      setRoutines(Array.isArray(routinesData) ? routinesData : []);
    } catch (err: any) {
      console.error("❌ Error al obtener rutinas:");
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