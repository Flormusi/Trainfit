import React, { useState, useEffect, useRef } from 'react';

import { ArrowLeftIcon, PaperAirplaneIcon, EllipsisVerticalIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './MessagingSystem.css';
import axios from '../services/axiosConfig';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  messageType: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
  };
}

interface Conversation {
  id: string;
  name: string;
  email: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

const MessagingSystem: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [availableClients, setAvailableClients] = useState<any[]>([]);
  const [selectedClientForNew, setSelectedClientForNew] = useState<string>('');
  const [clientsLoading, setClientsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filteredClients, setFilteredClients] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [editLoading, setEditLoading] = useState<boolean>(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [mutedConversations, setMutedConversations] = useState<string[]>([]);
  
  // Normalizar rol del usuario para evitar discrepancias entre 'TRAINER' y 'trainer'
  const isTrainer = ((currentUser?.role || '') as string).toUpperCase() === 'TRAINER';
  const isMuted = selectedConversation ? mutedConversations.includes(selectedConversation) : false;
  
  useEffect(() => {
    fetchConversations();
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('mutedConversations');
      const arr = raw ? JSON.parse(raw) : [];
      setMutedConversations(Array.isArray(arr) ? arr : []);
    } catch (err) {
      setMutedConversations([]);
    }
  }, [selectedConversation]);

  const getCurrentUser = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  };

  const safeExtractArray = (payload: any): any[] => {
    // Permite manejar respuestas en forma { data: [...] } o directamente [...]
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    // Algunos endpoints usan { data: { data: [...] } }
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    return [];
  };

  const fetchConversations = async () => {
    try {
      const response = await axios.get('/messages/conversations');
      if (response.status >= 200 && response.status < 300) {
        const data: any = response?.data ?? null;
        const items = safeExtractArray(data);
        // Mapear la respuesta del backend (que trae lastMessage como objeto)
        // a la forma esperada por el frontend (strings y campos planos)
        const mapped: Conversation[] = items.map((item: any) => {
          const u = item.user || {};
          const name = u?.trainerProfile?.name || u?.clientProfile?.name || u?.name || u?.email || 'Usuario';
          return {
            id: item.userId || u?.id,
            name,
            email: u?.email || '',
            lastMessage: item?.lastMessage?.content || '',
            lastMessageTime: item?.lastMessage?.createdAt || '',
            unreadCount: item?.unreadCount ?? 0,
          } as Conversation;
        });
        setConversations(mapped);
      } else {
        // En caso de 304 u otros, mantener estado actual sin romper
        setConversations(prev => Array.isArray(prev) ? prev : []);
      }
    } catch (error) {
      console.error('Error al obtener conversaciones:', error);
      setConversations([]);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const response = await axios.get(`/messages/conversation/${userId}`);
      if (response.status >= 200 && response.status < 300) {
        const data: any = response?.data ?? null;
        const items = safeExtractArray(data);
        setMessages(items as Message[]);
      } else {
        setMessages(prev => Array.isArray(prev) ? prev : []);
      }
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      setMessages([]);
    }
  };

  // Soporte de deep-link: si viene ?to=<userId>, seleccionar conversación y cargar mensajes
  useEffect(() => {
    const toParam = searchParams.get('to');
    if (toParam) {
      setSelectedConversation(toParam);
      fetchMessages(toParam);
    }
    // No dependemos de conversations aquí: queremos reaccionar sólo al querystring
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const markMessagesAsRead = async (userId: string) => {
    try {
      await axios.patch(`/messages/mark-read/${userId}`);
    } catch (error) {
      console.error('Error al marcar mensajes como leídos:', error);
    }
  };

  const handleMarkAllRead = async () => {
    if (!selectedConversation) return;
    try {
      await markMessagesAsRead(selectedConversation);
      setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
      await fetchConversations();
    } catch (error) {
      console.error('Error al marcar como leídos:', error);
    } finally {
      setShowOptionsMenu(false);
    }
  };

  const toggleMuteConversation = () => {
    if (!selectedConversation) return;
    setMutedConversations(prev => {
      const next = prev.includes(selectedConversation)
        ? prev.filter(id => id !== selectedConversation)
        : [...prev, selectedConversation];
      try {
        localStorage.setItem('mutedConversations', JSON.stringify(next));
      } catch (err) {
        console.error('No se pudo guardar silencio en localStorage:', err);
      }
      return next;
    });
    setShowOptionsMenu(false);
  };

  const goToProfile = () => {
    if (isTrainer && selectedConversationData?.id) {
      navigate(`/trainer/clients/${selectedConversationData.id}`);
    }
    setShowOptionsMenu(false);
  };

  const exportChatAsJson = () => {
    const data = {
      conversationWith: {
        id: selectedConversationData?.id,
        name: selectedConversationData?.name,
        email: selectedConversationData?.email,
      },
      messages,
    };
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const namePart = (selectedConversationData?.name || 'conversation').replace(/\s+/g, '_').toLowerCase();
      a.href = url;
      a.download = `chat_${namePart}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('No se pudo exportar el chat:', err);
    }
    setShowOptionsMenu(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setLoading(true);
    try {
      const response = await axios.post('/messages/send', {
        content: newMessage,
        receiverId: selectedConversation
      });
      if (response.status >= 200 && response.status < 300) {
        const created: Message | null = (response?.data?.data ?? response?.data ?? null) as Message | null;
        if (created) {
          setMessages(prev => [...prev, created]);
        }
        setNewMessage('');
        fetchConversations();
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (message: Message) => {
    setEditingMessageId(message.id);
    setEditingContent(message.content);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent('');
    setEditLoading(false);
  };

  const saveEdit = async (messageId: string) => {
    if (!editingContent.trim()) return;
    try {
      setEditLoading(true);
      const res = await axios.patch(`/messages/${messageId}`, { content: editingContent.trim() });
      if (res.status >= 200 && res.status < 300) {
        const updated = res?.data ?? {};
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: updated.content, updatedAt: updated.updatedAt } : m));
        cancelEdit();
        fetchConversations();
      }
    } catch (error) {
      console.error('Error al editar mensaje:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    const confirmed = window.confirm('¿Eliminar este mensaje?');
    if (!confirmed) return;
    try {
      setDeleteLoadingId(messageId);
      const res = await axios.delete(`/messages/${messageId}`);
      if (res.status >= 200 && res.status < 300) {
        setMessages(prev => prev.filter(m => m.id !== messageId));
        fetchConversations();
      }
    } catch (error) {
      console.error('Error al borrar mensaje:', error);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  const selectedConversationData = (conversations || []).find(c => c.id === selectedConversation);

  const fetchClientsForNewConversation = async () => {
    try {
      setClientsLoading(true);
      const response = await axios.get('/trainer/clients');
      const data: any = response?.data ?? null;
      let items: any[] = safeExtractArray(data);
      if (!items.length) {
        const nested = data?.data?.clients || data?.clients || data?.data?.data?.clients;
        items = Array.isArray(nested) ? nested : [];
      }
      setAvailableClients(items);
      setFilteredClients(items);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      setAvailableClients([]);
      setFilteredClients([]);
    } finally {
      setClientsLoading(false);
    }
  };

  useEffect(() => {
    if (!showNewConversation) return;
    const term = searchTerm.trim();

    // Reiniciar índice activo al cambiar el término
    setActiveIndex(-1);

    if (!term) {
      setFilteredClients([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await axios.get(`/trainer/clients`, {
          params: { search: term, limit: 10, page: 1 },
          signal: controller.signal,
        });
        const data: any = res?.data ?? null;
        let items: any[] = safeExtractArray(data);
        if (!items.length) {
          const nested = data?.data?.clients || data?.clients || data?.data?.data?.clients;
          items = Array.isArray(nested) ? nested : [];
        }
        // Si el backend no soporta búsqueda, filtrar localmente
        if (term && items.length && !Array.isArray(data?.data?.clients) && items.length === availableClients.length) {
          const lc = items.filter((c: any) => {
            const blob = `${c.name || c.fullName || ''} ${c.email || ''}`.toLowerCase();
            return blob.includes(term.toLowerCase());
          });
          setFilteredClients(lc);
        } else {
          setFilteredClients(items);
        }
      } catch (err) {
        // Fallback: filtrar localmente
        const lc = availableClients.filter((c: any) => {
          const blob = `${c.name || c.fullName || ''} ${c.email || ''}`.toLowerCase();
          return blob.includes(term.toLowerCase());
        });
        setFilteredClients(lc);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [searchTerm, showNewConversation, availableClients]);

  useEffect(() => {
    if (!resultsRef.current) return;
    if (activeIndex < 0) return;
    const el = resultsRef.current.querySelector(`[data-index="${activeIndex}"]`);
    if (el && 'scrollIntoView' in el) {
      (el as HTMLElement).scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const highlightText = (text: string, term: string) => {
    if (!term) return text;
    const safe = escapeRegExp(term);
    const regex = new RegExp(`(${safe})`, 'ig');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((p, i) => new RegExp(safe, 'i').test(p) ? (
          <span key={i} className="highlight">{p}</span>
        ) : (
          <span key={i}>{p}</span>
        ))}
      </>
    );
  };

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showNewConversation) return;
    const total = filteredClients.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(total - 1, prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(0, prev - 1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < total) {
        const picked = filteredClients[activeIndex];
        if (picked?.id) {
          setSelectedClientForNew(picked.id);
        }
      }
    } else if (e.key === 'Escape') {
      setShowNewConversation(false);
      setSelectedClientForNew('');
      setActiveIndex(-1);
    }
  };

  return (
    <div className="messaging-system">
      {/* Lista de conversaciones */}
      <div className="conversations-sidebar">
        <div className="conversations-header">
          <div className="header-actions">
            <button
              onClick={() => navigate(isTrainer ? '/trainer-dashboard' : `/client-dashboard/${currentUser?.id || ''}`)}
              className="back-btn"
            >
              <ArrowLeftIcon className="back-icon" />
              Volver al Dashboard
            </button>
            {/* Botón Nueva conversación */}
            {isTrainer && (
              <button
                onClick={() => {
                  const next = !showNewConversation;
                  setShowNewConversation(next);
                  if (next) {
                    setSearchTerm('');
                    setSelectedClientForNew('');
                    fetchClientsForNewConversation();
                  } else {
                    setSelectedClientForNew('');
                    setSearchTerm('');
                    setActiveIndex(-1);
                  }
                }}
                className="new-conversation-btn"
              >
                Nueva conversación
              </button>
            )}
          </div>
          <h2 className="page-title">Mensajes</h2>
        </div>

        {/* Panel de nueva conversación */}
        {showNewConversation && isTrainer && (
          <div className="new-conversation-panel">
            <label className="new-conversation-label">Busca y selecciona un cliente:</label>
            <div className="client-search-control">
              <input
                className="client-search-input"
                type="text"
                placeholder="Escribe nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={onSearchKeyDown}
                disabled={clientsLoading}
              />
              {searchTerm && (
                <button
                  className="clear-search-btn"
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setFilteredClients([]);
                    setActiveIndex(-1);
                    setSelectedClientForNew('');
                  }}
                >
                  ×
                </button>
              )}
            </div>
            {searchTerm.trim() !== '' && (
              <div className="client-search-results" ref={resultsRef}>
                {clientsLoading && (
                  <div className="search-status">Cargando clientes...</div>
                )}
                {isSearching && (
                  <div className="search-status">Buscando...</div>
                )}
                {!isSearching && filteredClients.length === 0 && (
                  <div className="empty-search">Sin resultados</div>
                )}
                {!isSearching && filteredClients.map((client: any, idx: number) => (
                  <div
                    key={client.id}
                    data-index={idx}
                    className={`client-result-item ${selectedClientForNew === client.id ? 'selected' : ''} ${activeIndex === idx ? 'active' : ''}`}
                    onClick={() => setSelectedClientForNew(client.id)}
                    onMouseEnter={() => setActiveIndex(idx)}
                  >
                    <div className="client-result-name">
                      {highlightText(client.name || client.fullName || client.email || '', searchTerm)}
                    </div>
                    {client.email && (
                      <div className="client-result-email">
                        {highlightText(client.email, searchTerm)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="new-conversation-actions">
              <button
                className="start-chat-btn"
                onClick={() => {
                  if (selectedClientForNew) {
                    setSelectedConversation(selectedClientForNew);
                    fetchMessages(selectedClientForNew);
                    setShowNewConversation(false);
                  }
                }}
                disabled={!selectedClientForNew}
              >
                Abrir chat
              </button>
            </div>
          </div>
        )}

        <div className="conversations-list">
          {(conversations || []).length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.7)' }}>
              No hay conversaciones disponibles
            </div>
          ) : (
            (conversations || []).map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`conversation-item ${
                  selectedConversation === conversation.id ? 'active' : ''
                }`}
              >
                <div className="conversation-content">
                  <div className="conversation-info">
                    <h3 className="conversation-name">{conversation.name}</h3>
                    <p className="last-message">
                      {conversation.lastMessage || 'Sin mensajes'}
                    </p>
                  </div>
                  <div className="conversation-meta">
                    {conversation.lastMessageTime && (
                      <p className="message-time">
                        {formatDate(conversation.lastMessageTime)}
                      </p>
                    )}
                    {conversation.unreadCount > 0 && (
                      <span className="unread-badge">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Área de chat */}
      <div className="chat-area">
        {selectedConversation ? (
          <>
            {/* Header del chat */}
            <div className="chat-header">
              <div className="chat-user-info">
                <div>
                  <h3 className="chat-user-name">
                    {selectedConversationData?.name || 'Usuario'}
                  </h3>
                  <p className="chat-user-email">
                    {selectedConversationData?.email || ''}
                  </p>
                  {isMuted && (
                    <span className="chat-muted-badge">Silenciada</span>
                  )}
                </div>
                <button className="chat-options-btn" onClick={() => setShowOptionsMenu(v => !v)}>
                  <EllipsisVerticalIcon className="options-icon" />
                </button>
                {showOptionsMenu && (
                  <div className="chat-options-menu">
                    <button className="chat-options-item" onClick={handleMarkAllRead}>Marcar todos como leídos</button>
                    {isTrainer && (
                      <button className="chat-options-item" onClick={goToProfile}>Ir al perfil del cliente</button>
                    )}
                    <button className="chat-options-item" onClick={toggleMuteConversation}>
                      {isMuted ? 'Desactivar silencio' : 'Silenciar conversación'}
                    </button>
                    <button className="chat-options-item" onClick={exportChatAsJson}>Exportar chat (.json)</button>
                  </div>
                )}
              </div>
            </div>

            {/* Mensajes */}
            <div className="messages-container">
              {(messages || []).map((message) => (
                <div
                  key={message.id}
                  className={`message ${
                    message.senderId === currentUser?.id ? 'sent' : 'received'
                  }`}
                >
                  <div className="message-bubble">
                    {editingMessageId === message.id ? (
                      <div>
                        <input
                          className="message-edit-input"
                          type="text"
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          disabled={editLoading}
                        />
                        <div className="message-edit-actions">
                          <button
                            className="message-edit-save"
                            onClick={() => saveEdit(message.id)}
                            disabled={editLoading || !editingContent.trim()}
                          >
                            Guardar
                          </button>
                          <button
                            className="message-edit-cancel"
                            onClick={cancelEdit}
                            disabled={editLoading}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="message-content">{message.content}</p>
                        <p className="message-time">
                          {formatTime(message.createdAt)}
                        </p>
                      </>
                    )}
                  </div>
                  {message.senderId === currentUser?.id && editingMessageId !== message.id && (
                    <div className="message-actions">
                      <button
                        className="message-action-btn"
                        title="Editar"
                        onClick={() => startEditing(message)}
                      >
                        <PencilSquareIcon className="message-action-icon" />
                      </button>
                      <button
                        className="message-action-btn"
                        title="Borrar"
                        onClick={() => deleteMessage(message.id)}
                        disabled={deleteLoadingId === message.id}
                      >
                        <TrashIcon className="message-action-icon" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input para nuevo mensaje */}
            <div className="message-input-container">
              <div className="message-input-wrapper">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Escribe un mensaje..."
                  className="message-input"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !newMessage.trim()}
                  className="send-btn"
                >
                  <PaperAirplaneIcon className="send-icon" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-chat">
            <div className="empty-chat-content">
              <h3 className="empty-title">
                Selecciona una conversación
              </h3>
              <p className="empty-description">
                Elige un cliente para comenzar a chatear
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingSystem;