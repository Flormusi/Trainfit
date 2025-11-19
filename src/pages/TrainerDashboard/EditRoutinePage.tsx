import React, { useState, useEffect, ChangeEvent, FormEvent, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as apiService from '../../services/api';
import { getExerciseImageUrl } from '../../services/cloudinaryService';
import ExerciseImage from '../../components/ExerciseImage';
const { trainerApi }: { trainerApi: typeof apiService.trainerApi } = apiService;

// Importar todos los ejercicios
import {
  bicepsExercises,
  cardioExercises,
  circuitoExercises,
  coreExercises,
  dorsalesExercises,
  espinalesExercises,
  gemelosExercises,
  gluteoExercises,
  hombrosExercises,
  isquiosExercises,
  movilidadExercises,
  pectoralesExercises,
  piernasExercises,
  potenciaExercises,
  tricepsExercises
} from '../../data/exercisesIndex';

export interface Client {
  id: string; 
  name: string;
}

export interface ExerciseData {
  id: string; 
  exerciseId: string; 
  name: string; 
  series: string;
  reps: string;
  weight?: string;
  notes?: string;
  image_url?: string;
  day?: number;
}

export interface RoutineData {
  name: string;
  clientId: string;
  duration: string; 
  notes?: string;
  exercises: ExerciseData[];
  totalWeeks?: number;
}

const EditRoutinePage: React.FC = () => {
  const navigate = useNavigate();
  const { routineId } = useParams<{ routineId: string }>();
  const [clients, setClients] = useState<Client[]>([]);
  const [routineData, setRoutineData] = useState<RoutineData>({
    name: '',
    clientId: '',
    duration: '',
    notes: '',
    exercises: [],
    totalWeeks: 4,
  });
  const [availableExercises, setAvailableExercises] = useState<any[]>([]); 
  const [filteredExercises, setFilteredExercises] = useState<any[]>([]);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [showDropdowns, setShowDropdowns] = useState<boolean[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Usuario no autenticado. Por favor, inicia sesión.');
          return;
        }

        // Cargar clientes
        const clientsResponse = await trainerApi.getClients();
        const clientsData = clientsResponse.data || [];
        
        if (Array.isArray(clientsData)) {
          const formattedClients = clientsData.map(client => ({
            id: client.id,
            name: client.name || client.email
          }));
          setClients(formattedClients);
        }

        // Cargar rutina existente
        if (routineId) {
          try {
            const routineResponse = await trainerApi.getRoutineById(routineId);
            const routine = routineResponse.data;
            
            setRoutineData({
              name: routine.name || '',
              clientId: routine.clientId || '',
              duration: routine.duration || '',
              notes: routine.notes || '',
              exercises: routine.exercises || [],
              totalWeeks: typeof routine.totalWeeks === 'number' && !isNaN(routine.totalWeeks) ? routine.totalWeeks : 4,
            });

            // Inicializar términos de búsqueda con los nombres de ejercicios existentes
            const initialSearchTerms = routine.exercises?.map((ex: ExerciseData) => ex.name || '') || [];
            setSearchTerms(initialSearchTerms);
            setShowDropdowns(new Array(routine.exercises?.length || 0).fill(false));
          } catch (routineError) {
            console.error('Error al cargar la rutina:', routineError);
            setError('Error al cargar la rutina. Intenta de nuevo más tarde.');
          }
        }
        
        // Combinar todos los ejercicios
        const allExercises = [
          ...bicepsExercises.map((ex, i) => ({ ...ex, id: `biceps_${i}` })),
          ...cardioExercises.map((ex, i) => ({ ...ex, id: `cardio_${i}` })),
          ...circuitoExercises.map((ex, i) => ({ ...ex, id: `circuito_${i}` })),
          ...coreExercises.map((ex, i) => ({ ...ex, id: `core_${i}` })),
          ...dorsalesExercises.map((ex, i) => ({ ...ex, id: `dorsales_${i}` })),
          ...espinalesExercises.map((ex, i) => ({ ...ex, id: `espinales_${i}` })),
          ...gemelosExercises.map((ex, i) => ({ ...ex, id: `gemelos_${i}` })),
          ...gluteoExercises.map((ex, i) => ({ ...ex, id: `gluteo_${i}` })),
          ...hombrosExercises.map((ex, i) => ({ ...ex, id: `hombros_${i}` })),
          ...isquiosExercises.map((ex, i) => ({ ...ex, id: `isquios_${i}` })),
          ...movilidadExercises.map((ex, i) => ({ ...ex, id: `movilidad_${i}` })),
          ...pectoralesExercises.map((ex, i) => ({ ...ex, id: `pectorales_${i}` })),
          ...piernasExercises.map((ex, i) => ({ ...ex, id: `piernas_${i}` })),
          ...potenciaExercises.map((ex, i) => ({ ...ex, id: `potencia_${i}` })),
          ...tricepsExercises.map((ex, i) => ({ ...ex, id: `triceps_${i}` }))
        ];

        setAvailableExercises(allExercises);
        setFilteredExercises(allExercises);

      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [routineId]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      dropdownRefs.current.forEach((ref, index) => {
        if (ref && !ref.contains(event.target as Node)) {
          const newShowDropdowns = [...showDropdowns];
          newShowDropdowns[index] = false;
          setShowDropdowns(newShowDropdowns);
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdowns]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRoutineData((prevData: RoutineData) => ({ 
      ...prevData,
      [name]: name === 'totalWeeks' ? Math.max(1, parseInt(value || '4', 10)) : value,
    }));
  };

  const handleSearchChange = (index: number, value: string) => {
    const newSearchTerms = [...searchTerms];
    const newShowDropdowns = [...showDropdowns];
    
    newSearchTerms[index] = value;
    newShowDropdowns[index] = value.length > 0;
    
    setSearchTerms(newSearchTerms);
    setShowDropdowns(newShowDropdowns);
  };

  const getFilteredExercisesForIndex = (index: number) => {
    const term = searchTerms[index]?.toLowerCase() || '';
    if (term === '') {
      return availableExercises;
    }
    return availableExercises.filter(exercise => 
      (exercise.name ? exercise.name.toLowerCase() : '').includes(term)
    );
  };

  const selectExercise = (index: number, exercise: any) => {
    const newSearchTerms = [...searchTerms];
    const newShowDropdowns = [...showDropdowns];
    
    newSearchTerms[index] = exercise.name;
    newShowDropdowns[index] = false;
    
    setSearchTerms(newSearchTerms);
    setShowDropdowns(newShowDropdowns);

    const updatedExercises = [...routineData.exercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      exerciseId: exercise.id,
      name: exercise.name,
      image_url: exercise.image_url || getExerciseImageUrl(exercise.name)
    };

    setRoutineData(prevData => ({
      ...prevData,
      exercises: updatedExercises
    }));
  };

  const handleExerciseChange = (index: number, e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    const updatedExercises = [...routineData.exercises];
    if (updatedExercises[index]) {
      updatedExercises[index] = {
        ...updatedExercises[index],
        [name]: value,
      };

      setRoutineData(prevData => ({
        ...prevData,
        exercises: updatedExercises
      }));
    }
  };

  const addExercise = () => {
    const newExercise: ExerciseData = {
      id: `exercise_${Date.now()}`,
      exerciseId: '',
      name: '',
      series: '',
      reps: '',
      weight: '',
      notes: '',
      day: 1
    };

    setRoutineData(prevData => ({
      ...prevData,
      exercises: [...prevData.exercises, newExercise]
    }));

    setSearchTerms([...searchTerms, '']);
    setShowDropdowns([...showDropdowns, false]);
  };

  const removeExercise = (index: number) => {
    setRoutineData((prevData: RoutineData) => ({ 
      ...prevData,
      exercises: prevData.exercises.filter((_, i) => i !== index),
    }));

    setSearchTerms(searchTerms.filter((_, i) => i !== index));
    setShowDropdowns(showDropdowns.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!routineData.name || !routineData.clientId || !routineData.duration) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }

    if (routineData.exercises.length === 0) {
      setError('Debes agregar al menos un ejercicio a la rutina.');
      return;
    }

    try {
      await trainerApi.updateRoutine(routineId!, routineData);
      setSuccessMessage('✅ Rutina actualizada exitosamente!');
      setTimeout(() => {
        navigate('/trainer-dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Error updating routine:', err);
      setError(err.message || 'Error al actualizar la rutina. Intenta de nuevo.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-xl">Cargando rutina...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 border border-[#555555] hover:border-[#777777]"
              >
                ← Volver
              </button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Editar Rutina
              </h1>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg mb-6">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-[#1a1a1a] border border-[#555555] rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 text-white">Información de la Rutina</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Nombre de la Rutina <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={routineData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#ff4444] focus:border-[#ff4444] transition-all duration-300"
                    placeholder="Ej: Rutina de Fuerza - Semana 1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Cliente <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="clientId"
                    value={routineData.clientId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#555555] rounded-lg text-white focus:ring-2 focus:ring-[#ff4444] focus:border-[#ff4444] transition-all duration-300"
                    required
                  >
                    <option value="">Selecciona un cliente</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Duración <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={routineData.duration}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#ff4444] focus:border-[#ff4444] transition-all duration-300"
                    placeholder="Ej: 4 semanas, 45 minutos"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Total de semanas
                  </label>
                  <input
                    type="number"
                    name="totalWeeks"
                    min={1}
                    value={typeof routineData.totalWeeks === 'number' ? routineData.totalWeeks : 4}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#ff4444] focus:border-[#ff4444] transition-all duration-300"
                    placeholder="Ej: 4"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Notas Adicionales
                </label>
                <textarea
                  name="notes"
                  value={routineData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#ff4444] focus:border-[#ff4444] transition-all duration-300 resize-none"
                  placeholder="Instrucciones especiales, objetivos, etc..."
                />
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#555555] rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Ejercicios</h2>
                <button
                  type="button"
                  onClick={addExercise}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  + Agregar Ejercicio
                </button>
              </div>

              <div className="space-y-6">
                {routineData.exercises.map((exercise, index) => (
                  <div key={exercise.id} className="bg-[#1a1a1a] border border-[#555555] rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        Ejercicio {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeExercise(index)}
                        className="bg-[#dc3545]/20 hover:bg-[#dc3545] text-[#dc3545] hover:text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 border border-[#dc3545]/30 hover:border-[#dc3545]"
                      >
                        Eliminar
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="relative" ref={(el) => dropdownRefs.current[index] = el}>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Ejercicio <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={searchTerms[index] || ''}
                          onChange={(e) => handleSearchChange(index, e.target.value)}
                          onFocus={() => {
                            const newShowDropdowns = [...showDropdowns];
                            newShowDropdowns[index] = true;
                            setShowDropdowns(newShowDropdowns);
                          }}
                          className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#ff4444] focus:border-[#ff4444] transition-all duration-300"
                          placeholder="Buscar ejercicio..."
                          required
                        />
                        
                        {showDropdowns[index] && (
                          <div className="absolute z-10 w-full mt-1 bg-[#2a2a2a] border border-[#555555] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {getFilteredExercisesForIndex(index).slice(0, 10).map((ex) => (
                              <div
                                key={ex.id}
                                onClick={() => selectExercise(index, ex)}
                                className="px-4 py-2 hover:bg-[#3a3a3a] cursor-pointer text-white border-b border-[#444444] last:border-b-0"
                              >
                                {ex.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Series <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          name="series"
                          value={exercise.series}
                          onChange={(e) => handleExerciseChange(index, e)}
                          className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#ff4444] focus:border-[#ff4444] transition-all duration-300"
                          placeholder="Ej: 3"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Repeticiones <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          name="reps"
                          value={exercise.reps}
                          onChange={(e) => handleExerciseChange(index, e)}
                          className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#ff4444] focus:border-[#ff4444] transition-all duration-300"
                          placeholder="Ej: 12"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Peso (opcional)
                        </label>
                        <input
                          type="text"
                          name="weight"
                          value={exercise.weight || ''}
                          onChange={(e) => handleExerciseChange(index, e)}
                          className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#ff4444] focus:border-[#ff4444] transition-all duration-300"
                          placeholder="Ej: 20kg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Día
                        </label>
                        <select
                          name="day"
                          value={exercise.day || 1}
                          onChange={(e) => handleExerciseChange(index, e)}
                          className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#555555] rounded-lg text-white focus:ring-2 focus:ring-[#ff4444] focus:border-[#ff4444] transition-all duration-300"
                        >
                          {[1, 2, 3, 4, 5, 6, 7].map(day => (
                            <option key={day} value={day}>Día {day}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Notas del Ejercicio
                      </label>
                      <textarea
                        name="notes"
                        value={exercise.notes || ''}
                        onChange={(e) => handleExerciseChange(index, e)}
                        rows={3}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#ff4444] focus:border-[#ff4444] transition-all duration-300 resize-none"
                        placeholder="Notas adicionales sobre este ejercicio..."
                      />
                    </div>

                    {exercise.image_url && (
                      <div className="mt-4">
                        <ExerciseImage 
                          exerciseName={exercise.name}
                          width={128}
                          height={128}
                          className="rounded-lg"
                          alt={exercise.name}
                        />
                      </div>
                    )}
                  </div>
                ))}

                {routineData.exercises.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-lg mb-4">No hay ejercicios agregados</p>
                    <p className="text-sm">Haz clic en "Agregar Ejercicio" para comenzar</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 border border-[#555555] hover:border-[#777777]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Actualizar Rutina
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditRoutinePage;