/**
 * DESR Server SDK - Order Service
 * Business logic for order management
 */

const { v4: uuidv4 } = require('uuid');
const { query, queryOne, execute } = require('../database/db');
const config = require('../config');

class OrderService {
    /**
     * Create a new order
     */
    createOrder(orderData) {
        const id = `order_${uuidv4()}`;
        const totalAmount = this.calculateTotal(orderData.items);

        execute(`
            INSERT INTO orders (id, table_number, session_id, items, status, total_amount, notes)
            VALUES (?, ?, ?, ?, 'pending', ?, ?)
        `, [id, orderData.tableNumber, orderData.sessionId || null, JSON.stringify(orderData.items), totalAmount, orderData.notes || null]);

        return this.getOrderById(id);
    }

    /**
     * Get order by ID
     */
    getOrderById(id) {
        const order = queryOne('SELECT * FROM orders WHERE id = ?', [id]);
        if (order) {
            order.items = JSON.parse(order.items);
        }
        return order;
    }

    /**
     * Get orders with optional filters
     */
    getOrders(filters = {}) {
        let sql = 'SELECT * FROM orders WHERE 1=1';
        const params = [];

        if (filters.tableNumber) {
            sql += ' AND table_number = ?';
            params.push(filters.tableNumber);
        }
        if (filters.status) {
            sql += ' AND status = ?';
            params.push(filters.status);
        }
        if (filters.sessionId) {
            sql += ' AND session_id = ?';
            params.push(filters.sessionId);
        }

        sql += ' ORDER BY created_at DESC';

        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(filters.limit);
        }

        const orders = query(sql, params);
        return orders.map(order => ({
            ...order,
            items: JSON.parse(order.items)
        }));
    }

    /**
     * Get orders by table number
     */
    getOrdersByTable(tableNumber) {
        return this.getOrders({ tableNumber });
    }

    /**
     * Get active orders
     */
    getActiveOrders() {
        const orders = query(`
            SELECT * FROM orders 
            WHERE status IN ('pending', 'confirmed', 'preparing') 
            ORDER BY created_at ASC
        `);
        return orders.map(order => ({
            ...order,
            items: JSON.parse(order.items)
        }));
    }

    /**
     * Update order status
     */
    updateOrderStatus(id, status) {
        if (!config.orderStatuses.includes(status)) {
            throw new Error(`Invalid status: ${status}. Valid: ${config.orderStatuses.join(', ')}`);
        }

        const result = execute(`
            UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?
        `, [status, id]);

        if (result.changes === 0) return null;
        return this.getOrderById(id);
    }

    /**
     * Cancel order
     */
    cancelOrder(id) {
        const order = this.updateOrderStatus(id, 'cancelled');
        return order !== null;
    }

    /**
     * Delete order
     */
    deleteOrder(id) {
        const result = execute('DELETE FROM orders WHERE id = ?', [id]);
        return result.changes > 0;
    }

    /**
     * Calculate total from items
     */
    calculateTotal(items) {
        return items.reduce((total, item) => {
            const price = typeof item.price === 'number'
                ? item.price
                : parseFloat(String(item.price).replace(/[^0-9.-]+/g, ''));
            const quantity = item.quantity || 1;
            return total + (isNaN(price) ? 0 : price * quantity);
        }, 0);
    }

    /**
     * Get order statistics
     */
    getStatistics() {
        const result = query(`
            SELECT 
                COUNT(*) as total_orders,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
                SUM(CASE WHEN status = 'preparing' THEN 1 ELSE 0 END) as preparing_orders,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
                SUM(total_amount) as total_revenue
            FROM orders
            WHERE DATE(created_at) = DATE('now')
        `);
        return result[0] || {};
    }
}

module.exports = new OrderService();
