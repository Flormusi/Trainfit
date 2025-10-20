import React, { useState } from 'react';
import { clientService } from '../../services/clientService';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, UserPlusIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

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
            setIsLoading(false);
            return;
        }

        if (!validateEmail(formData.email)) {
            setError('Por favor, ingresa un correo electrónico válido.');
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            setIsLoading(false);
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                            <UserPlusIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                                Agregar Nuevo Cliente
                            </h1>
                            <p className="text-white/70 mt-1">Completa la información del cliente para agregarlo a tu lista</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/trainer/clients')}
                        className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 rounded-xl font-medium transition-all duration-300 backdrop-blur-sm"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        Volver a Clientes
                    </button>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl shadow-2xl">
                
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-xl mb-6 backdrop-blur-sm" role="alert">
                            <div className="flex items-center">
                                <ExclamationTriangleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                                <div>
                                    <strong className="font-semibold">Error: </strong>
                                    <span>{error}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-6 py-4 rounded-xl mb-6 backdrop-blur-sm" role="alert">
                            <div className="flex items-center">
                                <CheckCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
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
                                <label htmlFor="name" className="block text-sm font-semibold text-white/80 mb-2">
                                    Nombre Completo <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 backdrop-blur-sm"
                                    placeholder="Ingresa el nombre completo"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-white/80 mb-2">
                                    Correo Electrónico <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 backdrop-blur-sm"
                                    placeholder="ejemplo@correo.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-white/80 mb-2">
                                    Contraseña Inicial <span className="text-red-400">*</span>
                                    <span className="text-xs text-white/50 ml-1">(mínimo 6 caracteres)</span>
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 backdrop-blur-sm"
                                    placeholder="Mínimo 6 caracteres"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-semibold text-white/80 mb-2">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 backdrop-blur-sm"
                                    placeholder="Número de teléfono"
                                />
                            </div>

                            <div>
                                <label htmlFor="weight" className="block text-sm font-semibold text-white/80 mb-2">
                                    Peso (kg)
                                </label>
                                <input
                                    type="number"
                                    id="weight"
                                    name="weight"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    step="0.1"
                                    min="0"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 backdrop-blur-sm"
                                    placeholder="Peso en kilogramos"
                                />
                            </div>

                            <div>
                                <label htmlFor="trainingDaysPerWeek" className="block text-sm font-semibold text-white/80 mb-2">
                                    Días de Entrenamiento por Semana
                                </label>
                                <select
                                    id="trainingDaysPerWeek"
                                    name="trainingDaysPerWeek"
                                    value={formData.trainingDaysPerWeek}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 backdrop-blur-sm"
                                >
                                    <option value="" className="bg-gray-800">Selecciona días por semana</option>
                                    <option value="1" className="bg-gray-800">1 día</option>
                                    <option value="2" className="bg-gray-800">2 días</option>
                                    <option value="3" className="bg-gray-800">3 días</option>
                                    <option value="4" className="bg-gray-800">4 días</option>
                                    <option value="5" className="bg-gray-800">5 días</option>
                                    <option value="6" className="bg-gray-800">6 días</option>
                                    <option value="7" className="bg-gray-800">7 días</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="initialObjective" className="block text-sm font-semibold text-white/80 mb-2">
                                Objetivo Inicial
                            </label>
                            <textarea
                                id="initialObjective"
                                name="initialObjective"
                                value={formData.initialObjective}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 backdrop-blur-sm resize-none"
                                placeholder="Describe el objetivo principal del cliente (ej: perder peso, ganar masa muscular, mejorar resistencia...)"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="medicalConditions" className="block text-sm font-semibold text-white/80 mb-2">
                                    Condiciones Médicas
                                </label>
                                <textarea
                                    id="medicalConditions"
                                    name="medicalConditions"
                                    value={formData.medicalConditions}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 backdrop-blur-sm resize-none"
                                    placeholder="Condiciones médicas relevantes"
                                />
                            </div>

                            <div>
                                <label htmlFor="medications" className="block text-sm font-semibold text-white/80 mb-2">
                                    Medicamentos
                                </label>
                                <textarea
                                    id="medications"
                                    name="medications"
                                    value={formData.medications}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 backdrop-blur-sm resize-none"
                                    placeholder="Medicamentos actuales"
                                />
                            </div>

                            <div>
                                <label htmlFor="injuries" className="block text-sm font-semibold text-white/80 mb-2">
                                    Lesiones
                                </label>
                                <textarea
                                    id="injuries"
                                    name="injuries"
                                    value={formData.injuries}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 backdrop-blur-sm resize-none"
                                    placeholder="Lesiones previas o actuales"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
                            <button
                                type="button"
                                onClick={() => navigate('/trainer/clients')}
                                className="px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 rounded-xl font-medium transition-all duration-300 backdrop-blur-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Agregando...
                                    </>
                                ) : (
                                    <>
                                        <UserPlusIcon className="w-5 h-5" />
                                        Agregar Cliente
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddClientPage;
