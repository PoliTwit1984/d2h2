"""
Keyword Highlighting Module

This module handles highlighting keywords in text.
"""

import re
from services.openai_service import get_text_response
from services.keyword.keyword_utils import log_debug, extract_keywords_regex

def highlight_keywords_in_resume(resume_text, found_keywords, keywords_data=None):
    """
    Highlight keywords in the resume text based on their priority.
    
    Args:
        resume_text (str): The resume text to highlight
        found_keywords (dict): Dictionary mapping keywords to boolean (found or not)
        keywords_data (dict, optional): Keywords data structure with priority information
        
    Returns:
        str: The resume text with keywords highlighted using HTML mark tags with priority-based classes
    """
    log_debug("Highlighting keywords in resume...")
    
    # Create a copy of the resume text to work with
    highlighted_text = resume_text
    
    # Replace newlines with <br> tags for proper HTML display
    highlighted_text = highlighted_text.replace('\n', '<br>')
    
    # Create a map of keywords to their priority if keywords_data is provided
    keyword_priority_map = {}
    
    if keywords_data:
        # Handle different structures of keywords_data
        if "keywords" in keywords_data:
            # Map keywords to their priority from the keywords structure
            for priority in ["high_priority", "medium_priority", "low_priority"]:
                if priority in keywords_data["keywords"]:
                    for item in keywords_data["keywords"][priority]:
                        if isinstance(item, dict) and "keyword" in item:
                            keyword_priority_map[item["keyword"]] = priority.split("_")[0]  # Extract 'high', 'medium', 'low'
                        elif isinstance(item, str):
                            keyword_priority_map[item] = priority.split("_")[0]
        elif isinstance(keywords_data, dict):
            # Direct mapping if keywords_data is a flat dictionary
            for priority in ["high_priority", "medium_priority", "low_priority"]:
                if priority in keywords_data:
                    for item in keywords_data[priority]:
                        if isinstance(item, dict) and "keyword" in item:
                            keyword_priority_map[item["keyword"]] = priority.split("_")[0]
                        elif isinstance(item, str):
                            keyword_priority_map[item] = priority.split("_")[0]
    
    # Count how many keywords were actually found
    found_count = 0
    
    # Highlight each found keyword based on priority
    for keyword, found in found_keywords.items():
        if found:
            found_count += 1
            
            # Determine the priority class for this keyword
            priority = "medium"  # Default priority
            if keyword in keyword_priority_map:
                priority = keyword_priority_map[keyword]
            
            # Define the CSS class based on priority
            css_class = ""
            if priority == "high":
                css_class = "high-priority-keyword"
            elif priority == "medium":
                css_class = "medium-priority-keyword"
            elif priority == "low":
                css_class = "low-priority-keyword"
            
            # Escape the keyword for regex
            escaped_keyword = re.escape(keyword)
            
            # Use word boundaries to match whole words only, with case insensitivity
            pattern = re.compile(r'\b' + escaped_keyword + r'\b', re.IGNORECASE)
            
            # Replace with marked version including the priority class
            replacement = f'<mark class="{css_class}">{keyword}</mark>'
            highlighted_text = pattern.sub(replacement, highlighted_text)
    
    log_debug(f"Found and highlighted {found_count} keywords in resume")
    
    return highlighted_text

def highlight_job_description(job_description, keywords_data):
    """
    Highlight keywords in the job description based on their priority.
    
    Args:
        job_description (str): The job description text to highlight
        keywords_data (dict): The keywords data structure with priority information
        
    Returns:
        str: The job description with keywords highlighted using HTML mark tags with priority colors
    """
    try:
        log_debug("Highlighting keywords in job description...")
        
        # Create a copy of the job description to work with
        highlighted_text = job_description
        
        # Define CSS classes for different priority levels
        priority_classes = {
            "high_priority": "high-priority-keyword",
            "medium_priority": "medium-priority-keyword",
            "low_priority": "low-priority-keyword"
        }
        
        # Track which keywords were actually found in the text
        found_keywords = {
            "high_priority": [],
            "medium_priority": [],
            "low_priority": []
        }
        
        # Process keywords by priority with the new structure
        for priority_field in ["high_priority", "medium_priority", "low_priority"]:
            if priority_field in keywords_data:
                css_class = priority_classes.get(priority_field, "")
                
                # Sort items by score (highest first)
                sorted_items = sorted(
                    keywords_data[priority_field], 
                    key=lambda x: x.get("score", 0) if isinstance(x, dict) else 0, 
                    reverse=True
                )
                
                # Sort by length as well (longest first) to ensure we match the most specific terms first
                sorted_items = sorted(
                    sorted_items,
                    key=lambda x: len(x.get("keyword", "")) if isinstance(x, dict) and "keyword" in x else 0,
                    reverse=True
                )
                
                for item in sorted_items:
                    if isinstance(item, dict) and "keyword" in item:
                        keyword = item["keyword"]
                        
                        # Skip empty keywords
                        if not keyword.strip():
                            continue
                            
                        # Escape the keyword for regex
                        escaped_keyword = re.escape(keyword)
                        
                        # Use word boundaries to match whole words only, with case insensitivity
                        pattern = re.compile(r'\b' + escaped_keyword + r'\b', re.IGNORECASE)
                        
                        # Check if the keyword exists in the text
                        if pattern.search(highlighted_text):
                            # Replace with marked version including the priority class
                            replacement = f'<mark class="{css_class}" data-score="{item.get("score", 0)}">{keyword}</mark>'
                            highlighted_text = pattern.sub(replacement, highlighted_text)
                            found_keywords[priority_field].append(item)
                
                log_debug(f"Highlighted {len(found_keywords[priority_field])} {priority_field} keywords in job description")
        
        # If we don't have the enhanced structure, fall back to the flat list
        if not any(found_keywords.values()) and "missing_keywords" in keywords_data:
            for keyword in keywords_data.get("missing_keywords", []):
                if not keyword.strip():
                    continue
                pattern = re.compile(r'\b' + re.escape(keyword) + r'\b', re.IGNORECASE)
                if pattern.search(highlighted_text):
                    highlighted_text = pattern.sub(f'<mark>{keyword}</mark>', highlighted_text)
        
        # Add information about found keywords to the keywords_data
        keywords_data["found_keywords"] = found_keywords
        
        # Convert newlines to <br> tags for proper HTML display
        highlighted_text = highlighted_text.replace('\n', '<br>')
        
        return highlighted_text
    
    except Exception as e:
        log_debug(f"Error highlighting job description: {str(e)}")
        # Return the original text if there's an error
        return job_description.replace('\n', '<br>')

def highlight_keywords(profile_text, job_description):
    """
    Identify and highlight keywords from the job description in the profile text.
    
    Args:
        profile_text (str): The profile text to highlight keywords in
        job_description (str): The job description to extract keywords from
        
    Returns:
        str: The profile text with keywords highlighted using HTML mark tags
    """
    try:
        # Prepare the prompt for OpenAI
        prompt = f"""
        I have a career profile and a job description. I need you to identify keywords and phrases from the job description 
        that appear in the career profile, including semantically similar terms (not just exact matches).
        
        IMPORTANT: 
        1. Prioritize broader competencies (e.g., "strategic planning", "team leadership", "change management") 
           over specific technical skills or tools (e.g., "Python", "AWS", "Excel").
        2. Look for variations and synonyms (e.g., "customer" = "client", "management" = "leadership")
        3. Consider the semantic meaning, not just exact matches
        
        Return the career profile with HTML <mark> tags around each identified keyword or phrase.
        Return ONLY the marked-up HTML with no additional explanation or text.
        
        Career Profile:
        {profile_text}
        
        Job Description:
        {job_description}
        """
        
        messages = [
            {"role": "system", "content": "You are a helpful assistant that identifies and highlights keywords."},
            {"role": "user", "content": prompt}
        ]
        
        # Get the text response
        highlighted_text = get_text_response(messages, max_tokens=500, temperature=0.3)
        
        # Clean up any extra text the model might have added
        if "<mark>" in highlighted_text:
            # Extract just the part with the marks
            pattern = re.compile(r'(?:.*?)(?=<mark>|$)((?:<mark>.*?</mark>|.)*)', re.DOTALL)
            match = pattern.search(highlighted_text)
            if match:
                highlighted_text = match.group(1)
        
        return highlighted_text
    except Exception as e:
        print(f"Error highlighting keywords: {str(e)}")
        # Fallback to regex-based highlighting if OpenAI fails
        return mark_keywords_regex(profile_text, extract_keywords_regex(job_description)[1])

def mark_keywords_regex(text, keywords):
    """
    Mark keywords in text with HTML tags for highlighting (fallback method).
    
    Args:
        text (str): The text to highlight keywords in
        keywords (list): The keywords to highlight
        
    Returns:
        str: The text with keywords highlighted using HTML mark tags
    """
    marked_text = text
    for keyword in keywords:
        if isinstance(keyword, dict) and "keyword" in keyword:
            keyword_text = keyword["keyword"]
        elif isinstance(keyword, str):
            keyword_text = keyword
        else:
            continue
            
        # Use word boundaries to match whole words only
        pattern = re.compile(r'\b' + re.escape(keyword_text) + r'\b', re.IGNORECASE)
        marked_text = pattern.sub(f'<mark>{keyword_text}</mark>', marked_text)
    
    return marked_text
