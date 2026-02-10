/**
 * DESR Server SDK - Main Server
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { WebSocketServer } = require('ws');

const config = require('./config');
const { initDatabase } = require('./database/db');
const notificationService = require('./services/NotificationService');

// Import routes
const ordersRouter = require('./routes/orders');
const menuRouter = require('./routes/menu');
const tablesRouter = require('./routes/tables');

// Initialize Express app
const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// Serve static files for kitchen dashboard
app.use('/kitchen', express.static(path.join(__dirname, '../kitchen-dashboard')));

// API Routes
app.use('/api/orders', ordersRouter);
app.use('/api/menu', menuRouter);
app.use('/api/tables', tablesRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        websocketClients: notificationService.getClientCounts()
    });
});

// API documentation endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'DESR Server SDK',
        version: '1.0.0',
        endpoints: {
            orders: {
                'POST /api/orders': 'Create new order',
                'GET /api/orders': 'List orders (filters: tableNumber, status, sessionId, limit)',
                'GET /api/orders/active': 'Get active orders',
                'GET /api/orders/stats': 'Get order statistics',
                'GET /api/orders/:id': 'Get order by ID',
                'PATCH /api/orders/:id/status': 'Update order status',
                'DELETE /api/orders/:id': 'Cancel order'
            },
            menu: {
                'GET /api/menu': 'Get all menu items',
                'GET /api/menu/sdk': 'Get menu for SDK integration',
                'GET /api/menu/:id': 'Get menu item by ID',
                'POST /api/menu': 'Create menu item',
                'PUT /api/menu/:id': 'Update menu item',
                'DELETE /api/menu/:id': 'Delete menu item'
            },
            tables: {
                'GET /api/tables': 'Get all tables',
                'GET /api/tables/:number': 'Get table status',
                'POST /api/tables/:number/session': 'Start table session',
                'DELETE /api/tables/:number/session': 'End table session',
                'GET /api/tables/:number/orders': 'Get table orders'
            },
            websocket: {
                'ws://host/ws?type=kitchen': 'Kitchen display connection',
                'ws://host/ws?type=client&table=N': 'Client app connection'
            }
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.url}`
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

/**
 * Start the server
 */
function startServer() {
    // Initialize database
    initDatabase();

    // Create HTTP server
    const server = http.createServer(app);

    // Create WebSocket server
    const wss = new WebSocketServer({
        server,
        path: '/ws'
    });

    // Initialize notification service with WebSocket
    notificationService.init(wss);

    // Start listening
    server.listen(config.port, () => {
        console.log('====================================');
        console.log('  DESR Server SDK');
        console.log('====================================');
        console.log(`  API:       http://localhost:${config.port}/api`);
        console.log(`  Kitchen:   http://localhost:${config.port}/kitchen`);
        console.log(`  WebSocket: ws://localhost:${config.port}/ws`);
        console.log('====================================');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('Shutting down...');
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    });

    return server;
}

// Start if run directly
if (require.main === module) {
    startServer();
}

module.exports = { app, startServer };
