import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data.data);
      }
    } catch (error) {
      console.error('Error al obtener conversaciones:', error);
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
        const data = await response.json();
        setMessages(data.data);
        markMessagesAsRead(userId);
      }
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
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
        const data = await response.json();
        setMessages(prev => [...prev, data.data]);
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

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Lista de conversaciones */}
      <div className="w-1/3 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/trainer/clients')}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver a Clientes
            </button>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mt-2">Mensajes</h2>
        </div>

        <div className="overflow-y-auto h-full">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{conversation.name}</h3>
                  <p className="text-sm text-gray-500 truncate">
                    {conversation.lastMessage || 'Sin mensajes'}
                  </p>
                </div>
                <div className="text-right">
                  {conversation.lastMessageTime && (
                    <p className="text-xs text-gray-400">
                      {formatDate(conversation.lastMessageTime)}
                    </p>
                  )}
                  {conversation.unreadCount > 0 && (
                    <span className="inline-block bg-blue-500 text-white text-xs rounded-full px-2 py-1 mt-1">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Área de chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header del chat */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedConversationData?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedConversationData?.email}
                  </p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === currentUser?.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.senderId === currentUser?.id
                          ? 'text-blue-100'
                          : 'text-gray-500'
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input para nuevo mensaje */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !newMessage.trim()}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecciona una conversación
              </h3>
              <p className="text-gray-500">
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