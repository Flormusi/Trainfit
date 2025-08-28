import React, { useState } from 'react';
import { clientService } from '../../services/clientService';
import { useNavigate } from 'react-router-dom';

const AddClientPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        goals: [] as string[],
        weight: '',
        initialObjective: '',
        trainingDaysPerWeek: '',
        medicalConditions: '',
        medications: '',
        injuries: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

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

        if (!formData.name || !formData.email || !formData.password) {
            setError('Por favor, completa todos los campos requeridos.');
            return;
        }

        if (!validateEmail(formData.email)) {
            setError('Por favor, ingresa un correo electrónico válido.');
            return;
        }

        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        try {
            const clientData = {
                ...formData,
                weight: formData.weight ? parseFloat(formData.weight) : undefined,
                trainingDaysPerWeek: formData.trainingDaysPerWeek ? parseInt(formData.trainingDaysPerWeek) : undefined
            };

            const response = await clientService.addClient(clientData);

            if (response) {
                setSuccess('Cliente agregado exitosamente.');
                setTimeout(() => navigate('/trainer/clients'), 2000);
            }
        } catch (err: any) {
            if (err.response?.status === 400 && err.response?.data?.message === 'Client with this email already exists.') {
                setError('Ya existe un cliente registrado con este correo electrónico.');
            } else {
                setError(err.response?.data?.message || 'Error al agregar el cliente. Inténtalo de nuevo.');
            }
            console.error("Error adding client:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-[#ff4444]">
                            Agregar Nuevo Cliente
                        </h1>
                        <p className="text-gray-400 mt-2">Completa la información del cliente para agregarlo a tu lista</p>
                    </div>
                    <button
                        onClick={() => navigate('/trainer/clients')}
                        className="px-6 py-3 bg-transparent border border-[#555555] hover:bg-[#333333] hover:border-[#777777] rounded-lg font-medium transition-all duration-300"
                    >
                        ← Volver a Clientes
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
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#ff4444] focus:border-[#ff4444] transition-all duration-300"
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
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#ff4444] focus:border-[#ff4444] transition-all duration-300"
                                    placeholder="ejemplo@correo.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2">
                                    Contraseña Inicial <span className="text-red-400">*</span>
                                    <span className="text-xs text-gray-400 ml-1">(mínimo 6 caracteres)</span>
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#ff4444] focus:border-[#ff4444] transition-all duration-300"
                                    placeholder="Mínimo 6 caracteres"
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
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#ff4444] focus:border-[#ff4444] transition-all duration-300"
                                    placeholder="Número de teléfono"
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
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white focus:ring-2 focus:ring-[#ff4444] focus:border-[#ff4444] transition-all duration-300"
                                    placeholder="Peso en kilogramos"
                                />
                            </div>

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
                                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555555] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#ff4444] focus:border-[#ff4444] transition-all duration-300 resize-none"
                                    placeholder="Describe el objetivo inicial del cliente..."
                                />
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
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm"
                                    placeholder="1-7 días"
                                />
                            </div>
                        </div>

                        {/* Campos de texto largo */}
                        <div className="space-y-6">

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
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm resize-none"
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
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm resize-none"
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
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm resize-none"
                                    placeholder="Describe lesiones previas o actuales..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-6">
                            <button
                                type="submit"
                                className="flex-1 py-4 px-6 bg-[#ff4444] hover:bg-[#ff3333] text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Agregando...
                                    </div>
                                ) : (
                                    'Agregar Cliente'
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/trainer-dashboard')}
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

export default AddClientPage;
