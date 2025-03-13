/**
 * guide-panel.js - Handles the Guide Me panel functionality
 * 
 * This module provides a step-by-step guide for users to create their tailored resume.
 * It coordinates with the main application to provide a streamlined workflow.
 * 
 * This file has been refactored to use modular components:
 * - guide-citations-manager.js: Handles citations functionality
 * - guide-step-manager.js: Manages step activation and UI updates
 * - guide-event-handlers.js: Handles event handlers for the guide panel
 * - guide-utils.js: Utility functions for the guide panel
 */

// GuidePanel Module - Main entry point
const GuidePanel = (function() {
    // Private variables
    let initialized = false;
    
    // Initialize the module
    function initialize() {
        if (initialized) return;
        
        document.addEventListener('DOMContentLoaded', function() {
            setupEventListeners();
            
            // Initialize all sub-modules
            GuideUtils && typeof GuideUtils.initialize === 'function' && GuideUtils.initialize();
            GuideStepManager && typeof GuideStepManager.initialize === 'function' && GuideStepManager.initialize();
            GuideCitationsManager && typeof GuideCitationsManager.initialize === 'function' && GuideCitationsManager.initialize();
            GuideEventHandlers && typeof GuideEventHandlers.initialize === 'function' && GuideEventHandlers.initialize();
            
            initialized = true;
        });
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Add event listeners to guide buttons
        const buttons = {
            'guideExtractKeywordsBtn': GuideEventHandlers.handleExtractKeywords,
            'guideAddKeywordBtn': GuideEventHandlers.handleAddKeyword,
            'guideContinueBtn': GuideEventHandlers.handleContinueToGeneration,
            'guideGenerateProfileBtn': GuideEventHandlers.handleGenerateProfile,
            'guideGenerateCompetenciesBtn': GuideEventHandlers.handleGenerateCompetencies,
            'guideSaveProfileBtn': GuideEventHandlers.handleSaveProfile,
            'guideSaveCompetenciesBtn': GuideEventHandlers.handleSaveCompetencies,
            'guideSaveCitationsBtn': GuideEventHandlers.handleSaveCitations
        };
        
        // Add click handlers for all buttons
        Object.keys(buttons).forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', buttons[buttonId]);
            }
        });
        
        // Connect guide keyword input with main keyword input
        const guideKeywordInput = document.getElementById('guideNewKeywordInput');
        if (guideKeywordInput) {
            guideKeywordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    GuideEventHandlers.handleAddKeyword();
                }
            });
        }
        
        // Update the button text to "Generate Citations"
        const continueBtn = document.getElementById('guideContinueBtn');
        if (continueBtn) {
            continueBtn.textContent = 'Generate Citations';
        }
    }
    
    // Public API
    return {
        initialize: initialize,
        
        // Expose event handlers for external use
        handleExtractKeywords: function() {
            GuideEventHandlers.handleExtractKeywords();
        },
        handleAddKeyword: function() {
            GuideEventHandlers.handleAddKeyword();
        },
        handleContinueToGeneration: function() {
            GuideEventHandlers.handleContinueToGeneration();
        },
        handleGenerateCitations: function() {
            console.log('GuidePanel.handleGenerateCitations called');
            if (GuideCitationsManager && typeof GuideCitationsManager.handleGenerateCitations === 'function') {
                GuideCitationsManager.handleGenerateCitations();
            } else {
                console.error('GuideCitationsManager.handleGenerateCitations not available');
                GuideUtils.showAlert('Citation generation function not available. Please refresh the page and try again.');
            }
        },
        handleGenerateProfile: function() {
            GuideEventHandlers.handleGenerateProfile();
        },
        handleGenerateCompetencies: function() {
            GuideEventHandlers.handleGenerateCompetencies();
        },
        handleSaveProfile: function() {
            GuideEventHandlers.handleSaveProfile();
        },
        handleSaveCompetencies: function() {
            GuideEventHandlers.handleSaveCompetencies();
        },
        handleSaveCitations: function() {
            GuideEventHandlers.handleSaveCitations();
        },
        
        // Expose utility functions
        showAlert: function(message) {
            GuideUtils.showAlert(message);
        },
        showSuccessMessage: function(message) {
            GuideUtils.showSuccessMessage(message);
        },
        
        // Expose step management
        activateStep: function(stepNumber) {
            GuideStepManager.activateStep(stepNumber);
        }
    };
})();

// Initialize the GuidePanel module
GuidePanel.initialize();
