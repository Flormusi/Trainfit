import axios from './axiosConfig';

// Definición de tipos para las respuestas de la API
export interface Client {
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
    initialObjective?: string;
    trainingDaysPerWeek?: number;
    medicalConditions?: string[];
    medications?: string[];
    injuries?: string[];
  };
}

export interface Exercise {
  id: string;
  name: string;
  image_url?: string;
  // Añadir otros campos según sea necesario
}

export interface Routine {
  id: string;
  name: string;
  clientId: string;
  duration: string;
  notes?: string;
  exercises: Exercise[];
  startDate?: string;
  endDate?: string;
  // Añadir otros campos según sea necesario
}

export interface ClassData {
  title: string;
  description?: string;
  dateTime: string;
  duration: number;
  maxParticipants?: number;
  clientIds?: string[];
}

export interface NutritionPlanData {
  name: string;
  description?: string;
  clientId: string;
  meals: {
    breakfast?: string[];
    lunch?: string[];
    dinner?: string[];
    snacks?: string[];
  };
  calories?: number;
  notes?: string;
}

export interface RoutineSchedule {
  id: string;
  routineId: string;
  clientId: string;
  startDate: string;
  endDate: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AnalyticsData {
  routinesCreated: number;
  newClients: number;
  progressUpdates: number;
  // Añadir otros campos según sea necesario
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  userId: string;
  routineId?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

// Definición del objeto trainerApi con tipos
export const trainerApi = {
  // Dashboard y datos generales
  getDashboardData: async () => {
    try {
      const response = await axios.get('/trainer/dashboard');
      console.log('Dashboard API response:', response.data);
      
      // Asegurarse de que la respuesta tenga la estructura esperada
      if (response && response.data && response.data.data) {
        return {
          data: {
            clientCount: response.data.data.clientCount || 0,
            routineCount: response.data.data.routineCount || 0,
            exerciseCount: response.data.data.exerciseCount || 0
          }
        };
      } else {
        console.error('Error: La respuesta del servidor no tiene la estructura esperada');
        // Devolver valores por defecto
        return {
          data: {
            clientCount: 0,
            routineCount: 0,
            exerciseCount: 0
          }
        };
      }
    } catch (error) {
      console.error('Error al obtener datos del dashboard:', error);
      // Devolver valores por defecto en caso de error
      return {
        data: {
          clientCount: 0,
          routineCount: 0,
          exerciseCount: 0
        }
      };
    }
  },
  
  // Gestión de clientes
  getClients: async () => {
    try {
      const response = await axios.get('/trainer/clients');
      console.log('API getClients response:', response);
      
      // Verificar si la respuesta tiene la estructura esperada con datos anidados
      if (response && response.data && response.data.data && response.data.data.clients) {
        console.log('Estructura anidada detectada, devolviendo clients desde data.data.clients');
        // Devolver directamente el array de clientes para que el componente pueda usarlo
        const clients = response.data.data.clients;
        console.log('Clientes extraídos:', clients);
        return {
          data: clients
        };
      } 
      // Compatibilidad con estructura anterior
      else if (response && response.data) {
        console.log('Estructura simple detectada, devolviendo directamente response.data');
        return {
          data: response.data
        };
      } else {
        console.error('Error: La respuesta de getClients no tiene la estructura esperada');
        return {
          data: []
        };
      }
    } catch (error) {
      console.error('Error en getClients:', error);
      return {
        data: []
      };
    }
  },
  addClient: async (clientData: Partial<Client>) => {
    const response = await axios.post('/trainer/clients', clientData);
    return response.data;
  },
  
  getClientDetails: async (clientId: string) => {
    const response = await axios.get(`/trainer/clients/${clientId}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    // La respuesta tiene la estructura { data: { data: Client } }
    return response.data.data; // Devolver directamente el objeto Client
  },
  
  getClientProgress: async (clientId: string) => {
    const response = await axios.get(`/trainer/clients/${clientId}/progress`);
    return response.data;
  },
  
  saveClientNotes: async (clientId: string, notes: string) => {
    const response = await axios.post(`/trainer/clients/${clientId}/notes`, { notes });
    return response.data;
  },
  
  deleteClient: async (clientId: string) => {
    const response = await axios.delete(`/clients/${clientId}`);
    return response.data;
  },
  
  sendPaymentReminder: async (clientId: string) => {
    const response = await axios.post(`/trainer/clients/${clientId}/payment-reminder`);
    return response.data;
  },
  
  // Gestión de rutinas
  createRoutine: async (routineData: Partial<Routine>) => {
    const response = await axios.post('/trainer/routines', routineData);
    return response.data;
  },
  
  getRoutines: async () => {
    const response = await axios.get<{ data: Routine[] }>('/trainer/routines');
    return response.data;
  },
  
  getRoutineById: async (routineId: string) => {
    const response = await axios.get(`/trainer/routines/${routineId}`);
    return response.data;
  },
  
  updateRoutine: async (routineId: string, routineData: Partial<Routine>) => {
    const response = await axios.put(`/trainer/routines/${routineId}`, routineData);
    return response.data;
  },
  
  deleteRoutine: async (routineId: string) => {
    const response = await axios.delete(`/trainer/routines/${routineId}`);
    return response.data;
  },
  
  assignRoutine: async (assignmentData: { clientId: string; routineId: string; startDate: string; endDate: string }) => {
    const response = await axios.post('/trainer/routines/assign', assignmentData);
    return response.data;
  },

  unassignRoutineFromClient: async (clientId: string, routineId: string) => {
    const response = await axios.delete(`/trainer/clients/${clientId}/routines/${routineId}`);
    return response.data;
  },

  resendRoutineEmail: async (clientId: string, routineId: string) => {
    const response = await axios.post(`/trainer/clients/${clientId}/routines/${routineId}/resend-email`);
    return response.data;
  },
  
  getClientRoutines: async (clientId: string) => {
    const response = await axios.get(`/trainer/clients/${clientId}/routines`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    return response.data;
  },
  
  // Obtener asignaciones de rutinas por mes
  getRoutineAssignments: async (year: number, month: number) => {
    try {
      const response = await axios.get(`/trainer/routines/assignments?year=${year}&month=${month}`);
      console.log('Respuesta de getRoutineAssignments:', response);
      
      // Verificar la estructura de la respuesta
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          // Estructura antigua: array directo
          return { data: response.data };
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Nueva estructura: { success, message, data: [...] }
          return { data: response.data.data };
        } else {
          console.error('Estructura de respuesta inesperada en getRoutineAssignments:', response);
          return { data: [] };
        }
      } else {
        return { data: [] };
      }
    } catch (error) {
      console.error('Error en getRoutineAssignments:', error);
      return { data: [] };
    }
  },
  
  // Calendario de rutinas
  getRoutineSchedule: async (): Promise<{ success: boolean; data: RoutineSchedule[] }> => {
    const response = await axios.get('/trainer/routines/schedule');
    return response.data;
  },
  
  scheduleRoutine: async (scheduleData: { 
    routineId: string; 
    clientId: string; 
    startDate: string; 
    endDate: string;
    title?: string;
  }): Promise<{ success: boolean; data: RoutineSchedule }> => {
    const response = await axios.post('/trainer/routines/schedule', scheduleData);
    return response.data;
  },
  
  removeRoutineAssignment: async (assignmentId: string) => {
    try {
      const response = await axios.delete(`/trainer/routines/assignments/${assignmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar la asignación de rutina:', error);
      throw error;
    }
  },
  
  updateRoutineSchedule: async (scheduleId: string, scheduleData: {
    startDate?: string;
    endDate?: string;
    title?: string;
  }): Promise<{ success: boolean; data: RoutineSchedule }> => {
    const response = await axios.put(`/trainer/routines/schedule/${scheduleId}`, scheduleData);
    return response.data;
  },
  
  deleteRoutineSchedule: async (scheduleId: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete(`/trainer/routines/schedule/${scheduleId}`);
    return response.data;
  },
  
  // Gestión de ejercicios
  getExercises: async () => {
    const response = await axios.get<{ data: Exercise[] }>('/trainer/exercises');
    return response.data;
  },
  
  getExerciseById: async (exerciseId: string) => {
    const response = await axios.get(`/trainer/exercises/${exerciseId}`);
    return response.data;
  },
  
  createExercise: async (exerciseData: Partial<Exercise>) => {
    const response = await axios.post('/trainer/exercises', exerciseData);
    return response.data;
  },
  
  updateExercise: async (exerciseId: string, exerciseData: Partial<Exercise>) => {
    const response = await axios.put(`/trainer/exercises/${exerciseId}`, exerciseData);
    return response.data;
  },
  
  deleteExercise: async (exerciseId: string) => {
    const response = await axios.delete(`/trainer/exercises/${exerciseId}`);
    return response.data;
  },
  
  // Gestión de clases
  getClasses: async (startDate?: string, endDate?: string) => {
    const url = startDate && endDate 
      ? `/trainer/classes?start=${startDate}&end=${endDate}`
      : '/trainer/classes';
    const response = await axios.get(url);
    return response.data;
  },
  
  getClassById: async (classId: string) => {
    const response = await axios.get(`/trainer/classes/${classId}`);
    return response.data;
  },
  
  createClass: async (classData: ClassData) => {
    const response = await axios.post('/trainer/classes', classData);
    return response.data;
  },
  
  updateClass: async (classId: string, classData: ClassData) => {
    const response = await axios.put(`/trainer/classes/${classId}`, classData);
    return response.data;
  },
  
  deleteClass: async (classId: string) => {
    const response = await axios.delete(`/trainer/classes/${classId}`);
    return response.data;
  },
  
  rescheduleClass: async (classId: string, newDateTime: string) => {
    const response = await axios.put(`/trainer/classes/${classId}/reschedule`, { dateTime: newDateTime });
    return response.data;
  },
  
  getAvailableTimeSlots: async (date: string) => {
    const response = await axios.get(`/trainer/availability?date=${date}`);
    return response.data;
  },
  
  // Gestión de planes de nutrición
  getNutritionPlans: async () => {
    const response = await axios.get('/trainer/nutrition-plans');
    return response.data;
  },
  
  getNutritionPlanById: async (planId: string) => {
    const response = await axios.get(`/trainer/nutrition-plans/${planId}`);
    return response.data;
  },
  
  createNutritionPlan: async (planData: NutritionPlanData) => {
    const response = await axios.post('/trainer/nutrition-plans', planData);
    return response.data;
  },
  
  updateNutritionPlan: async (planId: string, planData: NutritionPlanData) => {
    const response = await axios.put(`/trainer/nutrition-plans/${planId}`, planData);
    return response.data;
  },
  
  deleteNutritionPlan: async (planId: string) => {
    const response = await axios.delete(`/trainer/nutrition-plans/${planId}`);
    return response.data;
  },
  
  assignNutritionPlan: async (clientId: string, planId: string) => {
    const response = await axios.post(`/trainer/clients/${clientId}/nutrition-plans`, { planId });
    return response.data;
  },
  
  // Perfil del entrenador
  getProfile: async () => {
    const response = await axios.get('/trainer/profile');
    return response.data;
  },
  
  updateProfile: async (profileData: any) => {
    const response = await axios.put('/trainer/profile', profileData);
    return response.data;
  },
  
  // Analíticas
  getAnalytics: async (period?: string) => {
    const url = `/trainer/analytics${period ? `?period=${period}` : ''}`;
    const response = await axios.get(url);
    return response.data;
  },
  
  getClientMetrics: async (clientId: string, metricType: string, period: string) => {
    const response = await axios.get(`/trainer/clients/${clientId}/metrics?type=${metricType}&period=${period}`);
    return response.data;
  },
  
  getClientProgressGraphData: async (clientId: string, metric: string, timeRange: string) => {
    const response = await axios.get(`/trainer/clients/${clientId}/progress-graph?metric=${metric}&timeRange=${timeRange}`);
    return response.data;
  },
  
  // Gestión de membresías
  getClientMembershipDetails: async (clientId: string) => {
    const response = await axios.get(`/trainer/clients/${clientId}/membership`);
    return response.data;
  },
  
  updateClientMembership: async (clientId: string, membershipData: any) => {
    const response = await axios.put(`/trainer/clients/${clientId}/membership`, membershipData);
    return response.data;
  },
  
  updateClientStatus: async (clientId: string, status: string) => {
    const response = await axios.put(`/trainer/clients/${clientId}/status`, { status });
    return response.data;
  },
  
  getClientAttendance: async (clientId: string) => {
    const response = await axios.get(`/trainer/clients/${clientId}/attendance`);
    return response.data;
  },
  
  // Notificaciones
  getClientNotifications: async (): Promise<{ success: boolean; data: Notification[] }> => {
    const response = await axios.get('/trainer/notifications');
    return response.data;
  },

  markNotificationAsRead: async (notificationId: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.put(`/trainer/notifications/${notificationId}/read`);
    return response.data;
  },

  getUnreadNotifications: async (): Promise<{ success: boolean; data: Notification[]; count: number }> => {
    const response = await axios.get('/trainer/notifications/unread');
    return response.data;
  },

  markAllNotificationsAsRead: async (): Promise<{ success: boolean; message: string }> => {
    const response = await axios.put('/trainer/notifications/mark-all-read');
    return response.data;
  },

  createTestNotification: async (notificationData: {
    type?: string;
    title?: string;
    message?: string;
  }): Promise<{ success: boolean; data: Notification; message: string }> => {
    const response = await axios.post('/trainer/notifications/test', notificationData);
    return response.data;
  },
  
  sendMotivationalMessage: async (clientId: string, message: string) => {
    const response = await axios.post(`/trainer/clients/${clientId}/motivational-message`, { message });
    return response.data;
  },

  updateClientInfo: async (clientId: string, clientData: any) => {
    const response = await axios.put(`/trainer/clients/${clientId}`, clientData);
    return response.data;
  },
};

// Definición del objeto clientApi para funciones del cliente
export const clientApi = {
  // Rutinas
  getRoutines: async (clientId: string) => {
    const response = await axios.get(`/clients/${clientId}/routines`);
    return response.data;
  },
  
  getAssignedRoutines: async () => {
    const response = await axios.get('/clients/profile/routines');
    // El backend devuelve { success: true, data: rutinas }
    return response.data;
  },
  
  getRoutineDetails: async (routineId: string) => {
    const response = await axios.get(`/routines/${routineId}`);
    // El backend devuelve { data: enrichedRoutine }
    return response.data.data || response.data;
  },
  
  deleteAssignedRoutine: async (routineId: string) => {
    const response = await axios.delete(`/clients/routines/${routineId}`);
    return response.data;
  },
  
  // Progreso
  getProgress: async (clientId: string) => {
    const response = await axios.get(`/clients/${clientId}/progress`);
    return response.data;
  },
  
  recordProgress: async (clientId: string, data: any) => {
    const response = await axios.post(`/clients/${clientId}/progress`, data);
    return response.data;
  },
  
  saveWorkoutLog: async (clientId: string, workoutData: any) => {
    const response = await axios.post(`/clients/${clientId}/workout-logs`, workoutData);
    return response.data;
  },
  
  getWorkoutHistory: async (clientId: string) => {
    const response = await axios.get(`/clients/${clientId}/workout-logs`);
    return response.data;
  },
  
  updateExerciseProgress: async (exerciseId: string, progressData: any) => {
    const response = await axios.post(`/progress/exercise/${exerciseId}`, progressData);
    return response.data;
  },
  
  // Perfil del cliente
  getProfile: async (clientId: string) => {
    const response = await axios.get(`/clients/${clientId}/profile`);
    return response.data;
  },

  // Obtener perfil completo del cliente con datos del formulario inicial
  getClientProfile: async (clientId: string) => {
    const response = await axios.get(`/clients/${clientId}/profile`);
    return response.data;
  },
  
  updateProfile: async (clientId: string, profileData: any) => {
    console.log('🚀 [clientApi.updateProfile] Iniciando solicitud PUT');
    console.log('📋 [clientApi.updateProfile] ClientId:', clientId);
    console.log('📋 [clientApi.updateProfile] ProfileData:', profileData);
    console.log('📋 [clientApi.updateProfile] URL completa:', `/clients/${clientId}/profile`);
    
    try {
      const response = await axios.put(`/clients/${clientId}/profile`, profileData);
      console.log('✅ [clientApi.updateProfile] Respuesta exitosa:', response.status, response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [clientApi.updateProfile] Error en solicitud:', error);
      throw error;
    }
  },
  
  // Calendario
  getSchedule: async (clientId: string) => {
    const response = await axios.get(`/clients/${clientId}/schedule`);
    return response.data;
  },
  
  // Nutrición
  getNutritionPlan: async (clientId: string) => {
    const response = await axios.get(`/clients/${clientId}/nutrition-plan`);
    return response.data;
  },
  
  // Clases
  getClasses: async (clientId: string) => {
    const response = await axios.get(`/clients/${clientId}/classes`);
    return response.data;
  },
  
  bookClass: async (clientId: string, classId: string) => {
    const response = await axios.post(`/clients/${clientId}/classes`, { classId });
    return response.data;
  },
  
  cancelClass: async (clientId: string, bookingId: string) => {
    const response = await axios.delete(`/clients/${clientId}/classes/${bookingId}`);
    return response.data;
  },
  
  // Pagos
  getPaymentHistory: async (clientId: string) => {
    const response = await axios.get(`/clients/${clientId}/payments`);
    return response.data;
  },
  
  makePayment: async (clientId: string, paymentData: any) => {
    const response = await axios.post(`/clients/${clientId}/payments`, paymentData);
    return response.data;
  },
  
  getPaymentStatus: async () => {
    const response = await axios.get('/clients/payment-status');
    return response.data;
  },
  
  // Ejercicios
  getExerciseVideos: async (exerciseId: string) => {
    const response = await axios.get(`/exercises/${exerciseId}/videos`);
    return response.data;
  },
  
  // Notificaciones
  getNotifications: async (clientId: string) => {
    const response = await axios.get(`/clients/${clientId}/notifications`);
    return response.data;
  },
  
  // Conteo de notificaciones no leídas del cliente
  getUnreadNotificationCount: async (clientId: string): Promise<{ count: number }> => {
    const response = await axios.get(`/clients/${clientId}/notifications/unread-count`);
    return response.data;
  },
  
  markNotificationAsRead: async (clientId: string, notificationId: string) => {
    const response = await axios.put(`/clients/${clientId}/notifications/${notificationId}`, { read: true });
    return response.data;
  },
  
  // Actualización de perfil del cliente
  updateClientProfile: async (profileData: { nickname?: string; profileImage?: string }) => {
    const response = await axios.put('/clients/profile', profileData);
    return response.data;
  },

  // Subida de imagen de perfil
  uploadProfileImage: async (formData: FormData) => {
    // Obtener el userId del token o contexto de autenticación
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    // Decodificar el token para obtener el userId (simple decode, no verificación)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.id;
    
    const response = await axios.post(`/clients/${userId}/profile/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Entrenamientos personalizados
  createTraining: async (trainingData: {
    type: string;
    date: string;
    hour: number;
    minute: number;
    duration: number;
    exercises: string[];
    location: string;
    notes?: string;
  }) => {
    const response = await axios.post('/clients/trainings', trainingData);
    return response.data;
  },

  getTrainings: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await axios.get(`/clients/trainings?${params.toString()}`);
    return response.data;
  },

  updateTraining: async (trainingId: string, trainingData: {
    type?: string;
    date?: string;
    hour?: number;
    minute?: number;
    duration?: number;
    exercises?: string[];
    location?: string;
    notes?: string;
  }) => {
    const response = await axios.put(`/clients/trainings/${trainingId}`, trainingData);
    return response.data;
  },

  deleteTraining: async (trainingId: string) => {
    const response = await axios.delete(`/clients/trainings/${trainingId}`);
    return response.data;
  },

  // Otros
  sendMonthlyRoutineEmail: async (routineId: string) => {
    const response = await axios.post('/clients/send-monthly-routine', { routineId });
    return response.data;
  },
};

// Auth API calls
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await axios.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await axios.post('/auth/register', userData);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  }
};

export default axios;