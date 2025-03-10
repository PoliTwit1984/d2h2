// ui-utils.js - Common UI utility functions

/**
 * Shows an alert message to the user
 * @param {string} message - The message to display
 */
function showAlert(message) {
    const alertElement = document.getElementById('alertMessage');
    const alertText = document.getElementById('alertMessageText');
    
    if (alertElement && alertText) {
        alertText.textContent = message;
        alertElement.classList.remove('hidden');
        
        // Hide the alert after 5 seconds
        setTimeout(() => {
            alertElement.classList.add('hidden');
        }, 5000);
    } else {
        // Fallback to console if alert elements don't exist
        console.error('Alert:', message);
    }
}

/**
 * Shows a success message to the user
 * @param {string} message - The success message to display
 */
function showSuccessMessage(message) {
    const resultMessage = document.getElementById('resultMessage');
    const resultMessageText = document.getElementById('resultMessageText');
    
    if (resultMessage && resultMessageText) {
        resultMessageText.textContent = message;
        resultMessage.classList.remove('hidden');
        
        // Hide the message after 5 seconds
        setTimeout(() => {
            resultMessage.classList.add('hidden');
        }, 5000);
    } else {
        // Fallback to console if message elements don't exist
        console.log('Success:', message);
    }
}

/**
 * Save career profile to a file
 */
function saveCareerProfile() {
    const careerProfileTextarea = document.getElementById('careerProfile');
    
    if (!careerProfileTextarea || !careerProfileTextarea.value.trim()) {
        showAlert('No content to save.');
        return;
    }
    
    const formData = new FormData();
    formData.append('profile_content', careerProfileTextarea.value);
    
    fetch('/save-profile', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            return response.blob();
        }
        throw new Error('Network response was not ok.');
    })
    .then(blob => {
        // Create a download link and trigger it
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'career_profile.txt';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        showSuccessMessage('Career profile saved successfully!');
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('Error saving career profile.');
    });
}

/**
 * Save core competencies to a file
 */
function saveCompetencies() {
    const coreCompetenciesTextarea = document.getElementById('coreCompetencies');
    
    if (!coreCompetenciesTextarea || !coreCompetenciesTextarea.value.trim()) {
        showAlert('No content to save.');
        return;
    }
    
    const formData = new FormData();
    formData.append('competencies_content', coreCompetenciesTextarea.value);
    
    fetch('/save-competencies', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            return response.blob();
        }
        throw new Error('Network response was not ok.');
    })
    .then(blob => {
        // Create a download link and trigger it
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'core_competencies.txt';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        showSuccessMessage('Core competencies saved successfully!');
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('Error saving core competencies.');
    });
}

/**
 * Save citations for interview prep
 */
function saveCitationsForInterviewPrep() {
    // Prepare citations content
    let citationsContent = 'INTERVIEW PREP CITATIONS\n\n';
    
    // Add keywords citations
    if (citationsData.keywords && Object.keys(citationsData.keywords).length > 0) {
        citationsContent += '=== KEYWORDS ===\n\n';
        for (const [keyword, citation] of Object.entries(citationsData.keywords)) {
            citationsContent += `${keyword}:\n${citation}\n\n`;
        }
    }
    
    // Add career profile citations
    if (citationsData.career_profile && Object.keys(citationsData.career_profile).length > 0) {
        citationsContent += '=== CAREER PROFILE ===\n\n';
        for (const [phrase, citation] of Object.entries(citationsData.career_profile)) {
            citationsContent += `${phrase}:\n${citation}\n\n`;
        }
    }
    
    // Add core competencies citations
    if (citationsData.core_competencies && Object.keys(citationsData.core_competencies).length > 0) {
        citationsContent += '=== CORE COMPETENCIES ===\n\n';
        for (const [competency, citation] of Object.entries(citationsData.core_competencies)) {
            citationsContent += `${competency}:\n${citation}\n\n`;
        }
    }
    
    // Send request to save citations
    const formData = new FormData();
    formData.append('citations_content', citationsContent);
    
    fetch('/save-citations', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            return response.blob();
        }
        throw new Error('Network response was not ok.');
    })
    .then(blob => {
        // Create a download link and trigger it
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'interview_prep_citations.txt';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        showSuccessMessage('Citations saved successfully!');
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('Error saving citations.');
    });
}
