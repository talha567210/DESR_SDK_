import * as THREE from 'three';

/**
 * Model Loader - Handles 3D model loading with GLTF/DRACO support
 */
export class ModelLoader {
    constructor(assetPath = 'assets/models/', dracoDecoderPath = 'https://www.gstatic.com/draco/v1/decoders/') {
        this.assetPath = assetPath;
        this.dracoDecoderPath = dracoDecoderPath;
        this.cache = new Map();
        this.isLoading = false;

        // Initialize loaders
        this.gltfLoader = new THREE.GLTFLoader();
        this.dracoLoader = new THREE.DRACOLoader();
        this.dracoLoader.setDecoderPath(dracoDecoderPath);
        this.gltfLoader.setDRACOLoader(this.dracoLoader);
    }

    /**
     * Load a 3D model
     * @param {string} modelPath - Path to the model file
     * @param {Function} onProgress - Progress callback
     * @returns {Promise<Object>} Loaded model data
     */
    async loadModel(modelPath, onProgress = null) {
        const fullPath = this.assetPath + modelPath;

        // Check cache first
        if (this.cache.has(fullPath)) {
            console.log(`Loading model from cache: ${fullPath}`);
            return Promise.resolve(this.cache.get(fullPath));
        }

        console.log(`Loading model: ${fullPath}`);
        this.isLoading = true;

        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                fullPath,
                (gltf) => {
                    console.log(`Model loaded successfully: ${fullPath}`);
                    this.cache.set(fullPath, gltf);
                    this.isLoading = false;
                    resolve(gltf);
                },
                (progress) => {
                    if (onProgress) {
                        const percentComplete = (progress.loaded / progress.total) * 100;
                        onProgress(percentComplete, progress);
                    }
                },
                (error) => {
                    console.error(`Error loading model ${fullPath}:`, error);
                    this.isLoading = false;
                    reject(error);
                }
            );
        });
    }

    /**
     * Preload multiple models
     * @param {Array<string>} modelPaths - Array of model paths
     * @param {Function} onProgress - Progress callback for each model
     * @returns {Promise<Array>} Array of loaded models
     */
    async preloadModels(modelPaths, onProgress = null) {
        const loadPromises = modelPaths.map((path, index) =>
            this.loadModel(path, (percent) => {
                if (onProgress) {
                    onProgress(index, path, percent);
                }
            })
        );

        return Promise.all(loadPromises);
    }

    /**
     * Check if a model is in cache
     * @param {string} modelPath - Path to the model
     * @returns {boolean} True if cached
     */
    isCached(modelPath) {
        return this.cache.has(this.assetPath + modelPath);
    }

    /**
     * Clear model cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get cache size
     * @returns {number} Number of cached models
     */
    getCacheSize() {
        return this.cache.size;
    }

    /**
     * Is currently loading a model
     * @returns {boolean}
     */
    getIsLoading() {
        return this.isLoading;
    }

    /**
     * Dispose of resources
     */
    dispose() {
        this.cache.clear();
        if (this.dracoLoader) {
            this.dracoLoader.dispose();
        }
    }
}

export default ModelLoader;
