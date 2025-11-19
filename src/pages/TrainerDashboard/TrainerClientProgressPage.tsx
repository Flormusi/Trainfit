import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { trainerApi } from '../../services/api';
import { toast } from 'react-hot-toast';
import CompleteProfileModal from '../../components/modals/CompleteProfileModal';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './TrainerClientProgressPage.css';

// Nuevo diseño implementado - versión actualizada

interface Routine {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  assignedDate: string;
  status: 'active' | 'completed' | 'paused' | 'vencida';
  progress: number;
  estimatedDuration?: string;
  difficulty?: string;
  totalWeeks?: number;
  endDate?: string;
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  completed: boolean;
  description?: string;
  muscleGroup?: string;
  duration?: string;
  restTime?: string;
  image?: string;
  videoUrl?: string;
  instructions?: string[];
  targetMuscles?: string[];
  equipment?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  seriesDetails?: {
    setNumber: number;
    reps: number;
    weight?: number;
    restTime?: string;
    completed?: boolean;
  }[];
}

interface PaymentStatus {
  status: 'paid' | 'pending' | 'overdue';
  amount: number;
  dueDate: string;
  lastPayment?: string;
}

interface ClientInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  weight?: number;
  height?: number;
  age?: number;
  gender?: string;
  fitnessLevel?: string;
  goals?: string[];
  clientProfile?: {
    age?: number;
    gender?: string;
    fitnessLevel?: string;
    goals?: string[];
    weight?: number;
    height?: number;
    phone?: string;
  };
}

type TabType = 'resumen' | 'rutinas' | 'pagos' | 'notas';

const TrainerClientProgressPage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleteProfileModalOpen, setIsCompleteProfileModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('resumen');
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [isEditPaymentModalOpen, setIsEditPaymentModalOpen] = useState(false);
  const [editPaymentAmount, setEditPaymentAmount] = useState('');
  const [editPaymentDueDate, setEditPaymentDueDate] = useState('');

  useEffect(() => {
    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);

  // Detectar cuando se regresa de la edición y recargar datos
  useEffect(() => {
    console.log('🔍 useEffect triggered - location.search:', location.search);
    const urlParams = new URLSearchParams(location.search);
    const updatedParam = urlParams.get('updated');
    console.log('🔍 Updated param value:', updatedParam);
    
    if (updatedParam === 'true') {
      console.log('🔄 Cliente actualizado detectado, recargando datos...');
      // Mostrar toast inmediatamente
      toast.success('Datos del cliente actualizados correctamente');
      // Recargar datos
      fetchClientData();
      // Limpiar el parámetro de la URL sin recargar la página
      const newUrl = window.location.pathname;
      console.log('🔄 Limpiando URL de:', window.location.href, 'a:', newUrl);
      window.history.replaceState({}, '', newUrl);
    }
  }, [location.search]);

  // Función para refrescar datos manualmente
  const refreshClientData = () => {
    console.log('🔄 Refrescando datos del cliente...');
    fetchClientData();
    toast.success('Datos actualizados');
  };

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const [clientResponse, routinesResponse] = await Promise.all([
        trainerApi.getClientDetails(clientId!),
        trainerApi.getClientRoutines(clientId!)
      ]);

      setClient(clientResponse);
      
      // Filtrar rutinas duplicadas por ID
      const rawRoutines = routinesResponse.data || [];
      const uniqueRoutines = rawRoutines.filter((routine: Routine, index: number, self: Routine[]) => 
        index === self.findIndex((r: Routine) => r.id === routine.id)
      );
      
      setRoutines(uniqueRoutines);
      
      // Debug logs detallados
      console.log('🔍 === DATOS DEL CLIENTE RECIBIDOS ===');
      console.log('🔍 Client data completo:', JSON.stringify(clientResponse, null, 2));
      console.log('🔍 Client Profile:', clientResponse?.clientProfile);
      console.log('🔍 Age (profile):', clientResponse?.clientProfile?.age);
      console.log('🔍 Age (direct):', clientResponse?.age);
      console.log('🔍 Gender (profile):', clientResponse?.clientProfile?.gender);
      console.log('🔍 Gender (direct):', clientResponse?.gender);
      console.log('🔍 Fitness Level (profile):', clientResponse?.clientProfile?.fitnessLevel);
      console.log('🔍 Fitness Level (direct):', clientResponse?.fitnessLevel);
      console.log('🔍 === FIN DATOS DEL CLIENTE ===');
      console.log('🔍 Raw routines data:', rawRoutines);
      console.log('🔍 Unique routines after filter:', uniqueRoutines);
      console.log('🔍 Duplicates removed:', rawRoutines.length - uniqueRoutines.length);
      
      // Simular payment status por ahora
      setPaymentStatus({
        status: 'paid',
        amount: 15000,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastPayment: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching client data:', error);
      setError('Error al cargar los datos del cliente');
      toast.error('Error al cargar los datos del cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = () => {
    setIsCompleteProfileModalOpen(true);
  };

  const handleCloseCompleteProfileModal = () => {
    setIsCompleteProfileModalOpen(false);
  };

  const handleSaveProfile = async (profileData: any) => {
    try {
      await trainerApi.updateProfile(profileData);
      toast.success('Perfil actualizado correctamente');
      setIsCompleteProfileModalOpen(false);
      fetchClientData();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    }
  };

  const handleSendReminder = async () => {
    try {
      // Simular envío de recordatorio
      toast.success('Recordatorio enviado correctamente');
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('Error al enviar recordatorio');
    }
  };

  const handleSendPaymentReminder = async () => {
    try {
      if (!client?.id) {
        toast.error('No se pudo identificar al cliente');
        return;
      }

      console.log('Enviando recordatorio de pago al cliente:', client?.name);
      
      // Importar el servicio de notificaciones dinámicamente
      const { default: notificationService } = await import('../../services/notificationService');
      
      const result = await notificationService.sendManualPaymentReminder(client.id);
      
      if (result.success) {
        toast.success(result.message || 'Recordatorio de pago enviado exitosamente');
      } else {
        toast.error(result.message || 'Error al enviar recordatorio de pago');
      }
    } catch (error: any) {
      console.error('Error enviando recordatorio:', error);
      toast.error('Error al enviar recordatorio de pago');
    }
  };

  const handleEditPayment = () => {
    // Inicializar los valores del modal con los datos actuales
    if (paymentStatus) {
      setEditPaymentAmount(paymentStatus.amount.toString());
      setEditPaymentDueDate(new Date(paymentStatus.dueDate).toISOString().split('T')[0]);
    }
    setIsEditPaymentModalOpen(true);
  };

  const handleSavePaymentChanges = async () => {
    try {
      // Validar los datos
      const amount = parseFloat(editPaymentAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('El monto debe ser un número válido mayor a 0');
        return;
      }

      if (!editPaymentDueDate) {
        toast.error('Debe seleccionar una fecha de vencimiento');
        return;
      }

      // Simular actualización de pago
      setPaymentStatus(prev => prev ? {
        ...prev,
        amount: amount,
        dueDate: new Date(editPaymentDueDate).toISOString()
      } : null);

      toast.success('Información de pago actualizada correctamente');
      setIsEditPaymentModalOpen(false);
    } catch (error: any) {
      console.error('Error updating payment:', error);
      toast.error('Error al actualizar la información de pago');
    }
  };

  const handleEditClient = () => {
    // Implementar navegación a edición de cliente
    navigate(`/trainer/clients/${clientId}/edit`);
  };

  const getLastTrainingDate = () => {
    if (routines.length === 0) return 'Nunca';
    
    const lastRoutine = routines
      .filter(r => r.status === 'completed')
      .sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime())[0];
    
    if (!lastRoutine) return 'Nunca';
    
    const daysDiff = Math.floor((Date.now() - new Date(lastRoutine.assignedDate).getTime()) / (1000 * 60 * 60 * 24));
    return `Hace ${daysDiff} día${daysDiff !== 1 ? 's' : ''}`;
  };

  const getCurrentWeek = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  };

  const getActiveRoutine = () => {
    return routines.find(r => r.status === 'active') || routines[0];
  };

  const getRoutineWeekDisplay = () => {
    const routine = getActiveRoutine();
    if (!routine) {
      const defaultTotal = 4;
      return `Semana 1/${defaultTotal}`;
    }

    const start = routine.assignedDate ? new Date(routine.assignedDate) : null;
    let currentWeek = 1;
    if (start && !isNaN(start.getTime())) {
      const days = Math.floor((Date.now() - start.getTime()) / 86400000);
      currentWeek = Math.max(1, Math.floor(days / 7) + 1);
    }

    let totalWeeks: number | null = null;
    // 1) Preferir totalWeeks explícito
    if (typeof routine.totalWeeks === 'number' && !isNaN(routine.totalWeeks) && routine.totalWeeks > 0) {
      totalWeeks = routine.totalWeeks;
    }
    // 2) Intentar parsear estimatedDuration (e.g., "8 semanas")
    else if (routine.estimatedDuration) {
      const match = routine.estimatedDuration.match(/\d+/);
      if (match) totalWeeks = parseInt(match[0], 10);
    }
    // 3) Calcular desde endDate si existe
    else if (routine.endDate && start) {
      const end = new Date(routine.endDate);
      if (!isNaN(end.getTime())) {
        const totalDays = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86400000));
        const weeks = Math.max(1, Math.ceil(totalDays / 7));
        totalWeeks = weeks;
      }
    }
    // 4) Fallback uniforme (mensual)
    if (!totalWeeks || isNaN(totalWeeks)) totalWeeks = 4;

    return `Semana ${Math.min(currentWeek, totalWeeks)}/${totalWeeks}`;
  };

  // Progreso general: usa rutina activa o la más reciente
  const getOverallProgress = () => {
    if (!routines || routines.length === 0) return 0;
    const active = routines.find(r => r.status === 'active');
    const target = active || [...routines].sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime())[0];
    const p = Number(target?.progress) || 0;
    return Math.max(0, Math.min(100, Math.round(p)));
  };

  const getProgressColor = (p: number) => {
    if (p >= 80) return '#10b981'; // verde
    if (p >= 40) return '#f59e0b'; // ámbar
    return '#dc2626'; // rojo
  };

  const checkProfileCompleteness = () => {
    if (!client) return { isComplete: false, missingFields: [] };
    
    const missingFields = [];
    if (!client.phone) missingFields.push('Teléfono');
    if (!client.weight) missingFields.push('Peso');
    if (!client.height) missingFields.push('Altura');
    if (!client.goals || client.goals.length === 0) missingFields.push('Objetivos');
    
    return {
      isComplete: missingFields.length === 0,
      missingFields
    };
  };

  // Función auxiliar para convertir imagen a base64 con mejor manejo de errores
  const getImageAsBase64 = async (imageUrl: string): Promise<string | null> => {
    try {
      // Validar URL
      if (!imageUrl || typeof imageUrl !== 'string') {
        console.warn('URL de imagen inválida:', imageUrl);
        return null;
      }

      // Crear un timeout para evitar que se cuelgue
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

      const response = await fetch(imageUrl, {
        signal: controller.signal,
        mode: 'cors',
        headers: {
          'Accept': 'image/*'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`Error al cargar imagen: ${response.status} ${response.statusText}`);
        return null;
      }

      const blob = await response.blob();
      
      // Verificar que sea una imagen válida
      if (!blob.type.startsWith('image/')) {
        console.warn('El archivo no es una imagen válida:', blob.type);
        return null;
      }
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => {
          console.error('Error al leer archivo:', error);
          resolve(null);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error: unknown) {
      const err = error as any;
      if (err?.name === 'AbortError') {
        console.warn('Timeout al cargar imagen:', imageUrl);
      } else {
        console.error('Error converting image to base64:', err);
      }
      return null;
    }
  };

  const generateRoutinePDF = async (routine: Routine) => {
    try {
      // Validaciones iniciales
      if (!routine) {
        toast.error('No se encontró la rutina seleccionada');
        return;
      }

      if (!routine.name) {
        toast.error('La rutina no tiene nombre válido');
        return;
      }

      const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape para formato tipo Excel
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 15;

      // Paleta de colores Trainfit - Negro, Rojo y Gris
      const trainfitRed = [220, 38, 38] as [number, number, number]; // #dc2626 - Rojo principal
      const trainfitOrange = [255, 107, 53] as [number, number, number]; // #ff6b35 - Naranja secundario
      const trainfitBlack = [10, 10, 10] as [number, number, number]; // #0a0a0a - Negro principal
      const trainfitDarkGray = [26, 26, 26] as [number, number, number]; // #1a1a1a - Gris oscuro
      const trainfitLightGray = [156, 163, 175] as [number, number, number]; // #9ca3af - Gris claro
      const trainfitWhite = [255, 255, 255] as [number, number, number]; // #ffffff - Blanco

      // Header con diseño Trainfit mejorado (más alto) - ahora negro
      pdf.setFillColor(...trainfitBlack);
      pdf.rect(0, 0, pageWidth, 35, 'F');
      
      // Branding en el header: logo + títulos
      try {
        const logoResp = await fetch('/images/logo-trainfit.png');
        const logoBlob = await logoResp.blob();
        const logoBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(logoBlob);
        });
        // Mantener proporción del logo para evitar compresión
        const imgEl = new Image();
        imgEl.src = logoBase64;
        await new Promise((resolve) => { imgEl.onload = resolve; });
        const naturalW = (imgEl.naturalWidth || 0);
        const naturalH = (imgEl.naturalHeight || 0);
        const targetH = 16; // altura fija coherente con el header
        const targetW = naturalW && naturalH ? (targetH * (naturalW / naturalH)) : 24;
        pdf.addImage(imgEl, 'PNG', 12, 9, targetW, targetH);
      } catch (error) {
        // Fallback al texto si el logo no carga
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
      
      // Título grande: Plan de Entrenamiento - Día X
      const dayTitle = routine.name || 'Rutina';
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(26);
      pdf.text(`Plan de Entrenamiento - ${dayTitle}`, pageWidth / 2, 22, { align: 'center' });
      
      // Subtítulo con cliente, fecha y progreso
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`Cliente: ${client?.name || 'N/A'} • Fecha: ${new Date().toLocaleDateString('es-ES')} • Progreso: ${routine.progress || 0}%`, pageWidth / 2, 30, { align: 'center' });
      
      // Separador decorativo
      pdf.setDrawColor(230, 230, 230);
      pdf.setLineWidth(0.5);
      pdf.line(15, 35, pageWidth - 15, 35);
      
      yPosition = 45;
      pdf.setTextColor(...trainfitBlack);

      // Información del cliente con diseño Trainfit mejorado
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
      pdf.text(`Cliente: ${client?.name || 'N/A'}`, 20, infoY);
      pdf.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2 - 30, infoY);
      pdf.text(`Estado: ${routine.status === 'active' ? 'Activa' : routine.status === 'completed' ? 'Completada' : 'Pausada'}`, pageWidth - 80, infoY);
      pdf.text(`Progreso: ${routine.progress || 0}%`, 20, infoY + 6);

      yPosition += 35;

      // Parsear ejercicios si están en formato JSON string
      let exercises = routine.exercises;
      if (typeof exercises === 'string') {
        try {
          exercises = JSON.parse(exercises);
        } catch (e) {
          console.error('Error parsing exercises:', e);
          exercises = [];
        }
      }

      // Mostrar mensaje de carga
      toast.loading('Generando PDF con imágenes...', { duration: 3000 });

      // Precargar todas las imágenes con manejo de errores mejorado
      const exercisesWithImages = await Promise.allSettled(
        exercises?.map(async (exercise: any) => {
          const imageUrl = exercise.imageUrl || exercise.image_url || exercise.image;
          let imageBase64 = null;
          
          if (imageUrl) {
            try {
              imageBase64 = await getImageAsBase64(imageUrl);
            } catch (error) {
              console.warn(`Error cargando imagen para ejercicio ${exercise.name}:`, error);
              imageBase64 = null;
            }
          }
          
          return {
            ...exercise,
            imageBase64
          };
        }) || []
      ).then(results => 
        results.map(result => 
          result.status === 'fulfilled' ? result.value : { 
            name: 'Ejercicio sin datos', 
            imageBase64: null 
          }
        )
      );

      // Helper para espaciar listas delimitadas por '-'
      const formatDelimited = (value: any) => {
        const s = String(value ?? '').trim();
        if (!s) return '-';
        return s.includes('-') ? s.split('-').map(v => v.trim()).join(' · ') : s;
      };

      // Tabla de ejercicios con diseño mejorado
      const tableHeaders = ['#', 'Imagen', 'Ejercicio', 'Series', 'Reps', 'Peso', 'Descanso'];
      const tableStartX = 15;
      const tableWidth = pageWidth - 30; // respetar márgenes para evitar recortes
      const colWidths = [12, 46, 80, 22, 34, 34, 39]; // suma = 267mm = tableWidth
      let xPosition = tableStartX;

      // Encabezados de tabla con diseño Trainfit
      // Rojo institucional TrainFit para encabezado de tabla
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

      // Filas de ejercicios con imágenes mejoradas
      for (let index = 0; index < exercisesWithImages.length; index++) {
        const exercise = exercisesWithImages[index];
        const hasNotes = !!(exercise as any).notes && String((exercise as any).notes).trim() !== '';
        const rowHeight = hasNotes ? 54 : 50; // un poco más alto si hay notas

        if (yPosition + rowHeight > pageHeight - 25) {
          pdf.addPage();
          yPosition = 20;
          
          // Repetir encabezados en nueva página
          // Rojo institucional TrainFit
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

        // Alternar color de fila con colores Trainfit
        if (index % 2 === 0) {
          pdf.setFillColor(245, 245, 245); // Gris muy claro Trainfit
          pdf.rect(tableStartX, yPosition, tableWidth, rowHeight, 'F');
        }

        // Bordes de celda finos con colores Trainfit
        pdf.setDrawColor(...trainfitLightGray);
        pdf.setLineWidth(0.25);
        xPosition = tableStartX;
        
        // Dibujar bordes de todas las celdas
        colWidths.forEach((width) => {
          pdf.rect(xPosition, yPosition, width, rowHeight);
          xPosition += width;
        });

        // Contenido de las celdas
        xPosition = tableStartX;
        
        // Número de ejercicio con círculo rojo Trainfit
        pdf.setFillColor(...trainfitRed);
        const circleX = xPosition + colWidths[0]/2;
        const circleY = yPosition + rowHeight/2;
        pdf.circle(circleX, circleY, 5, 'F');
        pdf.setTextColor(...trainfitWhite);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text((index + 1).toString(), circleX, circleY + 2, { align: 'center' });
        xPosition += colWidths[0];

        // Imagen del ejercicio con mejor proporción y padding simétrico
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

            pdf.addImage(imgEl, 'JPEG', imgX, imgY, targetW, targetH, undefined, 'MEDIUM');
          } catch (error) {
            console.error('Error adding image to PDF:', error);
            // Si falla la imagen, mostrar texto alternativo
            pdf.setFontSize(8);
            pdf.setTextColor(180, 180, 180);
            pdf.text('SIN IMAGEN', xPosition + colWidths[1]/2, yPosition + rowHeight/2, { align: 'center' });
          }
        } else {
          pdf.setFontSize(8);
          pdf.setTextColor(180, 180, 180);
          pdf.text('SIN IMAGEN', xPosition + colWidths[1]/2, yPosition + rowHeight/2, { align: 'center' });
        }
        xPosition += colWidths[1];

        // Nombre del ejercicio con mejor formato
        const rawName = exercise.name || 'N/A';
        const exerciseName = rawName.toLowerCase().includes('unilateral') ? `${rawName} (por lado)` : rawName;
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');

        const nameY = yPosition + (hasNotes ? rowHeight/2 - 4 : rowHeight/2);
        const nameLines = pdf.splitTextToSize(exerciseName, colWidths[2] - 6);
        const nameToRender = Array.isArray(nameLines) ? nameLines.slice(0, 2) : [nameLines];
        nameToRender.forEach((line: string, i: number) => {
          pdf.text(line, xPosition + 3, nameY + i * 4);
        });

        if (hasNotes) {
          const rawNotes = String((exercise as any).notes);
          const notesLines = pdf.splitTextToSize(rawNotes, colWidths[2] - 6);
          const limited = Array.isArray(notesLines) ? notesLines.slice(0, 2) : [notesLines];
          pdf.setFont('helvetica', 'italic');
          pdf.setTextColor(110, 110, 110);
          const notesY = nameY + (Array.isArray(nameToRender) ? nameToRender.length * 4 : 4) + 2;
          limited.forEach((line: string, i: number) => {
            pdf.text(line, xPosition + 3, notesY + i * 4);
          });
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(...trainfitBlack);
        }
        xPosition += colWidths[2];

        // Datos numéricos con mejor formato
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(...trainfitDarkGray);

        // Series
        pdf.text((exercise.sets?.toString() || exercise.series?.toString() || '-'), xPosition + colWidths[3]/2, yPosition + rowHeight/2, { align: 'center' });
        xPosition += colWidths[3];

        // Repeticiones (envolver para evitar desbordes)
        {
          const repsText = formatDelimited(exercise.reps?.toString() || '-');
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

        // Peso
        // Normalización: usar weightsPerSeries si existe, si no weight básico
        // Peso (envolver si es largo)
        {
          const rawWeights = (exercise as any).weightsPerSeries;
          const joinedWeights = Array.isArray(rawWeights) && rawWeights.length > 0
            ? rawWeights.map((w: any) => String(w).replace(/kg/gi, '').trim()).join('-')
            : (exercise as any).weight;
          const weightText = (joinedWeights !== undefined && joinedWeights !== null && String(joinedWeights).trim() !== '')
            ? formatDelimited(String(joinedWeights).replace(/kg/gi, '').trim()) + ' kg'
            : '-';
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
        {
          const restValue = (exercise as any).restTime ?? (exercise as any).rest_time;
          const restText = (restValue !== undefined && restValue !== null && String(restValue).trim() !== '')
            ? `${restValue}s`
            : '-';
          pdf.text(restText, xPosition + colWidths[6]/2, yPosition + rowHeight/2, { align: 'center' });
        }

        yPosition += rowHeight;
      }

      // (Eliminado) Sección final de "Notas del entrenador"
      // Las notas ya se renderizan bajo el nombre del ejercicio dentro de la fila.

      // Footer con fondo negro y logo TRAINFIT
      // Footer con branding y número de página
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

      // Guardar PDF con nombre seguro
      const fileName = `rutina-${routine.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${client?.name?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'cliente'}.pdf`;
      pdf.save(fileName);
      toast.success('PDF con diseño Trainfit generado correctamente');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error generando PDF:', message);
      
      // Mensajes de error más específicos
      if (message.includes('fetch')) {
        toast.error('Error al cargar las imágenes. PDF generado sin imágenes.');
      } else if (message.includes('jsPDF')) {
        toast.error('Error en la generación del PDF. Verifica los datos de la rutina.');
      } else {
        toast.error(`Error al generar el PDF: ${message || 'Error desconocido'}`);
      }
    }
  };

  const handleEditRoutine = (routineId: string) => {
    // Navegar a la página de edición de rutina
    navigate(`/trainer/routines/${routineId}/edit`);
    setIsRoutineModalOpen(false);
    setSelectedRoutine(null);
  };

  if (loading) {
    return (
      <div className="trainer-client-progress-page">
        <div className="loading-container">
          <p>Cargando información del cliente...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="trainer-client-progress-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'Cliente no encontrado'}</p>
          <button onClick={() => navigate('/trainer/clients')} className="btn-back-to-dashboard">
            Volver a Clientes
          </button>
        </div>
      </div>
    );
  }

  const profileStatus = checkProfileCompleteness();
  const activeRoutine = getActiveRoutine();

  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      minHeight: '100vh',
      padding: '24px',
      color: 'white',
      border: 'none',
      outline: 'none',
      boxShadow: 'none'
    }}>
      {/* Header con navegación */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        border: 'none',
        outline: 'none',
        boxShadow: 'none'
      }}>
        <button 
          onClick={() => navigate('/trainer/clients')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            fontWeight: '600',
            cursor: 'pointer',
            outline: 'none',
            boxShadow: 'none'
          }}
        >
          <span style={{ fontSize: '20px' }}>←</span>
          Volver a Clientes
        </button>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: 'none',
          outline: 'none',
          boxShadow: 'none'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#10b981',
            borderRadius: '50%',
            border: 'none',
            outline: 'none',
            boxShadow: 'none'
          }}></span>
          Activo
          <button
            onClick={() => navigate(`/trainer/messages?to=${clientId}`)}
            style={{
              marginLeft: '12px',
              padding: '8px 14px',
              background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
              color: 'white',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: `
                0 4px 12px rgba(220, 38, 38, 0.3),
                0 2px 6px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.2)
              `
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = `
                0 6px 16px rgba(220, 38, 38, 0.4),
                0 2px 8px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.2)
              `;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `
                0 4px 12px rgba(220, 38, 38, 0.3),
                0 2px 6px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.2)
              `;
            }}
            title="Enviar mensaje a este cliente"
          >
            Enviar Mensaje
          </button>
        </div>
      </div>

      {/* Navegación por tabs */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        borderBottom: 'none',
        paddingBottom: '16px',
        outline: 'none',
        boxShadow: 'none'
      }}>
        <button 
          style={{
            backgroundColor: activeTab === 'resumen' ? '#dc2626' : 'transparent',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            outline: 'none',
            boxShadow: 'none'
          }}
          onClick={() => setActiveTab('resumen')}
        >
          Resumen
        </button>
        <button 
          style={{
            backgroundColor: activeTab === 'rutinas' ? '#dc2626' : 'transparent',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            outline: 'none',
            boxShadow: 'none'
          }}
          onClick={() => setActiveTab('rutinas')}
        >
          Rutinas
        </button>
        <button 
          style={{
            backgroundColor: activeTab === 'pagos' ? '#dc2626' : 'transparent',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            outline: 'none',
            boxShadow: 'none'
          }}
          onClick={() => setActiveTab('pagos')}
        >
          Pagos
        </button>
        <button 
          style={{
            backgroundColor: activeTab === 'notas' ? '#dc2626' : 'transparent',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            outline: 'none',
            boxShadow: 'none'
          }}
          onClick={() => setActiveTab('notas')}
        >
          Notas
        </button>
      </div>

      {/* Contenedor de contenido principal para alinear título y secciones */}
      <div className="trainer-client-progress-container">
      {/* Título principal con acciones a la derecha (rojo TrainFit) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        border: 'none',
        outline: 'none',
        boxShadow: 'none'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: 'white',
          margin: 0,
          lineHeight: 1.2,
          letterSpacing: '0.2px',
          border: 'none',
          outline: 'none',
          boxShadow: 'none'
        }}>{client.name}</h1>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button 
            onClick={refreshClientData}
            title="Actualizar datos del cliente"
            aria-label="Actualizar datos del cliente"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.06)',
              color: 'white',
              border: '1px solid #3a3a3a',
              padding: '10px 16px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, background 0.15s ease, border-color 0.15s ease',
              outline: 'none',
              boxShadow: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.borderColor = '#4a4a4a';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.borderColor = '#3a3a3a';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: '16px' }}>🔄</span>
            Refrescar
          </button>

          <button 
            onClick={handleEditClient}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #ec1b21 0%, #9b1212 100%)',
              color: 'white',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease',
              outline: 'none',
              boxShadow: '0 8px 18px rgba(239,68,68,0.25)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)';
              e.currentTarget.style.boxShadow = '0 10px 20px rgba(239,68,68,0.35)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #ec1b21 0%, #9b1212 100%)';
              e.currentTarget.style.boxShadow = '0 8px 18px rgba(239,68,68,0.25)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: '16px' }}>✏️</span>
            Editar Cliente
          </button>
        </div>
      </div>

      {/* Contenido según tab activo */}
      {activeTab === 'resumen' && (
        <div style={{ border: 'none', outline: 'none', boxShadow: 'none', backgroundColor: 'transparent' }}>
          {/* Resumen del cliente (rediseñado) */}
          <div className="client-summary-card">
            <h2 className="summary-title">Perfil del Cliente</h2>

            {/* Datos en grid 2 columnas */}
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span aria-hidden>🎂</span>
                  Edad
                </span>
                <span className="summary-value">{client.clientProfile?.age || client.age || 'No especificada'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span aria-hidden>👤</span>
                  Género
                </span>
                <span className="summary-value">
                  {client.clientProfile?.gender === 'MALE' ? 'Masculino' : 
                   client.clientProfile?.gender === 'FEMALE' ? 'Femenino' : 
                   client.clientProfile?.gender === 'OTHER' ? 'Otro' : 
                   client.gender === 'MALE' ? 'Masculino' : 
                   client.gender === 'FEMALE' ? 'Femenino' : 
                   client.gender === 'OTHER' ? 'Otro' : 'No especificado'}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span aria-hidden>🎯</span>
                  Objetivo
                </span>
                <span className="summary-value">{client.clientProfile?.goals?.[0] || client.goals?.[0] || 'No especificado'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span aria-hidden>📈</span>
                  Nivel
                </span>
                <span className="summary-value">
                  {client.clientProfile?.fitnessLevel === 'BEGINNER' ? 'Principiante' : 
                   client.clientProfile?.fitnessLevel === 'INTERMEDIATE' ? 'Intermedio' : 
                   client.clientProfile?.fitnessLevel === 'ADVANCED' ? 'Avanzado' : 
                   client.fitnessLevel === 'BEGINNER' ? 'Principiante' : 
                   client.fitnessLevel === 'INTERMEDIATE' ? 'Intermedio' : 
                   client.fitnessLevel === 'ADVANCED' ? 'Avanzado' : 'No especificado'}
                </span>
              </div>
            </div>

            {/* Progreso general */}
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span className="summary-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>📊 Progreso general</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{getOverallProgress()}%</span>
              </div>
              <div style={{ width: '100%', height: 6, background: '#3a3a3a', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: `${getOverallProgress()}%`, height: '100%', background: getProgressColor(getOverallProgress()) }} />
              </div>
            </div>

            {/* Acciones inferiores */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: 14 }}>
              <button
                onClick={() => setActiveTab('rutinas')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'linear-gradient(90deg, #dc2626, #ef4444)',
                  color: 'white', border: 'none', padding: '10px 16px',
                  borderRadius: '10px', fontSize: '14px', fontWeight: 700,
                  cursor: 'pointer', transition: 'filter 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
              >
                🧭 Ver rutina asignada
              </button>

              <button
                onClick={handleEditClient}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.06)',
                  color: 'white', border: '1px solid #3a3a3a', padding: '10px 16px',
                  borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                  cursor: 'pointer', transition: 'transform 0.15s ease, background 0.15s ease, border-color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.borderColor = '#4a4a4a';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = '#3a3a3a';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                ✏️ Editar cliente
              </button>
            </div>
          </div>

          {/* Se eliminó “Rutina actual” para simplificar la vista */}
        </div>
      )}



      {/* Tab de Rutinas */}
      {activeTab === 'rutinas' && (
        <div style={{
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          backgroundColor: 'transparent'
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            WebkitBoxShadow: 'none',
            MozBoxShadow: 'none'
          }}>
            <h2 style={{ color: 'white', marginBottom: '20px' }}>Rutinas Asignadas</h2>
            
            {routines && routines.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {routines.map((routine, index) => (
                  <div
                    key={routine.id || index}
                    data-status={routine.status}
                    style={{
                      backgroundColor: '#2a2a2a',
                      borderRadius: '10px',
                      padding: '16px',
                      border: '1px solid #333',
                      borderLeft: routine.status === 'vencida' ? '2px solid #f59e0b' : '2px solid transparent',
                      transition: 'background 0.2s ease, border-color 0.2s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#333';
                      // Mantener el borde ámbar en vencidas
                      const status = e.currentTarget.getAttribute('data-status');
                      if (status !== 'vencida') {
                        e.currentTarget.style.borderColor = '#3a3a3a';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#2a2a2a';
                      const status = e.currentTarget.getAttribute('data-status');
                      if (status !== 'vencida') {
                        e.currentTarget.style.borderColor = '#333';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 style={{ color: 'white', margin: 0, flex: 1, fontSize: '18px', fontWeight: 700, letterSpacing: '0.2px' }}>{routine.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {(() => {
                          const bg = routine.status === 'completed' ? '#3b82f6' : routine.status === 'paused' ? '#dc2626' : routine.status === 'vencida' ? '#f59e0b' : '#10b981';
                          const label = routine.status === 'completed' ? 'Completada' : routine.status === 'paused' ? 'Pausada' : routine.status === 'vencida' ? 'Vencida ⚠️' : 'Activa';
                          const tooltip = routine.status === 'completed'
                            ? 'Progreso ≥ 95% o todos los ejercicios completados.'
                            : routine.status === 'paused'
                              ? 'Sin actividad en los últimos 10 días.'
                              : routine.status === 'vencida'
                                ? 'Fecha de fin pasada y progreso < 90%.'
                                : 'Rutina en curso.';
                          return (
                            <span
                              title={tooltip}
                              style={{ 
                                backgroundColor: bg,
                                color: 'white',
                                padding: '6px 10px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 700
                              }}
                            >
                              {label}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                    
                    {routine.description && (
                      <p style={{ color: '#c9c9c9', margin: '0 0 10px 0', fontSize: '14px', lineHeight: 1.45 }}>{routine.description}</p>
                    )}
                    <div style={{ color: '#9aa0a6', fontSize: '12px', marginBottom: '8px' }}>
                      Asignada: {routine.assignedDate ? new Date(routine.assignedDate).toLocaleDateString() : 'N/A'}
                    </div>
                    {routine.endDate && (
                      <div style={{ color: '#9aa0a6', fontSize: '12px', marginBottom: '8px' }}>
                        Finaliza: {new Date(routine.endDate).toLocaleDateString()}
                      </div>
                    )}
                    <div style={{ margin: '6px 0 12px 0' }}>
                      <div style={{ color: '#dc2626', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                        Progreso: {routine.progress || 0}%
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#3a3a3a', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(Math.max(Number(routine.progress) || 0, 0), 100)}%`, height: '100%', background: '#dc2626' }} />
                      </div>
                    </div>
                    
                    {routine.exercises && routine.exercises.length > 0 && (
                      <div style={{ marginTop: '12px' }}>
                        <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '8px' }}>
                          Ejercicios ({routine.exercises.length}):
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {routine.exercises.slice(0, 4).map((exercise, idx) => (
                            <span key={idx} style={{
                              backgroundColor: '#3a3a3a',
                              color: 'white',
                              padding: '3px 8px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              lineHeight: 1.2
                            }}>
                              {exercise.name}
                            </span>
                          ))}
                          {routine.exercises.length > 4 && (
                            <span style={{
                              backgroundColor: '#3a3a3a',
                              color: '#c9c9c9',
                              padding: '3px 8px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              lineHeight: 1.2
                            }}>
                              +{routine.exercises.length - 4} más
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Botones de acción para la rutina */}
                    <div style={{
                      marginTop: '16px',
                      display: 'flex',
                      gap: '12px',
                      justifyContent: 'flex-end',
                      borderTop: '1px solid #333',
                      paddingTop: '12px'
                    }}>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const confirmDelete = window.confirm(
                            `¿Estás seguro de que deseas eliminar la rutina "${routine.name}"?\n\nEsta acción es permanente y no se puede deshacer.`
                          );
                          if (!confirmDelete) return;
                          try {
                            await trainerApi.deleteRoutine(routine.id);
                            setRoutines(prev => prev.filter(r => r.id !== routine.id));
                            toast.success('Rutina eliminada exitosamente');
                          } catch (error) {
                            console.error('Error al eliminar la rutina:', error);
                            toast.error('Error al eliminar la rutina');
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          backgroundColor: 'rgba(220,38,38,0.08)',
                          color: '#ef4444',
                          border: '1px solid #dc2626',
                          padding: '10px 16px',
                          borderRadius: '10px',
                          fontSize: '14px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'background 0.2s ease, border-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.15)';
                          e.currentTarget.style.borderColor = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.08)';
                          e.currentTarget.style.borderColor = '#dc2626';
                        }}
                      >
                        🗑️ Eliminar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const subject = encodeURIComponent(`Rutina asignada: ${routine.name}`);
                          const body = encodeURIComponent(
                            `Hola ${client?.name || ''},\n\nTe comparto la rutina "${routine.name}".\n\n¡Éxitos!\nEquipo TrainFit`
                          );
                          const email = client?.email || '';
                          window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          color: 'white',
                          border: '1px solid #3a3a3a',
                          padding: '10px 16px',
                          borderRadius: '10px',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'background 0.2s ease, border-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                          e.currentTarget.style.borderColor = '#4a4a4a';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                          e.currentTarget.style.borderColor = '#3a3a3a';
                        }}
                      >
                        📧 Enviar Email
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Parsear ejercicios si están en formato JSON string
                          let processedRoutine = { ...routine };
                          if (typeof routine.exercises === 'string') {
                            try {
                              processedRoutine.exercises = JSON.parse(routine.exercises);
                            } catch (e) {
                              console.error('Error parsing routine exercises:', e);
                              processedRoutine.exercises = [];
                            }
                          }
                          setSelectedRoutine(processedRoutine);
                          setIsRoutineModalOpen(true);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'linear-gradient(90deg, #dc2626, #ef4444)',
                          color: 'white',
                          border: 'none',
                          padding: '10px 18px',
                          borderRadius: '10px',
                          fontSize: '14px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'filter 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.filter = 'brightness(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.filter = 'brightness(1)';
                        }}
                      >
                        👁️ Ver Detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#6b7280'
              }}>
                <h3 style={{ color: '#9ca3af', marginBottom: '8px' }}>No hay rutinas asignadas</h3>
                <p style={{ color: '#6b7280' }}>Este cliente aún no tiene rutinas asignadas.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab de Pagos */}
      {activeTab === 'pagos' && (
        <div style={{
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          backgroundColor: 'transparent'
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            WebkitBoxShadow: 'none',
            MozBoxShadow: 'none'
          }}>
            <h2 style={{ color: 'white', marginBottom: '20px' }}>Estado de Pagos</h2>
            
            {paymentStatus ? (
              <div style={{
                backgroundColor: '#2a2a2a',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #333'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span aria-hidden>💰</span>
                    Estado:
                  </span>
                  <span style={{ 
                    color: paymentStatus.status === 'paid' ? '#10b981' : paymentStatus.status === 'pending' ? '#f59e0b' : '#dc2626',
                    fontWeight: 500
                  }}>
                    {paymentStatus.status === 'paid' ? 'Pagado' : paymentStatus.status === 'pending' ? 'Pendiente' : 'Vencido'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ color: '#e5e7eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span aria-hidden>💵</span>
                    Monto:
                  </span>
                  <span style={{ color: 'white', fontWeight: 400 }}>${paymentStatus.amount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#e5e7eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span aria-hidden>📅</span>
                    Fecha de vencimiento:
                  </span>
                  <span style={{ color: 'white', fontWeight: 400 }}>{new Date(paymentStatus.dueDate).toLocaleDateString()}</span>
                </div>

                {/* Divisor sutil */}
                <div style={{ height: '1px', backgroundColor: '#333', opacity: 0.8, margin: '16px 0' }} />

                {/* Botones de acción */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '4px' }}>
                  <button
                    onClick={handleSendPaymentReminder}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#374151',
                      color: 'white',
                      border: 'none',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#4b5563';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#374151';
                    }}
                  >
                    <span>📧</span>
                    Enviar recordatorio
                  </button>
                  
                  <button
                    onClick={handleEditPayment}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#b91c1c';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#dc2626';
                    }}
                  >
                    <span>✏️</span>
                    Editar pago
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                No hay información de pagos disponible.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab de Notas */}
      {activeTab === 'notas' && (
        <div style={{
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          backgroundColor: 'transparent'
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            WebkitBoxShadow: 'none',
            MozBoxShadow: 'none'
          }}>
            <h2 style={{ color: 'white', marginBottom: '20px' }}>Notas del Cliente</h2>
            
            <div style={{
              backgroundColor: '#2a2a2a',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid #333',
              minHeight: '200px'
            }}>
              <textarea
                placeholder="Agregar notas sobre el cliente..."
                style={{
                  width: '100%',
                  height: '150px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'white',
                  resize: 'vertical',
                  outline: 'none',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}
              />
              <div style={{ marginTop: '12px', textAlign: 'right' }}>
                <button style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Guardar Notas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cierre del contenedor de contenido principal */}
      </div>

      {/* Modal para completar perfil */}
      {isCompleteProfileModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%',
            border: '1px solid #333'
          }}>
            <h3 style={{ color: '#fff', marginBottom: '20px' }}>Completar Perfil del Cliente</h3>
            <p style={{ color: '#ccc', marginBottom: '20px' }}>
              Para asignar rutinas y hacer un seguimiento completo, necesitamos que el cliente complete su perfil con información básica como edad, peso, altura y objetivos.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsCompleteProfileModalOpen(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#333',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  // Aquí puedes agregar lógica para enviar notificación al cliente
                  setIsCompleteProfileModalOpen(false);
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ff6b35',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Notificar Cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para detalles de rutina */}
      {isRoutineModalOpen && selectedRoutine && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            border: '1px solid #333'
          }}>
            {/* Header del modal */}
            <div style={{
              padding: '20px 30px',
              borderBottom: '1px solid #333',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              backgroundColor: '#1a1a1a',
              zIndex: 1
            }}>
              <h2 style={{ color: '#fff', margin: 0 }}>{selectedRoutine.name}</h2>
              <button
                onClick={() => {
                  setIsRoutineModalOpen(false);
                  setSelectedRoutine(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ccc',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '5px'
                }}
              >
                ×
              </button>
            </div>

            {/* Contenido del modal */}
            <div style={{ padding: '30px' }}>
              {/* Información general */}
              <div style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                  <div style={{
                    backgroundColor: selectedRoutine.status === 'active' ? '#28a745' : 
                                   selectedRoutine.status === 'completed' ? '#6c757d' : '#ffc107',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {selectedRoutine.status === 'active' ? 'Activa' : 
                     selectedRoutine.status === 'completed' ? 'Completada' : 'Pausada'}
                  </div>
                  <div style={{
                    backgroundColor: '#dc2626',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    Progreso: {selectedRoutine.progress || 0}%
                  </div>
                </div>
                
                {selectedRoutine.description && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ color: '#fff', marginBottom: '10px' }}>Descripción</h4>
                    <p style={{ color: '#ccc', lineHeight: '1.5' }}>{selectedRoutine.description}</p>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                  <div style={{ backgroundColor: '#2a2a2a', padding: '15px', borderRadius: '8px' }}>
                    <h5 style={{ color: '#dc2626', margin: '0 0 5px 0', fontSize: '12px' }}>EJERCICIOS</h5>
                    <p style={{ color: '#fff', margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                      {selectedRoutine.exercises?.length || 0}
                    </p>
                  </div>
                  <div style={{ backgroundColor: '#2a2a2a', padding: '15px', borderRadius: '8px' }}>
                    <h5 style={{ color: '#dc2626', margin: '0 0 5px 0', fontSize: '12px' }}>DURACIÓN ESTIMADA</h5>
                    <p style={{ color: '#fff', margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                      {selectedRoutine.estimatedDuration || 'N/A'}
                    </p>
                  </div>
                  <div style={{ backgroundColor: '#2a2a2a', padding: '15px', borderRadius: '8px' }}>
                    <h5 style={{ color: '#dc2626', margin: '0 0 5px 0', fontSize: '12px' }}>DIFICULTAD</h5>
                    <p style={{ color: '#fff', margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                      {selectedRoutine.difficulty || 'Media'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lista de ejercicios */}
               {selectedRoutine.exercises && selectedRoutine.exercises.length > 0 && (
                 <div>
                   <h4 style={{ color: '#fff', marginBottom: '20px' }}>Ejercicios ({selectedRoutine.exercises.length})</h4>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                     {selectedRoutine.exercises.map((exercise: any, index: number) => (
                       <div key={index} style={{
                         backgroundColor: '#2a2a2a',
                         padding: '20px',
                         borderRadius: '12px',
                         border: '1px solid #333'
                       }}>
                         <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                           {/* Imagen del ejercicio */}
                           <div style={{ flexShrink: 0 }}>
                             {(() => {
                               // Parsear ejercicio si está en formato JSON string
                               let parsedExercise = exercise;
                               if (typeof exercise === 'string') {
                                 try {
                                   parsedExercise = JSON.parse(exercise);
                                 } catch (e) {
                                   console.error('Error parsing exercise for image:', e);
                                   parsedExercise = exercise;
                                 }
                               }
                               
                               // Buscar imagen en diferentes propiedades posibles, priorizando imageUrl del backend
                               const imageUrl = parsedExercise.imageUrl || 
                                              parsedExercise.image_url || 
                                              parsedExercise.image || 
                                              parsedExercise.img || 
                                              parsedExercise.photo ||
                                              parsedExercise.picture;
                               
                               console.log('Exercise image data:', {
                                 exerciseName: parsedExercise.name,
                                 imageUrl: imageUrl,
                                 allProps: Object.keys(parsedExercise)
                               });
                               
                               return imageUrl ? (
                                 <img 
                                   src={imageUrl} 
                                   alt={parsedExercise.name || 'Ejercicio'}
                                   style={{
                                     width: '160px',
                                     height: '160px',
                                     objectFit: 'contain',
                                     borderRadius: '8px',
                                     border: '2px solid #dc2626'
                                   }}
                                   onError={(e) => {
                                     console.error('Error loading image:', imageUrl);
                                     // Si falla la imagen, mostrar placeholder
                                     const target = e.target as HTMLImageElement;
                                     target.style.display = 'none';
                                     const placeholder = target.nextElementSibling as HTMLElement;
                                     if (placeholder) placeholder.style.display = 'flex';
                                   }}
                                   onLoad={() => {
                                     console.log('Image loaded successfully:', imageUrl);
                                   }}
                                 />
                               ) : null;
                             })()}
                             
                             {/* Placeholder siempre presente pero oculto si hay imagen */}
                             <div style={{
                               width: '160px',
                               height: '160px',
                               backgroundColor: '#444',
                               borderRadius: '8px',
                               display: (() => {
                                 let parsedExercise = exercise;
                                 if (typeof exercise === 'string') {
                                   try {
                                     parsedExercise = JSON.parse(exercise);
                                   } catch (e) {
                                     parsedExercise = exercise;
                                   }
                                 }
                                 const hasImage = parsedExercise.imageUrl || 
                                                parsedExercise.image_url || 
                                                parsedExercise.image || 
                                                parsedExercise.img || 
                                                parsedExercise.photo ||
                                                parsedExercise.picture;
                                 return hasImage ? 'none' : 'flex';
                               })(),
                               alignItems: 'center',
                               justifyContent: 'center',
                               border: '2px solid #555'
                             }}>
                               <span style={{ color: '#888', fontSize: '12px', textAlign: 'center' }}>
                                 Sin imagen
                               </span>
                             </div>
                           </div>

                           {/* Información del ejercicio */}
                           <div style={{ flex: 1 }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                               <h5 style={{ color: '#fff', margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                                 {index + 1}. {exercise.name || `Ejercicio ${index + 1}`}
                               </h5>
                               <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                 {exercise.muscleGroup && (
                                   <span style={{
                                     backgroundColor: '#ff6b35',
                                     color: '#fff',
                                     padding: '4px 8px',
                                     borderRadius: '12px',
                                     fontSize: '11px',
                                     fontWeight: 'bold'
                                   }}>
                                     {exercise.muscleGroup}
                                   </span>
                                 )}
                                 {exercise.difficulty && (
                                   <span style={{
                                     backgroundColor: exercise.difficulty === 'beginner' ? '#28a745' : 
                                                    exercise.difficulty === 'intermediate' ? '#ffc107' : '#dc3545',
                                     color: '#fff',
                                     padding: '4px 8px',
                                     borderRadius: '12px',
                                     fontSize: '11px',
                                     fontWeight: 'bold'
                                   }}>
                                     {exercise.difficulty === 'beginner' ? 'Principiante' : 
                                      exercise.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                                   </span>
                                 )}
                               </div>
                             </div>
                             
                             {exercise.description && (
                               <p style={{ color: '#ccc', margin: '0 0 15px 0', fontSize: '14px', lineHeight: '1.4' }}>
                                 {exercise.description}
                               </p>
                             )}

                             {exercise.equipment && (
                               <p style={{ color: '#ff6b35', margin: '0 0 10px 0', fontSize: '12px', fontWeight: 'bold' }}>
                                 🏋️ Equipamiento: {exercise.equipment}
                               </p>
                             )}

                             {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
                               <p style={{ color: '#ccc', margin: '0 0 15px 0', fontSize: '12px' }}>
                                 🎯 Músculos objetivo: {exercise.targetMuscles.join(', ')}
                               </p>
                             )}
                           </div>
                         </div>

                         {/* Series detalladas */}
                         {exercise.seriesDetails && exercise.seriesDetails.length > 0 ? (
                           <div style={{ marginBottom: '15px' }}>
                             <h6 style={{ color: '#dc2626', margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>
                               📋 SERIES DETALLADAS
                             </h6>
                             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                               {exercise.seriesDetails.map((serie: any, serieIndex: number) => (
                                 <div key={serieIndex} style={{
                                   backgroundColor: '#1a1a1a',
                                   padding: '12px',
                                   borderRadius: '6px',
                                   border: '1px solid #dc2626'
                                 }}>
                                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                     <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}>
                                       Serie {serie.setNumber}
                                     </span>
                                     {serie.completed && (
                                       <span style={{ color: '#28a745', fontSize: '12px' }}>✓</span>
                                     )}
                                   </div>
                                   <div style={{ fontSize: '11px', color: '#ccc' }}>
                                     <div>{serie.reps} repeticiones</div>
                                     {serie.weight && <div>{String(serie.weight).replace(/kg/gi, '').trim()} kg</div>}
                                     {serie.restTime && <div>Descanso: {serie.restTime}</div>}
                                   </div>
                                 </div>
                               ))}
                             </div>
                           </div>
                         ) : (
                           // Información básica de series - Parsear ejercicios si están en JSON
                           (() => {
                             // Parsear ejercicios si están en formato JSON string
                             let parsedExercise = exercise;
                             if (typeof exercise === 'string') {
                               try {
                                 parsedExercise = JSON.parse(exercise);
                               } catch (e) {
                                 console.error('Error parsing exercise:', e);
                                 parsedExercise = exercise;
                               }
                             }
                             
                             return (
                               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '15px' }}>
                                 {(parsedExercise.sets || parsedExercise.series) && (
                                   <div style={{ backgroundColor: '#1a1a1a', padding: '10px', borderRadius: '6px', border: '1px solid #dc2626' }}>
                                     <span style={{ color: '#dc2626', fontSize: '12px', fontWeight: 'bold' }}>SERIES</span>
                                     <p style={{ color: '#fff', margin: '2px 0 0 0', fontSize: '16px', fontWeight: 'bold' }}>{parsedExercise.sets || parsedExercise.series}</p>
                                   </div>
                                 )}
                                 {parsedExercise.reps && (
                                   <div style={{ backgroundColor: '#1a1a1a', padding: '10px', borderRadius: '6px', border: '1px solid #dc2626' }}>
                                     <span style={{ color: '#dc2626', fontSize: '12px', fontWeight: 'bold' }}>REPETICIONES</span>
                                     <p style={{ color: '#fff', margin: '2px 0 0 0', fontSize: '16px', fontWeight: 'bold' }}>{parsedExercise.reps}</p>
                                   </div>
                                 )}
                                 {(parsedExercise.weight || (Array.isArray(parsedExercise.weightsPerSeries) && parsedExercise.weightsPerSeries.length > 0)) && (
                                   <div style={{ backgroundColor: '#1a1a1a', padding: '10px', borderRadius: '6px', border: '1px solid #dc2626' }}>
                                     <span style={{ color: '#dc2626', fontSize: '12px', fontWeight: 'bold' }}>PESO</span>
                                     {(() => {
                                       const rawWeights = Array.isArray(parsedExercise.weightsPerSeries) && parsedExercise.weightsPerSeries.length > 0
                                         ? parsedExercise.weightsPerSeries.map((w: any) => String(w).replace(/kg/gi, '').trim()).join('-')
                                         : String(parsedExercise.weight ?? '').replace(/kg/gi, '').trim();
                                       const formatted = rawWeights.includes('-')
                                         ? rawWeights.split('-').map((v: string) => v.trim()).join(' · ')
                                         : rawWeights;
                                       return (
                                         <p style={{ color: '#fff', margin: '2px 0 0 0', fontSize: '16px', fontWeight: 'bold' }}>{formatted} kg</p>
                                       );
                                     })()}
                                   </div>
                                 )}
                                 {parsedExercise.duration && (
                                   <div style={{ backgroundColor: '#1a1a1a', padding: '10px', borderRadius: '6px', border: '1px solid #dc2626' }}>
                                     <span style={{ color: '#dc2626', fontSize: '12px', fontWeight: 'bold' }}>DURACIÓN</span>
                                     <p style={{ color: '#fff', margin: '2px 0 0 0', fontSize: '16px', fontWeight: 'bold' }}>{parsedExercise.duration}</p>
                                   </div>
                                 )}
                                 {(parsedExercise.restTime || parsedExercise.rest_time) && (
                                   <div style={{ backgroundColor: '#1a1a1a', padding: '10px', borderRadius: '6px', border: '1px solid #dc2626' }}>
                                     <span style={{ color: '#dc2626', fontSize: '12px', fontWeight: 'bold' }}>DESCANSO</span>
                                     <p style={{ color: '#fff', margin: '2px 0 0 0', fontSize: '16px', fontWeight: 'bold' }}>{parsedExercise.restTime || parsedExercise.rest_time}</p>
                                   </div>
                                 )}
                               </div>
                             );
                           })()
                         )}

                         {/* Instrucciones */}
                         {exercise.instructions && exercise.instructions.length > 0 && (
                           <div>
                             <h6 style={{ color: '#ff6b35', margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>
                               📝 INSTRUCCIONES
                             </h6>
                             <ol style={{ color: '#ccc', fontSize: '13px', lineHeight: '1.5', paddingLeft: '20px', margin: 0 }}>
                               {exercise.instructions.map((instruction: string, instIndex: number) => (
                                 <li key={instIndex} style={{ marginBottom: '5px' }}>
                                   {instruction}
                                 </li>
                               ))}
                             </ol>
                           </div>
                         )}

                         {/* Video link si existe */}
                         {exercise.videoUrl && (
                           <div style={{ marginTop: '15px' }}>
                             <a 
                               href={exercise.videoUrl} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               style={{
                                 color: '#ff6b35',
                                 textDecoration: 'none',
                                 fontSize: '13px',
                                 fontWeight: 'bold'
                               }}
                             >
                               🎥 Ver video demostrativo
                             </a>
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                 </div>
               )}

              {/* Botones de acción */}
              <div style={{ 
                marginTop: '30px', 
                paddingTop: '20px', 
                borderTop: '1px solid #333',
                display: 'flex', 
                gap: '15px', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                     onClick={() => {
                       if (selectedRoutine) {
                         generateRoutinePDF(selectedRoutine);
                       }
                     }}
                     style={{
                      padding: '12px 20px',
                      backgroundColor: '#dc2626', // Rojo Trainfit
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#b91c1c';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(220, 38, 38, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#dc2626';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(220, 38, 38, 0.3)';
                    }}
                  >
                    📄 Descargar PDF
                  </button>
                  <button
                    onClick={() => {
                      if (selectedRoutine && selectedRoutine.id) {
                        handleEditRoutine(selectedRoutine.id);
                      } else {
                        alert('ID de rutina no disponible');
                      }
                    }}
                    style={{
                      padding: '12px 20px',
                      backgroundColor: '#dc2626', // Rojo Trainfit
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#b91c1c';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(220, 38, 38, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#dc2626';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(220, 38, 38, 0.3)';
                    }}
                  >
                    ✏️ Editar Rutina
                  </button>
                </div>
                <button
                  onClick={() => {
                    setIsRoutineModalOpen(false);
                    setSelectedRoutine(null);
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar información de pago */}
      {isEditPaymentModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid #333'
          }}>
            <h3 style={{ color: '#fff', marginBottom: '20px', textAlign: 'center' }}>
              Editar Información de Pago
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                color: '#ccc', 
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Monto de la cuota ($)
              </label>
              <input
                type="number"
                value={editPaymentAmount}
                onChange={(e) => setEditPaymentAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #444',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '16px',
                  outline: 'none'
                }}
                placeholder="Ingrese el monto"
                min="0"
                step="0.01"
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ 
                display: 'block', 
                color: '#ccc', 
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Fecha de vencimiento
              </label>
              <input
                type="date"
                value={editPaymentDueDate}
                onChange={(e) => setEditPaymentDueDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #444',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsEditPaymentModalOpen(false)}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePaymentChanges}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                }}
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerClientProgressPage;