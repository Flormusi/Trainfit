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
  // Campos alternativos que pueden venir del backend
  series?: number | string;
  weightsPerSeries?: (number | string)[];
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
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn('Error loading image:', msg);
      return null;
    }
  };

  // Helper para dar aire a números tipo '12-10-8' → '12 · 10 · 8'
  const formatDelimited = (value: any) => {
    const s = String(value ?? '').trim();
    if (!s) return '-';
    return s.includes('-') ? s.split('-').map(v => v.trim()).join(' · ') : s;
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

      // Header con diseño Trainfit profesional (banner negro)
      pdf.setFillColor(...trainfitBlack);
      pdf.rect(0, 0, pageWidth, 35, 'F');
      
      // Logo TRAINFIT (carga desde /public/images)
      try {
        const logoResp = await fetch('/images/logo-trainfit.png');
        const logoBlob = await logoResp.blob();
        const logoBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(logoBlob);
        });
        const imgEl = new Image();
        imgEl.src = logoBase64;
        await new Promise((resolve) => { imgEl.onload = resolve; });
        const naturalW = (imgEl.naturalWidth || 0);
        const naturalH = (imgEl.naturalHeight || 0);
        const targetH = 16;
        const targetW = naturalW && naturalH ? (targetH * (naturalW / naturalH)) : 24;
        pdf.addImage(imgEl, 'PNG', 12, 9, targetW, targetH);
      } catch (error) {
        // Fallback al texto si falla la carga del logo
        pdf.setTextColor(...trainfitWhite);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('TRAINFIT', 15, 15);
      }
      
      // Subtítulo junto al logo
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...trainfitWhite);
      pdf.text('FITNESS & TRAINING', 15, 25);

      // Título grande: Plan de Entrenamiento - Día X (centrado)
      const dayTitle = routine.name || 'Rutina';
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(26);
      pdf.text(`Plan de Entrenamiento - ${dayTitle}`, pageWidth / 2, 22, { align: 'center' });

      // Subtítulo con cliente, fecha y progreso
      const storedUserStr = localStorage.getItem('user');
      let currentClientName = 'N/A';
      try {
        currentClientName = storedUserStr ? (JSON.parse(storedUserStr)?.name || 'N/A') : 'N/A';
      } catch {
        currentClientName = 'N/A';
      }
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`Cliente: ${currentClientName} • Fecha: ${new Date().toLocaleDateString('es-ES')} • Progreso: 0%`, pageWidth / 2, 30, { align: 'center' });

      // Separador decorativo bajo el header
      pdf.setDrawColor(230, 230, 230);
      pdf.setLineWidth(0.5);
      pdf.line(15, 35, pageWidth - 15, 35);
      
      yPosition = 45;
      pdf.setTextColor(...trainfitBlack);

      // Información general
      pdf.setFillColor(...trainfitDarkGray);
      pdf.rect(15, yPosition, pageWidth - 30, 25, 'F');
      pdf.setDrawColor(...trainfitLightGray);
      pdf.setLineWidth(0.25);
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
      // Series Totales: soporte para sets o series (string/number) y evitar NaN
      const totalSeries = routine.exercises.reduce((total, ex: any) => {
        const raw = ex.sets ?? ex.series;
        const parsed = typeof raw === 'string' ? parseInt(raw, 10) : Number(raw);
        return total + (Number.isFinite(parsed) ? parsed : 0);
      }, 0);
      pdf.text(`Series Totales: ${totalSeries}`, pageWidth - 80, infoY);
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
             } catch (error: unknown) {
               const msg = error instanceof Error ? error.message : String(error);
               console.warn(`Error cargando imagen para ${exercise.name}:`, msg);
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
      // Usamos márgenes fijos de 15mm y ajustamos columnas para que el ancho total
      // sea exactamente pageWidth - 30mm, evitando recortes y desbordes.
      const tableHeaders = ['#', 'Imagen', 'Ejercicio', 'Series', 'Reps', 'Peso', 'Descanso'];
      const tableStartX = 15;
      const tableWidth = pageWidth - 30; // respetar márgenes
      const colWidths = [12, 46, 80, 22, 34, 34, 39]; // suma = 267mm = tableWidth
      let xPosition = tableStartX;

      // Encabezados de tabla
      // Evitamos símbolos especiales en headers para asegurar tipografía consistente
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
        // Si hay notas, damos un poco más de altura a la fila
        const hasNotes = !!(exercise as any).notes && String((exercise as any).notes).trim() !== '';
        const rowHeight = hasNotes ? 54 : 50;

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
        pdf.setLineWidth(0.25);
        xPosition = tableStartX;
        
        colWidths.forEach((width) => {
          pdf.rect(xPosition, yPosition, width, rowHeight);
          xPosition += width;
        });

        // Contenido de las celdas
        xPosition = tableStartX;
        
        // Número de ejercicio con círculo rojo (radio ajustado para no tocar bordes)
        pdf.setFillColor(...trainfitRed);
        const circleX = xPosition + colWidths[0]/2;
        const circleY = yPosition + rowHeight/2;
        pdf.circle(circleX, circleY, 5, 'F');
        pdf.setTextColor(...trainfitWhite);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text((index + 1).toString(), circleX, circleY + 2, { align: 'center' });
        xPosition += colWidths[0];

        // Imagen del ejercicio (padding simétrico y proporción preservada)
        pdf.setTextColor(...trainfitBlack);
        pdf.setFont('helvetica', 'normal');
        if (exercise.imageBase64) {
          try {
            const boxPadding = 4;
            const boxW = colWidths[1] - boxPadding * 2;
            const boxH = rowHeight - 12; // aire vertical
            const imgEl = new Image();
            imgEl.src = exercise.imageBase64 as string;
            await new Promise((resolve) => { imgEl.onload = resolve; });
            const iW = imgEl.naturalWidth || 1;
            const iH = imgEl.naturalHeight || 1;
            const scale = Math.min(boxW / iW, boxH / iH);
            const targetW = Math.max(1, Math.min(iW * scale, boxW));
            const targetH = Math.max(1, Math.min(iH * scale, boxH));
            const imgX = xPosition + boxPadding + (boxW - targetW) / 2;
            const imgY = yPosition + (rowHeight - targetH) / 2;
            pdf.addImage(imgEl, 'JPEG', imgX, imgY, targetW, targetH);
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

        // Nombre del ejercicio + notas del entrenador (si existen)
        pdf.setFontSize(10);
        pdf.setTextColor(...trainfitBlack);
        const nameY = yPosition + (hasNotes ? rowHeight/2 - 4 : rowHeight/2);
        pdf.text(exercise.name, xPosition + 3, nameY, { maxWidth: colWidths[2] - 6 });

        // Notas por ejercicio: segunda línea en cursiva y gris
        if (hasNotes) {
          const rawNotes = String((exercise as any).notes);
          const notesLines = pdf.splitTextToSize(rawNotes, colWidths[2] - 6);
          const limitedLines = Array.isArray(notesLines) ? notesLines.slice(0, 2) : [notesLines];
          pdf.setFont('helvetica', 'italic');
          pdf.setTextColor(110, 110, 110);
          const notesStartY = nameY + 8;
          limitedLines.forEach((line: string, i: number) => {
            pdf.text(line, xPosition + 3, notesStartY + i * 4);
          });
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(...trainfitBlack);
        }
        xPosition += colWidths[2];
        
        // Series (fallback a 'series' si 'sets' no está)
        {
          const seriesRaw = (editedExercises[exercise.id]?.sets ?? exercise.sets ?? (exercise as any).series);
          const seriesText = (seriesRaw !== undefined && seriesRaw !== null && String(seriesRaw).trim() !== '')
            ? String(seriesRaw)
            : '-';
          pdf.text(seriesText, xPosition + colWidths[3]/2, yPosition + rowHeight/2, { align: 'center' });
        }
        xPosition += colWidths[3];
        
        // Reps (envolver para que no se desborde)
        {
          const repsText = formatDelimited((getDisplayValue(exercise, 'reps') || 0).toString());
          const maxWidth = colWidths[4] - 6; // padding lateral
          const lines = pdf.splitTextToSize(repsText, maxWidth);
          const visible = Array.isArray(lines) ? lines.slice(0, 2) : [lines];
          const lineHeight = 4;
          const centerY = yPosition + rowHeight/2;
          const startY = centerY - ((visible.length - 1) * lineHeight) / 2;
          visible.forEach((line: string, i: number) => {
            pdf.text(line, xPosition + colWidths[4]/2, startY + i * lineHeight, { align: 'center' });
          });
        }
        xPosition += colWidths[4];
        
        // Peso: usar weightsPerSeries si existe, si no weight básico
        const rawWeights = (exercise as any).weightsPerSeries;
        const joinedWeights = Array.isArray(rawWeights) && rawWeights.length > 0
          ? rawWeights.map((w: any) => String(w).replace(/kg/gi, '').trim()).join('-')
          : (editedExercises[exercise.id]?.weight ?? exercise.weight);
        const weightText = (joinedWeights !== undefined && joinedWeights !== null && String(joinedWeights).trim() !== '')
          ? `${formatDelimited(String(joinedWeights).replace(/kg/gi, '').trim())} kg`
          : '-';
        // Peso (envolver si es necesario)
        {
          const maxWidthW = colWidths[5] - 6;
          const wLines = pdf.splitTextToSize(weightText, maxWidthW);
          const wVisible = Array.isArray(wLines) ? wLines.slice(0, 2) : [wLines];
          const lineHeight = 4;
          const centerY = yPosition + rowHeight/2;
          const startY = centerY - ((wVisible.length - 1) * lineHeight) / 2;
          wVisible.forEach((line: string, i: number) => {
            pdf.text(line, xPosition + colWidths[5]/2, startY + i * lineHeight, { align: 'center' });
          });
        }
        xPosition += colWidths[5];
        
        // Descanso
        pdf.text((exercise.restTime !== undefined && exercise.restTime !== null) ? `${exercise.restTime}s` : '-', xPosition + colWidths[6]/2, yPosition + rowHeight/2, { align: 'center' });
        
        yPosition += rowHeight;
      }
      
      // Footer con branding y número de página (igual que el PDF del entrenador)
      const footerHeight = 22;
      const footerY = pageHeight - footerHeight;
      const totalPages = pdf.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        pdf.setFillColor(...trainfitBlack);
        pdf.rect(0, footerY, pageWidth, footerHeight, 'F');
        pdf.setTextColor(...trainfitWhite);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.text('Trainfit - Tu entrenamiento a medida', pageWidth / 2, footerY + 14, { align: 'center' });
        pdf.setFontSize(8);
        pdf.text(`Página ${p} de ${totalPages}`, pageWidth - 20, footerY + 14, { align: 'right' });
      }

      // Descargar el PDF
      const fileName = `rutina-${routine.name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      pdf.save(fileName);
      
      toast.success('Rutina descargada exitosamente en PDF');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Error downloading PDF:', msg);
      toast.error('Error al descargar la rutina');
    }
  };

  const getDisplayValue = (exercise: Exercise, field: 'weight' | 'sets' | 'reps') => {
    const editedValue = editedExercises[exercise.id]?.[field];
    if (editedValue !== undefined && editedValue !== null) return editedValue;

    if (field === 'sets') {
      const raw: any = exercise.sets ?? exercise.series;
      if (typeof raw === 'string') {
        const n = parseInt(raw.replace(/[^0-9]/g, ''), 10);
        return Number.isFinite(n) ? n : '';
      }
      return raw ?? '';
    }

    if (field === 'weight') {
      const raw: any = exercise.weight ?? (Array.isArray(exercise.weightsPerSeries) ? exercise.weightsPerSeries[0] : undefined);
      if (Array.isArray(raw)) {
        const first = raw[0];
        const n = typeof first === 'string' ? parseFloat(String(first).replace(/kg/gi, '').trim()) : Number(first);
        return Number.isFinite(n) ? n : '';
      }
      if (typeof raw === 'string') {
        const n = parseFloat(raw.replace(/kg/gi, '').trim());
        return Number.isFinite(n) ? n : '';
      }
      return raw ?? '';
    }

    // reps: si viene como cadena tipo "12-10-8", tomar la primera
    const r: any = exercise.reps as any;
    if (typeof r === 'string') {
      const first = r.split(/[\-,·]/)[0]?.trim();
      const n = parseInt(first, 10);
      return Number.isFinite(n) ? n : '';
    }
    return r ?? '';
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
                    <div className="stat-number">{
                      routine.exercises.reduce((total, ex: any) => {
                        const raw = ex.sets ?? ex.series;
                        const parsed = typeof raw === 'string' ? parseInt(String(raw).replace(/[^0-9]/g, ''), 10) : Number(raw);
                        return total + (Number.isFinite(parsed) ? parsed : 0);
                      }, 0)
                    }</div>
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
                              <span className="quick-stat">{(exercise.sets ?? exercise.series) ? `${String(exercise.sets ?? exercise.series).toString()} series` : 'SERIES'}</span>
                              <span className="quick-stat">{exercise.reps ? `${String(exercise.reps)} reps` : 'REPS'}</span>
                              {(exercise.weight ?? (exercise.weightsPerSeries && exercise.weightsPerSeries[0] !== undefined)) && (
                                <span className="quick-stat">{
                                  `${String(
                                    exercise.weight ?? (Array.isArray(exercise.weightsPerSeries) ? exercise.weightsPerSeries[0] : '')
                                  ).replace(/kg/gi, '').trim()} kg`
                                }</span>
                              )}
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