import React, { useState } from 'react';
import { useClient } from '../../context/ClientContext';
import '../../styles/nutrition.css';

const NutritionTab = () => {
  const { client } = useClient();
  const [activeSection, setActiveSection] = useState('plans');
  
  return (
    <div className="nutrition-tab">
      <div className="nutrition-header">
        <h2>Plan Nutricional</h2>
        <div className="nutrition-actions">
          <button className="action-btn primary">
            Asignar Plan
          </button>
          <button className="action-btn">
            Crear Plan
          </button>
        </div>
      </div>
      
      <div className="nutrition-nav">
        <button 
          className={`nav-btn ${activeSection === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveSection('plans')}
        >
          Planes Asignados
        </button>
        <button 
          className={`nav-btn ${activeSection === 'diary' ? 'active' : ''}`}
          onClick={() => setActiveSection('diary')}
        >
          Diario Alimenticio
        </button>
        <button 
          className={`nav-btn ${activeSection === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveSection('preferences')}
        >
          Preferencias
        </button>
      </div>
      
      {activeSection === 'plans' && <NutritionPlans client={client} />}
      {activeSection === 'diary' && <NutritionDiary client={client} />}
      {activeSection === 'preferences' && <NutritionPreferences client={client} />}
    </div>
  );
};

const NutritionPlans = ({ client }) => {
  const nutritionPlans = client?.nutritionPlans || [];
  
  return (
    <div className="nutrition-plans">
      {nutritionPlans.length === 0 ? (
        <div className="empty-state">
          <p>No hay planes nutricionales asignados.</p>
          <p className="empty-subtitle">Asigna un plan nutricional para ayudar al cliente a alcanzar sus objetivos.</p>
        </div>
      ) : (
        <div className="plans-grid">
          {nutritionPlans.map((plan, index) => (
            <div key={index} className="plan-card">
              <div className="plan-header">
                <h3>{plan.name}</h3>
                <span className="plan-date">
                  Asignado: {new Date(plan.assignedDate).toLocaleDateString('es-ES')}
                </span>
              </div>
              <p className="plan-description">{plan.description}</p>
              <div className="plan-meta">
                <span className="plan-calories">
                  <i className="icon-calories"></i>
                  {plan.calories} calorías
                </span>
                <span className="plan-duration">
                  <i className="icon-calendar"></i>
                  {plan.duration} días
                </span>
              </div>
              <div className="plan-macros">
                <div className="macro-item">
                  <span className="macro-value">{plan.macros.protein}g</span>
                  <span className="macro-label">Proteínas</span>
                </div>
                <div className="macro-item">
                  <span className="macro-value">{plan.macros.carbs}g</span>
                  <span className="macro-label">Carbohidratos</span>
                </div>
                <div className="macro-item">
                  <span className="macro-value">{plan.macros.fat}g</span>
                  <span className="macro-label">Grasas</span>
                </div>
              </div>
              <div className="plan-actions">
                <button className="view-plan-btn primary">
                  Ver Plan
                </button>
                <button className="edit-plan-btn">
                  Editar
                </button>
                <button className="remove-plan-btn" title="Remover plan">
                  <i className="icon-remove"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const NutritionDiary = ({ client }) => {
  return (
    <div className="nutrition-diary">
      <div className="diary-header">
        <h3>Diario Alimenticio</h3>
        <p className="diary-subtitle">Registro de alimentos y cumplimiento del plan</p>
      </div>
      
      <div className="diary-placeholder">
        <p>Funcionalidad de diario alimenticio en desarrollo.</p>
        <p>Aquí se mostrará el registro de alimentos del cliente y su adherencia al plan nutricional.</p>
      </div>
    </div>
  );
};

const NutritionPreferences = ({ client }) => {
  const preferences = client?.nutritionPreferences || {
    allergies: [],
    restrictions: [],
    favorites: [],
    dislikes: []
  };
  
  return (
    <div className="nutrition-preferences">
      <div className="preferences-header">
        <h3>Preferencias Alimenticias</h3>
        <button className="edit-preferences-btn">
          Editar Preferencias
        </button>
      </div>
      
      <div className="preferences-grid">
        <div className="preference-card">
          <h4>Alergias</h4>
          {preferences.allergies.length > 0 ? (
            <ul className="preference-list">
              {preferences.allergies.map((item, index) => (
                <li key={index} className="preference-item">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No se han registrado alergias</p>
          )}
        </div>
        
        <div className="preference-card">
          <h4>Restricciones Dietéticas</h4>
          {preferences.restrictions.length > 0 ? (
            <ul className="preference-list">
              {preferences.restrictions.map((item, index) => (
                <li key={index} className="preference-item">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No se han registrado restricciones</p>
          )}
        </div>
        
        <div className="preference-card">
          <h4>Alimentos Favoritos</h4>
          {preferences.favorites.length > 0 ? (
            <ul className="preference-list">
              {preferences.favorites.map((item, index) => (
                <li key={index} className="preference-item">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No se han registrado alimentos favoritos</p>
          )}
        </div>
        
        <div className="preference-card">
          <h4>Alimentos que No Le Gustan</h4>
          {preferences.dislikes.length > 0 ? (
            <ul className="preference-list">
              {preferences.dislikes.map((item, index) => (
                <li key={index} className="preference-item">{item}</li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No se han registrado alimentos que no le gustan</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NutritionTab;