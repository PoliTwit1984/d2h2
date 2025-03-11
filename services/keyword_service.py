"""
Keyword Service Module

This module handles keyword extraction and citation functionality.
It serves as the main entry point for the keyword service package.
"""

# Import functions from the keyword package modules
from services.keyword.keyword_utils import log_debug, extract_keywords_regex
from services.keyword.keyword_extraction import extract_keywords_only, extract_keywords
from services.keyword.keyword_matching import find_keywords_in_resume, find_keyword_citations
from services.keyword.keyword_highlighting import (
    highlight_keywords_in_resume,
    highlight_job_description,
    highlight_keywords
)

# Re-export the functions to maintain the same API
__all__ = [
    'extract_keywords_only',
    'extract_keywords',
    'find_keywords_in_resume',
    'find_keyword_citations',
    'highlight_keywords_in_resume',
    'highlight_job_description',
    'highlight_keywords',
    'extract_keywords_regex'
]
