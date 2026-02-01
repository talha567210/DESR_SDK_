/**
 * UI Manager - Handles DOM elements and user interface
 */
export class UIManager {
    constructor(languageManager) {
        this.languageManager = languageManager;
        this.elements = {};
    }

    /**
     * Initialize UI elements
     */
    init() {
        // Store references to key UI elements
        this.elements = {
            modelName: document.getElementById('modelNameText'),
            modelDescription: document.getElementById('modelDescriptionText'),
            modelPrice: document.getElementById('modelPriceText'),
            orderButton: document.getElementById('orderButton'),
            menuPanel: document.getElementById('menuPanel'),
            menuTrigger: document.getElementById('menuTrigger'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            loadingText: document.getElementById('loadingText'),
            loadingProgress: document.getElementById('loadingProgress'),
            errorMessage: document.getElementById('errorMessage'),
            tableNumberDisplay: document.getElementById('tableNumberDisplay'),
            tableNumberText: document.getElementById('tableNumberText'),
            orderSummaryOverlay: document.getElementById('orderSummaryOverlay'),
            orderList: document.getElementById('orderList'),
            totalAmount: document.getElementById('totalAmount')
        };

        return this;
    }

    /**
     * Show model information
     * @param {Object} modelConfig - Model configuration with nameKey, descriptionKey, price
     */
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

    /**
     * Hide model information
     */
    hideModelInfo() {
        const { modelName, modelDescription, modelPrice } = this.elements;

        if (modelName) modelName.parentElement.classList.remove('visible');
        if (modelDescription) modelDescription.parentElement.classList.remove('visible');
        if (modelPrice) modelPrice.classList.remove('visible');
    }

    /**
     * Show loading overlay
     * @param {string} message - Loading message
     * @param {string} progress - Progress text
     */
    showLoading(message = 'Loading...', progress = '') {
        const { loadingOverlay, loadingText, loadingProgress } = this.elements;

        if (loadingOverlay) loadingOverlay.style.display = 'flex';
        if (loadingText) loadingText.textContent = message;
        if (loadingProgress) loadingProgress.textContent = progress;
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        const { loadingOverlay } = this.elements;
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    }

    /**
     * Show error message
     * @param {string} message - Error message
     * @param {number} duration - Duration to show (ms)
     */
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

    /**
     * Update table number display
     * @param {number} tableNumber - Table number
     */
    updateTableNumber(tableNumber) {
        const { tableNumberText, tableNumberDisplay } = this.elements;

        if (tableNumberText) {
            tableNumberText.textContent = `${this.languageManager.getText('tableText')} ${tableNumber}`;
        }

        if (tableNumberDisplay) {
            tableNumberDisplay.classList.add('visible');
        }
    }

    /**
     * Update order list UI
     * @param {Array} orders - Array of orders
     */
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

    /**
     * Toggle menu panel
     */
    toggleMenuPanel() {
        const { menuPanel } = this.elements;
        if (menuPanel) {
            menuPanel.classList.toggle('active');
        }
    }

    /**
     * Show order summary overlay
     */
    showOrderSummary() {
        const { orderSummaryOverlay } = this.elements;
        if (orderSummaryOverlay) {
            orderSummaryOverlay.classList.add('visible');
        }
    }

    /**
     * Hide order summary overlay
     */
    hideOrderSummary() {
        const { orderSummaryOverlay } = this.elements;
        if (orderSummaryOverlay) {
            orderSummaryOverlay.classList.remove('visible');
        }
    }

    /**
     * Get UI element by ID
     */
    getElement(id) {
        return this.elements[id] || document.getElementById(id);
    }
}

export default UIManager;
