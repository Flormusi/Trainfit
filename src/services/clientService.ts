import axios from 'axios';
import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

interface ClientData {
    name: string;
    email: string;
    password: string;
    phone?: string;
    goals?: string[];
    height?: number;
    weight?: number;
    bodyFat?: number;
    membershipTier?: string;
    medicalConditions?: string;
    medications?: string;
    injuries?: string;
    initialObjective?: string;
    trainingDaysPerWeek?: number;
}

const clientService = {
    async addClient(clientData: ClientData) {
        const token = authService.getToken();
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        const response = await axios.post(`${API_URL}/trainer/clients`, clientData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    },

    async getClients() {
        const token = authService.getToken();
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        const response = await axios.get(`${API_URL}/trainer/clients`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;
    },

    async deleteClient(clientId: string | number) {
        const token = authService.getToken();
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        const response = await axios.delete(`${API_URL}/trainer/clients/${clientId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;
    },

    async updateClient(clientId: string | number, clientData: Partial<ClientData>) {
        const token = authService.getToken();
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        const response = await axios.put(`${API_URL}/trainer/clients/${clientId}`, clientData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    },

    async getClientById(clientId: string | number) {
        const token = authService.getToken();
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        const response = await axios.get(`${API_URL}/trainer/clients/${clientId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;
    }
};

export { clientService, type ClientData };