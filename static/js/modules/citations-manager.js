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
        
        // Initialize Create Profile button
        const createProfileBtn = document.getElementById('createProfileBtn');
        if (createProfileBtn) {
            createProfileBtn.addEventListener('click', function(e) {
                e.preventDefault();
                navigateToCareerProfile();
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
        
        // Store citations in global variable for later use
        if (typeof window.citationsData === 'undefined') {
            window.citationsData = {};
        }
        window.citationsData[section] = citations;
        
        // Check if citations is in the new structured format with priority buckets
        const isStructuredFormat = citations && 
            (citations.high_priority || citations.medium_priority || 
             citations.low_priority || citations.fallback_extraction);
        
        if (isStructuredFormat) {
            console.log("Processing structured citations format");
            
            // Process each priority bucket
            const priorities = [
                { key: 'high_priority', label: 'High Priority', color: 'text-red-700' },
                { key: 'medium_priority', label: 'Medium Priority', color: 'text-orange-700' },
                { key: 'low_priority', label: 'Low Priority', color: 'text-yellow-700' },
                { key: 'fallback_extraction', label: 'Additional Citations', color: 'text-blue-700' }
            ];
            
            let totalCitations = 0;
            
            // Add each priority section
            for (const priority of priorities) {
                const priorityCitations = citations[priority.key];
                
                // Skip empty priority buckets
                if (!priorityCitations || Object.keys(priorityCitations).length === 0) {
                    continue;
                }
                
                // Create a priority subsection
                const priorityDiv = document.createElement('div');
                priorityDiv.className = 'mb-4';
                
                // Add priority header
                const priorityHeader = document.createElement('h4');
                priorityHeader.className = `text-sm font-medium mb-2 ${priority.color}`;
                priorityHeader.textContent = priority.label;
                priorityDiv.appendChild(priorityHeader);
                
                // Add each citation in this priority
                for (const [keyword, citation] of Object.entries(priorityCitations)) {
                    // Skip error messages
                    if (keyword === 'error') continue;
                    
                    // Extract citation text based on format
                    let citationText = '';
                    if (typeof citation === 'string') {
                        citationText = citation;
                    } else if (typeof citation === 'object' && citation.citation) {
                        citationText = citation.citation;
                    } else {
                        console.warn(`Citation for "${keyword}" is not in a recognized format:`, citation);
                        continue;
                    }
                    
                    const citationDiv = document.createElement('div');
                    citationDiv.className = 'mb-3 p-2 bg-gray-50 rounded border border-gray-200';
                    
                    // Create the keyword header
                    const keywordHeader = document.createElement('h4');
                    keywordHeader.className = `text-sm font-semibold mb-1 ${priority.color}`;
                    keywordHeader.textContent = keyword;
                    citationDiv.appendChild(keywordHeader);
                    
                    const citationParagraph = document.createElement('p');
                    citationParagraph.className = 'text-xs text-gray-700';
                    citationParagraph.textContent = citationText;
                    citationDiv.appendChild(citationParagraph);
                    
                    priorityDiv.appendChild(citationDiv);
                    totalCitations++;
                }
                
                if (priorityDiv.childNodes.length > 1) { // Only add if there are actual citations
                    sectionContainer.appendChild(priorityDiv);
                }
            }
            
            // If no citations were added, show a message
            if (totalCitations === 0) {
                const noCitationsMsg = document.createElement('p');
                noCitationsMsg.className = 'text-sm text-gray-500 italic';
                noCitationsMsg.textContent = 'No citations found. Try adjusting your resume to include more relevant experience.';
                sectionContainer.appendChild(noCitationsMsg);
            }
        } else {
            console.log("Processing flat citations format");
            
            // Handle the old flat format for backward compatibility
            let citationsAdded = 0;
            
            for (const [keyword, citation] of Object.entries(citations)) {
                // Skip if citation is not a string or is empty
                if (typeof citation !== 'string' || !citation.trim()) {
                    console.warn(`Invalid citation for "${keyword}":`, citation);
                    continue;
                }
                
                const citationDiv = document.createElement('div');
                citationDiv.className = 'mb-3 p-2 bg-gray-50 rounded border border-gray-200';
                
                const keywordHeader = document.createElement('h4');
                keywordHeader.className = 'text-sm font-semibold mb-1 text-blue-700';
                keywordHeader.textContent = keyword;
                citationDiv.appendChild(keywordHeader);
                
                const citationText = document.createElement('p');
                citationText.className = 'text-xs text-gray-700';
                citationText.textContent = citation;
                citationDiv.appendChild(citationText);
                
                sectionContainer.appendChild(citationDiv);
                citationsAdded++;
            }
            
            // If no citations were added, show a message
            if (citationsAdded === 0) {
                const noCitationsMsg = document.createElement('p');
                noCitationsMsg.className = 'text-sm text-gray-500 italic';
                noCitationsMsg.textContent = 'No citations found. Try adjusting your resume to include more relevant experience.';
                sectionContainer.appendChild(noCitationsMsg);
            }
        }
        
        // Show the Create Profile button after citations are found
        if (section === 'keywords') {
            this.showCreateProfileButton();
        }
    },
    
    /**
     * Show the Create Profile button at the top of the page
     */
    showCreateProfileButton: function() {
        const createProfileButtonContainer = document.getElementById('createProfileButtonContainer');
        if (createProfileButtonContainer) {
            createProfileButtonContainer.classList.remove('hidden');
        }
    },
    
    /**
     * Save citations for interview prep
     */
    saveCitationsForInterviewPrep: function() {
        // Prepare the citations data
        let citationsText = '# Interview Preparation Notes\n\n';
        
        // Process each section (keywords, career_profile, core_competencies)
        for (const [section, citations] of Object.entries(window.citationsData || {})) {
            if (!citations || Object.keys(citations).length === 0) {
                continue; // Skip empty sections
            }
            
            // Add section header
            let sectionTitle = '';
            switch(section) {
                case 'keywords':
                    sectionTitle = 'Keywords';
                    break;
                case 'career_profile':
                    sectionTitle = 'Career Profile';
                    break;
                case 'core_competencies':
                    sectionTitle = 'Core Competencies';
                    break;
                default:
                    sectionTitle = 'Citations';
            }
            
            citationsText += `## ${sectionTitle}\n\n`;
            
            // Check if citations is in the new structured format with priority buckets
            const isStructuredFormat = citations && 
                (citations.high_priority || citations.medium_priority || 
                 citations.low_priority || citations.fallback_extraction);
            
            if (isStructuredFormat) {
                // Process each priority bucket
                const priorities = [
                    { key: 'high_priority', label: 'HIGH PRIORITY' },
                    { key: 'medium_priority', label: 'MEDIUM PRIORITY' },
                    { key: 'low_priority', label: 'LOW PRIORITY' },
                    { key: 'fallback_extraction', label: 'ADDITIONAL CITATIONS' }
                ];
                
                // Add each priority section
                for (const priority of priorities) {
                    const priorityCitations = citations[priority.key];
                    
                    // Skip empty priority buckets
                    if (!priorityCitations || Object.keys(priorityCitations).length === 0) {
                        continue;
                    }
                    
                    // Add priority header
                    citationsText += `### ${priority.label}\n\n`;
                    
                    // Add each citation in this priority
                    for (const [keyword, citation] of Object.entries(priorityCitations)) {
                        // Skip error messages
                        if (keyword === 'error') continue;
                        
                        // Extract citation text based on format
                        let citationText = '';
                        if (typeof citation === 'string') {
                            citationText = citation;
                        } else if (typeof citation === 'object' && citation.citation) {
                            citationText = citation.citation;
                        } else {
                            continue;
                        }
                        
                        citationsText += `#### ${keyword}\n${citationText}\n\n`;
                    }
                }
            } else {
                // Handle the old flat format for backward compatibility
                for (const [keyword, citation] of Object.entries(citations)) {
                    // Skip if citation is not a string
                    if (typeof citation !== 'string') continue;
                    
                    citationsText += `### ${keyword}\n${citation}\n\n`;
                }
            }
            
            citationsText += '\n';
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
