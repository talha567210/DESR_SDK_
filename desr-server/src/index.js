/**
 * DESR Server SDK - Main Entry Point
 * Exports all modules for programmatic use
 */

const { app, startServer } = require('./server');
const config = require('./config');
const { initDatabase, getDatabase, closeDatabase } = require('./database/db');
const orderService = require('./services/OrderService');
const menuService = require('./services/MenuService');
const tableService = require('./services/TableService');
const notificationService = require('./services/NotificationService');

module.exports = {
    // Server
    app,
    startServer,
    config,

    // Database
    initDatabase,
    getDatabase,
    closeDatabase,

    // Services
    orderService,
    menuService,
    tableService,
    notificationService
};
