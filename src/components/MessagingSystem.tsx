import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, MoreVertical } from 'lucide-react';
import { ArrowLeftIcon, PaperAirplaneIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import './MessagingSystem.css';

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
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        let data: any = null;
        try {
          data = await response.json();
        } catch (e) {
          // Si no hay cuerpo (p.ej. 204), evitar crash
          data = null;
        }
        const items = safeExtractArray(data);
        setConversations(items as Conversation[]);
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
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/messages/conversation/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        let data: any = null;
        try {
          data = await response.json();
        } catch (e) {
          data = null;
        }
        const items = safeExtractArray(data);
        setMessages(items as Message[]);
        markMessagesAsRead(userId);
      } else {
        setMessages(prev => Array.isArray(prev) ? prev : []);
      }
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      setMessages([]);
    }
  };

  const markMessagesAsRead = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/messages/mark-read/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error al marcar mensajes como leídos:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newMessage,
          receiverId: selectedConversation
        })
      });

      if (response.ok) {
        let data: any = null;
        try {
          data = await response.json();
        } catch (e) {
          data = null;
        }
        // Algunos backends devuelven { data: objeto } o directamente objeto
        const created = (data?.data ?? data) as Message | null;
        if (created) {
          setMessages(prev => [...prev, created]);
        }
        setNewMessage('');
        fetchConversations(); // Actualizar lista de conversaciones
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="messaging-system">
      {/* Lista de conversaciones */}
      <div className="conversations-sidebar">
        <div className="conversations-header">
          <div className="header-actions">
            <button
              onClick={() => navigate('/trainer/clients')}
              className="back-btn"
            >
              <ArrowLeftIcon className="back-icon" />
              Volver a Clientes
            </button>
          </div>
          <h2 className="page-title">Mensajes</h2>
        </div>

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
                </div>
                <button className="chat-options-btn">
                  <EllipsisVerticalIcon className="options-icon" />
                </button>
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
                    <p className="message-content">{message.content}</p>
                    <p className="message-time">
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
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