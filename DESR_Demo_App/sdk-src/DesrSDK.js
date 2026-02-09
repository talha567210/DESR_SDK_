import { ARViewer } from './core/ARViewer.js';
import { LanguageManager } from './core/LanguageManager.js';
import { OrderManager } from './core/OrderManager.js';
import { UIManager } from './ui/UIManager.js';
import defaultConfig from './config/defaultConfig.js';

/**
 * Desr SDK - Main SDK class for AR Restaurant Viewer
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

    /**
     * Cleanup and dispose SDK
     */
    destroy() {
        if (this.arViewer) {
            this.arViewer.dispose();
        }

        this.isInitialized = false;
        console.log('Desr SDK destroyed');
    }
}

export default DesrSDK;
