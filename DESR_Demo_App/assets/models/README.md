# 3D Models for DESR AR Restaurant Demo

This directory is intended to store 3D models for use with the DESR AR SDK. The demo application expects specific model files to be present for full functionality.

## Expected Model Files

The application expects the following model files:

- `sample_model.glb` - Main dish model (placeholder)
- `sample_model2.glb` - Second dish model (placeholder)
- `sample_model3.glb` - Third dish model (placeholder)
- `sample_model4.glb` - Fourth dish model (placeholder)
- `sample_model5.glb` - Fifth dish model (placeholder)
- `sample_model6.glb` - Sixth dish model (placeholder)

## Adding Your Own Models

To use your own 3D models:

1. Place your `.glb` or `.gltf` files in this directory
2. Update the model paths in `app.js` to match your file names
3. Ensure your models are optimized for web use (small file sizes, appropriate poly counts)

## Model Specifications

- Format: `.glb` (preferred) or `.gltf`
- Size: Keep under 10MB per model for optimal loading
- Polygons: Optimize for mobile devices (under 50k triangles recommended)
- Textures: Compressed formats (JPEG/PNG) with reasonable dimensions
- Animation: Keep animations simple or bake them into the model

## Sample Models

For testing purposes, you can find sample food models from sources like:
- Sketchfab (free models with attribution)
- TurboSquid
- CGTrader
- Google Poly (archived but still accessible)

## Optimization Tips

- Use texture atlasing to combine multiple textures
- Reduce polygon count where possible
- Use Draco compression for smaller file sizes
- Bake lighting and shadows into textures when possible
- Keep animations simple to reduce computational overhead

## Configuration

To configure models in the application, modify the `models` section in `app.js`:

```javascript
models: {
    meal: {
        path: 'your_model.glb',  // Path to your model file
        position: { x: 0, y: -0.1, z: -0.8 },  // Position in AR space
        rotation: { x: 0.5, y: 0, z: 0 },      // Initial rotation
        scale: { x: 0.20, y: 0.20, z: 0.20 },  // Scale factor
        autoRotate: true,                        // Whether to auto-rotate
        rotationSpeed: 0.003,                   // Rotation speed
        nameKey: "misoRamenName",               // Translation key for name
        descriptionKey: "misoRamenDescription", // Translation key for description
        price: "¥1,000"                         // Price display
    }
    // ... additional models
}
```