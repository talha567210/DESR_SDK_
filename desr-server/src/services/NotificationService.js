/**
 * DESR Server SDK - Notification Service
 * Handles WebSocket notifications to kitchen and clients
 */

class NotificationService {
    constructor() {
        this.clients = new Map(); // WebSocket clients by type
        this.wss = null;
    }

    /**
     * Initialize with WebSocket server
     * @param {WebSocket.Server} wss - WebSocket server instance
     */
    init(wss) {
        this.wss = wss;

        wss.on('connection', (ws, req) => {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const clientType = url.searchParams.get('type') || 'client';
            const tableNumber = url.searchParams.get('table');

            // Register client
            const clientId = `${clientType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            ws.clientId = clientId;
            ws.clientType = clientType;
            ws.tableNumber = tableNumber ? parseInt(tableNumber) : null;

            if (!this.clients.has(clientType)) {
                this.clients.set(clientType, new Set());
            }
            this.clients.get(clientType).add(ws);

            console.log(`WebSocket client connected: ${clientId} (${clientType})`);

            // Send welcome message
            ws.send(JSON.stringify({
                type: 'connected',
                clientId,
                clientType,
                timestamp: new Date().toISOString()
            }));

            // Handle messages
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleMessage(ws, data);
                } catch (err) {
                    console.error('Invalid WebSocket message:', err);
                }
            });

            // Handle disconnect
            ws.on('close', () => {
                console.log(`WebSocket client disconnected: ${clientId}`);
                if (this.clients.has(clientType)) {
                    this.clients.get(clientType).delete(ws);
                }
            });

            ws.on('error', (err) => {
                console.error(`WebSocket error for ${clientId}:`, err);
            });
        });
    }

    /**
     * Handle incoming WebSocket message
     * @param {WebSocket} ws - WebSocket connection
     * @param {Object} data - Message data
     */
    handleMessage(ws, data) {
        switch (data.type) {
            case 'ping':
                ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
                break;
            case 'subscribe':
                // Handle subscription to specific events
                ws.subscriptions = data.events || [];
                break;
            default:
                console.log(`Unknown message type: ${data.type}`);
        }
    }

    /**
     * Notify kitchen of new order
     * @param {Object} order - Order data
     */
    notifyNewOrder(order) {
        this.broadcast('kitchen', {
            type: 'new_order',
            order,
            timestamp: new Date().toISOString()
        });

        console.log(`Kitchen notified of new order: ${order.id}`);
    }

    /**
     * Notify of order status change
     * @param {Object} order - Updated order
     */
    notifyOrderStatusChange(order) {
        // Notify kitchen
        this.broadcast('kitchen', {
            type: 'order_status_changed',
            order,
            timestamp: new Date().toISOString()
        });

        // Notify client at the table
        this.broadcastToTable(order.table_number, {
            type: 'order_status_changed',
            orderId: order.id,
            status: order.status,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Notify order ready for pickup
     * @param {Object} order - Order data
     */
    notifyOrderReady(order) {
        // Notify kitchen
        this.broadcast('kitchen', {
            type: 'order_ready',
            order,
            timestamp: new Date().toISOString()
        });

        // Notify client at the table
        this.broadcastToTable(order.table_number, {
            type: 'order_ready',
            orderId: order.id,
            message: 'Your order is ready!',
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Broadcast message to all clients of a type
     * @param {string} clientType - Client type (kitchen, client)
     * @param {Object} data - Data to send
     */
    broadcast(clientType, data) {
        const clients = this.clients.get(clientType);
        if (!clients) return;

        const message = JSON.stringify(data);
        clients.forEach(ws => {
            if (ws.readyState === 1) { // WebSocket.OPEN
                ws.send(message);
            }
        });
    }

    /**
     * Broadcast to clients at a specific table
     * @param {number} tableNumber - Table number
     * @param {Object} data - Data to send
     */
    broadcastToTable(tableNumber, data) {
        const clients = this.clients.get('client');
        if (!clients) return;

        const message = JSON.stringify(data);
        clients.forEach(ws => {
            if (ws.readyState === 1 && ws.tableNumber === tableNumber) {
                ws.send(message);
            }
        });
    }

    /**
     * Broadcast to all connected clients
     * @param {Object} data - Data to send
     */
    broadcastAll(data) {
        const message = JSON.stringify(data);
        this.clients.forEach((clients) => {
            clients.forEach(ws => {
                if (ws.readyState === 1) {
                    ws.send(message);
                }
            });
        });
    }

    /**
     * Get connected client counts
     * @returns {Object} Client counts by type
     */
    getClientCounts() {
        const counts = {};
        this.clients.forEach((clients, type) => {
            counts[type] = clients.size;
        });
        return counts;
    }
}

module.exports = new NotificationService();
