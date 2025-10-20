import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trainerApi } from '../services/api';
import './ExerciseLibrary.css';

const ExerciseLibrary = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showAddExerciseForm, setShowAddExerciseForm] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: '',
    description: '',
    category: 'strength',
    difficulty: 'intermediate',
    instructions: '',
    videoUrl: '',
    targetMuscles: '',
    equipment: '',
    notes: ''
  });

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'strength', name: 'Fuerza' },
    { id: 'cardio', name: 'Cardio' },
    { id: 'flexibility', name: 'Flexibilidad' },
    { id: 'balance', name: 'Equilibrio' },
    { id: 'plyometric', name: 'Pliométrico' },
    { id: 'functional', name: 'Funcional' }
  ];

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await trainerApi.getExercises();
        setExercises(response.data);
        setFilteredExercises(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching exercises:', err);
        setError('Failed to load exercises');
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  useEffect(() => {
    // Filter exercises based on search term and active category
    const filtered = exercises.filter(exercise => {
      const matchesSearch = (exercise.name ? exercise.name.toLowerCase() : '').includes(searchTerm.toLowerCase()) ||
                           (exercise.description ? exercise.description.toLowerCase() : '').includes(searchTerm.toLowerCase());
      
      const matchesCategory = activeCategory === 'all' || exercise.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
    
    setFilteredExercises(filtered);
  }, [searchTerm, activeCategory, exercises]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const handleExerciseClick = (exercise) => {
    setSelectedExercise(exercise);
  };

  const handleCloseDetails = () => {
    setSelectedExercise(null);
  };

  const handleNewExerciseChange = (e) => {
    const { name, value } = e.target;
    setNewExercise({
      ...newExercise,
      [name]: value
    });
  };

  const handleSubmitExercise = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await trainerApi.createExercise(newExercise);
      setExercises([...exercises, response.data]);
      setShowAddExerciseForm(false);
      setNewExercise({
        name: '',
        description: '',
        category: 'strength',
        difficulty: 'intermediate',
        instructions: '',
        videoUrl: '',
        targetMuscles: '',
        equipment: '',
        notes: ''
      });
    } catch (err) {
      console.error('Error creating exercise:', err);
      setError('Failed to create exercise');
    } finally {
      setLoading(false);
    }
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    
    // Extract video ID from various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11)
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  if (loading && exercises.length === 0) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="exercise-library">
      <div className="library-header">
        <button className="back-button" onClick={() => navigate('/trainer-dashboard')}>
          ← Volver
        </button>
        <h1>Biblioteca de ejercicios</h1>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="library-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar ejercicios..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        <button 
          className="add-exercise-btn"
          onClick={() => setShowAddExerciseForm(true)}
        >
          + Añadir ejercicio
        </button>
      </div>
      
      <div className="exercises-grid">
        {filteredExercises.length === 0 ? (
          <div className="no-results">
            No se encontraron ejercicios que coincidan con tu búsqueda
          </div>
        ) : (
          filteredExercises.map((exercise, index) => (
            <div 
              key={index} 
              className="exercise-card"
              onClick={() => handleExerciseClick(exercise)}
            >
              <span className="exercise-category">
                {getCategoryName(exercise.category)}
              </span>
              <h3>{exercise.name}</h3>
              <p className="exercise-description">{exercise.description}</p>
              <div className="exercise-difficulty">
                <span className={`difficulty-level ${exercise.difficulty}`}>
                  {exercise.difficulty === 'beginner' && 'Principiante'}
                  {exercise.difficulty === 'intermediate' && 'Intermedio'}
                  {exercise.difficulty === 'advanced' && 'Avanzado'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      
      {selectedExercise && (
        <div className="exercise-details-overlay">
          <div className="exercise-details">
            <button 
              className="close-details-btn"
              onClick={handleCloseDetails}
            >
              ✕
            </button>
            
            <h2>{selectedExercise.name}</h2>
            
            <div className="details-meta">
              <span className="category-tag">
                {getCategoryName(selectedExercise.category)}
              </span>
              <span className={`difficulty-tag ${selectedExercise.difficulty}`}>
                {selectedExercise.difficulty === 'beginner' && 'Principiante'}
                {selectedExercise.difficulty === 'intermediate' && 'Intermedio'}
                {selectedExercise.difficulty === 'advanced' && 'Avanzado'}
              </span>
            </div>
            
            <div className="details-description">
              <p>{selectedExercise.description}</p>
            </div>
            
            {selectedExercise.videoUrl && (
              <div className="video-container">
                <iframe
                  src={getYoutubeEmbedUrl(selectedExercise.videoUrl)}
                  title={selectedExercise.name}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
            
            <div className="details-section">
              <h3>Instrucciones</h3>
              <p>{selectedExercise.instructions || 'No hay instrucciones disponibles para este ejercicio.'}</p>
            </div>
            
            {selectedExercise.targetMuscles && (
              <div className="details-section">
                <h3>Músculos objetivo</h3>
                <p>{selectedExercise.targetMuscles}</p>
              </div>
            )}
            
            {selectedExercise.equipment && (
              <div className="details-section">
                <h3>Equipamiento necesario</h3>
                <p>{selectedExercise.equipment}</p>
              </div>
            )}
            
            {selectedExercise.notes && (
              <div className="details-section">
                <h3>Notas adicionales</h3>
                <p>{selectedExercise.notes}</p>
              </div>
            )}
            
            <div className="details-actions">
              <button className="use-in-routine-btn">
                Usar en rutina
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showAddExerciseForm && (
        <div className="modal-overlay">
          <div className="add-exercise-modal">
            <div className="modal-header">
              <h2>Añadir nuevo ejercicio</h2>
              <button 
                className="close-modal-btn"
                onClick={() => setShowAddExerciseForm(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmitExercise}>
              <div className="form-group">
                <label htmlFor="name">Nombre del ejercicio</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newExercise.name}
                  onChange={handleNewExerciseChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Descripción breve</label>
                <textarea
                  id="description"
                  name="description"
                  value={newExercise.description}
                  onChange={handleNewExerciseChange}
                  rows="2"
                  required
                ></textarea>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Categoría</label>
                  <select
                    id="category"
                    name="category"
                    value={newExercise.category}
                    onChange={handleNewExerciseChange}
                    required
                  >
                    {categories.filter(cat => cat.id !== 'all').map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="difficulty">Dificultad</label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={newExercise.difficulty}
                    onChange={handleNewExerciseChange}
                    required
                  >
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="instructions">Instrucciones</label>
                <textarea
                  id="instructions"
                  name="instructions"
                  value={newExercise.instructions}
                  onChange={handleNewExerciseChange}
                  rows="4"
                  required
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="videoUrl">URL del video (YouTube)</label>
                <input
                  type="url"
                  id="videoUrl"
                  name="videoUrl"
                  value={newExercise.videoUrl}
                  onChange={handleNewExerciseChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="targetMuscles">Músculos objetivo</label>
                  <input
                    type="text"
                    id="targetMuscles"
                    name="targetMuscles"
                    value={newExercise.targetMuscles}
                    onChange={handleNewExerciseChange}
                    placeholder="Ej: Cuádriceps, isquiotibiales, glúteos"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="equipment">Equipamiento necesario</label>
                  <input
                    type="text"
                    id="equipment"
                    name="equipment"
                    value={newExercise.equipment}
                    onChange={handleNewExerciseChange}
                    placeholder="Ej: Mancuernas, barra, banco"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Notas adicionales</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={newExercise.notes}
                  onChange={handleNewExerciseChange}
                  rows="3"
                  placeholder="Variaciones, precauciones, consejos, etc."
                ></textarea>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowAddExerciseForm(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar ejercicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseLibrary;