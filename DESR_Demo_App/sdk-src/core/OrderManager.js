/**
 * Order Manager - Handles order tracking and management
 */
export class OrderManager {
    constructor() {
        this.orders = [];
        this.listeners = [];
    }

    /**
     * Add an order
     * @param {Object} orderData - Order data (modelKey, name, price, etc.)
     * @returns {Object} The added order with timestamp and ID
     */
    addOrder(orderData) {
        const order = {
            id: this.generateOrderId(),
            ...orderData,
            timestamp: new Date().toISOString(),
            time: new Date().toLocaleTimeString()
        };

        this.orders.push(order);
        this.notifyListeners('add', order);
        return order;
    }

    /**
     * Remove an order by ID
     * @param {string} orderId - Order ID
     * @returns {boolean} Success status
     */
    removeOrder(orderId) {
        const index = this.orders.findIndex(order => order.id === orderId);
        if (index !== -1) {
            const removed = this.orders.splice(index, 1)[0];
            this.notifyListeners('remove', removed);
            return true;
        }
        return false;
    }

    /**
     * Clear all orders
     */
    clearOrders() {
        const clearedOrders = [...this.orders];
        this.orders = [];
        this.notifyListeners('clear', clearedOrders);
    }

    /**
     * Get all orders
     * @returns {Array} Array of order objects
     */
    getOrders() {
        return [...this.orders];
    }

    /**
     * Get total amount of all orders
     * @returns {number} Total amount
     */
    getTotalAmount() {
        return this.orders.reduce((total, order) => {
            // Extract numeric value from price string (e.g., "¥1,000" -> 1000)
            const priceValue = parseFloat(order.price.replace(/[^0-9.-]+/g, ''));
            return total + (isNaN(priceValue) ? 0 : priceValue);
        }, 0);
    }

    /**
     * Get order count
     * @returns {number} Number of orders
     */
    getOrderCount() {
        return this.orders.length;
    }

    /**
     * Generate unique order ID
     * @private
     */
    generateOrderId() {
        return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Add an order change listener
     * @param {Function} callback - Callback function (action, data)
     */
    onOrderChange(callback) {
        this.listeners.push(callback);
    }

    /**
     * Notify all listeners of order changes
     * @private
     */
    notifyListeners(action, data) {
        this.listeners.forEach(callback => {
            try {
                callback(action, data);
            } catch (error) {
                console.error('Error in order change listener:', error);
            }
        });
    }

    /**
     * Export orders as JSON
     * @returns {string} JSON string of orders
     */
    exportOrders() {
        return JSON.stringify({
            orders: this.orders,
            total: this.getTotalAmount(),
            exportDate: new Date().toISOString()
        }, null, 2);
    }
}

export default OrderManager;
