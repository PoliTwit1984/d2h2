/**
 * API Service Module
 * 
 * Handles all API calls to the backend.
 */

const ApiService = {
    /**
     * Extract keywords from job description only (no resume check)
     * 
     * @param {string} jobDescription - The job description text
     * @param {string} jobTitle - The job title (optional)
     * @param {string} companyName - The company name (optional)
     * @param {string} industry - The industry (optional)
     * @returns {Promise} - A promise that resolves to the API response
     */
    extractKeywords: function(jobDescription, masterResume = '', jobTitle = '', companyName = '', industry = '') {
        return new Promise((resolve, reject) => {
            // Create form data
            const formData = new FormData();
            formData.append('job_description', jobDescription);
            formData.append('job_title', jobTitle);
            formData.append('company_name', companyName);
            formData.append('industry', industry);
            
            // Note: We're not sending the master resume to the backend for initial keyword extraction
            
            // Make the API call
            fetch('/extract-keywords', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => resolve(data))
            .catch(error => {
                console.error('Error extracting keywords:', error);
                reject(error);
            });
        });
    },
    
    /**
     * Find keywords in the master resume
     * 
     * @param {string} masterResume - The master resume text
     * @param {Object|Array} keywords - The keywords to find in the resume
     * @param {string} jobTitle - The job title (optional)
     * @param {string} companyName - The company name (optional)
     * @param {string} industry - The industry (optional)
     * @returns {Promise} - A promise that resolves to the API response
     */
    findKeywordsInResume: function(masterResume, keywords, jobTitle = '', companyName = '', industry = '') {
        return new Promise((resolve, reject) => {
            // Create form data
            const formData = new FormData();
            formData.append('master_resume', masterResume);
            formData.append('keywords', JSON.stringify(keywords));
            formData.append('job_title', jobTitle);
            formData.append('company_name', companyName);
            formData.append('industry', industry);
            
            // Make the API call
            fetch('/find-keywords-in-resume', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => resolve(data))
            .catch(error => {
                console.error('Error finding keywords in resume:', error);
                reject(error);
            });
        });
    },
    
    /**
     * Find citations for keywords in the master resume
     * 
     * @param {string} masterResume - The master resume text
     * @param {Object|Array} keywords - The keywords to find citations for
     * @param {string} jobTitle - The job title (optional)
     * @param {string} companyName - The company name (optional)
     * @param {string} industry - The industry (optional)
     * @returns {Promise} - A promise that resolves to the API response
     */
    findCitations: function(masterResume, keywords, jobTitle = '', companyName = '', industry = '') {
        return new Promise((resolve, reject) => {
            // Create form data
            const formData = new FormData();
            formData.append('master_resume', masterResume);
            formData.append('keywords', JSON.stringify(keywords));
            formData.append('job_title', jobTitle);
            formData.append('company_name', companyName);
            formData.append('industry', industry);
            
            // Make the API call
            fetch('/find-citations', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => resolve(data))
            .catch(error => {
                console.error('Error finding citations:', error);
                reject(error);
            });
        });
    },
    
    /**
     * Generate career profile
     * 
     * @param {string} jobDescription - The job description text
     * @param {string} masterResume - The master resume text
     * @param {Array} keywords - The extracted keywords (optional)
     * @param {Object} citations - The citations data (optional)
     * @param {string} jobTitle - The job title (optional)
     * @param {string} companyName - The company name (optional)
     * @param {string} industry - The industry (optional)
     * @returns {Promise} - A promise that resolves to the API response
     */
    generateProfile: function(jobDescription, masterResume, keywords = [], citations = {}, jobTitle = '', companyName = '', industry = '') {
        return new Promise((resolve, reject) => {
            // Create form data
            const formData = new FormData();
            formData.append('job_description', jobDescription);
            formData.append('master_resume', masterResume);
            formData.append('keywords', JSON.stringify(keywords));
            formData.append('citations_json', JSON.stringify(citations));
            formData.append('job_title', jobTitle);
            formData.append('company_name', companyName);
            formData.append('industry', industry);
            
            // Make the API call
            fetch('/generate', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => resolve(data))
            .catch(error => {
                console.error('Error generating profile:', error);
                reject(error);
            });
        });
    },
    
    /**
     * Generate core competencies
     * 
     * @param {string} jobDescription - The job description text
     * @param {string} masterResume - The master resume text
     * @param {Array} keywords - The extracted keywords (optional)
     * @param {Object} citations - The citations data (optional)
     * @param {string} jobTitle - The job title (optional)
     * @param {string} companyName - The company name (optional)
     * @param {string} industry - The industry (optional)
     * @returns {Promise} - A promise that resolves to the API response
     */
    generateCompetencies: function(jobDescription, masterResume, keywords = [], citations = {}, jobTitle = '', companyName = '', industry = '') {
        return new Promise((resolve, reject) => {
            // Create form data
            const formData = new FormData();
            formData.append('job_description', jobDescription);
            formData.append('master_resume', masterResume);
            formData.append('keywords', JSON.stringify(keywords));
            formData.append('citations_json', JSON.stringify(citations));
            formData.append('job_title', jobTitle);
            formData.append('company_name', companyName);
            formData.append('industry', industry);
            
            // Make the API call
            fetch('/generate-competencies', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => resolve(data))
            .catch(error => {
                console.error('Error generating competencies:', error);
                reject(error);
            });
        });
    },
    
    /**
     * Save career profile to a file
     * 
     * @param {string} profileContent - The career profile content
     * @returns {Promise} - A promise that resolves to the API response
     */
    saveProfile: function(profileContent) {
        return new Promise((resolve, reject) => {
            // Create form data
            const formData = new FormData();
            formData.append('profile_content', profileContent);
            
            // Make the API call
            fetch('/save-profile', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.ok) {
                    resolve({ success: true });
                } else {
                    response.json().then(data => reject(data));
                }
            })
            .catch(error => {
                console.error('Error saving profile:', error);
                reject(error);
            });
        });
    },
    
    /**
     * Save core competencies to a file
     * 
     * @param {string} competenciesContent - The core competencies content
     * @returns {Promise} - A promise that resolves to the API response
     */
    saveCompetencies: function(competenciesContent) {
        return new Promise((resolve, reject) => {
            // Create form data
            const formData = new FormData();
            formData.append('competencies_content', competenciesContent);
            
            // Make the API call
            fetch('/save-competencies', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.ok) {
                    resolve({ success: true });
                } else {
                    response.json().then(data => reject(data));
                }
            })
            .catch(error => {
                console.error('Error saving competencies:', error);
                reject(error);
            });
        });
    },
    
    /**
     * Save citations to a file
     * 
     * @param {string} citationsContent - The citations content
     * @returns {Promise} - A promise that resolves to the API response
     */
    saveCitations: function(citationsContent) {
        return new Promise((resolve, reject) => {
            // Create form data
            const formData = new FormData();
            formData.append('citations_content', citationsContent);
            
            // Make the API call
            fetch('/save-citations', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.ok) {
                    resolve({ success: true });
                } else {
                    response.json().then(data => reject(data));
                }
            })
            .catch(error => {
                console.error('Error saving citations:', error);
                reject(error);
            });
        });
    }
};

// Export the module
window.ApiService = ApiService;
