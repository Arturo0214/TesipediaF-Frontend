import Quote from '../../../Backend/models/Quote.js';
import Order from '../../../Backend/models/Order.js';
import Notification from '../../../Backend/models/Notification.js';
import { processPayment } from './paymentService.js';

const SUPER_ADMIN_ID = process.env.SUPER_ADMIN_ID;

// Crear una nueva orden
export const createOrder = async (quoteId, userId, paymentDetails) => {
    try {
        // Buscar la cotización
        const quote = await Quote.findById(quoteId);
        if (!quote) {
            throw new Error('Cotización no encontrada');
        }

        // Verificar que la cotización no esté ya convertida en orden
        if (quote.status === 'completed') {
            throw new Error('Esta cotización ya ha sido convertida en orden');
        }

        // Procesar el pago
        const paymentResult = await processPayment({
            amount: quote.estimatedPrice,
            paymentMethod: paymentDetails.paymentMethod,
            description: `Orden para cotización ${quoteId}`,
            metadata: {
                quoteId,
                userId
            }
        });

        // Crear la orden
        const order = await Order.create({
            quote: quoteId,
            user: userId,
            amount: quote.estimatedPrice,
            paymentDetails: paymentResult,
            status: 'pending',
            estimatedDeliveryDate: quote.dueDate
        });

        // Actualizar el estado de la cotización
        quote.status = 'completed';
        await quote.save();

        // Crear notificación para el administrador
        await Notification.create({
            user: SUPER_ADMIN_ID,
            type: 'orden',
            message: `🛍️ Nueva orden creada (${quote.studyArea})`,
            data: {
                orderId: order._id,
                quoteId: quote._id,
                userId
            }
        });

        return order;
    } catch (error) {
        console.error('Error al crear orden:', error);
        throw error;
    }
};

// Obtener órdenes de un usuario
export const getUserOrders = async (userId) => {
    try {
        const orders = await Order.find({ user: userId })
            .populate('quote', 'taskTitle studyArea educationLevel pages dueDate')
            .sort({ createdAt: -1 });
        return orders;
    } catch (error) {
        console.error('Error al obtener órdenes del usuario:', error);
        throw error;
    }
};

// Obtener una orden específica
export const getOrderById = async (orderId, userId) => {
    try {
        const order = await Order.findOne({ _id: orderId, user: userId })
            .populate('quote', 'taskTitle studyArea educationLevel pages dueDate requirements');

        if (!order) {
            throw new Error('Orden no encontrada');
        }

        return order;
    } catch (error) {
        console.error('Error al obtener orden:', error);
        throw error;
    }
};

// Actualizar estado de una orden (admin)
export const updateOrderStatus = async (orderId, newStatus) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Orden no encontrada');
        }

        // Validar transición de estado
        const validTransitions = {
            pending: ['in_progress', 'cancelled'],
            in_progress: ['completed', 'cancelled'],
            completed: [],
            cancelled: []
        };

        if (!validTransitions[order.status].includes(newStatus)) {
            throw new Error('Transición de estado no válida');
        }

        order.status = newStatus;
        await order.save();

        // Crear notificación para el usuario
        await Notification.create({
            user: order.user,
            type: 'orden',
            message: `🔄 Estado de tu orden actualizado a: ${newStatus}`,
            data: {
                orderId: order._id,
                newStatus
            }
        });

        return order;
    } catch (error) {
        console.error('Error al actualizar estado de orden:', error);
        throw error;
    }
};

// Obtener todas las órdenes (admin)
export const getAllOrders = async (filters = {}) => {
    try {
        const query = {};

        // Aplicar filtros si existen
        if (filters.status) {
            query.status = filters.status;
        }
        if (filters.dateRange) {
            query.createdAt = {
                $gte: filters.dateRange.start,
                $lte: filters.dateRange.end
            };
        }

        const orders = await Order.find(query)
            .populate('user', 'name email')
            .populate('quote', 'taskTitle studyArea educationLevel pages dueDate')
            .sort({ createdAt: -1 });

        return orders;
    } catch (error) {
        console.error('Error al obtener todas las órdenes:', error);
        throw error;
    }
};

// Cancelar orden
export const cancelOrder = async (orderId, userId, reason) => {
    try {
        const order = await Order.findOne({ _id: orderId, user: userId });
        if (!order) {
            throw new Error('Orden no encontrada');
        }

        if (order.status === 'completed') {
            throw new Error('No se puede cancelar una orden completada');
        }

        if (order.status === 'cancelled') {
            throw new Error('La orden ya está cancelada');
        }

        order.status = 'cancelled';
        order.cancellationReason = reason;
        await order.save();

        // Notificar al administrador
        await Notification.create({
            user: SUPER_ADMIN_ID,
            type: 'orden',
            message: `❌ Orden cancelada por el usuario`,
            data: {
                orderId: order._id,
                userId,
                reason
            }
        });

        return order;
    } catch (error) {
        console.error('Error al cancelar orden:', error);
        throw error;
    }
}; 