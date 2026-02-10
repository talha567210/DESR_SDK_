/**
 * DESR Server SDK - Table Service
 */

const { v4: uuidv4 } = require('uuid');
const { query, queryOne, execute } = require('../database/db');

class TableService {
    /**
     * Get all tables
     */
    getAllTables() {
        return query('SELECT * FROM tables ORDER BY number ASC');
    }

    /**
     * Get table by number
     */
    getTable(tableNumber) {
        return queryOne('SELECT * FROM tables WHERE number = ?', [tableNumber]);
    }

    /**
     * Start a new session for a table
     */
    startSession(tableNumber) {
        const sessionId = `session_${uuidv4()}`;
        let table = this.getTable(tableNumber);

        if (!table) {
            execute('INSERT INTO tables (number, current_session_id, status) VALUES (?, ?, ?)',
                [tableNumber, sessionId, 'occupied']);
        } else {
            execute(`UPDATE tables SET current_session_id = ?, status = 'occupied', updated_at = datetime('now') WHERE number = ?`,
                [sessionId, tableNumber]);
        }

        return {
            tableNumber,
            sessionId,
            status: 'occupied',
            startedAt: new Date().toISOString()
        };
    }

    /**
     * End session for a table
     */
    endSession(tableNumber) {
        const result = execute(`UPDATE tables SET current_session_id = NULL, status = 'available', updated_at = datetime('now') WHERE number = ?`,
            [tableNumber]);
        return result.changes > 0;
    }

    /**
     * Validate session
     */
    validateSession(tableNumber, sessionId) {
        const table = this.getTable(tableNumber);
        return table && table.current_session_id === sessionId;
    }

    /**
     * Get table status
     */
    getTableStatus(tableNumber) {
        const table = this.getTable(tableNumber);
        if (!table) return null;

        const activeOrders = queryOne(`
            SELECT COUNT(*) as count FROM orders 
            WHERE table_number = ? AND status IN ('pending', 'confirmed', 'preparing')
        `, [tableNumber]);

        return {
            number: table.number,
            status: table.status,
            hasActiveSession: !!table.current_session_id,
            sessionId: table.current_session_id,
            activeOrderCount: activeOrders?.count || 0,
            updatedAt: table.updated_at
        };
    }

    /**
     * Get all occupied tables
     */
    getOccupiedTables() {
        return query("SELECT * FROM tables WHERE status = 'occupied' ORDER BY number ASC");
    }

    /**
     * Update table status
     */
    updateStatus(tableNumber, status) {
        const result = execute(`UPDATE tables SET status = ?, updated_at = datetime('now') WHERE number = ?`,
            [status, tableNumber]);
        if (result.changes === 0) return null;
        return this.getTable(tableNumber);
    }
}

module.exports = new TableService();
