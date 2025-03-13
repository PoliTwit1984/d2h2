"""
Keyword Matching Module

This module handles finding keywords in resumes and generating citations.
"""

import time
import json
import re
from services.openai_service import get_json_response, get_text_response
from services.keyword.keyword_utils import log_debug, sanitize_text_for_regex
from utils.text_processing import sanitize_text

def find_keywords_in_resume(keywords, master_resume, job_title='', company_name='', industry=''):
    """
    Find keywords in the master resume and highlight them based on priority.
    
    Args:
        keywords (list): List of keywords to find in the resume
        master_resume (str): The master resume text
        job_title (str, optional): The job title. Defaults to ''.
        company_name (str, optional): The company name. Defaults to ''.
        industry (str, optional): The industry. Defaults to ''.
        
    Returns:
        tuple: (found_keywords, highlighted_resume)
            - found_keywords: Dictionary of keywords with boolean values indicating if they were found
            - highlighted_resume: HTML string with keywords highlighted by priority
    """
    try:
        log_debug(f"Finding keywords in resume...")
        start_time = time.time()
        
        # Clean and sanitize inputs to prevent JSON parsing issues
        sanitized_keywords = []
        keyword_list = []
        
        # Process the keywords input which could be in different formats
        if isinstance(keywords, dict):
            if "keywords" in keywords:
                # Extract from enhanced structure
                for priority in ["high_priority", "medium_priority", "low_priority"]:
                    if priority in keywords["keywords"]:
                        for item in keywords["keywords"][priority]:
                            if isinstance(item, dict) and "keyword" in item:
                                keyword_list.append(item["keyword"])
                            elif isinstance(item, str):
                                keyword_list.append(item)
            else:
                # Direct dictionary structure
                for priority in ["high_priority", "medium_priority", "low_priority"]:
                    if priority in keywords:
                        for item in keywords[priority]:
                            if isinstance(item, dict) and "keyword" in item:
                                keyword_list.append(item["keyword"])
                            elif isinstance(item, str):
                                keyword_list.append(item)
        elif isinstance(keywords, list):
            # Simple list of keywords
            keyword_list = keywords
        
        # Sanitize the keywords
        for keyword in keyword_list:
            sanitized_keywords.append(sanitize_text(keyword))
        
        # Sanitize resume text
        sanitized_resume = sanitize_text(master_resume)
        
        # Prepare the prompt for OpenAI with improved instructions for better matching
        prompt = f"""
        I have a list of keywords and a resume. I need you to find which keywords appear in the resume.
        
        IMPORTANT INSTRUCTIONS:
        1. Thoroughly scan the ENTIRE resume, including ALL sections.
        2. For each keyword, determine if it appears in the resume (exact match or semantic equivalent).
        3. Use your semantic understanding to identify matches based on meaning, not just exact words:
           - Look for semantic equivalents (e.g., "Customer" and "Client" are semantically equivalent)
           - Identify conceptual matches (e.g., "Data Analytics" might be evidenced by "metrics tracking")
        4. Be VERY strict about requiring genuine evidence. DO NOT force matches that aren't genuinely there.
        5. If you're unsure about a match, mark it as false (not found).
        
        Your response MUST be a valid JSON object where:
        - Each key is one of the keywords
        - Each value is a boolean (true if found in resume, false if not found)
        
        Keywords:
        {', '.join(sanitized_keywords)}
        
        Resume:
        {sanitized_resume}
        """
        
        # First attempt with JSON response format
        try:
            log_debug("Calling OpenAI API to find keywords in resume (JSON format)...")
            api_start_time = time.time()
            
            messages = [
                {"role": "system", "content": "You are a helpful assistant that finds keywords in resumes and returns valid JSON. You are strict about only including keywords with genuine matches."},
                {"role": "user", "content": prompt}
            ]
            
            # Get the JSON response
            found_keywords = get_json_response(messages, max_tokens=800, temperature=0.3)
            
            api_duration = time.time() - api_start_time
            log_debug(f"OpenAI API call for finding keywords completed in {api_duration:.2f} seconds")
            
            # Verify all keywords are in the response
            for keyword in sanitized_keywords:
                if keyword not in found_keywords:
                    found_keywords[keyword] = False
            
            # Count how many keywords were actually found
            found_count = sum(1 for value in found_keywords.values() if value)
            log_debug(f"Found {found_count} keywords out of {len(sanitized_keywords)} in resume")
            
            # Now highlight the keywords in the resume based on priority
            from services.keyword.keyword_highlighting import highlight_keywords_in_resume
            highlighted_resume = highlight_keywords_in_resume(master_resume, found_keywords, keywords)
            
            return found_keywords, highlighted_resume
            
        except Exception as api_err:
            print(f"API error in finding keywords: {str(api_err)}")
            # Fall back to a simpler method
            return fallback_find_keywords_in_resume(keywords, master_resume)
            
    except Exception as e:
        print(f"Error finding keywords in resume: {str(e)}")
        # Return empty dict if there's an error
        return {}, master_resume

def fallback_find_keywords_in_resume(keywords, resume_text):
    """
    Fallback method to find keywords in resume using regex.
    
    Args:
        keywords (list): List of keywords to find in the resume
        resume_text (str): The resume text to search in
        
    Returns:
        tuple: (found_keywords, highlighted_resume) - Dictionary of found keywords and highlighted resume text
    """
    found_keywords = {}
    
    # Convert resume text to lowercase for case-insensitive matching
    resume_lower = resume_text.lower()
    
    # Process keywords list
    keyword_list = []
    if isinstance(keywords, dict) and "keywords" in keywords:
        # Extract keywords from the enhanced structure
        for priority in ["high_priority", "medium_priority", "low_priority"]:
            if priority in keywords["keywords"]:
                for item in keywords["keywords"][priority]:
                    if isinstance(item, dict) and "keyword" in item:
                        keyword_list.append(item["keyword"])
                    elif isinstance(item, str):
                        keyword_list.append(item)
    elif isinstance(keywords, list):
        # Use the list directly
        keyword_list = keywords
    
    # Check each keyword
    for keyword in keyword_list:
        if isinstance(keyword, dict) and "keyword" in keyword:
            keyword_text = keyword["keyword"]
        elif isinstance(keyword, str):
            keyword_text = keyword
        else:
            continue
            
        # Check if the keyword exists in the resume (case-insensitive)
        found_keywords[keyword_text] = keyword_text.lower() in resume_lower
    
    # Highlight the keywords in the resume
    from services.keyword.keyword_highlighting import highlight_keywords_in_resume
    highlighted_resume = highlight_keywords_in_resume(resume_text, found_keywords, keywords)
    
    return found_keywords, highlighted_resume

def find_keyword_citations(keywords, resume_text, job_title='', company_name='', industry=''):
    """
    Find citations in the resume for each keyword with improved matching.
    
    Args:
        keywords (list): List of keywords to find citations for
        resume_text (str): The resume text to search in
        job_title (str, optional): The job title. Defaults to ''.
        company_name (str, optional): The company name. Defaults to ''.
        industry (str, optional): The industry. Defaults to ''.
        
    Returns:
        dict: Dictionary mapping keywords to citations organized by priority
    """
    try:
        log_debug(f"Finding citations for {len(keywords)} keywords...")
        start_time = time.time()
        
        # Process keywords to extract a clean list and organize by priority
        sanitized_keywords = []
        keyword_list = []
        priority_keywords = {
            "high_priority": [],
            "medium_priority": [],
            "low_priority": []
        }
        
        # Process the keywords input which could be in different formats
        if isinstance(keywords, dict):
            if "keywords" in keywords:
                # Extract from enhanced structure
                for priority in ["high_priority", "medium_priority", "low_priority"]:
                    if priority in keywords["keywords"]:
                        for item in keywords["keywords"][priority]:
                            if isinstance(item, dict) and "keyword" in item:
                                keyword_list.append(item["keyword"])
                                priority_keywords[priority].append(item["keyword"])
                            elif isinstance(item, str):
                                keyword_list.append(item)
                                priority_keywords[priority].append(item)
            else:
                # Direct dictionary structure
                for priority in ["high_priority", "medium_priority", "low_priority"]:
                    if priority in keywords:
                        for item in keywords[priority]:
                            if isinstance(item, dict) and "keyword" in item:
                                keyword_list.append(item["keyword"])
                                priority_keywords[priority].append(item["keyword"])
                            elif isinstance(item, str):
                                keyword_list.append(item)
                                priority_keywords[priority].append(item)
        elif isinstance(keywords, list):
            # Simple list of keywords
            keyword_list = keywords
            # Put all in medium priority if no priority info
            priority_keywords["medium_priority"] = keyword_list
        
        # Sanitize the keywords
        for keyword in keyword_list:
            sanitized_keywords.append(sanitize_text(keyword))
        
        # Sanitize resume text - more aggressive cleaning
        sanitized_resume = sanitize_text(resume_text)
        
        # Prepare the prompt for OpenAI with improved instructions for text-based response
        prompt = f"""
        I have a list of keywords and a resume. I need you to find evidence in the resume that supports each keyword.
        
        IMPORTANT INSTRUCTIONS:
        1. Thoroughly scan the ENTIRE resume, including ALL sections:
           - Work experience
           - Projects
           - Hackathons
           - Volunteer work
           - Education
           - Certifications
           - Skills sections
           - Any other non-standard sections
        
        2. For each keyword, find the most relevant sentence or phrase from ANY part of the resume that demonstrates the candidate's experience or skills related to that keyword.
        
        3. Use your semantic understanding to identify matches based on meaning, not just exact words:
           - Look for semantic equivalents (e.g., "Customer" and "Client" are semantically equivalent)
           - Identify conceptual matches (e.g., "Data Analytics" might be evidenced by "metrics tracking" or "performance analysis")
           - Recognize when different terminology is used for the same concept
        
        4. For compound phrases, look for evidence where the components appear in proximity or where the concept is described using different words.
           - Example: For "Enterprise Customer Management", look for evidence of managing relationships with large corporate clients
           - Example: For "Customer Health Monitoring", look for evidence of tracking client satisfaction or analyzing customer metrics
        
        5. Look beyond job titles and formal roles - evidence can be found in project descriptions, achievements, or hackathon participation.
        
        6. Prioritize finding evidence for ALL keywords, especially high-priority ones, but be strict about requiring genuine evidence.
        
        7. Format your response using this EXACT structure for each keyword that has evidence:
           
           KEYWORD: [exact keyword text]
           CITATION: [brief excerpt from resume that provides evidence]
           EXACT_PHRASE: [the exact phrase or words in the resume that most closely match the keyword]
           
           Only include keywords that have clear supporting evidence in the resume. DO NOT force matches that aren't genuinely there.
        
        8. Be especially careful with technical or domain-specific terms (like "Audiovisual Content" or "Generative Media") - only include these if there is explicit evidence in the resume.
        
        9. IMPORTANT: Keep each citation brief (1-2 sentences maximum) to avoid exceeding token limits.
        
        10. For the EXACT_PHRASE field, provide the specific words or phrase from the resume that most closely match the keyword semantically. This should be a short phrase (2-5 words) that can be highlighted in the resume. If the keyword appears verbatim in the resume, use that exact occurrence.
        
        Keywords:
        {', '.join(sanitized_keywords)}
        
        Resume:
        {sanitized_resume}
        """
        
        try:
            log_debug("Calling OpenAI API to find citations (text format)...")
            api_start_time = time.time()
            
            messages = [
                {"role": "system", "content": "You are a helpful assistant that finds evidence in resumes and returns structured text. You are strict about only including keywords with genuine matches and omitting those without clear evidence."},
                {"role": "user", "content": prompt}
            ]
            
            # Get the text response
            response_text = get_text_response(messages, max_tokens=1500, temperature=0.3)
            
            api_duration = time.time() - api_start_time
            log_debug(f"OpenAI API call for citations completed in {api_duration:.2f} seconds")
            
            # Parse the text response into a structured format
            organized_citations = {
                "high_priority": {},
                "medium_priority": {},
                "low_priority": {},
                "fallback_extraction": {}
            }
            
            # Parse the response text
            current_keyword = None
            current_citation = None
            current_exact_phrase = None
            
            # Split the response into lines and process each line
            lines = response_text.split('\n')
            for line in lines:
                line = line.strip()
                
                # Skip empty lines
                if not line:
                    # If we have a complete keyword-citation pair, add it to the appropriate bucket
                    if current_keyword and current_citation:
                        # Create a citation object with citation text and exact phrase
                        citation_obj = {
                            "citation": current_citation,
                            "exact_phrase": current_exact_phrase or current_keyword  # Default to keyword if no exact phrase
                        }
                        
                        # Determine which priority bucket this keyword belongs to
                        placed = False
                        for priority, keywords_list in priority_keywords.items():
                            if current_keyword in keywords_list:
                                organized_citations[priority][current_keyword] = citation_obj
                                placed = True
                                break
                        
                        if not placed:
                            # If we couldn't determine the priority, put it in fallback
                            organized_citations["fallback_extraction"][current_keyword] = citation_obj
                        
                        # Reset for the next keyword-citation pair
                        current_keyword = None
                        current_citation = None
                        current_exact_phrase = None
                    
                    continue
                
                # Check for keyword line
                if line.startswith("KEYWORD:"):
                    # If we already have a keyword but no citation, this is a new keyword
                    if current_keyword and not current_citation:
                        # The previous keyword had no citation, so we skip it
                        current_keyword = line[8:].strip()
                    # If we have a complete pair, store it and start a new one
                    elif current_keyword and current_citation:
                        # Create a citation object with citation text and exact phrase
                        citation_obj = {
                            "citation": current_citation,
                            "exact_phrase": current_exact_phrase or current_keyword  # Default to keyword if no exact phrase
                        }
                        
                        # Determine which priority bucket this keyword belongs to
                        placed = False
                        for priority, keywords_list in priority_keywords.items():
                            if current_keyword in keywords_list:
                                organized_citations[priority][current_keyword] = citation_obj
                                placed = True
                                break
                        
                        if not placed:
                            # If we couldn't determine the priority, put it in fallback
                            organized_citations["fallback_extraction"][current_keyword] = citation_obj
                        
                        # Start a new keyword
                        current_keyword = line[8:].strip()
                        current_citation = None
                        current_exact_phrase = None
                    else:
                        # This is the first keyword
                        current_keyword = line[8:].strip()
                
                # Check for citation line
                elif line.startswith("CITATION:"):
                    if current_keyword:
                        current_citation = line[9:].strip()
                # Check for exact phrase line
                elif line.startswith("EXACT_PHRASE:"):
                    if current_keyword:
                        current_exact_phrase = line[13:].strip()
                # If it's not a keyword, citation, or exact phrase line, it might be a continuation of the citation
                elif current_keyword and current_citation and not line.startswith("EXACT_PHRASE:"):
                    current_citation += " " + line
            
            # Don't forget to process the last keyword-citation pair if it exists
            if current_keyword and current_citation:
                placed = False
                for priority, keywords_list in priority_keywords.items():
                    if current_keyword in keywords_list:
                        organized_citations[priority][current_keyword] = current_citation
                        placed = True
                        break
                
                if not placed:
                    organized_citations["fallback_extraction"][current_keyword] = current_citation
            
            # Count how many citations we found
            total_citations = sum(len(citations) for citations in organized_citations.values())
            log_debug(f"Found citations for {total_citations} keywords out of {len(keywords)}")
            
            # Log a sample of the citations for debugging
            for priority in ["high_priority", "medium_priority", "low_priority", "fallback_extraction"]:
                if organized_citations[priority]:
                    sample_keys = list(organized_citations[priority].keys())[:1]  # Get up to 1 key
                    for key in sample_keys:
                        citation_value = organized_citations[priority][key]
                        # Check if citation is a string or an object
                        if isinstance(citation_value, str):
                            sample_text = citation_value[:50]
                        elif isinstance(citation_value, dict) and "citation" in citation_value:
                            sample_text = citation_value["citation"][:50]
                        else:
                            sample_text = str(citation_value)[:50]
                        log_debug(f"Sample citation - '{priority}': '{sample_text}...'")
            
            return organized_citations
            
        except Exception as api_err:
            print(f"API error in citation extraction: {str(api_err)}")
            log_debug(f"API error: {str(api_err)}")
            
            # Try fallback method with even simpler format
            try:
                log_debug("API error, trying fallback method with simpler format...")
                fallback_start_time = time.time()
                
                fallback_prompt = f"""
                I have a list of keywords and a resume. Find evidence for each keyword.
                
                For each keyword, provide a brief excerpt from the resume that demonstrates this skill.
                
                IMPORTANT:
                1. Scan the ENTIRE resume - work experience, projects, hackathons, education, etc.
                2. Use your semantic understanding to find matches based on meaning
                3. Be strict - only include keywords with genuine evidence
                4. DO NOT force matches that aren't genuinely there
                5. Keep each citation brief (1-2 sentences maximum)
                
                Format your response EXACTLY like this for each keyword:
                
                KEYWORD: [keyword]
                CITATION: [evidence]
                
                Only include keywords with clear evidence.
                
                Keywords:
                {', '.join(sanitized_keywords[:20])}  # Limit to first 20 keywords to avoid token limits
                
                Resume (excerpt):
                {sanitized_resume[:3000]}  # Limit resume text to avoid token limits
                """
                
                messages = [
                    {"role": "system", "content": "You are a helpful assistant that finds evidence in resumes."},
                    {"role": "user", "content": fallback_prompt}
                ]
                
                # Get the text response
                log_debug("Calling OpenAI API for fallback citation method...")
                fallback_api_start = time.time()
                
                fallback_content = get_text_response(messages, max_tokens=1000, temperature=0.3)
                
                fallback_api_duration = time.time() - fallback_api_start
                log_debug(f"Fallback API call completed in {fallback_api_duration:.2f} seconds")
                
                # Parse the fallback response
                organized_citations = {
                    "high_priority": {},
                    "medium_priority": {},
                    "low_priority": {},
                    "fallback_extraction": {}
                }
                
                # Parse the response text
                current_keyword = None
                current_citation = None
                
                # Split the response into lines and process each line
                lines = fallback_content.split('\n')
                for line in lines:
                    line = line.strip()
                    
                    # Skip empty lines
                    if not line:
                        # If we have a complete keyword-citation pair, add it to the fallback bucket
                        if current_keyword and current_citation:
                            organized_citations["fallback_extraction"][current_keyword] = current_citation
                            current_keyword = None
                            current_citation = None
                        continue
                    
                    # Check for keyword line
                    if line.startswith("KEYWORD:"):
                        # If we already have a keyword but no citation, this is a new keyword
                        if current_keyword and not current_citation:
                            # The previous keyword had no citation, so we skip it
                            current_keyword = line[8:].strip()
                        # If we have a complete pair, store it and start a new one
                        elif current_keyword and current_citation:
                            organized_citations["fallback_extraction"][current_keyword] = current_citation
                            current_keyword = line[8:].strip()
                            current_citation = None
                        else:
                            # This is the first keyword
                            current_keyword = line[8:].strip()
                    
                    # Check for citation line
                    elif line.startswith("CITATION:"):
                        if current_keyword:
                            current_citation = line[9:].strip()
                    # If it's not a keyword or citation line, it might be a continuation of the citation
                    elif current_keyword and current_citation:
                        current_citation += " " + line
                
                # Don't forget to process the last keyword-citation pair if it exists
                if current_keyword and current_citation:
                    organized_citations["fallback_extraction"][current_keyword] = current_citation
                
                # Try to distribute fallback citations to their priority buckets if possible
                fallback_citations = organized_citations["fallback_extraction"].copy()
                for keyword, citation in fallback_citations.items():
                    for priority, keywords_list in priority_keywords.items():
                        if keyword in keywords_list:
                            organized_citations[priority][keyword] = citation
                            # Remove from fallback since we've placed it in a priority bucket
                            if keyword in organized_citations["fallback_extraction"]:
                                del organized_citations["fallback_extraction"][keyword]
                            break
                
                # Count how many citations we found
                total_citations = sum(len(citations) for citations in organized_citations.values())
                log_debug(f"Fallback method found citations for {total_citations} keywords")
                
                return organized_citations
                
            except Exception as fallback_err:
                print(f"Error in fallback citation method: {str(fallback_err)}")
                log_debug(f"Error in fallback citation method: {str(fallback_err)}")
                
                # Return minimal structure with empty buckets
                return {
                    "high_priority": {},
                    "medium_priority": {},
                    "low_priority": {},
                    "fallback_extraction": {"error": "Failed to extract citations"}
                }
                
    except Exception as e:
        print(f"Error finding keyword citations: {str(e)}")
        log_debug(f"Error finding keyword citations: {str(e)}")
        
        # Return minimal structure with empty buckets
        return {
            "high_priority": {},
            "medium_priority": {},
            "low_priority": {},
            "fallback_extraction": {"error": f"Failed to process citations: {str(e)}"}
        }
