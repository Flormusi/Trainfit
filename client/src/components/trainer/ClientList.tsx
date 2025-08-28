import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Modal } from 'react-bootstrap';
import { clientService } from '../../services/clientService';
import { useResponsive } from '../../hooks/useResponsive';
import './ClientList.css';
import './force-no-borders.css';
import './eliminate-white-borders.css';
import './override-no-borders.css';
import './force-dark-clientlist.css';
import './eliminate-all-white-margins.css';

interface Client {
  id: string | number;
  name: string;
  email: string;
  membership_tier?: string;
  progress?: number;
  phone?: string;
  createdAt?: string;
}

const ClientList: React.FC = () => {
  const navigate = useNavigate();
  const { isMobile, isTablet, isDesktop, isLargeDesktop, width } = useResponsive();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');

  useEffect(() => {
    const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await clientService.getClients();
      
      // Manejar diferentes estructuras de respuesta
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
      setFilteredClients(clientsArray);
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

    fetchClients();
  }, []);

  // Filtrar clientes basado en búsqueda y filtros
  useEffect(() => {
    let filtered = clients;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por tier de membresía
    if (filterTier !== 'all') {
      filtered = filtered.filter(client => client.membership_tier === filterTier);
    }

    setFilteredClients(filtered);
  }, [clients, searchTerm, filterTier]);

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

  const handleAddClient = () => {
    navigate('/add-client');
  };

  const handleBackToDashboard = () => {
    navigate('/trainer/dashboard');
  };

  if (loading) {
    return (
      <div className="client-list">
        <div className="loading-container">
          <p>Cargando clientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-list-container">
        <div className="error-message">
          <h3>Error al cargar clientes</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
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
      color: '#ffffff',
      border: 'none',
      outline: 'none',
      boxShadow: 'none'
    }}>
      {/* Header con navegación, título y botón agregar */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '24px',
        padding: '16px',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        borderRadius: '12px',
        border: 'none',
        outline: 'none',
        boxShadow: 'none'
      }}>
        {/* Primera fila: Botón volver y botón agregar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <button onClick={handleBackToDashboard} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: 'transparent',
            color: '#b0b0b0',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textDecoration: 'none',
            fontSize: '0.85rem',
            outline: 'none',
            boxShadow: 'none'
          }}>
            ← Volver al Dashboard
          </button>
          
          <button onClick={handleAddClient} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            outline: 'none',
            boxShadow: 'none',
            fontSize: '0.9rem'
          }}>
            <span style={{
              fontSize: '1.1rem',
              fontWeight: 'bold',
              border: 'none',
              outline: 'none',
              boxShadow: 'none'
            }}>+</span>
            <span style={{ display: isMobile ? 'none' : 'inline' }}>Agregar Cliente</span>
          </button>
        </div>
        
        {/* Segunda fila: Título centrado */}
        <div style={{
          textAlign: 'center',
          border: 'none',
          outline: 'none',
          boxShadow: 'none'
        }}>
          <h1 style={{
            margin: '0',
            color: '#ffffff',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: '700',
            border: 'none',
            outline: 'none',
            boxShadow: 'none'
          }}>Mis Clientes</h1>
          <p style={{
            margin: '4px 0 0 0',
            color: '#b0b0b0',
            fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
            border: 'none',
            outline: 'none',
            boxShadow: 'none'
          }}>Gestiona y supervisa a todos tus clientes</p>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '20px',
        padding: '16px',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        borderRadius: '12px',
        border: 'none',
        outline: 'none',
        boxShadow: 'none'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: isTablet || isMobile ? 'column' : 'row',
          gap: '12px',
          border: 'none',
          outline: 'none',
          boxShadow: 'none'
        }}>
          <div style={{
            flex: '1',
            border: 'none',
            outline: 'none',
            boxShadow: 'none'
          }}>
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                backgroundColor: '#2d2d2d',
                color: '#ffffff',
                transition: 'border-color 0.3s ease',
                outline: 'none',
                boxShadow: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{
            minWidth: isDesktop || isLargeDesktop ? '200px' : '100%',
            border: 'none',
            outline: 'none',
            boxShadow: 'none'
          }}>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                background: '#2d2d2d',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'border-color 0.3s ease',
                outline: 'none',
                boxShadow: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="all">Todos los planes</option>
              <option value="basic">Básico</option>
              <option value="premium">Premium</option>
              <option value="pro">Pro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isLargeDesktop 
          ? 'repeat(auto-fit, minmax(150px, 1fr))' 
          : isDesktop
          ? 'repeat(2, 1fr)' 
          : '1fr',
        gap: '12px',
        marginBottom: '20px',
        border: 'none',
        outline: 'none',
        boxShadow: 'none'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          padding: isMobile ? '16px' : '20px',
          borderRadius: '12px',
          textAlign: 'center',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: isMobile ? '1.5rem' : '2rem',
            fontWeight: '700',
            color: '#ffffff',
            border: 'none',
            outline: 'none',
            boxShadow: 'none'
          }}>{clients.length}</h3>
          <p style={{
            margin: '0',
            color: '#b0b0b0',
            fontSize: isMobile ? '0.8rem' : '0.9rem',
            fontWeight: '500',
            border: 'none',
            outline: 'none',
            boxShadow: 'none'
          }}>Total Clientes</p>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          padding: isMobile ? '16px' : '20px',
          borderRadius: '12px',
          textAlign: 'center',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: isMobile ? '1.5rem' : '2rem',
            fontWeight: '700',
            color: '#ffffff',
            border: 'none',
            outline: 'none',
            boxShadow: 'none'
          }}>{filteredClients.length}</h3>
          <p style={{
            margin: '0',
            color: '#b0b0b0',
            fontSize: isMobile ? '0.8rem' : '0.9rem',
            fontWeight: '500',
            border: 'none',
            outline: 'none',
            boxShadow: 'none'
          }}>Mostrando</p>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          padding: isMobile ? '16px' : '20px',
          borderRadius: '12px',
          textAlign: 'center',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: isMobile ? '1.5rem' : '2rem',
            fontWeight: '700',
            color: '#ffffff',
            border: 'none',
            outline: 'none',
            boxShadow: 'none'
          }}>{clients.filter(c => c.membership_tier === 'premium').length}</h3>
          <p style={{
            margin: '0',
            color: '#b0b0b0',
            fontSize: isMobile ? '0.8rem' : '0.9rem',
            fontWeight: '500',
            border: 'none',
            outline: 'none',
            boxShadow: 'none'
          }}>Premium</p>
        </div>
      </div>

      {/* Lista de clientes */}
      {filteredClients.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          borderRadius: '12px',
          border: 'none',
          outline: 'none',
          boxShadow: 'none'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '16px',
            border: 'none',
            outline: 'none',
            boxShadow: 'none'
          }}>👥</div>
          <h3 style={{
            color: '#ffffff',
            marginBottom: '8px',
            border: 'none',
            outline: 'none',
            boxShadow: 'none'
          }}>No se encontraron clientes</h3>
          <p style={{
            color: '#b0b0b0',
            marginBottom: '24px',
            border: 'none',
            outline: 'none',
            boxShadow: 'none'
          }}>
            {searchTerm || filterTier !== 'all' 
              ? 'Intenta ajustar tus filtros de búsqueda'
              : 'Comienza agregando tu primer cliente'
            }
          </p>
          {!searchTerm && filterTier === 'all' && (
            <button 
              onClick={handleAddClient} 
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                outline: 'none',
                boxShadow: 'none'
              }}
            >
              Agregar Primer Cliente
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile 
            ? '1fr' 
            : isTablet 
              ? 'repeat(auto-fill, minmax(250px, 1fr))' 
              : isDesktop 
                ? 'repeat(auto-fill, minmax(280px, 1fr))' 
                : 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: isTablet ? '12px' : '16px',
          border: 'none',
          outline: 'none',
          boxShadow: 'none'
        }}>
          {filteredClients.map((client) => (
            <div key={client.id} style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
              borderRadius: '12px',
              padding: isTablet ? '16px' : '24px',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: window.innerWidth > 768 ? '16px' : '12px',
              position: 'relative',
              overflow: 'hidden'
            }}>
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
                margin: '0 auto',
                border: 'none',
                outline: 'none',
                boxShadow: 'none'
              }}>
                {client.name.charAt(0).toUpperCase()}
              </div>
              
              <div style={{
                textAlign: 'center',
                border: 'none',
                outline: 'none',
                boxShadow: 'none'
              }}>
                <h3 style={{
                  margin: '0 0 8px 0',
                  color: '#ffffff',
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none'
                }}>{client.name}</h3>
                <p style={{
                  margin: '0 0 4px 0',
                  color: '#b0b0b0',
                  fontSize: '0.9rem',
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none'
                }}>{client.email}</p>
                {client.phone && (
                  <p style={{
                    margin: '0 0 12px 0',
                    color: '#b0b0b0',
                    fontSize: '0.9rem',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none'
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
                      ? 'rgba(220, 38, 38, 0.2)' 
                      : client.membership_tier === 'pro'
                      ? 'rgba(245, 158, 11, 0.2)'
                      : 'rgba(156, 163, 175, 0.2)',
                    color: client.membership_tier === 'premium' 
                      ? '#ef4444' 
                      : client.membership_tier === 'pro'
                      ? '#f59e0b'
                      : '#9ca3af',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none'
                  }}>
                    {client.membership_tier.charAt(0).toUpperCase() + client.membership_tier.slice(1)}
                  </span>
                )}
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: 'auto',
                border: 'none',
                outline: 'none',
                boxShadow: 'none'
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
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    color: 'white',
                    outline: 'none',
                    boxShadow: 'none'
                  }}
                  title="Ver perfil completo"
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
                    background: 'linear-gradient(135deg, #4b5563 0%, #374151 100%)',
                    color: 'white',
                    outline: 'none',
                    boxShadow: 'none'
                  }}
                  title="Asignar nueva rutina"
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
                    background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
                    color: 'white',
                    outline: 'none',
                    boxShadow: 'none'
                  }}
                  title="Eliminar cliente"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmación para eliminar cliente */}
      <Modal 
        show={showDeleteModal} 
        onHide={() => setShowDeleteModal(false)}
        style={{
          border: 'none',
          outline: 'none',
          boxShadow: 'none'
        }}
      >
        <Modal.Header 
          closeButton
          style={{
            borderBottom: 'none',
            backgroundColor: '#f8f9fa',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            padding: '20px 24px',
            border: 'none',
            outline: 'none',
            boxShadow: 'none'
          }}
        >
          <Modal.Title style={{
            color: '#2c3e50',
            fontSize: '1.25rem',
            fontWeight: '600',
            border: 'none',
            outline: 'none',
            boxShadow: 'none'
          }}>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{
          padding: '24px',
          color: '#495057',
          border: 'none',
          outline: 'none',
          boxShadow: 'none'
        }}>
          <p style={{
            border: 'none',
            outline: 'none',
            boxShadow: 'none'
          }}>¿Estás seguro de que quieres eliminar a <strong>{clientToDelete?.name}</strong>?</p>
          <p style={{
            color: '#dc3545',
            fontSize: '0.9rem',
            marginTop: '8px',
            border: 'none',
            outline: 'none',
            boxShadow: 'none'
          }}>Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer style={{
          borderTop: 'none',
          backgroundColor: '#f8f9fa',
          borderBottomLeftRadius: '12px',
          borderBottomRightRadius: '12px',
          padding: '20px 24px',
          border: 'none',
          outline: 'none',
          boxShadow: 'none'
        }}>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)}
            style={{
              border: 'none',
              outline: 'none',
              boxShadow: 'none'
            }}
          >
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleConfirmDelete}
            style={{
              border: 'none',
              outline: 'none',
              boxShadow: 'none'
            }}
          >
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ClientList;