"""
Keyword Service Module

This module handles keyword extraction and citation functionality.
"""

import re
import json
import time
from datetime import datetime
from services.openai_service import get_json_response, get_text_response
from utils.text_processing import sanitize_text, expand_keyword, fuzzy_match, extract_context

def log_debug(message):
    """
    Log a debug message with timestamp.
    
    Args:
        message (str): The message to log
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
    print(f"[DEBUG] [{timestamp}] {message}")

def extract_keywords_only(job_description, job_title=None, company_name=None, industry=None):
    """
    Extract explicit keywords from the job description only, without checking the resume.
    Ranked by priority based on placement, frequency, and context.
    
    Args:
        job_description (str): The job description text
        job_title (str, optional): The job title (optional)
        company_name (str, optional): The company name (optional)
        industry (str, optional): The industry (optional)
        
    Returns:
        tuple: (keywords_data, all_keywords)
    """
    try:
        log_debug("Starting keyword extraction process (job description only)...")
        start_time = time.time()
        
        # Get job title, company name, and industry if provided
        job_title_value = job_title if job_title else ""
        company_name_value = company_name if company_name else ""
        industry_value = industry if industry else ""
        
        log_debug(f"Job Title: {job_title_value}")
        log_debug(f"Company Name: {company_name_value}")
        log_debug(f"Industry: {industry_value}")
        
        # Enhanced instructions for better keyword extraction from all types of job descriptions
        prompt = f"""
        You are an AI assistant specialized in extracting keywords and phrases from job descriptions for Applicant Tracking System (ATS) optimization. Your goal is to identify ALL skills, competencies, qualifications, and important concepts from the ENTIRE job description, including introductory paragraphs, responsibilities, requirements, and any other sections.

        IMPORTANT INSTRUCTIONS:

        1. SCAN THE ENTIRE JOB DESCRIPTION:
           - Process ALL sections including introduction, about the company, responsibilities, requirements, qualifications, etc.
           - Pay special attention to bullet points, which often contain key skills and requirements
           - Don't miss important keywords in paragraph text or section headers

        2. EXTRACT SKILLS AND QUALIFICATIONS:
           - Technical skills (e.g., programming languages, tools, platforms)
           - Soft skills (e.g., communication, leadership, problem-solving)
           - Domain knowledge (e.g., healthcare, finance, marketing)
           - Certifications and education requirements
           - Experience requirements (e.g., years of experience, specific roles)

        3. HANDLE MULTI-WORD PHRASES PROPERLY:
           - Break down compound phrases connected by "and", "or", or commas into separate keywords
           - Example: "Experience leading executive engagements and influencing decision-makers" should become TWO separate keywords:
             * "Experience leading executive engagements"
             * "Influencing decision-makers"
           - Keep phrases concise (2-5 words) while maintaining their meaning
           - Ensure each keyword represents a single, distinct skill or qualification

        4. RANK BY PRIORITY:
           - High priority: Required skills, must-have qualifications, or skills mentioned multiple times
           - Medium priority: Preferred skills, desired qualifications, or skills mentioned in key responsibilities
           - Low priority: Nice-to-have skills, background context, or skills mentioned only once in less critical sections

        5. OUTPUT FORMAT:
           {{
             "high_priority": [
               {{ "keyword": "specific skill or qualification", "score": 0.95 }},
               ...
             ],
             "medium_priority": [
               {{ "keyword": "specific skill or qualification", "score": 0.75 }},
               ...
             ],
             "low_priority": [
               {{ "keyword": "specific skill or qualification", "score": 0.50 }},
               ...
             ]
           }}

        Each keyword should appear only once (no duplicates).
        "score" is a numeric weight between 0.0 and 1.0, reflecting relative importance.
        Ensure the JSON output is valid (no markdown formatting).

        JOB CONTEXT:
        Job Title: {job_title_value if 'job_title_value' in locals() else ''}
        Company: {company_name_value if 'company_name_value' in locals() else ''}
        Industry: {industry_value if 'industry_value' in locals() else ''}
        
        Job Description:
        {job_description}
        """

        messages = [
            {"role": "system", "content": "You are a helpful assistant that extracts exact keywords from job descriptions for ATS."},
            {"role": "user", "content": prompt}
        ]
        
        try:
            log_debug("Calling OpenAI API to extract keywords...")
            api_start_time = time.time()
            
            # Get the JSON response using the existing function
            keywords_data = get_json_response(messages, max_tokens=1000, temperature=0.3)
            
            api_duration = time.time() - api_start_time
            log_debug(f"OpenAI API call completed in {api_duration:.2f} seconds")
            
            # Create a flat list of all keywords from each priority category
            all_keywords = []
            if isinstance(keywords_data, dict):
                for priority_field in ["high_priority", "medium_priority", "low_priority"]:
                    if priority_field in keywords_data:
                        # keywords_data[priority_field] should be a list of objects with "keyword" and "score"
                        for item in keywords_data[priority_field]:
                            if isinstance(item, dict) and "keyword" in item:
                                all_keywords.append(item["keyword"])
            
            # Check if we have a valid structure with keywords
            if not all_keywords or "error" in keywords_data:
                # Instead of falling back to regex extraction, try to extract keywords from the raw response
                log_debug("No keywords found in structured response, attempting to extract from raw response")
                
                # Make another API call with a simpler prompt
                simplified_prompt = f"""
                Extract the most important skills, qualifications, and requirements from this job description.
                Return them as a simple JSON with high_priority, medium_priority, and low_priority arrays.
                Each array should contain objects with 'keyword' and 'score' properties.
                
                Job Description:
                {job_description}
                """
                
                simplified_messages = [
                    {"role": "system", "content": "You are a helpful assistant that extracts keywords from job descriptions."},
                    {"role": "user", "content": simplified_prompt}
                ]
                
                # Try with a different temperature
                retry_keywords_data = get_json_response(simplified_messages, max_tokens=1000, temperature=0.2)
                
                # Check if we got a valid response
                retry_all_keywords = []
                if isinstance(retry_keywords_data, dict):
                    for priority_field in ["high_priority", "medium_priority", "low_priority"]:
                        if priority_field in retry_keywords_data:
                            for item in retry_keywords_data[priority_field]:
                                if isinstance(item, dict) and "keyword" in item:
                                    retry_all_keywords.append(item["keyword"])
                
                if retry_all_keywords:
                    log_debug(f"Successfully extracted {len(retry_all_keywords)} keywords with simplified prompt")
                    keywords_data = retry_keywords_data
                    all_keywords = retry_all_keywords
                else:
                    # Only as a last resort, fall back to regex extraction
                    log_debug("Still no keywords found, falling back to regex extraction as last resort")
                    keywords_data, all_keywords = extract_keywords_regex(job_description)
            
            # Initialize keywords structure if needed
            if "keywords" not in keywords_data:
                keywords_data["keywords"] = {}
                
            for priority in ["high_priority", "medium_priority", "low_priority"]:
                if priority in keywords_data:
                    keywords_data["keywords"][priority] = keywords_data[priority]
            
            # Calculate total processing time
            total_duration = time.time() - start_time
            log_debug(f"Keyword extraction process completed in {total_duration:.2f} seconds")
            
            return keywords_data, all_keywords
            
        except Exception as e:
            print(f"Error in OpenAI keyword extraction: {str(e)}")
            # Fallback to regex-based extraction if OpenAI fails
            return extract_keywords_regex(job_description)
            
    except Exception as e:
        print(f"Error extracting keywords: {str(e)}")
        # Fallback to regex-based extraction if any error occurs
        return extract_keywords_regex(job_description)

def extract_keywords(job_description, master_resume=None, job_title=None, company_name=None, industry=None):
    """
    Extract explicit keywords from the job description, ranked by priority
    based on placement, frequency, and context (e.g., 'required', 'preferred').
    
    Args:
        job_description (str): The job description text
        master_resume (str, optional): The master resume text (optional)
        job_title (str, optional): The job title (optional)
        company_name (str, optional): The company name (optional)
        industry (str, optional): The industry (optional)
        
    Returns:
        tuple: (keywords_data, all_keywords, citations)
    """
    try:
        resume_text = master_resume if master_resume else ""
        citations = {}
        
        log_debug("Starting keyword extraction process...")
        start_time = time.time()
        
        # Get job title, company name, and industry if provided
        job_title_value = job_title if job_title else ""
        company_name_value = company_name if company_name else ""
        industry_value = industry if industry else ""
        
        log_debug(f"Job Title: {job_title_value}")
        log_debug(f"Company Name: {company_name_value}")
        log_debug(f"Industry: {industry_value}")
        
        # Enhanced instructions for better keyword extraction from all types of job descriptions
        prompt = f"""
        You are an AI assistant specialized in extracting keywords and phrases from job descriptions for Applicant Tracking System (ATS) optimization. Your goal is to identify ALL skills, competencies, qualifications, and important concepts from the ENTIRE job description, including introductory paragraphs, responsibilities, requirements, and any other sections.

        IMPORTANT INSTRUCTIONS:

        1. SCAN THE ENTIRE JOB DESCRIPTION:
           - Process ALL sections including introduction, about the company, responsibilities, requirements, qualifications, etc.
           - Pay special attention to bullet points, which often contain key skills and requirements
           - Don't miss important keywords in paragraph text or section headers

        2. EXTRACT SKILLS AND QUALIFICATIONS:
           - Technical skills (e.g., programming languages, tools, platforms)
           - Soft skills (e.g., communication, leadership, problem-solving)
           - Domain knowledge (e.g., healthcare, finance, marketing)
           - Certifications and education requirements
           - Experience requirements (e.g., years of experience, specific roles)

        3. HANDLE MULTI-WORD PHRASES PROPERLY:
           - Break down compound phrases connected by "and", "or", or commas into separate keywords
           - Example: "Experience leading executive engagements and influencing decision-makers" should become TWO separate keywords:
             * "Experience leading executive engagements"
             * "Influencing decision-makers"
           - Keep phrases concise (2-5 words) while maintaining their meaning
           - Ensure each keyword represents a single, distinct skill or qualification

        4. RANK BY PRIORITY:
           - High priority: Required skills, must-have qualifications, or skills mentioned multiple times
           - Medium priority: Preferred skills, desired qualifications, or skills mentioned in key responsibilities
           - Low priority: Nice-to-have skills, background context, or skills mentioned only once in less critical sections

        5. OUTPUT FORMAT:
           {{
             "high_priority": [
               {{ "keyword": "specific skill or qualification", "score": 0.95 }},
               ...
             ],
             "medium_priority": [
               {{ "keyword": "specific skill or qualification", "score": 0.75 }},
               ...
             ],
             "low_priority": [
               {{ "keyword": "specific skill or qualification", "score": 0.50 }},
               ...
             ]
           }}

        Each keyword should appear only once (no duplicates).
        "score" is a numeric weight between 0.0 and 1.0, reflecting relative importance.
        Ensure the JSON output is valid (no markdown formatting).

        JOB CONTEXT:
        Job Title: {job_title_value if 'job_title_value' in locals() else ''}
        Company: {company_name_value if 'company_name_value' in locals() else ''}
        Industry: {industry_value if 'industry_value' in locals() else ''}
        
        Job Description:
        {job_description}

        Resume Text (optional):
        {resume_text}
        """

        messages = [
            {"role": "system", "content": "You are a helpful assistant that extracts exact keywords from job descriptions for ATS."},
            {"role": "user", "content": prompt}
        ]
        
        try:
            log_debug("Calling OpenAI API to extract keywords...")
            api_start_time = time.time()
            
            # Get the JSON response using the existing function
            keywords_data = get_json_response(messages, max_tokens=1000, temperature=0.3)
            
            api_duration = time.time() - api_start_time
            log_debug(f"OpenAI API call completed in {api_duration:.2f} seconds")
            
            # Create a flat list of all keywords from each priority category
            all_keywords = []
            if isinstance(keywords_data, dict):
                for priority_field in ["high_priority", "medium_priority", "low_priority"]:
                    if priority_field in keywords_data:
                        # keywords_data[priority_field] should be a list of objects with "keyword" and "score"
                        for item in keywords_data[priority_field]:
                            if isinstance(item, dict) and "keyword" in item:
                                all_keywords.append(item["keyword"])
            
            # Check if we have a valid structure with keywords
            if not all_keywords or "error" in keywords_data:
                # Instead of falling back to regex extraction, try to extract keywords from the raw response
                log_debug("No keywords found in structured response, attempting to extract from raw response")
                
                # Make another API call with a simpler prompt
                simplified_prompt = f"""
                Extract the most important skills, qualifications, and requirements from this job description.
                Return them as a simple JSON with high_priority, medium_priority, and low_priority arrays.
                Each array should contain objects with 'keyword' and 'score' properties.
                
                Job Description:
                {job_description}
                """
                
                simplified_messages = [
                    {"role": "system", "content": "You are a helpful assistant that extracts keywords from job descriptions."},
                    {"role": "user", "content": simplified_prompt}
                ]
                
                # Try with a different temperature
                retry_keywords_data = get_json_response(simplified_messages, max_tokens=1000, temperature=0.2)
                
                # Check if we got a valid response
                retry_all_keywords = []
                if isinstance(retry_keywords_data, dict):
                    for priority_field in ["high_priority", "medium_priority", "low_priority"]:
                        if priority_field in retry_keywords_data:
                            for item in retry_keywords_data[priority_field]:
                                if isinstance(item, dict) and "keyword" in item:
                                    retry_all_keywords.append(item["keyword"])
                
                if retry_all_keywords:
                    log_debug(f"Successfully extracted {len(retry_all_keywords)} keywords with simplified prompt")
                    keywords_data = retry_keywords_data
                    all_keywords = retry_all_keywords
                else:
                    # Only as a last resort, fall back to regex extraction
                    log_debug("Still no keywords found, falling back to regex extraction as last resort")
                    keywords_data, all_keywords = extract_keywords_regex(job_description)
            
            # If we have a master resume, find citations for the keywords
            if resume_text and all_keywords:
                log_debug(f"Finding citations for {len(all_keywords)} keywords in resume...")
                citations_start_time = time.time()
                
                citations = find_keyword_citations(all_keywords, resume_text)
                
                citations_duration = time.time() - citations_start_time
                log_debug(f"Citation finding completed in {citations_duration:.2f} seconds")
                log_debug(f"Found citations for {len(citations)} keywords out of {len(all_keywords)}")
                
                # Create a new structure for missing keywords by priority
                missing_keywords_by_priority = {
                    "high_priority": [],
                    "medium_priority": [],
                    "low_priority": []
                }
                
                # Check each keyword in each priority category
                if isinstance(keywords_data, dict):
                    for priority_field in ["high_priority", "medium_priority", "low_priority"]:
                        if priority_field in keywords_data:
                            missing_count = 0
                            for item in keywords_data[priority_field]:
                                if isinstance(item, dict) and "keyword" in item:
                                    kw = item["keyword"]
                                    # Check if the keyword is missing from citations
                                    if kw not in citations:
                                        # Add priority information to the item
                                        item_with_priority = item.copy()
                                        item_with_priority["priority"] = priority_field.split("_")[0]  # Extract 'high', 'medium', 'low'
                                        missing_keywords_by_priority[priority_field].append(item_with_priority)
                                        missing_count += 1
                                        log_debug(f"Added missing keyword '{kw}' to {priority_field}")
                            
                            log_debug(f"Found {missing_count} missing keywords in {priority_field} category")
                
                # Add the missing keywords structure to the keywords_data
                keywords_data["missing_keywords_by_priority"] = missing_keywords_by_priority
                
                # Create a flat list of missing keywords with priority information
                missing_keywords = []
                for priority, items in missing_keywords_by_priority.items():
                    for item in items:
                        if isinstance(item, dict) and "keyword" in item:
                            missing_keywords.append(item)
                
                keywords_data["missing_keywords"] = missing_keywords
                
                log_debug(f"Missing keywords by priority: high={len(missing_keywords_by_priority['high_priority'])}, " +
                         f"medium={len(missing_keywords_by_priority['medium_priority'])}, " +
                         f"low={len(missing_keywords_by_priority['low_priority'])}")
                log_debug(f"Total missing keywords: {len(keywords_data['missing_keywords'])}")
            
            # Calculate total processing time
            total_duration = time.time() - start_time
            log_debug(f"Keyword extraction process completed in {total_duration:.2f} seconds")
            
            return keywords_data, all_keywords, citations
            
        except Exception as e:
            print(f"Error in OpenAI keyword extraction: {str(e)}")
            # Fallback to regex-based extraction if OpenAI fails
            return extract_keywords_regex(job_description)
            
    except Exception as e:
        print(f"Error extracting keywords: {str(e)}")
        # Fallback to regex-based extraction if any error occurs
        return extract_keywords_regex(job_description)

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

def find_keywords_in_resume(keywords, resume_text, job_title=None, company_name=None, industry=None):
    """
    Find keywords in the resume and highlight them.
    
    Args:
        keywords (list): List of keywords to find in the resume
        resume_text (str): The resume text to search in
        job_title (str, optional): The job title (optional)
        company_name (str, optional): The company name (optional)
        industry (str, optional): The industry (optional)
        
    Returns:
        tuple: (found_keywords, highlighted_resume) - Dictionary of found keywords and highlighted resume text
    """
    try:
        log_debug(f"Finding keywords in resume...")
        start_time = time.time()
        
        # Clean and sanitize inputs to prevent JSON parsing issues
        sanitized_keywords = []
        
        for keyword in keywords:
            # Replace any characters that might cause issues in JSON
            sanitized_keyword = sanitize_text(keyword)
            sanitized_keywords.append(sanitized_keyword)
        
        # Sanitize resume text
        sanitized_resume = sanitize_text(resume_text)
        
        # Prepare the prompt for OpenAI with improved instructions for better matching
        prompt = f"""
        I have a list of keywords and a resume. I need you to find which keywords appear in the resume.
        
        IMPORTANT INSTRUCTIONS:
        1. Thoroughly scan the ENTIRE resume, including ALL sections.
        2. For each keyword, determine if it appears in the resume (exact match or semantic equivalent).
        3. Use your semantic understanding to identify matches based on meaning, not just exact words:
           - Look for semantic equivalents (e.g., "Customer" and "Client" are semantically equivalent)
           - Identify conceptual matches (e.g., "Data Analytics" might be evidenced by "metrics tracking")
        4. Be strict about requiring genuine evidence. DO NOT force matches that aren't genuinely there.
        
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
            
            # Count how many keywords were found
            found_count = sum(1 for value in found_keywords.values() if value)
            log_debug(f"Found {found_count} keywords out of {len(keywords)} in resume")
            
            # Now highlight the keywords in the resume
            highlighted_resume = highlight_keywords_in_resume(resume_text, found_keywords)
            
            return found_keywords, highlighted_resume
            
        except Exception as api_err:
            print(f"API error in finding keywords: {str(api_err)}")
            # Fall back to a simpler method
            return fallback_find_keywords_in_resume(keywords, resume_text)
            
    except Exception as e:
        print(f"Error finding keywords in resume: {str(e)}")
        # Return empty dict if there's an error
        return {}, resume_text

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
    
    for keyword in keywords:
        # Check if the keyword exists in the resume (case-insensitive)
        found_keywords[keyword] = keyword.lower() in resume_lower
    
    # Highlight the keywords in the resume
    highlighted_resume = highlight_keywords_in_resume(resume_text, found_keywords)
    
    return found_keywords, highlighted_resume

def highlight_keywords_in_resume(resume_text, found_keywords):
    """
    Highlight keywords in the resume text.
    
    Args:
        resume_text (str): The resume text to highlight
        found_keywords (dict): Dictionary mapping keywords to boolean (found or not)
        
    Returns:
        str: The resume text with keywords highlighted using HTML mark tags
    """
    # Create a copy of the resume text to work with
    highlighted_text = resume_text
    
    # Replace newlines with <br> tags for proper HTML display
    highlighted_text = highlighted_text.replace('\n', '<br>')
    
    # Highlight each found keyword
    for keyword, found in found_keywords.items():
        if found:
            # Escape the keyword for regex
            escaped_keyword = re.escape(keyword)
            
            # Use word boundaries to match whole words only, with case insensitivity
            pattern = re.compile(r'\b' + escaped_keyword + r'\b', re.IGNORECASE)
            
            # Replace with marked version
            replacement = f'<mark class="keyword-highlight">{keyword}</mark>'
            highlighted_text = pattern.sub(replacement, highlighted_text)
    
    return highlighted_text

def find_keyword_citations(keywords, resume_text):
    """
    Find citations in the resume for each keyword with improved matching.
    
    Args:
        keywords (list): List of keywords to find citations for
        resume_text (str): The resume text to search in
        
    Returns:
        dict: Dictionary mapping keywords to citations
    """
    try:
        log_debug(f"Finding citations for {len(keywords)} keywords...")
        start_time = time.time()
        # Clean and sanitize inputs to prevent JSON parsing issues
        sanitized_keywords = []
        
        for keyword in keywords:
            # Replace any characters that might cause issues in JSON
            sanitized_keyword = sanitize_text(keyword)
            sanitized_keywords.append(sanitized_keyword)
        
        # Sanitize resume text - more aggressive cleaning
        sanitized_resume = sanitize_text(resume_text)
        
        # Prepare the prompt for OpenAI with improved instructions for better matching
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
        
        7. Your response MUST be a valid JSON object where:
           - Each key is one of the keywords
           - Each value is a brief excerpt from the resume (1-2 sentences) that provides evidence for this keyword
        
        8. Only include keywords that have clear supporting evidence in the resume. DO NOT force matches that aren't genuinely there. If a keyword doesn't have supporting evidence, omit it from the response.
        
        9. Be especially careful with technical or domain-specific terms (like "Audiovisual Content" or "Generative Media") - only include these if there is explicit evidence in the resume.
        
        Keywords:
        {', '.join(sanitized_keywords)}
        
        Resume:
        {sanitized_resume}
        """
        
        # First attempt with JSON response format
        try:
            log_debug("Calling OpenAI API to find citations (JSON format)...")
            api_start_time = time.time()
            
            messages = [
                {"role": "system", "content": "You are a helpful assistant that finds evidence in resumes and returns valid JSON. You are strict about only including keywords with genuine matches and omitting those without clear evidence."},
                {"role": "user", "content": prompt}
            ]
            
            # Get the JSON response
            citations_data = get_json_response(messages, max_tokens=800, temperature=0.3)  # Slightly less conservative matching
            
            api_duration = time.time() - api_start_time
            log_debug(f"OpenAI API call for citations completed in {api_duration:.2f} seconds")
            log_debug(f"Found citations for {len(citations_data)} keywords out of {len(keywords)}")
            
            # Log a sample of the citations for debugging
            if citations_data:
                sample_keys = list(citations_data.keys())[:3]  # Get up to 3 keys
                for key in sample_keys:
                    log_debug(f"Sample citation - '{key}': '{citations_data[key][:50]}...'")
            
            return citations_data
            
        except json.JSONDecodeError as json_err:
            print(f"JSON parsing error: {str(json_err)}")
            # Continue to fallback method
            
        except Exception as api_err:
            print(f"API error in first attempt: {str(api_err)}")
            # Continue to fallback method
        
        # Fallback: Try again with a simpler approach and more explicit instructions
        log_debug("JSON parsing failed, trying fallback method with text response...")
        fallback_start_time = time.time()
        
        fallback_prompt = f"""
        I have a list of keywords and a resume. Find evidence for each keyword.
        
        For each keyword, provide a brief excerpt from the resume that demonstrates this skill.
        
        IMPORTANT:
        1. Scan the ENTIRE resume - work experience, projects, hackathons, education, etc.
        2. Use your semantic understanding to find matches based on meaning
        3. Be strict - only include keywords with genuine evidence
        4. DO NOT force matches that aren't genuinely there
        5. Be especially careful with technical terms like "Audiovisual Content" - only include if explicitly mentioned
        
        Format your response as a simple list:
        
        Keyword 1: Evidence for keyword 1
        Keyword 2: Evidence for keyword 2
        
        Only include keywords with clear evidence.
        
        Keywords:
        {', '.join(sanitized_keywords)}
        
        Resume (excerpt):
        {sanitized_resume[:4000]}
        """
        
        try:
            messages = [
                {"role": "system", "content": "You are a helpful assistant that finds evidence in resumes."},
                {"role": "user", "content": fallback_prompt}
            ]
            
            # Get the text response
            log_debug("Calling OpenAI API for fallback citation method...")
            fallback_api_start = time.time()
            
            fallback_content = get_text_response(messages, max_tokens=800, temperature=0.3)
            
            fallback_api_duration = time.time() - fallback_api_start
            log_debug(f"Fallback API call completed in {fallback_api_duration:.2f} seconds")
            
            # Convert the text response to a dictionary
            fallback_citations = {}
            for line in fallback_content.split('\n'):
                if ':' in line:
                    parts = line.split(':', 1)
                    if len(parts) == 2:
                        key = parts[0].strip()
                        value = parts[1].strip()
                        fallback_citations[key] = value
            
            fallback_duration = time.time() - fallback_start_time
            log_debug(f"Fallback method completed in {fallback_duration:.2f} seconds")
            log_debug(f"Fallback method found citations for {len(fallback_citations)} keywords")
            
            # Log a sample of the fallback citations
            if fallback_citations:
                sample_keys = list(fallback_citations.keys())[:3]  # Get up to 3 keys
                for key in sample_keys:
                    log_debug(f"Sample fallback citation - '{key}': '{fallback_citations[key][:50]}...'")
            
            # Return the fallback citations - no more manual matching
            return fallback_citations
            
        except Exception as fallback_err:
            print(f"Error in fallback citation method: {str(fallback_err)}")
            # Return empty dict if there's an error
            return {}
            
    except Exception as e:
        print(f"Error finding keyword citations: {str(e)}")
        # Return empty dict if there's an error
        return {}


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
        keywords_data, keywords = extract_keywords_regex(job_description)
        return mark_keywords_regex(profile_text, keywords)

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
        # Use word boundaries to match whole words only
        pattern = re.compile(r'\b' + re.escape(keyword) + r'\b', re.IGNORECASE)
        marked_text = pattern.sub(f'<mark>{keyword}</mark>', marked_text)
    
    return marked_text
