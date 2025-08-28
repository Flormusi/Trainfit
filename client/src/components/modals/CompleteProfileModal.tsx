import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import './CompleteProfileModal.css';

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  clientData: {
    id: string;
    name: string;
    phone?: string;
    weight?: number;
    height?: number;
    goals?: string[];
  };
  missingFields: string[];
}

const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clientData,
  missingFields
}) => {
  const [formData, setFormData] = useState({
    phone: clientData.phone || '',
    weight: clientData.weight || '',
    height: clientData.height || '',
    goals: clientData.goals || []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        phone: clientData.phone || '',
        weight: clientData.weight || '',
        height: clientData.height || '',
        goals: clientData.goals || []
      });
    }
  }, [isOpen, clientData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGoalsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const goalsArray = e.target.value.split('\n').filter(goal => goal.trim() !== '');
    setFormData(prev => ({
      ...prev,
      goals: goalsArray
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend: any = {};
      
      // Solo enviar los campos que están en missingFields o que han cambiado
      if (missingFields.includes('Teléfono') || formData.phone !== clientData.phone) {
        dataToSend.phone = formData.phone;
      }
      if (missingFields.includes('Peso') || formData.weight !== clientData.weight) {
        dataToSend.weight = formData.weight ? parseFloat(formData.weight.toString()) : null;
      }
      if (missingFields.includes('Altura') || formData.height !== clientData.height) {
        dataToSend.height = formData.height ? parseFloat(formData.height.toString()) : null;
      }
      if (missingFields.includes('Objetivos') || JSON.stringify(formData.goals) !== JSON.stringify(clientData.goals)) {
        dataToSend.goals = formData.goals;
      }

      await onSave(dataToSend);
      toast.success('Perfil actualizado exitosamente');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Completar Perfil de {clientData.name}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-section">
            <h3>Información de Contacto</h3>
            
            <div className="form-group">
              <label htmlFor="phone">
                Teléfono {missingFields.includes('Teléfono') && <span className="required">*</span>}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Número de teléfono"
                className={missingFields.includes('Teléfono') ? 'required-field' : ''}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Datos Físicos</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="weight">
                  Peso (kg) {missingFields.includes('Peso') && <span className="required">*</span>}
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="Peso en kg"
                  min="30"
                  max="300"
                  step="0.1"
                  className={missingFields.includes('Peso') ? 'required-field' : ''}
                />
              </div>

              <div className="form-group">
                <label htmlFor="height">
                  Altura (cm) {missingFields.includes('Altura') && <span className="required">*</span>}
                </label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  placeholder="Altura en cm"
                  min="100"
                  max="250"
                  className={missingFields.includes('Altura') ? 'required-field' : ''}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Objetivos</h3>
            
            <div className="form-group">
              <label htmlFor="goals">
                Objetivos de Entrenamiento {missingFields.includes('Objetivos') && <span className="required">*</span>}
              </label>
              <textarea
                id="goals"
                name="goals"
                value={formData.goals.join('\n')}
                onChange={handleGoalsChange}
                placeholder="Escribe cada objetivo en una línea separada&#10;Ejemplo:&#10;Perder peso&#10;Ganar masa muscular&#10;Mejorar resistencia"
                rows={4}
                className={missingFields.includes('Objetivos') ? 'required-field' : ''}
              />
              <small className="form-help">Escribe cada objetivo en una línea separada</small>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfileModal;