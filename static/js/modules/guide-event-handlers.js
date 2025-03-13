/**
 * guide-event-handlers.js - Event handlers for the Guide Me panel
 */

const GuideEventHandlers = {
    /**
     * Initialize event handlers
     */
    initialize: function() {
        // Add global click handler for Generate Citations button
        document.addEventListener('click', this.handleCitationsButtonClick);
    },
    
    /**
     * Handle clicks on the Generate Citations button
     * @param {Event} e - The click event
     */
    handleCitationsButtonClick: function(e) {
        // Check if the click was on or inside the Generate Citations button
        const citationsBtn = document.getElementById('guideGenerateCitationsBtn');
        if (citationsBtn && (e.target === citationsBtn || citationsBtn.contains(e.target))) {
            console.log('Generate Citations button clicked via global handler!');
            e.preventDefault();
            GuideCitationsManager.handleGenerateCitations();
            return;
        }
        
        // Also check for clicks on the button's text or icon
        if (e.target.closest && e.target.closest('#guideGenerateCitationsBtn')) {
            console.log('Generate Citations button clicked via delegation!');
            e.preventDefault();
            GuideCitationsManager.handleGenerateCitations();
            return;
        }
        
        // Check for clicks in the general area of the button (step 3)
        const step3Element = document.getElementById('guideStep3');
        if (step3Element && step3Element.contains(e.target)) {
            // Check if the click was on a button-like element
            if (e.target.tagName === 'BUTTON' || 
                e.target.parentElement.tagName === 'BUTTON' ||
                e.target.tagName === 'SVG' || 
                e.target.tagName === 'PATH' ||
                e.target.classList.contains('spinner')) {
                console.log('Potential Generate Citations button area clicked!');
                
                // Force a call to handleGenerateCitations
                setTimeout(() => {
                    GuideCitationsManager.handleGenerateCitations();
                }, 100);
            }
        }
    },
    
    /**
     * Handle Extract Keywords button click
     */
    handleExtractKeywords: function() {
        // Validate inputs
        const jobDescription = document.getElementById('jobDescription').value.trim();
        const masterResume = document.getElementById('masterResume').value.trim();
        
        if (!jobDescription) {
            GuideUtils.showAlert('Please paste a job description.');
            return;
        }
        
        // Directly extract keywords using the KeywordManager
        if (window.KeywordManager && typeof window.KeywordManager.extractKeywords === 'function') {
            window.KeywordManager.extractKeywords();
        } else {
            // Show error if the function is not available
            GuideUtils.showAlert('Extract keywords function not found. Please refresh the page and try again.');
        }
        
        // The application state change listeners will handle activating the next step
    },
    
    /**
     * Handle Add Keyword button click
     */
    handleAddKeyword: function() {
        const guideKeywordInput = document.getElementById('guideNewKeywordInput');
        const guidePrioritySelect = document.getElementById('guideNewKeywordPriority');
        
        // Update the main application's keyword input and priority
        document.getElementById('newKeywordInput').value = guideKeywordInput.value;
        document.getElementById('newKeywordPriority').value = guidePrioritySelect.value;
        
        // Trigger the add keyword action in the main application
        document.getElementById('addKeywordBtn').click();
        
        // Clear the guide input
        guideKeywordInput.value = '';
    },
    
    /**
     * Handle Continue to Generation button click
     */
    handleContinueToGeneration: function() {
        // Skip finding keywords in resume and go directly to generating citations
        GuideCitationsManager.handleGenerateCitations();
    },
    
    /**
     * Handle Generate Profile button click
     */
    handleGenerateProfile: function() {
        // Directly call the ProfileManager's generate function if available
        if (window.ProfileManager && typeof window.ProfileManager.generateProfile === 'function') {
            window.ProfileManager.generateProfile();
        } else {
            // Fallback to clicking the button if the direct method is not available
            document.getElementById('generateProfileBtn').click();
        }
    },
    
    /**
     * Handle Generate Competencies button click
     */
    handleGenerateCompetencies: function() {
        // Navigate to competencies section if not already there
        if (!document.getElementById('coreCompetenciesSection').classList.contains('hidden')) {
            // Already on competencies section
        } else if (!document.getElementById('careerProfileSection').classList.contains('hidden')) {
            // On career profile section, navigate to competencies
            const careerProfileSection = document.getElementById('careerProfileSection');
            const coreCompetenciesSection = document.getElementById('coreCompetenciesSection');
            
            if (careerProfileSection && coreCompetenciesSection) {
                careerProfileSection.classList.add('hidden');
                coreCompetenciesSection.classList.remove('hidden');
            } else {
                // Fallback to clicking the button
                document.getElementById('nextBtn').click();
            }
        } else {
            // Navigate to career profile first, then to competencies
            const keywordsSection = document.getElementById('keywordsSection');
            const careerProfileSection = document.getElementById('careerProfileSection');
            const coreCompetenciesSection = document.getElementById('coreCompetenciesSection');
            
            if (keywordsSection && careerProfileSection && coreCompetenciesSection) {
                keywordsSection.classList.add('hidden');
                careerProfileSection.classList.add('hidden');
                coreCompetenciesSection.classList.remove('hidden');
            }
        }
        
        // Directly call the CompetenciesManager's generate function if available
        setTimeout(() => {
            if (window.CompetenciesManager && typeof window.CompetenciesManager.generateCompetencies === 'function') {
                window.CompetenciesManager.generateCompetencies();
            } else {
                // Fallback to clicking the button if the direct method is not available
                document.getElementById('generateCompetenciesBtn').click();
            }
        }, 500);
    },
    
    /**
     * Handle Save Profile button click
     */
    handleSaveProfile: function() {
        // Trigger the save profile action in the main application
        document.getElementById('saveProfileBtn').click();
    },
    
    /**
     * Handle Save Competencies button click
     */
    handleSaveCompetencies: function() {
        // Navigate to competencies section if not already there
        if (document.getElementById('coreCompetenciesSection').classList.contains('hidden')) {
            const careerProfileSection = document.getElementById('careerProfileSection');
            const coreCompetenciesSection = document.getElementById('coreCompetenciesSection');
            
            if (careerProfileSection && coreCompetenciesSection) {
                careerProfileSection.classList.add('hidden');
                coreCompetenciesSection.classList.remove('hidden');
            } else {
                // Fallback to clicking the button
                document.getElementById('nextBtn').click();
            }
        }
        
        // Trigger the save competencies action in the main application
        document.getElementById('saveCompetenciesBtn').click();
    },
    
    /**
     * Handle Save Citations button click
     */
    handleSaveCitations: function() {
        // Trigger the save citations action in the main application
        document.getElementById('saveCitationsBtn').click();
    }
};

// Export the module
window.GuideEventHandlers = GuideEventHandlers;
