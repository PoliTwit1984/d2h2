/**
 * Competencies Manager Module
 * 
 * Handles core competencies generation and display.
 */

const CompetenciesManager = {
    /**
     * Initialize the competencies manager
     */
    initialize: function() {
        this.initializeEventHandlers();
    },
    
    /**
     * Initialize event handlers for competencies-related functionality
     */
    initializeEventHandlers: function() {
        const generateCompetenciesBtn = document.getElementById('generateCompetenciesBtn');
        const saveCompetenciesBtn = document.getElementById('saveCompetenciesBtn');
        
        // Generate competencies button click handler
        if (generateCompetenciesBtn) {
            generateCompetenciesBtn.addEventListener('click', function(e) {
                e.preventDefault();
                CompetenciesManager.generateCoreCompetencies();
            });
        }
        
        // Save competencies button click handler
        if (saveCompetenciesBtn) {
            saveCompetenciesBtn.addEventListener('click', function(e) {
                e.preventDefault();
                CompetenciesManager.saveCompetencies();
            });
        }
    },
    
    /**
     * Generate core competencies
     */
    generateCoreCompetencies: function() {
        const jobDescriptionTextarea = document.getElementById('jobDescription');
        const masterResumeTextarea = document.getElementById('masterResume');
        const coreCompetenciesTextarea = document.getElementById('coreCompetencies');
        const jobTitleInput = document.getElementById('jobTitle');
        const companyNameInput = document.getElementById('companyName');
        const industryInput = document.getElementById('industry');
        
        // Validate input
        if (!jobDescriptionTextarea.value.trim() || !masterResumeTextarea.value.trim()) {
            UiManager.showAlert('Please paste both a job description and your master resume.');
            return;
        }
        
        // Check if we have extracted keywords
        if (!window.extractedKeywords || window.extractedKeywords.length === 0) {
            UiManager.showAlert('Please extract keywords first before generating core competencies.');
            return;
        }
        
        // Store the values to preserve them
        const jobDescriptionValue = jobDescriptionTextarea.value;
        const masterResumeValue = masterResumeTextarea.value;
        const jobTitleValue = jobTitleInput ? jobTitleInput.value.trim() : '';
        const companyNameValue = companyNameInput ? companyNameInput.value.trim() : '';
        const industryValue = industryInput ? industryInput.value.trim() : '';
        
        // Show loading state
        const generateCompetenciesBtn = document.getElementById('generateCompetenciesBtn');
        generateCompetenciesBtn.disabled = true;
        generateCompetenciesBtn.classList.add('opacity-75');
        generateCompetenciesBtn.innerHTML = `
            <div class="spinner" style="width: 1rem; height: 1rem;"></div>
            <span>Generating...</span>
        `;
        
        // Get the structured keywords data if available
        const keywordsData = window.keywordsData || {};
        
        // Call the API service to generate core competencies
        ApiService.generateCompetencies(
            jobDescriptionValue, 
            masterResumeValue, 
            window.extractedKeywords || [], 
            window.citationsData?.keywords || {},
            jobTitleValue,
            companyNameValue,
            industryValue,
            keywordsData
        )
        .then(data => {
            // Reset button state
            generateCompetenciesBtn.disabled = false;
            generateCompetenciesBtn.classList.remove('opacity-75');
            generateCompetenciesBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="#2ECC71">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate
            `;
            
            if (data.success) {
                // Format the competencies as a list (one per line)
                const competenciesList = data.competencies.split(', ').join('\n');
                
                // Set the core competencies text
                coreCompetenciesTextarea.value = competenciesList;
                
                // Show the citations section
                const citationsSection = document.getElementById('competenciesCitationsSection');
                const citationsContainer = document.getElementById('competenciesCitationsContainer');
                citationsContainer.innerHTML = '';
                
                for (const [competency, citation] of Object.entries(data.citations)) {
                    const citationDiv = document.createElement('div');
                    citationDiv.className = 'mb-3';
                    
                    const competencyHeader = document.createElement('h4');
                    competencyHeader.className = 'text-sm font-semibold mb-1';
                    competencyHeader.textContent = competency;
                    citationDiv.appendChild(competencyHeader);
                    
                    const citationText = document.createElement('p');
                    citationText.className = 'text-xs text-gray-700 mb-2 pl-3 border-l-2 border-gray-300';
                    citationText.textContent = citation;
                    citationDiv.appendChild(citationText);
                    
                    citationsContainer.appendChild(citationDiv);
                }
                
                citationsSection.classList.remove('hidden');
                
                // Show the keywords list
                const keywordsList = document.getElementById('competenciesKeywordsList');
                const keywordsContainer = document.getElementById('competenciesKeywordsContainer');
                keywordsContainer.innerHTML = '';
                
                data.keywords.forEach(keyword => {
                    const badge = document.createElement('div');
                    badge.className = 'bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs';
                    badge.textContent = keyword;
                    keywordsContainer.appendChild(badge);
                });
                
                keywordsList.classList.remove('hidden');
                
                // Show success message
                UiManager.showSuccessMessage('Core competencies generated successfully!');
                
                // If we have citations data, add it to the citations panel
                if (data.citations && typeof window.addCitationsToPanel === 'function') {
                    window.addCitationsToPanel('core_competencies', data.citations);
                    
                    // Store citations data globally
                    if (!window.citationsData) {
                        window.citationsData = {};
                    }
                    window.citationsData.core_competencies = data.citations;
                }
            } else {
                // Show error message
                UiManager.showAlert(data.message || 'Error generating core competencies');
            }
        })
        .catch(error => {
            // Reset button state
            generateCompetenciesBtn.disabled = false;
            generateCompetenciesBtn.classList.remove('opacity-75');
            generateCompetenciesBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="#2ECC71">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate
            `;
            
            console.error('Error:', error);
            UiManager.showAlert('An error occurred. Please try again.');
        });
    },
    
    /**
     * Save competencies to a text file
     */
    saveCompetencies: function() {
        const coreCompetenciesTextarea = document.getElementById('coreCompetencies');
        
        if (coreCompetenciesTextarea.value.trim()) {
            const blob = new Blob([coreCompetenciesTextarea.value], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'core_competencies.txt';
            a.click();
            
            URL.revokeObjectURL(url);
            
            UiManager.showSuccessMessage('Core competencies saved to file!');
        } else {
            UiManager.showAlert('Please generate core competencies first.');
        }
    }
};

// Export the module
window.CompetenciesManager = CompetenciesManager;
