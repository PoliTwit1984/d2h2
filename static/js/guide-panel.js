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
    // Trigger the continue to profile action in the main application
    document.getElementById('continueToProfileBtn').click();
    
    // Activate the next step
    activateStep(3);
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
    for (let i = 1; i <= 4; i++) {
        const stepElement = document.getElementById(`guideStep${i}`);
        
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
                // Moved to career profile section, activate step 3
                activateStep(3);
            }
            
            // Check for changes in the highlighted profile
            if (mutation.target.id === 'highlightedProfile' && 
                !mutation.target.classList.contains('hidden')) {
                // Career profile has been generated, activate step 4
                activateStep(4);
            }
            
            // Check for changes in the core competencies section
            if (mutation.target.id === 'coreCompetenciesSection' && 
                !mutation.target.classList.contains('hidden')) {
                // Moved to core competencies section, ensure step 3 is active
                if (currentStep < 3) {
                    activateStep(3);
                }
            }
            
            // Check for changes in the competencies citations section
            if (mutation.target.id === 'competenciesCitationsSection' && 
                !mutation.target.classList.contains('hidden')) {
                // Core competencies have been generated, activate step 4
                activateStep(4);
            }
        });
    });
    
    // Observe changes to the classList attribute of relevant elements
    const elementsToObserve = [
        'extractedKeywordsContainer',
        'careerProfileSection',
        'highlightedProfile',
        'coreCompetenciesSection',
        'competenciesCitationsSection'
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
