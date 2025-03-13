"""
Text Processing Utilities

This module provides utility functions for text processing and manipulation.
"""

import re
import json
from difflib import SequenceMatcher

def sanitize_text(text):
    """
    Sanitize text by removing problematic characters and normalizing whitespace.
    
    Args:
        text (str): The text to sanitize
        
    Returns:
        str: The sanitized text
    """
    if not text:
        return ""
    
    # Replace newlines and carriage returns with spaces
    sanitized = text.replace('\n', ' ').replace('\r', ' ')
    
    # Escape double quotes
    sanitized = sanitized.replace('"', '\\"')
    
    # Double escape backslashes
    sanitized = sanitized.replace('\\', '\\\\')
    
    # Normalize whitespace (replace multiple spaces with a single space)
    sanitized = re.sub(r'\s+', ' ', sanitized)
    
    return sanitized.strip()

def expand_keyword(keyword):
    """
    Expand a keyword into basic variations and components.
    This is a minimal implementation as we now rely more on OpenAI's semantic understanding.
    
    Args:
        keyword (str): The keyword to expand
        
    Returns:
        list: List of expanded variations and components
    """
    variations = [keyword]
    
    # Add lowercase version
    variations.append(keyword.lower())
    
    # For compound phrases, add components
    if ' ' in keyword:
        components = keyword.split(' ')
        variations.extend(components)
        
        # Add variations with different word order for 2-3 word phrases
        if len(components) in [2, 3]:
            variations.append(' '.join(reversed(components)))
    
    # Remove duplicates and empty strings
    return list(set([v for v in variations if v]))

def fuzzy_match(text, keyword, threshold=0.8):  # Keeping threshold at 0.8 to avoid false positives
    """
    Check if a keyword has a fuzzy match in the text.
    
    Args:
        text (str): The text to search in
        keyword (str): The keyword to search for
        threshold (float): The similarity threshold (0.0 to 1.0)
        
    Returns:
        tuple: (bool, str) - Whether a match was found and the matching text
    """
    # First check for exact match
    if keyword.lower() in text.lower():
        return True, keyword
    
    # Split text into sentences for more focused matching
    sentences = re.split(r'[.!?]+', text)
    
    for sentence in sentences:
        # Split sentence into words
        words = sentence.split()
        
        # Check for matches in sliding windows of appropriate size
        keyword_words = keyword.split()
        window_size = min(len(keyword_words) + 2, len(words))  # Allow for some extra words
        
        for i in range(len(words) - window_size + 1):
            window = ' '.join(words[i:i+window_size])
            similarity = SequenceMatcher(None, window.lower(), keyword.lower()).ratio()
            
            if similarity >= threshold:
                return True, window
    
    return False, ""

def extract_context(text, keyword, context_size=100):
    """
    Extract context around a keyword from text.
    
    Args:
        text (str): The text to extract context from
        keyword (str): The keyword to find context for
        context_size (int): The number of characters of context to include
        
    Returns:
        str: The extracted context
    """
    # Find the keyword in the text (case-insensitive)
    keyword_lower = keyword.lower()
    text_lower = text.lower()
    
    # If keyword not found, try fuzzy matching
    if keyword_lower not in text_lower:
        match_found, matching_text = fuzzy_match(text, keyword)
        if match_found:
            keyword = matching_text
            keyword_lower = matching_text.lower()
            # Update text_lower in case the matching_text has different case
            text_lower = text.lower()
        else:
            return ""
    
    # Find the position of the keyword
    pos = text_lower.find(keyword_lower)
    
    if pos == -1:
        return ""
    
    # Calculate the start and end positions for the context
    start = max(0, pos - context_size)
    end = min(len(text), pos + len(keyword) + context_size)
    
    # Extract the context
    context = text[start:end]
    
    # If the context doesn't start at the beginning of the text, add ellipsis
    if start > 0:
        context = "..." + context
    
    # If the context doesn't end at the end of the text, add ellipsis
    if end < len(text):
        context = context + "..."
    
    return context

def parse_keywords_data(keywords_json):
    """
    Parse keywords data from JSON string into a structured format.
    This consolidates the duplicate JSON parsing logic used in multiple endpoints.
    
    Args:
        keywords_json (str): JSON string containing keywords data
        
    Returns:
        tuple: (keywords_data, keywords_list) - The structured keywords data and a flat list of all keywords
    """
    keywords = []
    keywords_data = None
    
    if not keywords_json:
        return None, []
    
    try:
        keywords_data = json.loads(keywords_json)
        
        # Extract keywords from the keywords_data structure
        if isinstance(keywords_data, dict):
            # If it's the enhanced structure with priority categories
            # First check if it has the nested 'keywords' structure
            if 'keywords' in keywords_data and isinstance(keywords_data['keywords'], dict):
                # Handle the nested structure
                for priority in ['high_priority', 'medium_priority', 'low_priority']:
                    if priority in keywords_data['keywords']:
                        for item in keywords_data['keywords'][priority]:
                            if isinstance(item, dict) and 'keyword' in item:
                                keywords.append(item['keyword'])
                            elif isinstance(item, str):
                                keywords.append(item)
            else:
                # Handle the flat structure
                for priority in ['high_priority', 'medium_priority', 'low_priority']:
                    if priority in keywords_data:
                        for item in keywords_data[priority]:
                            if isinstance(item, dict) and 'keyword' in item:
                                keywords.append(item['keyword'])
                            elif isinstance(item, str):
                                keywords.append(item)
        elif isinstance(keywords_data, list):
            # If it's a simple list of keywords
            keywords = keywords_data
    except Exception as e:
        print(f"Error parsing keywords JSON: {str(e)}")
        return None, []
    
    return keywords_data, keywords
