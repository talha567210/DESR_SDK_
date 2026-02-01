# Desr AR SDK

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A powerful AR (Augmented Reality) Restaurant Viewer SDK for displaying 3D food models with multi-language support, order management, and interactive UI.

## Features

✨ **AR Visualization** - Display 3D models in augmented reality using device camera  
🌍 **Multi-language Support** - Built-in translations for English, Japanese, and more  
📱 **Responsive Design** - Works on desktop and mobile devices  
🎨 **Customizable** - Fully configurable models, UI, and styling  
📦 **Order Management** - Track and manage customer orders  
🚀 **Easy Integration** - Simple API for quick implementation  

## Installation

### NPM

```bash
npm install desr-ar-sdk
```

### CDN

```html
<script src="https://unpkg.com/three@0.128.0/build/three.min.js"></script>
<script src="path/to/desr.min.js"></script>
```

### Local

Download the SDK and include it in your project:

```html
<script src="path/to/dist/desr.js"></script>
```

## Quick Start

### 1. Setup HTML Container

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Desr AR Demo</title>
  <link rel="stylesheet" href="path/to/styles/style.css">
</head>
<body>
  <div id="ar-container">
    <video id="video" autoplay muted playsinline></video>
    <canvas id="ar-canvas"></canvas>
    
    <!-- UI Elements -->
    <div id="modelNameDisplay" class="model-name-display">
      <h1 id="modelNameText" class="model-name-text"></h1>
    </div>
    
    <div id="modelDescriptionDisplay" class="model-description-display">
      <p id="modelDescriptionText" class="model-description-text"></p>
      <p id="modelPriceText" class="model-price-text"></p>
      <button id="orderButton" class="order-button">Order</button>
    </div>
    
    <div id="loadingOverlay" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <div id="loadingText" class="loading-text">Loading...</div>
        <div id="loadingProgress" class="loading-progress"></div>
      </div>
    </div>
    
    <div id="errorMessage" class="error-message"></div>
  </div>

  <script src="https://unpkg.com/three@0.128.0/build/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/DRACOLoader.js"></script>
  <script src="path/to/dist/desr.js"></script>
</body>
</html>
```

### 2. Initialize SDK

```javascript
// Create SDK instance
const desr = new DesrSDK({
  containerId: 'ar-container',
  language: 'en',
  assetPath: 'assets/models/',
  
  // Optional: Custom model configurations
  models: {
    meal: {
      path: 'meal_draco.glb',
      position: { x: 0, y: -0.1, z: -0.8 },
      scale: { x: 0.20, y: 0.20, z: 0.20 },
      nameKey: 'misoRamenName',
      descriptionKey: 'misoRamenDescription',
      price: '¥1,000'
    }
  },

  // Event callbacks
  onModelLoad: (modelKey, config, model) => {
    console.log('Model loaded:', modelKey);
  },
  
  onOrderAdd: (order) => {
    console.log('Order added:', order);
  }
});

// Initialize and start
desr.init().then(() => {
  console.log('SDK initialized!');
});
```

## API Reference

### `DesrSDK`

Main SDK class for controlling the AR viewer.

#### Constructor

```javascript
new DesrSDK(config?: DesrConfig)
```

#### Methods

- **`init()`** - Initialize the SDK and AR viewer
  ```javascript
  await desr.init();
  ```

- **`loadModel(modelKey)`** - Load a specific 3D model
  ```javascript
  await desr.loadModel('meal2');
  ```

- **`nextModel()`** - Switch to next model
  ```javascript
  await desr.nextModel();
  ```

- **`previousModel()`** - Switch to previous model
  ```javascript
  await desr.previousModel();
  ```

- **`setLanguage(language)`** - Change UI language
  ```javascript
  desr.setLanguage('ja'); // Switch to Japanese
  ```

- **`addOrder()`** - Add current model to orders
  ```javascript
  const order = desr.addOrder();
  ```

- **`getOrders()`** - Get all orders
  ```javascript
  const orders = desr.getOrders();
  ```

- **`clearOrders()`** - Clear all orders
  ```javascript
  desr.clearOrders();
  ```

- **`setTableNumber(number)`** - Set table number
  ```javascript
  desr.setTableNumber(5);
  ```

- **`startAR()`** - Start AR rendering
  ```javascript
  desr.startAR();
  ```

- **`stopAR()`** - Stop AR rendering
  ```javascript
  desr.stopAR();
  ```

- **`destroy()`** - Cleanup and dispose SDK
  ```javascript
  desr.destroy();
  ```

## Configuration

### Model Configuration

```javascript
{
  path: 'model.glb',           // Model file path
  position: { x: 0, y: 0, z: -1 },  // 3D position
  rotation: { x: 0, y: 0, z: 0 },   // 3D rotation
  scale: { x: 1, y: 1, z: 1 },      // 3D scale
  autoRotate: true,             // Enable auto-rotation
  rotationSpeed: 0.003,         // Rotation speed
  nameKey: 'modelName',         // Translation key for name
  descriptionKey: 'modelDesc',  // Translation key for description
  price: '$10.00'              // Price string
}
```

### Event Callbacks

- `onInit(sdk)` - Called after SDK initialization
- `onModelLoad(modelKey, config, model)` - Called when model is loaded
- `onModelSwitch(direction, modelKey)` - Called when switching models
- `onOrderAdd(order)` - Called when order is added
- `onLanguageChange(newLang, oldLang)` - Called when language changes
- `onError(error)` - Called on errors

## Examples

See the `examples/` directory for complete integration examples:

- **basic-integration.html** - Minimal setup
- **custom-config.html** - Advanced configuration
- **react-integration.jsx** - React integration

## Browser Support

- Chrome 91+
- Firefox 88+
- Safari 14+
- Edge 91+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

## License

MIT

## Credits

Built with [Three.js](https://threejs.org/)
