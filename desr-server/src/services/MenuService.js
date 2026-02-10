/**
 * DESR Server SDK - Menu Service
 */

const { v4: uuidv4 } = require('uuid');
const { query, queryOne, execute } = require('../database/db');

class MenuService {
    /**
     * Get all menu items
     */
    getAllItems(onlyAvailable = true) {
        let sql = 'SELECT * FROM menu_items';
        if (onlyAvailable) sql += ' WHERE available = 1';
        sql += ' ORDER BY sort_order ASC, created_at ASC';

        return query(sql).map(item => this.formatMenuItem(item));
    }

    /**
     * Get menu item by ID
     */
    getItemById(id) {
        const item = queryOne('SELECT * FROM menu_items WHERE id = ?', [id]);
        return item ? this.formatMenuItem(item) : null;
    }

    /**
     * Get menu item by model key
     */
    getItemByModelKey(modelKey) {
        const item = queryOne('SELECT * FROM menu_items WHERE model_key = ?', [modelKey]);
        return item ? this.formatMenuItem(item) : null;
    }

    /**
     * Get items by category
     */
    getItemsByCategory(category) {
        const items = query('SELECT * FROM menu_items WHERE category = ? AND available = 1 ORDER BY sort_order ASC', [category]);
        return items.map(item => this.formatMenuItem(item));
    }

    /**
     * Create a new menu item
     */
    createItem(itemData) {
        const id = `menu_${uuidv4()}`;

        execute(`
            INSERT INTO menu_items (id, model_key, name_en, name_ja, description_en, description_ja, price, model_path, model_config, category, available, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id, itemData.modelKey, itemData.nameEn, itemData.nameJa || null,
            itemData.descriptionEn || null, itemData.descriptionJa || null,
            itemData.price, itemData.modelPath || null,
            itemData.modelConfig ? JSON.stringify(itemData.modelConfig) : null,
            itemData.category || null, itemData.available !== false ? 1 : 0,
            itemData.sortOrder || 0
        ]);

        return this.getItemById(id);
    }

    /**
     * Update a menu item
     */
    updateItem(id, updates) {
        const existing = this.getItemById(id);
        if (!existing) return null;

        const fields = [];
        const values = [];

        const fieldMap = {
            nameEn: 'name_en', nameJa: 'name_ja',
            descriptionEn: 'description_en', descriptionJa: 'description_ja',
            price: 'price', modelPath: 'model_path', category: 'category', sortOrder: 'sort_order'
        };

        Object.entries(fieldMap).forEach(([key, col]) => {
            if (updates[key] !== undefined) {
                fields.push(`${col} = ?`);
                values.push(updates[key]);
            }
        });

        if (updates.modelConfig !== undefined) {
            fields.push('model_config = ?');
            values.push(JSON.stringify(updates.modelConfig));
        }
        if (updates.available !== undefined) {
            fields.push('available = ?');
            values.push(updates.available ? 1 : 0);
        }

        if (fields.length === 0) return existing;

        values.push(id);
        execute(`UPDATE menu_items SET ${fields.join(', ')} WHERE id = ?`, values);

        return this.getItemById(id);
    }

    /**
     * Delete a menu item
     */
    deleteItem(id) {
        const result = execute('DELETE FROM menu_items WHERE id = ?', [id]);
        return result.changes > 0;
    }

    /**
     * Toggle item availability
     */
    toggleAvailability(id) {
        const item = this.getItemById(id);
        if (!item) return null;

        execute('UPDATE menu_items SET available = ? WHERE id = ?', [item.available ? 0 : 1, id]);
        return this.getItemById(id);
    }

    /**
     * Format menu item for output
     */
    formatMenuItem(item) {
        return {
            id: item.id,
            modelKey: item.model_key,
            name: { en: item.name_en, ja: item.name_ja },
            description: { en: item.description_en, ja: item.description_ja },
            price: item.price,
            modelPath: item.model_path,
            modelConfig: item.model_config ? JSON.parse(item.model_config) : null,
            category: item.category,
            available: item.available === 1,
            sortOrder: item.sort_order
        };
    }

    /**
     * Get menu formatted for client SDK
     */
    getMenuForSDK(language = 'en') {
        const items = this.getAllItems(true);
        const models = {};
        const translations = { en: {}, ja: {} };

        items.forEach(item => {
            models[item.modelKey] = {
                path: item.modelPath,
                position: item.modelConfig?.position || { x: 0, y: -0.1, z: -0.8 },
                rotation: item.modelConfig?.rotation || { x: 0.5, y: 0, z: 0 },
                scale: item.modelConfig?.scale || { x: 0.2, y: 0.2, z: 0.2 },
                autoRotate: true,
                rotationSpeed: 0.003,
                nameKey: `${item.modelKey}Name`,
                descriptionKey: `${item.modelKey}Description`,
                price: `¥${item.price.toLocaleString()}`
            };

            translations.en[`${item.modelKey}Name`] = item.name.en;
            translations.en[`${item.modelKey}Description`] = item.description.en;
            translations.ja[`${item.modelKey}Name`] = item.name.ja || item.name.en;
            translations.ja[`${item.modelKey}Description`] = item.description.ja || item.description.en;
        });

        return { models, translations };
    }
}

module.exports = new MenuService();
