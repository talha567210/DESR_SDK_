import { translations } from '../data/translations.js';

/**
 * Language Manager - Handles internationalization and translation
 */
export class LanguageManager {
    constructor(defaultLanguage = 'en', customTranslations = {}) {
        this.currentLanguage = defaultLanguage;
        this.translations = { ...translations, ...customTranslations };
        this.listeners = [];
    }

    /**
     * Get translated text for a given key
     * @param {string} key - Translation key
     * @returns {string} Translated text
     */
    getText(key) {
        const langTranslations = this.translations[this.currentLanguage];
        if (langTranslations && langTranslations[key]) {
            return langTranslations[key];
        }
        // Fallback to English
        if (this.translations.en && this.translations.en[key]) {
            return this.translations.en[key];
        }
        // Return key if no translation found
        return key;
    }

    /**
     * Set the current language
     * @param {string} language - Language code (e.g., 'en', 'ja')
     */
    setLanguage(language) {
        if (this.translations[language]) {
            const previousLanguage = this.currentLanguage;
            this.currentLanguage = language;
            this.notifyListeners(language, previousLanguage);
            return true;
        }
        console.warn(`Language not supported: ${language}`);
        return false;
    }

    /**
     * Get current language
     * @returns {string} Current language code
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Get all available languages
     * @returns {Array<string>} Array of language codes
     */
    getAvailableLanguages() {
        return Object.keys(this.translations);
    }

    /**
     * Add custom translations
     * @param {string} language - Language code
     * @param {Object} translations - Translation object
     */
    addTranslations(language, translations) {
        if (!this.translations[language]) {
            this.translations[language] = {};
        }
        this.translations[language] = { ...this.translations[language], ...translations };
    }

    /**
     * Add a language change listener
     * @param {Function} callback - Callback function (newLang, oldLang)
     */
    onLanguageChange(callback) {
        this.listeners.push(callback);
    }

    /**
     * Notify all listeners of language change
     * @private
     */
    notifyListeners(newLanguage, oldLanguage) {
        this.listeners.forEach(callback => {
            try {
                callback(newLanguage, oldLanguage);
            } catch (error) {
                console.error('Error in language change listener:', error);
            }
        });
    }
}

export default LanguageManager;
