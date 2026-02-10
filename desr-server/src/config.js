/**
 * DESR Server SDK - Configuration
 */

const config = {
    // Server settings
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost',

    // Database
    database: {
        path: process.env.DB_PATH || './data/desr.db'
    },

    // CORS settings
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true
    },

    // Session settings
    session: {
        expiryHours: 24
    },

    // Order status options
    orderStatuses: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']
};

module.exports = config;
