"""
Keyword Utilities Module

This module provides utility functions for the keyword service.
"""

import re
from datetime import datetime

def log_debug(message):
    """
    Log a debug message with timestamp.
    
    Args:
        message (str): The message to log
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
    print(f"[DEBUG] [{timestamp}] {message}")

def sanitize_text_for_regex(text):
    """
    Sanitize text for use in regex patterns.
    
    Args:
        text (str): The text to sanitize
        
    Returns:
        str: The sanitized text
    """
    return re.escape(text)

def extract_keywords_regex(text):
    """
    Extract important keywords from text using regex (fallback method).
    
    Args:
        text (str): The text to extract keywords from
        
    Returns:
        tuple: (keywords_data, all_keywords) - The extracted keywords data and a flat list of all keywords
    """
    # Remove common words and punctuation
    text = text.lower()
    # Split into words and filter out short words (likely not keywords)
    words = re.findall(r'\b[a-zA-Z0-9][\w\-\.]+[a-zA-Z0-9]\b', text)
    # Filter out common words
    common_words = {'and', 'the', 'to', 'of', 'in', 'for', 'with', 'on', 'at', 'from', 'by', 
                   'about', 'as', 'an', 'are', 'be', 'been', 'being', 'was', 'were', 'is', 
                   'am', 'has', 'have', 'had', 'do', 'does', 'did', 'but', 'or', 'if', 'then',
                   'else', 'when', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further',
                   'then', 'once', 'here', 'there', 'all', 'any', 'both', 'each', 'few', 'more',
                   'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
                   'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'should',
                   'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', 'couldn', 'didn',
                   'doesn', 'hadn', 'hasn', 'haven', 'isn', 'ma', 'mightn', 'mustn', 'needn',
                   'shan', 'shouldn', 'wasn', 'weren', 'won', 'wouldn', 'a', 'i', 'you', 'he',
                   'she', 'it', 'we', 'they', 'this', 'that', 'these', 'those'}
    
    keywords = [word for word in words if word not in common_words and len(word) > 2]
    
    # Also extract phrases (2-3 word combinations that might be important)
    phrases = re.findall(r'\b[a-zA-Z0-9][\w\-\.]+ [a-zA-Z0-9][\w\-\.]+( [a-zA-Z0-9][\w\-\.]+)?\b', text.lower())
    phrases = [phrase.strip() for phrase in phrases]
    
    # Combine individual keywords and phrases, removing duplicates
    all_keywords = list(set(keywords + phrases))
    
    # Sort by length (longer keywords first) to ensure we match the most specific terms first
    all_keywords.sort(key=len, reverse=True)
    
    # Create a basic structure for the enhanced data with the new format
    high_priority = []
    medium_priority = []
    low_priority = []
    
    # Add scores to keywords based on position in the list
    for i, keyword in enumerate(all_keywords[:5]):
        score = 0.95 - (i * 0.05)  # Start at 0.95 and decrease by 0.05
        high_priority.append({"keyword": keyword, "score": score})
    
    for i, keyword in enumerate(all_keywords[5:15] if len(all_keywords) > 5 else []):
        score = 0.75 - (i * 0.02)  # Start at 0.75 and decrease by 0.02
        medium_priority.append({"keyword": keyword, "score": score})
    
    for i, keyword in enumerate(all_keywords[15:] if len(all_keywords) > 15 else []):
        score = 0.50 - (i * 0.01)  # Start at 0.50 and decrease by 0.01
        if score < 0.1:  # Ensure score doesn't go too low
            score = 0.1
        low_priority.append({"keyword": keyword, "score": score})
    
    keywords_data = {
        "high_priority": high_priority,
        "medium_priority": medium_priority,
        "low_priority": low_priority,
        "missing_keywords": []
    }
    
    return keywords_data, all_keywords
