import axiosWithAuth from '../../utils/axioswithAuth';

// 🔑 Generar Public ID
export const generatePublicIdService = async () => {
    const { data } = await axiosWithAuth.post('/chat/public-id');
    return data.publicId;
};

// 📤 Enviar mensaje
export const sendMessageService = async (messageData) => {
    try {
        // Si messageData ya es un FormData, usarlo directamente
        const formData = messageData instanceof FormData ?
            messageData :
            Object.entries(messageData).reduce((fd, [key, value]) => {
                if (value !== null && value !== undefined) {
                    if (key === 'attachment' && value instanceof File) {
                        fd.append('attachment', value);
                    } else {
                        fd.append(key, value);
                    }
                }
                return fd;
            }, new FormData());

        // Obtener el token de las cookies
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('jwt='))
            ?.split('=')[1];

        const headers = {
            'Content-Type': 'multipart/form-data',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const { data } = await axiosWithAuth.post('/chat/send', formData, { headers });
        return data;
    } catch (error) {
        console.error('Error en sendMessageService:', error);
        throw error;
    }
};

// 📬 Obtener mensajes por OrderId (usuarios autenticados)
export const getMessagesByOrderService = async (orderId) => {
    const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('jwt='))
        ?.split('=')[1];

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    if (typeof orderId === 'object' && orderId.publicId) {
        console.log('📬 Obteniendo mensajes públicos para:', orderId.publicId);
        try {
            const { data } = await axiosWithAuth.get(`/chat/public/conversation/${orderId.publicId}`, { headers });
            return data;
        } catch (error) {
            console.error('Error obteniendo mensajes públicos:', error);
            throw error;
        }
    }
    if (typeof orderId === 'string') {
        const { data } = await axiosWithAuth.get(`/chat/order/${orderId}`, { headers });
        return data;
    }
    throw new Error('Se requiere un ID de pedido o ID público');
};

// Función helper para obtener headers con token
const getAuthHeaders = () => {
    const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('jwt='))
        ?.split('=')[1];

    return token ? { Authorization: `Bearer ${token}` } : {};
};

// 📬 Obtener mensajes públicos por PublicId
export const getPublicMessagesByPublicIdService = async (publicId) => {
    const { data } = await axiosWithAuth.get(`/chat/public/conversation/${publicId}`, {
        headers: getAuthHeaders()
    });
    return data;
};

// 📬 Obtener mensajes públicos por OrderId
export const getPublicMessagesByOrderService = async (orderId) => {
    const { data } = await axiosWithAuth.get(`/chat/public/${orderId}`, {
        headers: getAuthHeaders()
    });
    return data;
};

// ✅ Marcar mensajes como leídos
export const markMessagesAsReadService = async (orderId) => {
    const { data } = await axiosWithAuth.post(`/chat/order/${orderId}/mark-read`, {}, {
        headers: getAuthHeaders()
    });
    return data;
};

// 📋 Obtener todos los mensajes (admin)
export const getMessagesService = async () => {
    const { data } = await axiosWithAuth.get('/chat/messages');
    return data;
};

// 🔍 Buscar mensajes
export const searchMessagesService = async (query) => {
    const { data } = await axiosWithAuth.get(`/chat/messages/search?query=${query}`);
    return data;
};

// 🔍 Obtener mensaje por ID
export const getMessageByIdService = async (id) => {
    const { data } = await axiosWithAuth.get(`/chat/messages/${id}`);
    return data;
};

// 🔄 Actualizar mensaje
export const updateMessageService = async (id, updateData) => {
    const { data } = await axiosWithAuth.put(`/chat/messages/${id}`, updateData);
    return data;
};

// ❌ Eliminar mensaje (admin)
export const deleteMessageService = async (id) => {
    const { data } = await axiosWithAuth.delete(`/chat/messages/${id}`);
    return data;
};

// ✅ Marcar un solo mensaje como leído
export const markSingleMessageAsReadService = async (messageId) => {
    const { data } = await axiosWithAuth.post(`/chat/${messageId}/read`);
    return data;
};

// 💬 Obtener todas las conversaciones (admin)
export const getConversationsService = async () => {
    const { data } = await axiosWithAuth.get('/chat/conversations', {
        headers: getAuthHeaders()
    });
    return data;
};

// 💬 Obtener conversaciones autenticadas
export const getAuthenticatedConversationsService = async () => {
    const { data } = await axiosWithAuth.get('/chat/conversations/authenticated', {
        headers: getAuthHeaders()
    });
    return data;
};

// 💬 Obtener conversaciones públicas
export const getPublicConversationsService = async () => {
    const { data } = await axiosWithAuth.get('/chat/conversations/public', {
        headers: getAuthHeaders()
    });
    return data;
};

// 📈 Registrar visita
export const trackVisitService = async (visitData) => {
    const { data } = await axiosWithAuth.post('/chat/track-visit', visitData, {
        headers: getAuthHeaders()
    });
    return data;
};

// Obtener mensajes directos
export const getDirectMessagesService = async (userId) => {
    const { data } = await axiosWithAuth.get(`/chat/direct/${userId}`, {
        headers: getAuthHeaders()
    });
    return data;
};

// Actualizar estado de conversación
export const updateConversationStatusService = async ({ conversationId, status }) => {
    const { data } = await axiosWithAuth.put(`/chat/conversations/${conversationId}/status`,
        { status },
        { headers: getAuthHeaders() }
    );
    return data;
};

// Eliminar conversación completa
export const deleteConversationService = async (conversationId) => {
    try {
        console.log('🔄 Llamando a deleteConversationService para ID:', conversationId);
        const headers = getAuthHeaders();
        console.log('🔐 Headers de autenticación:', headers);

        // Construir la URL con verificación
        const url = `/chat/conversations/${encodeURIComponent(conversationId)}`;
        console.log('🌍 URL a la que se envía la petición:', url);

        // Verificar que la petición sea correcta
        console.log('⚡ Realizando petición DELETE a:', url);

        const { data } = await axiosWithAuth.delete(url, {
            headers
        });

        console.log('✅ Respuesta del servidor para eliminación:', data);
        return data;
    } catch (error) {
        console.error('❌ Error en deleteConversationService:', error);
        console.log('📋 Error detallado:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            url: error.config?.url
        });
        throw error;
    }
};
