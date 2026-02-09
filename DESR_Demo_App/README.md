# DESR AR Restaurant Demo

A demonstration application showcasing the DESR AR SDK for restaurant menu visualization in augmented reality.

## 🎯 About

This demo application demonstrates how to integrate the DESR AR SDK into a restaurant setting, allowing customers to view 3D models of menu items in augmented reality before ordering.

## 🚀 Features

- **Augmented Reality Menu**: View 3D models of food items overlaid on camera feed
- **Multi-language Support**: English and Japanese with easy extensibility
- **Order Management**: Add items to cart and track orders
- **Interactive Navigation**: Browse through menu items with intuitive controls
- **Table Management**: Assign orders to specific tables
- **Responsive Design**: Works on both desktop and mobile devices

## 🛠️ Tech Stack

- **JavaScript**: ES6+ with modular architecture
- **Three.js**: 3D graphics and rendering
- **WebGL**: Hardware-accelerated graphics
- **Device APIs**: Camera access for AR functionality
- **CSS3**: Responsive and animated UI elements

## 📋 Requirements

- Modern browser (Chrome 91+, Firefox 88+, Safari 14+, Edge 91+)
- Device with camera capability
- Internet connection (for CDN resources)

## 🏗️ Project Structure

```
DESR_Demo_App/
├── index.html          # Main application page
├── styles.css          # Styling for the app
├── desr-sdk.js         # Bundled DESR SDK
├── app.js              # Main application logic
├── assets/             # 3D models and media (to be added)
└── README.md           # This file
```

## 🚀 Getting Started

1. **Clone or download** this repository

2. **Install dependencies** (optional, uses CDN for Three.js):
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   
   Or simply open `index.html` in a compatible browser.

4. **Allow camera access** when prompted to enable AR functionality

5. **Enter your table number** and enjoy the AR menu experience!

## 🔧 Configuration

The application can be configured by modifying the settings in `app.js`. Key configuration options include:

- **Language**: Change default language (en/ja)
- **Models**: Add or modify 3D models with their paths and properties
- **UI Settings**: Customize the appearance and behavior of UI elements
- **Event Callbacks**: Handle various SDK events

## 📱 Usage

1. **Welcome Screen**: Enter your table number and select language
2. **AR View**: See 3D models of food items in augmented reality
3. **Navigation**: Use arrow buttons to browse menu items
4. **Ordering**: Tap "Order" button to add items to your cart
5. **Menu Panel**: Access all menu items via the menu button
6. **Order Summary**: View and manage your orders

## ⚠️ Notes

- For the demo to work with real 3D models, you'll need to place `.glb` or `.gltf` files in an `assets/models/` directory
- Camera access is required for the AR functionality to work
- Performance may vary depending on device capabilities

## 📄 License

MIT License - Feel free to use and modify for your own projects.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.