/**
 * DESR Server SDK - Orders API Routes
 */

const express = require('express');
const router = express.Router();
const orderService = require('../services/OrderService');
const notificationService = require('../services/NotificationService');

/**
 * POST /api/orders - Create a new order
 */
router.post('/', (req, res) => {
    try {
        const { tableNumber, items, sessionId, notes } = req.body;

        if (!tableNumber || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'tableNumber and items array are required'
            });
        }

        const order = orderService.createOrder({
            tableNumber,
            items,
            sessionId,
            notes
        });

        // Notify kitchen
        notificationService.notifyNewOrder(order);

        res.status(201).json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

/**
 * GET /api/orders - Get orders with optional filters
 */
router.get('/', (req, res) => {
    try {
        const { tableNumber, status, sessionId, limit } = req.query;

        const filters = {};
        if (tableNumber) filters.tableNumber = parseInt(tableNumber);
        if (status) filters.status = status;
        if (sessionId) filters.sessionId = sessionId;
        if (limit) filters.limit = parseInt(limit);

        const orders = orderService.getOrders(filters);
        res.json(orders);
    } catch (error) {
        console.error('Error getting orders:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

/**
 * GET /api/orders/active - Get active orders (for kitchen)
 */
router.get('/active', (req, res) => {
    try {
        const orders = orderService.getActiveOrders();
        res.json(orders);
    } catch (error) {
        console.error('Error getting active orders:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

/**
 * GET /api/orders/stats - Get order statistics
 */
router.get('/stats', (req, res) => {
    try {
        const stats = orderService.getStatistics();
        res.json(stats);
    } catch (error) {
        console.error('Error getting statistics:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

/**
 * GET /api/orders/:id - Get order by ID
 */
router.get('/:id', (req, res) => {
    try {
        const order = orderService.getOrderById(req.params.id);

        if (!order) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Order not found'
            });
        }

        res.json(order);
    } catch (error) {
        console.error('Error getting order:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

/**
 * PATCH /api/orders/:id/status - Update order status
 */
router.patch('/:id/status', (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'status is required'
            });
        }

        const order = orderService.updateOrderStatus(req.params.id, status);

        if (!order) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Order not found'
            });
        }

        // Notify of status change
        notificationService.notifyOrderStatusChange(order);

        // Special notification if order is ready
        if (status === 'ready') {
            notificationService.notifyOrderReady(order);
        }

        res.json(order);
    } catch (error) {
        console.error('Error updating order status:', error);

        if (error.message.includes('Invalid status')) {
            return res.status(400).json({
                error: 'Bad Request',
                message: error.message
            });
        }

        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

/**
 * DELETE /api/orders/:id - Cancel/delete order
 */
router.delete('/:id', (req, res) => {
    try {
        const success = orderService.cancelOrder(req.params.id);

        if (!success) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Order not found'
            });
        }

        res.json({ success: true, message: 'Order cancelled' });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

module.exports = router;
