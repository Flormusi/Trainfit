import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clientApi } from '../services/api';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import './RoutineDetailsModal.css';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  restTime?: number;
  notes?: string;
  image_url?: string;
}

interface Routine {
  id: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
}

interface RoutineDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  routineId: string;
}

const RoutineDetailsModal: React.FC<RoutineDetailsModalProps> = ({
  isOpen,
  onClose,
  routineId
}) => {
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(false);
  const [editedExercises, setEditedExercises] = useState<{ [key: string]: { weight?: number; sets?: number; reps?: number } }>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && routineId) {
      loadRoutineDetails();
    }
  }, [isOpen, routineId]);

  const loadRoutineDetails = async () => {
    if (!routineId) return;
    
    setLoading(true);
    try {
      console.log('🔍 Cargando rutina con ID:', routineId);
      const routineData = await clientApi.getRoutineDetails(routineId);
      console.log('✅ Rutina cargada:', routineData);
      
      if (routineData && routineData.id && routineData.name) {
        setRoutine(routineData);
        console.log('✅ Rutina establecida correctamente:', routineData.name);
      } else {
        console.error('❌ Datos de rutina inválidos:', routineData);
        toast.error('Los datos de la rutina no son válidos');
      }
    } catch (error: any) {
      console.error('❌ Error loading routine details:', error);
      toast.error('Error al cargar los detalles de la rutina');
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseEdit = (exerciseId: string, field: 'weight' | 'sets' | 'reps', value: number) => {
    setEditedExercises(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [field]: value
      }
    }));
  };

  const saveChanges = async () => {
    if (!routine || Object.keys(editedExercises).length === 0) {
      toast.info('No hay cambios para guardar');
      return;
    }

    try {
      setIsSaving(true);
      
      // Actualizar cada ejercicio modificado
      for (const [exerciseId, changes] of Object.entries(editedExercises)) {
        await clientApi.updateExerciseProgress(exerciseId, changes);
      }
      
      toast.success('Cambios guardados exitosamente');
      setEditedExercises({});
      loadRoutineDetails(); // Recargar datos
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Error al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  const getImageAsBase64 = async (imageUrl: string): Promise<string | null> => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('Error loading image:', error);
      return null;
    }
  };

  const downloadPDF = async () => {
    try {
      if (!routine) return;
      
      const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape para formato profesional
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 15;

      // Paleta de colores Trainfit
      const trainfitRed = [220, 38, 38] as [number, number, number];
      const trainfitBlack = [10, 10, 10] as [number, number, number];
      const trainfitDarkGray = [26, 26, 26] as [number, number, number];
      const trainfitLightGray = [156, 163, 175] as [number, number, number];
      const trainfitWhite = [255, 255, 255] as [number, number, number];

      // Header con diseño Trainfit profesional
      pdf.setFillColor(...trainfitRed);
      pdf.rect(0, 0, pageWidth, 35, 'F');
      
      // Logo TRAINFIT
      pdf.setTextColor(...trainfitWhite);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TRAINFIT', 15, 15);
      
      // Subtítulo
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('FITNESS & TRAINING', 15, 25);
      
      // Título de la rutina centrado
      pdf.setFontSize(24);
      pdf.text(routine.name.toUpperCase(), pageWidth / 2, 22, { align: 'center' });
      
      yPosition = 45;
      pdf.setTextColor(...trainfitBlack);

      // Información general
      pdf.setFillColor(...trainfitDarkGray);
      pdf.rect(15, yPosition, pageWidth - 30, 25, 'F');
      pdf.setDrawColor(...trainfitLightGray);
      pdf.setLineWidth(0.3);
      pdf.rect(15, yPosition, pageWidth - 30, 25);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...trainfitWhite);
      pdf.text('INFORMACIÓN GENERAL', 20, yPosition + 10);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(...trainfitLightGray);
      const infoY = yPosition + 16;
      pdf.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 20, infoY);
      pdf.text(`Ejercicios: ${routine.exercises.length}`, pageWidth / 2 - 30, infoY);
      pdf.text(`Series Totales: ${routine.exercises.reduce((total, ex) => total + ex.sets, 0)}`, pageWidth - 80, infoY);
      if (routine.description) {
        pdf.text(`Descripción: ${routine.description.substring(0, 50)}...`, 20, infoY + 6);
      }

      yPosition += 35;

      // Precargar imágenes
       toast.loading('Generando PDF con imágenes...');
       const exercisesWithImages = await Promise.allSettled(
         routine.exercises.map(async (exercise) => {
           let imageBase64 = null;
           if (exercise.image_url) {
             try {
               imageBase64 = await getImageAsBase64(exercise.image_url);
             } catch (error) {
               console.warn(`Error cargando imagen para ${exercise.name}:`, error);
             }
           }
           return { ...exercise, imageBase64 };
         })
       ).then(results => 
         results.map((result, index) => 
           result.status === 'fulfilled' ? result.value : { 
             ...routine.exercises[index] || routine.exercises[0], 
             name: 'Ejercicio sin datos', 
             imageBase64: null 
           }
         )
       );

      // Tabla de ejercicios
      const tableHeaders = ['#', 'Imagen', 'Ejercicio', 'Series', 'Reps', 'Peso', 'Descanso'];
      const colWidths = [18, 40, 85, 28, 28, 28, 35];
      const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
      const tableStartX = (pageWidth - tableWidth) / 2;
      let xPosition = tableStartX;

      // Encabezados de tabla
      pdf.setFillColor(...trainfitRed);
      pdf.rect(tableStartX, yPosition, tableWidth, 14, 'F');
      pdf.setTextColor(...trainfitWhite);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);

      tableHeaders.forEach((header, index) => {
        pdf.text(header, xPosition + colWidths[index]/2, yPosition + 9, { align: 'center' });
        xPosition += colWidths[index];
      });

      yPosition += 14;
      pdf.setTextColor(...trainfitBlack);
      pdf.setFont('helvetica', 'normal');

      // Filas de ejercicios
      for (let index = 0; index < exercisesWithImages.length; index++) {
        const exercise = exercisesWithImages[index];
        const rowHeight = 35;

        if (yPosition + rowHeight > pageHeight - 25) {
          pdf.addPage();
          yPosition = 20;
          
          // Repetir encabezados
          pdf.setFillColor(...trainfitRed);
          pdf.rect(tableStartX, yPosition, tableWidth, 14, 'F');
          pdf.setTextColor(...trainfitWhite);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(11);
          
          xPosition = tableStartX;
          tableHeaders.forEach((header, headerIndex) => {
            pdf.text(header, xPosition + colWidths[headerIndex]/2, yPosition + 9, { align: 'center' });
            xPosition += colWidths[headerIndex];
          });
          
          yPosition += 14;
          pdf.setTextColor(...trainfitBlack);
          pdf.setFont('helvetica', 'normal');
        }

        // Alternar color de fila
        if (index % 2 === 0) {
          pdf.setFillColor(245, 245, 245);
          pdf.rect(tableStartX, yPosition, tableWidth, rowHeight, 'F');
        }

        // Bordes de celda
        pdf.setDrawColor(...trainfitLightGray);
        pdf.setLineWidth(0.3);
        xPosition = tableStartX;
        
        colWidths.forEach((width) => {
          pdf.rect(xPosition, yPosition, width, rowHeight);
          xPosition += width;
        });

        // Contenido de las celdas
        xPosition = tableStartX;
        
        // Número de ejercicio con círculo rojo
        pdf.setFillColor(...trainfitRed);
        const circleX = xPosition + colWidths[0]/2;
        const circleY = yPosition + rowHeight/2;
        pdf.circle(circleX, circleY, 6, 'F');
        pdf.setTextColor(...trainfitWhite);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text((index + 1).toString(), circleX, circleY + 2, { align: 'center' });
        xPosition += colWidths[0];

        // Imagen del ejercicio
        pdf.setTextColor(...trainfitBlack);
        pdf.setFont('helvetica', 'normal');
        if (exercise.imageBase64) {
          try {
            const maxImgWidth = 30;
            const maxImgHeight = 25;
            const imgPadding = 3;
            
            const imgX = xPosition + imgPadding;
            const imgY = yPosition + (rowHeight - maxImgHeight) / 2;
            
            pdf.addImage(exercise.imageBase64, 'JPEG', imgX, imgY, maxImgWidth, maxImgHeight);
          } catch (error) {
            console.warn('Error adding image to PDF:', error);
            pdf.setFontSize(8);
            pdf.text('Sin imagen', xPosition + colWidths[1]/2, yPosition + rowHeight/2, { align: 'center' });
          }
        } else {
          pdf.setFontSize(8);
          pdf.text('Sin imagen', xPosition + colWidths[1]/2, yPosition + rowHeight/2, { align: 'center' });
        }
        xPosition += colWidths[1];

        // Resto de información
        pdf.setFontSize(10);
        pdf.text(exercise.name, xPosition + 2, yPosition + rowHeight/2, { maxWidth: colWidths[2] - 4 });
        xPosition += colWidths[2];
        
        pdf.text((getDisplayValue(exercise, 'sets') || 0).toString(), xPosition + colWidths[3]/2, yPosition + rowHeight/2, { align: 'center' });
        xPosition += colWidths[3];
        
        pdf.text((getDisplayValue(exercise, 'reps') || 0).toString(), xPosition + colWidths[4]/2, yPosition + rowHeight/2, { align: 'center' });
        xPosition += colWidths[4];
        
        const weight = getDisplayValue(exercise, 'weight');
        pdf.text(weight ? `${weight} kg` : '-', xPosition + colWidths[5]/2, yPosition + rowHeight/2, { align: 'center' });
        xPosition += colWidths[5];
        
        pdf.text(exercise.restTime ? `${exercise.restTime}s` : '-', xPosition + colWidths[6]/2, yPosition + rowHeight/2, { align: 'center' });
        
        yPosition += rowHeight;
      }
      
      // Descargar el PDF
      const fileName = `rutina-${routine.name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      pdf.save(fileName);
      
      toast.success('Rutina descargada exitosamente en PDF');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Error al descargar la rutina');
    }
  };

  const getDisplayValue = (exercise: Exercise, field: 'weight' | 'sets' | 'reps') => {
    const editedValue = editedExercises[exercise.id]?.[field];
    return editedValue !== undefined ? editedValue : exercise[field];
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="routine-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="routine-modal-content"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="routine-modal-header tf-header-gradient">
            <div className="header-content">
              <div className="header-info">
                <div className="trainfit-logo">TRAINFIT</div>
                <h2>{routine?.name || 'Cargando...'}</h2>
                {routine?.description && (
                  <p className="routine-subtitle">{routine.description}</p>
                )}
              </div>
              <div className="routine-modal-actions">
                <button
                  className="btn-download modern-button"
                  onClick={downloadPDF}
                  disabled={!routine}
                >
                  📄 Descargar PDF
                </button>
                <button className="btn-close button-neutral" onClick={onClose}>
                  ✕
                </button>
              </div>
            </div>
          </div>

          <div className="routine-modal-body">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Cargando rutina...</p>
              </div>
            ) : routine ? (
              <>
                <div className="routine-stats">
                  <div className="stat-card">
                    <div className="stat-number">{routine.exercises.length}</div>
                    <div className="stat-label">Ejercicios</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{routine.exercises.reduce((total, ex) => total + ex.sets, 0)}</div>
                    <div className="stat-label">Series Totales</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{Math.round(routine.exercises.reduce((total, ex) => total + (ex.restTime || 60), 0) / 60)}</div>
                    <div className="stat-label">Min. Descanso</div>
                  </div>
                </div>
                
                <div className="exercises-list">
                  <div className="exercises-header">
                    <h3>Plan de Entrenamiento</h3>
                    <div className="exercises-count">{routine.exercises.length} ejercicios</div>
                  </div>
                  {routine.exercises.map((exercise, index) => (
                    <div key={exercise.id} className="exercise-card">
                      <div className="exercise-header">
                        <div className="exercise-number">{index + 1}</div>
                        <div className="exercise-main-info">
                          <div className="exercise-title-section">
                            <h4>{exercise.name}</h4>
                            <div className="exercise-quick-stats">
                              <span className="quick-stat">{exercise.sets} series</span>
                              <span className="quick-stat">{exercise.reps} reps</span>
                              {exercise.weight && <span className="quick-stat">{exercise.weight} kg</span>}
                            </div>
                          </div>
                          {exercise.image_url && (
                            <div className="exercise-image-container">
                              <img 
                                src={exercise.image_url} 
                                alt={exercise.name}
                                className="exercise-image"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="exercise-params">
                        <div className="param-group">
                          <label>Series:</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={getDisplayValue(exercise, 'sets')}
                            onChange={(e) => handleExerciseEdit(exercise.id, 'sets', parseInt(e.target.value))}
                            className="param-input"
                          />
                        </div>
                        
                        <div className="param-group">
                          <label>Repeticiones:</label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={getDisplayValue(exercise, 'reps')}
                            onChange={(e) => handleExerciseEdit(exercise.id, 'reps', parseInt(e.target.value))}
                            className="param-input"
                          />
                        </div>
                        
                        <div className="param-group">
                          <label>Peso (kg):</label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={getDisplayValue(exercise, 'weight') || ''}
                            onChange={(e) => handleExerciseEdit(exercise.id, 'weight', parseFloat(e.target.value))}
                            className="param-input"
                            placeholder="Opcional"
                          />
                        </div>
                        
                        {exercise.restTime && (
                          <div className="param-group readonly">
                            <label>Descanso:</label>
                            <span>{exercise.restTime} seg</span>
                          </div>
                        )}
                      </div>
                      
                      {exercise.notes && (
                        <div className="exercise-notes">
                          <strong>Notas:</strong> {exercise.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="error-state">
                <p>Error al cargar la rutina</p>
              </div>
            )}
          </div>

          {routine && Object.keys(editedExercises).length > 0 && (
            <div className="routine-modal-footer">
              <button
                className="btn-save"
                onClick={saveChanges}
                disabled={isSaving}
              >
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                className="btn-cancel"
                onClick={() => setEditedExercises({})}
                disabled={isSaving}
              >
                Cancelar Cambios
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RoutineDetailsModal;