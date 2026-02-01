// Main SDK entry point
import DesrSDK from './DesrSDK.js';
import { LanguageManager } from './core/LanguageManager.js';
import { OrderManager } from './core/OrderManager.js';
import { ARViewer } from './core/ARViewer.js';
import { ModelLoader } from './core/ModelLoader.js';
import defaultConfig from './config/defaultConfig.js';

// Export main SDK class as default
export default DesrSDK;

// Export individual components for advanced usage
export {
    DesrSDK,
    LanguageManager,
    OrderManager,
    ARViewer,
    ModelLoader,
    defaultConfig
};

// Auto-inject CSS if in browser environment
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Check if user wants to disable auto CSS injection
    if (!window.DESR_DISABLE_AUTO_CSS) {
        import('../styles/style.css');
    }
}
