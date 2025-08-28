import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Ajusta la ruta
// Importa componentes de UI
// import { Container, Box, Typography, TextField, Button, Alert, Link, Select, MenuItem, FormControl, InputLabel, Stepper, Step, StepLabel, Paper } from '@mui/material';
// import { SelectChangeEvent } from '@mui/material/Select';
// import logo from '../assets/logo.png';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client', // 'client' o 'trainer'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // const [activeStep, setActiveStep] = useState(0); // Si usas Stepper
  // const steps = ['Información personal', 'Credenciales', 'Tipo de usuario'];

  const { login } = useAuth(); // Para auto-login después del registro
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement /*| { name?: string; value: unknown }*/>) => {
    // Para Select de Material UI, el evento es diferente, necesitarías SelectChangeEvent
    const target = e.target as HTMLInputElement; // Simplificación, ajusta si usas Select
    setFormData({