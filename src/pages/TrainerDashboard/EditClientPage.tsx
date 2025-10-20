import React, { useState, useEffect } from 'react';
import { trainerApi } from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';

const EditClientPage: React.FC = () => {
    const { clientId } = useParams<{ clientId: string }>();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        age: '',
        gender: '',
        fitnessLevel: '',
        weight: '',
        height: '',
        goals: [] as string[],
        initialObjective: '',
        trainingDaysPerWeek: '',
        medicalConditions: '',
        medications: '',
        injuries: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadClientData = async () => {
            if (!clientId) {
                setError('ID de cliente no válido');
                return;
            }

            try {
                setIsLoadingData(true);
                const response = await trainerApi.getClientDetails(clientId);
                
                // El backend devuelve { data: clientData }
                const clientData = response.data || response;
                const profile = clientData.clientProfile || {};
                
                console.log('Datos del cliente recibidos:', clientData);
                console.log('Perfil del cliente:', profile);
                
                setFormData({
                    name: clientData.name || '',
                    email: clientData.email || '',
                    phone: clientData.phone || profile.phone || '',
                    age: (profile.age || clientData.age) ? (profile.age || clientData.age).toString() : '',
                    gender: profile.gender || clientData.gender || '',
                    fitnessLevel: profile.fitnessLevel || clientData.fitnessLevel || '',
                    weight: (profile.weight || clientData.weight) ? (profile.weight || clientData.weight).toString() : '',
                    height: (profile.height || clientData.height) ? (profile.height || clientData.height).toString() : '',
                    goals: profile.goals || clientData.goals || [],
                    initialObjective: profile.initialObjective || clientData.initialObjective || '',
                    trainingDaysPerWeek: (profile.trainingDaysPerWeek || clientData.trainingDaysPerWeek) ? (profile.trainingDaysPerWeek || clientData.trainingDaysPerWeek).toString() : '',
                    medicalConditions: profile.medicalConditions || clientData.medicalConditions || '',
                    medications: profile.medications || clientData.medications || '',
                    injuries: profile.injuries || clientData.injuries || ''
                });
            } catch (err: any) {
                console.error('Error loading client data:', err);
                setError('Error al cargar los datos del cliente');
            } finally {
                setIsLoadingData(false);
            }
        };

        loadClientData();
    }, [clientId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateEmail = (email: string) => {
        const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        console.log('🚀 Iniciando actualización de cliente...');
        console.log('📋 FormData actual:', formData);
        console.log('🆔 ClientId:', clientId);

        if (!formData.name || !formData.email) {
            setError('Por favor, completa todos los campos requeridos.');
            setIsLoading(false);
            return;
        }

        if (!validateEmail(formData.email)) {
            setError('Por favor, ingresa un correo electrónico válido.');
            setIsLoading(false);
            return;
        }

        try {
            const clientData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                age: formData.age ? parseInt(formData.age) : undefined,
                gender: formData.gender || undefined,
                fitnessLevel: formData.fitnessLevel || undefined,
                weight: formData.weight ? parseFloat(formData.weight) : undefined,
                height: formData.height ? parseFloat(formData.height) : undefined,
                goals: formData.goals,
                initialObjective: formData.initialObjective,
                trainingDaysPerWeek: formData.trainingDaysPerWeek ? parseInt(formData.trainingDaysPerWeek) : undefined,
                medicalConditions: formData.medicalConditions,
                medications: formData.medications,
                injuries: formData.injuries
            };

            console.log('📤 Datos a enviar:', clientData);
            
            const response = await trainerApi.updateClientInfo(clientId!, clientData);
            console.log('✅ Respuesta del servidor:', response);

            if (response) {
                console.log('🎉 Actualización exitosa, preparando redirección...');
                setSuccess('Cliente actualizado exitosamente.');
                const redirectUrl = `/trainer/clients/${clientId}?updated=true`;
                console.log('🔄 Redirigiendo a:', redirectUrl);
                // Redirección más rápida para mejor UX
                setTimeout(() => {
                    console.log('⏰ Ejecutando redirección...');
                    navigate(redirectUrl);
                }, 1000);
            } else {
                console.log('❌ Respuesta no exitosa:', response);
                setError('Error al actualizar el cliente. Respuesta no exitosa.');
            }
        } catch (err: any) {
            console.error("💥 Error updating client:", err);
            console.error("💥 Error response:", err.response);
            setError(err.response?.data?.message || 'Error al actualizar el cliente. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingData) {
        return (
            <div className="min-h-screen bg-[#1a1a1a] text-white p-6 flex items-center justify-center">
                <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-[#dc2626]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-lg">Cargando datos del cliente...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-[#dc2626]">
                            Editar Cliente
                        </h1>
                        <p className="text-gray-400 mt-2">Actualiza la información del cliente</p>
                    </div>
                    <button
                        onClick={() => navigate(`/trainer/clients/${clientId}`)}
                        className="px-6 py-3 bg-transparent border border-[#555555] hover:bg-[#333333] hover:border-[#777777] rounded-lg font-medium transition-all duration-300"
                    >
                        ← Volver al Cliente
                    </button>
                </div>

                <div className="bg-[#2a2a2a] p-8 rounded-2xl shadow-2xl">
                
                    {error && (
                        <div className="bg-[#dc3545]/10 border border-[#dc3545]/30 text-[#dc3545] px-6 py-4 rounded-lg mb-6" role="alert">
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
                    {success && (
                        <div className="bg-[#28a745]/10 border border-[#28a745]/30 text-[#28a745] px-6 py-4 rounded-lg mb-6" role="alert">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <strong className="font-semibold">¡Éxito! </strong>
                                    <span>{success}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2">
                                    Nombre Completo <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#dc2626] focus:border-[#dc2626] transition-all duration-300"
                                    placeholder="Ingresa el nombre completo"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                                    Correo Electrónico <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#dc2626] focus:border-[#dc2626] transition-all duration-300"
                                    placeholder="ejemplo@correo.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-semibold text-gray-300 mb-2">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#dc2626] focus:border-[#dc2626] transition-all duration-300"
                                    placeholder="Número de teléfono"
                                />
                            </div>

                            <div>
                                <label htmlFor="age" className="block text-sm font-semibold text-gray-300 mb-2">
                                    Edad
                                </label>
                                <input
                                    type="number"
                                    id="age"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    min="1"
                                    max="120"
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#dc2626] focus:border-[#dc2626] transition-all duration-300"
                                    placeholder="Edad en años"
                                />
                            </div>

                            <div>
                                <label htmlFor="weight" className="block text-sm font-semibold text-gray-300 mb-2">
                                    Peso (kg)
                                </label>
                                <input
                                    type="number"
                                    id="weight"
                                    name="weight"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white focus:ring-2 focus:ring-[#dc2626] focus:border-[#dc2626] transition-all duration-300"
                                    placeholder="Peso en kilogramos"
                                />
                            </div>

                            <div>
                                <label htmlFor="height" className="block text-sm font-semibold text-gray-300 mb-2">
                                    Altura (cm)
                                </label>
                                <input
                                    type="number"
                                    id="height"
                                    name="height"
                                    value={formData.height}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white focus:ring-2 focus:ring-[#dc2626] focus:border-[#dc2626] transition-all duration-300"
                                    placeholder="Altura en centímetros"
                                />
                            </div>

                            <div>
                                <label htmlFor="gender" className="block text-sm font-semibold text-gray-300 mb-2">
                                    Género
                                </label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white focus:ring-2 focus:ring-[#dc2626] focus:border-[#dc2626] transition-all duration-300"
                                >
                                    <option value="">Seleccionar género</option>
                                    <option value="MALE">Masculino</option>
                                    <option value="FEMALE">Femenino</option>
                                    <option value="OTHER">Otro</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="fitnessLevel" className="block text-sm font-semibold text-gray-300 mb-2">
                                    Nivel de Fitness
                                </label>
                                <select
                                    id="fitnessLevel"
                                    name="fitnessLevel"
                                    value={formData.fitnessLevel}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white focus:ring-2 focus:ring-[#dc2626] focus:border-[#dc2626] transition-all duration-300"
                                >
                                    <option value="">Seleccionar nivel</option>
                                    <option value="BEGINNER">Principiante</option>
                                    <option value="INTERMEDIATE">Intermedio</option>
                                    <option value="ADVANCED">Avanzado</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="trainingDaysPerWeek" className="block text-sm font-semibold text-gray-300 mb-2">
                                    Días de entrenamiento por semana
                                </label>
                                <input
                                    type="number"
                                    id="trainingDaysPerWeek"
                                    name="trainingDaysPerWeek"
                                    value={formData.trainingDaysPerWeek}
                                    onChange={handleChange}
                                    min="1"
                                    max="7"
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#dc2626] focus:border-[#dc2626] transition-all duration-300"
                                    placeholder="1-7 días"
                                />
                            </div>
                        </div>

                        {/* Goals Section */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-4">
                                Objetivos
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {['Pérdida de peso', 'Ganancia muscular', 'Resistencia', 'Fuerza', 'Flexibilidad', 'Rehabilitación'].map((goal) => (
                                    <label key={goal} className="flex items-center space-x-3 p-3 bg-[#1a1a1a] border border-[#555555] rounded-lg hover:border-[#777777] transition-all duration-300 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.goals.includes(goal)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        goals: [...prev.goals, goal]
                                                    }));
                                                } else {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        goals: prev.goals.filter(g => g !== goal)
                                                    }));
                                                }
                                            }}
                                            className="w-4 h-4 text-[#dc2626] bg-[#2a2a2a] border-[#555555] rounded focus:ring-[#dc2626] focus:ring-2"
                                        />
                                        <span className="text-sm text-gray-300">{goal}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Campos de texto largo */}
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="initialObjective" className="block text-sm font-semibold text-gray-300 mb-2">
                                    Objetivo Inicial
                                </label>
                                <textarea
                                    id="initialObjective"
                                    name="initialObjective"
                                    value={formData.initialObjective}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#dc2626] focus:border-[#dc2626] transition-all duration-300 resize-none"
                                    placeholder="Describe el objetivo inicial del cliente..."
                                />
                            </div>

                            <div>
                                <label htmlFor="medicalConditions" className="block text-sm font-semibold text-gray-300 mb-2">
                                    Condiciones Médicas
                                </label>
                                <textarea
                                    id="medicalConditions"
                                    name="medicalConditions"
                                    value={formData.medicalConditions}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#dc2626] focus:border-[#dc2626] transition-all duration-300 resize-none"
                                    placeholder="Describe cualquier condición médica relevante..."
                                />
                            </div>

                            <div>
                                <label htmlFor="medications" className="block text-sm font-semibold text-gray-300 mb-2">
                                    Medicamentos
                                </label>
                                <textarea
                                    id="medications"
                                    name="medications"
                                    value={formData.medications}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#dc2626] focus:border-[#dc2626] transition-all duration-300 resize-none"
                                    placeholder="Lista los medicamentos que toma actualmente..."
                                />
                            </div>

                            <div>
                                <label htmlFor="injuries" className="block text-sm font-semibold text-gray-300 mb-2">
                                    Lesiones
                                </label>
                                <textarea
                                    id="injuries"
                                    name="injuries"
                                    value={formData.injuries}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#dc2626] focus:border-[#dc2626] transition-all duration-300 resize-none"
                                    placeholder="Describe lesiones previas o actuales..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-6">
                            <button
                                type="submit"
                                className="flex-1 py-4 px-6 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Actualizando...
                                    </div>
                                ) : (
                                    'Actualizar Cliente'
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(`/trainer/clients/${clientId}/progress`)}
                                className="flex-1 py-4 px-6 bg-transparent border border-[#555555] hover:bg-[#333333] hover:border-[#777777] text-gray-300 font-semibold rounded-lg transition-all duration-300"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditClientPage;