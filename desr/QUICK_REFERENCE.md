# Desr SDK - Quick Reference

## Installation

```bash
npm install
npm run build
```

## Basic Usage

```javascript
const desr = new DesrSDK({
  containerId: 'ar-container',
  language: 'en',
  assetPath: 'assets/models/'
});

await desr.init();
```

## Common Methods

```javascript
// Model control
await desr.loadModel('meal2');
await desr.nextModel();
await desr.previousModel();

// Orders
desr.addOrder();
desr.getOrders();
desr.clearOrders();

// Language
desr.setLanguage('ja');

// AR control
desr.startAR();
desr.stopAR();

// Cleanup
desr.destroy();
```

## Event Callbacks

```javascript
{
  onInit: (sdk) => {},
  onModelLoad: (key, config, model) => {},
  onModelSwitch: (direction, key) => {},
  onOrderAdd: (order) => {},
  onLanguageChange: (newLang, oldLang) => {},
  onError: (error) => {}
}
```

## File Structure

```
desr/
├── src/          # Source code
├── dist/         # Built SDK (after npm run build)
├── examples/     # Integration examples
├── types/        # TypeScript definitions
├── assets/       # 3D models
└── styles/       # CSS
```

## Build Commands

```bash
npm run build       # Build production
npm run build:dev   # Build development
npm run watch       # Watch mode
npm run serve       # Serve examples
```

## Required Dependencies

- Three.js (r128)
- GLTFLoader
- DRACOLoader

## Browser Support

Chrome 91+, Firefox 88+, Safari 14+, Edge 91+
