/**
 * Pruebas de componentes para el frontend de TrainFit
 * Este archivo contiene pruebas para verificar el correcto funcionamiento
 * de los componentes de React.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthProvider } from '../contexts/AuthContext';

// Tema personalizado para pruebas
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Componentes a probar (estos serían los componentes reales)
// Nota: Creamos mocks para los componentes que no existen en el proyecto actual
// En un proyecto real, importaríamos los componentes reales

// Mock de componentes
const Login = () => <div>Login Component</div>;
const Dashboard = () => <div>Dashboard Component</div>;
const ClientList = () => <div>Client List Component</div>;
const ExerciseForm = ({ onSubmit }: { onSubmit?: () => void }) => (
  <div>
    <label htmlFor="name">Nombre</label>
    <input id="name" />
    <label htmlFor="description">Descripción</label>
    <input id="description" />
    <label htmlFor="type">Tipo</label>
    <input id="type" />
    <label htmlFor="difficulty">Dificultad</label>
    <input id="difficulty" />
    <button onClick={onSubmit}>Guardar</button>
  </div>
);

// Mock de servicios
const apiMock = {
  login: jest.fn(),
  getDashboardData: jest.fn(),
  getClients: jest.fn(),
  createExercise: jest.fn(),
};

// Mock del módulo de API
jest.mock('../services/api', () => apiMock);

// Función auxiliar para renderizar componentes con proveedores
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          {ui}
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

// Grupo de pruebas para el componente Login
describe('Componente Login', () => {
  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    jest.clearAllMocks();
  });

  test('Renderiza correctamente', () => {
    renderWithProviders(<Login />);
    
    // Verificar que los elementos principales estén presentes
    expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  test('Maneja la entrada de usuario correctamente', () => {
    renderWithProviders(<Login />);
    
    // Simular entrada de usuario
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Verificar que los valores se actualizaron
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  test('Muestra error con credenciales inválidas', async () => {
    // Configurar mock para simular error de login
    apiMock.login.mockRejectedValueOnce(new Error('Credenciales inválidas'));
    
    renderWithProviders(<Login />);
    
    // Simular entrada de usuario y envío del formulario
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    
    // Verificar que se muestra el mensaje de error
    await waitFor(() => {
      expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument();
    });
  });
});

// Grupo de pruebas para el componente Dashboard
describe('Componente Dashboard', () => {
  beforeEach(() => {
    // Configurar mock para simular datos del dashboard
    apiMock.getDashboardData.mockResolvedValueOnce({
      clientCount: 10,
      routineCount: 25,
      exerciseCount: 50
    });
  });

  test('Renderiza correctamente con datos', async () => {
    renderWithProviders(<Dashboard />);
    
    // Verificar que se muestran los datos del dashboard
    await waitFor(() => {
      expect(screen.getByText(/10/)).toBeInTheDocument(); // clientCount
      expect(screen.getByText(/25/)).toBeInTheDocument(); // routineCount
      expect(screen.getByText(/50/)).toBeInTheDocument(); // exerciseCount
    });
  });

  test('Muestra indicador de carga inicialmente', () => {
    renderWithProviders(<Dashboard />);
    
    // Verificar que se muestra el indicador de carga
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});

// Grupo de pruebas para el componente ClientList
describe('Componente ClientList', () => {
  const mockClients = [
    { id: '1', name: 'Cliente 1', email: 'cliente1@example.com', phone: '123456789' },
    { id: '2', name: 'Cliente 2', email: 'cliente2@example.com', phone: '987654321' }
  ];

  beforeEach(() => {
    // Configurar mock para simular lista de clientes
    apiMock.getClients.mockResolvedValueOnce({
      clients: mockClients,
      pagination: { total: 2, page: 1, limit: 10 }
    });
  });

  test('Renderiza la lista de clientes correctamente', async () => {
    renderWithProviders(<ClientList />);
    
    // Verificar que se muestran los clientes
    await waitFor(() => {
      expect(screen.getByText('Cliente 1')).toBeInTheDocument();
      expect(screen.getByText('Cliente 2')).toBeInTheDocument();
      expect(screen.getByText('cliente1@example.com')).toBeInTheDocument();
      expect(screen.getByText('cliente2@example.com')).toBeInTheDocument();
    });
  });

  test('Permite buscar clientes', async () => {
    renderWithProviders(<ClientList />);
    
    // Esperar a que se carguen los clientes
    await waitFor(() => {
      expect(screen.getByText('Cliente 1')).toBeInTheDocument();
    });
    
    // Simular búsqueda
    const searchInput = screen.getByPlaceholderText(/buscar/i);
    fireEvent.change(searchInput, { target: { value: 'Cliente 1' } });
    
    // Verificar que solo se muestra el cliente buscado
    expect(screen.getByText('Cliente 1')).toBeInTheDocument();
    expect(screen.queryByText('Cliente 2')).not.toBeInTheDocument();
  });
});

// Grupo de pruebas para el componente ExerciseForm
describe('Componente ExerciseForm', () => {
  beforeEach(() => {
    // Configurar mock para simular creación de ejercicio
    apiMock.createExercise.mockResolvedValueOnce({
      id: '1',
      name: 'Nuevo Ejercicio',
      description: 'Descripción del ejercicio',
      type: 'Fuerza',
      difficulty: 'Intermedio'
    });
  });

  test('Renderiza el formulario correctamente', () => {
    renderWithProviders(<ExerciseForm />);
    
    // Verificar que los campos del formulario están presentes
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tipo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dificultad/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();
  });

  test('Envía el formulario correctamente', async () => {
    const onSubmitMock = jest.fn();
    
    renderWithProviders(<ExerciseForm onSubmit={onSubmitMock} />);
    
    // Simular entrada de usuario
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Nuevo Ejercicio' } });
    fireEvent.change(screen.getByLabelText(/descripción/i), { target: { value: 'Descripción del ejercicio' } });
    fireEvent.change(screen.getByLabelText(/tipo/i), { target: { value: 'Fuerza' } });
    fireEvent.change(screen.getByLabelText(/dificultad/i), { target: { value: 'Intermedio' } });
    
    // Enviar formulario
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));
    
    // Verificar que se llamó a la API y al callback
    await waitFor(() => {
      expect(apiMock.createExercise).toHaveBeenCalledWith({
        name: 'Nuevo Ejercicio',
        description: 'Descripción del ejercicio',
        type: 'Fuerza',
        difficulty: 'Intermedio'
      });
      expect(onSubmitMock).toHaveBeenCalled();
    });
  });

  test('Valida campos requeridos', async () => {
    renderWithProviders(<ExerciseForm />);
    
    // Enviar formulario sin completar campos
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));
    
    // Verificar mensajes de error
    await waitFor(() => {
      expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/la descripción es requerida/i)).toBeInTheDocument();
    });
  });
});