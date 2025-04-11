import axiosWithAuth from '../../utils/axioswithAuth';

// 🔑 Generar Public ID
export const generatePublicIdService = async () => {
    const { data } = await axiosWithAuth.post('/chat/public-id');
    return data.publicId;
};

// 📤 Enviar mensaje
export const sendMessageService = async (messageData) => {
    const formData = new FormData();

    Object.keys(messageData).forEach((key) => {
        if (key === 'attachment' && messageData[key]) {
            formData.append('attachment', messageData[key]);
        } else {
            formData.append(key, messageData[key]);
        }
    });

    const { data } = await axiosWithAuth.post('/chat/send', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return data;
};

// 📬 Obtener mensajes por OrderId (usuarios autenticados)
export const getMessagesByOrderService = async (orderId) => {
    if (typeof orderId === 'object' && orderId.publicId) {
        const { data } = await axiosWithAuth.get(`/chat/order/null`, {
            params: {
                publicId: orderId.publicId
            }
        });
        return data;
    }
    if (typeof orderId === 'string') {
        const { data } = await axiosWithAuth.get(`/chat/order/${orderId}`);
        return data;
    }
    throw new Error('Se requiere un ID de pedido o ID público');
};

// 📬 Obtener mensajes públicos por PublicId (usuarios públicos)
export const getPublicMessagesByPublicIdService = async (publicId) => {
    const { data } = await axiosWithAuth.get(`/chat/public/conversation/${publicId}`);
    return data;
};

// 📬 Obtener mensajes públicos por OrderId
export const getPublicMessagesByOrderService = async (orderId) => {
    const { data } = await axiosWithAuth.get(`/chat/public/${orderId}`);
    return data;
};

// ✅ Marcar todos los mensajes de una orden como leídos
export const markMessagesAsReadService = async (orderId) => {
    const { data } = await axiosWithAuth.post(`/chat/order/${orderId}/mark-read`);
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
    const { data } = await axiosWithAuth.get('/chat/conversations');
    return data;
};

// 💬 Obtener conversaciones autenticadas (admin)
export const getAuthenticatedConversationsService = async () => {
    const { data } = await axiosWithAuth.get('/chat/conversations/authenticated');
    return data;
};

// 💬 Obtener conversaciones públicas (admin)
export const getPublicConversationsService = async () => {
    const { data } = await axiosWithAuth.get('/chat/conversations/public');
    return data;
};

// 📈 Registrar una visita
export const trackVisitService = async (visitData) => {
    const { data } = await axiosWithAuth.post('/chat/track-visit', visitData);
    return data;
};

// Obtener mensajes directos entre usuarios
export const getDirectMessagesService = async (userId) => {
    const { data } = await axiosWithAuth.get(`/chat/direct/${userId}`);
    return data;
};

// Actualizar el estado de una conversación
export const updateConversationStatusService = async ({ conversationId, status }) => {
    const { data } = await axiosWithAuth.put(`/chat/conversations/${conversationId}/status`, { status });
    return data;
};
