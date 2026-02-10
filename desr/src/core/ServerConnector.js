/**
 * DESR Client SDK - Server Connector
 * Connects the client SDK to the server SDK
 */

export class ServerConnector {
    constructor(config = {}) {
        this.serverUrl = config.serverUrl || 'http://localhost:3001';
        this.wsUrl = config.wsUrl || this.serverUrl.replace('http', 'ws');
        this.tableNumber = config.tableNumber || null;
        this.sessionId = null;
        this.ws = null;
        this.listeners = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
    }

    /**
     * Initialize connection to server
     * @returns {Promise<Object>} Session info
     */
    async connect() {
        if (this.tableNumber) {
            await this.startSession();
        }
        this.connectWebSocket();
        return { sessionId: this.sessionId };
    }

    /**
     * Start a table session
     * @returns {Promise<Object>} Session data
     */
    async startSession() {
        try {
            const response = await fetch(`${this.serverUrl}/api/tables/${this.tableNumber}/session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Failed to start session: ${response.statusText}`);
            }

            const session = await response.json();
            this.sessionId = session.sessionId;
            return session;
        } catch (error) {
            console.error('Error starting session:', error);
            throw error;
        }
    }

    /**
     * Connect to WebSocket server
     */
    connectWebSocket() {
        const wsPath = `/ws?type=client&table=${this.tableNumber}`;
        const wsFullUrl = this.wsUrl + wsPath;

        try {
            this.ws = new WebSocket(wsFullUrl);

            this.ws.onopen = () => {
                console.log('WebSocket connected to server');
                this.reconnectAttempts = 0;
                this.emit('connected', { sessionId: this.sessionId });
            };

            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.emit('disconnected', {});
                this.attemptReconnect();
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.emit('error', { error });
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (err) {
                    console.error('Error parsing WebSocket message:', err);
                }
            };
        } catch (error) {
            console.error('Error connecting WebSocket:', error);
        }
    }

    /**
     * Attempt to reconnect WebSocket
     */
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => this.connectWebSocket(), this.reconnectDelay);
        }
    }

    /**
     * Handle incoming WebSocket message
     * @param {Object} data - Message data
     */
    handleMessage(data) {
        switch (data.type) {
            case 'order_status_changed':
                this.emit('orderStatusChanged', {
                    orderId: data.orderId,
                    status: data.status
                });
                break;
            case 'order_ready':
                this.emit('orderReady', {
                    orderId: data.orderId,
                    message: data.message
                });
                break;
            default:
                this.emit('message', data);
        }
    }

    /**
     * Submit order to server
     * @param {Array} items - Order items
     * @param {string} notes - Optional notes
     * @returns {Promise<Object>} Created order
     */
    async submitOrder(items, notes = '') {
        try {
            const response = await fetch(`${this.serverUrl}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tableNumber: this.tableNumber,
                    sessionId: this.sessionId,
                    items,
                    notes
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to submit order');
            }

            return await response.json();
        } catch (error) {
            console.error('Error submitting order:', error);
            throw error;
        }
    }

    /**
     * Get orders for current table
     * @returns {Promise<Array>} Orders
     */
    async getTableOrders() {
        try {
            const response = await fetch(`${this.serverUrl}/api/tables/${this.tableNumber}/orders`);

            if (!response.ok) {
                throw new Error('Failed to get orders');
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting table orders:', error);
            throw error;
        }
    }

    /**
     * Get menu from server
     * @param {string} language - Language code
     * @returns {Promise<Object>} Menu configuration
     */
    async getMenu(language = 'en') {
        try {
            const response = await fetch(`${this.serverUrl}/api/menu/sdk?language=${language}`);

            if (!response.ok) {
                throw new Error('Failed to get menu');
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting menu:', error);
            throw error;
        }
    }

    /**
     * Get order status
     * @param {string} orderId - Order ID
     * @returns {Promise<Object>} Order data
     */
    async getOrderStatus(orderId) {
        try {
            const response = await fetch(`${this.serverUrl}/api/orders/${orderId}`);

            if (!response.ok) {
                throw new Error('Failed to get order status');
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting order status:', error);
            throw error;
        }
    }

    /**
     * Set table number
     * @param {number} tableNumber - Table number
     */
    setTableNumber(tableNumber) {
        this.tableNumber = tableNumber;
    }

    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    off(event, callback) {
        const listeners = this.listeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Emit event
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    emit(event, data) {
        const listeners = this.listeners.get(event);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(data);
                } catch (err) {
                    console.error(`Error in ${event} listener:`, err);
                }
            });
        }
    }

    /**
     * Disconnect from server
     */
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

export default ServerConnector;
