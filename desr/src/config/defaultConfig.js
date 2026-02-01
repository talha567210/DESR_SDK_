// Default configuration for the SDK
export const defaultConfig = {
    // Container element ID
    containerId: 'ar-container',

    // Default language
    language: 'en',

    // Asset paths
    assetPath: 'assets/models/',
    dracoDecoderPath: 'https://www.gstatic.com/draco/v1/decoders/',

    // Camera settings
    camera: {
        fov: 75,
        near: 0.1,
        far: 1000
    },

    // Model configurations
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

    // UI settings
    ui: {
        showTableSelection: true,
        showLanguageSelection: true,
        showOrderButton: true,
        showMenuPanel: true,
        showNavigationArrows: true
    },

    // Event callbacks
    onModelLoad: null,
    onModelSwitch: null,
    onOrderAdd: null,
    onLanguageChange: null,
    onError: null
};

export default defaultConfig;
