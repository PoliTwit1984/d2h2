// Override the extractKeywords function to preserve form data
document.addEventListener('DOMContentLoaded', function() {
    // Store the original extractKeywords function
    const originalExtractKeywords = window.extractKeywords;
    
    // Override the extractKeywords function
    window.extractKeywords = function() {
        const jobDescriptionTextarea = document.getElementById('jobDescription');
        const masterResumeTextarea = document.getElementById('masterResume');
        
        // Validate input
        if (!jobDescriptionTextarea.value.trim()) {
            showAlert('Please paste a job description.');
            return;
        }
        
        // Store the values to preserve them
        const jobDescriptionValue = jobDescriptionTextarea.value;
        const masterResumeValue = masterResumeTextarea.value;
        
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
        formData.append('job_description', jobDescriptionValue);
        
        // Include master resume if available for missing keywords analysis
        if (masterResumeValue.trim()) {
            formData.append('master_resume', masterResumeValue);
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
            
            // Restore the form values
            jobDescriptionTextarea.value = jobDescriptionValue;
            masterResumeTextarea.value = masterResumeValue;
            
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
            
            // Restore the form values
            jobDescriptionTextarea.value = jobDescriptionValue;
            masterResumeTextarea.value = masterResumeValue;
            
            console.error('Error:', error);
            showAlert('An error occurred. Please try again.');
        });
    };
});
