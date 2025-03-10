container.className = 'mt-6 p-4 bg-white rounded-md shadow-sm';
        container.style.border = '1px solid rgba(46, 134, 171, 0.3)';
        
        // Create the header with toggle button
        const header = document.createElement('div');
        header.className = 'flex justify-between items-center mb-2';
        
        const title = document.createElement('h3');
        title.className = 'text-sm font-semibold text-gray-700 flex items-center';
        title.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" style="color: #2E86AB;" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            Highlighted Job Description
        `;
        
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'toggleJobDescription';
        toggleBtn.className = 'text-xs flex items-center';
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
            const content = document.getElementById('highlightedJobDescription');
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
        container.appendChild(header);
        
        // Create the priority legend
        const legend = document.createElement('div');
        legend.className = 'priority-legend';
        
        // High priority legend item
        const highPriorityItem = document.createElement('div');
        highPriorityItem.className = 'priority-legend-item';
        highPriorityItem.innerHTML = `
            <div class="priority-indicator high-priority-indicator"></div>
            <span>High Priority</span>
        `;
        
        // Medium priority legend item
        const mediumPriorityItem = document.createElement('div');
        mediumPriorityItem.className = 'priority-legend-item';
        mediumPriorityItem.innerHTML = `
            <div class="priority-indicator medium-priority-indicator"></div>
            <span>Medium Priority</span>
        `;
        
        // Low priority legend item
        const lowPriorityItem = document.createElement('div');
        lowPriorityItem.className = 'priority-legend-item';
        lowPriorityItem.innerHTML = `
            <div class="priority-indicator low-priority-indicator"></div>
            <span>Low Priority</span>
        `;
        
        legend.appendChild(highPriorityItem);
        legend.appendChild(mediumPriorityItem);
        legend.appendChild(lowPriorityItem);
        container.appendChild(legend);
        
        // Create the content container
        const content = document.createElement('div');
        content.id = 'highlightedJobDescription';
        content.className = 'text-sm p-3 bg-gray-50 rounded';
        container.appendChild(content);
        
        // Insert the container at the top of the keywords section
        const keywordsSection = document.getElementById('keywordsSection');
        const firstChild = keywordsSection.firstChild;
        keywordsSection.insertBefore(container, firstChild.nextSibling);
    }
    
    // Update the content
    const content = document.getElementById('highlightedJobDescription');
    content.innerHTML = highlightedText;
    
    // Make sure the container is visible
    container.style.display = 'block';
}

// Display enhanced keywords with prioritization
function displayEnhancedKeywords(keywordsData, allKeywords) {
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
                
                if (keywordText) {
                    const keywordElement = createKeywordElement(keywordText, 'high', score);
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
                
                if (keywordText) {
                    const keywordElement = createKeywordElement(keywordText, 'medium', score);
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
                
                if (keywordText) {
                    const keywordElement = createKeywordElement(keywordText, 'low', score);
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
            const keywordElement = createKeywordElement(keyword, 'medium', null);
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
                const keywordElement = createKeywordElement(keywordText, priority, null, true);
                keywordsContainer.appendChild(keywordElement);
            }
        });
        
        missingKeywordsSection.appendChild(keywordsContainer);
        container.appendChild(missingKeywordsSection);
    }
    
    // Show the container
    container.classList.remove('hidden');
}

// Create a keyword element with appropriate styling based on priority
function createKeywordElement(keyword, priority, score, isMissing = false) {
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
    
    element.className = className;
    
    // Create the keyword text
    const keywordText = document.createElement('span');
    keywordText.textContent = keyword;
    element.appendChild(keywordText);
    
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
    
    return element;
}

// Add a new keyword from the input field
function addNewKeyword() {
    const newKeywordInput = document.getElementById('newKeywordInput');
    const newKeywordPriority = document.getElementById('newKeywordPriority');
    
    if (newKeywordInput.value.trim()) {
        // Add to the appropriate priority list
        const priority = newKeywordPriority.value;
        const keyword = newKeywordInput.value.trim();
        
        if (!keywordsData.keywords) {
            keywordsData.keywords = {
                high_priority: [],
                medium_priority: [],
                low_priority: []
            };
        }
        
        if (priority === 'high') {
            keywordsData.keywords.high_priority.push(keyword);
        } else if (priority === 'medium') {
            keywordsData.keywords.medium_priority.push(keyword);
        } else if (priority === 'low') {
            keywordsData.keywords.low_priority.push(keyword);
        }
        
        // Add to the extracted keywords array
        if (!extractedKeywords.includes(keyword)) {
            extractedKeywords.push(keyword);
        }
        
        // Clear the input field
        newKeywordInput.value = '';
        
        // Refresh the keywords display
        displayEnhancedKeywords(keywordsData, extractedKeywords);
    }
}

// Save career profile to a text file
function saveCareerProfile() {
    const careerProfileTextarea = document.getElementById('careerProfile');
    
    if (careerProfileTextarea.value.trim()) {
        const blob = new Blob([careerProfileTextarea.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'career_profile.txt';
        a.click();
        
        URL.revokeObjectURL(url);
        
        showSuccessMessage('Career profile saved to file!');
    } else {
        showAlert('Please generate a career profile first.');
    }
}

// Save competencies to a text file
function saveCompetencies() {
    const coreCompetenciesTextarea = document.getElementById('coreCompetencies');
    
    if (coreCompetenciesTextarea.value.trim()) {
        const blob = new Blob([coreCompetenciesTextarea.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'core_competencies.txt';
        a.click();
        
        URL.revokeObjectURL(url);
        
        showSuccessMessage('Core competencies saved to file!');
    } else {
        showAlert('Please generate core competencies first.');
    }
}

// Save citations for interview prep
function saveCitationsForInterviewPrep() {
    // Prepare the citations data
    let citationsText = '# Interview Preparation Notes\n\n';
    
    // Add keywords citations
    if (citationsData.keywords && Object.keys(citationsData.keywords).length > 0) {
        citationsText += '## Keywords\n\n';
        
        for (const [keyword, citation] of Object.entries(citationsData.keywords)) {
            citationsText += `### ${keyword}\n${citation}\n\n`;
        }
    }
    
    // Add career profile citations
    if (citationsData.career_profile && Object.keys(citationsData.career_profile).length > 0) {
        citationsText += '## Career Profile\n\n';
        
        for (const [keyword, citation] of Object.entries(citationsData.career_profile)) {
            citationsText += `### ${keyword}\n${citation}\n\n`;
        }
    }
    
    // Add core competencies citations
    if (citationsData.core_competencies && Object.keys(citationsData.core_competencies).length > 0) {
        citationsText += '## Core Competencies\n\n';
        
        for (const [competency, citation] of Object.entries(citationsData.core_competencies)) {
            citationsText += `### ${competency}\n${citation}\n\n`;
        }
    }
    
    // Create and download the file
    const blob = new Blob([citationsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interview_prep_notes.md';
    a.click();
    
    URL.revokeObjectURL(url);
    
    showSuccessMessage('Interview preparation notes saved to file!');
}

// Show an alert message
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
