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
function addCitationsToPanel(section, citations) {
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
    
    // Add each citation
    for (const [keyword, citation] of Object.entries(citations)) {
        const citationDiv = document.createElement('div');
        citationDiv.className = 'mb-3 p-2 bg-gray-50 rounded border border-gray-200';
        
        const keywordHeader = document.createElement('h4');
        keywordHeader.className = 'text-sm font-semibold mb-1 text-blue-700';
        keywordHeader.textContent = keyword;
        citationDiv.appendChild(keywordHeader);
        
        const citationText = document.createElement('p');
        citationText.className = 'text-xs text-gray-700';
        citationText.textContent = citation;
        citationDiv.appendChild(citationText);
        
        sectionDiv.appendChild(citationDiv);
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
}

// Save citations for interview prep
function saveCitationsForInterviewPrep() {
    // Prepare the citations content
    let citationsText = "INTERVIEW PREPARATION CITATIONS\n";
    citationsText += "================================\n\n";
    
    // Add each section
    for (const [section, citations] of Object.entries(citationsData)) {
        // Skip empty sections
        if (Object.keys(citations).length === 0) {
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
        
        // Add each citation
        for (const [keyword, citation] of Object.entries(citations)) {
            citationsText += `${keyword}:\n`;
            citationsText += `${citation}\n\n`;
        }
        
        citationsText += "\n";
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
