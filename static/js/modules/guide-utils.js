/**
 * guide-utils.js - Utility functions for the Guide Me panel
 */

const GuideUtils = {
    /**
     * Show an alert message
     * @param {string} message - The message to display
     */
    showAlert: function(message) {
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
    },
    
    /**
     * Show a success message
     * @param {string} message - The message to display
     */
    showSuccessMessage: function(message) {
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
};

// Export the module
window.GuideUtils = GuideUtils;
