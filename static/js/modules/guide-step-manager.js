/**
 * guide-step-manager.js - Manages steps in the Guide Me panel
 */

const GuideStepManager = {
    // Current active step
    currentStep: 1,
    
    /**
     * Initialize the step manager
     */
    initialize: function() {
        // Set up mutation observer to listen for application changes
        this.listenForApplicationChanges();
    },
    
    /**
     * Activate a specific step in the guide
     * @param {number} stepNumber - The step number to activate
     */
    activateStep: function(stepNumber) {
        console.log(`Activating step ${stepNumber}`);
        // Update the current step
        this.currentStep = stepNumber;
        
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
                            GuidePanel.handleGenerateCitations();
                        });
                        
                        // Also add an inline onclick attribute as a fallback
                        newBtn.setAttribute('onclick', 'GuidePanel.handleGenerateCitations(); return false;');
                        
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
    },
    
    /**
     * Listen for changes in the main application state
     */
    listenForApplicationChanges: function() {
        // Create a MutationObserver to watch for changes in the DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                // Check for changes in the keywords section
                if (mutation.target.id === 'extractedKeywordsContainer' && 
                    !mutation.target.classList.contains('hidden')) {
                    // Keywords have been extracted, activate step 2
                    this.activateStep(2);
                }
                
                // Check for changes in the career profile section
                if (mutation.target.id === 'careerProfileSection' && 
                    !mutation.target.classList.contains('hidden')) {
                    // Moved to career profile section, activate step 4
                    this.activateStep(4);
                }
                
                // Check for changes in the highlighted profile
                if (mutation.target.id === 'highlightedProfile' && 
                    !mutation.target.classList.contains('hidden')) {
                    // Career profile has been generated, activate step 5
                    this.activateStep(5);
                }
                
                // Check for changes in the core competencies section
                if (mutation.target.id === 'coreCompetenciesSection' && 
                    !mutation.target.classList.contains('hidden')) {
                    // Moved to core competencies section, ensure step 4 is active
                    if (this.currentStep < 4) {
                        this.activateStep(4);
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
};

// Export the module
window.GuideStepManager = GuideStepManager;
