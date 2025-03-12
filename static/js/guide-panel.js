/**
 * guide-panel.js - Handles the Guide Me panel functionality
 * 
 * This module provides a step-by-step guide for users to create their tailored resume.
 * It coordinates with the main application to provide a streamlined workflow.
 */

// Track the current active step
let currentStep = 1;

// Initialize the Guide Me panel
document.addEventListener('DOMContentLoaded', function() {
    initializeGuidePanel();
});

// Initialize the Guide Me panel
function initializeGuidePanel() {
    // Add event listeners to guide buttons
    document.getElementById('guideExtractKeywordsBtn').addEventListener('click', handleExtractKeywords);
    document.getElementById('guideAddKeywordBtn').addEventListener('click', handleAddKeyword);
    document.getElementById('guideContinueBtn').addEventListener('click', handleContinueToGeneration);
    document.getElementById('guideGenerateProfileBtn').addEventListener('click', handleGenerateProfile);
    document.getElementById('guideGenerateCompetenciesBtn').addEventListener('click', handleGenerateCompetencies);
    document.getElementById('guideSaveProfileBtn').addEventListener('click', handleSaveProfile);
    document.getElementById('guideSaveCompetenciesBtn').addEventListener('click', handleSaveCompetencies);
    document.getElementById('guideSaveCitationsBtn').addEventListener('click', handleSaveCitations);
    
// Add a global click handler for the Generate Citations button
document.addEventListener('click', function(e) {
    // Check if the click was on or inside the Generate Citations button
    const citationsBtn = document.getElementById('guideGenerateCitationsBtn');
    if (citationsBtn && (e.target === citationsBtn || citationsBtn.contains(e.target))) {
        console.log('Generate Citations button clicked via global handler!');
        e.preventDefault();
        handleGenerateCitations();
        return;
    }
    
    // Also check for clicks on the button's text or icon
    if (e.target.closest && e.target.closest('#guideGenerateCitationsBtn')) {
        console.log('Generate Citations button clicked via delegation!');
        e.preventDefault();
        handleGenerateCitations();
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
                handleGenerateCitations();
            }, 100);
        }
    }
});

// Completely replace the Generate Citations button with a new one
window.replaceCitationsButton = () => {
    console.log('Attempting to replace the Generate Citations button');
    const step3Element = document.getElementById('guideStep3');
    if (!step3Element) {
        console.error('Step 3 element not found');
        return;
    }
    
    // Find the existing button
    const oldBtn = document.getElementById('guideGenerateCitationsBtn');
    if (!oldBtn) {
        console.error('Generate Citations button not found');
        return;
    }
    
    // Create a completely new button
    const newBtn = document.createElement('button');
    newBtn.id = 'guideGenerateCitationsBtn';
    newBtn.className = 'w-full px-3 py-2 rounded text-sm';
    newBtn.style.backgroundColor = 'rgba(46, 204, 113, 0.1)';
    newBtn.style.color = '#2ECC71';
    newBtn.style.border = '1px solid rgba(46, 204, 113, 0.2)';
    newBtn.disabled = false;
    newBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="#2ECC71">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Generate Citations for Keywords
    `;
    
    // Add a direct click event listener
    newBtn.addEventListener('click', function(e) {
        console.log('New Generate Citations button clicked!');
        e.preventDefault();
        e.stopPropagation();
        handleGenerateCitations();
    });
    
    // Replace the old button with the new one
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);
    console.log('Generate Citations button successfully replaced');
    
    // Also add an inline onclick attribute as a fallback
    newBtn.setAttribute('onclick', 'handleGenerateCitations(); return false;');
};

// Initialize the button replacement
setTimeout(() => {
    window.replaceCitationsButton();
}, 1000);
    
    // Connect guide keyword input with main keyword input
    const guideKeywordInput = document.getElementById('guideNewKeywordInput');
    guideKeywordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddKeyword();
        }
    });
    
    // Listen for changes in the main application state
    listenForApplicationChanges();
    
    // Update the button text to "Find Keywords in Resume"
    const continueBtn = document.getElementById('guideContinueBtn');
    if (continueBtn) {
        continueBtn.textContent = 'Find Keywords in Resume';
    }
}

// Handle Extract Keywords button click
function handleExtractKeywords() {
    // Validate inputs
    const jobDescription = document.getElementById('jobDescription').value.trim();
    const masterResume = document.getElementById('masterResume').value.trim();
    
    if (!jobDescription) {
        showAlert('Please paste a job description.');
        return;
    }
    
    // Directly extract keywords using the KeywordManager
    if (window.KeywordManager && typeof window.KeywordManager.extractKeywords === 'function') {
        window.KeywordManager.extractKeywords();
    } else {
        // Show error if the function is not available
        showAlert('Extract keywords function not found. Please refresh the page and try again.');
    }
    
    // The application state change listeners will handle activating the next step
}

// Handle Add Keyword button click
function handleAddKeyword() {
    const guideKeywordInput = document.getElementById('guideNewKeywordInput');
    const guidePrioritySelect = document.getElementById('guideNewKeywordPriority');
    
    // Update the main application's keyword input and priority
    document.getElementById('newKeywordInput').value = guideKeywordInput.value;
    document.getElementById('newKeywordPriority').value = guidePrioritySelect.value;
    
    // Trigger the add keyword action in the main application
    document.getElementById('addKeywordBtn').click();
    
    // Clear the guide input
    guideKeywordInput.value = '';
}

// Handle Continue to Generation button click
function handleContinueToGeneration() {
    // First, find keywords in resume
    findKeywordsInResume();
    // Note: We no longer automatically generate citations
    // This allows the user to click the Generate Citations button in step 3
}

// Find keywords in resume
function findKeywordsInResume() {
    // Show loading state on the button
    const continueCitationsBtn = document.getElementById('guideContinueBtn');
    if (continueCitationsBtn) {
        continueCitationsBtn.disabled = true;
        continueCitationsBtn.classList.add('opacity-75');
        continueCitationsBtn.innerHTML = `
            <div class="spinner" style="width: 1rem; height: 1rem;"></div>
            <span>Finding Keywords in Resume...</span>
        `;
    }
    
    // Check if KeywordManager is available
    if (window.KeywordManager && typeof window.KeywordManager.findKeywordsInResume === 'function') {
        try {
            // Get the master resume
            const masterResumeTextarea = document.getElementById('masterResume');
            const jobTitleInput = document.getElementById('jobTitle');
            const companyNameInput = document.getElementById('companyName');
            const industryInput = document.getElementById('industry');
            
            // Validate input
            if (!masterResumeTextarea || !masterResumeTextarea.value.trim()) {
                showAlert('Please paste a master resume to find keywords.');
                
                // Reset button state
                if (continueCitationsBtn) {
                    continueCitationsBtn.disabled = false;
                    continueCitationsBtn.classList.remove('opacity-75');
                    continueCitationsBtn.innerHTML = `Find Keywords in Resume`;
                }
                return;
            }
            
            if (!window.extractedKeywords || window.extractedKeywords.length === 0) {
                showAlert('No keywords available to find in resume.');
                
                // Reset button state
                if (continueCitationsBtn) {
                    continueCitationsBtn.disabled = false;
                    continueCitationsBtn.classList.remove('opacity-75');
                    continueCitationsBtn.innerHTML = `Find Keywords in Resume`;
                }
                return;
            }
            
            // Store the values to preserve them
            const masterResumeValue = masterResumeTextarea.value;
            const jobTitleValue = jobTitleInput ? jobTitleInput.value.trim() : '';
            const companyNameValue = companyNameInput ? companyNameInput.value.trim() : '';
            const industryValue = industryInput ? industryInput.value.trim() : '';
            
            // Call the API service to find keywords in resume
            ApiService.findKeywordsInResume(
                masterResumeValue,
                window.keywordsData || window.extractedKeywords,
                jobTitleValue,
                companyNameValue,
                industryValue
            )
            .then(data => {
                if (data.success) {
                    // Update the keywords display with found/not found indicators
                    window.KeywordManager.updateKeywordsWithFoundStatus(data.found_keywords);
                    
                    // Create a dictionary of keywords to their citations (empty for now)
                    const keywordCitations = {};
                    Object.keys(data.found_keywords).forEach(keyword => {
                        if (data.found_keywords[keyword]) {
                            keywordCitations[keyword] = "Found in resume";
                        }
                    });
                    
                    // Highlight keywords in resume
                    window.KeywordManager.highlightKeywordsInResume(masterResumeValue, keywordCitations);
                    
                    // Show success message
                    showSuccessMessage('Keywords found in resume!');
                    
                    // Count how many keywords were actually found
                    const foundCount = Object.values(data.found_keywords).filter(Boolean).length;
                    const totalCount = Object.keys(data.found_keywords).length;
                    
                    // Show a summary message
                    showSuccessMessage(`Found ${foundCount} out of ${totalCount} keywords in your resume.`);
                    
                    // Activate step 3 (Generate Citations)
                    activateStep(3);
                    
                    // Replace the Generate Citations button with a new one
                    console.log('Replacing the Generate Citations button after activating step 3');
                    setTimeout(() => {
                        window.replaceCitationsButton();
                        
                        // Force enable the button
                        const citationsBtn = document.getElementById('guideGenerateCitationsBtn');
                        if (citationsBtn) {
                            citationsBtn.disabled = false;
                            citationsBtn.classList.remove('opacity-50');
                            console.log('Explicitly enabled the Generate Citations button');
                            
                            // Add a direct click handler
                            citationsBtn.onclick = function(e) {
                                console.log('Generate Citations button clicked via direct onclick!');
                                if (e) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }
                                handleGenerateCitations();
                                return false;
                            };
                        }
                    }, 300);
                } else {
                    // Show error message
                    showAlert(data.message || 'Error finding keywords in resume');
                    
                    // Reset button state
                    if (continueCitationsBtn) {
                        continueCitationsBtn.disabled = false;
                        continueCitationsBtn.classList.remove('opacity-75');
                        continueCitationsBtn.innerHTML = `Find Keywords in Resume`;
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('An error occurred while finding keywords in resume. Please try again.');
                
                // Reset button state
                if (continueCitationsBtn) {
                    continueCitationsBtn.disabled = false;
                    continueCitationsBtn.classList.remove('opacity-75');
                    continueCitationsBtn.innerHTML = `Find Keywords in Resume`;
                }
            });
        } catch (error) {
            console.error('Error finding keywords in resume:', error);
            
            // Reset button state
            if (continueCitationsBtn) {
                continueCitationsBtn.disabled = false;
                continueCitationsBtn.classList.remove('opacity-75');
                continueCitationsBtn.innerHTML = `Find Keywords in Resume`;
            }
            
            // Show error message
            showAlert('Error finding keywords in resume. Please try again.');
        }
    } else {
        // Fallback if the function doesn't exist
        showAlert('Find keywords function not found. Please refresh the page and try again.');
        
        // Reset button state
        if (continueCitationsBtn) {
            continueCitationsBtn.disabled = false;
            continueCitationsBtn.classList.remove('opacity-75');
            continueCitationsBtn.innerHTML = `Find Keywords in Resume`;
        }
    }
}

// Generate citations
function generateCitations() {
    // Show loading state on the Generate Citations button
    const generateCitationsBtn = document.getElementById('guideGenerateCitationsBtn');
    if (generateCitationsBtn) {
        generateCitationsBtn.disabled = true;
        generateCitationsBtn.classList.add('opacity-75');
        generateCitationsBtn.innerHTML = `
            <div class="spinner" style="width: 1rem; height: 1rem;"></div>
            <span>Generating Citations...</span>
        `;
    }
    
    // Check if KeywordManager is available
    if (window.KeywordManager && typeof window.KeywordManager.findCitations === 'function') {
        try {
            // Call the findCitations function
            window.KeywordManager.findCitations();
            
            // Reset button state after a delay
            setTimeout(() => {
                if (generateCitationsBtn) {
                    generateCitationsBtn.disabled = false;
                    generateCitationsBtn.classList.remove('opacity-75');
                    generateCitationsBtn.innerHTML = `Generate Citations for Keywords`;
                }
                
                // Show success message
                showSuccessMessage('Citations generated successfully! Check the Citations Panel.');
                
                // Make sure the citations panel is visible
                const citationsPanel = document.getElementById('citationsPanel');
                if (citationsPanel && citationsPanel.classList.contains('hidden')) {
                    citationsPanel.classList.remove('hidden');
                }
                
                // Activate step 4 (Generate Content)
                activateStep(4);
                
                // Show the career profile section
                const careerProfileSection = document.getElementById('careerProfileSection');
                const keywordsSection = document.getElementById('keywordsSection');
                
                if (careerProfileSection && keywordsSection) {
                    keywordsSection.classList.add('hidden');
                    careerProfileSection.classList.remove('hidden');
                }
            }, 3000); // Add a buffer of 3 seconds
        } catch (error) {
            console.error('Error generating citations:', error);
            
            // Reset button state
            if (generateCitationsBtn) {
                generateCitationsBtn.disabled = false;
                generateCitationsBtn.classList.remove('opacity-75');
                generateCitationsBtn.innerHTML = `Generate Citations for Keywords`;
            }
            
            // Show error message
            showAlert('Error generating citations. Please try again.');
        }
    } else {
        // Fallback if the function doesn't exist
        showAlert('Citation generation function not found. Please refresh the page and try again.');
        
        // Reset button state
        if (generateCitationsBtn) {
            generateCitationsBtn.disabled = false;
            generateCitationsBtn.classList.remove('opacity-75');
            generateCitationsBtn.innerHTML = `Generate Citations for Keywords`;
        }
    }
}

// Handle Generate Citations button click
function handleGenerateCitations() {
    console.log('handleGenerateCitations called - button click handler is working!');
    
    // Debug info
    const citationsBtn = document.getElementById('guideGenerateCitationsBtn');
    if (citationsBtn) {
        console.log('Button state:', {
            disabled: citationsBtn.disabled,
            classList: Array.from(citationsBtn.classList),
            innerHTML: citationsBtn.innerHTML.substring(0, 50) + '...',
            parentNode: citationsBtn.parentNode ? citationsBtn.parentNode.id || 'unknown' : 'none'
        });
    } else {
        console.error('Button not found when handler called!');
    }
    
    // Debug KeywordManager
    console.log('KeywordManager available:', !!window.KeywordManager);
    console.log('findCitations function available:', window.KeywordManager && typeof window.KeywordManager.findCitations === 'function');
    
    // Debug window.keywordsData
    console.log('keywordsData available:', !!window.keywordsData);
    if (window.keywordsData) {
        console.log('keywordsData structure:', JSON.stringify(window.keywordsData).substring(0, 100) + '...');
    }
    
    // Debug master resume
    const masterResumeTextarea = document.getElementById('masterResume');
    console.log('Master resume available:', !!masterResumeTextarea && !!masterResumeTextarea.value);
    if (masterResumeTextarea && masterResumeTextarea.value) {
        console.log('Master resume length:', masterResumeTextarea.value.length);
    }
    
    // Use KeywordManager.findCitations instead of the global function
    if (window.KeywordManager && typeof window.KeywordManager.findCitations === 'function') {
        // Show loading state
        const generateCitationsBtn = document.getElementById('guideGenerateCitationsBtn');
        if (generateCitationsBtn) {
            console.log('Setting Generate Citations button to loading state');
            generateCitationsBtn.disabled = true;
            generateCitationsBtn.classList.add('opacity-75');
            generateCitationsBtn.innerHTML = `
                <div class="spinner" style="width: 1rem; height: 1rem;"></div>
                <span>Generating...</span>
            `;
        } else {
            console.error('Generate Citations button not found');
        }
        
        try {
            console.log('Now calling KeywordManager.findCitations()');
            
            // Add a direct call to the API service to find citations
            const masterResumeValue = masterResumeTextarea.value;
            const jobTitleInput = document.getElementById('jobTitle');
            const companyNameInput = document.getElementById('companyName');
            const industryInput = document.getElementById('industry');
            
            const jobTitleValue = jobTitleInput ? jobTitleInput.value.trim() : '';
            const companyNameValue = companyNameInput ? companyNameInput.value.trim() : '';
            const industryValue = industryInput ? industryInput.value.trim() : '';
            
            console.log('Calling ApiService.findCitations directly');
            
            // Call the API service directly
            ApiService.findCitations(
                masterResumeValue,
                window.keywordsData || window.extractedKeywords,
                jobTitleValue,
                companyNameValue,
                industryValue
            )
            .then(data => {
                console.log('ApiService.findCitations response:', data);
                
                if (data.success) {
                    // Add citations to the citations panel
                    if (data.citations && typeof window.addCitationsToPanel === 'function') {
                        console.log('Adding citations to panel');
                        window.addCitationsToPanel('keywords', data.citations);
                        
                        // Store citations data globally
                        if (!window.citationsData) {
                            window.citationsData = {};
                        }
                        window.citationsData.keywords = data.citations;
                        
                        // Create a foundKeywords object based on the citations
                        const foundKeywords = {};
                        
                        // Process each priority level in the citations
                        const processCitations = (priorityData) => {
                            for (const keyword in priorityData) {
                                // If there's a citation for this keyword, mark it as found
                                foundKeywords[keyword] = true;
                            }
                        };
                        
                        // Process each priority level
                        if (data.citations.high_priority) processCitations(data.citations.high_priority);
                        if (data.citations.medium_priority) processCitations(data.citations.medium_priority);
                        if (data.citations.low_priority) processCitations(data.citations.low_priority);
                        if (data.citations.fallback_extraction) processCitations(data.citations.fallback_extraction);
                        
                        console.log('Created foundKeywords object from citations:', foundKeywords);
                        
                        // Update the keywords display with found/not found indicators based on citations
                        if (window.KeywordManager && typeof window.KeywordManager.updateKeywordsWithFoundStatus === 'function') {
                            console.log('Updating keywords with found status based on citations');
                            window.KeywordManager.updateKeywordsWithFoundStatus(foundKeywords);
                        }
                        
                        // Highlight the keywords in the master resume
                        if (window.KeywordManager && typeof window.KeywordManager.highlightKeywordsInResume === 'function') {
                            console.log('Highlighting keywords in resume based on citations');
                            window.KeywordManager.highlightKeywordsInResume(masterResumeValue, foundKeywords);
                        }
                        
                        // Reset button state
                        const updatedBtn = document.getElementById('guideGenerateCitationsBtn');
                        if (updatedBtn) {
                            console.log('Citations generated successfully, resetting button state');
                            updatedBtn.disabled = false;
                            updatedBtn.classList.remove('opacity-75');
                            updatedBtn.innerHTML = `Generate Citations for Keywords`;
                        }
                        
                        // Show success message
                        showSuccessMessage('Citations generated successfully! Check the Citations Panel.');
                        
                        // Make sure the citations panel is visible
                        const citationsPanel = document.getElementById('citationsPanel');
                        if (citationsPanel) {
                            citationsPanel.classList.remove('hidden');
                        }
                    } else {
                        console.error('No citations found or addCitationsToPanel function not available');
                        showAlert('No citations found in your resume.');
                        
                        // Reset button state
                        const errorBtn = document.getElementById('guideGenerateCitationsBtn');
                        if (errorBtn) {
                            errorBtn.disabled = false;
                            errorBtn.classList.remove('opacity-75');
                            errorBtn.innerHTML = `Generate Citations for Keywords`;
                        }
                    }
                } else {
                    console.error('Error finding citations:', data.message);
                    showAlert(data.message || 'Error finding citations');
                    
                    // Reset button state
                    const errorBtn = document.getElementById('guideGenerateCitationsBtn');
                    if (errorBtn) {
                        errorBtn.disabled = false;
                        errorBtn.classList.remove('opacity-75');
                        errorBtn.innerHTML = `Generate Citations for Keywords`;
                    }
                }
            })
            .catch(error => {
                console.error('Error calling ApiService.findCitations:', error);
                showAlert('An error occurred while finding citations. Please try again.');
                
                // Reset button state
                const errorBtn = document.getElementById('guideGenerateCitationsBtn');
                if (errorBtn) {
                    errorBtn.disabled = false;
                    errorBtn.classList.remove('opacity-75');
                    errorBtn.innerHTML = `Generate Citations for Keywords`;
                }
            });
        } catch (error) {
            console.error('Error generating citations:', error);
            
            // Reset button state
            const errorBtn = document.getElementById('guideGenerateCitationsBtn');
            if (errorBtn) {
                errorBtn.disabled = false;
                errorBtn.classList.remove('opacity-75');
                errorBtn.innerHTML = `Generate Citations for Keywords`;
            }
            
            // Show error message
            showAlert('Error generating citations. Please try again.');
        }
    } else {
        console.error('KeywordManager.findCitations function not found');
        // Fallback if the function doesn't exist
        showAlert('Citation generation function not found. Please refresh the page and try again.');
    }
}

// Handle Generate Profile button click
function handleGenerateProfile() {
    // Directly call the ProfileManager's generate function if available
    if (window.ProfileManager && typeof window.ProfileManager.generateProfile === 'function') {
        window.ProfileManager.generateProfile();
    } else {
        // Fallback to clicking the button if the direct method is not available
        document.getElementById('generateProfileBtn').click();
    }
}

// Handle Generate Competencies button click
function handleGenerateCompetencies() {
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
        } else {
            // Navigate directly to the sections without using buttons
            const keywordsSection = document.getElementById('keywordsSection');
            const careerProfileSection = document.getElementById('careerProfileSection');
            const coreCompetenciesSection = document.getElementById('coreCompetenciesSection');
            
            if (keywordsSection && careerProfileSection && coreCompetenciesSection) {
                keywordsSection.classList.add('hidden');
                careerProfileSection.classList.add('hidden');
                coreCompetenciesSection.classList.remove('hidden');
            }
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
}

// Handle Save Profile button click
function handleSaveProfile() {
    // Trigger the save profile action in the main application
    document.getElementById('saveProfileBtn').click();
}

// Handle Save Competencies button click
function handleSaveCompetencies() {
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
}

// Handle Save Citations button click
function handleSaveCitations() {
    // Trigger the save citations action in the main application
    document.getElementById('saveCitationsBtn').click();
}

// Activate a specific step in the guide
function activateStep(stepNumber) {
    console.log(`Activating step ${stepNumber}`);
    // Update the current step
    currentStep = stepNumber;
    
    // Update the UI for all steps
    for (let i = 1; i <= 5; i++) {
        const stepElement = document.getElementById(`guideStep${i}`);
        
        // Skip if the element doesn't exist
        if (!stepElement) continue;
        
        if (i < stepNumber) {
            // Previous steps - completed
            stepElement.classList.remove('opacity-50', 'bg-gray-50', 'border-gray-200');
            stepElement.classList.add('bg-green-50', 'border-green-200');
            
            // Update the step number to a checkmark
            const stepNumberSpan = stepElement.querySelector('span');
            stepNumberSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>`;
            
            // Update the heading color
            const heading = stepElement.querySelector('h3');
            heading.classList.remove('text-gray-500');
            heading.classList.add('text-green-700');
            
            // Update the paragraph color
            const paragraph = stepElement.querySelector('p');
            paragraph.classList.remove('text-gray-400');
            paragraph.classList.add('text-gray-600');
        } else if (i === stepNumber) {
            // Current step - active
            stepElement.classList.remove('opacity-50', 'bg-gray-50', 'border-gray-200');
            stepElement.classList.add('bg-green-50', 'border-green-200');
            
            // Update the heading color
            const heading = stepElement.querySelector('h3');
            heading.classList.remove('text-gray-500');
            heading.classList.add('text-green-700');
            
            // Update the paragraph color
            const paragraph = stepElement.querySelector('p');
            paragraph.classList.remove('text-gray-400');
            paragraph.classList.add('text-gray-600');
            
            // Enable all buttons and inputs in this step
            const buttons = stepElement.querySelectorAll('button');
            buttons.forEach(button => {
                console.log(`Enabling button: ${button.id || 'unnamed button'}`);
                button.disabled = false;
                button.classList.remove('opacity-50');
                
                // Special handling for the Generate Citations button
                if (button.id === 'guideGenerateCitationsBtn') {
                    console.log('Found and enabled the Generate Citations button in activateStep');
                    
                    // Replace the button completely
                    const newBtn = document.createElement('button');
                    newBtn.id = 'guideGenerateCitationsBtn';
                    newBtn.className = 'w-full px-3 py-2 rounded text-sm';
                    newBtn.style.backgroundColor = 'rgba(46, 204, 113, 0.1)';
                    newBtn.style.color = '#2ECC71';
                    newBtn.style.border = '1px solid rgba(46, 204, 113, 0.2)';
                    newBtn.disabled = false;
                    newBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="#2ECC71">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Generate Citations for Keywords
                    `;
                    
                    // Add multiple event listeners to ensure it works
                    newBtn.addEventListener('click', function(e) {
                        console.log('Generate Citations button clicked via activateStep handler!');
                        e.preventDefault();
                        e.stopPropagation();
                        handleGenerateCitations();
                    });
                    
                    // Also add an inline onclick attribute as a fallback
                    newBtn.setAttribute('onclick', 'handleGenerateCitations(); return false;');
                    
                    // Replace the old button
                    button.parentNode.replaceChild(newBtn, button);
                    console.log('Generate Citations button replaced in activateStep');
                }
            });
            
            const inputs = stepElement.querySelectorAll('input, select');
            inputs.forEach(input => {
                input.disabled = false;
                input.classList.remove('bg-gray-100');
            });
        } else {
            // Future steps - inactive
            stepElement.classList.add('opacity-50', 'bg-gray-50', 'border-gray-200');
            stepElement.classList.remove('bg-green-50', 'border-green-200');
            
            // Update the heading color
            const heading = stepElement.querySelector('h3');
            heading.classList.add('text-gray-500');
            heading.classList.remove('text-green-700');
            
            // Update the paragraph color
            const paragraph = stepElement.querySelector('p');
            paragraph.classList.add('text-gray-400');
            paragraph.classList.remove('text-gray-600');
            
            // Disable all buttons and inputs in this step
            const buttons = stepElement.querySelectorAll('button');
            buttons.forEach(button => {
                button.disabled = true;
                button.classList.add('opacity-50');
            });
            
            const inputs = stepElement.querySelectorAll('input, select');
            inputs.forEach(input => {
                input.disabled = true;
                input.classList.add('bg-gray-100');
            });
        }
    }
}

// Listen for changes in the main application state
function listenForApplicationChanges() {
    // Create a MutationObserver to watch for changes in the DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Check for changes in the keywords section
            if (mutation.target.id === 'extractedKeywordsContainer' && 
                !mutation.target.classList.contains('hidden')) {
                // Keywords have been extracted, activate step 2
                activateStep(2);
            }
            
            // Check for changes in the career profile section
            if (mutation.target.id === 'careerProfileSection' && 
                !mutation.target.classList.contains('hidden')) {
                // Moved to career profile section, activate step 4
                activateStep(4);
            }
            
            // Check for changes in the highlighted profile
            if (mutation.target.id === 'highlightedProfile' && 
                !mutation.target.classList.contains('hidden')) {
                // Career profile has been generated, activate step 5
                activateStep(5);
            }
            
            // Check for changes in the core competencies section
            if (mutation.target.id === 'coreCompetenciesSection' && 
                !mutation.target.classList.contains('hidden')) {
                // Moved to core competencies section, ensure step 4 is active
                if (currentStep < 4) {
                    activateStep(4);
                }
            }
        });
    });
    
    // Observe changes to the classList attribute of relevant elements
    const elementsToObserve = [
        'extractedKeywordsContainer',
        'careerProfileSection',
        'highlightedProfile',
        'coreCompetenciesSection'
    ];
    
    elementsToObserve.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            observer.observe(element, { attributes: true, attributeFilter: ['class'] });
        }
    });
}

// Show an alert message (reusing the existing alert function from main.js)
function showAlert(message) {
    const alertContainer = document.getElementById('alertContainer');
    
    if (alertContainer) {
        const alert = document.createElement('div');
        alert.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4';
        alert.innerHTML = `
            <span class="block sm:inline">${message}</span>
            <span class="absolute top-0 bottom-0 right-0 px-4 py-3">
                <svg class="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <title>Close</title>
                    <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                </svg>
            </span>
        `;
        
        // Add click event to close the alert
        alert.querySelector('svg').addEventListener('click', function() {
            alert.remove();
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
        
        alertContainer.appendChild(alert);
    } else {
        console.error('Alert container not found');
    }
}

// Show a success message
function showSuccessMessage(message) {
    const alertContainer = document.getElementById('alertContainer');
    
    if (alertContainer) {
        const alert = document.createElement('div');
        alert.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4';
        alert.innerHTML = `
            <span class="block sm:inline">${message}</span>
            <span class="absolute top-0 bottom-0 right-0 px-4 py-3">
                <svg class="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <title>Close</title>
                    <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                </svg>
            </span>
        `;
        
        // Add click event to close the alert
        alert.querySelector('svg').addEventListener('click', function() {
            alert.remove();
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
        
        alertContainer.appendChild(alert);
    } else {
        console.error('Alert container not found');
    }
}
