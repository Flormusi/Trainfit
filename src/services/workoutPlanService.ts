import axios from './api';
import './axiosConfig';

interface Exercise {
  id: string;
  name: string;
  description: string;
  type: string;
  difficulty: string;
  equipment: string;
  muscles: string[];
  trainerId: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkoutPlan {
  id: number;
  name: string;
  description: string;
  exercises: Exercise[];
  targetGroup: string;
}

export const workoutPlanService = {
  async getAllWorkoutPlans() {
    try {
      console.log('[WorkoutPlanService] Solicitando ejercicios al servidor...');
      const response = await axios.get('/trainer/workout-plans');
      console.log('[WorkoutPlanService] Respuesta del servidor:', response.data);
      
      if (!response.data) {
        throw new Error('La respuesta del servidor no contiene datos');
      }
      
      return response.data;
    } catch (error) {
      console.error('[WorkoutPlanService] Error al obtener ejercicios:', error);
      throw error;
    }
  },

  async createWorkoutPlan(workoutPlan: Omit<WorkoutPlan, 'id'>) {
    try {
      const response = await axios.post('/trainer/workout-plans', workoutPlan);
      return response.data;
    } catch (error) {
      console.error('[WorkoutPlanService] Error al crear plan de ejercicios:', error);
      throw error;
    }
  },

  async deleteWorkoutPlan(id: number) {
    try {
      await axios.delete(`/trainer/workout-plans/${id}`);
    } catch (error) {
      console.error('[WorkoutPlanService] Error al eliminar plan de ejercicios:', error);
      throw error;
    }
  },

  async assignWorkoutPlan(planId: number, clientId: number) {
    try {
      const response = await axios.post('/trainer/workout-assignments', {
        planId,
        clientId,
      });
      return response.data;
    } catch (error) {
      console.error('[WorkoutPlanService] Error al asignar plan de ejercicios:', error);
      throw error;
    }
  },

  async updateWorkoutPlan(id: number, workoutPlan: Omit<WorkoutPlan, 'id'>) {
    try {
      const response = await axios.put(`/trainer/workout-plans/${id}`, workoutPlan);
      return response.data;
    } catch (error) {
      console.error('[WorkoutPlanService] Error al actualizar plan de ejercicios:', error);
      throw error;
    }
  },

  async getAssignedPlans() {
    try {
      const response = await axios.get('/trainer/workout-assignments/client');
      return response.data;
    } catch (error) {
      console.error('[WorkoutPlanService] Error al obtener planes asignados:', error);
      throw error;
    }
  },

  async getUnassignedWorkoutPlans() {
    try {
      const response = await axios.get('/trainer/workout-plans/unassigned');
      return response.data;
    } catch (error) {
      console.error('[WorkoutPlanService] Error al obtener planes no asignados:', error);
      throw error;
    }
  },
};