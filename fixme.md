# FIXME: Issues with Keyword Extraction and Citations Display

## Current Issues

### 1. Checkmarks and X Marks in Keyword List

**Problem:** When citations are found for keywords, checkmarks (✓) and X marks (✗) are not displaying correctly in the keyword list. The checkmarks should appear next to keywords that have citations in the citations panel, and X marks should appear next to keywords that don't have citations.

**Current Behavior:** 
- The checkmarks/X marks are either not showing up at all, or they're showing up in the wrong place (in the citations panel instead of the keyword list).
- The visual indicators are not properly tied to whether a citation exists for each keyword.

**Affected Files:**
- `static/js/modules/keyword-manager.js` - The `createKeywordElement` function and `updateKeywordsWithFoundStatus` function
- `static/js/modules/citations-manager.js` - May have indicators that should be in the keyword list

**Expected Behavior:**
- After citations are generated, each keyword in the keyword list should have either:
  - A checkmark (✓) if a citation was found for that keyword
  - An X mark (✗) if no citation was found for that keyword
- These indicators should only appear after citations have been generated, not before.

### 2. Citations All Showing as "Medium Priority"

**Problem:** All citations are showing up under the "Medium Priority" section in the citations panel, regardless of their actual priority level (high, medium, low).

**Current Behavior:**
- The backend correctly organizes citations by priority levels (high_priority, medium_priority, low_priority, fallback_extraction)
- However, in the frontend display, all citations appear under the "Medium Priority" section

**Affected Files:**
- `static/js/modules/citations-manager.js` - The `addCitationsToPanel` function
- `services/keyword/keyword_matching.py` - Contains the backend logic for organizing citations by priority

**Expected Behavior:**
- Citations should be displayed under their respective priority sections:
  - High Priority keywords should appear under "High Priority"
  - Medium Priority keywords should appear under "Medium Priority"
  - Low Priority keywords should appear under "Low Priority"
  - Any additional citations should appear under "Additional Citations"

### 3. Hidden Resume Input Box

**Problem:** There appears to be a hidden resume input box that isn't showing up correctly.

**Current Behavior:**
- The resume input box may be hidden or not properly displayed to users
- This could affect the user's ability to input their resume text

**Affected Files:**
- `templates/index.html` - Contains the HTML structure for the input forms
- `static/js/main.js` or other JS files that control UI visibility

**Expected Behavior:**
- The resume input box should be clearly visible and accessible to users
- Users should be able to paste their resume text into this box

### 4. Spinners Not Showing in Guide Panel

**Problem:** Spinners are not appearing in the UI when buttons in the guide panel are clicked, making it unclear to users that the system is processing their request.

**Current Behavior:**
- When users click buttons in the guide panel (like "Extract Keywords" or "Generate Citations"), the spinners that should indicate loading/processing are not showing up
- The CSS for spinners is defined in `custom.css`, but they're not being displayed properly in the UI

**Affected Files:**
- `static/js/guide-panel.js` - Contains the code to show/hide spinners when buttons are clicked
- `static/css/custom.css` - Contains the spinner styling

**Expected Behavior:**
- When a button is clicked in the guide panel, a spinner should appear to indicate that the system is processing the request
- The spinner should be replaced with the original button text once the operation is complete

**Implementation Notes:**
- The spinner CSS is correctly defined in `custom.css`:
  ```css
  .spinner {
      display: inline-block;
      width: 1.5rem;
      height: 1.5rem;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s ease-in-out infinite;
      margin-right: 0.75rem;
  }

  @keyframes spin {
      to { transform: rotate(360deg); }
  }
  ```
- The issue might be with how the spinner element is being added to the DOM or with CSS specificity issues

## Root Causes and Potential Solutions

### For Checkmarks/X Marks Issue:

The issue likely stems from how we're checking for citations and updating the keyword elements. In `keyword-manager.js`, we need to:

1. Ensure the `updateKeywordsWithFoundStatus` function correctly checks if a citation exists for each keyword
2. Modify the `createKeywordElement` function to add the appropriate visual indicator (✓ or ✗) based on whether a citation exists
3. Make sure these indicators are only added after citations have been generated

The current implementation may be checking for the wrong condition or not properly updating the DOM elements.

### For Citations Priority Issue:

The issue is likely in how the citations are being processed and displayed in the `addCitationsToPanel` function in `citations-manager.js`. Possible causes:

1. The function might not be correctly iterating through all priority buckets
2. There might be a condition that's causing all citations to be added to the "Medium Priority" section
3. The priority data structure might not be correctly passed from the backend to the frontend

### For Hidden Resume Input Box:

This could be due to:

1. CSS issues (display: none or visibility: hidden being applied incorrectly)
2. JavaScript that's hiding the element when it shouldn't be
3. Conditional rendering logic that's not working as expected

### For Spinner Issue:

The issue could be due to:

1. The spinner element not being correctly added to the DOM when buttons are clicked
2. CSS specificity issues preventing the spinner from being displayed
3. JavaScript errors that are preventing the spinner code from executing
4. Timing issues where the spinner is added and removed too quickly to be visible

## Additional Considerations

1. **Data Flow:** The application has a complex data flow between the backend and frontend. Make sure that the data structures are consistent and that the frontend correctly interprets the data from the backend.

2. **Event Handling:** The application relies on various event handlers to update the UI. Ensure that events are properly triggered and that the handlers are correctly updating the DOM.

3. **Browser Compatibility:** Test the application in different browsers to ensure that the issues aren't browser-specific.

4. **Console Errors:** Check the browser console for any JavaScript errors that might be preventing the functionality from working correctly.

5. **API Responses:** Verify that the API responses from the backend contain the expected data structure and that the frontend is correctly parsing this data.

## Debugging Steps

1. Add console.log statements in key functions to trace the data flow:
   - Log the citations data structure when it's received from the API
   - Log the keywords data structure when updating the keyword elements
   - Log when checkmarks/X marks are being added to elements
   - Log when spinners are being added/removed from the DOM

2. Use browser developer tools to:
   - Inspect the DOM structure to see if elements are being created correctly
   - Check for any CSS issues that might be hiding elements
   - Monitor network requests to ensure data is being sent/received correctly
   - Check for JavaScript errors in the console

3. Test each component in isolation:
   - Test the citations panel without the keyword list
   - Test the keyword list without the citations panel
   - Test the resume input box independently
   - Test the spinner functionality independently

## Implementation Notes

When fixing these issues, keep in mind:

1. The `window.citationsData` object contains the citations organized by priority
2. The `updateKeywordsWithFoundStatus` function should be called after citations are generated
3. The `createKeywordElement` function should check `window.citationsData` to determine if a citation exists for a keyword
4. The `addCitationsToPanel` function should iterate through all priority buckets and add citations to the appropriate sections
5. For spinners, ensure that the spinner element is correctly added to the DOM and that it has the correct CSS classes

By addressing these issues, we can ensure that:
1. Checkmarks and X marks appear correctly in the keyword list
2. Citations are displayed under their correct priority sections
3. The resume input box is visible and accessible to users
4. Spinners appear when buttons are clicked, providing visual feedback to users
