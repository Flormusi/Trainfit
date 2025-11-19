import React, { useState, useEffect } from 'react';
import * as apiService from '../services/api';
import axios from '../services/axiosConfig';

interface RoutineTemplate {
  id: string;
  name: string;
  description?: string;
  trainingObjective: string;
  level: string;
  daysPerWeek: number;
  gender?: string;
  duration?: string;
  exercises: any;
  notes?: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  objective?: string;
  days?: number;
  weeks?: any[];
}

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: RoutineTemplate) => void;
}

interface GenerateTemplateParams {
  objetivo: string;
  dias: number;
  nivel: string;
  genero: string;
}

interface Filters {
  trainingObjective: string;
  level: string;
  daysPerWeek: string;
  gender: string;
}

const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, onSelectTemplate }) => {
  const [templates, setTemplates] = useState<RoutineTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<RoutineTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'existing' | 'generate'>('existing');
  const [generatingTemplate, setGeneratingTemplate] = useState(false);
  const [generateParams, setGenerateParams] = useState<GenerateTemplateParams>({
    objetivo: '',
    dias: 3,
    nivel: '',
    genero: 'unisex'
  });
  const [filters, setFilters] = useState<Filters>({
    trainingObjective: '',
    level: '',
    daysPerWeek: '',
    gender: ''
  });

  // Opciones para filtros
  const trainingObjectives = [
    { value: '', label: 'Todos los objetivos' },
    { value: 'Fuerza', label: 'Fuerza' },
    { value: 'Hipertrofia', label: 'Hipertrofia' },
    { value: 'Resistencia', label: 'Resistencia' },
    { value: 'Potencia', label: 'Potencia' },
    { value: 'Definición', label: 'Definición' }
  ];

  const levels = [
    { value: '', label: 'Todos los niveles' },
    { value: 'Principiante', label: 'Principiante' },
    { value: 'Intermedio', label: 'Intermedio' },
    { value: 'Avanzado', label: 'Avanzado' },
    { value: 'General', label: 'General' }
  ];

  const daysPerWeekOptions = [
    { value: '', label: 'Cualquier frecuencia' },
    { value: '2', label: '2 días/semana' },
    { value: '3', label: '3 días/semana' },
    { value: '4', label: '4 días/semana' },
    { value: '5', label: '5 días/semana' },
    { value: '6', label: '6 días/semana' }
  ];

  const genderOptions = [
    { value: '', label: 'Cualquier género' },
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'unisex', label: 'Unisex' }
  ];

  // Opciones para generación de plantillas
  const generateObjectives = [
    { value: 'fuerza', label: 'Fuerza' },
    { value: 'hipertrofia', label: 'Hipertrofia' },
    { value: 'resistencia-cardio', label: 'Resistencia Cardio' },
    { value: 'potencia', label: 'Potencia' },
    { value: 'quema-grasa', label: 'Quema Grasa' }
  ];

  const generateLevels = [
    { value: 'principiante', label: 'Principiante' },
    { value: 'intermedio', label: 'Intermedio' },
    { value: 'avanzado', label: 'Avanzado' }
  ];

  const generateGenders = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'unisex', label: 'Unisex' }
  ];

  const generateDays = [
    { value: 2, label: '2 días (Upper/Lower)' },
    { value: 3, label: '3 días (Push/Pull/Legs)' }
  ];

  // Efectos
  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  useEffect(() => {
    applyFilters();
  }, [templates, filters]);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const routines = await apiService.trainerApi.getRoutines();
      if (Array.isArray(routines)) {
        // Convertir rutinas a formato de plantillas
        const templatesFromRoutines = routines.map(routine => ({
          ...routine,
          trainingObjective: routine.notes || 'General',
          level: 'General',
          daysPerWeek: 3,
          creator: {
            id: 'trainer',
            name: 'Entrenador',
            email: 'trainer@trainfit.com'
          },
          createdAt: routine.startDate || new Date().toISOString()
        }));
        setTemplates(templatesFromRoutines);
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Error al cargar las plantillas. Por favor, intenta nuevamente.'
      );
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...templates];

    if (filters.trainingObjective) {
      filtered = filtered.filter(template => 
        template.trainingObjective === filters.trainingObjective
      );
    }

    if (filters.level) {
      filtered = filtered.filter(template => 
        template.level === filters.level
      );
    }

    if (filters.daysPerWeek) {
      filtered = filtered.filter(template => 
        template.daysPerWeek === parseInt(filters.daysPerWeek)
      );
    }

    if (filters.gender) {
      filtered = filtered.filter(template => 
        template.gender === filters.gender
      );
    }

    setFilteredTemplates(filtered);
  };

  const handleFilterChange = (filterName: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      trainingObjective: '',
      level: '',
      daysPerWeek: '',
      gender: ''
    });
  };

  const handleSelectTemplate = (template: RoutineTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  const handleGenerateTemplate = async () => {
    if (!generateParams.objetivo || !generateParams.nivel || !generateParams.genero) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setGeneratingTemplate(true);
    setError(null);

    try {
      // Primero intentar obtener una rutina prediseñada
      const presetResponse = await axios.get('/routines/templates/preset', {
        params: {
          trainingObjective: generateParams.objetivo,
          level: generateParams.nivel,
          gender: generateParams.genero
        }
      });
      
      if (presetResponse.data && presetResponse.data.success) {
        const presetTemplate = presetResponse.data.data;
        
        const templateFormatted: RoutineTemplate = {
          id: `preset-${Date.now()}`,
          name: presetTemplate.name,
          description: presetTemplate.description,
          trainingObjective: presetTemplate.trainingObjective,
          level: presetTemplate.level,
          daysPerWeek: presetTemplate.daysPerWeek,
          exercises: presetTemplate.exercises || [],
          creator: {
            id: 'system',
            name: 'Biblioteca Prediseñada',
            email: 'system@trainfit.com'
          },
          createdAt: new Date().toISOString(),
          gender: presetTemplate.gender,
          weeks: presetTemplate.weeks || []
        };

        onSelectTemplate(templateFormatted);
        onClose();
        return;
      }
    } catch (presetError) {
      console.log('No se encontró rutina prediseñada, generando automáticamente...');
    }

    try {
      // Si no hay rutina prediseñada, generar automáticamente
      const response = await axios.post('/routines/templates', generateParams);
      
      if (response.data && response.data.success) {
        const generatedTemplate = response.data.data;
        
        const templateFormatted: RoutineTemplate = {
          id: `generated-${Date.now()}`,
          name: `Rutina ${generateParams.objetivo} - ${generateParams.nivel}`,
          description: `Rutina generada automáticamente para ${generateParams.objetivo}`,
          trainingObjective: generateParams.objetivo,
          level: generateParams.nivel,
          daysPerWeek: generateParams.dias,
          exercises: generatedTemplate.exercises || [],
          creator: {
            id: 'system',
            name: 'Sistema',
            email: 'system@trainfit.com'
          },
          createdAt: new Date().toISOString(),
          gender: generateParams.genero,
          weeks: generatedTemplate.weeks || []
        };

        onSelectTemplate(templateFormatted);
        onClose();
      } else {
        throw new Error(response.data?.message || 'Error al generar la plantilla');
      }
    } catch (error: any) {
      console.error('Error generating template:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Error al generar la plantilla. Por favor, intenta nuevamente.'
      );
    } finally {
      setGeneratingTemplate(false);
    }
  };

  const getObjectiveColor = (objective: string) => {
    const colors: { [key: string]: string } = {
      'Fuerza': 'border-[#dc2626] text-[#ff3b30]',
      'Hipertrofia': 'border-[#dc2626] text-[#ff4444]',
      'Resistencia': 'border-[#dc2626] text-[#e6342a]',
      'Potencia': 'border-[#dc2626] text-[#ff3b30]',
      'Definición': 'border-[#dc2626] text-[#ff4444]',
      'Quema de Grasa': 'border-[#dc2626] text-[#ff3b30]',
      'Estética y Salud': 'border-[#dc2626] text-[#e6342a]'
    };
    return colors[objective] || 'border-[#dc2626] text-[#ff4444]';
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 modern-modal">
      <div className="rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden modern-modal-content">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-600/30 tf-header-gradient modern-modal-header h-16">
          <div>
            <h2 className="text-2xl font-bold text-white">Biblioteca de Rutinas Prediseñadas</h2>
            <p className="text-gray-400 mt-1">Explora rutinas prediseñadas o genera una personalizada según tus necesidades</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors button-neutral"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Pestañas */}
        <div className="flex border-b border-gray-600/30 bg-[#1a1a1a]">
          <button
            onClick={() => setActiveTab('existing')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'existing'
                ? 'text-[#ff4444] border-b-2 border-[#ff4444] bg-[#2a2a2a]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Plantillas Existentes
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'generate'
                ? 'text-[#ff4444] border-b-2 border-[#ff4444] bg-[#2a2a2a]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Generar Nueva Plantilla
          </button>
        </div>

        {/* Filtros - Solo para pestaña existentes */}
        {activeTab === 'existing' && (
          <div className="p-6 border-b border-gray-600/30 bg-[#1a1a1a]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Filtros</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-[#ff4444] hover:text-[#ff3333] font-medium transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Objetivo</label>
                <select
                  value={filters.trainingObjective}
                  onChange={(e) => handleFilterChange('trainingObjective', e.target.value)}
                  className="modern-input w-full"
                >
                  {trainingObjectives.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nivel</label>
                <select
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  className="modern-input w-full"
                >
                  {levels.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Días/semana</label>
                <select
                  value={filters.daysPerWeek}
                  onChange={(e) => handleFilterChange('daysPerWeek', e.target.value)}
                  className="modern-input w-full"
                >
                  {daysPerWeekOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Género</label>
                <select
                  value={filters.gender}
                  onChange={(e) => handleFilterChange('gender', e.target.value)}
                  className="modern-input w-full"
                >
                  {genderOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'existing' ? (
            loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff4444]"></div>
                <span className="ml-3 text-gray-400">Cargando plantillas...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-400 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg font-semibold">{error}</p>
                </div>
                <button
                  onClick={fetchTemplates}
                  className="px-4 py-2 bg-[#ff4444] hover:bg-[#ff3333] text-white rounded-lg transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-semibold">No se encontraron plantillas</p>
                  <p className="text-sm">Intenta ajustar los filtros o crear una nueva plantilla</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ gap: '12.8px' }}>
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-[#1a1a1a] border border-gray-600/30 rounded-xl p-6 transition-all duration-300 cursor-pointer group"
                    style={{
                      borderRadius: '12px',
                      height: '280px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.border = '1px solid #E63946';
                      e.currentTarget.style.boxShadow = '0 12px 30px rgba(230, 57, 70, 0.15), 0 0 20px rgba(230, 57, 70, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.border = '1px solid rgba(75, 85, 99, 0.3)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white group-hover:text-[#ff4444] transition-colors mb-2">
                          {template.name}
                        </h3>
                        {template.description && (
                          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                            {template.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getObjectiveColor(template.trainingObjective)}`}>
                          {template.trainingObjective}
                        </span>
                        <span 
                          className="text-white text-xs font-semibold"
                          style={{
                            background: '#E63946',
                            padding: '4px 10px',
                            borderRadius: '50px',
                            fontSize: '0.65rem',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {template.level}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{template.daysPerWeek} días/semana</span>
                        </div>
                        {template.duration && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{template.duration}</span>
                          </div>
                        )}
                      </div>

                      {template.gender && (
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="capitalize">{template.gender}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-600/30">
                      <button 
                        className="w-full text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        style={{
                          background: '#E63946',
                          borderRadius: '8px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#c5303e';
                          e.currentTarget.style.boxShadow = '0 0 15px rgba(230, 57, 70, 0.4)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#E63946';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Usar esta plantilla
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            // Contenido de generación de plantillas
            <div className="max-w-2xl mx-auto">
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-600/30 modern-card">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">Biblioteca de Rutinas Prediseñadas</h3>
                  <p className="text-gray-400">Selecciona los criterios para encontrar la rutina perfecta o generar una nueva</p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Objetivo de Entrenamiento *
                    </label>
                    <select
                      value={generateParams.objetivo}
                      onChange={(e) => setGenerateParams(prev => ({ ...prev, objetivo: e.target.value }))}
                      className="modern-input w-full"
                      required
                    >
                      <option value="">Selecciona un objetivo</option>
                      {generateObjectives.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Días por Semana *
                    </label>
                    <select
                      value={generateParams.dias}
                      onChange={(e) => setGenerateParams(prev => ({ ...prev, dias: parseInt(e.target.value) }))}
                      className="modern-input w-full"
                      required
                    >
                      {generateDays.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nivel de Experiencia *
                    </label>
                    <select
                      value={generateParams.nivel}
                      onChange={(e) => setGenerateParams(prev => ({ ...prev, nivel: e.target.value }))}
                      className="modern-input w-full"
                      required
                    >
                      <option value="">Selecciona tu nivel</option>
                      {generateLevels.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Género
                    </label>
                    <select
                      value={generateParams.genero}
                      onChange={(e) => setGenerateParams(prev => ({ ...prev, genero: e.target.value }))}
                      className="modern-input w-full"
                    >
                      {generateGenders.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleGenerateTemplate}
                      disabled={generatingTemplate || !generateParams.objetivo || !generateParams.nivel}
                      className="w-full modern-button disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {generatingTemplate ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Buscando rutina prediseñada...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Obtener Rutina
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-600/30 bg-[#1a1a1a]">
          <div className="flex items-center justify-between">
            {activeTab === 'existing' ? (
              <p className="text-sm text-gray-400">
                {filteredTemplates.length} plantilla{filteredTemplates.length !== 1 ? 's' : ''} encontrada{filteredTemplates.length !== 1 ? 's' : ''}
              </p>
            ) : (
              <p className="text-sm text-gray-400">
                Completa todos los campos requeridos (*) para obtener una rutina prediseñada o generar una nueva
              </p>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;