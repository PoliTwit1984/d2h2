// utils.js - Utility functions for dumped2hire

// Function to show alerts
function showAlert(message) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4';
    alertDiv.role = 'alert';
    
    // Add message
    const alertMessage = document.createElement('span');
    alertMessage.className = 'block sm:inline';
    alertMessage.textContent = message;
    alertDiv.appendChild(alertMessage);
    
    // Add close button
    const closeButton = document.createElement('span');
    closeButton.className = 'absolute top-0 bottom-0 right-0 px-4 py-3';
    closeButton.innerHTML = '<svg class="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>';
    alertDiv.appendChild(closeButton);
    
    // Add to DOM before the form
    const form = document.getElementById('generatorForm');
    form.parentNode.insertBefore(alertDiv, form);
    
    // Remove after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
    
    // Close button functionality
    closeButton.addEventListener('click', () => {
        alertDiv.remove();
    });
}

// Function to copy text to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text)
            .then(() => {
                // Success message could be shown here
                console.log('Text copied to clipboard');
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            console.log(successful ? 'Text copied to clipboard' : 'Copy failed');
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
        
        document.body.removeChild(textArea);
    }
}
