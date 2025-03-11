/**
 * UI Manager Module
 * 
 * Handles UI-related functionality like showing alerts, success messages, and navigating between sections.
 */

const UiManager = {
    /**
     * Initialize the UI manager
     */
    initialize: function() {
        this.initializeEventHandlers();
    },
    
    /**
     * Initialize event handlers for UI-related functionality
     */
    initializeEventHandlers: function() {
        const backToKeywordsBtn = document.getElementById('backToKeywordsBtn');
        const nextBtn = document.getElementById('nextBtn');
        const backBtn = document.getElementById('backBtn');
        
        // Back to keywords button click handler
        if (backToKeywordsBtn) {
            backToKeywordsBtn.addEventListener('click', function(e) {
                e.preventDefault();
                UiManager.navigateToKeywords();
            });
        }
        
        // Next button click handler
        if (nextBtn) {
            nextBtn.addEventListener('click', function(e) {
                e.preventDefault();
                UiManager.navigateToCompetencies();
            });
        }
        
        // Back button click handler
        if (backBtn) {
            backBtn.addEventListener('click', function(e) {
                e.preventDefault();
                UiManager.navigateToCareerProfile();
            });
        }
    },
    
    /**
     * Show an alert message
     * 
     * @param {string} message - The message to show
     */
    showAlert: function(message) {
        const alertContainer = document.createElement('div');
        alertContainer.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50';
        alertContainer.setAttribute('role', 'alert');
        
        const alertContent = document.createElement('div');
        alertContent.className = 'flex items-center';
        
        const alertIcon = document.createElement('div');
        alertIcon.className = 'mr-2';
        alertIcon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
        `;
        
        const alertText = document.createElement('p');
        alertText.textContent = message;
        
        const closeButton = document.createElement('button');
        closeButton.className = 'ml-auto';
        closeButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        `;
        closeButton.addEventListener('click', function() {
            document.body.removeChild(alertContainer);
        });
        
        alertContent.appendChild(alertIcon);
        alertContent.appendChild(alertText);
        alertContent.appendChild(closeButton);
        alertContainer.appendChild(alertContent);
        
        document.body.appendChild(alertContainer);
        
        // Auto-remove after 5 seconds
        setTimeout(function() {
            if (document.body.contains(alertContainer)) {
                document.body.removeChild(alertContainer);
            }
        }, 5000);
    },
    
    /**
     * Show a success message
     * 
     * @param {string} message - The message to show
     */
    showSuccessMessage: function(message) {
        const successContainer = document.createElement('div');
        successContainer.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50';
        successContainer.setAttribute('role', 'alert');
        
        const successContent = document.createElement('div');
        successContent.className = 'flex items-center';
        
        const successIcon = document.createElement('div');
        successIcon.className = 'mr-2';
        successIcon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
        `;
        
        const successText = document.createElement('p');
        successText.textContent = message;
        
        const closeButton = document.createElement('button');
        closeButton.className = 'ml-auto';
        closeButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        `;
        closeButton.addEventListener('click', function() {
            document.body.removeChild(successContainer);
        });
        
        successContent.appendChild(successIcon);
        successContent.appendChild(successText);
        successContent.appendChild(closeButton);
        successContainer.appendChild(successContent);
        
        document.body.appendChild(successContainer);
        
        // Auto-remove after 5 seconds
        setTimeout(function() {
            if (document.body.contains(successContainer)) {
                document.body.removeChild(successContainer);
            }
        }, 5000);
    },
    
    /**
     * Navigate to the keywords section
     */
    navigateToKeywords: function() {
        // Hide other sections
        document.getElementById('careerProfileSection').classList.add('hidden');
        document.getElementById('coreCompetenciesSection').classList.add('hidden');
        
        // Show keywords section
        document.getElementById('keywordsSection').classList.remove('hidden');
        
        // Scroll to the top of the keywords section
        document.getElementById('keywordsSection').scrollIntoView({ behavior: 'smooth' });
    },
    
    /**
     * Navigate to the career profile section
     */
    navigateToCareerProfile: function() {
        // Hide other sections
        document.getElementById('keywordsSection').classList.add('hidden');
        document.getElementById('coreCompetenciesSection').classList.add('hidden');
        
        // Show career profile section
        document.getElementById('careerProfileSection').classList.remove('hidden');
        
        // Scroll to the top of the career profile section
        document.getElementById('careerProfileSection').scrollIntoView({ behavior: 'smooth' });
    },
    
    /**
     * Navigate to the core competencies section
     */
    navigateToCompetencies: function() {
        // Hide other sections
        document.getElementById('keywordsSection').classList.add('hidden');
        document.getElementById('careerProfileSection').classList.add('hidden');
        
        // Show core competencies section
        document.getElementById('coreCompetenciesSection').classList.remove('hidden');
        
        // Scroll to the top of the core competencies section
        document.getElementById('coreCompetenciesSection').scrollIntoView({ behavior: 'smooth' });
    },
    
    /**
     * Display highlighted job description
     * 
     * @param {string} highlightedText - The highlighted job description HTML
     */
    displayHighlightedJobDescription: function(highlightedText) {
        const container = document.createElement('div');
        container.className = 'mt-4 p-4 bg-white rounded-md shadow-sm';
        container.style.border = '1px solid rgba(46, 204, 113, 0.3)';
        
        const header = document.createElement('h3');
        header.className = 'text-sm font-semibold text-gray-700 mb-2 flex items-center';
        header.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" style="color: #2ECC71;" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
            </svg>
            Highlighted Keywords in Job Description
        `;
        
        const description = document.createElement('p');
        description.className = 'text-xs text-gray-600 mb-3';
        description.textContent = 'Keywords from the job description are highlighted based on priority. You can select text to add it as a keyword.';
        
        const content = document.createElement('div');
        content.className = 'text-sm p-3 bg-gray-50 rounded overflow-auto max-h-96';
        content.innerHTML = highlightedText;
        
        // Add CSS for the highlighted keywords
        const style = document.createElement('style');
        style.textContent = `
            .high-priority-keyword {
                background-color: rgba(239, 68, 68, 0.2);
                border-bottom: 2px solid rgba(239, 68, 68, 0.5);
                padding: 0 2px;
                border-radius: 2px;
            }
            .medium-priority-keyword {
                background-color: rgba(245, 158, 11, 0.2);
                border-bottom: 2px solid rgba(245, 158, 11, 0.5);
                padding: 0 2px;
                border-radius: 2px;
            }
            .low-priority-keyword {
                background-color: rgba(59, 130, 246, 0.2);
                border-bottom: 2px solid rgba(59, 130, 246, 0.5);
                padding: 0 2px;
                border-radius: 2px;
            }
        `;
        
        container.appendChild(header);
        container.appendChild(description);
        container.appendChild(content);
        document.head.appendChild(style);
        
        // Create a container for the highlighted job description
        const highlightedJobDescriptionSection = document.getElementById('highlightedJobDescriptionSection');
        if (!highlightedJobDescriptionSection) {
            const newSection = document.createElement('div');
            newSection.id = 'highlightedJobDescriptionSection';
            newSection.className = 'mt-4';
            
            // Find the extracted keywords container
            const extractedKeywordsContainer = document.getElementById('extractedKeywordsContainer');
            if (extractedKeywordsContainer) {
                extractedKeywordsContainer.parentNode.insertBefore(newSection, extractedKeywordsContainer);
            } else {
                // Fallback to appending to the keywords section
                document.getElementById('keywordsSection').appendChild(newSection);
            }
            
            newSection.appendChild(container);
        } else {
            // Clear existing content and append the new container
            highlightedJobDescriptionSection.innerHTML = '';
            highlightedJobDescriptionSection.appendChild(container);
        }
    }
};

// Export the module
window.UiManager = UiManager;
