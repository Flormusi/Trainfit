import React, { useState, useEffect, ChangeEvent, FormEvent, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as apiService from '../../services/api';
import { getExerciseImageUrl } from '../../services/cloudinaryService';
import ExerciseImage from '../../components/ExerciseImage';
import { useAuth } from '../../contexts/AuthContext';
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
  weightsPerSeries?: number[];
}

export interface RoutineData {
  name: string;
  clientId: string;
  duration: string; 
  notes?: string;
  exercises: ExerciseData[];
  trainingObjective: string;
}

const CreateRoutinePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [routineData, setRoutineData] = useState<RoutineData>({
    name: '',
    clientId: '',
    duration: '',
    notes: '',
    exercises: [],
    trainingObjective: '',
  });
  const [availableExercises, setAvailableExercises] = useState<any[]>([]); 
  const [filteredExercises, setFilteredExercises] = useState<any[]>([]);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [showDropdowns, setShowDropdowns] = useState<boolean[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [pyramidalEnabled, setPyramidalEnabled] = useState<boolean[]>([]);
  const [originalReps, setOriginalReps] = useState<string[]>([]);
  const PYRAMIDAL_SEQUENCE = ['12', '10', '8', '8', '6'];
  const [weightsPerSeries, setWeightsPerSeries] = useState<string[][]>([]);
  const [percentPerExercise, setPercentPerExercise] = useState<number[]>([]);
  const [defaultPercent, setDefaultPercent] = useState<number>(7.5);

  // Cargar porcentaje por defecto desde localStorage al montar (por entrenador)
  useEffect(() => {
    const trainerKey = user?.id ? `defaultPercentIncrement:${user.id}` : 'defaultPercentIncrement';
    try {
      const saved = localStorage.getItem(trainerKey);
      if (saved !== null) {
        const val = parseFloat(saved);
        setDefaultPercent(isNaN(val) ? 7.5 : val);
      } else {
        // Fallback/migración: si no existe la clave por entrenador, intentar leer la global
        const legacy = localStorage.getItem('defaultPercentIncrement');
        if (legacy !== null) {
          const legacyVal = parseFloat(legacy);
          setDefaultPercent(isNaN(legacyVal) ? 7.5 : legacyVal);
        }
      }
    } catch (e) {
      console.warn('No se pudo leer el porcentaje por defecto desde localStorage:', e);
    }
  }, [user?.id]);

  // Guardar porcentaje por defecto en localStorage cuando cambie (por entrenador)
  useEffect(() => {
    const trainerKey = user?.id ? `defaultPercentIncrement:${user.id}` : 'defaultPercentIncrement';
    try {
      localStorage.setItem(trainerKey, defaultPercent.toString());
    } catch (e) {
      console.warn('No se pudo persistir el porcentaje por defecto en localStorage:', e);
    }
  }, [defaultPercent, user?.id]);

  // Sincronizar porcentaje por defecto con backend (leer y escribir)
  useEffect(() => {
    const syncWithBackend = async () => {
      if (!user?.id) return;
      try {
        const profile = await trainerApi.getProfile();
        const backendPercent = profile?.trainerProfile?.defaultPercentIncrement as number | string | undefined;
        const trainerKey = user.id ? `defaultPercentIncrement:${user.id}` : 'defaultPercentIncrement';

        if (backendPercent !== undefined && backendPercent !== null) {
          const val = typeof backendPercent === 'string' ? parseFloat(backendPercent) : backendPercent;
          if (!isNaN(val as number)) {
            setDefaultPercent(val as number);
            try { localStorage.setItem(trainerKey, String(val)); } catch {}
          }
        } else {
          // Si no hay valor en backend, persistir el local actual
          await trainerApi.updateProfile({ defaultPercentIncrement: defaultPercent });
        }
      } catch (e) {
        console.warn('No se pudo sincronizar el porcentaje por defecto con el backend:', e);
      }
    };
    syncWithBackend();
  }, [user?.id]);

  // Actualizar backend cuando cambie el porcentaje por defecto
  useEffect(() => {
    const persistBackend = async () => {
      if (!user?.id) return;
      try {
        await trainerApi.updateProfile({ defaultPercentIncrement: defaultPercent });
      } catch (e) {
        console.warn('No se pudo actualizar el porcentaje por defecto en el backend:', e);
      }
    };
    persistBackend();
  }, [defaultPercent, user?.id]);
  useEffect(() => {
    const fetchClientsAndExercises = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token from localStorage:', token);
        if (!token) {
          setError('Usuario no autenticado. Por favor, inicia sesión.');
          return;
        }

        console.log('Verificando trainerApi:', trainerApi); // Nuevo log
        console.log('Verificando trainerApi.getClients:', trainerApi ? trainerApi.getClients : 'trainerApi no definido'); // Nuevo log

        if (!trainerApi || typeof trainerApi.getClients !== 'function') {
          setError('Error crítico: trainerApi.getClients no está disponible. Revisa la importación y el archivo api.ts.');
          console.error('trainerApi o trainerApi.getClients no es una función', trainerApi);
          setClients([]);
          return;
        }

        const response = await trainerApi.getClients();
        console.log('Response from getClients (API call):', response);
        const clientsData = response.data || [];

        if (Array.isArray(clientsData)) {
          const formattedClients = clientsData.map(client => ({
            id: client.id,
            name: client.name || client.email
          }));
          setClients(formattedClients);
        } else {
          console.error('La respuesta de getClients no es un array válido:', clientsData);
          setError('Error al cargar los clientes: formato de respuesta inesperado.');
          setClients([]);
        }
        
        // Combinar todos los ejercicios y asignarles IDs únicos
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
        // El error 'trainerApi.getClients is not a function' se captura aquí
        console.error('Error fetching clients or exercises:', err);
        if (err.message && err.message.includes('is not a function')){
            setError('Error de configuración: `trainerApi.getClients` no es una función. Verifica la importación del módulo api.');
        } else if (err.response && err.response.headers && err.response.headers['content-type']?.includes('text/html')) {
          setError('Error de autenticación o sesión expirada. Por favor, inicia sesión de nuevo.');
        } else {
          setError('Error al cargar datos iniciales. Intenta de nuevo más tarde.');
        }
        setClients([]); 
      }
    };

    fetchClientsAndExercises();
  }, []);

  // Initialize with preset routine data if available
  useEffect(() => {
    const presetRoutine = location.state?.presetRoutine;
    if (presetRoutine) {
      console.log('Initializing with preset routine:', presetRoutine);
      
      // Convert preset exercises to the format expected by the form
      const presetExercises = presetRoutine.exercises?.map((exercise: any, index: number) => ({
        id: `preset_${index}`,
        exerciseId: exercise.id || `preset_exercise_${index}`,
        name: exercise.name || exercise.exercise || 'Ejercicio sin nombre',
        series: exercise.sets?.toString() || exercise.series?.toString() || '3',
        reps: exercise.reps?.toString() || exercise.repetitions?.toString() || '10',
        weight: exercise.weight?.toString() || '',
        notes: exercise.notes || '',
        image_url: exercise.image_url || ''
      })) || [];

      setRoutineData(prev => ({
        ...prev,
        name: presetRoutine.name || 'Rutina Prediseñada',
        notes: presetRoutine.description || presetRoutine.notes || '',
        exercises: presetExercises
      }));

      // Initialize search terms and dropdowns for preset exercises
      setSearchTerms(presetExercises.map(() => ''));
      setShowDropdowns(presetExercises.map(() => false));
      setPyramidalEnabled(presetExercises.map(() => false));
      setOriginalReps(presetExercises.map((ex: any) => ex.reps?.toString() || ''));
    }
  }, [location.state]);

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
      [name]: value,
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

    // Simular el evento de cambio para actualizar el ejercicio
    const fakeEvent = {
      target: {
        name: 'exerciseId',
        value: exercise.name
      }
    } as ChangeEvent<HTMLSelectElement>;
    
    handleExerciseChange(index, fakeEvent);
  };

  // Modificar la sección de renderizado de ejercicios para incluir la visualización de imágenes
  const handleExerciseChange = (index: number, e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log('Evento de cambio:', { name, value });
    
    const updatedExercises = [...routineData.exercises];
    if (updatedExercises[index]) {
      console.log('Estado actual del ejercicio:', updatedExercises[index]);
      
      updatedExercises[index] = {
        ...updatedExercises[index],
        [name]: value,
      };

      if (name === 'exerciseId') {
        // Buscar el ejercicio seleccionado en todas las categorías de ejercicios
        const categories = [
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
        ];
    
        let foundExercise = null;
        for (const category of categories) {
          const selectedExercise = category.find(ex => ex.name === value);
          if (selectedExercise) {
            foundExercise = selectedExercise;
            break;
          }
        }

        if (foundExercise) {
          console.log('Ejercicio encontrado:', foundExercise);
          // Usar el servicio de Cloudinary para obtener la URL de la imagen
          const imageUrl = getExerciseImageUrl(foundExercise.name, 300, 200);
          updatedExercises[index] = {
            ...updatedExercises[index],
            name: foundExercise.name,
            exerciseId: foundExercise.name,
            image_url: imageUrl
          };
          console.log('Ejercicio actualizado con imagen de Cloudinary:', updatedExercises[index]);
        } else {
          console.log('No se encontró el ejercicio:', value);
        }
      }
    }

    setRoutineData((prevData: RoutineData) => {
      const newData = { 
        ...prevData,
        exercises: updatedExercises,
      };
      console.log('Nuevo estado de rutina:', newData);
      return newData;
    });
  };

  const addExercise = () => {
    setRoutineData((prevData: RoutineData) => ({ 
      ...prevData,
      exercises: [
        ...prevData.exercises,
        { 
          id: Date.now().toString(), 
          exerciseId: '', 
          name: '', 
          series: '', 
          reps: '', 
          weight: '', 
          notes: '',
          image_url: ''
        }, 
      ],
    }));
    
    // Agregar nuevos estados para el nuevo ejercicio
    setSearchTerms(prev => [...prev, '']);
    setShowDropdowns(prev => [...prev, false]);
    setPyramidalEnabled(prev => [...prev, false]);
    setOriginalReps(prev => [...prev, '']);
    setWeightsPerSeries(prev => [...prev, []]);
    // Al agregar ejercicio, heredar el porcentaje por defecto vigente
    setPercentPerExercise(prev => [...prev, defaultPercent]);
  };

  const removeExercise = (index: number) => {
    setRoutineData((prevData: RoutineData) => ({ 
      ...prevData,
      exercises: prevData.exercises.filter((_, i) => i !== index),
    }));
    
    // Remover estados correspondientes
    setSearchTerms(prev => prev.filter((_, i) => i !== index));
    setShowDropdowns(prev => prev.filter((_, i) => i !== index));
    setPyramidalEnabled(prev => prev.filter((_, i) => i !== index));
    setOriginalReps(prev => prev.filter((_, i) => i !== index));
    setWeightsPerSeries(prev => prev.filter((_, i) => i !== index));
    setPercentPerExercise(prev => prev.filter((_, i) => i !== index));
  };

  const togglePyramidal = (index: number) => {
    const enabling = !(pyramidalEnabled[index] || false);
    setPyramidalEnabled(prev => {
      const next = [...prev];
      next[index] = enabling;
      return next;
    });

    if (enabling) {
      // Inicializar pesos por serie si no existen
      setWeightsPerSeries(prev => {
        const next = [...prev];
        const length = PYRAMIDAL_SEQUENCE.length;
        next[index] = next[index] && next[index].length === length ? next[index] : Array(length).fill('');
        return next;
      });
    } else {
      // No-op al desactivar; el campo de peso simple se mostrará y los pesos por serie quedarán en memoria por si se reactiva
    }

    setRoutineData(prevData => {
      const exercises = [...prevData.exercises];
      if (!exercises[index]) return prevData;
      if (enabling) {
        setOriginalReps(prev => {
          const next = [...prev];
          next[index] = exercises[index].reps || '';
          return next;
        });
        exercises[index] = { ...exercises[index], reps: PYRAMIDAL_SEQUENCE.join('-') };
      } else {
        const restored = originalReps[index] || '';
        exercises[index] = { ...exercises[index], reps: restored };
      }
      return { ...prevData, exercises };
    });
  };

  // Manejar cambio de pesos por serie
  const handleSeriesWeightChange = (exerciseIndex: number, seriesIndex: number, value: string) => {
    setWeightsPerSeries(prev => {
      const next = [...prev];
      const arr = next[exerciseIndex] ? [...next[exerciseIndex]] : Array(PYRAMIDAL_SEQUENCE.length).fill('');
      arr[seriesIndex] = value;
      next[exerciseIndex] = arr;
      return next;
    });
  };

  const handlePercentChange = (exerciseIndex: number, value: string) => {
    const parsed = parseFloat(value);
    setPercentPerExercise(prev => {
      const next = [...prev];
      next[exerciseIndex] = isNaN(parsed) ? defaultPercent : parsed;
      return next;
    });
  };

  // Sugerir pesos automáticamente aumentando ~7.5% por serie
  const suggestWeights = (exerciseIndex: number, percent: number = defaultPercent) => {
    const baseStr = weightsPerSeries[exerciseIndex]?.[0] || '';
    const base = parseFloat(String(baseStr).replace(',', '.'));
    if (isNaN(base)) return; // Requiere base válida
    setWeightsPerSeries(prev => {
      const next = [...prev];
      const arr = next[exerciseIndex] ? [...next[exerciseIndex]] : Array(PYRAMIDAL_SEQUENCE.length).fill('');
      for (let i = 0; i < PYRAMIDAL_SEQUENCE.length; i++) {
        const value = i === 0 ? base : base * Math.pow(1 + percent / 100, i);
        arr[i] = String(Math.round(value * 10) / 10);
      }
      next[exerciseIndex] = arr;
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    console.log('Submitting routine data:', routineData);

    if (!routineData.name || !routineData.clientId || !routineData.duration || !routineData.trainingObjective || routineData.exercises.length === 0) {
      setError('Por favor, completa todos los campos obligatorios y añade al menos un ejercicio.');
      return;
    }
    for (const ex of routineData.exercises) {
      if (!ex.exerciseId || !ex.series || !ex.reps) {
        setError('Por favor, completa todos los campos para cada ejercicio (ejercicio, series, repeticiones).');
        return;
      }
    }

    try {
      const payload = {
        ...routineData,
        exercises: routineData.exercises.map((ex, idx) => {
          const isPyr = pyramidalEnabled[idx] && (weightsPerSeries[idx]?.length === PYRAMIDAL_SEQUENCE.length);
          const weightsArray = isPyr
            ? (weightsPerSeries[idx] || []).map(w => {
                const n = parseFloat(String(w).replace(',', '.'));
                return isNaN(n) ? 0 : Math.round(n * 10) / 10;
              })
            : undefined;
          return {
            ...ex,
            // Mantener compatibilidad con el backend actual en 'weight' (string)
            weight: isPyr && weightsArray ? weightsArray.map(n => String(n)).join('-') : (ex.weight || ''),
            // Nuevo campo con mayor flexibilidad para visualizaciones y cálculos
            weightsPerSeries: weightsArray
          };
        })
      };
      const response = await trainerApi.createRoutine(payload);
      console.log('Routine created successfully:', response.data);
      setSuccessMessage('Rutina creada exitosamente!');
      try {
        localStorage.setItem(
          'trainfit_trainingObjective_lastSelection',
          JSON.stringify({ value: routineData.trainingObjective, timestamp: Date.now() })
        );
      } catch (e) {
        console.warn('No se pudo guardar el objetivo en localStorage:', e);
      }
      setRoutineData({
        name: '',
        clientId: '',
        duration: '',
        notes: '',
        exercises: [],
        trainingObjective: '',
      });
      setPyramidalEnabled([]);
      setOriginalReps([]);
      setWeightsPerSeries([]);
      setPercentPerExercise([]);
    } catch (err: any) {
      console.error('Error creating routine:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(`Error al crear la rutina: ${err.response.data.message}`);
      } else if (err.response && err.response.headers && err.response.headers['content-type']?.includes('text/html')) {
        setError('Error de autenticación al crear la rutina. Por favor, inicia sesión de nuevo.');
      }else {
        setError('Error al crear la rutina. Intenta de nuevo más tarde.');
      }
    }
  };

  const renderClientOptions = () => {
    if (!Array.isArray(clients) || clients.length === 0) {
      return <option value="">No hay clientes disponibles o cargando...</option>;
    }
    return clients.map((client) => (
      <option key={client.id} value={client.id}>
        {client.name}
      </option>
    ));
  };

  const handleDashboardClick = () => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/trainer-dashboard');
    } else {
      navigate('/');
    }
  };

  // Actualizar la sección de renderizado para mostrar las imágenes
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#ff4444]">
              Crear Nueva Rutina
            </h1>
            <p className="text-gray-400 mt-2">Diseña una rutina personalizada para tu cliente</p>
          </div>
          <button
            onClick={handleDashboardClick}
            className="px-6 py-3 bg-transparent border border-[#555555] hover:bg-[#333333] hover:border-[#777777] rounded-lg font-medium transition-all duration-300"
          >
            ← Volver al Dashboard
          </button>
        </div>

        {error && (
          <div className="bg-[#dc3545]/10 border border-[#dc3545]/30 text-[#dc3545] px-6 py-4 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <strong className="font-semibold">Error: </strong>
                <span>{error}</span>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-[#28a745]/10 border border-[#28a745]/30 text-[#28a745] px-6 py-4 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <strong className="font-semibold">¡Éxito! </strong>
                <span>{successMessage}</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[#2a2a2a] rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2" htmlFor="name">
                  Nombre de la Rutina <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={routineData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm"
                  placeholder="Ej: Rutina de Fuerza - Semana 1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2" htmlFor="clientId">
                  Cliente <span className="text-red-400">*</span>
                </label>
                <select
                  id="clientId"
                  name="clientId"
                  value={routineData.clientId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white focus:ring-2 focus:ring-[#ff4444] focus:border-[#ff4444] transition-all duration-300"
                  required
                >
                  <option value="" className="bg-gray-700">Selecciona un cliente</option>
                  {renderClientOptions()}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2" htmlFor="trainingObjective">
                  Objetivo de entrenamiento <span className="text-red-400">*</span>
                </label>
                <select
                  id="trainingObjective"
                  name="trainingObjective"
                  value={routineData.trainingObjective}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white focus:ring-2 focus:ring-[#ff4444] focus:border-[#ff4444] transition-all duration-300"
                  required
                >
                  <option value="">Selecciona un objetivo</option>
                  <option value="Fuerza">Fuerza</option>
                  <option value="Hipertrofia">Hipertrofia</option>
                  <option value="Fuerza resistencia">Fuerza resistencia</option>
                  <option value="Resistencia cardio">Resistencia cardio</option>
                  <option value="Potencia">Potencia</option>
                  <option value="Quema grasa">Quema grasa</option>
                  <option value="Estética/salud general">Estética/salud general</option>
                  <option value="Movilidad">Movilidad</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2" htmlFor="duration">
                  Duración <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={routineData.duration}
                  onChange={handleChange}
                  placeholder="Ej: 45 minutos"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2" htmlFor="notes">
                  Notas
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={routineData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm resize-none"
                  placeholder="Notas adicionales sobre la rutina..."
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Ejercicios</h3>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <span className="font-semibold">Porcentaje por defecto:</span>
                  <select
                    value={defaultPercent}
                    onChange={(e) => setDefaultPercent(parseFloat(e.target.value))}
                    className="px-3 py-2 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white"
                  >
                    <option value={5}>5%</option>
                    <option value={7.5}>7.5%</option>
                    <option value={10}>10%</option>
                  </select>
                  <span className="text-xs text-gray-400">Los nuevos ejercicios heredan este valor.</span>
                </div>
              </div>

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
                        placeholder="Escribe para buscar ejercicios..."
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#ff4444] focus:border-[#ff4444] transition-all duration-300"
                        required
                      />
                  
                      {showDropdowns[index] && (
                        <div className="absolute z-10 w-full bg-[#2a2a2a] border border-[#555555] rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                          {getFilteredExercisesForIndex(index).length > 0 ? (
                            getFilteredExercisesForIndex(index).map((ex) => (
                              <div
                                key={ex.id}
                                onClick={() => selectExercise(index, ex)}
                                className="px-4 py-3 hover:bg-[#333333] cursor-pointer border-b border-[#555555] last:border-b-0 text-white hover:text-[#ff4444] transition-all duration-200"
                              >
                                {ex.name}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-gray-400 text-sm">
                              No se encontraron ejercicios
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {exercise.name && (
                      <div className="col-span-1 md:col-span-2 lg:col-span-1">
                        <p className="text-sm font-semibold text-gray-300 mb-2">Imagen del ejercicio:</p>
                        <ExerciseImage
                          exerciseName={exercise.name}
                          width={300}
                          height={200}
                          className="rounded-xl shadow-lg border border-gray-600/30"
                          alt={exercise.name}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Series <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="series"
                        value={exercise.series}
                        onChange={(e) => handleExerciseChange(index, e)}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#ff4444] focus:border-[#ff4444] transition-all duration-300"
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
                        disabled={pyramidalEnabled[index]}
                      />
                    </div>

                    {/* Toggle piramidal y visualización de secuencia */}
                    <div className="col-span-full flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => togglePyramidal(index)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${pyramidalEnabled[index] ? 'bg-[#ff4444] text-white border-[#ff4444]' : 'bg-[#1a1a1a] text-gray-200 border-[#555555] hover:bg-[#333333]'} `}
                        aria-pressed={pyramidalEnabled[index] ? 'true' : 'false'}
                        title="Repeticiones piramidales"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16M4 6h16M4 18h16" />
                        </svg>
                        Repeticiones piramidales {pyramidalEnabled[index] ? 'activadas' : 'desactivadas'}
                      </button>
                      {pyramidalEnabled[index] && (
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <span className="font-semibold">Secuencia:</span>
                          {PYRAMIDAL_SEQUENCE.map((rep, i) => (
                            <span key={`${index}-seq-${i}`} className="px-2 py-1 rounded bg-[#2a2a2a] border border-[#555555]">{rep}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="col-span-full">
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        {pyramidalEnabled[index] ? 'Peso por serie' : 'Peso'}
                      </label>
                      {pyramidalEnabled[index] ? (
                        <div>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
                            {PYRAMIDAL_SEQUENCE.map((rep, i) => (
                              <div key={`${index}-w-${i}`} className="flex flex-col">
                                <span className="text-xs text-gray-400 mb-1">Serie {i + 1} ({rep} reps)</span>
                                <input
                                  type="text"
                                  value={weightsPerSeries[index]?.[i] || ''}
                                  onChange={(e) => handleSeriesWeightChange(index, i, e.target.value)}
                                  className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm"
                                  placeholder="Ej: 20"
                                />
                              </div>
                            ))}
                          </div>
                          {(weightsPerSeries[index]?.[0] ?? '').toString().trim() !== '' && (
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-300">Incremento:</span>
                                <select
                                  value={percentPerExercise[index] ?? defaultPercent}
                                  onChange={(e) => handlePercentChange(index, e.target.value)}
                                  className="px-3 py-2 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white"
                                >
                                  <option value={5}>5%</option>
                                  <option value={7.5}>7.5%</option>
                                  <option value={10}>10%</option>
                                </select>
                              </div>
                              <button
                                type="button"
                                onClick={() => suggestWeights(index, percentPerExercise[index] ?? defaultPercent)}
                                className="bg-[#1a1a1a] hover:bg-[#333333] text-gray-200 font-medium py-2 px-4 rounded-lg transition-all duration-300 border border-[#555555]"
                                title={`Sugerir pesos por serie (+${percentPerExercise[index] ?? defaultPercent}% por serie)`}
                              >
                                Sugerir pesos
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <input
                          type="text"
                          name="weight"
                          value={exercise.weight || ''}
                          onChange={(e) => handleExerciseChange(index, e)}
                          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm"
                          placeholder="Ej: 20kg"
                        />
                      )}
                    </div>

                    <div className="col-span-full">
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Notas del ejercicio
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
                  </div>
                </div>
              ))}
              
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={addExercise}
                  className="bg-[#ff4444] hover:bg-[#ff3333] text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-300 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Agregar Ejercicio
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                className="bg-[#ff4444] hover:bg-[#ff3333] text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Crear Rutina
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRoutinePage;