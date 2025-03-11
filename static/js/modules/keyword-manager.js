/**
 * Keyword Manager Module
 * 
 * Handles keyword extraction, display, and management.
 */

const KeywordManager = {
    /**
     * Initialize the keyword manager
     */
    initialize: function() {
        this.initializeEventHandlers();
    },
    
    /**
     * Initialize event handlers for keyword-related functionality
     */
    initializeEventHandlers: function() {
        const extractKeywordsBtn = document.getElementById('extractKeywordsBtn');
        const continueToProfileBtn = document.getElementById('continueToProfileBtn');
        const addKeywordBtn = document.getElementById('addKeywordBtn');
        const newKeywordInput = document.getElementById('newKeywordInput');
        
        // Extract keywords button click handler
        if (extractKeywordsBtn) {
            extractKeywordsBtn.addEventListener('click', function(e) {
                e.preventDefault();
                KeywordManager.extractKeywords();
            });
        }
        
        // Continue to profile button click handler
        if (continueToProfileBtn) {
            continueToProfileBtn.addEventListener('click', function(e) {
                e.preventDefault();
                UiManager.navigateToCareerProfile();
            });
        }
        
        // Add keyword button click handler
        if (addKeywordBtn) {
            addKeywordBtn.addEventListener('click', function(e) {
                e.preventDefault();
                KeywordManager.addNewKeyword();
            });
        }
        
        // Add keyword on Enter key press
        if (newKeywordInput) {
            newKeywordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    KeywordManager.addNewKeyword();
                }
            });
        }
        
        // Initialize text selection handler for job description
        this.initializeTextSelectionHandler();
    },
    
    /**
     * Initialize text selection handler for job description
     */
    initializeTextSelectionHandler: function() {
        // We need to use a mutation observer to detect when the highlighted job description is added to the DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    const highlightedJobDescriptionSection = document.getElementById('highlightedJobDescriptionSection');
                    if (highlightedJobDescriptionSection) {
                        console.log('Highlighted job description section found, adding event listener');
                        // Add event listener to the content container
                        const contentContainer = highlightedJobDescriptionSection.querySelector('div.text-sm.p-3');
                        if (contentContainer) {
                            contentContainer.addEventListener('mouseup', function() {
                                const selection = window.getSelection();
                                const selectedText = selection.toString().trim();
                                
                                // If there's a valid selection, show the add keyword popup
                                if (selectedText && selectedText.length > 1) {
                                    KeywordManager.showAddKeywordPopup(selectedText, selection);
                                }
                            });
                            
                            // We found and set up the listener, so we can disconnect the observer
                            observer.disconnect();
                        }
                    }
                }
            });
        });
        
        // Start observing the document body for changes
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Also try to add the event listener directly in case the section already exists
        const highlightedJobDescriptionSection = document.getElementById('highlightedJobDescriptionSection');
        if (highlightedJobDescriptionSection) {
            const contentContainer = highlightedJobDescriptionSection.querySelector('div.text-sm.p-3');
            if (contentContainer) {
                contentContainer.addEventListener('mouseup', function() {
                    const selection = window.getSelection();
                    const selectedText = selection.toString().trim();
                    
                    // If there's a valid selection, show the add keyword popup
                    if (selectedText && selectedText.length > 1) {
                        KeywordManager.showAddKeywordPopup(selectedText, selection);
                    }
                });
            }
        }
    },
    
    /**
     * Show popup to add selected text as a keyword
     * 
     * @param {string} selectedText - The selected text
     * @param {Selection} selection - The selection object
     */
    showAddKeywordPopup: function(selectedText, selection) {
        // Remove any existing popup
        const existingPopup = document.getElementById('addKeywordPopup');
        if (existingPopup) {
            existingPopup.remove();
        }
        
        // Create popup element
        const popup = document.createElement('div');
        popup.id = 'addKeywordPopup';
        popup.className = 'absolute bg-white rounded-md shadow-md p-3 border border-gray-200 z-50';
        popup.style.minWidth = '200px';
        
        // Get selection position
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Position the popup near the selection
        popup.style.top = `${window.scrollY + rect.bottom + 10}px`;
        popup.style.left = `${window.scrollX + rect.left}px`;
        
        // Create popup content
        popup.innerHTML = `
            <div class="text-sm font-medium mb-2">Add as keyword:</div>
            <div class="text-xs bg-gray-100 p-2 rounded mb-2 max-w-xs overflow-hidden text-ellipsis">${selectedText}</div>
            <div class="flex items-center mb-2">
                <label class="text-xs mr-2">Priority:</label>
                <select id="popupKeywordPriority" class="text-xs border border-gray-300 rounded-md py-1 px-2">
                    <option value="high">High</option>
                    <option value="medium" selected>Medium</option>
                    <option value="low">Low</option>
                </select>
            </div>
            <div class="flex justify-between">
                <button id="cancelAddKeywordBtn" class="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 border border-gray-300">Cancel</button>
                <button id="confirmAddKeywordBtn" class="text-xs px-2 py-1 rounded" style="background-color: rgba(46, 204, 113, 0.1); color: #2ECC71; border: 1px solid rgba(46, 204, 113, 0.2);">Add</button>
            </div>
        `;
        
        // Add popup to the document
        document.body.appendChild(popup);
        
        // Add event listeners to popup buttons
        document.getElementById('cancelAddKeywordBtn').addEventListener('click', function() {
            popup.remove();
        });
        
        document.getElementById('confirmAddKeywordBtn').addEventListener('click', function() {
            const priority = document.getElementById('popupKeywordPriority').value;
            KeywordManager.addSelectedKeyword(selectedText, priority);
            popup.remove();
        });
        
        // Close popup when clicking outside
        document.addEventListener('mousedown', function closePopup(e) {
            if (!popup.contains(e.target)) {
                popup.remove();
                document.removeEventListener('mousedown', closePopup);
            }
        });
    },
    
    /**
     * Add selected text as a keyword
     * 
     * @param {string} keyword - The keyword text
     * @param {string} priority - The priority level (high, medium, low)
     */
    addSelectedKeyword: function(keyword, priority) {
        // Initialize keywords data structure if needed
        if (!window.keywordsData) {
            window.keywordsData = {
                keywords: {
                    high_priority: [],
                    medium_priority: [],
                    low_priority: []
                }
            };
        }
        
        if (!window.keywordsData.keywords) {
            window.keywordsData.keywords = {
                high_priority: [],
                medium_priority: [],
                low_priority: []
            };
        }
        
        if (!window.keywordsData.keywords[`${priority}_priority`]) {
            window.keywordsData.keywords[`${priority}_priority`] = [];
        }
        
        // Add the keyword with user_added flag
        window.keywordsData.keywords[`${priority}_priority`].push({
            keyword: keyword,
            score: priority === 'high' ? 0.95 : (priority === 'medium' ? 0.75 : 0.50),
            user_added: true
        });
        
        // Add to the extracted keywords array if it doesn't exist
        if (!window.extractedKeywords) {
            window.extractedKeywords = [];
        }
        
        if (!window.extractedKeywords.includes(keyword)) {
            window.extractedKeywords.push(keyword);
        }
        
        // Highlight the selected text in the job description
        this.highlightSelectedKeyword(keyword, priority);
        
        // Refresh the keywords display
        this.displayEnhancedKeywords(window.keywordsData, window.extractedKeywords);
        
        // Show success message
        UiManager.showSuccessMessage(`Added "${keyword}" as ${priority} priority keyword`);
    },
    
    /**
     * Highlight the selected keyword in the job description
     * 
     * @param {string} keyword - The keyword text
     * @param {string} priority - The priority level (high, medium, low)
     */
    highlightSelectedKeyword: function(keyword, priority) {
        // Get the job description content container
        const contentContainer = document.querySelector('#highlightedJobDescriptionSection div.text-sm.p-3');
        if (!contentContainer) return;
        
        // Get the HTML content
        let content = contentContainer.innerHTML;
        
        // Define the CSS class based on priority
        let cssClass = '';
        switch (priority) {
            case 'high':
                cssClass = 'high-priority-keyword';
                break;
            case 'medium':
                cssClass = 'medium-priority-keyword';
                break;
            case 'low':
                cssClass = 'low-priority-keyword';
                break;
            default:
                cssClass = 'medium-priority-keyword';
        }
        
        // Create a regex to find the keyword with word boundaries
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        
        // Replace the keyword with a marked version
        content = content.replace(regex, `<mark class="${cssClass}" data-user-added="true">${keyword}</mark>`);
        
        // Update the content
        contentContainer.innerHTML = content;
    },
    
    /**
     * Extract keywords from job description
     */
    extractKeywords: function() {
        const jobDescriptionTextarea = document.getElementById('jobDescription');
        const masterResumeTextarea = document.getElementById('masterResume');
        const jobTitleInput = document.getElementById('jobTitle');
        const companyNameInput = document.getElementById('companyName');
        
        // Validate input
        if (!jobDescriptionTextarea.value.trim()) {
            UiManager.showAlert('Please paste a job description.');
            return;
        }
        
        // Store the values to preserve them
        const jobDescriptionValue = jobDescriptionTextarea.value;
        const masterResumeValue = masterResumeTextarea.value;
        const jobTitleValue = jobTitleInput ? jobTitleInput.value.trim() : '';
        const companyNameValue = companyNameInput ? companyNameInput.value.trim() : '';
        
        // Show loading state
        const extractKeywordsBtn = document.getElementById('extractKeywordsBtn');
        extractKeywordsBtn.disabled = true;
        extractKeywordsBtn.classList.add('opacity-75');
        extractKeywordsBtn.innerHTML = `
            <div class="spinner" style="width: 1rem; height: 1rem;"></div>
            <span>Extracting...</span>
        `;
        
        // Call the API service to extract keywords
        ApiService.extractKeywords(
            jobDescriptionValue, 
            masterResumeValue,
            jobTitleValue,
            companyNameValue
        )
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
                // Store keywords globally
                window.extractedKeywords = data.keywords;
                
                // Store enhanced keywords data if available
                if (data.keywords_data) {
                    window.keywordsData = data.keywords_data;
                }
                
                // Focus on displaying the highlighted job description first
                if (data.highlighted_job_description) {
                    UiManager.displayHighlightedJobDescription(data.highlighted_job_description);
                    
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
                                KeywordManager.displayEnhancedKeywords(window.keywordsData, window.extractedKeywords);
                                
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
                    this.displayEnhancedKeywords(window.keywordsData, window.extractedKeywords);
                    
                    // Show continue button and keyword input
                    document.getElementById('continueToProfileBtn').classList.remove('hidden');
                    document.getElementById('keywordInputContainer').classList.remove('hidden');
                }
                
                // Show success message
                UiManager.showSuccessMessage('Keywords extracted successfully!');
                
                // Store citations data globally if available, but don't add to panel yet
                if (data.citations) {
                    if (!window.citationsData) {
                        window.citationsData = {};
                    }
                    window.citationsData.keywords = data.citations;
                }
            } else {
                // Show error message
                UiManager.showAlert(data.message || 'Error extracting keywords');
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
            UiManager.showAlert('An error occurred. Please try again.');
        });
    },
    
    /**
     * Display enhanced keywords with prioritization
     * 
     * @param {Object} keywordsData - The enhanced keywords data
     * @param {Array} allKeywords - The flat list of all keywords
     */
    displayEnhancedKeywords: function(keywordsData, allKeywords) {
        const container = document.getElementById('extractedKeywordsContainer');
        container.innerHTML = '';
        
        // Create sections for prioritized keywords
        if (keywordsData.keywords) {
            // High priority keywords
            if (keywordsData.keywords.high_priority && keywordsData.keywords.high_priority.length > 0) {
                const highPrioritySection = document.createElement('div');
                highPrioritySection.className = 'mb-4';
                
                const sectionTitle = document.createElement('h4');
                sectionTitle.className = 'text-sm font-semibold mb-2 text-green-600';
                sectionTitle.textContent = 'High Priority Keywords';
                highPrioritySection.appendChild(sectionTitle);
                
                const keywordsContainer = document.createElement('div');
                keywordsContainer.className = 'flex flex-wrap gap-2';
                
                // Sort by score (highest first)
                const sortedKeywords = [...keywordsData.keywords.high_priority].sort((a, b) => {
                    // Handle both string and object
                    const scoreA = typeof a === 'object' && a.score !== undefined ? a.score : 0;
                    const scoreB = typeof b === 'object' && b.score !== undefined ? b.score : 0;
                    return scoreB - scoreA;
                });
                
                sortedKeywords.forEach(item => {
                    const keywordText = typeof item === 'string' ? item : (item.keyword || '');
                    const score = typeof item === 'object' && item.score !== undefined ? item.score : null;
                    const userAdded = typeof item === 'object' && item.user_added === true;
                    
                    if (keywordText) {
                        const keywordElement = this.createKeywordElement(keywordText, 'high', score, false, userAdded);
                        keywordsContainer.appendChild(keywordElement);
                    }
                });
                
                highPrioritySection.appendChild(keywordsContainer);
                container.appendChild(highPrioritySection);
            }
            
            // Medium priority keywords
            if (keywordsData.keywords.medium_priority && keywordsData.keywords.medium_priority.length > 0) {
                const mediumPrioritySection = document.createElement('div');
                mediumPrioritySection.className = 'mb-4';
                
                const sectionTitle = document.createElement('h4');
                sectionTitle.className = 'text-sm font-semibold mb-2 text-yellow-600';
                sectionTitle.textContent = 'Medium Priority Keywords';
                mediumPrioritySection.appendChild(sectionTitle);
                
                const keywordsContainer = document.createElement('div');
                keywordsContainer.className = 'flex flex-wrap gap-2';
                
                // Sort by score (highest first)
                const sortedKeywords = [...keywordsData.keywords.medium_priority].sort((a, b) => {
                    // Handle both string and object
                    const scoreA = typeof a === 'object' && a.score !== undefined ? a.score : 0;
                    const scoreB = typeof b === 'object' && b.score !== undefined ? b.score : 0;
                    return scoreB - scoreA;
                });
                
                sortedKeywords.forEach(item => {
                    const keywordText = typeof item === 'string' ? item : (item.keyword || '');
                    const score = typeof item === 'object' && item.score !== undefined ? item.score : null;
                    const userAdded = typeof item === 'object' && item.user_added === true;
                    
                    if (keywordText) {
                        const keywordElement = this.createKeywordElement(keywordText, 'medium', score, false, userAdded);
                        keywordsContainer.appendChild(keywordElement);
                    }
                });
                
                mediumPrioritySection.appendChild(keywordsContainer);
                container.appendChild(mediumPrioritySection);
            }
            
            // Low priority keywords
            if (keywordsData.keywords.low_priority && keywordsData.keywords.low_priority.length > 0) {
                const lowPrioritySection = document.createElement('div');
                lowPrioritySection.className = 'mb-4';
                
                const sectionTitle = document.createElement('h4');
                sectionTitle.className = 'text-sm font-semibold mb-2 text-blue-600';
                sectionTitle.textContent = 'Low Priority Keywords';
                lowPrioritySection.appendChild(sectionTitle);
                
                const keywordsContainer = document.createElement('div');
                keywordsContainer.className = 'flex flex-wrap gap-2';
                
                // Sort by score (highest first)
                const sortedKeywords = [...keywordsData.keywords.low_priority].sort((a, b) => {
                    // Handle both string and object
                    const scoreA = typeof a === 'object' && a.score !== undefined ? a.score : 0;
                    const scoreB = typeof b === 'object' && b.score !== undefined ? b.score : 0;
                    return scoreB - scoreA;
                });
                
                sortedKeywords.forEach(item => {
                    const keywordText = typeof item === 'string' ? item : (item.keyword || '');
                    const score = typeof item === 'object' && item.score !== undefined ? item.score : null;
                    const userAdded = typeof item === 'object' && item.user_added === true;
                    
                    if (keywordText) {
                        const keywordElement = this.createKeywordElement(keywordText, 'low', score, false, userAdded);
                        keywordsContainer.appendChild(keywordElement);
                    }
                });
                
                lowPrioritySection.appendChild(keywordsContainer);
                container.appendChild(lowPrioritySection);
            }
        } else {
            // Fallback to displaying all keywords without prioritization
            const keywordsContainer = document.createElement('div');
            keywordsContainer.className = 'flex flex-wrap gap-2';
            
            allKeywords.forEach(keyword => {
                const keywordElement = this.createKeywordElement(keyword, 'medium', null);
                keywordsContainer.appendChild(keywordElement);
            });
            
            container.appendChild(keywordsContainer);
        }
        
        // Display missing keywords if available
        if (keywordsData.missing_keywords && keywordsData.missing_keywords.length > 0) {
            const missingKeywordsSection = document.createElement('div');
            missingKeywordsSection.className = 'mt-6 mb-4';
            
            const sectionTitle = document.createElement('h4');
            sectionTitle.className = 'text-sm font-semibold mb-2 text-red-600';
            sectionTitle.textContent = 'Missing Keywords';
            missingKeywordsSection.appendChild(sectionTitle);
            
            const description = document.createElement('p');
            description.className = 'text-xs text-gray-600 mb-3';
            description.textContent = 'These keywords were found in the job description but not in your resume. Consider adding them if you have relevant experience.';
            missingKeywordsSection.appendChild(description);
            
            const keywordsContainer = document.createElement('div');
            keywordsContainer.className = 'flex flex-wrap gap-2';
            
            // Sort missing keywords by priority if available
            const sortedMissingKeywords = [...keywordsData.missing_keywords].sort((a, b) => {
                // Handle both string and object
                const priorityMap = { high: 3, medium: 2, low: 1 };
                const priorityA = typeof a === 'object' && a.priority ? priorityMap[a.priority] : 0;
                const priorityB = typeof b === 'object' && b.priority ? priorityMap[b.priority] : 0;
                return priorityB - priorityA;
            });
            
            sortedMissingKeywords.forEach(item => {
                const keywordText = typeof item === 'string' ? item : (item.keyword || '');
                const priority = typeof item === 'object' && item.priority ? item.priority : 'medium';
                
                if (keywordText) {
                    const keywordElement = this.createKeywordElement(keywordText, priority, null, true);
                    keywordsContainer.appendChild(keywordElement);
                }
            });
            
            missingKeywordsSection.appendChild(keywordsContainer);
            container.appendChild(missingKeywordsSection);
        }
        
        // Add a button to continue to the next step
        const continueBtn = document.createElement('button');
        continueBtn.id = 'continueToFindCitationsBtn';
        continueBtn.className = 'mt-4 px-3 py-2 rounded text-sm w-full';
        continueBtn.style.backgroundColor = 'rgba(46, 204, 113, 0.1)';
        continueBtn.style.color = '#2ECC71';
        continueBtn.style.border = '1px solid rgba(46, 204, 113, 0.2)';
        continueBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="#2ECC71">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Continue with Selected Keywords
        `;
        
        // Add event listener to the button
        continueBtn.addEventListener('click', function() {
            // Show the find keywords in resume button if master resume is provided
            const masterResumeTextarea = document.getElementById('masterResume');
            if (masterResumeTextarea && masterResumeTextarea.value.trim() && window.extractedKeywords && window.extractedKeywords.length > 0) {
                // Create the find keywords button if it doesn't exist
                let findKeywordsBtn = document.getElementById('findKeywordsBtn');
                if (!findKeywordsBtn) {
                    findKeywordsBtn = document.createElement('button');
                    findKeywordsBtn.id = 'findKeywordsBtn';
                    findKeywordsBtn.className = 'mt-4 px-3 py-2 rounded text-sm w-full';
                    findKeywordsBtn.style.backgroundColor = 'rgba(46, 134, 171, 0.1)';
                    findKeywordsBtn.style.color = '#2E86AB';
                    findKeywordsBtn.style.border = '1px solid rgba(46, 134, 171, 0.2)';
                    findKeywordsBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="#2E86AB">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Find Keywords in Resume
                    `;
                    
                    // Add event listener to the button
                    findKeywordsBtn.addEventListener('click', function() {
                        KeywordManager.findKeywordsInResume();
                    });
                    
                    // Add the button to the container
                    container.appendChild(findKeywordsBtn);
                }
                
                // Hide the continue button
                continueBtn.style.display = 'none';
                
                // Show a message about the next step
                const nextStepMessage = document.createElement('p');
                nextStepMessage.className = 'text-sm text-gray-600 mt-4 mb-2';
                nextStepMessage.textContent = 'Now you can find which keywords are present in your resume.';
                container.insertBefore(nextStepMessage, findKeywordsBtn);
            } else {
                UiManager.showAlert('Please paste a master resume to find keywords.');
            }
        });
        
        container.appendChild(continueBtn);
        
        // Show the container
        container.classList.remove('hidden');
    },
    
    /**
     * Create a keyword element with appropriate styling based on priority
     * 
     * @param {string} keyword - The keyword text
     * @param {string} priority - The priority level (high, medium, low)
     * @param {number} score - The keyword score (optional)
     * @param {boolean} isMissing - Whether this is a missing keyword
     * @param {boolean} userAdded - Whether this keyword was added by the user
     * @param {boolean} foundInResume - Whether this keyword was found in the resume
     * @returns {HTMLElement} - The keyword element
     */
    createKeywordElement: function(keyword, priority, score, isMissing = false, userAdded = false, foundInResume = null) {
        const element = document.createElement('div');
        
        // Set base classes
        let className = 'px-3 py-1 rounded-full text-xs font-medium flex items-center justify-between gap-2 mb-2 mr-1';
        
        // Add priority-specific classes
        if (isMissing) {
            className += ' bg-red-50 text-red-700 border border-red-200';
        } else if (priority === 'high') {
            className += ' bg-red-100 text-red-700';
        } else if (priority === 'medium') {
            className += ' bg-orange-100 text-orange-700';
        } else if (priority === 'low') {
            className += ' bg-yellow-100 text-yellow-700';
        } else {
            className += ' bg-green-100 text-green-700';
        }
        
        // Add user-added indicator
        if (userAdded) {
            className += ' border-2 border-blue-400';
        }
        
        element.className = className;
        
        // Create a container for the keyword text and found/not found indicator
        const textContainer = document.createElement('div');
        textContainer.className = 'flex items-center gap-1';
        
        // Add found/not found indicator if we have that information
        if (foundInResume !== null) {
            const indicator = document.createElement('span');
            if (foundInResume) {
                indicator.innerHTML = '✓';
                indicator.className = 'text-green-600 font-bold';
                indicator.title = 'Found in resume';
            } else {
                indicator.innerHTML = '✗';
                indicator.className = 'text-red-600 font-bold';
                indicator.title = 'Not found in resume';
            }
            textContainer.appendChild(indicator);
        }
        
        // Create the keyword text
        const keywordText = document.createElement('span');
        keywordText.textContent = keyword;
        textContainer.appendChild(keywordText);
        
        // Add the text container to the element
        element.appendChild(textContainer);
        
        // Add score badge if available
        if (score !== null && score !== undefined) {
            const scoreBadge = document.createElement('span');
            scoreBadge.className = 'text-xs px-1.5 py-0.5 rounded-full bg-white';
            scoreBadge.textContent = score.toFixed(1);
            element.appendChild(scoreBadge);
        }
        
        // Add missing indicator if it's a missing keyword
        if (isMissing) {
            const missingIndicator = document.createElement('span');
            missingIndicator.className = 'text-xs px-1.5 py-0.5 rounded-full bg-red-200 text-red-800';
            missingIndicator.textContent = 'Missing';
            element.appendChild(missingIndicator);
        }
        
        // Add user-added indicator if applicable
        if (userAdded) {
            const userAddedIndicator = document.createElement('span');
            userAddedIndicator.className = 'text-xs px-1.5 py-0.5 rounded-full bg-blue-200 text-blue-800';
            userAddedIndicator.textContent = 'User Added';
            element.appendChild(userAddedIndicator);
        }
        
        return element;
    },
    
    /**
     * Add a new keyword from the input field
     */
    addNewKeyword: function() {
        const newKeywordInput = document.getElementById('newKeywordInput');
        const newKeywordPriority = document.getElementById('newKeywordPriority');
        
        if (newKeywordInput.value.trim()) {
            // Add to the appropriate priority list
            const priority = newKeywordPriority.value;
            const keyword = newKeywordInput.value.trim();
            
            if (!window.keywordsData.keywords) {
                window.keywordsData.keywords = {
                    high_priority: [],
                    medium_priority: [],
                    low_priority: []
                };
            }
            
            if (priority === 'high') {
                window.keywordsData.keywords.high_priority.push({
                    keyword: keyword,
                    score: 0.95,
                    user_added: true
                });
            } else if (priority === 'medium') {
                window.keywordsData.keywords.medium_priority.push({
                    keyword: keyword,
                    score: 0.75,
                    user_added: true
                });
            } else if (priority === 'low') {
                window.keywordsData.keywords.low_priority.push({
                    keyword: keyword,
                    score: 0.50,
                    user_added: true
                });
            }
            
            // Add to the extracted keywords array
            if (!window.extractedKeywords.includes(keyword)) {
                window.extractedKeywords.push(keyword);
            }
            
            // Highlight the keyword in the job description
            this.highlightSelectedKeyword(keyword, priority);
            
            // Clear the input field
            newKeywordInput.value = '';
            
            // Refresh the keywords display
            this.displayEnhancedKeywords(window.keywordsData, window.extractedKeywords);
        }
    },
    
    /**
     * Update the keywords display with found/not found indicators
     * 
     * @param {Object} foundKeywords - Object with keyword:boolean pairs indicating if each keyword was found
     */
    updateKeywordsWithFoundStatus: function(foundKeywords) {
        // If no foundKeywords data, return
        if (!foundKeywords || Object.keys(foundKeywords).length === 0) return;
        
        // Get all keyword elements
        const keywordElements = document.querySelectorAll('#extractedKeywordsContainer > div > div.flex.flex-wrap.gap-2 > div');
        
        // Loop through each keyword element
        keywordElements.forEach(element => {
            // Get the keyword text
            const keywordText = element.querySelector('span:last-child').textContent;
            
            // Check if the keyword is found in the foundKeywords and its value is true
            const isFound = foundKeywords[keywordText] === true;
            
            // Recreate the element with found/not found indicator
            const priority = element.classList.contains('bg-red-100') ? 'high' : 
                            element.classList.contains('bg-orange-100') ? 'medium' : 'low';
            
            const score = element.querySelector('span.rounded-full.bg-white')?.textContent;
            const scoreValue = score ? parseFloat(score) : null;
            
            const isMissing = element.querySelector('span.bg-red-200.text-red-800') !== null;
            const userAdded = element.querySelector('span.bg-blue-200.text-blue-800') !== null;
            
            // Create a new element with the found/not found indicator
            const newElement = this.createKeywordElement(keywordText, priority, scoreValue, isMissing, userAdded, isFound);
            
            // Replace the old element with the new one
            element.replaceWith(newElement);
        });
    },
    
    /**
     * Highlight keywords in the master resume text
     * 
     * @param {string} resumeText - The master resume text
     * @param {Object} citations - The citations data from the API
     */
    highlightKeywordsInResume: function(resumeText, citations) {
        // If no citations data, return
        if (!citations || Object.keys(citations).length === 0) return;
        
        // Get the master resume textarea
        const masterResumeTextarea = document.getElementById('masterResume');
        if (!masterResumeTextarea) return;
        
        // Create a container for the highlighted resume
        let highlightedResumeContainer = document.getElementById('highlightedResumeContainer');
        
        // If the container doesn't exist, create it
        if (!highlightedResumeContainer) {
            highlightedResumeContainer = document.createElement('div');
            highlightedResumeContainer.id = 'highlightedResumeContainer';
            highlightedResumeContainer.className = 'border border-gray-300 rounded-md p-3 bg-white text-sm h-64 overflow-auto';
            
            // Insert the container after the textarea
            masterResumeTextarea.parentNode.insertBefore(highlightedResumeContainer, masterResumeTextarea.nextSibling);
            
            // Hide the textarea
            masterResumeTextarea.style.display = 'none';
        }
        
        // Get the keywords data
        const keywordsData = window.keywordsData;
        
        // Create a map of keywords to their priority
        const keywordPriorityMap = {};
        
        if (keywordsData && keywordsData.keywords) {
            // Add high priority keywords
            if (keywordsData.keywords.high_priority) {
                keywordsData.keywords.high_priority.forEach(item => {
                    const keyword = typeof item === 'string' ? item : (item.keyword || '');
                    if (keyword) {
                        keywordPriorityMap[keyword] = 'high';
                    }
                });
            }
            
            // Add medium priority keywords
            if (keywordsData.keywords.medium_priority) {
                keywordsData.keywords.medium_priority.forEach(item => {
                    const keyword = typeof item === 'string' ? item : (item.keyword || '');
                    if (keyword && !keywordPriorityMap[keyword]) {
                        keywordPriorityMap[keyword] = 'medium';
                    }
                });
            }
            
            // Add low priority keywords
            if (keywordsData.keywords.low_priority) {
                keywordsData.keywords.low_priority.forEach(item => {
                    const keyword = typeof item === 'string' ? item : (item.keyword || '');
                    if (keyword && !keywordPriorityMap[keyword]) {
                        keywordPriorityMap[keyword] = 'low';
                    }
                });
            }
        }
        
        // Create a copy of the resume text
        let highlightedText = resumeText;
        
        // Replace newlines with <br> tags
        highlightedText = highlightedText.replace(/\n/g, '<br>');
        
        // Highlight each keyword found in the citations
        for (const [keyword, citation] of Object.entries(citations)) {
            // Get the priority for this keyword
            const priority = keywordPriorityMap[keyword] || 'medium';
            
            // Define the CSS class based on priority
            let cssClass = '';
            switch (priority) {
                case 'high':
                    cssClass = 'high-priority-keyword';
                    break;
                case 'medium':
                    cssClass = 'medium-priority-keyword';
                    break;
                case 'low':
                    cssClass = 'low-priority-keyword';
                    break;
                default:
                    cssClass = 'medium-priority-keyword';
            }
            
            // Create a regex to find the keyword with word boundaries
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            
            // Replace the keyword with a marked version
            highlightedText = highlightedText.replace(regex, `<mark class="${cssClass}">${keyword}</mark>`);
        }
        
        // Update the container with the highlighted text
        highlightedResumeContainer.innerHTML = highlightedText;
        
        // Add a button to toggle between the highlighted view and the textarea
        let toggleButton = document.getElementById('toggleResumeViewBtn');
        
        if (!toggleButton) {
            toggleButton = document.createElement('button');
            toggleButton.id = 'toggleResumeViewBtn';
            toggleButton.className = 'mt-2 px-3 py-1 rounded text-xs';
            toggleButton.style.backgroundColor = 'rgba(46, 134, 171, 0.1)';
            toggleButton.style.color = '#2E86AB';
            toggleButton.style.border = '1px solid rgba(46, 134, 171, 0.2)';
            toggleButton.textContent = 'Switch to Edit View';
            
            // Add event listener to the button
            toggleButton.addEventListener('click', function() {
                if (masterResumeTextarea.style.display === 'none') {
                    // Switch to edit view
                    masterResumeTextarea.style.display = 'block';
                    highlightedResumeContainer.style.display = 'none';
                    toggleButton.textContent = 'Switch to Highlighted View';
                } else {
                    // Switch to highlighted view
                    masterResumeTextarea.style.display = 'none';
                    highlightedResumeContainer.style.display = 'block';
                    toggleButton.textContent = 'Switch to Edit View';
                }
            });
            
            // Insert the button after the highlighted container
            highlightedResumeContainer.parentNode.insertBefore(toggleButton, highlightedResumeContainer.nextSibling);
        }
    },
    
    /**
     * Find keywords in the master resume
     */
    findKeywordsInResume: function() {
        const masterResumeTextarea = document.getElementById('masterResume');
        const jobTitleInput = document.getElementById('jobTitle');
        const companyNameInput = document.getElementById('companyName');
        const industryInput = document.getElementById('industry');
        
        // Validate input
        if (!masterResumeTextarea.value.trim()) {
            UiManager.showAlert('Please paste a master resume to find keywords.');
            return;
        }
        
        if (!window.extractedKeywords || window.extractedKeywords.length === 0) {
            UiManager.showAlert('No keywords available to find in resume.');
            return;
        }
        
        // Store the values to preserve them
        const masterResumeValue = masterResumeTextarea.value;
        const jobTitleValue = jobTitleInput ? jobTitleInput.value.trim() : '';
        const companyNameValue = companyNameInput ? companyNameInput.value.trim() : '';
        const industryValue = industryInput ? industryInput.value.trim() : '';
        
        // Show loading state
        const findKeywordsBtn = document.getElementById('findKeywordsBtn');
        findKeywordsBtn.disabled = true;
        findKeywordsBtn.classList.add('opacity-75');
        findKeywordsBtn.innerHTML = `
            <div class="spinner" style="width: 1rem; height: 1rem;"></div>
            <span>Finding Keywords...</span>
        `;
        
        // Call the API service to find keywords in resume
        ApiService.findKeywordsInResume(
            masterResumeValue,
            window.keywordsData || window.extractedKeywords,
            jobTitleValue,
            companyNameValue,
            industryValue
        )
        .then(data => {
            // Reset button state
            findKeywordsBtn.disabled = false;
            findKeywordsBtn.classList.remove('opacity-75');
            findKeywordsBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="#2E86AB">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Find Keywords in Resume
            `;
            
            if (data.success) {
                // Update the keywords display with found/not found indicators
                this.updateKeywordsWithFoundStatus(data.found_keywords);
                
                // Display the highlighted resume
                if (data.highlighted_resume) {
                    // Get the master resume textarea
                    const masterResumeTextarea = document.getElementById('masterResume');
                    if (!masterResumeTextarea) return;
                    
                    // Create a container for the highlighted resume
                    let highlightedResumeContainer = document.getElementById('highlightedResumeContainer');
                    
                    // If the container doesn't exist, create it
                    if (!highlightedResumeContainer) {
                        highlightedResumeContainer = document.createElement('div');
                        highlightedResumeContainer.id = 'highlightedResumeContainer';
                        highlightedResumeContainer.className = 'border border-gray-300 rounded-md p-3 bg-white text-sm h-64 overflow-auto';
                        
                        // Insert the container after the textarea
                        masterResumeTextarea.parentNode.insertBefore(highlightedResumeContainer, masterResumeTextarea.nextSibling);
                        
                        // Hide the textarea
                        masterResumeTextarea.style.display = 'none';
                    }
                    
                    // Update the container with the highlighted text
                    highlightedResumeContainer.innerHTML = data.highlighted_resume;
                    
                    // Add a button to toggle between the highlighted view and the textarea
                    let toggleButton = document.getElementById('toggleResumeViewBtn');
                    
                    if (!toggleButton) {
                        toggleButton = document.createElement('button');
                        toggleButton.id = 'toggleResumeViewBtn';
                        toggleButton.className = 'mt-2 px-3 py-1 rounded text-xs';
                        toggleButton.style.backgroundColor = 'rgba(46, 134, 171, 0.1)';
                        toggleButton.style.color = '#2E86AB';
                        toggleButton.style.border = '1px solid rgba(46, 134, 171, 0.2)';
                        toggleButton.textContent = 'Switch to Edit View';
                        
                        // Add event listener to the button
                        toggleButton.addEventListener('click', function() {
                            if (masterResumeTextarea.style.display === 'none') {
                                // Switch to edit view
                                masterResumeTextarea.style.display = 'block';
                                highlightedResumeContainer.style.display = 'none';
                                toggleButton.textContent = 'Switch to Highlighted View';
                            } else {
                                // Switch to highlighted view
                                masterResumeTextarea.style.display = 'none';
                                highlightedResumeContainer.style.display = 'block';
                                toggleButton.textContent = 'Switch to Edit View';
                            }
                        });
                        
                        // Insert the button after the highlighted container
                        highlightedResumeContainer.parentNode.insertBefore(toggleButton, highlightedResumeContainer.nextSibling);
                    }
                }
                
                // Show success message
                UiManager.showSuccessMessage('Keywords found in resume!');
                
                // Count how many keywords were found
                const foundCount = Object.values(data.found_keywords).filter(Boolean).length;
                const totalCount = Object.keys(data.found_keywords).length;
                
                // Show a summary message
                const summaryMessage = document.createElement('p');
                summaryMessage.className = 'text-sm text-gray-600 mt-4 mb-2';
                summaryMessage.textContent = `Found ${foundCount} out of ${totalCount} keywords in your resume.`;
                
                // Insert the summary message before the button
                const container = document.getElementById('extractedKeywordsContainer');
                container.insertBefore(summaryMessage, findKeywordsBtn);
            } else {
                // Show error message
                UiManager.showAlert(data.message || 'Error finding keywords in resume');
            }
        })
        .catch(error => {
            // Reset button state
            findKeywordsBtn.disabled = false;
            findKeywordsBtn.classList.remove('opacity-75');
            findKeywordsBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="#2E86AB">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Find Keywords in Resume
            `;
            
            console.error('Error:', error);
            UiManager.showAlert('An error occurred while finding keywords in resume. Please try again.');
        });
    },
    
    /**
     * Find citations for keywords in the master resume
     */
    findCitations: function() {
        const masterResumeTextarea = document.getElementById('masterResume');
        const jobTitleInput = document.getElementById('jobTitle');
        const companyNameInput = document.getElementById('companyName');
        const industryInput = document.getElementById('industry');
        
        // Validate input
        if (!masterResumeTextarea.value.trim()) {
            UiManager.showAlert('Please paste a master resume to find citations.');
            return;
        }
        
        if (!window.extractedKeywords || window.extractedKeywords.length === 0) {
            UiManager.showAlert('No keywords available to find citations for.');
            return;
        }
        
        // Store the values to preserve them
        const masterResumeValue = masterResumeTextarea.value;
        const jobTitleValue = jobTitleInput ? jobTitleInput.value.trim() : '';
        const companyNameValue = companyNameInput ? companyNameInput.value.trim() : '';
        const industryValue = industryInput ? industryInput.value.trim() : '';
        
        // Show loading state
        const findCitationsBtn = document.getElementById('findCitationsBtn');
        findCitationsBtn.disabled = true;
        findCitationsBtn.classList.add('opacity-75');
        findCitationsBtn.innerHTML = `
            <div class="spinner" style="width: 1rem; height: 1rem;"></div>
            <span>Finding Citations...</span>
        `;
        
        // Call the API service to find citations
        ApiService.findCitations(
            masterResumeValue,
            window.keywordsData || window.extractedKeywords,
            jobTitleValue,
            companyNameValue,
            industryValue
        )
        .then(data => {
            // Reset button state
            findCitationsBtn.disabled = false;
            findCitationsBtn.classList.remove('opacity-75');
            findCitationsBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="#2E86AB">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Find Citations in Resume
            `;
            
            if (data.success) {
                // Add citations to the citations panel
                if (data.citations && typeof window.addCitationsToPanel === 'function') {
                    window.addCitationsToPanel('keywords', data.citations);
                    
                    // Store citations data globally
                    if (!window.citationsData) {
                        window.citationsData = {};
                    }
                    window.citationsData.keywords = data.citations;
                    
                    // Update the keywords display with found/not found indicators
                    this.updateKeywordsWithFoundStatus(data.citations);
                    
                    // Highlight the keywords in the master resume
                    this.highlightKeywordsInResume(masterResumeValue, data.citations);
                    
                    // Show success message
                    UiManager.showSuccessMessage('Citations found successfully!');
                    
                    // Open the citations panel if it's not already open
                    const citationsPanel = document.getElementById('citationsPanel');
                    if (citationsPanel) {
                        citationsPanel.classList.remove('hidden');
                    }
                } else {
                    UiManager.showAlert('No citations found in your resume.');
                }
            } else {
                // Show error message
                UiManager.showAlert(data.message || 'Error finding citations');
            }
        })
        .catch(error => {
            // Reset button state
            findCitationsBtn.disabled = false;
            findCitationsBtn.classList.remove('opacity-75');
            findCitationsBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="#2E86AB">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Find Citations in Resume
            `;
            
            console.error('Error:', error);
            UiManager.showAlert('An error occurred while finding citations. Please try again.');
        });
    }
};

// Export the module
window.KeywordManager = KeywordManager;
