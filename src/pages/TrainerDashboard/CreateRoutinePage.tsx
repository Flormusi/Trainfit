import React, { useState, useEffect, ChangeEvent, FormEvent, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as apiService from '../../services/api';
import { getExerciseImageUrl } from '../../services/cloudinaryService';
import ExerciseImage from '../../components/ExerciseImage';
import { useAuth } from '../../contexts/AuthContext';
const { trainerApi }: { trainerApi: typeof apiService.trainerApi } = apiService;

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

interface WeekData {
  series: string;
  reps: string;
  peso: string;
}

export interface ExerciseData {
  id: string;
  exerciseId: string;
  name: string;
  notes?: string;
  image_url?: string;
  video_url?: string;
  rpe?: string;
  pyramidal?: boolean;
  inCircuit?: boolean;
  weeks: {
    week1: WeekData;
    week2: WeekData;
    week3: WeekData;
    week4: WeekData;
  };
  // campos legacy para compatibilidad con el backend
  series?: string;
  reps?: string;
  weight?: string;
}

export interface RoutineData {
  name: string;
  clientId: string;
  duration: string;
  notes?: string;
  exercises: ExerciseData[];
  trainingObjective: string;
  totalWeeks?: number;
}

const emptyWeek = (): WeekData => ({ series: '', reps: '', peso: '' });

const emptyExercise = (): ExerciseData => ({
  id: Date.now().toString() + Math.random(),
  exerciseId: '',
  name: '',
  notes: '',
  image_url: '',
  video_url: '',
  rpe: '',
  pyramidal: false,
  weeks: {
    week1: emptyWeek(),
    week2: emptyWeek(),
    week3: emptyWeek(),
    week4: emptyWeek(),
  },
});

const WEEK_LABELS = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
const WEEK_KEYS = ['week1', 'week2', 'week3', 'week4'] as const;

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
    totalWeeks: 4,
  });

  const [availableExercises, setAvailableExercises] = useState<any[]>([]);
  const [customExercises, setCustomExercises] = useState<any[]>([]);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [showDropdowns, setShowDropdowns] = useState<boolean[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);

  const DRAFT_KEY = 'trainfit_routine_draft';

  // Detectar borrador al cargar
  useEffect(() => {
    if (location.state?.presetRoutine) return; // no ofrecer borrador si viene de preset
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.name || draft.exercises?.length > 0) setHasDraft(true);
      }
    } catch { /* ignorar */ }
  }, []);

  // Auto-save en localStorage cada vez que cambia routineData
  useEffect(() => {
    if (!routineData.name && routineData.exercises.length === 0) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(routineData));
    } catch { /* ignorar */ }
  }, [routineData]);

  const loadDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        setRoutineData(draft);
        setSearchTerms((draft.exercises || []).map((ex: any) => ex.name || ''));
        setShowDropdowns((draft.exercises || []).map(() => false));
        setHasDraft(false);
      }
    } catch { /* ignorar */ }
  };

  const discardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
  };

  // Cargar clientes y ejercicios
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { setError('Usuario no autenticado.'); return; }

        if (!trainerApi || typeof trainerApi.getClients !== 'function') {
          setError('Error crítico: trainerApi.getClients no disponible.');
          return;
        }

        const response = await trainerApi.getClients();
        const clientsData = response.data || [];
        if (Array.isArray(clientsData)) {
          setClients(clientsData.map((c: any) => ({ id: c.id, name: c.name || c.email })));
        }

        // Cargar ejercicios personalizados de la trainer
        try {
          const customRes = await trainerApi.getExercises();
          const customData: any = customRes.data;
          const custom = (customData?.data || customData || []).map((ex: any) => ({
            ...ex,
            id: `custom_${ex.id}`,
            isCustom: true,
          }));
          setCustomExercises(custom);
        } catch {
          // Si falla, continúa sin ejercicios custom
        }

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
          ...tricepsExercises.map((ex, i) => ({ ...ex, id: `triceps_${i}` })),
        ];
        setAvailableExercises(allExercises);
      } catch (err: any) {
        setError('Error al cargar datos. Intenta de nuevo.');
      }
    };
    fetchData();
  }, []);

  // Preset desde biblioteca
  useEffect(() => {
    const presetRoutine = location.state?.presetRoutine;
    if (presetRoutine) {
      const presetExercises: ExerciseData[] = (presetRoutine.exercises || []).map((ex: any, i: number) => ({
        id: `preset_${i}`,
        exerciseId: ex.id || `preset_exercise_${i}`,
        name: ex.name || ex.exercise || 'Ejercicio sin nombre',
        notes: ex.notes || '',
        image_url: ex.image_url || '',
        weeks: {
          week1: { series: ex.sets?.toString() || ex.series?.toString() || '3', reps: ex.reps?.toString() || '10', peso: ex.weight?.toString() || '' },
          week2: emptyWeek(),
          week3: emptyWeek(),
          week4: emptyWeek(),
        },
      }));
      setRoutineData(prev => ({
        ...prev,
        name: presetRoutine.name || 'Rutina Prediseñada',
        notes: presetRoutine.description || presetRoutine.notes || '',
        exercises: presetExercises,
      }));
      setSearchTerms(presetExercises.map((ex) => ex.name));
      setShowDropdowns(presetExercises.map(() => false));
    }
  }, [location.state]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      dropdownRefs.current.forEach((ref, index) => {
        if (ref && !ref.contains(event.target as Node)) {
          setShowDropdowns(prev => { const n = [...prev]; n[index] = false; return n; });
        }
      });
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRoutineData(prev => ({ ...prev, [name]: name === 'totalWeeks' ? Math.max(1, parseInt(value || '4', 10)) : value }));
  };

  const getFilteredExercises = (index: number) => {
    const term = (searchTerms[index] || '').toLowerCase();
    const allExs = [
      ...customExercises.map(e => ({ ...e, _group: '⭐ Mis ejercicios' })),
      ...availableExercises.map(e => ({ ...e, _group: 'Biblioteca' })),
    ];
    if (!term) return allExs;
    return allExs.filter(ex => (ex.name || '').toLowerCase().includes(term));
  };

  const selectExercise = (index: number, ex: any) => {
    setSearchTerms(prev => { const n = [...prev]; n[index] = ex.name; return n; });
    setShowDropdowns(prev => { const n = [...prev]; n[index] = false; return n; });
    const imageUrl = ex.isCustom
      ? (ex.imageUrl || '')
      : getExerciseImageUrl(ex.name, 300, 200);
    const videoUrl = ex.isCustom ? (ex.videoUrl || '') : '';
    setRoutineData(prev => {
      const exercises = [...prev.exercises];
      exercises[index] = { ...exercises[index], name: ex.name, exerciseId: ex.name, image_url: imageUrl, video_url: videoUrl };
      return { ...prev, exercises };
    });
  };

  const handleWeekChange = (exerciseIndex: number, week: typeof WEEK_KEYS[number], field: keyof WeekData, value: string) => {
    setRoutineData(prev => {
      const exercises = [...prev.exercises];
      exercises[exerciseIndex] = {
        ...exercises[exerciseIndex],
        weeks: {
          ...exercises[exerciseIndex].weeks,
          [week]: { ...exercises[exerciseIndex].weeks[week], [field]: value },
        },
      };
      return { ...prev, exercises };
    });
  };

  const handleNoteChange = (exerciseIndex: number, value: string) => {
    setRoutineData(prev => {
      const exercises = [...prev.exercises];
      exercises[exerciseIndex] = { ...exercises[exerciseIndex], notes: value };
      return { ...prev, exercises };
    });
  };

  const addExercise = () => {
    setRoutineData(prev => ({ ...prev, exercises: [...prev.exercises, emptyExercise()] }));
    setSearchTerms(prev => [...prev, '']);
    setShowDropdowns(prev => [...prev, false]);
  };

  const removeExercise = (index: number) => {
    setRoutineData(prev => ({ ...prev, exercises: prev.exercises.filter((_, i) => i !== index) }));
    setSearchTerms(prev => prev.filter((_, i) => i !== index));
    setShowDropdowns(prev => prev.filter((_, i) => i !== index));
    dropdownRefs.current = dropdownRefs.current.filter((_, i) => i !== index);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!routineData.name || !routineData.clientId || !routineData.duration || !routineData.trainingObjective) {
      setError('Por favor, completá todos los campos obligatorios (nombre, cliente, duración y objetivo).');
      return;
    }
    if (routineData.exercises.length === 0) {
      setError('Agregá al menos un ejercicio antes de guardar.');
      return;
    }
    const emptyRow = routineData.exercises.findIndex(ex => !ex.exerciseId || !ex.name);
    if (emptyRow !== -1) {
      setError(`El ejercicio #${emptyRow + 1} no tiene ningún ejercicio seleccionado. Seleccioná uno o eliminá la fila.`);
      return;
    }

    try {
      const payload = {
        ...routineData,
        totalWeeks: typeof routineData.totalWeeks === 'number' && !isNaN(routineData.totalWeeks) ? routineData.totalWeeks : 4,
        exercises: routineData.exercises.map(ex => ({
          ...ex,
          // compatibilidad legacy con el backend
          series: ex.weeks.week1.series,
          reps: ex.weeks.week1.reps,
          weight: ex.weeks.week1.peso,
        })),
      };
      await trainerApi.createRoutine(payload);
      localStorage.removeItem(DRAFT_KEY);
      setSuccessMessage('¡Rutina creada exitosamente!');
      setRoutineData({ name: '', clientId: '', duration: '', notes: '', exercises: [], trainingObjective: '', totalWeeks: 4 });
      setSearchTerms([]);
      setShowDropdowns([]);
    } catch (err: any) {
      setError(err?.response?.data?.message ? `Error: ${err.response.data.message}` : 'Error al crear la rutina. Intenta de nuevo.');
    }
  };

  const handleBackClick = () => {
    const state: any = location.state || {};
    if (state.fromLibrary) {
      navigate('/trainer/routines/library', { state: { folder: state.folder } });
    } else {
      navigate('/trainer-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#ff4444]">Crear Nueva Rutina</h1>
            <p className="text-gray-400 mt-2">Diseñá una rutina personalizada para tu cliente</p>
          </div>
          <button
            onClick={handleBackClick}
            className="px-6 py-3 bg-transparent border border-[#555555] hover:bg-[#333333] hover:border-[#777777] rounded-lg font-medium transition-all duration-300"
          >
            ← {((location.state as any)?.fromLibrary) ? 'Volver a la Biblioteca' : 'Volver al Dashboard'}
          </button>
        </div>

        {/* Banner borrador */}
        {hasDraft && (
          <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ color: '#d1d5db', fontSize: 14 }}>📝 Tenés una rutina en borrador. ¿Querés continuar donde lo dejaste?</span>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={loadDraft} style={{ padding: '8px 16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Continuar borrador
              </button>
              <button onClick={discardDraft} style={{ padding: '8px 16px', background: 'transparent', color: '#9ca3af', border: '1px solid #374151', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                Descartar
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-[#dc3545]/10 border border-[#dc3545]/30 text-[#dc3545] px-6 py-4 rounded-lg mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-[#28a745]/10 border border-[#28a745]/30 text-[#28a745] px-6 py-4 rounded-lg mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Datos generales */}
          <div className="bg-[#2a2a2a] rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Datos generales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Nombre de la rutina <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={routineData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#ff4444] focus:border-[#ff4444] transition-all"
                  placeholder="Ej: Día 2 - Piernas"
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
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white focus:ring-2 focus:ring-[#ff4444] transition-all"
                  required
                >
                  <option value="">Seleccioná un cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Objetivo <span className="text-red-400">*</span>
                </label>
                <select
                  name="trainingObjective"
                  value={routineData.trainingObjective}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white focus:ring-2 focus:ring-[#ff4444] transition-all"
                  required
                >
                  <option value="">Seleccioná un objetivo</option>
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
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Duración <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="duration"
                  value={routineData.duration}
                  onChange={handleChange}
                  placeholder="Ej: 60 minutos"
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#ff4444] transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Total de semanas</label>
                <input
                  type="number"
                  name="totalWeeks"
                  min={1}
                  max={4}
                  value={routineData.totalWeeks ?? 4}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#ff4444] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Notas generales</label>
                <textarea
                  name="notes"
                  value={routineData.notes}
                  onChange={handleChange}
                  rows={1}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#ff4444] transition-all resize-none"
                  placeholder="Notas sobre la rutina..."
                />
              </div>
            </div>
          </div>

          {/* Tabla de ejercicios */}
          <div className="bg-[#2a2a2a] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Ejercicios</h2>
              <button
                type="button"
                onClick={addExercise}
                className="bg-[#ff4444] hover:bg-[#ff3333] text-white font-semibold py-2.5 px-5 rounded-lg transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Agregar ejercicio
              </button>
            </div>

            {routineData.exercises.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-lg">Hacé clic en "Agregar ejercicio" para empezar</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse" style={{ minWidth: '1100px' }}>
                  <thead>
                    <tr className="text-xs font-semibold text-gray-400 uppercase">
                      <th className="text-left py-3 px-2 w-8">#</th>
                      <th className="text-left py-3 px-2" style={{ minWidth: '200px' }}>Ejercicio</th>
                      <th className="text-left py-3 px-2" style={{ minWidth: '120px' }}>Nota</th>
                      <th className="text-center py-3 px-2 border-l border-[#444]" style={{ minWidth: '70px' }}>
                        <span className="text-orange-400">RPE</span>
                      </th>
                      {WEEK_LABELS.map((label, wi) => (
                        <th key={wi} colSpan={3} className="text-center py-3 px-2 border-l border-[#444]" style={{ minWidth: '180px' }}>
                          <span className="text-[#ff4444]">{label}</span>
                        </th>
                      ))}
                      <th className="w-8"></th>
                    </tr>
                    <tr className="text-xs text-gray-500 border-b border-[#444]">
                      <th></th>
                      <th></th>
                      <th></th>
                      <th className="py-2 px-1 font-normal text-center border-l border-[#444]">1-10</th>
                      {WEEK_KEYS.map((_, wi) => (
                        <React.Fragment key={wi}>
                          <th className={`py-2 px-1 font-normal text-center ${wi > 0 ? 'border-l border-[#444]' : ''}`}>Serie</th>
                          <th className="py-2 px-1 font-normal text-center">Reps</th>
                          <th className="py-2 px-1 font-normal text-center">Peso/Int</th>
                        </React.Fragment>
                      ))}
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {routineData.exercises.map((exercise, index) => (
                      <tr
                        key={exercise.id}
                        className="border-b border-[#333] hover:bg-[#2f2f2f] transition-colors"
                      >
                        {/* Número */}
                        <td className="py-3 px-2 text-center">
                          <span className="w-7 h-7 rounded-full bg-[#ff4444]/20 text-[#ff4444] text-xs font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                        </td>

                        {/* Ejercicio con buscador */}
                        <td className="py-3 px-2">
                          <div className="relative" ref={(el) => dropdownRefs.current[index] = el}>
                            <input
                              type="text"
                              value={searchTerms[index] || ''}
                              onChange={(e) => {
                                setSearchTerms(prev => { const n = [...prev]; n[index] = e.target.value; return n; });
                                setShowDropdowns(prev => { const n = [...prev]; n[index] = true; return n; });
                              }}
                              onFocus={() => setShowDropdowns(prev => { const n = [...prev]; n[index] = true; return n; })}
                              placeholder="Buscar ejercicio..."
                              className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#555] rounded-lg text-white text-sm placeholder-gray-500 focus:ring-1 focus:ring-[#ff4444] focus:border-[#ff4444] transition-all"
                            />
                            {showDropdowns[index] && (
                              <div className="absolute z-20 w-full bg-[#2a2a2a] border border-[#555] rounded-lg shadow-2xl max-h-48 overflow-y-auto mt-1">
                                {getFilteredExercises(index).length > 0 ? (
                                  getFilteredExercises(index).slice(0, 10).map((ex) => (
                                    <div
                                      key={ex.id}
                                      onClick={() => selectExercise(index, ex)}
                                      className="px-3 py-2 hover:bg-[#333] cursor-pointer border-b border-[#444] last:border-b-0 text-sm text-white hover:text-[#ff4444] transition-all flex items-center gap-2"
                                    >
                                      {ex.isCustom && <span className="text-yellow-400 text-xs">⭐</span>}
                                      {ex.name}
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-3 py-2 text-gray-400 text-sm">Sin resultados</div>
                                )}
                              </div>
                            )}
                          </div>
                          {/* Imagen pequeña si hay ejercicio seleccionado */}
                          {exercise.name && (
                            <div className="mt-2">
                              {exercise.image_url && !exercise.image_url.includes('placeholder') ? (
                                <img src={exercise.image_url} alt={exercise.name} className="rounded-md border border-[#444] opacity-80" style={{width:80,height:55,objectFit:'cover'}} />
                              ) : (
                                <ExerciseImage exerciseName={exercise.name} width={80} height={55} className="rounded-md border border-[#444] opacity-80" alt={exercise.name} />
                              )}
                            </div>
                          )}
                          {/* Link de video */}
                          {exercise.video_url && (
                            <a href={exercise.video_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-[#ff4444] hover:underline">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                              Ver video
                            </a>
                          )}
                          {/* Campo para pegar video manualmente */}
                          <input
                            type="url"
                            value={exercise.video_url || ''}
                            onChange={(e) => {
                              setRoutineData(prev => {
                                const exercises = [...prev.exercises];
                                exercises[index] = { ...exercises[index], video_url: e.target.value };
                                return { ...prev, exercises };
                              });
                            }}
                            placeholder="Link video (opcional)"
                            className="mt-1 w-full px-2 py-1 bg-[#1a1a1a] border border-[#333] rounded text-xs text-gray-300 placeholder-gray-600 focus:ring-1 focus:ring-[#ff4444] transition-all"
                          />
                        </td>

                        {/* Nota */}
                        <td className="py-3 px-2">
                          <textarea
                            value={exercise.notes || ''}
                            onChange={(e) => handleNoteChange(index, e.target.value)}
                            placeholder="Nota..."
                            rows={2}
                            className="w-full px-2 py-1.5 bg-[#1a1a1a] border border-[#555] rounded-lg text-white text-xs placeholder-gray-500 focus:ring-1 focus:ring-[#ff4444] transition-all resize-none"
                          />
                          {/* Toggle piramidal */}
                          <button
                            type="button"
                            onClick={() => setRoutineData(prev => {
                              const exercises = [...prev.exercises];
                              exercises[index] = { ...exercises[index], pyramidal: !exercises[index].pyramidal };
                              return { ...prev, exercises };
                            })}
                            className={`mt-1 w-full text-xs py-1 px-2 rounded border transition-all ${
                              exercise.pyramidal
                                ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                                : 'bg-[#1a1a1a] border-[#444] text-gray-500 hover:text-gray-300'
                            }`}
                            title="Activar repeticiones piramidales"
                          >
                            {exercise.pyramidal ? '▲ Piramidal ON' : '▲ Piramidal'}
                          </button>
                          {/* Toggle en circuito */}
                          <button
                            type="button"
                            onClick={() => setRoutineData(prev => {
                              const exercises = [...prev.exercises];
                              exercises[index] = { ...exercises[index], inCircuit: !exercises[index].inCircuit };
                              return { ...prev, exercises };
                            })}
                            className={`mt-1 w-full text-xs py-1 px-2 rounded border transition-all ${
                              exercise.inCircuit
                                ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
                                : 'bg-[#1a1a1a] border-[#444] text-gray-500 hover:text-gray-300'
                            }`}
                          >
                            {exercise.inCircuit ? '⚡ Circuito ON' : '⚡ Circuito'}
                          </button>
                        </td>

                        {/* RPE */}
                        <td className="py-3 px-1 border-l border-[#444] text-center">
                          <select
                            value={exercise.rpe || ''}
                            onChange={(e) => setRoutineData(prev => {
                              const exercises = [...prev.exercises];
                              exercises[index] = { ...exercises[index], rpe: e.target.value };
                              return { ...prev, exercises };
                            })}
                            className="w-full px-1 py-1.5 bg-[#1a1a1a] border border-[#444] rounded-md text-white text-center text-sm focus:ring-1 focus:ring-orange-400 transition-all"
                          >
                            <option value="">–</option>
                            {[1,2,3,4,5,6,7,8,9,10].map(n => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                          {exercise.rpe && (
                            <div className={`mt-1 text-xs font-semibold ${
                              Number(exercise.rpe) >= 9 ? 'text-red-400' :
                              Number(exercise.rpe) >= 7 ? 'text-orange-400' :
                              Number(exercise.rpe) >= 5 ? 'text-yellow-400' : 'text-green-400'
                            }`}>
                              {Number(exercise.rpe) >= 9 ? 'Máximo' :
                               Number(exercise.rpe) >= 7 ? 'Alto' :
                               Number(exercise.rpe) >= 5 ? 'Moderado' : 'Suave'}
                            </div>
                          )}
                        </td>

                        {/* Semanas */}
                        {WEEK_KEYS.map((week, wi) => (
                          <React.Fragment key={week}>
                            <td className={`py-3 px-1 ${wi > 0 ? 'border-l border-[#444]' : ''}`}>
                              <input
                                type="text"
                                value={exercise.weeks[week].series}
                                onChange={(e) => handleWeekChange(index, week, 'series', e.target.value)}
                                placeholder="–"
                                className="w-full px-2 py-1.5 bg-[#1a1a1a] border border-[#444] rounded-md text-white text-center text-sm placeholder-gray-600 focus:ring-1 focus:ring-[#ff4444] transition-all"
                              />
                            </td>
                            <td className="py-3 px-1">
                              <input
                                type="text"
                                value={exercise.weeks[week].reps}
                                onChange={(e) => handleWeekChange(index, week, 'reps', e.target.value)}
                                placeholder={exercise.pyramidal ? 'ej: 12-10-8' : '–'}
                                className={`w-full px-2 py-1.5 border rounded-md text-center text-sm transition-all focus:ring-1 ${
                                  exercise.pyramidal
                                    ? 'bg-orange-500/10 border-orange-500/40 text-orange-200 placeholder-orange-400/50 focus:ring-orange-400'
                                    : 'bg-[#1a1a1a] border-[#444] text-white placeholder-gray-600 focus:ring-[#ff4444]'
                                }`}
                              />
                            </td>
                            <td className="py-3 px-1">
                              <input
                                type="text"
                                value={exercise.weeks[week].peso}
                                onChange={(e) => handleWeekChange(index, week, 'peso', e.target.value)}
                                placeholder="–"
                                className="w-full px-2 py-1.5 bg-[#1a1a1a] border border-[#444] rounded-md text-white text-center text-sm placeholder-gray-600 focus:ring-1 focus:ring-[#ff4444] transition-all"
                              />
                            </td>
                          </React.Fragment>
                        ))}

                        {/* Eliminar */}
                        <td className="py-3 px-2">
                          <button
                            type="button"
                            onClick={() => removeExercise(index)}
                            className="text-gray-500 hover:text-[#ff4444] transition-colors p-1 rounded"
                            title="Eliminar ejercicio"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Botón agregar al pie de la tabla */}
            {routineData.exercises.length > 0 && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={addExercise}
                  className="text-gray-400 hover:text-[#ff4444] text-sm flex items-center gap-2 py-2 px-4 border border-dashed border-[#444] hover:border-[#ff4444] rounded-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Agregar otro ejercicio
                </button>
              </div>
            )}
          </div>

          {/* Guardar */}
          <div className="flex justify-end pb-8">
            <button
              type="submit"
              className="bg-[#ff4444] hover:bg-[#ff3333] text-white font-bold py-4 px-10 rounded-lg transition-all flex items-center gap-2 text-lg"
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
  );
};

export default CreateRoutinePage;
