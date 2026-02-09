import * as THREE from 'three';
import { ModelLoader } from './ModelLoader.js';

/**
 * AR Viewer - Handles Three.js scene, camera, and AR rendering
 */
export class ARViewer {
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

    /**
     * Initialize AR viewer
     */
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

    /**
     * Setup lighting for the scene
     */
    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(5, 10, 7.5);
        this.scene.add(directionalLight);
    }

    /**
     * Setup video stream for AR background
     */
    async setupVideo() {
        this.video = document.createElement('video');
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
        container.insertBefore(this.video, container.firstChild);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });
            this.video.srcObject = stream;
        } catch (error) {
            console.error('Error accessing camera:', error);
            throw new Error('Camera access denied');
        }
    }

    /**
     * Load and display a 3D model
     * @param {Object} modelConfig - Model configuration
     * @returns {Promise<Object>} Loaded model
     */
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

    /**
     * Start rendering loop
     */
    startRendering() {
        if (!this.isArActive) {
            this.isArActive = true;
            this.animate();
        }
    }

    /**
     * Stop rendering loop
     */
    stopRendering() {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
        this.isArActive = false;
    }

    /**
     * Animation loop
     */
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

    /**
     * Handle window resize
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Get current model
     */
    getCurrentModel() {
        return this.currentModel;
    }

    /**
     * Cleanup and dispose resources
     */
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

export default ARViewer;
