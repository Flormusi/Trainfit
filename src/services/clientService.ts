import axios from './axiosConfig';
import { authService } from './authService';

// Usamos axiosConfig que ya define baseURL (proxy '/api' en dev y VITE_API_URL en prod)
// Evitamos construir URLs absolutas para prevenir desajustes y CORS

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

        const response = await axios.post(`/trainer/clients`, clientData);

        return response.data;
    },

    async getClients() {
        const token = authService.getToken();
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        const response = await axios.get(`/trainer/clients`);

        // Normalizar la forma de salida: devolver SIEMPRE un array de clientes
        const data = response.data;
        if (data && data.data && Array.isArray(data.data.clients)) {
            return data.data.clients;
        }
        if (Array.isArray(data)) {
            return data;
        }
        if (data && Array.isArray(data.clients)) {
            return data.clients;
        }
        return [];
    },

    async deleteClient(clientId: string | number) {
        const token = authService.getToken();
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        const response = await axios.delete(`/trainer/clients/${clientId}`);

        return response.data;
    },

    async updateClient(clientId: string | number, clientData: Partial<ClientData>) {
        const token = authService.getToken();
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        const response = await axios.put(`/trainer/clients/${clientId}`, clientData);

        return response.data;
    },

    async getClientById(clientId: string | number) {
        const token = authService.getToken();
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        const response = await axios.get(`/trainer/clients/${clientId}`);

        return response.data;
    }
};

export { clientService, type ClientData };