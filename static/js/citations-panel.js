// citations-panel.js - Citations panel functionality for dumped2hire

// Initialize the citations data object
if (typeof window.citationsData === 'undefined') {
    window.citationsData = {};
}

// Clear the citations panel
function clearCitationsPanel() {
    const citationsContent = document.getElementById('citationsContent');
    if (citationsContent) {
        citationsContent.innerHTML = '<p class="text-gray-400 italic text-sm">Citations will appear here when you click "Find Citations in Resume".</p>';
    }
}

// Initialize the citations panel when the page loads
document.addEventListener('DOMContentLoaded', function() {
    clearCitationsPanel();
});

// Add citations to the citations panel
// This function is now defined in citations-manager.js, but we keep this implementation
// for backward compatibility
window.addCitationsToPanel = function(section, citations) {
    console.log(`Adding citations to panel for section: ${section}`);
    console.log('Citations data structure:', JSON.stringify({
        high_priority_count: citations.high_priority ? Object.keys(citations.high_priority).length : 0,
        medium_priority_count: citations.medium_priority ? Object.keys(citations.medium_priority).length : 0,
        low_priority_count: citations.low_priority ? Object.keys(citations.low_priority).length : 0,
        fallback_count: citations.fallback_extraction ? Object.keys(citations.fallback_extraction).length : 0
    }));
    
    // Store citations in global variable
    citationsData[section] = citations;
    
    // Get the citations content container
    const citationsContent = document.getElementById('citationsContent');
    
    // Create a section for this set of citations
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'mb-6';
    sectionDiv.id = `citations-${section}`;
    
    // Create a section header
    const sectionHeader = document.createElement('h3');
    sectionHeader.className = 'text-md font-semibold mb-2 pb-1 border-b border-gray-200';
    
    // Set the section title based on the section
    let sectionTitle = '';
    switch(section) {
        case 'keywords':
            sectionTitle = 'Keywords Citations';
            break;
        case 'career_profile':
            sectionTitle = 'Career Profile Citations';
            break;
        case 'core_competencies':
            sectionTitle = 'Core Competencies Citations';
            break;
        default:
            sectionTitle = 'Citations';
    }
    
    sectionHeader.textContent = sectionTitle;
    sectionDiv.appendChild(sectionHeader);
    
    // Check if citations is in the new structured format with priority buckets
    const isStructuredFormat = citations && 
        (citations.high_priority || citations.medium_priority || 
         citations.low_priority || citations.fallback_extraction);
    
    if (isStructuredFormat) {
        console.log('Processing structured citations format');
        
        // Define priority order and colors
        const priorities = [
            { key: 'high_priority', label: 'High Priority', color: 'text-red-700' },
            { key: 'medium_priority', label: 'Medium Priority', color: 'text-orange-700' },
            { key: 'low_priority', label: 'Low Priority', color: 'text-yellow-700' },
            { key: 'fallback_extraction', label: 'Additional Citations', color: 'text-blue-700' }
        ];
        
        // Keep track of citation number
        let citationNumber = 1;
        let totalCitations = 0;
        
        // Create all priority sections first
        const prioritySections = {};
        
        // Process each priority bucket in order
        for (const priority of priorities) {
            const priorityCitations = citations[priority.key];
            
            // Skip empty priority buckets
            if (!priorityCitations || Object.keys(priorityCitations).length === 0) {
                console.log(`No citations found for ${priority.label}`);
                continue;
            }
            
            console.log(`Processing ${Object.keys(priorityCitations).length} citations for ${priority.label}`);
            
            // Create a priority subsection
            const priorityDiv = document.createElement('div');
            priorityDiv.className = 'mb-4';
            priorityDiv.dataset.priority = priority.key;
            
            // Add priority header
            const priorityHeader = document.createElement('h4');
            priorityHeader.className = `text-sm font-medium mb-2 ${priority.color}`;
            priorityHeader.textContent = priority.label;
            priorityDiv.appendChild(priorityHeader);
            
            // Sort keywords alphabetically within each priority
            const sortedKeywords = Object.keys(priorityCitations).sort();
            
            // Add each citation in this priority
            for (const keyword of sortedKeywords) {
                const citation = priorityCitations[keyword];
                
                // Skip error messages
                if (keyword === 'error') continue;
                
                const citationDiv = document.createElement('div');
                citationDiv.className = 'mb-3 p-2 bg-gray-50 rounded border border-gray-200';
                citationDiv.dataset.citationNumber = citationNumber;
                citationDiv.dataset.priority = priority.key;
                
                const keywordHeader = document.createElement('h4');
                keywordHeader.className = `text-sm font-semibold mb-1 ${priority.color}`;
                keywordHeader.innerHTML = `<span class="citation-number">${citationNumber}</span>. ${keyword}`;
                citationDiv.appendChild(keywordHeader);
                
                // Handle both string and object citation formats
                let citationText;
                if (typeof citation === 'string') {
                    citationText = citation;
                } else if (typeof citation === 'object' && citation.citation) {
                    citationText = citation.citation;
                } else {
                    citationText = 'No citation available';
                }
                
                const citationParagraph = document.createElement('p');
                citationParagraph.className = 'text-xs text-gray-700';
                citationParagraph.textContent = citationText;
                citationDiv.appendChild(citationParagraph);
                
                // If there's an exact phrase, display it
                if (typeof citation === 'object' && citation.exact_phrase) {
                    const exactPhraseDiv = document.createElement('div');
                    exactPhraseDiv.className = 'mt-1 text-xs';
                    exactPhraseDiv.innerHTML = `<span class="font-semibold">Exact phrase:</span> <span class="${priority.color.replace('text-', 'bg-').replace('700', '100')} px-1 py-0.5 rounded">${citation.exact_phrase}</span>`;
                    citationDiv.appendChild(exactPhraseDiv);
                }
                
                priorityDiv.appendChild(citationDiv);
                
                // Increment citation number for the next citation
                citationNumber++;
                totalCitations++;
            }
            
            // Store the priority section for later
            prioritySections[priority.key] = priorityDiv;
        }
        
        // Add priority sections to the main section div in the correct order
        for (const priority of priorities) {
            if (prioritySections[priority.key]) {
                sectionDiv.appendChild(prioritySections[priority.key]);
            }
        }
        
        console.log(`Added ${totalCitations} citations to panel`);
    } else {
        // Handle the old flat format for backward compatibility
        let citationNumber = 1;
        
        for (const [keyword, citation] of Object.entries(citations)) {
            // Skip if citation is not a string (e.g., it's an object or array)
            if (typeof citation !== 'string' && (typeof citation !== 'object' || !citation.citation)) continue;
            
            const citationDiv = document.createElement('div');
            citationDiv.className = 'mb-3 p-2 bg-gray-50 rounded border border-gray-200';
            citationDiv.dataset.citationNumber = citationNumber;
            
            const keywordHeader = document.createElement('h4');
            keywordHeader.className = 'text-sm font-semibold mb-1 text-blue-700';
            keywordHeader.innerHTML = `<span class="citation-number">${citationNumber}</span>. ${keyword}`;
            citationDiv.appendChild(keywordHeader);
            
            // Handle both string and object citation formats
            let citationText;
            if (typeof citation === 'string') {
                citationText = citation;
            } else if (typeof citation === 'object' && citation.citation) {
                citationText = citation.citation;
            } else {
                citationText = 'No citation available';
            }
            
            const citationParagraph = document.createElement('p');
            citationParagraph.className = 'text-xs text-gray-700';
            citationParagraph.textContent = citationText;
            citationDiv.appendChild(citationParagraph);
            
            // If there's an exact phrase, display it
            if (typeof citation === 'object' && citation.exact_phrase) {
                const exactPhraseDiv = document.createElement('div');
                exactPhraseDiv.className = 'mt-1 text-xs';
                exactPhraseDiv.innerHTML = `<span class="font-semibold">Exact phrase:</span> <span class="bg-blue-100 px-1 py-0.5 rounded">${citation.exact_phrase}</span>`;
                citationDiv.appendChild(exactPhraseDiv);
            }
            
            sectionDiv.appendChild(citationDiv);
            
            // Increment citation number for the next citation
            citationNumber++;
        }
    }
    
    // If no citations were added, show a message
    if (sectionDiv.childElementCount <= 1) { // Only the header
        const noCitationsMsg = document.createElement('p');
        noCitationsMsg.className = 'text-sm text-gray-500 italic';
        noCitationsMsg.textContent = 'No citations found. Try adjusting your resume to include more relevant experience.';
        sectionDiv.appendChild(noCitationsMsg);
    }
    
    // Check if this section already exists
    const existingSection = document.getElementById(`citations-${section}`);
    if (existingSection) {
        // Replace the existing section
        existingSection.replaceWith(sectionDiv);
    } else {
        // Add the new section at the top
        if (citationsContent.firstChild && citationsContent.firstChild.className === 'text-gray-400 italic text-sm') {
            // Remove the placeholder text
            citationsContent.innerHTML = '';
        }
        
        // Add the new section at the top
        if (citationsContent.firstChild) {
            citationsContent.insertBefore(sectionDiv, citationsContent.firstChild);
        } else {
            citationsContent.appendChild(sectionDiv);
        }
    }
    
    // Add CSS for citation numbers
    const style = document.createElement('style');
    style.textContent = `
        .citation-number {
            display: inline-block;
            min-width: 1.5em;
            height: 1.5em;
            line-height: 1.5em;
            text-align: center;
            background-color: #f0f0f0;
            border-radius: 50%;
            font-size: 0.8em;
            margin-right: 0.5em;
        }
    `;
    document.head.appendChild(style);
}

// Save citations for interview prep
function saveCitationsForInterviewPrep() {
    // Prepare the citations content
    let citationsText = "INTERVIEW PREPARATION CITATIONS\n";
    citationsText += "================================\n\n";
    
    // Add each section
    for (const [section, citations] of Object.entries(citationsData)) {
        // Skip empty sections
        if (!citations || Object.keys(citations).length === 0) {
            continue;
        }
        
        // Add section header
        let sectionTitle = '';
        switch(section) {
            case 'keywords':
                sectionTitle = 'KEYWORDS CITATIONS';
                break;
            case 'career_profile':
                sectionTitle = 'CAREER PROFILE CITATIONS';
                break;
            case 'core_competencies':
                sectionTitle = 'CORE COMPETENCIES CITATIONS';
                break;
            default:
                sectionTitle = 'CITATIONS';
        }
        
        citationsText += sectionTitle + "\n";
        citationsText += "".padEnd(sectionTitle.length, '-') + "\n\n";
        
        // Check if citations is in the new structured format with priority buckets
        const isStructuredFormat = citations && 
            (citations.high_priority || citations.medium_priority || 
             citations.low_priority || citations.fallback_extraction);
        
        if (isStructuredFormat) {
            // Process each priority bucket
            const priorities = [
                { key: 'high_priority', label: 'HIGH PRIORITY' },
                { key: 'medium_priority', label: 'MEDIUM PRIORITY' },
                { key: 'low_priority', label: 'LOW PRIORITY' },
                { key: 'fallback_extraction', label: 'ADDITIONAL CITATIONS' }
            ];
            
            // Add each priority section
            for (const priority of priorities) {
                const priorityCitations = citations[priority.key];
                
                // Skip empty priority buckets
                if (!priorityCitations || Object.keys(priorityCitations).length === 0) {
                    continue;
                }
                
                // Add priority header
                citationsText += priority.label + "\n";
                citationsText += "".padEnd(priority.label.length, '-') + "\n\n";
                
                // Add each citation in this priority
                for (const [keyword, citation] of Object.entries(priorityCitations)) {
                    // Skip error messages
                    if (keyword === 'error') continue;
                    
                    citationsText += `${keyword}:\n`;
                    citationsText += `${citation}\n\n`;
                }
                
                citationsText += "\n";
            }
        } else {
            // Handle the old flat format for backward compatibility
            for (const [keyword, citation] of Object.entries(citations)) {
                // Skip if citation is not a string
                if (typeof citation !== 'string') continue;
                
                citationsText += `${keyword}:\n`;
                citationsText += `${citation}\n\n`;
            }
            
            citationsText += "\n";
        }
    }
    
    // Create a form to submit the citations
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/save-citations';
    
    // Add the citations content as a hidden field
    const citationsInput = document.createElement('input');
    citationsInput.type = 'hidden';
    citationsInput.name = 'citations_content';
    citationsInput.value = citationsText;
    form.appendChild(citationsInput);
    
    // Add the form to the document and submit it
    document.body.appendChild(form);
    form.submit();
    
    // Remove the form from the document
    document.body.removeChild(form);
}
