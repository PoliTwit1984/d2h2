// keywords-panel.js - Functionality for the persistent keywords panel

/**
 * Creates a persistent keywords panel in the target section
 * @param {HTMLElement} targetSection - The section to add the panel to
 * @param {Object} keywordsData - The keywords data object
 */
function createPersistentKeywordsPanel(targetSection, keywordsData) {
    // Check if the panel already exists in the target section
    if (targetSection.querySelector('.persistent-keywords-panel')) {
        return;
    }
    
    // Create the panel
    const panel = document.createElement('div');
    panel.className = 'persistent-keywords-panel mb-4 p-3 bg-white rounded-md shadow-sm';
    panel.style.border = '1px solid rgba(46, 134, 171, 0.3)';
    
    // Create the header with toggle button
    const header = document.createElement('div');
    header.className = 'flex justify-between items-center mb-2';
    
    const title = document.createElement('h3');
    title.className = 'text-sm font-semibold text-gray-700 flex items-center';
    title.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" style="color: #2E86AB;" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        Extracted Keywords
    `;
    
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-keywords-panel text-xs flex items-center';
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
        const content = panel.querySelector('.persistent-keywords-content');
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
    panel.appendChild(header);
    
    // Create the content container
    const content = document.createElement('div');
    content.className = 'persistent-keywords-content';
    
    // Create a compact version of the keywords
    const keywordsContainer = document.createElement('div');
    keywordsContainer.className = 'flex flex-wrap gap-1';
    
    // Add high priority keywords
    if (keywordsData.keywords && keywordsData.keywords.high_priority && keywordsData.keywords.high_priority.length > 0) {
        keywordsData.keywords.high_priority.forEach(item => {
            const keywordText = typeof item === 'string' ? item : (item.keyword || '');
            if (keywordText) {
                const badge = document.createElement('div');
                badge.className = 'bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium mb-1 mr-1';
                badge.textContent = keywordText;
                keywordsContainer.appendChild(badge);
            }
        });
    }
    
    // Add medium priority keywords
    if (keywordsData.keywords && keywordsData.keywords.medium_priority && keywordsData.keywords.medium_priority.length > 0) {
        keywordsData.keywords.medium_priority.forEach(item => {
            const keywordText = typeof item === 'string' ? item : (item.keyword || '');
            if (keywordText) {
                const badge = document.createElement('div');
                badge.className = 'bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium mb-1 mr-1';
                badge.textContent = keywordText;
                keywordsContainer.appendChild(badge);
            }
        });
    }
    
    // Add low priority keywords
    if (keywordsData.keywords && keywordsData.keywords.low_priority && keywordsData.keywords.low_priority.length > 0) {
        keywordsData.keywords.low_priority.forEach(item => {
            const keywordText = typeof item === 'string' ? item : (item.keyword || '');
            if (keywordText) {
                const badge = document.createElement('div');
                badge.className = 'bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium mb-1 mr-1';
                badge.textContent = keywordText;
                keywordsContainer.appendChild(badge);
            }
        });
    }
    
    content.appendChild(keywordsContainer);
    panel.appendChild(content);
    
    // Insert the panel at the top of the target section
    targetSection.insertBefore(panel, targetSection.firstChild);
}
