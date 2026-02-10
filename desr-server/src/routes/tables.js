/**
 * DESR Server SDK - Tables API Routes
 */

const express = require('express');
const router = express.Router();
const tableService = require('../services/TableService');
const orderService = require('../services/OrderService');

/**
 * GET /api/tables - Get all tables
 */
router.get('/', (req, res) => {
    try {
        const tables = tableService.getAllTables();
        res.json(tables);
    } catch (error) {
        console.error('Error getting tables:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

/**
 * GET /api/tables/occupied - Get occupied tables
 */
router.get('/occupied', (req, res) => {
    try {
        const tables = tableService.getOccupiedTables();
        res.json(tables);
    } catch (error) {
        console.error('Error getting occupied tables:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

/**
 * GET /api/tables/:number - Get table by number
 */
router.get('/:number', (req, res) => {
    try {
        const tableNumber = parseInt(req.params.number);
        const status = tableService.getTableStatus(tableNumber);

        if (!status) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Table not found'
            });
        }

        res.json(status);
    } catch (error) {
        console.error('Error getting table:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

/**
 * POST /api/tables/:number/session - Start a new session
 */
router.post('/:number/session', (req, res) => {
    try {
        const tableNumber = parseInt(req.params.number);

        if (tableNumber < 1 || tableNumber > 100) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid table number'
            });
        }

        const session = tableService.startSession(tableNumber);
        res.status(201).json(session);
    } catch (error) {
        console.error('Error starting session:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

/**
 * DELETE /api/tables/:number/session - End session
 */
router.delete('/:number/session', (req, res) => {
    try {
        const tableNumber = parseInt(req.params.number);
        const success = tableService.endSession(tableNumber);

        if (!success) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Table not found'
            });
        }

        res.json({ success: true, message: 'Session ended' });
    } catch (error) {
        console.error('Error ending session:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

/**
 * GET /api/tables/:number/orders - Get orders for table
 */
router.get('/:number/orders', (req, res) => {
    try {
        const tableNumber = parseInt(req.params.number);
        const orders = orderService.getOrdersByTable(tableNumber);
        res.json(orders);
    } catch (error) {
        console.error('Error getting table orders:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

/**
 * POST /api/tables/:number/validate - Validate session
 */
router.post('/:number/validate', (req, res) => {
    try {
        const tableNumber = parseInt(req.params.number);
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'sessionId is required'
            });
        }

        const isValid = tableService.validateSession(tableNumber, sessionId);
        res.json({ valid: isValid });
    } catch (error) {
        console.error('Error validating session:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

module.exports = router;
