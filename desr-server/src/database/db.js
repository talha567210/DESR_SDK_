/**
 * DESR Server SDK - Database Connection and Setup
 * Uses sql.js (pure JavaScript SQLite) for cross-platform compatibility
 */

const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const config = require('../config');

let db = null;
let SQL = null;

/**
 * Initialize database connection
 */
async function initDatabase() {
    // Ensure data directory exists
    const dbDir = path.dirname(config.database.path);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    // Initialize SQL.js
    SQL = await initSqlJs();

    // Load existing database or create new one
    if (fs.existsSync(config.database.path)) {
        const buffer = fs.readFileSync(config.database.path);
        db = new SQL.Database(buffer);
    } else {
        db = new SQL.Database();
    }

    // Run migrations
    runMigrations();

    // Save to disk
    saveDatabase();

    console.log('Database initialized at:', config.database.path);
    return db;
}

/**
 * Save database to disk
 */
function saveDatabase() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(config.database.path, buffer);
    }
}

/**
 * Run database migrations
 */
function runMigrations() {
    // Create tables
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            table_number INTEGER NOT NULL,
            session_id TEXT,
            items TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            total_amount REAL,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS menu_items (
            id TEXT PRIMARY KEY,
            model_key TEXT UNIQUE NOT NULL,
            name_en TEXT NOT NULL,
            name_ja TEXT,
            description_en TEXT,
            description_ja TEXT,
            price REAL NOT NULL,
            model_path TEXT,
            model_config TEXT,
            category TEXT,
            available INTEGER DEFAULT 1,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS tables (
            number INTEGER PRIMARY KEY,
            current_session_id TEXT,
            status TEXT DEFAULT 'available',
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create indexes
    db.run('CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(table_number)');
    db.run('CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)');
    db.run('CREATE INDEX IF NOT EXISTS idx_orders_session ON orders(session_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_menu_available ON menu_items(available)');

    // Seed default menu items if empty
    const countResult = db.exec('SELECT COUNT(*) as count FROM menu_items');
    const count = countResult.length > 0 ? countResult[0].values[0][0] : 0;
    if (count === 0) {
        seedDefaultMenu();
    }

    // Seed default tables if empty
    const tableCountResult = db.exec('SELECT COUNT(*) as count FROM tables');
    const tableCount = tableCountResult.length > 0 ? tableCountResult[0].values[0][0] : 0;
    if (tableCount === 0) {
        seedDefaultTables();
    }

    saveDatabase();
}

/**
 * Seed default menu items
 */
function seedDefaultMenu() {
    const items = [
        { id: 'menu_1', model_key: 'meal', name_en: 'Miso Ramen', name_ja: '味噌ラーメン', description_en: 'Rich miso-based broth with tender chashu pork', description_ja: '濃厚な味噌ベースのスープとチャーシュー', price: 1000, model_path: 'meal_draco.glb', model_config: '{"position":{"x":0,"y":-0.1,"z":-0.8},"scale":{"x":0.2,"y":0.2,"z":0.2}}', category: 'ramen' },
        { id: 'menu_2', model_key: 'meal2', name_en: 'Spicy Ramen', name_ja: '辛味噌ラーメン', description_en: 'Fiery spicy miso with extra chili oil', description_ja: '特製辛味噌と自家製ラー油', price: 1200, model_path: 'meal2_draco.glb', model_config: '{"position":{"x":0,"y":-0.15,"z":-1.2},"scale":{"x":0.25,"y":0.25,"z":0.25}}', category: 'ramen' },
        { id: 'menu_3', model_key: 'meal3', name_en: 'Tonkotsu Ramen', name_ja: '豚骨ラーメン', description_en: 'Creamy pork bone broth simmered for 12 hours', description_ja: '12時間煮込んだ濃厚豚骨スープ', price: 950, model_path: 'meal3_draco.glb', model_config: '{"position":{"x":0,"y":-0.1,"z":-0.8},"scale":{"x":0.6,"y":0.6,"z":0.6}}', category: 'ramen' },
        { id: 'menu_4', model_key: 'meal4', name_en: 'Shoyu Ramen', name_ja: '醤油ラーメン', description_en: 'Classic soy sauce based ramen', description_ja: '伝統的な醤油ベースのラーメン', price: 1100, model_path: 'meal4_draco.glb', model_config: '{"position":{"x":0,"y":-0.1,"z":-0.8},"scale":{"x":0.6,"y":0.6,"z":0.6}}', category: 'ramen' },
        { id: 'menu_5', model_key: 'meal5', name_en: 'Special Ramen', name_ja: '特製ラーメン', description_en: 'Chef special with all toppings', description_ja: 'シェフ特製全部乗せ', price: 1300, model_path: 'meal5_draco.glb', model_config: '{"position":{"x":0,"y":-0.1,"z":-0.8},"scale":{"x":0.6,"y":0.6,"z":0.6}}', category: 'ramen' },
        { id: 'menu_6', model_key: 'meal6', name_en: 'Premium Ramen', name_ja: 'プレミアムラーメン', description_en: 'Premium wagyu beef ramen', description_ja: 'プレミアム和牛ラーメン', price: 1400, model_path: 'meal6_draco.glb', model_config: '{"position":{"x":0,"y":-0.1,"z":-0.8},"scale":{"x":0.6,"y":0.6,"z":0.6}}', category: 'ramen' }
    ];

    const stmt = db.prepare(`
        INSERT INTO menu_items (id, model_key, name_en, name_ja, description_en, description_ja, price, model_path, model_config, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    items.forEach(item => {
        stmt.run([item.id, item.model_key, item.name_en, item.name_ja, item.description_en, item.description_ja, item.price, item.model_path, item.model_config, item.category]);
    });
    stmt.free();

    console.log('Default menu items seeded');
}

/**
 * Seed default tables (1-17)
 */
function seedDefaultTables() {
    const stmt = db.prepare('INSERT INTO tables (number, status) VALUES (?, ?)');
    for (let i = 1; i <= 17; i++) {
        stmt.run([i, 'available']);
    }
    stmt.free();
    console.log('Default tables (1-17) seeded');
}

/**
 * Get database instance
 */
function getDatabase() {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return db;
}

/**
 * Helper to run a query and get results as array of objects
 */
function query(sql, params = []) {
    const stmt = db.prepare(sql);
    if (params.length > 0) {
        stmt.bind(params);
    }

    const results = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
}

/**
 * Helper to get a single row
 */
function queryOne(sql, params = []) {
    const results = query(sql, params);
    return results.length > 0 ? results[0] : null;
}

/**
 * Helper to run an insert/update/delete
 */
function execute(sql, params = []) {
    db.run(sql, params);
    saveDatabase();
    return { changes: db.getRowsModified() };
}

/**
 * Close database connection
 */
function closeDatabase() {
    if (db) {
        saveDatabase();
        db.close();
        db = null;
    }
}

module.exports = {
    initDatabase,
    getDatabase,
    closeDatabase,
    query,
    queryOne,
    execute,
    saveDatabase
};
