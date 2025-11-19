import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button, Modal } from 'react-bootstrap';
import { clientService } from '../../services/clientService';
import { useResponsive } from '../../hooks/useResponsive';
import './ClientList.css';

interface Client {
  id: string | number;
  name: string;
  email: string;
  membership_tier?: string;
  progress?: number;
  phone?: string;
  createdAt?: string;
  clientProfile?: {
    weight?: number;
    goals?: string[];
    trainingDaysPerWeek?: number;
  };
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const ClientListImproved: React.FC = () => {
  const navigate = useNavigate();
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useResponsive();
  
  // Estados principales
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para modales
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'createdAt' | 'weight'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(isMobile ? 6 : isTablet ? 8 : 10);
  
  // Estados para vista
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await clientService.getClients();
        
        let clientsArray = [];
        if (response && response.data && response.data.clients && Array.isArray(response.data.clients)) {
          clientsArray = response.data.clients;
        } else if (Array.isArray(response)) {
          clientsArray = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          clientsArray = response.data;
        } else {
          clientsArray = [];
        }
        
        setClients(clientsArray);
      } catch (err: any) {
        console.error('Error fetching clients:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch clients');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Actualizar itemsPerPage cuando cambie el tamaño de pantalla
  useEffect(() => {
    setItemsPerPage(isMobile ? 6 : isTablet ? 8 : 10);
    setCurrentPage(1); // Reset a la primera página
  }, [isMobile, isTablet]);

  // Filtrar y ordenar clientes
  const filteredAndSortedClients = useMemo(() => {
    let filtered = clients;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por tier de membresía
    if (filterTier !== 'all') {
      filtered = filtered.filter(client => client.membership_tier === filterTier);
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        case 'weight':
          aValue = a.clientProfile?.weight || 0;
          bValue = b.clientProfile?.weight || 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [clients, searchTerm, filterTier, sortBy, sortOrder]);

  // Función para encontrar y navegar a un cliente específico
  const findAndNavigateToClient = (searchValue: string) => {
    if (!searchValue.trim()) return false;

    const searchTerm = searchValue.toLowerCase().trim();

    // Primero buscar coincidencia exacta por nombre
    let targetClient = clients.find(client => 
      client.name.toLowerCase() === searchTerm
    );

    // Si no hay coincidencia exacta, buscar coincidencia parcial
    if (!targetClient) {
      const partialMatches = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm) ||
        client.email.toLowerCase().includes(searchTerm) ||
        client.phone?.toLowerCase().includes(searchTerm)
      );

      if (partialMatches.length === 1) {
        targetClient = partialMatches[0];
      } else if (partialMatches.length > 1) {
        // Si hay múltiples coincidencias, mostrar las opciones
        const names = partialMatches.map(c => c.name).join(', ');
        toast.error(`Se encontraron ${partialMatches.length} clientes: ${names}. Sé más específico.`);
        return false;
      }
    }

    if (targetClient) {
      // Encontrar en qué página está el cliente
      const allFilteredClients = clients.filter(client => {
        if (filterTier !== 'all') {
          return client.membership_tier === filterTier;
        }
        return true;
      });

      // Aplicar ordenamiento
      allFilteredClients.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (sortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'email':
            aValue = a.email.toLowerCase();
            bValue = b.email.toLowerCase();
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt || 0);
            bValue = new Date(b.createdAt || 0);
            break;
          case 'weight':
            aValue = a.clientProfile?.weight || 0;
            bValue = b.clientProfile?.weight || 0;
            break;
          default:
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      const clientIndex = allFilteredClients.findIndex(client => client.id === targetClient.id);
      if (clientIndex !== -1) {
        const targetPage = Math.ceil((clientIndex + 1) / itemsPerPage);
        setCurrentPage(targetPage);
        
        // Mostrar mensaje de éxito
        toast.success(`✅ Navegando a ${targetClient.name} (página ${targetPage})`);
        
        // Limpiar búsqueda después de un breve delay para que el usuario vea el resultado
        setTimeout(() => {
          setSearchTerm('');
        }, 2000);
        
        // Scroll suave hacia arriba
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        return true;
      }
    }
    
    return false;
  };

  // Paginación
  const paginationInfo: PaginationInfo = useMemo(() => {
    const totalItems = filteredAndSortedClients.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage
    };
  }, [filteredAndSortedClients.length, itemsPerPage, currentPage]);

  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedClients.slice(startIndex, endIndex);
  }, [filteredAndSortedClients, currentPage, itemsPerPage]);

  // Funciones de manejo
  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;

    try {
      await clientService.deleteClient(clientToDelete.id);
      setClients(clients.filter(c => c.id !== clientToDelete.id));
      toast.success('Cliente eliminado exitosamente');
    } catch (err: any) {
      console.error('Error al eliminar cliente:', err);
      toast.error(err.response?.data?.message || 'Error al eliminar cliente');
    } finally {
      setShowDeleteModal(false);
      setClientToDelete(null);
    }
  };

  const handleViewClient = (clientId: string | number) => {
    navigate(`/trainer/clients/${clientId}`);
  };

  const handleAssignRoutine = (clientId: string | number) => {
    const client = clients.find(c => c.id === clientId);
    const clientName = client ? client.name : 'Cliente';
    
    navigate('/trainer/create-routine', { 
      state: { 
        clientId: clientId, 
        clientName: clientName,
        assignToClient: true
      } 
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="client-list">
        <div className="loading-container" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #333',
            borderTop: '4px solid #dc2626',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#ffffff', fontSize: '1.1rem' }}>Cargando clientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-list-container" style={{ 
        backgroundColor: '#121212', 
        minHeight: '100vh', 
        padding: '20px' 
      }}>
        <div className="error-message" style={{
          textAlign: 'center',
          padding: '60px',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          borderRadius: '12px',
          color: '#ffffff'
        }}>
          <h3 style={{ color: '#ff3b30', marginBottom: '16px' }}>Error al cargar clientes</h3>
          <p style={{ marginBottom: '24px' }}>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '12px 24px',
              background: '#D62828',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="client-list-container" style={{
      margin: '0',
      padding: '16px',
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#121212',
      color: '#ffffff'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '24px',
        padding: '16px',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        borderRadius: '12px'
      }}>
        {/* Navegación y título */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <button 
            onClick={() => navigate('/trainer/dashboard')} 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              background: 'transparent',
              color: '#b0b0b0',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            ← Volver al Dashboard
          </button>
          
          <button 
            onClick={() => navigate('/add-client')} 
            style={{
              padding: '12px 24px',
              background: '#D62828',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            + Agregar Cliente
          </button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            margin: '0',
            color: '#ffffff',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: '700'
          }}>Mis Clientes</h1>
          <p style={{
            margin: '4px 0 0 0',
            color: '#b0b0b0',
            fontSize: '0.9rem'
          }}>
            Gestiona y supervisa a todos tus clientes ({filteredAndSortedClients.length} total)
          </p>
        </div>
      </div>

      {/* Controles de filtros y búsqueda */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '16px',
        marginBottom: '24px',
        padding: '16px',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        borderRadius: '12px'
      }}>
        {/* Búsqueda */}
        <div style={{ 
          flex: 1, 
          position: 'relative',
          display: 'flex',
          gap: '8px'
        }}>
          <input
            type="text"
            placeholder="Buscar cliente por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const found = findAndNavigateToClient(searchTerm);
                if (!found && searchTerm.trim()) {
                  // Si no se encuentra coincidencia exacta, mantener la búsqueda normal
                  toast.error(`No se encontró un cliente con el nombre exacto: "${searchTerm}"`);
                }
              }
            }}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: '#2d2d2d',
              border: '1px solid #404040',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.9rem'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => {
                const found = findAndNavigateToClient(searchTerm);
                if (!found && searchTerm.trim()) {
                  toast.error(`No se encontró un cliente con el nombre exacto: "${searchTerm}"`);
                }
              }}
              style={{
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                whiteSpace: 'nowrap'
              }}
            >
              🔍 Ir a Cliente
            </button>
          )}
          {searchTerm && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              right: '0',
              background: '#2d2d2d',
              border: '1px solid #404040',
              borderTop: 'none',
              borderRadius: '0 0 8px 8px',
              padding: '8px 12px',
              fontSize: '0.8rem',
              color: '#b0b0b0',
              zIndex: 10
            }}>
              💡 Presiona Enter o haz clic en el botón para buscar y navegar al cliente
            </div>
          )}
        </div>

        {/* Filtros */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <select
            value={filterTier}
            onChange={(e) => {
              setFilterTier(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '12px 16px',
              background: '#2d2d2d',
              border: '1px solid #404040',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.9rem'
            }}
          >
            <option value="all">Todos los tiers</option>
            <option value="basic">Básico</option>
            <option value="pro">Pro</option>
            <option value="premium">Premium</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as typeof sortBy);
              setSortOrder(order as 'asc' | 'desc');
              setCurrentPage(1);
            }}
            style={{
              padding: '12px 16px',
              background: '#2d2d2d',
              border: '1px solid #404040',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.9rem'
            }}
          >
            <option value="name-asc">Nombre A-Z</option>
            <option value="name-desc">Nombre Z-A</option>
            <option value="email-asc">Email A-Z</option>
            <option value="email-desc">Email Z-A</option>
            <option value="createdAt-desc">Más recientes</option>
            <option value="createdAt-asc">Más antiguos</option>
          </select>

          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              padding: '12px 16px',
              background: '#2d2d2d',
              border: '1px solid #404040',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.9rem'
            }}
          >
            <option value={6}>6 por página</option>
            <option value={8}>8 por página</option>
            <option value={10}>10 por página</option>
            <option value={15}>15 por página</option>
            <option value={20}>20 por página</option>
          </select>
        </div>
      </div>

      {/* Información de resultados */}
      <div style={{
        marginBottom: '16px',
        padding: '0 4px',
        color: '#b0b0b0',
        fontSize: '0.9rem'
      }}>
        Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedClients.length)} de {filteredAndSortedClients.length} clientes
        {searchTerm && ` (filtrado de ${clients.length} total)`}
      </div>

      {/* Lista de clientes */}
      {paginatedClients.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          borderRadius: '12px'
        }}>
          <h3 style={{ color: '#ffffff', marginBottom: '16px' }}>
            {searchTerm || filterTier !== 'all' ? 'No se encontraron clientes' : 'No tienes clientes aún'}
          </h3>
          <p style={{ color: '#b0b0b0', marginBottom: '24px' }}>
            {searchTerm || filterTier !== 'all' 
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza agregando tu primer cliente'
            }
          </p>
          {(!searchTerm && filterTier === 'all') && (
            <button 
              onClick={() => navigate('/add-client')}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Agregar Primer Cliente
            </button>
          )}
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile 
              ? '1fr' 
              : isTablet 
                ? 'repeat(auto-fill, minmax(250px, 1fr))' 
                : isDesktop 
                  ? 'repeat(auto-fill, minmax(280px, 1fr))' 
                  : 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: isTablet ? '12px' : '16px'
          }}>
            {paginatedClients.map((client) => (
              <div key={client.id} style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                borderRadius: '12px',
                padding: isTablet ? '16px' : '24px',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(220, 38, 38, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  margin: '0 auto'
                }}>
                  {client.name.charAt(0).toUpperCase()}
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    color: '#ffffff',
                    fontSize: '1.25rem',
                    fontWeight: '600'
                  }}>{client.name}</h3>
                  <p style={{
                    margin: '0 0 4px 0',
                    color: '#b0b0b0',
                    fontSize: '0.9rem'
                  }}>{client.email}</p>
                  {client.phone && (
                    <p style={{
                      margin: '0 0 12px 0',
                      color: '#b0b0b0',
                      fontSize: '0.9rem'
                    }}>{client.phone}</p>
                  )}
                  {client.membership_tier && (
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      background: client.membership_tier === 'premium' 
                        ? 'rgba(214, 40, 40, 0.2)' 
                        : client.membership_tier === 'pro'
                        ? 'rgba(245, 158, 11, 0.2)'
                        : 'rgba(156, 163, 175, 0.2)',
                      color: client.membership_tier === 'premium' 
                        ? '#D62828' 
                        : client.membership_tier === 'pro'
                        ? '#f59e0b'
                        : '#9ca3af'
                    }}>
                      {client.membership_tier.charAt(0).toUpperCase() + client.membership_tier.slice(1)}
                    </span>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginTop: 'auto'
                }}>
                  <button 
                    onClick={() => handleViewClient(client.id)}
                    style={{
                      padding: '10px 16px',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'center',
                      background: '#D62828',
                      color: 'white'
                    }}
                  >
                    Ver Perfil
                  </button>
                  <button 
                    onClick={() => handleAssignRoutine(client.id)}
                    style={{
                      padding: '10px 16px',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'center',
                      background: '#D62828',
                      color: 'white'
                    }}
                  >
                    Asignar Rutina
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(client)}
                    style={{
                      padding: '10px 16px',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'center',
                      background: '#D62828',
                      color: 'white'
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {paginationInfo.totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              marginTop: '32px',
              padding: '16px',
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
              borderRadius: '12px'
            }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 12px',
                  background: currentPage === 1 ? '#404040' : '#D62828',
                  color: currentPage === 1 ? '#666' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                ← Anterior
              </button>

              <div style={{
                display: 'flex',
                gap: '4px'
              }}>
                {Array.from({ length: Math.min(5, paginationInfo.totalPages) }, (_, i) => {
                  let pageNumber;
                  if (paginationInfo.totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= paginationInfo.totalPages - 2) {
                    pageNumber = paginationInfo.totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      style={{
                        padding: '8px 12px',
                        background: pageNumber === currentPage 
                          ? '#D62828' 
                          : '#404040',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: pageNumber === currentPage ? '600' : '400'
                      }}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === paginationInfo.totalPages}
                style={{
                  padding: '8px 12px',
                  background: currentPage === paginationInfo.totalPages ? '#404040' : '#D62828',
                  color: currentPage === paginationInfo.totalPages ? '#666' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: currentPage === paginationInfo.totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Siguiente →
              </button>

              <div style={{
                marginLeft: '16px',
                color: '#b0b0b0',
                fontSize: '0.9rem'
              }}>
                Página {currentPage} de {paginationInfo.totalPages}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de confirmación para eliminar cliente */}
      <Modal 
        show={showDeleteModal} 
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton style={{ backgroundColor: '#1a1a1a', borderColor: '#404040' }}>
          <Modal.Title style={{ color: '#ffffff' }}>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>
          ¿Estás seguro de que quieres eliminar a {clientToDelete?.name}? Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#1a1a1a', borderColor: '#404040' }}>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)}
            style={{ backgroundColor: '#404040', borderColor: '#404040' }}
          >
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleConfirmDelete}
            style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
          >
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Estilos para la animación de carga */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ClientListImproved;