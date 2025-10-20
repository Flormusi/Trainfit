/**
 * Componente mejorado de Dashboard para entrenadores
 * Implementa las recomendaciones para un mejor manejo de respuestas,
 * errores y estados de carga.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  trainerApi, 
  DashboardData, 
  Client, 
  AnalyticsData,
  ApiError,
  useApiRequest
} from '../services/api.improved';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  CircularProgress, 
  Alert, 
  Box, 
  Tabs, 
  Tab,
  Snackbar,
  IconButton
} from '@mui/material';
import { 
  People as PeopleIcon, 
  FitnessCenter as FitnessCenterIcon, 
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const TrainerDashboard: React.FC = () => {
  // Estados para los datos
  const [selectedPeriod, setSelectedPeriod] = useState<string>('week');
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [showAlert, setShowAlert] = useState<boolean>(false);

  // Utilizar el hook personalizado para las solicitudes a la API
  const { 
    data: dashboardData, 
    loading: loadingDashboard, 
    error: dashboardError, 
    execute: fetchDashboardData 
  } = useApiRequest<DashboardData, []>(
    trainerApi.getDashboardData, 
    { clientCount: 0, routineCount: 0, exerciseCount: 0 }
  );

  const { 
    data: clients, 
    loading: loadingClients, 
    error: clientsError, 
    execute: fetchClients 
  } = useApiRequest<Client[], []>(
    async () => {
      const response = await trainerApi.getClients(1, 5);
      return response.items;
    }, 
    []
  );

  const { 
    data: analytics, 
    loading: loadingAnalytics, 
    error: analyticsError, 
    execute: fetchAnalytics 
  } = useApiRequest<AnalyticsData, [string]>(
    trainerApi.getAnalytics, 
    { routinesCreated: 0, newClients: 0, progressUpdates: 0, period: 'week' }
  );

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchDashboardData(),
          fetchClients(),
          fetchAnalytics(selectedPeriod)
        ]);
      } catch (error) {
        const apiError = error as ApiError;
        setAlertMessage(`Error al cargar datos: ${apiError.message}`);
        setShowAlert(true);
      }
    };

    loadData();
  }, []);

  // Actualizar analíticas cuando cambia el período seleccionado
  useEffect(() => {
    fetchAnalytics(selectedPeriod);
  }, [selectedPeriod]);

  // Manejar cambio de período
  const handlePeriodChange = (_event: React.SyntheticEvent, newValue: string) => {
    setSelectedPeriod(newValue);
  };

  // Cerrar alerta
  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  // Renderizar estado de carga
  if (loadingDashboard && loadingClients && loadingAnalytics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Alerta para errores */}
      <Snackbar
        open={showAlert}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="error" 
          action={
            <IconButton size="small" color="inherit" onClick={handleCloseAlert}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {alertMessage}
        </Alert>
      </Snackbar>

      {/* Mostrar errores específicos */}
      {dashboardError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error al cargar datos del dashboard: {dashboardError.message}
        </Alert>
      )}
      {clientsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error al cargar clientes: {clientsError.message}
        </Alert>
      )}
      {analyticsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error al cargar analíticas: {analyticsError.message}
        </Alert>
      )}

      {/* Resumen general */}
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Grid container spacing={3}>
        {/* Tarjetas de resumen */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Clientes
              </Typography>
              <Box display="flex" alignItems="center">
                <PeopleIcon sx={{ mr: 1 }} />
                <Typography variant="h5" component="div">
                  {loadingDashboard ? <CircularProgress size={24} /> : dashboardData.clientCount}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Rutinas
              </Typography>
              <Box display="flex" alignItems="center">
                <AssignmentIcon sx={{ mr: 1 }} />
                <Typography variant="h5" component="div">
                  {loadingDashboard ? <CircularProgress size={24} /> : dashboardData.routineCount}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Ejercicios
              </Typography>
              <Box display="flex" alignItems="center">
                <FitnessCenterIcon sx={{ mr: 1 }} />
                <Typography variant="h5" component="div">
                  {loadingDashboard ? <CircularProgress size={24} /> : dashboardData.exerciseCount}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Analíticas */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Analíticas</Typography>
              <Tabs
                value={selectedPeriod}
                onChange={handlePeriodChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
              >
                <Tab label="Día" value="day" />
                <Tab label="Semana" value="week" />
                <Tab label="Mes" value="month" />
                <Tab label="Año" value="year" />
              </Tabs>
              
              {loadingAnalytics ? (
                <Box display="flex" justifyContent="center" my={3}>
                  <CircularProgress />
                </Box>
              ) : (
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body1">Nuevos clientes: {analytics.newClients}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body1">Rutinas creadas: {analytics.routinesCreated}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body1">Actualizaciones de progreso: {analytics.progressUpdates}</Typography>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Clientes recientes */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Clientes recientes</Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AddIcon />}
                  component={Link}
                  to="/clients/new"
                >
                  Nuevo cliente
                </Button>
              </Box>
              
              {loadingClients ? (
                <Box display="flex" justifyContent="center" my={3}>
                  <CircularProgress />
                </Box>
              ) : clients.length > 0 ? (
                <Grid container spacing={2}>
                  {clients.map((client) => (
                    <Grid item xs={12} key={client.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="subtitle1">{client.name}</Typography>
                              <Typography variant="body2" color="textSecondary">{client.email}</Typography>
                            </Box>
                            <Button 
                              variant="outlined" 
                              size="small"
                              component={Link}
                              to={`/clients/${client.id}`}
                            >
                              Ver detalles
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info">
                  No tienes clientes registrados. ¡Comienza agregando uno nuevo!
                </Alert>
              )}
              
              {clients.length > 0 && (
                <Box display="flex" justifyContent="center" mt={2}>
                  <Button 
                    variant="text" 
                    component={Link} 
                    to="/clients"
                  >
                    Ver todos los clientes
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Acciones rápidas */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Acciones rápidas</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    component={Link} 
                    to="/routines/new"
                    startIcon={<AssignmentIcon />}
                  >
                    Nueva rutina
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    component={Link} 
                    to="/exercises/new"
                    startIcon={<FitnessCenterIcon />}
                  >
                    Nuevo ejercicio
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    component={Link} 
                    to="/analytics"
                  >
                    Ver analíticas
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    component={Link} 
                    to="/profile"
                  >
                    Mi perfil
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TrainerDashboard;