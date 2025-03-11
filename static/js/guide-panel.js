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
    
    // Add event listener for the Generate Citations button
    // Use a more robust approach to ensure the event listener is attached
    const attachCitationsButtonListener = () => {
        const citationsBtn = document.getElementById('guideGenerateCitationsBtn');
        if (citationsBtn) {
            // Remove any existing listeners to prevent duplicates
            citationsBtn.removeEventListener('click', handleGenerateCitations);
            // Add the event listener
            citationsBtn.addEventListener('click', handleGenerateCitations);
            console.log('Event listener attached to Generate Citations button');
        } else {
            // If the button doesn't exist yet, try again after a short delay
            console.log('Generate Citations button not found, will retry');
            setTimeout(attachCitationsButtonListener, 500);
        }
    };
    
    // Start the process of attaching the event listener
    attachCitationsButtonListener();
    
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
    
    // Trigger the extract keywords action in the main application
    document.getElementById('extractKeywordsBtn').click();
    
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
    findKeywordsInResume(() => {
        // After finding keywords, generate citations
        generateCitations();
    });
}

// Find keywords in resume
function findKeywordsInResume(callback) {
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
                    continueCitationsBtn.innerHTML = `Continue to Citations`;
                }
                return;
            }
            
            if (!window.extractedKeywords || window.extractedKeywords.length === 0) {
                showAlert('No keywords available to find in resume.');
                
                // Reset button state
                if (continueCitationsBtn) {
                    continueCitationsBtn.disabled = false;
                    continueCitationsBtn.classList.remove('opacity-75');
                    continueCitationsBtn.innerHTML = `Continue to Citations`;
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
                    
                    // Continue with the callback (generate citations)
                    if (callback && typeof callback === 'function') {
                        callback();
                    }
                } else {
                    // Show error message
                    showAlert(data.message || 'Error finding keywords in resume');
                    
                    // Reset button state
                    if (continueCitationsBtn) {
                        continueCitationsBtn.disabled = false;
                        continueCitationsBtn.classList.remove('opacity-75');
                        continueCitationsBtn.innerHTML = `Continue to Citations`;
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
                    continueCitationsBtn.innerHTML = `Continue to Citations`;
                }
            });
        } catch (error) {
            console.error('Error finding keywords in resume:', error);
            
            // Reset button state
            if (continueCitationsBtn) {
                continueCitationsBtn.disabled = false;
                continueCitationsBtn.classList.remove('opacity-75');
                continueCitationsBtn.innerHTML = `Continue to Citations`;
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
            continueCitationsBtn.innerHTML = `Continue to Citations`;
        }
    }
}

// Generate citations
function generateCitations() {
    // Show loading state on the button
    const continueCitationsBtn = document.getElementById('guideContinueBtn');
    if (continueCitationsBtn) {
        continueCitationsBtn.disabled = true;
        continueCitationsBtn.classList.add('opacity-75');
        continueCitationsBtn.innerHTML = `
            <div class="spinner" style="width: 1rem; height: 1rem;"></div>
            <span>Generating Citations...</span>
        `;
    }
    
    // Check if KeywordManager is available
    if (window.KeywordManager && typeof window.KeywordManager.findCitations === 'function') {
        try {
            // Call the findCitations function
            window.KeywordManager.findCitations();
            
            // Reset button state and proceed after a delay
            setTimeout(() => {
                if (continueCitationsBtn) {
                    continueCitationsBtn.disabled = false;
                    continueCitationsBtn.classList.remove('opacity-75');
                    continueCitationsBtn.innerHTML = `Continue to Citations`;
                }
                
                // Show success message
                showSuccessMessage('Citations generated successfully! Check the Citations Panel.');
                
                // Make sure the citations panel is visible
                const citationsPanel = document.getElementById('citationsPanel');
                if (citationsPanel && citationsPanel.classList.contains('hidden')) {
                    citationsPanel.classList.remove('hidden');
                }
                
                // Trigger the continue to profile action in the main application
                document.getElementById('continueToProfileBtn').click();
                
                // Skip step 3 and activate step 4 (Generate Content) directly
                activateStep(4);
            }, 3000); // Add a buffer of 3 seconds
        } catch (error) {
            console.error('Error generating citations:', error);
            
            // Reset button state
            if (continueCitationsBtn) {
                continueCitationsBtn.disabled = false;
                continueCitationsBtn.classList.remove('opacity-75');
                continueCitationsBtn.innerHTML = `Continue to Citations`;
            }
            
            // Show error message
            showAlert('Error generating citations. Please try again.');
        }
    } else {
        // Fallback if the function doesn't exist
        showAlert('Citation generation function not found. Please refresh the page and try again.');
        
        // Reset button state
        if (continueCitationsBtn) {
            continueCitationsBtn.disabled = false;
            continueCitationsBtn.classList.remove('opacity-75');
            continueCitationsBtn.innerHTML = `Continue to Citations`;
        }
    }
}

// Handle Generate Citations button click
function handleGenerateCitations() {
    console.log('handleGenerateCitations called');
    
    // Use KeywordManager.findCitations instead of the global function
    if (window.KeywordManager && typeof window.KeywordManager.findCitations === 'function') {
        // Show loading state
        const generateCitationsBtn = document.getElementById('guideGenerateCitationsBtn');
        if (generateCitationsBtn) {
            console.log('Setting button to loading state');
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
            console.log('Calling KeywordManager.findCitations()');
            // Call the findCitations function
            window.KeywordManager.findCitations();
            
            // Reset button state after a delay
            setTimeout(() => {
                const updatedBtn = document.getElementById('guideGenerateCitationsBtn');
                if (updatedBtn) {
                    console.log('Resetting button state');
                    updatedBtn.disabled = false;
                    updatedBtn.classList.remove('opacity-75');
                    updatedBtn.innerHTML = `Generate Citations for Keywords`;
                }
                
                // Show success message but DO NOT move to the next step
                showSuccessMessage('Citations generated successfully! Check the Citations Panel.');
                
                // Make sure the citations panel is visible
                const citationsPanel = document.getElementById('citationsPanel');
                if (citationsPanel && citationsPanel.classList.contains('hidden')) {
                    citationsPanel.classList.remove('hidden');
                }
            }, 5000); // Add a buffer of 5 seconds
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
    // Trigger the generate profile action in the main application
    document.getElementById('generateProfileBtn').click();
}

// Handle Generate Competencies button click
function handleGenerateCompetencies() {
    // Navigate to competencies section if not already there
    if (!document.getElementById('coreCompetenciesSection').classList.contains('hidden')) {
        // Already on competencies section
    } else if (!document.getElementById('careerProfileSection').classList.contains('hidden')) {
        // On career profile section, navigate to competencies
        document.getElementById('nextBtn').click();
    } else {
        // Navigate to career profile first, then to competencies
        document.getElementById('continueToProfileBtn').click();
        setTimeout(() => {
            document.getElementById('nextBtn').click();
        }, 300);
    }
    
    // Trigger the generate competencies action in the main application
    setTimeout(() => {
        document.getElementById('generateCompetenciesBtn').click();
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
        document.getElementById('nextBtn').click();
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
                button.disabled = false;
                button.classList.remove('opacity-50');
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
