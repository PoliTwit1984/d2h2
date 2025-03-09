// main.js - Client-side functionality for dumped2hire

// Additional client-side functionality can be added here
// Currently, the core functionality is handled in the index.html file

// Utility functions for future enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Add any additional initialization here
    
    // Example: Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl+Enter to submit the form
        if (e.ctrlKey && e.key === 'Enter') {
            const form = document.getElementById('generatorForm');
            if (form) {
                const submitEvent = new Event('submit', {
                    'bubbles': true,
                    'cancelable': true
                });
                form.dispatchEvent(submitEvent);
            }
        }
    });
});

// Function to copy text to clipboard (for future use)
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
