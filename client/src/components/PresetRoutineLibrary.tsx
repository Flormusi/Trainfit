import React, { useState, useEffect, useMemo } from 'react';
import axios from '../services/axiosConfig';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  XMarkIcon,
  ClockIcon,
  UserIcon,
  FireIcon,
  CheckCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import './PresetRoutineLibrary.css';

interface PresetRoutine {
  id: string;
  name: string;
  description: string;
  trainingObjective: string;
  level: string;
  gender: string;
  daysPerWeek: number;
  exercises: any[];
  weeks: any[];
}

interface PresetRoutineLibraryProps {
  onSelectRoutine: (routine: PresetRoutine) => void;
  onClose: () => void;
  isOpen: boolean;
}

const PresetRoutineLibrary: React.FC<PresetRoutineLibraryProps> = ({
  onSelectRoutine,
  onClose,
  isOpen
}) => {
  const [routines, setRoutines] = useState<PresetRoutine[]>([]);
  const [filteredRoutines, setFilteredRoutines] = useState<PresetRoutine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    trainingObjective: '',
    level: '',
    gender: '',
    daysPerWeek: ''
  });

  // Generar opciones dinámicas basadas en los datos cargados usando useMemo
  const objectives = useMemo(() => {
    const uniqueObjectives = Array.from(new Set(
      routines
        .map(routine => routine.trainingObjective)
        .filter(Boolean)
        .map(objective => {
          // Normalizar objetivos similares
          const normalized = objective.toLowerCase().trim();
          if (normalized.includes('fuerza') && normalized.includes('resistencia')) {
            return 'fuerza_resistencia';
          }
          if (normalized.includes('resistencia') && normalized.includes('cardio')) {
            return 'resistencia_cardio';
          }
          if (normalized.includes('quema') && normalized.includes('grasa')) {
            return 'quema_grasa';
          }
          if (normalized.includes('estética') || normalized.includes('estetica')) {
            return 'estetica_salud';
          }
          return normalized;
        })
    ));
    
    return [
      { value: '', label: 'Todos los objetivos' },
      ...uniqueObjectives.map(objective => {
        // Crear etiquetas legibles
        let label = '';
        switch (objective) {
          case 'fuerza':
            label = 'Fuerza';
            break;
          case 'hipertrofia':
            label = 'Hipertrofia';
            break;
          case 'resistencia_cardio':
            label = 'Resistencia Cardio';
            break;
          case 'potencia':
            label = 'Potencia';
            break;
          case 'movilidad':
            label = 'Movilidad';
            break;
          case 'fuerza_resistencia':
            label = 'Fuerza Resistencia';
            break;
          case 'quema_grasa':
            label = 'Quema de Grasa';
            break;
          case 'estetica_salud':
            label = 'Estética/Salud General';
            break;
          case 'resistencia':
            label = 'Resistencia';
            break;
          default:
            label = objective.charAt(0).toUpperCase() + objective.slice(1);
        }
        return { value: objective, label };
      })
    ];
  }, [routines]);

  const levels = useMemo(() => {
    const uniqueLevels = Array.from(new Set(
      routines
        .map(routine => routine.level)
        .filter(Boolean)
        .map(level => level.toLowerCase()) // Normalizar a minúsculas para evitar duplicados
    ));
    return [
      { value: '', label: 'Todos los niveles' },
      ...uniqueLevels.map(level => ({ 
        value: level, 
        label: level.charAt(0).toUpperCase() + level.slice(1) // Capitalizar para mostrar
      }))
    ];
  }, [routines]);

  const genders = useMemo(() => {
    const uniqueGenders = Array.from(new Set(routines.map(routine => routine.gender).filter(Boolean)));
    return [
      { value: '', label: 'Todos' },
      ...uniqueGenders.map(gender => ({ 
        value: gender, 
        label: gender.charAt(0).toUpperCase() + gender.slice(1) 
      }))
    ];
  }, [routines]);

  const daysOptions = useMemo(() => {
    const uniqueDays = Array.from(new Set(
      routines
        .map(routine => routine.daysPerWeek)
        .filter(Boolean)
        .sort((a, b) => a - b) // Ordenar numéricamente
    ));
    
    return [
      { value: '', label: 'Cualquier frecuencia' },
      ...uniqueDays.map(days => ({ 
        value: days.toString(), 
        label: `${days} día${days === 1 ? '' : 's'}/semana`
      }))
    ];
  }, [routines]);

  useEffect(() => {
    if (isOpen) {
      fetchRoutines();
    }
  }, [isOpen]);

  useEffect(() => {
    applyFilters();
  }, [routines, searchTerm, filters]);

  const fetchRoutines = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/routine-templates', {
        params: {
          includePresets: 'true'
        }
      });
      if (response.data && response.data.success) {
        setRoutines(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching preset routines:', error);
      console.error('Error details:', error.response?.data);
      setError(`Error al cargar las rutinas prediseñadas: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = routines;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(routine =>
        routine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        routine.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtros específicos
    if (filters.trainingObjective) {
      filtered = filtered.filter(routine => {
        const routineObjective = routine.trainingObjective.toLowerCase().trim();
        
        // Normalizar el objetivo de la rutina para comparar
        let normalizedRoutineObjective = '';
        if (routineObjective.includes('fuerza') && routineObjective.includes('resistencia')) {
          normalizedRoutineObjective = 'fuerza_resistencia';
        } else if (routineObjective.includes('resistencia') && routineObjective.includes('cardio')) {
          normalizedRoutineObjective = 'resistencia_cardio';
        } else if (routineObjective.includes('quema') && routineObjective.includes('grasa')) {
          normalizedRoutineObjective = 'quema_grasa';
        } else if (routineObjective.includes('estética') || routineObjective.includes('estetica')) {
          normalizedRoutineObjective = 'estetica_salud';
        } else {
          normalizedRoutineObjective = routineObjective;
        }
        
        return normalizedRoutineObjective === filters.trainingObjective;
      });
    }

    if (filters.level) {
      filtered = filtered.filter(routine => routine.level.toLowerCase() === filters.level.toLowerCase());
    }

    if (filters.gender) {
      filtered = filtered.filter(routine => routine.gender === filters.gender);
    }

    if (filters.daysPerWeek) {
      filtered = filtered.filter(routine => routine.daysPerWeek === parseInt(filters.daysPerWeek));
    }

    setFilteredRoutines(filtered);
  };

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      trainingObjective: '',
      level: '',
      gender: '',
      daysPerWeek: ''
    });
    setSearchTerm('');
  };

  const getObjectiveColor = (objective: string) => {
    const colors: { [key: string]: string } = {
      'Fuerza': 'bg-[#dc2626]/20 text-[#ff3b30] border-[#dc2626]/30',
      'Hipertrofia': 'bg-[#dc2626]/15 text-[#ff4444] border-[#dc2626]/25',
      'Resistencia': 'bg-[#dc2626]/10 text-[#e6342a] border-[#dc2626]/20',
      'Potencia': 'bg-[#dc2626]/25 text-[#ff3b30] border-[#dc2626]/35',
      'Definición': 'bg-[#dc2626]/18 text-[#ff4444] border-[#dc2626]/28',
      'Quema de Grasa': 'bg-[#dc2626]/22 text-[#ff3b30] border-[#dc2626]/32',
      'Estética y Salud': 'bg-[#dc2626]/12 text-[#e6342a] border-[#dc2626]/22'
    };
    return colors[objective] || 'bg-[#dc2626]/15 text-[#ff4444] border-[#dc2626]/25';
  };

  const getLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      'Principiante': 'bg-[#dc2626]/80',
      'Intermedio': 'bg-[#dc2626]',
      'Avanzado': 'bg-[#b91c1c]',
      'General': 'bg-[#dc2626]/90'
    };
    return colors[level] || 'bg-[#dc2626]/70';
  };

  if (!isOpen) return null;

  return (
    <div className="preset-routine-modal modern-modal">
      <div className="modal-content modern-modal-content">
        {/* Header */}
        <div className="preset-routine-header tf-header-gradient modern-modal-header">
          <h2>Biblioteca de Rutinas</h2>
          <button
            onClick={onClose}
            className="close-button"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido */}
        <div className="preset-routine-content">
          {/* Búsqueda y filtros */}
          <div className="search-filters">
            <input
              type="text"
              className="search-input modern-input tf-search"
              placeholder="Buscar rutinas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="filter-select modern-input"
              value={filters.trainingObjective}
              onChange={(e) => handleFilterChange('trainingObjective', e.target.value)}
            >
              {objectives.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select
              className="filter-select modern-input"
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
            >
              {levels.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select
              className="filter-select modern-input"
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
            >
              {genders.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="preset-routine-loading">
              <div className="loading-spinner"></div>
              <span>Cargando rutinas prediseñadas...</span>
            </div>
          ) : error ? (
            <div className="preset-routine-error">
              <FireIcon />
              <p>{error}</p>
              <button
                onClick={fetchRoutines}
                className="use-routine-button"
                style={{ width: 'auto', marginTop: '16px' }}
              >
                Reintentar
              </button>
            </div>
          ) : filteredRoutines.length === 0 ? (
            <div className="preset-routine-empty">
              <MagnifyingGlassIcon />
              <p>No se encontraron rutinas</p>
              <p style={{ fontSize: '0.875rem', marginTop: '8px' }}>Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            <div className="routines-grid">
              {filteredRoutines.map((routine) => (
                <div
                  key={routine.id}
                  className="preset-routine-card modern-card tf-card"
                  onClick={() => onSelectRoutine(routine)}
                >
                  <div className="routine-header">
                    <div className="flex flex-col items-start">
                      <h3 className="routine-title tf-text-solid">
                        {routine.name}
                      </h3>
                      <span className="predesigned-tag predesigned-chip mt-1">
                        Prediseñada
                      </span>
                    </div>
                  </div>
                  
                  <p className="routine-description tf-text-solid">
                    {routine.description}
                  </p>

                  <div className="routine-details">
                    <div className="routine-detail">
                      <ClockIcon className="icon" />
                      <span className="tf-text-solid">{routine.daysPerWeek} días/sem</span>
                    </div>
                    <div className="routine-detail">
                      <UserIcon className="icon" />
                      <span className="tf-text-solid">{routine.gender}</span>
                    </div>
                    <div className="routine-detail">
                      <FireIcon className="icon" />
                      <span className="tf-text-solid">{routine.level}</span>
                    </div>
                  </div>

                  <div className="routine-actions">
                    <button 
                      className="tf-btn tf-btn-primary w-full sm:w-auto"
                      onClick={(e) => { e.stopPropagation(); onSelectRoutine(routine); }}
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      Usar Rutina
                    </button>
                    <button 
                      className="tf-btn tf-btn-secondary w-full sm:w-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <EyeIcon className="w-4 h-4" />
                      Ver
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PresetRoutineLibrary;