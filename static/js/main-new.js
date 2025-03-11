/**
 * Main JavaScript file for dumped2hire
 * 
 * This file initializes all the modules and sets up global state.
 */

// Global variables to store extracted keywords and enhanced data
window.extractedKeywords = [];
window.keywordsData = {
    keywords: {
        high_priority: [],
        medium_priority: [],
        low_priority: []
    },
    missing_keywords: [],
    clusters: {}
};

// Global variable to store citations for interview prep
window.citationsData = {
    keywords: {},
    career_profile: {},
    core_competencies: {}
};

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl+Enter to submit the form
        if (e.ctrlKey && e.key === 'Enter') {
            const form = document.getElementById('generatorForm');
            if (form) {
                const submitEvent = new Event('submit', {
                    'bubbles': true,
                    'cancelable': true
                });
                form.dispatchEvent(submitEvent);
            }
        }
    });
    
    // Initialize all modules
    if (window.ApiService) {
        console.log('API Service module loaded');
    } else {
        console.error('API Service module not loaded');
    }
    
    if (window.UiManager) {
        console.log('UI Manager module loaded');
        UiManager.initialize();
    } else {
        console.error('UI Manager module not loaded');
    }
    
    if (window.KeywordManager) {
        console.log('Keyword Manager module loaded');
        KeywordManager.initialize();
    } else {
        console.error('Keyword Manager module not loaded');
    }
    
    if (window.ProfileManager) {
        console.log('Profile Manager module loaded');
        ProfileManager.initialize();
    } else {
        console.error('Profile Manager module not loaded');
    }
    
    if (window.CompetenciesManager) {
        console.log('Competencies Manager module loaded');
        CompetenciesManager.initialize();
    } else {
        console.error('Competencies Manager module not loaded');
    }
    
    if (window.CitationsManager) {
        console.log('Citations Manager module loaded');
        CitationsManager.initialize();
    } else {
        console.error('Citations Manager module not loaded');
    }
    
    console.log('Application initialized');
});
