// Bundled DESR SDK for demo application
// This file combines all the necessary SDK components

// Three.js GLTFLoader and DRACOLoader are loaded via CDN in HTML

// First, let's define the ModelLoader class
class ModelLoader {
    constructor(assetPath = '', dracoDecoderPath = null) {
        this.assetPath = assetPath;
        this.dracoDecoderPath = dracoDecoderPath;
        this.loader = new THREE.GLTFLoader();
        
        // Set up DRACO decoder if path is provided
        if (dracoDecoderPath) {
            const dracoLoader = new THREE.DRACOLoader();
            dracoLoader.setDecoderPath(dracoDecoderPath);
            this.loader.setDRACOLoader(dracoLoader);
        }
    }

    async loadModel(path) {
        return new Promise((resolve, reject) => {
            const fullPath = this.assetPath + path;
            
            this.loader.load(
                fullPath,
                (gltf) => {
                    resolve(gltf);
                },
                (progress) => {
                    // Progress callback (optional)
                    console.log(`Loading progress: ${(progress.loaded / progress.total * 100)}%`);
                },
                (error) => {
                    console.error('Error loading model:', error);
                    reject(error);
                }
            );
        });
    }

    dispose() {
        // Clean up if needed
        if (this.loader) {
            this.loader = null;
        }
    }
}

// Language Manager
class LanguageManager {
    constructor(defaultLanguage = 'en', customTranslations = {}) {
        // Define basic translations for demo
        this.translations = {
            en: {
                welcomeTitle: "Welcome to our restaurant!",
                tableInputDescription: "Please enter your table number to begin your AR dining experience",
                tableNumberPlaceholder: "Table Number",
                confirmTableButton: "Place your Table Number",
                tableRangeInfo: "Tables 1-17 available",
                backgroundLoadingText: "Preparing your Menu...",
                languageSelectionTitle: "Choose Your Language / 言語を選択",
                continueButton: "Continue",
                tableText: "Table",
                yourOrderButton: "See Your Order",
                menuTrigger: "MENU ☰",
                menuHeader: "Menu List 🍜️",
                categoryTitle: "Demo Models",
                orderButton: "Order",
                misoRamenName: "Miso Ramen",
                misoRamenDescription: "Traditional Japanese miso ramen with rich, savory broth, tender noodles, and fresh vegetables. A comfort food favorite that warms the soul.",
                spicyRamenName: "Spicy Ramen",
                spicyRamenDescription: "Fiery hot ramen with extra spice blend, perfect for those who love intense flavors. Topped with chili oil and fresh scallions.",
                meal3Name: "Seafood Ramen",
                meal3Description: "Fresh seafood ramen with prawns, crab, and tender vegetables in a rich ocean-flavored broth. A delightful maritime experience.",
                meal4Name: "Chicken Teriyaki Bowl",
                meal4Description: "Grilled chicken teriyaki served over steamed rice with crisp vegetables and our signature teriyaki sauce. A balanced and satisfying meal.",
                meal5Name: "Vegetarian Curry",
                meal5Description: "Aromatic vegetarian curry with seasonal vegetables, tofu, and fragrant spices served with jasmine rice. A healthy and flavorful choice.",
                meal6Name: "Beef Udon",
                meal6Description: "Thick udon noodles with tender beef slices in a savory soy-based broth, topped with scallions and mushrooms. A hearty comfort meal.",
                orderSummaryTitle: "Orders",
                noOrdersMessage: "No orders yet",
                totalText: "Total",
                clearAllButton: "Clear All",
                removeItem: "Remove item",
                itemRemoved: "Item removed",
                loadingText: "Loading Meals...",
                loadingProgress: "Initializing...",
                errorMessage: "Please enter a valid table number (1-17)",
                orderAdded: "Order added",
                addedToOrder: "Added to order"
            },
            ja: {
                welcomeTitle: "当レストランへようこそ！",
                tableInputDescription: "ARダイニング体験を開始するには、テーブル番号を入力してください",
                tableNumberPlaceholder: "テーブル番号",
                confirmTableButton: "テーブル番号を設定",
                tableRangeInfo: "テーブル1-17が利用可能",
                backgroundLoadingText: "メニューを準備中...",
                languageSelectionTitle: "言語を選択してください / Choose Your Language",
                continueButton: "続行",
                tableText: "テーブル",
                yourOrderButton: "ご注文",
                menuTrigger: "メニュー ☰",
                menuHeader: "メニューリスト 🍜️",
                categoryTitle: "デモモデル",
                orderButton: "注文",
                misoRamenName: "味噌ラーメン",
                misoRamenDescription: "濃厚で風味豊かなスープ、柔らかい麺、新鮮な野菜が入った伝統的な日本の味噌ラーメン。心を温める定番の一品です。",
                spicyRamenName: "辛口ラーメン",
                spicyRamenDescription: "特製スパイスブレンドで激辛に仕上げたラーメン。強烈な味がお好みの方にぴったり。ラー油とネギをトッピング。",
                meal3Name: "シーフードラーメン",
                meal3Description: "エビ、カニ、柔らかな野菜が入った濃厚な海の風味のスープで作る新鮮なシーフードラーメン。素晴らしい海の体験。",
                meal4Name: "チキン照り焼き丼",
                meal4Description: "グリルチキン照り焼きを蒸し米の上に乗せ、シャキシャキの野菜と特製照り焼きソースで仕上げました。バランスの取れた満足の一品。",
                meal5Name: "ベジタリアンカレー",
                meal5Description: "季節の野菜、豆腐、香り高いスパイスを使った香り豊かなベジタリアンカレー、ジャスミンライス付き。ヘルシーで風味豊かな選択。",
                meal6Name: "ビーフうどん",
                meal6Description: "太いうどん麺に柔らかな牛肉のスライスを醤油ベースの旨味スープで、ネギとキノコをトッピング。心温まるコンフォート料理。",
                orderSummaryTitle: "ご注文",
                noOrdersMessage: "まだ注文がありません",
                totalText: "合計",
                clearAllButton: "全て削除",
                removeItem: "アイテムを削除",
                itemRemoved: "アイテムを削除しました",
                loadingText: "料理を読み込み中...",
                loadingProgress: "初期化中...",
                errorMessage: "有効なテーブル番号(1-17)を入力してください",
                orderAdded: "注文を追加しました",
                addedToOrder: "注文に追加しました"
            }
        };
        
        // Merge custom translations
        Object.keys(customTranslations).forEach(lang => {
            if (!this.translations[lang]) {
                this.translations[lang] = {};
            }
            this.translations[lang] = { ...this.translations[lang], ...customTranslations[lang] };
        });

        this.currentLanguage = defaultLanguage;
        this.listeners = [];
    }

    getText(key) {
        const langTranslations = this.translations[this.currentLanguage];
        if (langTranslations && langTranslations[key]) {
            return langTranslations[key];
        }
        // Fallback to English
        if (this.translations.en && this.translations.en[key]) {
            return this.translations.en[key];
        }
        // Return key if no translation found
        return key;
    }

    setLanguage(language) {
        if (this.translations[language]) {
            const previousLanguage = this.currentLanguage;
            this.currentLanguage = language;
            this.notifyListeners(language, previousLanguage);
            return true;
        }
        console.warn(`Language not supported: ${language}`);
        return false;
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getAvailableLanguages() {
        return Object.keys(this.translations);
    }

    addTranslations(language, translations) {
        if (!this.translations[language]) {
            this.translations[language] = {};
        }
        this.translations[language] = { ...this.translations[language], ...translations };
    }

    onLanguageChange(callback) {
        this.listeners.push(callback);
    }

    notifyListeners(newLanguage, oldLanguage) {
        this.listeners.forEach(callback => {
            try {
                callback(newLanguage, oldLanguage);
            } catch (error) {
                console.error('Error in language change listener:', error);
            }
        });
    }
}

// Order Manager
class OrderManager {
    constructor() {
        this.orders = [];
        this.listeners = [];
    }

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

    removeOrder(orderId) {
        const index = this.orders.findIndex(order => order.id === orderId);
        if (index !== -1) {
            const removed = this.orders.splice(index, 1)[0];
            this.notifyListeners('remove', removed);
            return true;
        }
        return false;
    }

    clearOrders() {
        const clearedOrders = [...this.orders];
        this.orders = [];
        this.notifyListeners('clear', clearedOrders);
    }

    getOrders() {
        return [...this.orders];
    }

    getTotalAmount() {
        return this.orders.reduce((total, order) => {
            // Extract numeric value from price string (e.g., "¥1,000" -> 1000)
            const priceValue = parseFloat(order.price.replace(/[^0-9.-]+/g, ''));
            return total + (isNaN(priceValue) ? 0 : priceValue);
        }, 0);
    }

    getOrderCount() {
        return this.orders.length;
    }

    generateOrderId() {
        return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    onOrderChange(callback) {
        this.listeners.push(callback);
    }

    notifyListeners(action, data) {
        this.listeners.forEach(callback => {
            try {
                callback(action, data);
            } catch (error) {
                console.error('Error in order change listener:', error);
            }
        });
    }

    exportOrders() {
        return JSON.stringify({
            orders: this.orders,
            total: this.getTotalAmount(),
            exportDate: new Date().toISOString()
        }, null, 2);
    }
}

// UI Manager
class UIManager {
    constructor(languageManager) {
        this.languageManager = languageManager;
        this.elements = {};
    }

    init() {
        // Store references to key UI elements
        this.elements = {
            modelName: document.getElementById('modelNameText'),
            modelDescription: document.getElementById('modelDescriptionText'),
            modelPrice: document.getElementById('modelPriceText'),
            orderButton: document.getElementById('orderButton'),
            menuPanel: document.getElementById('menuPanel'),
            menuTrigger: document.getElementById('menuToggle'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            loadingText: document.getElementById('loadingText'),
            loadingProgress: document.getElementById('loadingProgress'),
            errorMessage: document.getElementById('errorMessage'),
            tableNumberDisplay: document.getElementById('tableNumberDisplay'),
            tableNumberText: document.getElementById('tableNumberText'),
            orderSummaryOverlay: document.getElementById('orderSummary'),
            orderList: document.getElementById('orderList'),
            totalAmount: document.getElementById('totalAmount')
        };

        return this;
    }

    showModelInfo(modelConfig) {
        const { modelName, modelDescription, modelPrice } = this.elements;

        if (modelName) {
            modelName.textContent = this.languageManager.getText(modelConfig.nameKey);
            modelName.parentElement.classList.add('visible');
        }

        if (modelDescription) {
            modelDescription.textContent = this.languageManager.getText(modelConfig.descriptionKey);
            modelDescription.parentElement.classList.add('visible');
        }

        if (modelPrice) {
            modelPrice.textContent = modelConfig.price;
            modelPrice.classList.add('visible');
        }
    }

    hideModelInfo() {
        const { modelName, modelDescription, modelPrice } = this.elements;

        if (modelName) modelName.parentElement.classList.remove('visible');
        if (modelDescription) modelDescription.parentElement.classList.remove('visible');
        if (modelPrice) modelPrice.classList.remove('visible');
    }

    showLoading(message = 'Loading...', progress = '') {
        const { loadingOverlay, loadingText, loadingProgress } = this.elements;

        if (loadingOverlay) loadingOverlay.style.display = 'flex';
        if (loadingText) loadingText.textContent = message;
        if (loadingProgress) loadingProgress.textContent = progress;
    }

    hideLoading() {
        const { loadingOverlay } = this.elements;
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    }

    showError(message, duration = 3000) {
        const { errorMessage } = this.elements;

        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';

            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, duration);
        }
    }

    updateTableNumber(tableNumber) {
        const { tableNumberText, tableNumberDisplay } = this.elements;

        if (tableNumberText) {
            tableNumberText.textContent = `${this.languageManager.getText('tableText')} ${tableNumber}`;
        }

        if (tableNumberDisplay) {
            tableNumberDisplay.classList.add('visible');
        }
    }

    updateOrderList(orders, totalAmount, currencySymbol = '¥') {
        const { orderList, totalAmount: totalElem } = this.elements;

        if (!orderList) return;

        if (orders.length === 0) {
            orderList.innerHTML = `<div class="no-orders-message">${this.languageManager.getText('noOrdersMessage')}</div>`;
        } else {
            orderList.innerHTML = orders.map(order => `
        <div class="order-item" data-order-id="${order.id}">
          <div class="order-details">
            <div class="order-name">${order.name}</div>
            <div class="order-time">${order.time}</div>
          </div>
          <div class="order-price">${order.price}</div>
          <button class="delete-order-btn" data-order-id="${order.id}">×</button>
        </div>
      `).join('');
        }

        if (totalElem) {
            totalElem.textContent = `${this.languageManager.getText('totalText')}: ${currencySymbol}${totalAmount.toLocaleString()}`;
        }
    }

    toggleMenuPanel() {
        const { menuPanel } = this.elements;
        if (menuPanel) {
            menuPanel.classList.toggle('active');
        }
    }

    showOrderSummary() {
        const { orderSummaryOverlay } = this.elements;
        if (orderSummaryOverlay) {
            orderSummaryOverlay.classList.add('visible');
        }
    }

    hideOrderSummary() {
        const { orderSummaryOverlay } = this.elements;
        if (orderSummaryOverlay) {
            orderSummaryOverlay.classList.remove('visible');
        }
    }

    getElement(id) {
        return this.elements[id] || document.getElementById(id);
    }
}

// AR Viewer
class ARViewer {
    constructor(containerId, config = {}) {
        this.containerId = containerId;
        this.config = config;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.video = null;
        this.canvas = null;
        this.currentModel = null;
        this.isArActive = false;
        this.frameId = null;
        this.modelLoader = new ModelLoader(config.assetPath, config.dracoDecoderPath);
    }

    async init() {
        try {
            // Create scene
            this.scene = new THREE.Scene();

            // Create camera
            const { fov, near, far } = this.config.camera || { fov: 75, near: 0.1, far: 1000 };
            this.camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);
            this.camera.position.set(0, 0, 0);

            // Get or create canvas
            const container = document.getElementById(this.containerId);
            this.canvas = container.querySelector('canvas') || document.createElement('canvas');
            this.canvas.id = 'ar-canvas';

            if (!container.contains(this.canvas)) {
                container.appendChild(this.canvas);
            }

            // Setup renderer
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                alpha: true,
                antialias: true
            });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);

            // Add lighting
            this.setupLighting();

            // Setup video for AR
            await this.setupVideo();

            // Handle window resize
            window.addEventListener('resize', () => this.onWindowResize());

            console.log('AR Viewer initialized');
            return true;
        } catch (error) {
            console.error('Error initializing AR Viewer:', error);
            throw error;
        }
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(5, 10, 7.5);
        this.scene.add(directionalLight);
    }

    async setupVideo() {
        this.video = document.getElementById('video') || document.createElement('video');
        this.video.setAttribute('autoplay', '');
        this.video.setAttribute('muted', '');
        this.video.setAttribute('playsinline', '');
        this.video.style.position = 'absolute';
        this.video.style.top = '0';
        this.video.style.left = '0';
        this.video.style.width = '100vw';
        this.video.style.height = '100vh';
        this.video.style.objectFit = 'cover';
        this.video.style.zIndex = '1';

        const container = document.getElementById(this.containerId);
        if (!document.getElementById('video')) {
            container.insertBefore(this.video, container.firstChild);
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });
            this.video.srcObject = stream;
        } catch (error) {
            console.error('Error accessing camera:', error);
            // For demo purposes, we'll continue without camera access
            // In a real app, we'd show an error to the user
        }
    }

    async loadModel(modelConfig) {
        try {
            // Remove existing model
            if (this.currentModel) {
                this.scene.remove(this.currentModel);
            }

            // Load model
            const gltf = await this.modelLoader.loadModel(modelConfig.path);
            const model = gltf.scene;

            // Apply transformations
            if (modelConfig.position) {
                model.position.set(modelConfig.position.x, modelConfig.position.y, modelConfig.position.z);
            }
            if (modelConfig.rotation) {
                model.rotation.set(modelConfig.rotation.x, modelConfig.rotation.y, modelConfig.rotation.z);
            }
            if (modelConfig.scale) {
                model.scale.set(modelConfig.scale.x, modelConfig.scale.y, modelConfig.scale.z);
            }

            // Store config for auto-rotation
            model.userData.config = modelConfig;

            // Add to scene
            this.scene.add(model);
            this.currentModel = model;

            console.log('Model loaded and added to scene');
            return model;
        } catch (error) {
            console.error('Error loading model:', error);
            throw error;
        }
    }

    startRendering() {
        if (!this.isArActive) {
            this.isArActive = true;
            this.animate();
        }
    }

    stopRendering() {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
        this.isArActive = false;
    }

    animate() {
        if (!this.isArActive) return;

        this.frameId = requestAnimationFrame(() => this.animate());

        // Auto-rotate model if enabled
        if (this.currentModel && this.currentModel.userData.config) {
            const config = this.currentModel.userData.config;
            if (config.autoRotate) {
                this.currentModel.rotation.y += config.rotationSpeed || 0.003;
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    getCurrentModel() {
        return this.currentModel;
    }

    dispose() {
        this.stopRendering();

        if (this.currentModel) {
            this.scene.remove(this.currentModel);
        }

        if (this.video && this.video.srcObject) {
            this.video.srcObject.getTracks().forEach(track => track.stop());
        }

        if (this.modelLoader) {
            this.modelLoader.dispose();
        }

        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// Main DESR SDK Class
class DesrSDK {
    constructor(userConfig = {}) {
        // Default configuration
        this.defaultConfig = {
            containerId: 'ar-container',
            language: 'en',
            assetPath: 'assets/models/',
            dracoDecoderPath: 'https://www.gstatic.com/draco/v1/decoders/',
            camera: {
                fov: 75,
                near: 0.1,
                far: 1000
            },
            models: {
                meal: {
                    path: 'meal_draco.glb',
                    position: { x: 0, y: -0.1, z: -0.8 },
                    rotation: { x: 0.5, y: 0, z: 0 },
                    scale: { x: 0.20, y: 0.20, z: 0.20 },
                    autoRotate: true,
                    rotationSpeed: 0.003,
                    nameKey: "misoRamenName",
                    descriptionKey: "misoRamenDescription",
                    price: "¥1,000"
                },
                meal2: {
                    path: 'meal2_draco.glb',
                    position: { x: 0, y: -0.15, z: -1.2 },
                    rotation: { x: 0.5, y: 0, z: 0 },
                    scale: { x: 0.25, y: 0.25, z: 0.25 },
                    autoRotate: true,
                    rotationSpeed: 0.003,
                    nameKey: "spicyRamenName",
                    descriptionKey: "spicyRamenDescription",
                    price: "¥1,200"
                },
                meal3: {
                    path: 'meal3_draco.glb',
                    position: { x: 0, y: -0.1, z: -0.8 },
                    rotation: { x: 0.5, y: 0, z: 0 },
                    scale: { x: 0.60, y: 0.60, z: 0.60 },
                    autoRotate: true,
                    rotationSpeed: 0.003,
                    nameKey: "meal3Name",
                    descriptionKey: "meal3Description",
                    price: "¥950"
                },
                meal4: {
                    path: 'meal4_draco.glb',
                    position: { x: 0, y: -0.1, z: -0.8 },
                    rotation: { x: 0.5, y: 0, z: 0 },
                    scale: { x: 0.60, y: 0.60, z: 0.60 },
                    autoRotate: true,
                    rotationSpeed: 0.003,
                    nameKey: "meal4Name",
                    descriptionKey: "meal4Description",
                    price: "¥1,100"
                },
                meal5: {
                    path: 'meal5_draco.glb',
                    position: { x: 0, y: -0.1, z: -0.8 },
                    rotation: { x: 0.5, y: 0, z: 0 },
                    scale: { x: 0.60, y: 0.60, z: 0.60 },
                    autoRotate: true,
                    rotationSpeed: 0.003,
                    nameKey: "meal5Name",
                    descriptionKey: "meal5Description",
                    price: "¥1,300"
                },
                meal6: {
                    path: 'meal6_draco.glb',
                    position: { x: 0, y: -0.1, z: -0.8 },
                    rotation: { x: 0.5, y: 0, z: 0 },
                    scale: { x: 0.60, y: 0.60, z: 0.60 },
                    autoRotate: true,
                    rotationSpeed: 0.003,
                    nameKey: "meal6Name",
                    descriptionKey: "meal6Description",
                    price: "¥1,400"
                }
            },
            ui: {
                showTableSelection: true,
                showLanguageSelection: true,
                showOrderButton: true,
                showMenuPanel: true,
                showNavigationArrows: true
            },
            onModelLoad: null,
            onModelSwitch: null,
            onOrderAdd: null,
            onLanguageChange: null,
            onError: null
        };

        // Merge user config with defaults
        this.config = this.mergeConfig(this.defaultConfig, userConfig);

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

    async nextModel() {
        const nextIndex = (this.currentModelIndex + 1) % this.modelKeys.length;
        const nextModelKey = this.modelKeys[nextIndex];
        await this.loadModel(nextModelKey);

        if (this.config.onModelSwitch) {
            this.config.onModelSwitch('next', nextModelKey);
        }
    }

    async previousModel() {
        const prevIndex = (this.currentModelIndex - 1 + this.modelKeys.length) % this.modelKeys.length;
        const prevModelKey = this.modelKeys[prevIndex];
        await this.loadModel(prevModelKey);

        if (this.config.onModelSwitch) {
            this.config.onModelSwitch('previous', prevModelKey);
        }
    }

    setLanguage(language) {
        return this.languageManager.setLanguage(language);
    }

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

    getOrders() {
        return this.orderManager.getOrders();
    }

    clearOrders() {
        this.orderManager.clearOrders();
    }

    setTableNumber(tableNumber) {
        this.tableNumber = tableNumber;
        this.uiManager.updateTableNumber(tableNumber);
    }

    updateOrderUI() {
        const orders = this.orderManager.getOrders();
        const total = this.orderManager.getTotalAmount();
        this.uiManager.updateOrderList(orders, total);
    }

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

    startAR() {
        if (this.arViewer) {
            this.arViewer.startRendering();
        }
    }

    stopAR() {
        if (this.arViewer) {
            this.arViewer.stopRendering();
        }
    }

    destroy() {
        if (this.arViewer) {
            this.arViewer.dispose();
        }

        this.isInitialized = false;
        console.log('Desr SDK destroyed');
    }
}

// Export the main class globally
window.DesrSDK = DesrSDK;