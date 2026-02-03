import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Eye, Edit, Trash2, Search, Filter, Star } from 'lucide-react';
import { trainerApi, Routine as ApiRoutine } from '../services/api';
import axios from '../services/axiosConfig';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import '../styles/modern-design.css';

interface Exercise {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
}

interface RoutineManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Routine extends ApiRoutine {
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

const RoutineManagement: React.FC<RoutineManagementProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [myRoutines, setMyRoutines] = useState<Routine[]>([]);
  const [presetRoutines, setPresetRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    console.log('🔍 RoutineManagement useEffect - isOpen:', isOpen);
    if (isOpen) {
      console.log('🔄 Ejecutando fetchRoutines y fetchPresetRoutines...');
      fetchRoutines();
      fetchPresetRoutines();
    }
  }, [isOpen]);

  const fetchRoutines = async () => {
    console.log('🔍 fetchRoutines - user:', user);
    if (!user || user.role !== 'TRAINER') {
      console.log('❌ Usuario no válido o no es entrenador');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Llamando a trainerApi.getRoutines()...');
      const response = await trainerApi.getRoutines();
      console.log('✅ Respuesta de getRoutines:', response);
      console.log('✅ Datos de rutinas:', response.data);
      setMyRoutines(response.data);
    } catch (error) {
      console.error('❌ Error fetching routines:', error);
      setError('Error al cargar las rutinas');
      toast.error('Error al cargar las rutinas');
    } finally {
      setLoading(false);
    }
  };

  const fetchPresetRoutines = async () => {
    try {
      console.log('🔄 Obteniendo rutinas prediseñadas...');
      // Usar axios directamente con la configuración de autenticación
      const response = await axios.get('/routine-templates?includePresets=true');
      if (response.data && response.data.success) {
        setPresetRoutines(response.data.data || []);
        console.log('✅ Rutinas prediseñadas cargadas:', response.data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching preset routines:', error);
    }
  };

  const handleDeleteRoutine = async (routineId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta rutina?')) {
      return;
    }

    try {
      await trainerApi.deleteRoutine(routineId);
      setMyRoutines(prev => prev.filter(routine => routine.id !== routineId));
      toast.success('Rutina eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting routine:', error);
      toast.error('Error al eliminar la rutina');
    }
  };

  const handleCreateRoutine = () => {
    navigate('/trainer/routines/create');
    onClose();
  };

  const handleViewRoutine = (routineId: string) => {
    navigate(`/trainer/routines/${routineId}`);
    onClose();
  };

  const handleEditRoutine = (routineId: string) => {
    navigate(`/trainer/routines/${routineId}/edit`);
    onClose();
  };

  const filteredRoutines = myRoutines.filter(routine =>
    routine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Combinar rutinas propias y prediseñadas para mostrar en una sola lista
  const allRoutines = [
    ...filteredRoutines.map(routine => ({ ...routine, type: 'personal' })),
    ...presetRoutines
      .filter(routine => routine.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(routine => ({ ...routine, type: 'preset' }))
  ];

  const handleSelectPresetRoutine = (routine: any) => {
    console.log('Rutina prediseñada seleccionada:', routine);
    onClose();
    // Navigate to create routine page with preset data
    navigate('/trainer/create-routine', {
      state: {
        presetRoutine: routine
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f0f10] rounded-lg shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden border border-gray-800">
        {/* Header */}
        <div 
          className="tf-header-gradient flex items-center justify-between p-4 sm:p-6 border-b border-gray-700 h-20"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold text-xs sm:text-sm">TF</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-white">Biblioteca de Rutinas</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-red-200 transition-colors p-1 sm:p-2 hover:bg-red-800 rounded-full"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-120px)] bg-[#0f0f10]">
          <div>
            {/* Search and Create Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                type="text"
                  placeholder="Buscar rutinas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="modern-input tf-search w-full pl-10 pr-4"
                />
              </div>
              <button
                onClick={handleCreateRoutine}
                className="tf-btn tf-btn-primary whitespace-nowrap"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Nueva Rutina</span>
                <span className="sm:hidden">Nueva</span>
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-[#dc2626]/20 border border-[#dc2626]/30 rounded-lg p-4 mb-6">
                <p className="text-[#fca5a5]">{error}</p>
              </div>
            )}

            {/* Routines Grid */}
            {!loading && !error && (
              <div>
                <p className="text-sm text-gray-400 mb-6 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                  <span className="font-semibold text-white">Total de rutinas:</span> {allRoutines.length} 
                  <span className="text-gray-300 ml-2 block sm:inline">
                    ({filteredRoutines.length} propias, {presetRoutines.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase())).length} prediseñadas)
                  </span>
                </p>
                <div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-6 sm:gap-y-8"
                >
                  {allRoutines.length > 0 ? (
                    allRoutines.map((routine) => (
                      <div 
                        key={`${routine.type}-${routine.id}`} 
                        className="tf-card modern-card p-4 sm:p-6 group flex flex-col justify-between min-h-[320px] h-full"
                      >
                        <div className="flex-1">
                          <div className="mb-3 sm:mb-4">
                            <div className="flex items-start gap-3 sm:gap-4">
                              {routine.type === 'preset' ? (
                                <div className="w-10 h-10 bg-gradient-to-r from-[#ff4444] to-[#e6342a] rounded-full flex items-center justify-center flex-shrink-0">
                                  <Star className="text-white" size={16} />
                                </div>
                              ) : (
                                <div className="w-10 h-10 bg-gradient-to-r from-[#dc2626] to-[#b91c1c] rounded-full flex items-center justify-center flex-shrink-0">
                                  <Eye className="text-white" size={16} />
                                </div>
                              )}
                              <div className="flex flex-col">
                                <h3 className="font-bold text-white text-base sm:text-lg tf-title tf-text-solid leading-snug group-hover:text-red-400 transition-colors">{routine.name}</h3>
                                {routine.type === 'preset' ? (
                                  <span className="predesigned-chip mt-1">Prediseñada</span>
                                ) : (
                                  <span className="personal-chip mt-1">Mi Rutina</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {routine.description && (
                            <p className="text-gray-300 text-sm mb-4 line-clamp-3 group-hover:line-clamp-none leading-relaxed tf-text-solid">{routine.description}</p>
                          )}
                          
                          <div className="text-sm text-gray-300 mb-4 bg-[#1E1E1E] p-3 rounded-lg border border-[#333]">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              <span className="font-semibold text-white tf-text-solid">{routine.exercises?.length || 0} ejercicios</span>
                            </div>
                            {routine.type === 'preset' && routine.trainingObjective && (
                              <div className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                                <span className="text-gray-300 tf-text-solid">
                                  Objetivo: <span className="text-white font-medium">{routine.trainingObjective}</span>
                                </span>
                              </div>
                            )}
                            {routine.type === 'personal' && routine.createdAt && (
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                                <span className="text-gray-300 tf-text-solid">
                                  Creada: <span className="text-white font-medium">{new Date(routine.createdAt).toLocaleDateString()}</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 mt-4 pr-2 sm:pr-3">
                          {routine.type === 'personal' ? (
                            <>
                              <button
                                onClick={() => handleViewRoutine(routine.id)}
                                className="tf-btn tf-btn-secondary flex-1 text-sm w-full sm:w-auto"
                              >
                                <Eye size={14} />
                                Ver
                              </button>
                              <button
                                onClick={() => handleEditRoutine(routine.id)}
                                className="tf-btn tf-btn-neutral flex-1 text-sm w-full sm:w-auto"
                              >
                                <Edit size={14} />
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteRoutine(routine.id)}
                                className="tf-btn tf-btn-danger flex-shrink-0 text-sm w-full sm:w-auto"
                              >
                                <Trash2 size={14} />
                                <span className="sm:hidden ml-2">Eliminar</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleSelectPresetRoutine(routine)}
                              className="tf-btn tf-btn-primary w-full text-sm"
                            >
                              <Star size={14} />
                              Usar Rutina
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <Eye className="mx-auto text-gray-400 mb-4" size={48} />
                      <h3 className="text-lg font-medium text-white mb-2">No hay rutinas</h3>
                      <p className="text-gray-300 mb-4">
                        {searchTerm ? 'No se encontraron rutinas que coincidan con tu búsqueda.' : 'Aún no has creado ninguna rutina.'}
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={handleCreateRoutine}
                          className="tf-btn tf-btn-primary"
                        >
                          Crear primera rutina
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutineManagement;