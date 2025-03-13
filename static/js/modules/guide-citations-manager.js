/**
 * guide-citations-manager.js - Handles citations functionality for the Guide Me panel
 */

const GuideCitationsManager = {
    /**
     * Initialize the citations manager
     */
    initialize: function() {
        // Set up the citations button
        this.setupCitationsButton();
    },
    
    /**
     * Set up the Generate Citations button
     */
    setupCitationsButton: function() {
        // Initialize the button replacement
        setTimeout(() => {
            this.replaceCitationsButton();
        }, 1000);
    },
    
    /**
     * Replace the Generate Citations button with a new one
     */
    replaceCitationsButton: function() {
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
            GuidePanel.handleGenerateCitations();
        });
        
        // Replace the old button with the new one
        oldBtn.parentNode.replaceChild(newBtn, oldBtn);
        console.log('Generate Citations button successfully replaced');
        
        // Also add an inline onclick attribute as a fallback
        newBtn.setAttribute('onclick', 'GuidePanel.handleGenerateCitations(); return false;');
    },
    
    /**
     * Add citations to the panel directly using DOM manipulation
     * This is a fallback method if the other methods fail
     * 
     * @param {string} section - The section the citations belong to (keywords, career_profile, core_competencies)
     * @param {Object} citations - The citations data
     */
    addCitationsToPanelDirectly: function(section, citations) {
        console.log('Adding citations to panel directly via DOM manipulation');
        
        // Get the citations content container
        const citationsContent = document.getElementById('citationsContent');
        if (!citationsContent) {
            console.error('Citations content container not found');
            return;
        }
        
        // Clear any existing content
        citationsContent.innerHTML = '';
        
        // Create a section for this set of citations
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'mb-6';
        sectionDiv.id = `citations-${section}`;
        
        // Create a section header
        const sectionHeader = document.createElement('h3');
        sectionHeader.className = 'text-md font-semibold mb-2 pb-1 border-b border-gray-200';
        sectionHeader.textContent = 'Keywords Citations';
        sectionDiv.appendChild(sectionHeader);
        
        // Process each priority bucket
        const priorities = [
            { key: 'high_priority', label: 'High Priority', color: 'text-red-700' },
            { key: 'medium_priority', label: 'Medium Priority', color: 'text-orange-700' },
            { key: 'low_priority', label: 'Low Priority', color: 'text-yellow-700' },
            { key: 'fallback_extraction', label: 'Additional Citations', color: 'text-blue-700' }
        ];
        
        let totalCitations = 0;
        
        // Add each priority section
        for (const priority of priorities) {
            const priorityCitations = citations[priority.key];
            
            // Skip empty priority buckets
            if (!priorityCitations || Object.keys(priorityCitations).length === 0) {
                continue;
            }
            
            // Create a priority subsection
            const priorityDiv = document.createElement('div');
            priorityDiv.className = 'mb-4';
            
            // Add priority header
            const priorityHeader = document.createElement('h4');
            priorityHeader.className = `text-sm font-medium mb-2 ${priority.color}`;
            priorityHeader.textContent = priority.label;
            priorityDiv.appendChild(priorityHeader);
            
            // Add each citation in this priority
            for (const [keyword, citation] of Object.entries(priorityCitations)) {
                // Skip error messages
                if (keyword === 'error') continue;
                
                // Extract citation text based on format
                let citationText = '';
                if (typeof citation === 'string') {
                    citationText = citation;
                } else if (typeof citation === 'object' && citation.citation) {
                    citationText = citation.citation;
                } else {
                    console.warn(`Citation for "${keyword}" is not in a recognized format:`, citation);
                    continue;
                }
                
                const citationDiv = document.createElement('div');
                citationDiv.className = 'mb-3 p-2 bg-gray-50 rounded border border-gray-200';
                
                // Create the keyword header
                const keywordHeader = document.createElement('h4');
                keywordHeader.className = `text-sm font-semibold mb-1 ${priority.color}`;
                keywordHeader.textContent = keyword;
                citationDiv.appendChild(keywordHeader);
                
                const citationParagraph = document.createElement('p');
                citationParagraph.className = 'text-xs text-gray-700';
                citationParagraph.textContent = citationText;
                citationDiv.appendChild(citationParagraph);
                
                priorityDiv.appendChild(citationDiv);
                totalCitations++;
            }
            
            if (priorityDiv.childNodes.length > 1) { // Only add if there are actual citations
                sectionDiv.appendChild(priorityDiv);
            }
        }
        
        // If no citations were added, show a message
        if (totalCitations === 0) {
            const noCitationsMsg = document.createElement('p');
            noCitationsMsg.className = 'text-sm text-gray-500 italic';
            noCitationsMsg.textContent = 'No citations found. Try adjusting your resume to include more relevant experience.';
            sectionDiv.appendChild(noCitationsMsg);
        }
        
        // Add the section to the citations content
        citationsContent.appendChild(sectionDiv);
        console.log(`Added ${totalCitations} citations to panel directly`);
    },
    
    /**
     * Handle Generate Citations button click
     */
    handleGenerateCitations: function() {
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
                
                // First, ensure the citations panel is visible and initialized
                const citationsPanel = document.getElementById('citationsPanel');
                if (citationsPanel) {
                    console.log('Making citations panel visible');
                    citationsPanel.classList.remove('hidden');
                    
                    // Clear any existing content in the citations panel
                    const citationsContent = document.getElementById('citationsContent');
                    if (citationsContent) {
                        console.log('Clearing citations content');
                        citationsContent.innerHTML = '<p class="text-gray-400 italic text-sm">Generating citations, please wait...</p>';
                    }
                } else {
                    console.error('Citations panel not found');
                }
                
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
                        // Verify the citations data structure
                        if (data.citations) {
                            console.log('Citations data structure:', Object.keys(data.citations));
                            
                            // Check if we have the expected priority buckets
                            const hasPriorityBuckets = data.citations.high_priority || 
                                                      data.citations.medium_priority || 
                                                      data.citations.low_priority || 
                                                      data.citations.fallback_extraction;
                            
                            if (!hasPriorityBuckets) {
                                console.warn('Citations data does not have expected priority buckets');
                                // Convert to expected format if needed
                                const formattedCitations = {
                                    high_priority: {},
                                    medium_priority: {},
                                    low_priority: {},
                                    fallback_extraction: {}
                                };
                                
                                // Place all citations in fallback bucket if format is unexpected
                                if (typeof data.citations === 'object') {
                                    formattedCitations.fallback_extraction = data.citations;
                                }
                                
                                data.citations = formattedCitations;
                            }
                        }
                        
                        // Log all citations found for debugging
                        console.log('===== CITATIONS FOUND =====');
                        if (data.citations) {
                            // Log the structure of the citations data
                            console.log('Citations data structure:', Object.keys(data.citations));
                            
                            // Log each priority level
                            if (data.citations.high_priority) {
                                console.log('HIGH PRIORITY CITATIONS:', Object.keys(data.citations.high_priority).length, 'keywords');
                                Object.entries(data.citations.high_priority).forEach(([keyword, citation]) => {
                                    console.log(`- ${keyword}: ${typeof citation === 'string' ? citation.substring(0, 100) + '...' : 'Complex citation object'}`);
                                });
                            }
                            
                            if (data.citations.medium_priority) {
                                console.log('MEDIUM PRIORITY CITATIONS:', Object.keys(data.citations.medium_priority).length, 'keywords');
                                Object.entries(data.citations.medium_priority).forEach(([keyword, citation]) => {
                                    console.log(`- ${keyword}: ${typeof citation === 'string' ? citation.substring(0, 100) + '...' : 'Complex citation object'}`);
                                });
                            }
                            
                            if (data.citations.low_priority) {
                                console.log('LOW PRIORITY CITATIONS:', Object.keys(data.citations.low_priority).length, 'keywords');
                                Object.entries(data.citations.low_priority).forEach(([keyword, citation]) => {
                                    console.log(`- ${keyword}: ${typeof citation === 'string' ? citation.substring(0, 100) + '...' : 'Complex citation object'}`);
                                });
                            }
                            
                            if (data.citations.fallback_extraction) {
                                console.log('FALLBACK CITATIONS:', Object.keys(data.citations.fallback_extraction).length, 'keywords');
                                Object.entries(data.citations.fallback_extraction).forEach(([keyword, citation]) => {
                                    console.log(`- ${keyword}: ${typeof citation === 'string' ? citation.substring(0, 100) + '...' : 'Complex citation object'}`);
                                });
                            }
                        }
                        console.log('===== END CITATIONS =====');
                        
                        // Add citations to the citations panel
                        if (data.citations) {
                            console.log('Adding citations to panel');
                            
                            // Ensure the CitationsManager is initialized
                            if (window.CitationsManager && typeof window.CitationsManager.initialize === 'function') {
                                console.log('Initializing CitationsManager');
                                window.CitationsManager.initialize();
                            }
                            
                            // Store citations data globally first
                            if (!window.citationsData) {
                                window.citationsData = {};
                            }
                            window.citationsData.keywords = data.citations;
                            
                            // Log the structure of the citations data for debugging
                            console.log('Citations data structure before adding to panel:', JSON.stringify({
                                high_priority_count: data.citations.high_priority ? Object.keys(data.citations.high_priority).length : 0,
                                medium_priority_count: data.citations.medium_priority ? Object.keys(data.citations.medium_priority).length : 0,
                                low_priority_count: data.citations.low_priority ? Object.keys(data.citations.low_priority).length : 0,
                                fallback_count: data.citations.fallback_extraction ? Object.keys(data.citations.fallback_extraction).length : 0
                            }));
                            
                            // Save the raw citations data to a file before any processing
                            this.saveCitationsDataToFile(data.citations);
                            
                            // Ensure the citations data has the correct structure
                            const structuredCitations = {
                                high_priority: data.citations.high_priority || {},
                                medium_priority: data.citations.medium_priority || {},
                                low_priority: data.citations.low_priority || {},
                                fallback_extraction: data.citations.fallback_extraction || {}
                            };
                            
                            // Log the keywords in each priority level
                            console.log('High priority keywords:', Object.keys(structuredCitations.high_priority));
                            console.log('Medium priority keywords:', Object.keys(structuredCitations.medium_priority));
                            console.log('Low priority keywords:', Object.keys(structuredCitations.low_priority));
                            console.log('Fallback keywords:', Object.keys(structuredCitations.fallback_extraction));
                            
                            // Try multiple methods to add citations to the panel
                            let citationsAdded = false;
                            
                            // Method 1: Try the direct method from citations-panel.js
                            if (typeof window.addCitationsToPanel === 'function') {
                                try {
                                    console.log('Trying direct addCitationsToPanel method with structured citations');
                                    window.addCitationsToPanel('keywords', structuredCitations);
                                    citationsAdded = true;
                                    console.log('Successfully added citations using direct method');
                                } catch (panelError) {
                                    console.error('Error using direct addCitationsToPanel:', panelError);
                                }
                            }
                            
                            // Method 2: Try CitationsManager method if Method 1 failed
                            if (!citationsAdded && window.CitationsManager && typeof window.CitationsManager.addCitationsToPanel === 'function') {
                                try {
                                    console.log('Trying CitationsManager.addCitationsToPanel method with structured citations');
                                    window.CitationsManager.addCitationsToPanel('keywords', structuredCitations);
                                    citationsAdded = true;
                                    console.log('Successfully added citations using CitationsManager');
                                } catch (managerError) {
                                    console.error('Error using CitationsManager.addCitationsToPanel:', managerError);
                                }
                            }
                            
                            // Method 3: Direct DOM manipulation as a last resort
                            if (!citationsAdded) {
                                console.log('Trying direct DOM manipulation to add citations with structured citations');
                                this.addCitationsToPanelDirectly('keywords', structuredCitations);
                                citationsAdded = true;
                            }
                            
                            // Show debug popup with citations organized by priority
                            this.showCitationsDebugPopup(structuredCitations);
                            
                            // Create a foundKeywords object based on the citations
                            const foundKeywords = {};
                            
                            // Process each priority level in the citations
                            const processCitations = (priorityData) => {
                                for (const keyword in priorityData) {
                                    // If there's a citation for this keyword, mark it as found
                                    if (keyword !== 'error') {
                                        foundKeywords[keyword] = true;
                                    }
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
                            GuideUtils.showSuccessMessage('Citations generated successfully! Check the Citations Panel.');
                            
                            // Double check that the citations panel is visible
                            if (citationsPanel) {
                                citationsPanel.classList.remove('hidden');
                            }
                            
                            // Activate step 4 (Generate Content)
                            GuideStepManager.activateStep(4);
                        } else {
                            console.error('No citations found or addCitationsToPanel function not available');
                            GuideUtils.showAlert('No citations found in your resume.');
                            
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
                        GuideUtils.showAlert(data.message || 'Error finding citations');
                        
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
                    GuideUtils.showAlert('An error occurred while finding citations. Please try again.');
                    
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
                GuideUtils.showAlert('Error generating citations. Please try again.');
            }
        } else {
            console.error('KeywordManager.findCitations function not found');
            // Fallback if the function doesn't exist
            GuideUtils.showAlert('Citation generation function not found. Please refresh the page and try again.');
        }
    },
    
    /**
     * Save the raw citations data to a file
     * 
     * @param {Object} citations - The raw citations data from the API
     */
    saveCitationsDataToFile: function(citations) {
        console.log('Saving raw citations data to file');
        
        // Create a timestamp for the filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `citations_data_${timestamp}.txt`;
        
        // Format the data for the file
        let fileContent = '=== CITATIONS DATA DUMP ===\n';
        fileContent += `Timestamp: ${new Date().toString()}\n\n`;
        
        // Add summary counts
        fileContent += '=== SUMMARY COUNTS ===\n';
        fileContent += `High Priority: ${citations.high_priority ? Object.keys(citations.high_priority).length : 0} keywords\n`;
        fileContent += `Medium Priority: ${citations.medium_priority ? Object.keys(citations.medium_priority).length : 0} keywords\n`;
        fileContent += `Low Priority: ${citations.low_priority ? Object.keys(citations.low_priority).length : 0} keywords\n`;
        fileContent += `Fallback: ${citations.fallback_extraction ? Object.keys(citations.fallback_extraction).length : 0} keywords\n\n`;
        
        // Add raw JSON data
        fileContent += '=== RAW JSON DATA ===\n';
        fileContent += JSON.stringify(citations, null, 2);
        fileContent += '\n\n';
        
        // Add detailed breakdown by priority
        fileContent += '=== DETAILED BREAKDOWN ===\n\n';
        
        // Process each priority level
        const priorities = [
            { key: 'high_priority', label: 'HIGH PRIORITY' },
            { key: 'medium_priority', label: 'MEDIUM PRIORITY' },
            { key: 'low_priority', label: 'LOW PRIORITY' },
            { key: 'fallback_extraction', label: 'FALLBACK CITATIONS' }
        ];
        
        // Add each priority section
        for (const priority of priorities) {
            const priorityCitations = citations[priority.key];
            
            // Skip empty priority buckets
            if (!priorityCitations || Object.keys(priorityCitations).length === 0) {
                fileContent += `${priority.label}: No citations found\n\n`;
                continue;
            }
            
            fileContent += `${priority.label} (${Object.keys(priorityCitations).length} keywords):\n`;
            fileContent += ''.padEnd(priority.label.length + 15, '-') + '\n\n';
            
            // Sort keywords alphabetically
            const sortedKeywords = Object.keys(priorityCitations).sort();
            
            // Add each keyword and its citation
            for (const keyword of sortedKeywords) {
                if (keyword === 'error') continue;
                
                const citation = priorityCitations[keyword];
                
                fileContent += `KEYWORD: ${keyword}\n`;
                
                // Handle different citation formats
                if (typeof citation === 'string') {
                    fileContent += `CITATION: ${citation}\n`;
                } else if (typeof citation === 'object') {
                    if (citation.citation) {
                        fileContent += `CITATION: ${citation.citation}\n`;
                    }
                    if (citation.exact_phrase) {
                        fileContent += `EXACT PHRASE: ${citation.exact_phrase}\n`;
                    }
                } else {
                    fileContent += `CITATION: [Unknown format: ${typeof citation}]\n`;
                }
                
                fileContent += '\n';
            }
            
            fileContent += '\n';
        }
        
        // Create a blob and download the file
        const blob = new Blob([fileContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
        
        console.log(`Citations data saved to file: ${filename}`);
    },
    
    showCitationsDebugPopup: function(citations) {
        console.log('Showing citations debug popup');
        
        // Remove any existing popup
        const existingPopup = document.getElementById('citationsDebugPopup');
        if (existingPopup) {
            existingPopup.remove();
        }
        
        // Create popup element
        const popup = document.createElement('div');
        popup.id = 'citationsDebugPopup';
        popup.className = 'fixed top-10 right-10 bg-white rounded-md shadow-lg p-4 border border-gray-300 z-50';
        popup.style.maxWidth = '500px';
        popup.style.maxHeight = '80vh';
        popup.style.overflow = 'auto';
        
        // Create popup header
        const header = document.createElement('div');
        header.className = 'flex justify-between items-center mb-3 pb-2 border-b border-gray-200';
        
        const title = document.createElement('h3');
        title.className = 'text-lg font-semibold text-gray-800';
        title.textContent = 'Citations Debug Information';
        header.appendChild(title);
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'text-gray-500 hover:text-gray-700';
        closeBtn.innerHTML = '&times;';
        closeBtn.style.fontSize = '1.5rem';
        closeBtn.style.lineHeight = '1';
        closeBtn.addEventListener('click', function() {
            popup.remove();
        });
        header.appendChild(closeBtn);
        
        popup.appendChild(header);
        
        // Create content container
        const content = document.createElement('div');
        
        // Process each priority level
        const priorities = [
            { key: 'high_priority', label: 'High Priority', color: 'text-red-700', bgColor: 'bg-red-100' },
            { key: 'medium_priority', label: 'Medium Priority', color: 'text-orange-700', bgColor: 'bg-orange-100' },
            { key: 'low_priority', label: 'Low Priority', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
            { key: 'fallback_extraction', label: 'Additional Citations', color: 'text-blue-700', bgColor: 'bg-blue-100' }
        ];
        
        // Add each priority section
        for (const priority of priorities) {
            const priorityCitations = citations[priority.key];
            
            // Skip empty priority buckets
            if (!priorityCitations || Object.keys(priorityCitations).length === 0) {
                continue;
            }
            
            // Create a priority section
            const section = document.createElement('div');
            section.className = 'mb-4';
            
            // Add section header
            const sectionHeader = document.createElement('h4');
            sectionHeader.className = `text-md font-semibold mb-2 ${priority.color}`;
            sectionHeader.textContent = `${priority.label} (${Object.keys(priorityCitations).length} keywords)`;
            section.appendChild(sectionHeader);
            
            // Sort keywords alphabetically
            const sortedKeywords = Object.keys(priorityCitations).sort();
            
            // Create a list of keywords
            const keywordsList = document.createElement('div');
            keywordsList.className = 'flex flex-wrap gap-1';
            
            // Add each keyword
            for (const keyword of sortedKeywords) {
                if (keyword === 'error') continue;
                
                const keywordBadge = document.createElement('span');
                keywordBadge.className = `inline-block px-2 py-1 rounded-full text-xs ${priority.bgColor} ${priority.color} mb-1`;
                keywordBadge.textContent = keyword;
                keywordsList.appendChild(keywordBadge);
            }
            
            section.appendChild(keywordsList);
            content.appendChild(section);
        }
        
        // If no citations were found, show a message
        if (content.childNodes.length === 0) {
            const noDataMsg = document.createElement('p');
            noDataMsg.className = 'text-gray-500 italic';
            noDataMsg.textContent = 'No citations data found.';
            content.appendChild(noDataMsg);
        }
        
        popup.appendChild(content);
        
        // Add the popup to the document
        document.body.appendChild(popup);
        
        // Add event listener to close popup when clicking outside
        document.addEventListener('mousedown', function closePopupOnClickOutside(e) {
            if (popup && !popup.contains(e.target)) {
                popup.remove();
                document.removeEventListener('mousedown', closePopupOnClickOutside);
            }
        });
        
        // Add event listener to close popup when pressing Escape
        document.addEventListener('keydown', function closePopupOnEscape(e) {
            if (e.key === 'Escape') {
                popup.remove();
                document.removeEventListener('keydown', closePopupOnEscape);
            }
        });
        
        console.log('Citations debug popup created and displayed');
    }
};

// Export the module
window.GuideCitationsManager = GuideCitationsManager;
