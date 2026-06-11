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
  imageUrl?: string;
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
  const [editedExercises, setEditedExercises] = useState<{ [key: string]: { weight?: number; sets?: number; reps?: number; rpe?: number } }>({});
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

  const handleExerciseEdit = (exerciseId: string, field: 'weight' | 'sets' | 'reps' | 'rpe', value: number) => {
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

  // Helper: get series/reps/peso from new weeks structure or legacy fields
  const getExerciseField = (ex: any, field: 'series' | 'reps' | 'peso') => {
    // Try new weeks structure first (use week1 as reference for PDF)
    if (ex.weeks?.week1) {
      const val = ex.weeks.week1[field];
      if (val && String(val).trim()) return String(val).trim();
    }
    // Legacy fallback
    if (field === 'series') return String(ex.sets ?? ex.series ?? '').trim() || '-';
    if (field === 'reps') return String(ex.reps ?? '').trim() || '-';
    if (field === 'peso') {
      const w = ex.weight ?? (Array.isArray(ex.weightsPerSeries) ? ex.weightsPerSeries[0] : undefined);
      return w !== undefined && w !== null && String(w).trim() ? `${String(w).replace(/kg/gi,'').trim()} kg` : '-';
    }
    return '-';
  };

  const downloadPDF = async () => {
    try {
      if (!routine) return;

      const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait A4
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 0;

      // Colores
      const trainfitRed = [220, 38, 38] as [number, number, number];
      const trainfitBlack = [10, 10, 10] as [number, number, number];
      const trainfitLightGray = [156, 163, 175] as [number, number, number];
      const trainfitWhite = [255, 255, 255] as [number, number, number];

      // ── HEADER ──────────────────────────────────────────────
      const headerH = 28;
      pdf.setFillColor(...trainfitBlack);
      pdf.rect(0, 0, pageWidth, headerH, 'F');

      // Logo texto (izquierda)
      pdf.setTextColor(...trainfitRed);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('TRAINFIT', 12, 12);
      pdf.setFontSize(7);
      pdf.setTextColor(...trainfitLightGray);
      pdf.setFont('helvetica', 'normal');
      pdf.text('FITNESS & TRAINING', 12, 18);

      // Título rutina (derecha del logo, centrado verticalmente)
      const dayTitle = routine.name || 'Rutina';
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.setTextColor(...trainfitWhite);
      pdf.text(dayTitle, pageWidth / 2 + 15, 13, { align: 'center' });

      // Subtítulo cliente + fecha
      const storedUserStr = localStorage.getItem('user');
      let currentClientName = 'N/A';
      try { currentClientName = storedUserStr ? (JSON.parse(storedUserStr)?.name || 'N/A') : 'N/A'; } catch { currentClientName = 'N/A'; }
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(...trainfitLightGray);
      pdf.text(`${currentClientName} · ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2 + 15, 21, { align: 'center' });

      yPosition = headerH + 8;

      // Precargar imágenes
      toast.loading('Generando PDF...');
      const exercisesWithImages = await Promise.allSettled(
        routine.exercises.map(async (exercise) => {
          let imageBase64 = null;
          const imgSrc = exercise.image_url || exercise.imageUrl;
          if (imgSrc) {
            try { imageBase64 = await getImageAsBase64(imgSrc); } catch { /* sin imagen */ }
          }
          return { ...exercise, imageBase64 };
        })
      ).then(results =>
        results.map((result, index) =>
          result.status === 'fulfilled' ? result.value : {
            ...routine.exercises[index] || routine.exercises[0],
            name: 'Ejercicio sin datos',
            imageBase64: null,
          }
        )
      );


      // Tabla de ejercicios
      // Usamos márgenes fijos de 15mm y ajustamos columnas para que el ancho total
      // sea exactamente pageWidth - 30mm, evitando recortes y desbordes.
      // ── TABLA DE EJERCICIOS ─────────────────────────────────
      // Columnas: # | Imagen | Ejercicio+Notas | Series | Reps | Peso
      const tableStartX = 10;
      const tableWidth = pageWidth - 20;
      // Anchos columnas en portrait A4 (210mm ancho - 20mm márgenes = 190mm)
      const colW = [8, 28, 90, 16, 20, 28] as const; // suma = 190
      const tableHeaders = ['#', 'Img', 'Ejercicio', 'Series', 'Reps', 'Peso'];
      const rowH = 22; // compacto: ~8 ejercicios por página
      const headerH2 = 9;

      const drawTableHeader = () => {
        pdf.setFillColor(...trainfitRed);
        pdf.rect(tableStartX, yPosition, tableWidth, headerH2, 'F');
        pdf.setTextColor(...trainfitWhite);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        let x = tableStartX;
        tableHeaders.forEach((h, i) => {
          pdf.text(h, x + colW[i] / 2, yPosition + 6, { align: 'center' });
          x += colW[i];
        });
        yPosition += headerH2;
        pdf.setTextColor(...trainfitBlack);
        pdf.setFont('helvetica', 'normal');
      };

      drawTableHeader();

      for (let index = 0; index < exercisesWithImages.length; index++) {
        const exercise = exercisesWithImages[index] as any;
        const hasNotes = !!exercise.notes && String(exercise.notes).trim() !== '';

        // Nueva página si no cabe
        if (yPosition + rowH > pageHeight - 18) {
          pdf.addPage();
          yPosition = 10;
          drawTableHeader();
        }

        // Fondo alternado
        if (index % 2 === 0) {
          pdf.setFillColor(247, 247, 247);
          pdf.rect(tableStartX, yPosition, tableWidth, rowH, 'F');
        }

        // Borde inferior de fila
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.2);
        pdf.line(tableStartX, yPosition + rowH, tableStartX + tableWidth, yPosition + rowH);

        let x = tableStartX;
        const midY = yPosition + rowH / 2;

        // # con círculo rojo
        pdf.setFillColor(...trainfitRed);
        pdf.circle(x + colW[0] / 2, midY, 3.5, 'F');
        pdf.setTextColor(...trainfitWhite);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.text(String(index + 1), x + colW[0] / 2, midY + 1.5, { align: 'center' });
        x += colW[0];

        // Imagen
        pdf.setTextColor(...trainfitBlack);
        pdf.setFont('helvetica', 'normal');
        if (exercise.imageBase64) {
          try {
            const pad = 2;
            const bW = colW[1] - pad * 2;
            const bH = rowH - pad * 2;
            const imgEl = new Image();
            imgEl.src = exercise.imageBase64 as string;
            await new Promise((res) => { imgEl.onload = res; });
            const scale = Math.min(bW / (imgEl.naturalWidth || 1), bH / (imgEl.naturalHeight || 1));
            const iW = Math.max(1, (imgEl.naturalWidth || 1) * scale);
            const iH = Math.max(1, (imgEl.naturalHeight || 1) * scale);
            pdf.addImage(imgEl, 'JPEG', x + pad + (bW - iW) / 2, yPosition + pad + (bH - iH) / 2, iW, iH);
          } catch { /* sin imagen */ }
        }
        x += colW[1];

        // Nombre + notas
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(20, 20, 20);
        const nameLines = pdf.splitTextToSize(exercise.name, colW[2] - 4);
        const visibleName = Array.isArray(nameLines) ? nameLines.slice(0, hasNotes ? 1 : 2) : [nameLines];
        const nameStartY = hasNotes ? yPosition + 5 : midY - (visibleName.length - 1) * 2;
        visibleName.forEach((line: string, li: number) => pdf.text(line, x + 2, nameStartY + li * 4));
        if (hasNotes) {
          pdf.setFont('helvetica', 'italic');
          pdf.setFontSize(7);
          pdf.setTextColor(120, 120, 120);
          const notesLines = pdf.splitTextToSize(String(exercise.notes), colW[2] - 4);
          const visibleNotes = Array.isArray(notesLines) ? notesLines.slice(0, 2) : [notesLines];
          visibleNotes.forEach((line: string, li: number) => pdf.text(line, x + 2, nameStartY + 5 + li * 3.5));
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(20, 20, 20);
        }
        x += colW[2];

        // Series / Reps / Peso — leer del nuevo formato weeks o fallback legacy
        const seriesVal = getExerciseField(exercise, 'series');
        const repsVal = getExerciseField(exercise, 'reps');
        const pesoVal = getExerciseField(exercise, 'peso');

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(20, 20, 20);

        pdf.text(seriesVal, x + colW[3] / 2, midY + 1, { align: 'center' });
        x += colW[3];

        // Reps: si es piramidal mostrar en naranja
        if (exercise.pyramidal) pdf.setTextColor(180, 100, 0);
        pdf.text(repsVal, x + colW[4] / 2, midY + 1, { align: 'center' });
        pdf.setTextColor(20, 20, 20);
        x += colW[4];

        pdf.text(pesoVal, x + colW[5] / 2, midY + 1, { align: 'center' });

        yPosition += rowH;
      }

      // ── FOOTER ──────────────────────────────────────────────
      const footerH = 12;
      const totalPages = pdf.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        const footerY = pageHeight - footerH;
        pdf.setFillColor(...trainfitBlack);
        pdf.rect(0, footerY, pageWidth, footerH, 'F');
        pdf.setTextColor(...trainfitWhite);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.text('Trainfit · Tu entrenamiento a medida', pageWidth / 2, footerY + 8, { align: 'center' });
        pdf.text(`${p} / ${totalPages}`, pageWidth - 12, footerY + 8, { align: 'right' });
      }

      const fileName = `rutina-${routine.name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      pdf.save(fileName);
      toast.success('PDF descargado');
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

  // Helper: extract week data from new structure or fallback to legacy fields
  const getWeekData = (exercise: any, weekKey: string) => {
    if (exercise.weeks && exercise.weeks[weekKey]) {
      return exercise.weeks[weekKey] as { series: string; reps: string; peso: string };
    }
    // Legacy fallback: use top-level sets/reps/weight for week1
    if (weekKey === 'week1') {
      return {
        series: String(exercise.sets ?? exercise.series ?? ''),
        reps: String(exercise.reps ?? ''),
        peso: String(exercise.weight ?? ''),
      };
    }
    return null;
  };

  const hasWeeksData = (exercise: any) =>
    exercise.weeks && (exercise.weeks.week1 || exercise.weeks.week2 || exercise.weeks.week3 || exercise.weeks.week4);

  const getRpeLabel = (rpe: string) => {
    const n = parseInt(rpe);
    if (!n) return null;
    if (n <= 4) return { label: `RPE ${n} · Suave`, color: '#16a34a' };
    if (n <= 6) return { label: `RPE ${n} · Moderado`, color: '#ca8a04' };
    if (n <= 8) return { label: `RPE ${n} · Alto`, color: '#ea580c' };
    return { label: `RPE ${n} · Máximo`, color: '#dc2626' };
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: '16px',
          overflowY: 'auto',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          style={{
            background: '#1a1a1a',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '560px',
            marginTop: '16px',
            marginBottom: '16px',
            overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
          }}
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2a1a1a 100%)',
            borderBottom: '1px solid #333',
            padding: '20px 20px 16px',
            position: 'sticky', top: 0, zIndex: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', letterSpacing: 2, textTransform: 'uppercase' }}>TRAINFIT</span>
                <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: '4px 0 0', lineHeight: 1.2 }}>
                  {routine?.name || 'Cargando...'}
                </h2>
                {routine?.description && (
                  <p style={{ color: '#9ca3af', fontSize: 13, margin: '4px 0 0' }}>{routine.description}</p>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={downloadPDF}
                  disabled={!routine}
                  style={{
                    background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8,
                    padding: '8px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    opacity: routine ? 1 : 0.5,
                  }}
                >
                  📄 PDF
                </button>
                <button
                  onClick={onClose}
                  style={{
                    background: '#333', color: '#fff', border: 'none', borderRadius: 8,
                    width: 36, height: 36, fontSize: 16, cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '16px', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                <p>Cargando rutina...</p>
              </div>
            ) : routine ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Summary row */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                  {[
                    { n: routine.exercises.length, label: 'Ejercicios' },
                    { n: 4, label: 'Semanas' },
                  ].map(({ n, label }) => (
                    <div key={label} style={{
                      flex: 1, background: '#111', borderRadius: 10, padding: '10px 12px',
                      textAlign: 'center', border: '1px solid #2a2a2a',
                    }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: '#dc2626' }}>{n}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Exercise cards */}
                {routine.exercises.map((exercise: any, index: number) => {
                  const weeks = ['week1', 'week2', 'week3', 'week4'];
                  const weeksWithData = weeks.map(w => ({ key: w, data: getWeekData(exercise, w) })).filter(w => w.data && (w.data.series || w.data.reps || w.data.peso));
                  const rpeInfo = exercise.rpe ? getRpeLabel(exercise.rpe) : null;
                  const myWeight = editedExercises[exercise.id]?.weight;

                  return (
                    <div key={exercise.id} style={{
                      background: '#111',
                      borderRadius: 12,
                      border: '1px solid #2a2a2a',
                      overflow: 'hidden',
                    }}>
                      {/* Exercise top row */}
                      <div style={{ display: 'flex', gap: 12, padding: 14, alignItems: 'flex-start' }}>
                        {/* Number */}
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: '#dc2626', color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 700, flexShrink: 0,
                        }}>
                          {index + 1}
                        </div>

                        {/* Image + info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            {(exercise.image_url || exercise.imageUrl) && (
                              <img
                                src={exercise.image_url || exercise.imageUrl}
                                alt={exercise.name}
                                style={{
                                  width: 88, height: 66, borderRadius: 8, objectFit: 'contain',
                                  border: '1px solid #333', flexShrink: 0, background: '#1a1a1a', padding: 4,
                                }}
                              />
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h4 style={{ color: '#fff', fontSize: 15, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>
                                {exercise.name}
                              </h4>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                                {rpeInfo && (
                                  <span style={{
                                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                                    background: rpeInfo.color + '22', color: rpeInfo.color, border: `1px solid ${rpeInfo.color}44`,
                                  }}>
                                    {rpeInfo.label}
                                  </span>
                                )}
                                {exercise.pyramidal && (
                                  <span style={{
                                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                                    background: '#92400e22', color: '#f59e0b', border: '1px solid #92400e44',
                                  }}>
                                    🔺 Piramidal
                                  </span>
                                )}
                                {exercise.video_url && (
                                  <a href={exercise.video_url} target="_blank" rel="noopener noreferrer" style={{
                                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                                    background: '#1e3a5f', color: '#60a5fa', border: '1px solid #1e40af',
                                    textDecoration: 'none',
                                  }}>
                                    ▶ Video
                                  </a>
                                )}
                              </div>
                              {exercise.notes && (
                                <p style={{ color: '#9ca3af', fontSize: 12, margin: '6px 0 0', fontStyle: 'italic' }}>
                                  📝 {exercise.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Weeks table */}
                      {weeksWithData.length > 0 && (
                        <div style={{ borderTop: '1px solid #222', overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                              <tr style={{ background: '#1e1e1e' }}>
                                <th style={{ padding: '8px 10px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: 11, width: '30%' }}>Semana</th>
                                <th style={{ padding: '8px 6px', textAlign: 'center', color: '#6b7280', fontWeight: 600, fontSize: 11 }}>Series</th>
                                <th style={{ padding: '8px 6px', textAlign: 'center', color: '#6b7280', fontWeight: 600, fontSize: 11 }}>Reps</th>
                                <th style={{ padding: '8px 6px', textAlign: 'center', color: '#6b7280', fontWeight: 600, fontSize: 11 }}>Peso obj.</th>
                              </tr>
                            </thead>
                            <tbody>
                              {weeksWithData.map(({ key, data }, wi) => (
                                <tr key={key} style={{ borderTop: '1px solid #222', background: wi % 2 === 0 ? 'transparent' : '#0d0d0d' }}>
                                  <td style={{ padding: '8px 10px', color: '#e5e7eb', fontWeight: 600, fontSize: 12 }}>
                                    Semana {wi + 1}
                                  </td>
                                  <td style={{ padding: '8px 6px', textAlign: 'center', color: '#d1d5db' }}>{data?.series || '-'}</td>
                                  <td style={{ padding: '8px 6px', textAlign: 'center', color: exercise.pyramidal ? '#f59e0b' : '#d1d5db' }}>
                                    {data?.reps || '-'}
                                  </td>
                                  <td style={{ padding: '8px 6px', textAlign: 'center', color: '#d1d5db' }}>
                                    {data?.peso ? `${data.peso} kg` : '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Client weight + RPE input */}
                      <div style={{
                        borderTop: '1px solid #222',
                        padding: '12px 14px',
                        background: '#0d1117',
                        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'
                      }}>
                        <span style={{ color: '#9ca3af', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>
                          💪 Mi peso:
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={myWeight !== undefined ? myWeight : ''}
                          onChange={(e) => handleExerciseEdit(exercise.id, 'weight', parseFloat(e.target.value))}
                          placeholder="ej: 20"
                          style={{
                            background: '#1a1a1a', border: '1px solid #dc262650',
                            borderRadius: 8, color: '#fff', padding: '8px 12px', fontSize: 14,
                            outline: 'none', width: 80,
                          }}
                        />
                        <span style={{ color: '#6b7280', fontSize: 13 }}>kg</span>

                        <span style={{ color: '#f97316', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', marginLeft: 8 }}>
                          🔥 RPE:
                        </span>
                        <select
                          value={editedExercises[exercise.id]?.rpe ?? ''}
                          onChange={(e) => handleExerciseEdit(exercise.id, 'rpe', parseInt(e.target.value))}
                          style={{
                            background: '#1a1a1a', border: '1px solid #f9741650',
                            borderRadius: 8, color: '#fff', padding: '8px 10px', fontSize: 14,
                            outline: 'none', width: 80,
                          }}
                        >
                          <option value="">-</option>
                          {[1,2,3,4,5,6,7,8,9,10].map(n => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                        <span style={{ color: '#6b7280', fontSize: 11 }}>(1=fácil · 10=máximo)</span>

                        {myWeight !== undefined && (
                          <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>✓</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
                <p>Error al cargar la rutina</p>
              </div>
            )}
          </div>

          {/* Footer - save button */}
          {routine && Object.keys(editedExercises).length > 0 && (
            <div style={{
              padding: '14px 16px',
              borderTop: '1px solid #2a2a2a',
              display: 'flex', gap: 8,
              position: 'sticky', bottom: 0,
              background: '#1a1a1a',
            }}>
              <button
                onClick={saveChanges}
                disabled={isSaving}
                style={{
                  flex: 1, background: '#dc2626', color: '#fff', border: 'none',
                  borderRadius: 10, padding: '12px', fontSize: 15, fontWeight: 700,
                  cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1,
                }}
              >
                {isSaving ? 'Guardando...' : '💾 Guardar mis pesos'}
              </button>
              <button
                onClick={() => setEditedExercises({})}
                disabled={isSaving}
                style={{
                  background: '#333', color: '#9ca3af', border: 'none',
                  borderRadius: 10, padding: '12px 16px', fontSize: 14, cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RoutineDetailsModal;