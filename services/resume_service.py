"""
Resume Service Module

This module handles career profile and competencies generation.
"""

import json
from services.openai_service import get_json_response, get_text_response
from services.keyword_service import extract_keywords, highlight_keywords
from utils.text_processing import sanitize_text

def generate_career_profile(job_description, master_resume, keywords=None, existing_citations=None, job_title=None, company_name=None, industry=None, keywords_data=None):
    """
    Generate a tailored career profile based on job description and master resume.
    
    Args:
        job_description (str): The job description text
        master_resume (str): The master resume text
        keywords (list, optional): List of keywords to include in the profile
        existing_citations (dict, optional): Existing citations from keyword extraction
        job_title (str, optional): The job title
        company_name (str, optional): The company name
        industry (str, optional): The industry
        keywords_data (dict, optional): Structured keywords data with priorities
        
    Returns:
        tuple: (profile, marked_profile, keywords, citations) - The generated profile,
               the profile with keywords highlighted, the keywords used, and citations
    """
    try:
        # Extract keywords if not provided
        if not keywords:
            _, keywords, _ = extract_keywords(job_description, master_resume, job_title, company_name)
        
        # Process structured keywords data if provided
        prioritized_keywords = []
        if keywords_data:
            # Extract keywords from the structured data
            for priority in ['high_priority', 'medium_priority', 'low_priority']:
                if priority in keywords_data:
                    for item in keywords_data[priority]:
                        if isinstance(item, dict) and 'keyword' in item:
                            # Check if this is a user-added keyword
                            if 'user_added' in item and item['user_added']:
                                # Prioritize user-added keywords
                                prioritized_keywords.append(item['keyword'])
                            else:
                                # Add regular extracted keywords
                                prioritized_keywords.append(item['keyword'])
                        elif isinstance(item, str):
                            prioritized_keywords.append(item)
            
            # If we have prioritized keywords, use them
            if prioritized_keywords:
                print(f"Using {len(prioritized_keywords)} prioritized keywords for career profile generation")
                keywords = prioritized_keywords + [k for k in keywords if k not in prioritized_keywords]
        
        # Get job title, company name, and industry if provided
        job_title_value = job_title if job_title else "the position"
        company_name_value = company_name if company_name else "the company"
        industry_value = industry if industry else ""
        
        # Prepare the prompt for OpenAI with improved instructions
        prompt = f"""You are a resume-writing assistant specialized in crafting highly targeted, concise career profiles. 
Your task is to clearly demonstrate in one sentence why the candidate is the ideal match for the specific "{job_title_value}" role without summarizing the entire career.
This concise sentence should follow the structured format:

Who you are.

Your relevant experience (focus on competencies, not specific technical skills).

Which industries you've got experience in.

JOB CONTEXT:
- Job Title: {job_title_value}
- Company: {company_name_value}
- Industry: {industry_value}

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

2. Look for the STRONGEST and most relevant competencies from ANY part of the resume that match the job description, 
   with special attention to those that align with the "{job_title_value}" role.

3. If multiple instances of a competency exist across different jobs/experiences, choose the strongest examples
   that best demonstrate the depth of experience, regardless of how recent they are.

4. Look beyond job titles and formal roles - evidence can be found in project descriptions, achievements, or hackathon participation.

5. DO NOT include phrases like "aligning with the job description" or "matching the requirements" in your output.

6. DO NOT mention the company name from the job description in your output.

7. DO NOT reference the job description itself in any way in your output.

8. The career profile should stand on its own as a professional statement without any meta-references.

9. Focus on competencies (e.g., "executive communication", "team leadership", "strategic planning") rather than specific technical skills or tools (e.g., "Outlook", "Python", "AWS").

10. Highlight broader capabilities that demonstrate value, not the specific technologies used to deliver that value.

11. Tailor the seniority level in your profile to match the seniority of the "{job_title_value}" role.

12. If the company name suggests a specific industry (e.g., healthcare, finance, tech), emphasize relevant experience in that industry.

Example of a good career profile:
Senior technology leader with demonstrated expertise in digital transformation, strategic planning, and building high-performing teams in the financial services and healthcare sectors.

Example of what NOT to include:
"Senior developer with expertise in Python, AWS, and React" (too focused on specific technologies)
"...aligning with the key requirements specified in the job description" (references the job description)
"...matching perfectly with [Company Name]'s needs" (mentions company name)

Job Description:
{job_description}

Master Resume:
{master_resume}

Generate a concise career profile for the "{job_title_value}" role:"""

        # Call OpenAI API
        messages = [
            {"role": "system", "content": "You are a professional resume writer specializing in concise career profiles."},
            {"role": "user", "content": prompt}
        ]
        
        # Get the text response
        profile = get_text_response(messages, max_tokens=150, temperature=0.7)
        
        # Get the marked up profile with highlighted keywords
        marked_profile = highlight_keywords(profile, job_description)
        
        # Use existing citations if provided, otherwise find new ones
        if existing_citations:
            print("Using existing citations for career profile")
            citations = existing_citations
        else:
            print("Finding new citations for career profile")
            citations = find_profile_citations(profile, master_resume, job_title, company_name, industry)
        
        return profile, marked_profile, keywords[:20], citations
    
    except Exception as e:
        print(f"Error generating career profile: {str(e)}")
        raise

def find_profile_citations(profile, master_resume, job_title=None, company_name=None, industry=None):
    """
    Find citations in the master resume for keywords in the career profile.
    
    Args:
        profile (str): The career profile text
        master_resume (str): The master resume text
        job_title (str, optional): The job title
        company_name (str, optional): The company name
        industry (str, optional): The industry
        
    Returns:
        dict: Dictionary mapping competencies to citations
    """
    try:
        print("Finding citations for career profile...")
        # Sanitize inputs
        sanitized_profile = sanitize_text(profile)
        sanitized_resume = sanitize_text(master_resume)
        
        # Get job title, company name, and industry if provided
        job_title_value = job_title if job_title else "the position"
        company_name_value = company_name if company_name else "the company"
        industry_value = industry if industry else ""
        
        # Prepare the prompt for OpenAI with improved instructions
        prompt = f"""
        I have a career profile for a "{job_title_value}" role at {company_name_value} and a master resume. I need you to thoroughly scan the ENTIRE resume to identify where the competencies and keywords 
        mentioned in the career profile are supported by evidence in the master resume.
        
        JOB CONTEXT:
        - Job Title: {job_title_value}
        - Company: {company_name_value}
        - Industry: {industry_value}
        
        IMPORTANT INSTRUCTIONS:
        1. Scan the ENTIRE resume, including ALL sections:
           - Work experience
           - Projects
           - Hackathons
           - Volunteer work
           - Education
           - Certifications
           - Skills sections
           - Any other non-standard sections
        
        2. For each key competency or keyword in the career profile, find the STRONGEST and most relevant evidence 
           from ANY part of the resume that demonstrates this skill or competency.
        
        3. If multiple instances of a competency exist across different jobs/experiences, choose the strongest example
           that best demonstrates the depth of experience, regardless of how recent it is.
        
        4. Look beyond job titles and formal roles - evidence can be found in project descriptions, achievements, or hackathon participation.
        
        5. Use your semantic understanding to identify matches based on meaning, not just exact words:
           - Look for semantic equivalents (e.g., "Customer" and "Client" are semantically equivalent)
           - Identify conceptual matches (e.g., "Data Analytics" might be evidenced by "metrics tracking" or "performance analysis")
           - Recognize when different terminology is used for the same concept
        
        6. For compound phrases, look for evidence where the components appear in proximity or where the concept is described using different words.
           - Example: For "Enterprise Customer Management", look for evidence of managing relationships with large corporate clients
           - Example: For "Customer Health Monitoring", look for evidence of tracking client satisfaction or analyzing customer metrics
        
        7. Be strict about requiring genuine evidence. DO NOT force matches that aren't genuinely there. Only include competencies with clear supporting evidence.
        
        Return a JSON object where:
        - Each key is a competency or keyword from the career profile
        - Each value is a brief excerpt from the master resume (1-2 sentences) that provides the strongest evidence for this competency
        
        Focus on the most important 3-5 competencies only. Do not include generic skills that are not specifically evidenced.
        
        Career Profile:
        {sanitized_profile}
        
        Master Resume:
        {sanitized_resume}
        """
        
        # Call OpenAI API
        messages = [
            {"role": "system", "content": "You are a helpful assistant that finds evidence in resumes."},
            {"role": "user", "content": prompt}
        ]
        
        # Get the JSON response
        try:
            citations_data = get_json_response(messages, max_tokens=800, temperature=0.3)
            return citations_data
        except Exception as e:
            print(f"Error getting JSON response for citations: {str(e)}")
            return {}
    
    except Exception as e:
        print(f"Error finding profile citations: {str(e)}")
        return {}

def generate_core_competencies(job_description, master_resume, keywords=None, existing_citations=None, job_title=None, company_name=None, industry=None, keywords_data=None):
    """
    Generate core competencies based on job description and master resume.
    
    Args:
        job_description (str): The job description text
        master_resume (str): The master resume text
        keywords (list, optional): List of keywords to consider
        existing_citations (dict, optional): Existing citations from keyword extraction
        job_title (str, optional): The job title
        company_name (str, optional): The company name
        industry (str, optional): The industry
        keywords_data (dict, optional): Structured keywords data with priorities
        
    Returns:
        tuple: (competencies, keywords, citations) - The generated competencies,
               the keywords used, and citations for the competencies
    """
    try:
        # Extract keywords if not provided
        if not keywords:
            _, keywords, _ = extract_keywords(job_description, master_resume, job_title, company_name)
        
        # Process structured keywords data if provided
        prioritized_keywords = []
        if keywords_data:
            # Extract keywords from the structured data
            for priority in ['high_priority', 'medium_priority', 'low_priority']:
                if priority in keywords_data:
                    for item in keywords_data[priority]:
                        if isinstance(item, dict) and 'keyword' in item:
                            # Check if this is a user-added keyword
                            if 'user_added' in item and item['user_added']:
                                # Prioritize user-added keywords
                                prioritized_keywords.append(item['keyword'])
                            else:
                                # Add regular extracted keywords
                                prioritized_keywords.append(item['keyword'])
                        elif isinstance(item, str):
                            prioritized_keywords.append(item)
            
            # If we have prioritized keywords, use them
            if prioritized_keywords:
                print(f"Using {len(prioritized_keywords)} prioritized keywords for core competencies generation")
                keywords = prioritized_keywords + [k for k in keywords if k not in prioritized_keywords]
        
        # Get job title, company name, and industry if provided
        job_title_value = job_title if job_title else "the position"
        company_name_value = company_name if company_name else "the company"
        industry_value = industry if industry else ""
        
        # Prepare the prompt for OpenAI with improved instructions
        prompt = f"""You are a resume-writing assistant specialized in identifying core competencies that match a job description and are supported by a candidate's resume.

Your task is to extract up to 15 core competencies from the job description that are also evident in the candidate's resume, with special focus on those most relevant for the "{job_title_value}" role at {company_name_value}. Format these as a comma-separated list.

JOB CONTEXT:
- Job Title: {job_title_value}
- Company: {company_name_value}
- Industry: {industry_value}

IMPORTANT INSTRUCTIONS:
1. Focus on broader competencies (e.g., "Strategic Planning", "Team Leadership", "Process Optimization") rather than specific technical skills or tools.

2. Do NOT include technical skills (computer software, technical certifications, etc.) - these belong in a skills section.

3. For example, "Software Development" would be a competency, while "Python" would be a skill (so include Software Development, not Python).

4. Thoroughly scan the ENTIRE resume, including ALL sections:
   - Work experience
   - Projects
   - Hackathons
   - Volunteer work
   - Education
   - Certifications
   - Skills sections
   - Any other non-standard sections

5. Look beyond job titles and formal roles - evidence can be found in project descriptions, achievements, or hackathon participation.

6. Only include competencies that are both mentioned in the job description AND supported by evidence in the resume.

7. Include as many relevant competencies as possible, up to 15, as long as they are truly relevant to both the job description and resume.

8. Format the output as a simple comma-separated list (e.g., "Strategic Planning, Team Leadership, Process Optimization, Budget Management").

9. Each competency should be capitalized and separated by a comma and space.

10. Prioritize competencies that are most relevant to the "{job_title_value}" role, considering the seniority level and responsibilities typically associated with this position.

11. If the company name suggests a specific industry (e.g., healthcare, finance, tech), prioritize competencies that are particularly valuable in that industry.

12. Consider the company size and type when selecting competencies (e.g., startup vs. enterprise, B2B vs. B2C).

Job Description:
{job_description}

Master Resume:
{master_resume}

Generate a comma-separated list of up to 15 core competencies specifically tailored for the "{job_title_value}" role at {company_name_value}:"""

        # Call OpenAI API
        messages = [
            {"role": "system", "content": "You are a professional resume writer specializing in identifying core competencies."},
            {"role": "user", "content": prompt}
        ]
        
        # Get the text response
        competencies = get_text_response(messages, max_tokens=150, temperature=0.7)
        
        # Use existing citations if provided, otherwise find new ones
        if existing_citations:
            print("Using existing citations for core competencies")
            citations = existing_citations
        else:
            print("Finding new citations for core competencies")
            citations = find_competencies_citations(competencies, master_resume, job_title, company_name, industry)
        
        return competencies, keywords[:15], citations
    
    except Exception as e:
        print(f"Error generating core competencies: {str(e)}")
        raise

def find_competencies_citations(competencies, master_resume, job_title=None, company_name=None, industry=None):
    """
    Find citations in the master resume for the competencies.
    
    Args:
        competencies (str): The competencies as a comma-separated list
        master_resume (str): The master resume text
        job_title (str, optional): The job title
        company_name (str, optional): The company name
        industry (str, optional): The industry
        
    Returns:
        dict: Dictionary mapping competencies to citations
    """
    try:
        print("Finding citations for competencies...")
        # Sanitize inputs
        sanitized_competencies = sanitize_text(competencies)
        sanitized_resume = sanitize_text(master_resume)
        
        # Get job title, company name, and industry if provided
        job_title_value = job_title if job_title else "the position"
        company_name_value = company_name if company_name else "the company"
        industry_value = industry if industry else ""
        
        # Prepare the prompt for OpenAI with improved instructions
        prompt = f"""
        I have a list of core competencies for a "{job_title_value}" role at {company_name_value} and a master resume. I need you to thoroughly scan the ENTIRE resume to identify where each competency 
        is supported by evidence in the master resume.
        
        JOB CONTEXT:
        - Job Title: {job_title_value}
        - Company: {company_name_value}
        - Industry: {industry_value}
        
        IMPORTANT INSTRUCTIONS:
        1. Scan the ENTIRE resume, including ALL sections:
           - Work experience
           - Projects
           - Hackathons
           - Volunteer work
           - Education
           - Certifications
           - Skills sections
           - Any other non-standard sections
        
        2. For each competency, find the STRONGEST and most relevant evidence 
           from ANY part of the resume that demonstrates this skill or competency.
        
        3. If multiple instances of a competency exist across different jobs/experiences, choose the strongest example
           that best demonstrates the depth of experience, regardless of how recent it is.
        
        4. Look beyond job titles and formal roles - evidence can be found in project descriptions, achievements, or hackathon participation.
        
        5. Use your semantic understanding to identify matches based on meaning, not just exact words:
           - Look for semantic equivalents (e.g., "Customer" and "Client" are semantically equivalent)
           - Identify conceptual matches (e.g., "Data Analytics" might be evidenced by "metrics tracking" or "performance analysis")
           - Recognize when different terminology is used for the same concept
        
        6. For compound phrases, look for evidence where the components appear in proximity or where the concept is described using different words.
           - Example: For "Strategic Planning", look for evidence of developing long-term strategies or roadmaps
           - Example: For "Cross-functional Collaboration", look for evidence of working across departments or teams
        
        7. Be strict about requiring genuine evidence. DO NOT force matches that aren't genuinely there. Only include competencies with clear supporting evidence.
        
        Return a JSON object where:
        - Each key is one of the competencies
        - Each value is a brief excerpt from the master resume (1-2 sentences) that provides the strongest evidence for this competency
        
        Core Competencies:
        {sanitized_competencies}
        
        Master Resume:
        {sanitized_resume}
        """
        
        # Call OpenAI API
        messages = [
            {"role": "system", "content": "You are a helpful assistant that finds evidence in resumes."},
            {"role": "user", "content": prompt}
        ]
        
        # Get the JSON response
        try:
            citations_data = get_json_response(messages, max_tokens=800, temperature=0.3)
            return citations_data
        except Exception as e:
            print(f"Error getting JSON response for competencies citations: {str(e)}")
            return {}
    
    except Exception as e:
        print(f"Error finding competencies citations: {str(e)}")
        return {}
