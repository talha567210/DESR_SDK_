// TypeScript definitions for Desr AR SDK

export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export interface ModelConfig {
    path: string;
    position?: Vector3;
    rotation?: Vector3;
    scale?: Vector3;
    autoRotate?: boolean;
    rotationSpeed?: number;
    nameKey: string;
    descriptionKey: string;
    price: string;
}

export interface CameraConfig {
    fov?: number;
    near?: number;
    far?: number;
}

export interface UIConfig {
    showTableSelection?: boolean;
    showLanguageSelection?: boolean;
    showOrderButton?: boolean;
    showMenuPanel?: boolean;
    showNavigationArrows?: boolean;
}

export interface Order {
    id: string;
    modelKey: string;
    name: string;
    price: string;
    tableNumber?: number;
    timestamp: string;
    time: string;
}

export interface DesrConfig {
    containerId?: string;
    language?: string;
    assetPath?: string;
    dracoDecoderPath?: string;
    camera?: CameraConfig;
    models?: { [key: string]: ModelConfig };
    ui?: UIConfig;
    customTranslations?: { [lang: string]: { [key: string]: string } };
    autoLoadFirstModel?: boolean;
    onInit?: (sdk: DesrSDK) => void;
    onModelLoad?: (modelKey: string, config: ModelConfig, model: any) => void;
    onModelSwitch?: (direction: 'next' | 'previous', modelKey: string) => void;
    onOrderAdd?: (order: Order) => void;
    onLanguageChange?: (newLang: string, oldLang: string) => void;
    onError?: (error: Error) => void;
}

export class LanguageManager {
    constructor(defaultLanguage?: string, customTranslations?: any);
    getText(key: string): string;
    setLanguage(language: string): boolean;
    getCurrentLanguage(): string;
    getAvailableLanguages(): string[];
    addTranslations(language: string, translations: any): void;
    onLanguageChange(callback: (newLang: string, oldLang: string) => void): void;
}

export class OrderManager {
    constructor();
    addOrder(orderData: Partial<Order>): Order;
    removeOrder(orderId: string): boolean;
    clearOrders(): void;
    getOrders(): Order[];
    getTotalAmount(): number;
    getOrderCount(): number;
    onOrderChange(callback: (action: string, data: any) => void): void;
    exportOrders(): string;
}

export class ModelLoader {
    constructor(assetPath?: string, dracoDecoderPath?: string);
    loadModel(modelPath: string, onProgress?: (percent: number, progress: any) => void): Promise<any>;
    preloadModels(modelPaths: string[], onProgress?: (index: number, path: string, percent: number) => void): Promise<any[]>;
    isCached(modelPath: string): boolean;
    clearCache(): void;
    getCacheSize(): number;
    getIsLoading(): boolean;
    dispose(): void;
}

export class ARViewer {
    constructor(containerId: string, config?: any);
    init(): Promise<boolean>;
    loadModel(modelConfig: ModelConfig): Promise<any>;
    startRendering(): void;
    stopRendering(): void;
    getCurrentModel(): any;
    dispose(): void;
}

export class UIManager {
    constructor(languageManager: LanguageManager);
    init(): this;
    showModelInfo(modelConfig: ModelConfig): void;
    hideModelInfo(): void;
    showLoading(message?: string, progress?: string): void;
    hideLoading(): void;
    showError(message: string, duration?: number): void;
    updateTableNumber(tableNumber: number): void;
    updateOrderList(orders: Order[], totalAmount: number, currencySymbol?: string): void;
    toggleMenuPanel(): void;
    showOrderSummary(): void;
    hideOrderSummary(): void;
    getElement(id: string): HTMLElement | null;
}

export default class DesrSDK {
    constructor(userConfig?: DesrConfig);
    init(): Promise<boolean>;
    loadModel(modelKey: string): Promise<any>;
    nextModel(): Promise<void>;
    previousModel(): Promise<void>;
    setLanguage(language: string): boolean;
    addOrder(): Order;
    getOrders(): Order[];
    clearOrders(): void;
    setTableNumber(tableNumber: number): void;
    startAR(): void;
    stopAR(): void;
    destroy(): void;

    readonly languageManager: LanguageManager;
    readonly orderManager: OrderManager;
    readonly arViewer: ARViewer | null;
    readonly uiManager: UIManager | null;
    readonly config: DesrConfig;
}

export { DesrSDK };
