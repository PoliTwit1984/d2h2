/**
 * Profile Manager Module
 * 
 * Handles career profile generation and display.
 */

const ProfileManager = {
    /**
     * Initialize the profile manager
     */
    initialize: function() {
        this.initializeEventHandlers();
    },
    
    /**
     * Initialize event handlers for profile-related functionality
     */
    initializeEventHandlers: function() {
        const generateProfileBtn = document.getElementById('generateProfileBtn');
        const saveProfileBtn = document.getElementById('saveProfileBtn');
        const toggleHighlightBtn = document.getElementById('toggleHighlight');
        
        // Generate profile button click handler
        if (generateProfileBtn) {
            generateProfileBtn.addEventListener('click', function(e) {
                e.preventDefault();
                ProfileManager.generateCareerProfile();
            });
        }
        
        // Save profile button click handler
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', function(e) {
                e.preventDefault();
                ProfileManager.saveCareerProfile();
            });
        }
        
        // Toggle highlight button click handler
        if (toggleHighlightBtn) {
            toggleHighlightBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const markedProfileContent = document.getElementById('markedProfileContent');
                const careerProfile = document.getElementById('careerProfile');
                
                if (this.textContent.includes('Show Plain Text')) {
                    // Show plain text
                    markedProfileContent.innerHTML = careerProfile.value;
                    this.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" style="color: #2E86AB;" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                        </svg>
                        Show Highlights
                    `;
                } else {
                    // Show highlights
                    // We need to get the marked profile from the server again
                    // For now, just toggle back to the last known marked profile
                    if (window.lastMarkedProfile) {
                        markedProfileContent.innerHTML = window.lastMarkedProfile;
                    }
                    
                    this.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" style="color: #2E86AB;" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                        </svg>
                        Show Plain Text
                    `;
                }
            });
        }
    },
    
    /**
     * Generate career profile
     */
    generateCareerProfile: function() {
        const jobDescriptionTextarea = document.getElementById('jobDescription');
        const masterResumeTextarea = document.getElementById('masterResume');
        const careerProfileTextarea = document.getElementById('careerProfile');
        const jobTitleInput = document.getElementById('jobTitle');
        const companyNameInput = document.getElementById('companyName');
        
        // Validate input
        if (!jobDescriptionTextarea.value.trim() || !masterResumeTextarea.value.trim()) {
            UiManager.showAlert('Please paste both a job description and your master resume.');
            return;
        }
        
        // Store the values to preserve them
        const jobDescriptionValue = jobDescriptionTextarea.value;
        const masterResumeValue = masterResumeTextarea.value;
        const jobTitleValue = jobTitleInput ? jobTitleInput.value.trim() : '';
        const companyNameValue = companyNameInput ? companyNameInput.value.trim() : '';
        
        // Show loading state
        const generateProfileBtn = document.getElementById('generateProfileBtn');
        generateProfileBtn.disabled = true;
        generateProfileBtn.classList.add('opacity-75');
        generateProfileBtn.innerHTML = `
            <div class="spinner" style="width: 1rem; height: 1rem;"></div>
            <span>Generating...</span>
        `;
        
        // Call the API service to generate career profile
        ApiService.generateProfile(
            jobDescriptionValue, 
            masterResumeValue, 
            window.extractedKeywords || [], 
            window.citationsData?.keywords || {},
            jobTitleValue,
            companyNameValue
        )
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
                
                // Store the marked profile for toggling
                window.lastMarkedProfile = data.marked_profile;
                
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
                UiManager.showSuccessMessage('Career profile generated successfully!');
                
                // If we have citations data, add it to the citations panel
                if (data.citations && typeof window.addCitationsToPanel === 'function') {
                    window.addCitationsToPanel('career_profile', data.citations);
                    
                    // Store citations data globally
                    if (!window.citationsData) {
                        window.citationsData = {};
                    }
                    window.citationsData.career_profile = data.citations;
                    
                    // Show the citations section
                    const citationsSection = document.getElementById('citationsSection');
                    const citationsContainer = document.getElementById('citationsContainer');
                    citationsContainer.innerHTML = '';
                    
                    for (const [keyword, citation] of Object.entries(data.citations)) {
                        const citationDiv = document.createElement('div');
                        citationDiv.className = 'mb-3';
                        
                        const keywordHeader = document.createElement('h4');
                        keywordHeader.className = 'text-sm font-semibold mb-1';
                        keywordHeader.textContent = keyword;
                        citationDiv.appendChild(keywordHeader);
                        
                        const citationText = document.createElement('p');
                        citationText.className = 'text-xs text-gray-700 mb-2 pl-3 border-l-2 border-gray-300';
                        citationText.textContent = citation;
                        citationDiv.appendChild(citationText);
                        
                        citationsContainer.appendChild(citationDiv);
                    }
                    
                    citationsSection.classList.remove('hidden');
                }
            } else {
                // Show error message
                UiManager.showAlert(data.message || 'Error generating career profile');
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
            UiManager.showAlert('An error occurred. Please try again.');
        });
    },
    
    /**
     * Save career profile to a text file
     */
    saveCareerProfile: function() {
        const careerProfileTextarea = document.getElementById('careerProfile');
        
        if (careerProfileTextarea.value.trim()) {
            const blob = new Blob([careerProfileTextarea.value], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'career_profile.txt';
            a.click();
            
            URL.revokeObjectURL(url);
            
            UiManager.showSuccessMessage('Career profile saved to file!');
        } else {
            UiManager.showAlert('Please generate a career profile first.');
        }
    }
};

// Export the module
window.ProfileManager = ProfileManager;
