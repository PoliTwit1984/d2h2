/**
 * Citations Manager Module
 * 
 * Handles citations display and management.
 */

const CitationsManager = {
    /**
     * Initialize the citations manager
     */
    initialize: function() {
        this.initializeEventHandlers();
    },
    
    /**
     * Initialize event handlers for citations-related functionality
     */
    initializeEventHandlers: function() {
        const saveCitationsBtn = document.getElementById('saveCitationsBtn');
        
        if (saveCitationsBtn) {
            saveCitationsBtn.addEventListener('click', function(e) {
                e.preventDefault();
                CitationsManager.saveCitationsForInterviewPrep();
            });
        }
    },
    
    /**
     * Add citations to the panel
     * 
     * @param {string} section - The section the citations belong to (keywords, career_profile, core_competencies)
     * @param {Object} citations - The citations data
     */
    addCitationsToPanel: function(section, citations) {
        const citationsContent = document.getElementById('citationsContent');
        
        if (!citationsContent) {
            console.error('Citations content container not found');
            return;
        }
        
        // Clear the "Citations will appear here..." message if it exists
        const placeholderText = citationsContent.querySelector('.text-gray-400.italic');
        if (placeholderText) {
            placeholderText.remove();
        }
        
        // Create or get the section container
        let sectionContainer = document.getElementById(`citations-${section}`);
        if (!sectionContainer) {
            sectionContainer = document.createElement('div');
            sectionContainer.id = `citations-${section}`;
            sectionContainer.className = 'mb-6';
            
            // Create section title
            const sectionTitle = document.createElement('h3');
            sectionTitle.className = 'text-md font-semibold mb-2 text-gray-700 border-b border-gray-200 pb-1';
            
            if (section === 'keywords') {
                sectionTitle.textContent = 'Keywords Citations';
            } else if (section === 'career_profile') {
                sectionTitle.textContent = 'Career Profile Citations';
            } else if (section === 'core_competencies') {
                sectionTitle.textContent = 'Core Competencies Citations';
            } else {
                sectionTitle.textContent = 'Citations';
            }
            
            sectionContainer.appendChild(sectionTitle);
            citationsContent.appendChild(sectionContainer);
        } else {
            // Clear existing citations in this section
            while (sectionContainer.childNodes.length > 1) {
                sectionContainer.removeChild(sectionContainer.lastChild);
            }
        }
        
        // Add citations to the section
        for (const [keyword, citation] of Object.entries(citations)) {
            const citationDiv = document.createElement('div');
            citationDiv.className = 'mb-3';
            
            const keywordHeader = document.createElement('h4');
            keywordHeader.className = 'text-sm font-semibold mb-1 text-blue-600';
            keywordHeader.textContent = keyword;
            citationDiv.appendChild(keywordHeader);
            
            const citationText = document.createElement('p');
            citationText.className = 'text-xs text-gray-700 mb-2 pl-3 border-l-2 border-gray-300';
            citationText.textContent = citation;
            citationDiv.appendChild(citationText);
            
            sectionContainer.appendChild(citationDiv);
        }
    },
    
    /**
     * Save citations for interview prep
     */
    saveCitationsForInterviewPrep: function() {
        // Prepare the citations data
        let citationsText = '# Interview Preparation Notes\n\n';
        
        // Add keywords citations
        if (window.citationsData?.keywords && Object.keys(window.citationsData.keywords).length > 0) {
            citationsText += '## Keywords\n\n';
            
            for (const [keyword, citation] of Object.entries(window.citationsData.keywords)) {
                citationsText += `### ${keyword}\n${citation}\n\n`;
            }
        }
        
        // Add career profile citations
        if (window.citationsData?.career_profile && Object.keys(window.citationsData.career_profile).length > 0) {
            citationsText += '## Career Profile\n\n';
            
            for (const [keyword, citation] of Object.entries(window.citationsData.career_profile)) {
                citationsText += `### ${keyword}\n${citation}\n\n`;
            }
        }
        
        // Add core competencies citations
        if (window.citationsData?.core_competencies && Object.keys(window.citationsData.core_competencies).length > 0) {
            citationsText += '## Core Competencies\n\n';
            
            for (const [competency, citation] of Object.entries(window.citationsData.core_competencies)) {
                citationsText += `### ${competency}\n${citation}\n\n`;
            }
        }
        
        // Create and download the file
        const blob = new Blob([citationsText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'interview_prep_notes.md';
        a.click();
        
        URL.revokeObjectURL(url);
        
        UiManager.showSuccessMessage('Interview preparation notes saved to file!');
    }
};

// Export the module
window.CitationsManager = CitationsManager;
window.addCitationsToPanel = CitationsManager.addCitationsToPanel;
