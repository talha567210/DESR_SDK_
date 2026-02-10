import { ARViewer } from './core/ARViewer.js';
import { LanguageManager } from './core/LanguageManager.js';
import { OrderManager } from './core/OrderManager.js';
import { ServerConnector } from './core/ServerConnector.js';
import { UIManager } from './ui/UIManager.js';
import defaultConfig from './config/defaultConfig.js';

/**
 * Desr SDK - Main SDK class for AR Restaurant Viewer
 * Now with server integration support
 */
export class DesrSDK {
    constructor(userConfig = {}) {
        // Merge user config with defaults
        this.config = this.mergeConfig(defaultConfig, userConfig);

        // Initialize managers
        this.languageManager = new LanguageManager(this.config.language, this.config.customTranslations);
        this.orderManager = new OrderManager();
        this.uiManager = null;
        this.arViewer = null;

        // Server connector (optional - for production with backend)
        this.serverConnector = null;
        this.isServerConnected = false;

        // State
        this.currentModelIndex = 0;
        this.modelKeys = Object.keys(this.config.models);
        this.isInitialized = false;
        this.tableNumber = null;
    }

    /**
     * Merge user configuration with defaults
     * @private
     */
    mergeConfig(defaults, userConfig) {
        const merged = { ...defaults };

        Object.keys(userConfig).forEach(key => {
            if (typeof userConfig[key] === 'object' && !Array.isArray(userConfig[key]) && userConfig[key] !== null) {
                merged[key] = { ...defaults[key], ...userConfig[key] };
            } else {
                merged[key] = userConfig[key];
            }
        });

        return merged;
    }

    /**
     * Initialize the SDK
     * @returns {Promise<boolean>} Success status
     */
    async init() {
        try {
            if (this.isInitialized) {
                console.warn('SDK already initialized');
                return true;
            }

            console.log('Initializing Desr SDK...');

            // Initialize AR Viewer
            this.arViewer = new ARViewer(this.config.containerId, this.config);
            await this.arViewer.init();

            // Initialize UI Manager
            this.uiManager = new UIManager(this.languageManager);
            this.uiManager.init();

            // Setup event listeners
            this.setupEventListeners();

            // Load first model if auto-load is enabled
            if (this.config.autoLoadFirstModel !== false) {
                await this.loadModel(this.modelKeys[0]);
                this.arViewer.startRendering();
            }

            this.isInitialized = true;
            console.log('Desr SDK initialized successfully');

            // Trigger callback
            if (this.config.onInit) {
                this.config.onInit(this);
            }

            return true;
        } catch (error) {
            console.error('Error initializing SDK:', error);

            if (this.config.onError) {
                this.config.onError(error);
            }

            throw error;
        }
    }

    /**
     * Setup event listeners for UI interactions
     * @private
     */
    setupEventListeners() {
        // Order manager events
        this.orderManager.onOrderChange((action, data) => {
            this.updateOrderUI();

            if (action === 'add' && this.config.onOrderAdd) {
                this.config.onOrderAdd(data);
            }
        });

        // Language change events
        this.languageManager.onLanguageChange((newLang, oldLang) => {
            this.updateAllTexts();

            if (this.config.onLanguageChange) {
                this.config.onLanguageChange(newLang, oldLang);
            }
        });
    }

    /**
     * Load a 3D model by key
     * @param {string} modelKey - Model key from configuration
     * @returns {Promise<Object>} Loaded model
     */
    async loadModel(modelKey) {
        if (!this.config.models[modelKey]) {
            throw new Error(`Model not found: ${modelKey}`);
        }

        const modelConfig = this.config.models[modelKey];

        try {
            this.uiManager.showLoading(
                this.languageManager.getText('loadingText'),
                this.languageManager.getText('loadingProgress')
            );

            const model = await this.arViewer.loadModel(modelConfig);

            this.uiManager.hideLoading();
            this.uiManager.showModelInfo(modelConfig);

            // Update current model index
            this.currentModelIndex = this.modelKeys.indexOf(modelKey);

            // Trigger callback
            if (this.config.onModelLoad) {
                this.config.onModelLoad(modelKey, modelConfig, model);
            }

            return model;
        } catch (error) {
            this.uiManager.hideLoading();
            this.uiManager.showError(this.languageManager.getText('errorMessage'));

            if (this.config.onError) {
                this.config.onError(error);
            }

            throw error;
        }
    }

    /**
     * Switch to next model
     */
    async nextModel() {
        const nextIndex = (this.currentModelIndex + 1) % this.modelKeys.length;
        const nextModelKey = this.modelKeys[nextIndex];
        await this.loadModel(nextModelKey);

        if (this.config.onModelSwitch) {
            this.config.onModelSwitch('next', nextModelKey);
        }
    }

    /**
     * Switch to previous model
     */
    async previousModel() {
        const prevIndex = (this.currentModelIndex - 1 + this.modelKeys.length) % this.modelKeys.length;
        const prevModelKey = this.modelKeys[prevIndex];
        await this.loadModel(prevModelKey);

        if (this.config.onModelSwitch) {
            this.config.onModelSwitch('previous', prevModelKey);
        }
    }

    /**
     * Set language
     * @param {string} language - Language code
     */
    setLanguage(language) {
        return this.languageManager.setLanguage(language);
    }

    /**
     * Add an order for the current model
     */
    addOrder() {
        const currentModelKey = this.modelKeys[this.currentModelIndex];
        const modelConfig = this.config.models[currentModelKey];

        const order = {
            modelKey: currentModelKey,
            name: this.languageManager.getText(modelConfig.nameKey),
            price: modelConfig.price,
            tableNumber: this.tableNumber
        };

        return this.orderManager.addOrder(order);
    }

    /**
     * Get all orders
     */
    getOrders() {
        return this.orderManager.getOrders();
    }

    /**
     * Clear all orders
     */
    clearOrders() {
        this.orderManager.clearOrders();
    }

    /**
     * Set table number
     * @param {number} tableNumber - Table number
     */
    setTableNumber(tableNumber) {
        this.tableNumber = tableNumber;
        this.uiManager.updateTableNumber(tableNumber);
    }

    /**
     * Update order UI
     * @private
     */
    updateOrderUI() {
        const orders = this.orderManager.getOrders();
        const total = this.orderManager.getTotalAmount();
        this.uiManager.updateOrderList(orders, total);
    }

    /**
     * Update all UI texts based on current language
     * @private
     */
    updateAllTexts() {
        // Re-render model info if a model is loaded
        const currentModelKey = this.modelKeys[this.currentModelIndex];
        if (currentModelKey) {
            const modelConfig = this.config.models[currentModelKey];
            this.uiManager.showModelInfo(modelConfig);
        }

        // Update orders
        this.updateOrderUI();

        // Update table number
        if (this.tableNumber) {
            this.uiManager.updateTableNumber(this.tableNumber);
        }
    }

    /**
     * Start AR rendering
     */
    startAR() {
        if (this.arViewer) {
            this.arViewer.startRendering();
        }
    }

    /**
     * Stop AR rendering
     */
    stopAR() {
        if (this.arViewer) {
            this.arViewer.stopRendering();
        }
    }

    // ============================================
    // SERVER INTEGRATION METHODS
    // ============================================

    /**
     * Connect to server backend
     * @param {Object} options - Server connection options
     * @returns {Promise<Object>} Connection status
     */
    async connectToServer(options = {}) {
        try {
            const serverUrl = options.serverUrl || this.config.serverUrl || 'http://localhost:3001';

            this.serverConnector = new ServerConnector({
                serverUrl,
                tableNumber: this.tableNumber
            });

            // Set up server event listeners
            this.serverConnector.on('orderStatusChanged', (data) => {
                if (this.config.onOrderStatusChange) {
                    this.config.onOrderStatusChange(data);
                }
            });

            this.serverConnector.on('orderReady', (data) => {
                if (this.config.onOrderReady) {
                    this.config.onOrderReady(data);
                }
            });

            this.serverConnector.on('connected', () => {
                this.isServerConnected = true;
                console.log('Connected to DESR server');
            });

            this.serverConnector.on('disconnected', () => {
                this.isServerConnected = false;
                console.log('Disconnected from DESR server');
            });

            await this.serverConnector.connect();
            this.isServerConnected = true;

            return {
                connected: true,
                sessionId: this.serverConnector.sessionId
            };
        } catch (error) {
            console.error('Error connecting to server:', error);
            if (this.config.onError) {
                this.config.onError(error);
            }
            return { connected: false, error: error.message };
        }
    }

    /**
     * Load menu configuration from server
     * @returns {Promise<Object>} Menu configuration
     */
    async loadMenuFromServer() {
        if (!this.serverConnector) {
            throw new Error('Not connected to server. Call connectToServer() first.');
        }

        try {
            const menuConfig = await this.serverConnector.getMenu(this.languageManager.currentLanguage);

            // Merge server menu with existing config
            this.config.models = { ...this.config.models, ...menuConfig.models };

            // Update model keys
            this.modelKeys = Object.keys(this.config.models);

            // Add translations from server
            if (menuConfig.translations) {
                Object.keys(menuConfig.translations).forEach(lang => {
                    this.languageManager.addTranslations(lang, menuConfig.translations[lang]);
                });
            }

            console.log('Menu loaded from server:', this.modelKeys.length, 'items');
            return menuConfig;
        } catch (error) {
            console.error('Error loading menu from server:', error);
            throw error;
        }
    }

    /**
     * Submit current orders to server (kitchen)
     * @param {string} notes - Optional order notes
     * @returns {Promise<Object>} Submitted order
     */
    async submitOrderToServer(notes = '') {
        if (!this.serverConnector) {
            throw new Error('Not connected to server. Call connectToServer() first.');
        }

        const orders = this.orderManager.getOrders();

        if (orders.length === 0) {
            throw new Error('No orders to submit');
        }

        try {
            // Format orders for server
            const items = orders.map(order => ({
                modelKey: order.modelKey,
                name: order.name,
                price: typeof order.price === 'string'
                    ? parseFloat(order.price.replace(/[^0-9.-]+/g, ''))
                    : order.price,
                quantity: order.quantity || 1
            }));

            const submittedOrder = await this.serverConnector.submitOrder(items, notes);

            // Clear local orders after successful submission
            this.orderManager.clearOrders();

            if (this.config.onOrderSubmitted) {
                this.config.onOrderSubmitted(submittedOrder);
            }

            console.log('Order submitted to kitchen:', submittedOrder.id);
            return submittedOrder;
        } catch (error) {
            console.error('Error submitting order to server:', error);
            if (this.config.onError) {
                this.config.onError(error);
            }
            throw error;
        }
    }

    /**
     * Get orders for current table from server
     * @returns {Promise<Array>} Orders from server
     */
    async getServerOrders() {
        if (!this.serverConnector) {
            throw new Error('Not connected to server. Call connectToServer() first.');
        }

        return await this.serverConnector.getTableOrders();
    }

    /**
     * Check if connected to server
     * @returns {boolean} Connection status
     */
    isConnectedToServer() {
        return this.isServerConnected && this.serverConnector !== null;
    }

    /**
     * Cleanup and dispose SDK
     */
    destroy() {
        // Disconnect from server
        if (this.serverConnector) {
            this.serverConnector.disconnect();
            this.serverConnector = null;
            this.isServerConnected = false;
        }

        if (this.arViewer) {
            this.arViewer.dispose();
        }

        this.isInitialized = false;
        console.log('Desr SDK destroyed');
    }
}

export default DesrSDK;

