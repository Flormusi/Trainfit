import React, { useState } from 'react';
import { useClient } from '../../context/ClientContext';
import '../../styles/notes.css';

const NotesTab = () => {
  const { client, addNote, updateNote, deleteNote } = useClient();
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [editText, setEditText] = useState('');
  
  const notes = client?.notes || [];
  
  const handleAddNote = () => {
    if (newNote.trim()) {
      addNote({
        text: newNote,
        date: new Date().toISOString(),
        category: 'general'
      });
      setNewNote('');
    }
  };
  
  const handleEditNote = (noteId) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setEditingNote(noteId);
      setEditText(note.text);
    }
  };
  
  const handleSaveEdit = (noteId) => {
    if (editText.trim()) {
      updateNote(noteId, { text: editText });
      setEditingNote(null);
      setEditText('');
    }
  };
  
  const handleCancelEdit = () => {
    setEditingNote(null);
    setEditText('');
  };
  
  const handleDeleteNote = (noteId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta nota?')) {
      deleteNote(noteId);
    }
  };

  return (
    <div className="notes-tab">
      <div className="notes-header">
        <h2>Notas y Observaciones</h2>
        <p className="notes-subtitle">Registra notas importantes sobre el cliente</p>
      </div>
      
      <div className="add-note-section">
        <textarea
          className="note-input"
          placeholder="Escribe una nueva nota..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          rows={3}
        />
        <div className="note-actions">
          <select className="note-category">
            <option value="general">General</option>
            <option value="training">Entrenamiento</option>
            <option value="nutrition">Nutrición</option>
            <option value="health">Salud</option>
            <option value="payment">Pagos</option>
          </select>
          <button 
            className="add-note-btn"
            onClick={handleAddNote}
            disabled={!newNote.trim()}
          >
            Agregar Nota
          </button>
        </div>
      </div>
      
      <div className="notes-filter">
        <input 
          type="text" 
          className="filter-input" 
          placeholder="Buscar notas..."
        />
        <select className="filter-category">
          <option value="all">Todas las categorías</option>
          <option value="general">General</option>
          <option value="training">Entrenamiento</option>
          <option value="nutrition">Nutrición</option>
          <option value="health">Salud</option>
          <option value="payment">Pagos</option>
        </select>
      </div>
      
      <div className="notes-list">
        {notes.length === 0 ? (
          <div className="empty-state">
            <p>No hay notas registradas.</p>
            <p className="empty-subtitle">Agrega notas para llevar un seguimiento del cliente.</p>
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} className={`note-card ${note.category}`}>
              <div className="note-header">
                <span className="note-date">
                  {new Date(note.date).toLocaleDateString('es-ES', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span className="note-category-badge">{note.category}</span>
              </div>
              
              {editingNote === note.id ? (
                <div className="note-edit">
                  <textarea
                    className="edit-input"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                  />
                  <div className="edit-actions">
                    <button 
                      className="save-edit-btn"
                      onClick={() => handleSaveEdit(note.id)}
                      disabled={!editText.trim()}
                    >
                      Guardar
                    </button>
                    <button 
                      className="cancel-edit-btn"
                      onClick={handleCancelEdit}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="note-text">{note.text}</p>
                  <div className="note-actions">
                    <button 
                      className="edit-note-btn"
                      onClick={() => handleEditNote(note.id)}
                    >
                      Editar
                    </button>
                    <button 
                      className="delete-note-btn"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesTab;