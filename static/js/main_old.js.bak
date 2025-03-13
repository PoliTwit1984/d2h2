// main.js - Client-side functionality for dumped2hire

// Global variables to store extracted keywords and enhanced data
let extractedKeywords = [];
let keywordsData = {
    keywords: {
        high_priority: [],
        medium_priority: [],
        low_priority: []
    },
    missing_keywords: [],
    clusters: {}
};

// Global variable to store citations for interview prep
let citationsData = {
    keywords: {},
    career_profile: {},
    core_competencies: {}
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize UI elements
    initializeKeywordsSection();
    initializeNavigationHandlers();
    initializeCitationsPanel();
    
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
});

// Initialize the keywords section functionality
function initializeKeywordsSection() {
    const extractKeywordsBtn = document.getElementById('extractKeywordsBtn');
    const continueToProfileBtn = document.getElementById('continueToProfileBtn');
    const addKeywordBtn = document.getElementById('addKeywordBtn');
    const newKeywordInput = document.getElementById('newKeywordInput');
    
    // Extract keywords button click handler
    if (extractKeywordsBtn) {
        extractKeywordsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            extractKeywords();
        });
    }
    
    // Continue to profile button click handler
    if (continueToProfileBtn) {
        continueToProfileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            navigateToCareerProfile();
        });
    }
    
    // Add keyword button click handler
    if (addKeywordBtn) {
        addKeywordBtn.addEventListener('click', function(e) {
            e.preventDefault();
            addNewKeyword();
        });
    }
    
    // Add keyword on Enter key press
    if (newKeywordInput) {
        newKeywordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addNewKeyword();
            }
        });
    }
}

// Initialize navigation handlers
function initializeNavigationHandlers() {
    const backToKeywordsBtn = document.getElementById('backToKeywordsBtn');
    const nextBtn = document.getElementById('nextBtn');
    const backBtn = document.getElementById('backBtn');
    
    // Back to keywords button click handler
    if (backToKeywordsBtn) {
        backToKeywordsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            navigateToKeywords();
        });
    }
    
    // Next button (to competencies) click handler
    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            navigateToCompetencies();
        });
    }
    
    // Back button (to profile) click handler
    if (backBtn) {
        backBtn.addEventListener('click', function(e) {
            e.preventDefault();
            navigateToCareerProfile();
        });
    }
    
    // Generate profile button click handler
    const generateProfileBtn = document.getElementById('generateProfileBtn');
    if (generateProfileBtn) {
        generateProfileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            generateCareerProfile();
        });
    }
    
    // Generate competencies button click handler
    const generateCompetenciesBtn = document.getElementById('generateCompetenciesBtn');
    if (generateCompetenciesBtn) {
        generateCompetenciesBtn.addEventListener('click', function(e) {
            e.preventDefault();
            generateCoreCompetencies();
        });
    }
    
    // Save buttons click handlers
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            saveCareerProfile();
        });
    }
    
    const saveCompetenciesBtn = document.getElementById('saveCompetenciesBtn');
    if (saveCompetenciesBtn) {
        saveCompetenciesBtn.addEventListener('click', function(e) {
            e.preventDefault();
            saveCompetencies();
        });
    }
}

// Initialize citations panel
function initializeCitationsPanel() {
    const saveCitationsBtn = document.getElementById('saveCitationsBtn');
    
    if (saveCitationsBtn) {
        saveCitationsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            saveCitationsForInterviewPrep();
        });
    }
}

// Extract keywords from job description
function extractKeywords() {
    const jobDescriptionTextarea = document.getElementById('jobDescription');
    const masterResumeTextarea = document.getElementById('masterResume');
    
    // Validate input
    if (!jobDescriptionTextarea.value.trim()) {
        showAlert('Please paste a job description.');
        return;
    }
    
    // Show loading state
    const extractKeywordsBtn = document.getElementById('extractKeywordsBtn');
    extractKeywordsBtn.disabled = true;
    extractKeywordsBtn.classList.add('opacity-75');
    extractKeywordsBtn.innerHTML = `
        <div class="spinner" style="width: 1rem; height: 1rem;"></div>
        <span>Extracting...</span>
    `;
    
    // Send request to extract keywords
    const formData = new FormData();
    formData.append('job_description', jobDescriptionTextarea.value);
    
    // Include master resume if available for missing keywords analysis
    if (masterResumeTextarea.value.trim()) {
        formData.append('master_resume', masterResumeTextarea.value);
    }
    
    fetch('/extract-keywords', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Reset button state
        extractKeywordsBtn.disabled = false;
        extractKeywordsBtn.classList.remove('opacity-75');
        extractKeywordsBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="#2ECC71">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Extract Keywords
        `;
        
        if (data.success) {
            // Store keywords globally but don't display them yet
            extractedKeywords = data.keywords;
            
            // Store enhanced keywords data if available
            if (data.keywords_data) {
                keywordsData = data.keywords_data;
            }
            
            // Focus on displaying the highlighted job description first
            if (data.highlighted_job_description) {
                displayHighlightedJobDescription(data.highlighted_job_description);
                
                // Add a button to add keywords to the list
                const highlightedJobDescriptionSection = document.getElementById('highlightedJobDescriptionSection');
                if (highlightedJobDescriptionSection) {
                    // Check if the button already exists
                    if (!document.getElementById('addKeywordsToListBtn')) {
                        const addKeywordsBtn = document.createElement('button');
                        addKeywordsBtn.id = 'addKeywordsToListBtn';
                        addKeywordsBtn.className = 'mt-4 px-3 py-2 rounded text-sm w-full';
                        addKeywordsBtn.style.backgroundColor = 'rgba(46, 204, 113, 0.1)';
                        addKeywordsBtn.style.color = '#2ECC71';
                        addKeywordsBtn.style.border = '1px solid rgba(46, 204, 113, 0.2)';
                        addKeywordsBtn.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="#2ECC71">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Add Highlighted Keywords to List
                        `;
                        
                        // Add event listener to the button
                        addKeywordsBtn.addEventListener('click', function() {
                            // Display keywords in editable format with prioritization
                            displayEnhancedKeywords(keywordsData, extractedKeywords);
                            
                            // Show continue button and keyword input
                            document.getElementById('continueToProfileBtn').classList.remove('hidden');
                            document.getElementById('keywordInputContainer').classList.remove('hidden');
                            
                            // Scroll to the keywords section
                            document.getElementById('extractedKeywordsContainer').scrollIntoView({ behavior: 'smooth' });
                        });
                        
                        highlightedJobDescriptionSection.appendChild(addKeywordsBtn);
                    }
                }
            } else {
                // Fallback to displaying keywords directly if no highlighted job description
                displayEnhancedKeywords(keywordsData, extractedKeywords);
                
                // Show continue button and keyword input
                document.getElementById('continueToProfileBtn').classList.remove('hidden');
                document.getElementById('keywordInputContainer').classList.remove('hidden');
            }
            
            // Show success message
            showSuccessMessage('Keywords extracted successfully!');
            
            // If we have citations data, add it to the citations panel
            if (data.citations && typeof addCitationsToPanel === 'function') {
                addCitationsToPanel('keywords', data.citations);
            } else if (data.citations) {
                console.log('Citations data available but addCitationsToPanel function not found');
            }
        } else {
            // Show error message
            showAlert(data.message || 'Error extracting keywords');
        }
    })
    .catch(error => {
        // Reset button state
        extractKeywordsBtn.disabled = false;
        extractKeywordsBtn.classList.remove('opacity-75');
        extractKeywordsBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="#2ECC71">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Extract Keywords
        `;
        
        console.error('Error:', error);
        showAlert('An error occurred. Please try again.');
    });
}

// Generate career profile
function generateCareerProfile() {
    const jobDescriptionTextarea = document.getElementById('jobDescription');
    const masterResumeTextarea = document.getElementById('masterResume');
    const careerProfileTextarea = document.getElementById('careerProfile');
    
    // Validate input
    if (!jobDescriptionTextarea.value.trim() || !masterResumeTextarea.value.trim()) {
        showAlert('Please paste both a job description and your master resume.');
        return;
    }
    
    // Show loading state
    const generateProfileBtn = document.getElementById('generateProfileBtn');
    generateProfileBtn.disabled = true;
    generateProfileBtn.classList.add('opacity-75');
    generateProfileBtn.innerHTML = `
        <div class="spinner" style="width: 1rem; height: 1rem;"></div>
        <span>Generating...</span>
    `;
    
    // Send request to generate career profile
    const formData = new FormData();
    formData.append('job_description', jobDescriptionTextarea.value);
    formData.append('master_resume', masterResumeTextarea.value);
    
    // Include keywords if available
    if (extractedKeywords.length > 0) {
        formData.append('keywords', JSON.stringify(extractedKeywords));
    }
    
    // Include citations if available
    if (citationsData.keywords && Object.keys(citationsData.keywords).length > 0) {
        formData.append('citations_json', JSON.stringify(citationsData.keywords));
    }
    
    fetch('/generate', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Reset button state
        generateProfileBtn.disabled = false;
        generateProfileBtn.classList.remove('opacity-75');
        generateProfileBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="#2ECC71">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate
        `;
        
        if (data.success) {
            // Set the career profile text
            careerProfileTextarea.value = data.career_profile;
            
            // Show the highlighted profile
            const highlightedProfile = document.getElementById('highlightedProfile');
            const markedProfileContent = document.getElementById('markedProfileContent');
            markedProfileContent.innerHTML = data.marked_profile;
            highlightedProfile.classList.remove('hidden');
            
            // Show the save button
            document.getElementById('saveProfileBtn').classList.remove('hidden');
            
            // Show the next button
            document.getElementById('nextBtn').classList.remove('hidden');
            
            // Show the keywords list
            const keywordsList = document.getElementById('keywordsList');
            const keywordsContainer = document.getElementById('keywordsContainer');
            keywordsContainer.innerHTML = '';
            
            data.keywords.forEach(keyword => {
                const badge = document.createElement('div');
                badge.className = 'bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs';
                badge.textContent = keyword;
                keywordsContainer.appendChild(badge);
            });
            
            keywordsList.classList.remove('hidden');
            
            // Show success message
            showSuccessMessage('Career profile generated successfully!');
            
            // If we have citations data, add it to the citations panel
            if (data.citations && typeof addCitationsToPanel === 'function') {
                addCitationsToPanel('career_profile', data.citations);
            } else if (data.citations) {
                console.log('Citations data available but addCitationsToPanel function not found');
            }
        } else {
            // Show error message
            showAlert(data.message || 'Error generating career profile');
        }
    })
    .catch(error => {
        // Reset button state
        generateProfileBtn.disabled = false;
        generateProfileBtn.classList.remove('opacity-75');
        generateProfileBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="#2ECC71">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate
        `;
        
        console.error('Error:', error);
        showAlert('An error occurred. Please try again.');
    });
}

// Generate core competencies
function generateCoreCompetencies() {
    const jobDescriptionTextarea = document.getElementById('jobDescription');
    const masterResumeTextarea = document.getElementById('masterResume');
    const coreCompetenciesTextarea = document.getElementById('coreCompetencies');
    
    // Validate input
    if (!jobDescriptionTextarea.value.trim() || !masterResumeTextarea.value.trim()) {
        showAlert('Please paste both a job description and your master resume.');
        return;
    }
    
    // Show loading state
    const generateCompetenciesBtn = document.getElementById('generateCompetenciesBtn');
    generateCompetenciesBtn.disabled = true;
    generateCompetenciesBtn.classList.add('opacity-75');
    generateCompetenciesBtn.innerHTML = `
        <div class="spinner" style="width: 1rem; height: 1rem;"></div>
        <span>Generating...</span>
    `;
    
    // Send request to generate core competencies
    const formData = new FormData();
    formData.append('job_description', jobDescriptionTextarea.value);
    formData.append('master_resume', masterResumeTextarea.value);
    
    // Include keywords if available
    if (extractedKeywords.length > 0) {
        formData.append('keywords', JSON.stringify(extractedKeywords));
    }
    
    // Include citations if available
    if (citationsData.keywords && Object.keys(citationsData.keywords).length > 0) {
        formData.append('citations_json', JSON.stringify(citationsData.keywords));
    }
    
    fetch('/generate-competencies', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
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
            showSuccessMessage('Core competencies generated successfully!');
            
            // If we have citations data, add it to the citations panel
            if (data.citations && typeof addCitationsToPanel === 'function') {
                addCitationsToPanel('core_competencies', data.citations);
            } else if (data.citations) {
                console.log('Citations data available but addCitationsToPanel function not found');
            }
        } else {
            // Show error message
            showAlert(data.message || 'Error generating core competencies');
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
        showAlert('An error occurred. Please try again.');
    });
}

// Create a persistent keywords panel
function createPersistentKeywordsPanel(targetSection) {
    // Check if the panel already exists in the target section
    if (targetSection.querySelector('.persistent-keywords-panel')) {
        return;
    }
    
    // Create the panel
    const panel = document.createElement('div');
    panel.className = 'persistent-keywords-panel mb-4 p-3 bg-white rounded-md shadow-sm';
    panel.style.border = '1px solid rgba(46, 134, 171, 0.3)';
    
    // Create the header with toggle button
    const header = document.createElement('div');
    header.className = 'flex justify-between items-center mb-2';
    
    const title = document.createElement('h3');
    title.className = 'text-sm font-semibold text-gray-700 flex items-center';
    title.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" style="color: #2E86AB;" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        Extracted Keywords
    `;
    
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-keywords-panel text-xs flex items-center';
    toggleBtn.style.color = '#2E86AB';
    toggleBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" style="color: #2E86AB;" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
        </svg>
        Hide
    `;
    
    // Add event listener to toggle button
    toggleBtn.addEventListener('click', function() {
        const content = panel.querySelector('.persistent-keywords-content');
        if (content.style.display === 'none') {
            content.style.display = 'block';
            this.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" style="color: #2E86AB;" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                </svg>
                Hide
            `;
        } else {
            content.style.display = 'none';
            this.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" style="color: #2E86AB;" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                </svg>
                Show
            `;
        }
    });
    
    header.appendChild(title);
    header.appendChild(toggleBtn);
    panel.appendChild(header);
    
    // Create the content container
    const content = document.createElement('div');
    content.className = 'persistent-keywords-content';
    
    // Create a compact version of the keywords
    const keywordsContainer = document.createElement('div');
    keywordsContainer.className = 'flex flex-wrap gap-1';
    
    // Add high priority keywords
    if (keywordsData.keywords && keywordsData.keywords.high_priority && keywordsData.keywords.high_priority.length > 0) {
        keywordsData.keywords.high_priority.forEach(item => {
            const keywordText = typeof item === 'string' ? item : (item.keyword || '');
            if (keywordText) {
                const badge = document.createElement('div');
                badge.className = 'bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium mb-1 mr-1';
                badge.textContent = keywordText;
                keywordsContainer.appendChild(badge);
            }
        });
    }
    
    // Add medium priority keywords
    if (keywordsData.keywords && keywordsData.keywords.medium_priority && keywordsData.keywords.medium_priority.length > 0) {
        keywordsData.keywords.medium_priority.forEach(item => {
            const keywordText = typeof item === 'string' ? item : (item.keyword || '');
            if (keywordText) {
                const badge = document.createElement('div');
                badge.className = 'bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium mb-1 mr-1';
                badge.textContent = keywordText;
                keywordsContainer.appendChild(badge);
            }
        });
    }
    
    // Add low priority keywords
    if (keywordsData.keywords && keywordsData.keywords.low_priority && keywordsData.keywords.low_priority.length > 0) {
        keywordsData.keywords.low_priority.forEach(item => {
            const keywordText = typeof item === 'string' ? item : (item.keyword || '');
            if (keywordText) {
                const badge = document.createElement('div');
                badge.className = 'bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium mb-1 mr-1';
                badge.textContent = keywordText;
                keywordsContainer.appendChild(badge);
            }
        });
    }
    
    content.appendChild(keywordsContainer);
    panel.appendChild(content);
    
    // Insert the panel at the top of the target section
    targetSection.insertBefore(panel, targetSection.firstChild);
}

// Navigation functions
function navigateToCareerProfile() {
    // Create persistent keywords panel
    const careerProfileSection = document.getElementById('careerProfileSection');
    createPersistentKeywordsPanel(careerProfileSection);
    
    // Hide keywords section
    document.getElementById('keywordsSection').classList.add('hidden');
    
    // Show career profile section
    careerProfileSection.classList.remove('hidden');
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function navigateToKeywords() {
    // Hide career profile section
    document.getElementById('careerProfileSection').classList.add('hidden');
    
    // Show keywords section
    document.getElementById('keywordsSection').classList.remove('hidden');
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function navigateToCompetencies() {
    // Create persistent keywords panel
    const coreCompetenciesSection = document.getElementById('coreCompetenciesSection');
    createPersistentKeywordsPanel(coreCompetenciesSection);
    
    // Hide career profile section
    document.getElementById('careerProfileSection').classList.add('hidden');
    
    // Show core competencies section
    coreCompetenciesSection.classList.remove('hidden');
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Display highlighted job description
function displayHighlightedJobDescription(highlightedText) {
    // Check if the highlighted job description container already exists
    let container = document.getElementById('highlightedJobDescriptionSection');
    
    // If it doesn't exist, create it
    if (!container) {
        container = document.createElement('div');
        container.id = 'highlightedJobDescriptionSection';
