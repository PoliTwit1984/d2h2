// form-handler.js - Prevent form submission and preserve form data

document.addEventListener('DOMContentLoaded', function() {
    // Get the form element
    const form = document.getElementById('generatorForm');
    
    // Add event listener to prevent form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            // Prevent the default form submission
            e.preventDefault();
            console.log('Form submission prevented');
        });
    }
    
    // Store form values in localStorage when extract button is clicked
    const extractKeywordsBtn = document.getElementById('extractKeywordsBtn');
    if (extractKeywordsBtn) {
        extractKeywordsBtn.addEventListener('click', function() {
            const jobDescriptionTextarea = document.getElementById('jobDescription');
            const masterResumeTextarea = document.getElementById('masterResume');
            
            if (jobDescriptionTextarea && masterResumeTextarea) {
                localStorage.setItem('jobDescription', jobDescriptionTextarea.value);
                localStorage.setItem('masterResume', masterResumeTextarea.value);
                console.log('Form values stored in localStorage');
            }
        });
    }
    
    // Restore form values from localStorage on page load
    const jobDescriptionTextarea = document.getElementById('jobDescription');
    const masterResumeTextarea = document.getElementById('masterResume');
    
    if (jobDescriptionTextarea && localStorage.getItem('jobDescription')) {
        jobDescriptionTextarea.value = localStorage.getItem('jobDescription');
    }
    
    if (masterResumeTextarea && localStorage.getItem('masterResume')) {
        masterResumeTextarea.value = localStorage.getItem('masterResume');
    }
});
