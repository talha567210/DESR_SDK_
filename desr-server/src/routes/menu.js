/**
 * DESR Server SDK - Menu API Routes
 */

const express = require('express');
const router = express.Router();
const menuService = require('../services/MenuService');

/**
 * GET /api/menu - Get all menu items
 */
router.get('/', (req, res) => {
    try {
        const { all } = req.query;
        const items = menuService.getAllItems(all !== 'true');
        res.json(items);
    } catch (error) {
        console.error('Error getting menu:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

/**
 * GET /api/menu/sdk - Get menu formatted for SDK integration
 */
router.get('/sdk', (req, res) => {
    try {
        const { language } = req.query;
        const sdkConfig = menuService.getMenuForSDK(language || 'en');
        res.json(sdkConfig);
    } catch (error) {
        console.error('Error getting SDK menu:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

/**
 * GET /api/menu/category/:category - Get items by category
 */
router.get('/category/:category', (req, res) => {
    try {
        const items = menuService.getItemsByCategory(req.params.category);
        res.json(items);
    } catch (error) {
        console.error('Error getting menu by category:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

/**
 * GET /api/menu/:id - Get menu item by ID
 */
router.get('/:id', (req, res) => {
    try {
        const item = menuService.getItemById(req.params.id);

        if (!item) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Menu item not found'
            });
        }

        res.json(item);
    } catch (error) {
        console.error('Error getting menu item:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

/**
 * POST /api/menu - Create new menu item
 */
router.post('/', (req, res) => {
    try {
        const { modelKey, nameEn, price } = req.body;

        if (!modelKey || !nameEn || price === undefined) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'modelKey, nameEn, and price are required'
            });
        }

        const item = menuService.createItem(req.body);
        res.status(201).json(item);
    } catch (error) {
        console.error('Error creating menu item:', error);

        if (error.message.includes('UNIQUE constraint')) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'A menu item with this modelKey already exists'
            });
        }

        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

/**
 * PUT /api/menu/:id - Update menu item
 */
router.put('/:id', (req, res) => {
    try {
        const item = menuService.updateItem(req.params.id, req.body);

        if (!item) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Menu item not found'
            });
        }

        res.json(item);
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

/**
 * PATCH /api/menu/:id/availability - Toggle item availability
 */
router.patch('/:id/availability', (req, res) => {
    try {
        const item = menuService.toggleAvailability(req.params.id);

        if (!item) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Menu item not found'
            });
        }

        res.json(item);
    } catch (error) {
        console.error('Error toggling availability:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

/**
 * DELETE /api/menu/:id - Delete menu item
 */
router.delete('/:id', (req, res) => {
    try {
        const success = menuService.deleteItem(req.params.id);

        if (!success) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Menu item not found'
            });
        }

        res.json({ success: true, message: 'Menu item deleted' });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

module.exports = router;
