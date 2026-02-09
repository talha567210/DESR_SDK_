// DESR Demo Application
// Main application logic

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const welcomeScreen = document.getElementById('welcomeScreen');
    const arViewScreen = document.getElementById('arViewScreen');
    const tableNumberInput = document.getElementById('tableNumber');
    const confirmTableBtn = document.getElementById('confirmTableBtn');
    const languageSelector = document.getElementById('languageSelector');
    const prevModelBtn = document.getElementById('prevModel');
    const nextModelBtn = document.getElementById('nextModel');
    const orderButton = document.getElementById('orderButton');
    const menuToggle = document.getElementById('menuToggle');
    const closeMenuBtn = document.getElementById('closeMenu');
    const showOrderBtn = document.getElementById('showOrderBtn');
    const closeOrderSummaryBtn = document.getElementById('closeOrderSummary');
    const clearOrderBtn = document.getElementById('clearOrderBtn');
    const modelList = document.getElementById('modelList');

    // Initialize the DESR SDK
    let desr;

    // Initialize the application
    function initApp() {
        // Set up welcome screen event listeners
        confirmTableBtn.addEventListener('click', handleTableConfirmation);
        tableNumberInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleTableConfirmation();
            }
        });

        // Language selector change
        languageSelector.addEventListener('change', changeLanguage);
    }

    // Handle table confirmation
    function handleTableConfirmation() {
        const tableNumber = parseInt(tableNumberInput.value);
        
        if (tableNumber >= 1 && tableNumber <= 17) {
            // Set the table number in the app
            sessionStorage.setItem('tableNumber', tableNumber);
            
            // Switch to AR view
            welcomeScreen.classList.remove('active');
            arViewScreen.classList.add('active');
            
            // Initialize the SDK after a small delay to ensure UI is ready
            setTimeout(initializeSDK, 100);
        } else {
            alert('Please enter a valid table number (1-17)');
        }
    }

    // Initialize the DESR SDK
    async function initializeSDK() {
        try {
            // Get saved table number
            const savedTableNumber = sessionStorage.getItem('tableNumber') || 1;
            
            // Create SDK instance with custom configuration
            desr = new DesrSDK({
                containerId: 'arContainer',
                language: languageSelector.value,
                assetPath: 'assets/models/', // This would be where 3D models are stored
                
                // Custom model configurations (using placeholders for now)
                models: {
                    meal: {
                        path: 'sample_model.glb', // Placeholder for actual model
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
                        path: 'sample_model2.glb', // Placeholder for actual model
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
                        path: 'sample_model3.glb', // Placeholder for actual model
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
                        path: 'sample_model4.glb', // Placeholder for actual model
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
                        path: 'sample_model5.glb', // Placeholder for actual model
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
                        path: 'sample_model6.glb', // Placeholder for actual model
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

                // Event callbacks
                onInit: (sdk) => {
                    console.log('✅ DESR SDK initialized!');
                    
                    // Set the table number after initialization
                    sdk.setTableNumber(parseInt(savedTableNumber));
                    
                    // Populate model list
                    populateModelList();
                },
                
                onModelLoad: (modelKey, config, model) => {
                    console.log('📦 Model loaded:', modelKey);
                },
                
                onModelSwitch: (direction, modelKey) => {
                    console.log(`🔄 Switched ${direction} to model:`, modelKey);
                },
                
                onOrderAdd: (order) => {
                    console.log('🍜 Order added:', order);
                    showNotification(`${order.name} added to your order!`);
                },
                
                onLanguageChange: (newLang, oldLang) => {
                    console.log(`🗣️ Language changed from ${oldLang} to ${newLang}`);
                },
                
                onError: (error) => {
                    console.error('❌ SDK Error:', error);
                    showNotification('An error occurred. Please try again.', 'error');
                }
            });

            // Initialize the SDK
            await desr.init();
            
            // Set up additional event listeners after SDK is initialized
            setupEventListeners();
            
        } catch (error) {
            console.error('Failed to initialize SDK:', error);
            showNotification('Failed to initialize AR viewer. Please ensure camera permissions are granted.', 'error');
        }
    }

    // Set up additional event listeners
    function setupEventListeners() {
        // Navigation buttons
        prevModelBtn.addEventListener('click', () => {
            desr.previousModel();
        });
        
        nextModelBtn.addEventListener('click', () => {
            desr.nextModel();
        });
        
        // Order button
        orderButton.addEventListener('click', () => {
            desr.addOrder();
        });
        
        // Menu toggle
        menuToggle.addEventListener('click', () => {
            document.getElementById('menuPanel').classList.toggle('active');
        });
        
        closeMenuBtn.addEventListener('click', () => {
            document.getElementById('menuPanel').classList.remove('active');
        });
        
        // Order summary
        showOrderBtn.addEventListener('click', () => {
            document.getElementById('orderSummary').classList.add('visible');
        });
        
        closeOrderSummaryBtn.addEventListener('click', () => {
            document.getElementById('orderSummary').classList.remove('visible');
        });
        
        // Clear order
        clearOrderBtn.addEventListener('click', () => {
            desr.clearOrders();
            showNotification('Order cleared');
        });
        
        // Click outside menu to close it
        document.addEventListener('click', (e) => {
            const menuPanel = document.getElementById('menuPanel');
            const menuToggle = document.getElementById('menuToggle');
            
            if (!menuPanel.contains(e.target) && !menuToggle.contains(e.target) && menuPanel.classList.contains('active')) {
                menuPanel.classList.remove('active');
            }
        });
        
        // Click outside order summary to close it
        document.addEventListener('click', (e) => {
            const orderSummary = document.getElementById('orderSummary');
            const showOrderBtn = document.getElementById('showOrderBtn');
            
            if (!orderSummary.contains(e.target) && !showOrderBtn.contains(e.target) && orderSummary.classList.contains('visible')) {
                orderSummary.classList.remove('visible');
            }
        });
        
        // Add event delegation for model list items
        modelList.addEventListener('click', (e) => {
            if (e.target.tagName === 'LI' || e.target.parentElement.tagName === 'LI') {
                const listItem = e.target.tagName === 'LI' ? e.target : e.target.parentElement;
                const modelKey = listItem.dataset.modelKey;
                
                if (modelKey) {
                    desr.loadModel(modelKey);
                    document.getElementById('menuPanel').classList.remove('active');
                }
            }
        });
        
        // Add event delegation for delete order buttons
        document.getElementById('orderList').addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-order-btn')) {
                const orderId = e.target.getAttribute('data-order-id');
                desr.orderManager.removeOrder(orderId);
                showNotification('Item removed from order');
            }
        });
    }

    // Change language
    function changeLanguage() {
        if (desr) {
            desr.setLanguage(languageSelector.value);
        }
    }

    // Populate model list for menu
    function populateModelList() {
        if (!desr) return;
        
        const models = desr.config.models;
        modelList.innerHTML = '';
        
        Object.keys(models).forEach(key => {
            const model = models[key];
            const li = document.createElement('li');
            li.textContent = desr.languageManager.getText(model.nameKey);
            li.dataset.modelKey = key;
            modelList.appendChild(li);
        });
    }

    // Show notification
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'error' ? '#f44336' : '#4CAF50'};
            color: white;
            border-radius: 5px;
            z-index: 1000;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            animation: slideIn 0.3s, fadeOut 0.5s 2.5s forwards;
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after animation
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Add CSS for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Initialize the app
    initApp();

    // For demo purposes, if we're on the AR screen already (refreshed page), 
    // check if we have a table number in session storage
    if (sessionStorage.getItem('tableNumber')) {
        welcomeScreen.classList.remove('active');
        arViewScreen.classList.add('active');
        setTimeout(initializeSDK, 100);
    }
});