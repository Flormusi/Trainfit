import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import './ClientOnboarding.css'; // Asegúrate que este archivo CSS tenga todos los estilos necesarios

interface OnboardingFormData {
  weight: string;
  height: string;
  age: string;
  gender: 'female' | 'male' | 'other' | '';
  injuries: 'yes' | 'no' | '';
  injuryDetails?: string;
  medicalConditions: string;
  medications: 'yes' | 'no' | '';
  medicationDetails?: string; // Ya existe, perfecto
  previousTraining: 'yes' | 'no' | '';
  objective: 'lose_fat' | 'gain_muscle' | 'maintain' | 'other_objective' | '';
  otherObjectiveDetail?: string; // Ya existe, perfecto
}

const ClientOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user, saveOnboardingData } = useAuth();
  const [formData, setFormData] = useState<OnboardingFormData>({
    weight: '',
    height: '',
    age: '',
    gender: '',
    injuries: '',
    injuryDetails: '',
    medicalConditions: '',
    medications: '',
    medicationDetails: '',
    previousTraining: '',
    objective: '',
    otherObjectiveDetail: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newState = {
        ...prev,
        [name]: value,
      };
      console.log('Form data after radio change:', newState);
      return newState;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("No se pudo identificar al usuario. Por favor, inicia sesión de nuevo.");
      navigate('/login');
      return;
    }

    // Validaciones del formulario
    if (formData.injuries === 'yes' && !formData.injuryDetails?.trim()) {
      toast.error('Por favor, detalla tus lesiones.');
      return;
    }
    if (formData.medications === 'yes' && !formData.medicationDetails?.trim()) {
      toast.error('Por favor, detalla tu medicación.');
      return;
    }
    if (formData.objective === 'other_objective' && !formData.otherObjectiveDetail?.trim()) {
      toast.error('Por favor, especifica tu otro objetivo.');
      return;
    }

    setLoading(true);
    try {
      const payload: OnboardingFormData = {
        ...formData,
        injuryDetails: formData.injuries === 'yes' ? formData.injuryDetails : '',
        medicationDetails: formData.medications === 'yes' ? formData.medicationDetails : '',
        otherObjectiveDetail: formData.objective === 'other_objective' ? formData.otherObjectiveDetail : ''
      };
      await saveOnboardingData(payload);
      toast.success('¡Perfil completado exitosamente!');
      navigate(`/client-dashboard/${user.id}`);
    } catch (error) {
      console.error('Error al guardar datos de onboarding:', error);
      toast.error('Error al guardar el perfil. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark-theme">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <img src="/images/logo-trainfit.png" alt="Trainfit Logo" className="logo" />
          <h1>Completá tus datos para personalizar tu entrenamiento!</h1>
        </div>
        <form onSubmit={handleSubmit} className="onboarding-form">
          
          <div className="form-group"> {/* Peso */}
            <input
              type="text"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder="Peso (kg)"
              required
            />
          </div>
          
          <div className="form-row"> {/* Contenedor para Altura y Edad en la misma línea */}
            <div className="form-group"> {/* Altura */}
              <input
                type="text"
                id="height"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="Altura (cm)"
                required
              />
            </div>
            <div className="form-group"> {/* Edad */}
              <input
                type="text"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Edad"
                required
              />
            </div>
          </div>

          <div className="form-group radio-group">
            {/* No hay etiqueta "Género" visible en la imagen de destino, las opciones están directamente */}
            <div>
              <input type="radio" id="gender_female" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleRadioChange} />
              <label htmlFor="gender_female">Femenino</label>
              
              <input type="radio" id="gender_male" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleRadioChange} />
              <label htmlFor="gender_male">Masculino</label>
              
              <input type="radio" id="gender_other" name="gender" value="other" checked={formData.gender === 'other'} onChange={handleRadioChange} />
              <label htmlFor="gender_other">Otro</label>
            </div>
          </div>

          <div className="form-group radio-group">
            <div className="radio-group-label">¿Tenés alguna lesión?</div> {/* Cambiado de <label> a <div> */}
            <div>
              <input type="radio" id="injuries_yes" name="injuries" value="yes" checked={formData.injuries === 'yes'} onChange={handleRadioChange} />
              <label htmlFor="injuries_yes">Sí</label>
              
              <input type="radio" id="injuries_no" name="injuries" value="no" checked={formData.injuries === 'no'} onChange={handleRadioChange} />
              <label htmlFor="injuries_no">No</label>
            </div>
          </div>
          {formData.injuries === 'yes' && (
            <div className="form-group">
              <textarea
                id="injuryDetails"
                name="injuryDetails"
                value={formData.injuryDetails}
                onChange={handleChange}
                rows={3}
                placeholder="Describí tus lesiones..."
              />
            </div>
          )}

          <div className="form-group">
            <input
              type="text"
              id="medicalConditions"
              name="medicalConditions"
              value={formData.medicalConditions}
              onChange={handleChange}
              placeholder="¿Tenés alguna enfermedad o condición médica relevante?"
            />
          </div>

          <div className="form-group radio-group">
            <div className="radio-group-label">¿Estás tomando alguna medicación actualmente?</div>
            <div>
              <input type="radio" id="medications_yes" name="medications" value="yes" checked={formData.medications === 'yes'} onChange={handleRadioChange} />
              <label htmlFor="medications_yes">Sí</label>
              
              <input type="radio" id="medications_no" name="medications" value="no" checked={formData.medications === 'no'} onChange={handleRadioChange} />
              <label htmlFor="medications_no">No</label>
            </div>
          </div>
          {/* Textarea condicional para detalles de medicación */}
          {formData.medications === 'yes' && (
            <div className="form-group">
              <textarea
                id="medicationDetails"
                name="medicationDetails"
                value={formData.medicationDetails}
                onChange={handleChange}
                rows={3}
                placeholder="Detalla tu medicación..."
              />
            </div>
          )}

          <div className="form-group radio-group">
            <div className="radio-group-label">¿Venias entrenando antes?</div>
            <div>
              <input type="radio" id="previousTraining_yes" name="previousTraining" value="yes" checked={formData.previousTraining === 'yes'} onChange={handleRadioChange} />
              <label htmlFor="previousTraining_yes">Sí</label>
              
              <input type="radio" id="previousTraining_no" name="previousTraining" value="no" checked={formData.previousTraining === 'no'} onChange={handleRadioChange} />
              <label htmlFor="previousTraining_no">No</label>
            </div>
          </div>

          <div className="form-group radio-group">
            <div className="radio-group-label">Tu objetivo</div> {/* Cambiado de <label> a <div> */}
            <div>
              <input type="radio" id="objective_lose_fat" name="objective" value="lose_fat" checked={formData.objective === 'lose_fat'} onChange={handleRadioChange} />
              <label htmlFor="objective_lose_fat">Perder grasa</label>
              
              <input type="radio" id="objective_gain_muscle" name="objective" value="gain_muscle" checked={formData.objective === 'gain_muscle'} onChange={handleRadioChange} />
              <label htmlFor="objective_gain_muscle">Ganar masa muscular</label>
              
              <input type="radio" id="objective_maintain" name="objective" value="maintain" checked={formData.objective === 'maintain'} onChange={handleRadioChange} />
              <label htmlFor="objective_maintain">Mantener</label>
              
              <input type="radio" id="objective_other" name="objective" value="other_objective" checked={formData.objective === 'other_objective'} onChange={handleRadioChange} />
              <label htmlFor="objective_other">Otro</label>
            </div>
          </div>
          {/* Textarea condicional para otro objetivo */}
          {formData.objective === 'other_objective' && (
            <div className="form-group">
              <textarea
                id="otherObjectiveDetail"
                name="otherObjectiveDetail"
                value={formData.otherObjectiveDetail}
                onChange={handleChange}
                rows={3}
                placeholder="Especifica tu otro objetivo..."
              />
            </div>
          )}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar y continuar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClientOnboarding;