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
  status: 'active' | 'completed' | 'paused';
  progress: number;
  estimatedDuration?: string;
  difficulty?: string;
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
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Timeout al cargar imagen:', imageUrl);
      } else {
        console.error('Error converting image to base64:', error);
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

      // Header con diseño Trainfit mejorado (más alto)
      pdf.setFillColor(...trainfitRed);
      pdf.rect(0, 0, pageWidth, 35, 'F');
      
      // Logo TRAINFIT prominente en la esquina superior izquierda
      pdf.setTextColor(...trainfitWhite);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TRAINFIT', 15, 15);
      
      // Subtítulo junto al logo
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('FITNESS & TRAINING', 15, 25);
      
      // Título de la rutina centrado y más grande
      pdf.setFontSize(24);
      pdf.text(routine.name.toUpperCase(), pageWidth / 2, 22, { align: 'center' });
      
      yPosition = 45;
      pdf.setTextColor(...trainfitBlack);

      // Información del cliente con diseño Trainfit mejorado
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

      // Tabla de ejercicios con diseño mejorado
      const tableHeaders = ['#', 'Imagen', 'Ejercicio', 'Series', 'Reps', 'Peso', 'Descanso'];
      const colWidths = [18, 40, 85, 28, 28, 28, 35]; // Ajustados para mejor proporción
      const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
      const tableStartX = (pageWidth - tableWidth) / 2; // Centrar tabla
      let xPosition = tableStartX;

      // Encabezados de tabla con diseño Trainfit
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
        const rowHeight = 35; // Altura optimizada para imágenes

        if (yPosition + rowHeight > pageHeight - 25) {
          pdf.addPage();
          yPosition = 20;
          
          // Repetir encabezados en nueva página
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

        // Bordes de celda más sutiles con colores Trainfit
        pdf.setDrawColor(...trainfitLightGray);
        pdf.setLineWidth(0.3);
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
        pdf.circle(circleX, circleY, 6, 'F');
        pdf.setTextColor(...trainfitWhite);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text((index + 1).toString(), circleX, circleY + 2, { align: 'center' });
        xPosition += colWidths[0];

        // Imagen del ejercicio con mejor proporción
        pdf.setTextColor(...trainfitBlack);
        pdf.setFont('helvetica', 'normal');
        if (exercise.imageBase64) {
          try {
            // Calcular dimensiones manteniendo proporción
            const maxImgWidth = 30;
            const maxImgHeight = 25;
            const imgPadding = 3;
            
            const imgX = xPosition + imgPadding;
            const imgY = yPosition + (rowHeight - maxImgHeight) / 2;
            
            // Agregar imagen con proporción correcta
            pdf.addImage(exercise.imageBase64, 'JPEG', imgX, imgY, maxImgWidth, maxImgHeight, undefined, 'MEDIUM');
          } catch (error) {
            console.error('Error adding image to PDF:', error);
            // Si falla la imagen, mostrar texto alternativo
            pdf.setFontSize(8);
            pdf.setTextColor(180, 180, 180);
            pdf.text('SIN IMAGEN', xPosition + colWidths[1]/2, yPosition + rowHeight/2 + 1, { align: 'center' });
          }
        } else {
          pdf.setFontSize(8);
          pdf.setTextColor(180, 180, 180);
          pdf.text('SIN IMAGEN', xPosition + colWidths[1]/2, yPosition + rowHeight/2 + 1, { align: 'center' });
        }
        xPosition += colWidths[1];

        // Nombre del ejercicio con mejor formato
        const exerciseName = exercise.name || 'N/A';
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        
        if (exerciseName.length > 30) {
          const words = exerciseName.split(' ');
          const midPoint = Math.ceil(words.length / 2);
          const line1 = words.slice(0, midPoint).join(' ');
          const line2 = words.slice(midPoint).join(' ');
          pdf.text(line1, xPosition + 3, yPosition + rowHeight/2 - 2);
          pdf.text(line2, xPosition + 3, yPosition + rowHeight/2 + 4);
        } else {
          pdf.text(exerciseName, xPosition + 3, yPosition + rowHeight/2 + 1);
        }
        xPosition += colWidths[2];

        // Datos numéricos con mejor formato
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(...trainfitDarkGray);

        // Series
        pdf.text((exercise.sets?.toString() || exercise.series?.toString() || '-'), xPosition + colWidths[3]/2, yPosition + rowHeight/2 + 1, { align: 'center' });
        xPosition += colWidths[3];

        // Repeticiones
        pdf.text((exercise.reps?.toString() || '-'), xPosition + colWidths[4]/2, yPosition + rowHeight/2 + 1, { align: 'center' });
        xPosition += colWidths[4];

        // Peso
        pdf.text((exercise.weight ? `${exercise.weight}kg` : '-'), xPosition + colWidths[5]/2, yPosition + rowHeight/2 + 1, { align: 'center' });
        xPosition += colWidths[5];

        // Descanso
        pdf.text((exercise.restTime || exercise.rest_time || '-'), xPosition + colWidths[6]/2, yPosition + rowHeight/2 + 1, { align: 'center' });

        yPosition += rowHeight;
      }

      // Footer con fondo negro y logo TRAINFIT
      const footerY = pageHeight - 20;
      pdf.setFillColor(...trainfitBlack);
      pdf.rect(0, footerY, pageWidth, 20, 'F');
      
      // Cargar y agregar el logo real de Trainfit
      try {
        const logoResponse = await fetch('/images/logo-trainfit.png');
        const logoBlob = await logoResponse.blob();
        const logoBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(logoBlob);
        });
        
        // Agregar logo centrado en el footer
        const logoWidth = 40;
        const logoHeight = 12;
        const logoX = (pageWidth - logoWidth) / 2;
        const logoY = footerY + 4;
        
        pdf.addImage(logoBase64, 'PNG', logoX, logoY, logoWidth, logoHeight);
      } catch (error) {
        console.warn('Error cargando logo, usando texto alternativo:', error);
        // Fallback: texto TRAINFIT si no se puede cargar el logo
        pdf.setTextColor(...trainfitWhite);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.text('TRAINFIT', pageWidth / 2, footerY + 12, { align: 'center' });
      }
      
      pdf.setTextColor(...trainfitWhite);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Tu entrenamiento personalizado', pageWidth / 2, footerY + 16, { align: 'center' });

      // Guardar PDF con nombre seguro
      const fileName = `rutina-${routine.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${client?.name?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'cliente'}.pdf`;
      pdf.save(fileName);
      toast.success('PDF con diseño Trainfit generado correctamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      
      // Mensajes de error más específicos
      if (error.message?.includes('fetch')) {
        toast.error('Error al cargar las imágenes. PDF generado sin imágenes.');
      } else if (error.message?.includes('jsPDF')) {
        toast.error('Error en la generación del PDF. Verifica los datos de la rutina.');
      } else {
        toast.error(`Error al generar el PDF: ${error.message || 'Error desconocido'}`);
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

      {/* Título principal con botón de editar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        border: 'none',
        outline: 'none',
        boxShadow: 'none'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: 'white',
          margin: 0,
          border: 'none',
          outline: 'none',
          boxShadow: 'none'
        }}>{client.name}</h1>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={refreshClientData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#059669',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              outline: 'none',
              boxShadow: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#047857';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#059669';
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
              background: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              outline: 'none',
              boxShadow: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#b91c1c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#dc2626';
            }}
          >
            <span style={{ fontSize: '16px' }}>✏️</span>
            Editar Cliente
          </button>
        </div>
      </div>

      {/* Contenido según tab activo */}
      {activeTab === 'resumen' && (
        <div style={{
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          backgroundColor: 'transparent'
        }}>
          {/* Resumen del cliente */}
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
            <h2>Resumen del cliente</h2>
            
            <div className="summary-grid">
              <div className="summary-item">
                <span className="label">Edad</span>
                <span className="value">{client.clientProfile?.age || client.age || 'No especificada'}</span>
              </div>
              
              <div className="summary-item">
                <span className="label">Género</span>
                <span className="value">
                  {client.clientProfile?.gender === 'MALE' ? 'Masculino' : 
                   client.clientProfile?.gender === 'FEMALE' ? 'Femenino' : 
                   client.clientProfile?.gender === 'OTHER' ? 'Otro' : 
                   client.gender === 'MALE' ? 'Masculino' : 
                   client.gender === 'FEMALE' ? 'Femenino' : 
                   client.gender === 'OTHER' ? 'Otro' : 'No especificado'}
                </span>
              </div>
              
              <div className="summary-item">
                <span className="label">Último entrenamiento</span>
                <span className="value">{getLastTrainingDate()}</span>
              </div>
              
              <div className="summary-item">
                <span className="label">Objetivo</span>
                <span className="value">{client.clientProfile?.goals?.[0] || client.goals?.[0] || 'No especificado'}</span>
              </div>
              
              <div className="summary-item">
                <span className="label">Nivel</span>
                <span className="value">
                  {client.clientProfile?.fitnessLevel === 'BEGINNER' ? 'Principiante' : 
                   client.clientProfile?.fitnessLevel === 'INTERMEDIATE' ? 'Intermedio' : 
                   client.clientProfile?.fitnessLevel === 'ADVANCED' ? 'Avanzado' : 
                   client.fitnessLevel === 'BEGINNER' ? 'Principiante' : 
                   client.fitnessLevel === 'INTERMEDIATE' ? 'Intermedio' : 
                   client.fitnessLevel === 'ADVANCED' ? 'Avanzado' : 'No especificado'}
                </span>
              </div>
              
              <div className="summary-item">
                <span className="label">Semana actual</span>
                <span className="value">Semana 4/8</span>
              </div>
            </div>
          </div>

          {/* Layout de dos columnas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Rutina actual */}
            <div style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '12px',
              padding: '24px',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              WebkitBoxShadow: 'none',
              MozBoxShadow: 'none'
            }}>
              <h2>Rutina actual</h2>
              
              {activeRoutine ? (
                <>
                  <h3>{activeRoutine.name}</h3>
                  <p className="routine-week">Semana 4/8</p>
                  
                  <button 
                    className="btn-view-progress"
                    onClick={() => {
                      console.log('🔥 BOTÓN VER PROGRESO CLICKEADO!');
                      console.log('🚀 Cliente ID:', clientId);
                      console.log('🎯 Navegando a rutinas tab');
                      setActiveTab('rutinas');
                    }}
                  >
                    Ver progreso
                  </button>
                </>
              ) : (
                <div className="no-routine">
                  <h3>Programa de Definición</h3>
                  <p className="routine-week">Semana 4/8</p>
                  
                  <button 
                    className="btn-view-progress"
                    onClick={() => {
                      console.log('🔥 BOTÓN VER PROGRESO CLICKEADO!');
                      console.log('🚀 Cliente ID:', clientId);
                      console.log('🎯 Navegando a rutinas tab');
                      setActiveTab('rutinas');
                    }}
                  >
                    Ver progreso
                  </button>
                </div>
              )}
            </div>


          </div>
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
                  <div key={routine.id || index} style={{
                    backgroundColor: '#2a2a2a',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #333',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#333';
                    e.currentTarget.style.borderColor = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2a2a2a';
                    e.currentTarget.style.borderColor = '#333';
                  }}
                  onClick={() => {
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
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <h3 style={{ color: 'white', marginBottom: '0', flex: 1 }}>{routine.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          backgroundColor: routine.status === 'active' ? '#10b981' : routine.status === 'completed' ? '#3b82f6' : '#dc2626',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {routine.status === 'active' ? 'Activa' : routine.status === 'completed' ? 'Completada' : 'Pausada'}
                        </span>
                        <span style={{
                          color: '#dc2626',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}>
                          👁️ Ver
                        </span>
                      </div>
                    </div>
                    
                    <p style={{ color: '#ccc', marginBottom: '12px', fontSize: '14px' }}>{routine.description}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ color: '#dc2626', fontSize: '14px' }}>
                        Progreso: {routine.progress || 0}%
                      </span>
                      <span style={{ color: '#999', fontSize: '14px' }}>
                        Asignada: {routine.assignedDate ? new Date(routine.assignedDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    
                    {routine.exercises && routine.exercises.length > 0 && (
                      <div style={{ marginTop: '12px' }}>
                        <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '8px' }}>
                          Ejercicios ({routine.exercises.length}):
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {routine.exercises.slice(0, 4).map((exercise, idx) => (
                            <span key={idx} style={{
                              backgroundColor: '#374151',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}>
                              {exercise.name}
                            </span>
                          ))}
                          {routine.exercises.length > 4 && (
                            <span style={{
                              color: '#9ca3af',
                              fontSize: '12px',
                              padding: '4px 8px'
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
                        onClick={(e) => {
                          e.stopPropagation();
                          const confirmResend = window.confirm(
                            `¿Quieres reenviar el email de la rutina "${routine.name}" al cliente?\n\nSe enviará una nueva notificación por correo electrónico.`
                          );
                          
                          if (confirmResend) {
                            // Aquí iría la lógica para reenviar el email
                            alert(`✅ Email de la rutina "${routine.name}" reenviado exitosamente`);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          backgroundColor: '#ff6600',
                          color: 'white',
                          border: '3px solid #ff4400',
                          padding: '12px 20px',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#ff4400';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#ff6600';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                        }}
                      >
                        📧 ENVIAR EMAIL
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
                  <span style={{ color: 'white', fontWeight: '500' }}>Estado actual:</span>
                  <span style={{ 
                    color: paymentStatus.status === 'paid' ? '#10b981' : paymentStatus.status === 'pending' ? '#f59e0b' : '#ef4444',
                    fontWeight: '500'
                  }}>
                    {paymentStatus.status === 'paid' ? 'Pagado' : paymentStatus.status === 'pending' ? 'Pendiente' : 'Vencido'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ color: '#ccc' }}>Monto:</span>
                  <span style={{ color: 'white' }}>${paymentStatus.amount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ color: '#ccc' }}>Fecha de vencimiento:</span>
                  <span style={{ color: 'white' }}>{new Date(paymentStatus.dueDate).toLocaleDateString()}</span>
                </div>
                
                {/* Botones de acción */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleSendPaymentReminder}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#f59e0b',
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
                      e.currentTarget.style.backgroundColor = '#d97706';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f59e0b';
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
                                     width: '120px',
                                     height: '120px',
                                     objectFit: 'cover',
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
                               width: '120px',
                               height: '120px',
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
                                     {serie.weight && <div>{serie.weight} kg</div>}
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
                                 {parsedExercise.weight && (
                                   <div style={{ backgroundColor: '#1a1a1a', padding: '10px', borderRadius: '6px', border: '1px solid #dc2626' }}>
                                     <span style={{ color: '#dc2626', fontSize: '12px', fontWeight: 'bold' }}>PESO</span>
                                     <p style={{ color: '#fff', margin: '2px 0 0 0', fontSize: '16px', fontWeight: 'bold' }}>{parsedExercise.weight} kg</p>
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