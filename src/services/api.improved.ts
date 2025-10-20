/**
 * Servicio de API mejorado para TrainFit
 * Implementa las recomendaciones para un mejor manejo de respuestas,
 * errores y estructura de datos.
 */

import axios from './axiosConfig';

// Interfaces mejoradas para las respuestas de la API
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  clientProfile?: {
    goals?: string;
    weight?: number;
    initialObjective?: string;
    trainingDaysPerWeek?: number;
  };
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  type?: string;
  difficulty?: string;
  equipment?: string;
  muscles?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  clientId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  clientCount: number;
  routineCount: number;
  exerciseCount: number;
}

export interface AnalyticsData {
  routinesCreated: number;
  newClients: number;
  progressUpdates: number;
  period: string;
}

export interface Notification {
  id: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

/**
 * Clase para manejar errores de la API
 */
export class ApiError extends Error {
  status: number;
  errors?: any;

  constructor(message: string, status: number, errors?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Función para procesar las respuestas de la API
 */
const processResponse = <T>(response: any): T => {
  // Si la respuesta ya tiene la estructura esperada (success, message, data)
  if (response.success !== undefined && response.data !== undefined) {
    return response.data;
  }
  
  // Si la respuesta es directamente los datos
  return response;
};

/**
 * Función para manejar errores de la API
 */
const handleApiError = (error: any): never => {
  if (error.response) {
    // La solicitud fue realizada y el servidor respondió con un código de estado
    // que cae fuera del rango 2xx
    const status = error.response.status;
    const message = error.response.data?.message || 'Error en la solicitud';
    const errors = error.response.data?.errors;
    
    throw new ApiError(message, status, errors);
  } else if (error.request) {
    // La solicitud fue realizada pero no se recibió respuesta
    throw new ApiError('No se recibió respuesta del servidor', 0);
  } else {
    // Algo ocurrió al configurar la solicitud que desencadenó un error
    throw new ApiError(error.message || 'Error al realizar la solicitud', 0);
  }
};

/**
 * Servicios de API para entrenadores
 */
export const trainerApi = {
  /**
   * Obtiene los datos del dashboard
   */
  getDashboardData: async (): Promise<DashboardData> => {
    try {
      const response = await axios.get<ApiResponse<DashboardData>>('/trainer/dashboard');
      return processResponse<DashboardData>(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Obtiene la lista de clientes
   * @param page Número de página
   * @param limit Límite de resultados por página
   * @param search Término de búsqueda opcional
   */
  getClients: async (page = 1, limit = 10, search?: string): Promise<PaginatedResponse<Client>> => {
    try {
      const params = { page, limit, ...(search ? { search } : {}) };
      const response = await axios.get<ApiResponse<PaginatedResponse<Client>>>('/trainer/clients', { params });
      return processResponse<PaginatedResponse<Client>>(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Obtiene los detalles de un cliente
   * @param clientId ID del cliente
   */
  getClientDetails: async (clientId: string): Promise<Client> => {
    try {
      const response = await axios.get<ApiResponse<Client>>(`/trainer/clients/${clientId}`);
      return processResponse<Client>(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Obtiene los datos de analíticas
   * @param period Período de tiempo ('day', 'week', 'month', 'year')
   */
  getAnalytics: async (period: string = 'week'): Promise<AnalyticsData> => {
    try {
      const response = await axios.get<ApiResponse<AnalyticsData>>('/trainer/analytics', {
        params: { period }
      });
      return processResponse<AnalyticsData>(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Obtiene la lista de ejercicios
   * @param page Número de página
   * @param limit Límite de resultados por página
   * @param filters Filtros opcionales
   */
  getExercises: async (page = 1, limit = 10, filters?: Record<string, any>): Promise<PaginatedResponse<Exercise>> => {
    try {
      const params = { page, limit, ...filters };
      const response = await axios.get<ApiResponse<PaginatedResponse<Exercise>>>('/trainer/exercises', { params });
      return processResponse<PaginatedResponse<Exercise>>(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Crea un nuevo ejercicio
   * @param exerciseData Datos del ejercicio
   */
  createExercise: async (exerciseData: Partial<Exercise>): Promise<Exercise> => {
    try {
      const response = await axios.post<ApiResponse<Exercise>>('/trainer/exercises', exerciseData);
      return processResponse<Exercise>(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Obtiene la lista de rutinas
   * @param page Número de página
   * @param limit Límite de resultados por página
   */
  getRoutines: async (page = 1, limit = 10): Promise<PaginatedResponse<Routine>> => {
    try {
      const params = { page, limit };
      const response = await axios.get<ApiResponse<PaginatedResponse<Routine>>>('/trainer/routines', { params });
      return processResponse<PaginatedResponse<Routine>>(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Crea una nueva rutina
   * @param routineData Datos de la rutina
   */
  createRoutine: async (routineData: Partial<Routine>): Promise<Routine> => {
    try {
      const response = await axios.post<ApiResponse<Routine>>('/trainer/routines', routineData);
      return processResponse<Routine>(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Obtiene las notificaciones no leídas
   */
  getUnreadNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await axios.get<ApiResponse<Notification[]>>('/trainer/notifications/unread');
      return processResponse<Notification[]>(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

/**
 * Hook personalizado para manejar estados de carga y errores en las solicitudes a la API
 */
export const useApiRequest = <T, P extends any[]>(
  apiFunction: (...args: P) => Promise<T>,
  initialData: T
) => {
  const [data, setData] = React.useState<T>(initialData);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<ApiError | null>(null);

  const execute = async (...args: P): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError('Error desconocido', 0);
      setError(apiError);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
};