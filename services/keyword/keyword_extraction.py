"""
Keyword Extraction Module

This module handles extracting keywords from job descriptions.
"""

import time
from services.openai_service import get_json_response
from services.keyword.keyword_utils import log_debug, extract_keywords_regex

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
        Job Title: {job_title_value}
        Company: {company_name_value}
        Industry: {industry_value}
        
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
        Job Title: {job_title_value}
        Company: {company_name_value}
        Industry: {industry_value}
        
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
                
                # Import here to avoid circular imports
                from services.keyword.keyword_matching import find_keyword_citations
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
            
            # Attach the original keywords structure to the all_keywords list for reference
            # This will help preserve priority information when passing to other functions
            if isinstance(all_keywords, list) and len(all_keywords) > 0:
                all_keywords.original_keywords = keywords_data
                log_debug("Attached original keywords structure to all_keywords list")
            
            return keywords_data, all_keywords, citations
            
        except Exception as e:
            print(f"Error in OpenAI keyword extraction: {str(e)}")
            # Fallback to regex-based extraction if OpenAI fails
            return extract_keywords_regex(job_description)
            
    except Exception as e:
        print(f"Error extracting keywords: {str(e)}")
        # Fallback to regex-based extraction if any error occurs
        return extract_keywords_regex(job_description)
