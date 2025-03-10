# OpenAI Prompts Used in dumped2hire

This document contains all the OpenAI prompts used in the dumped2hire application, organized by function.

## Keyword Extraction Prompt

**File:** `services/keyword_service.py`  
**Function:** `extract_keywords()`  
**Purpose:** Extracts important keywords from a job description with prioritization

```
I have a job description, and I need you to extract relevant keywords and phrases that are critical for creating a tailored career profile.

IMPORTANT:
1. Identify explicit keywords and phrases from the job description (e.g., "Customer Success", "Product Adoption").
2. Include synonyms, semantically related terms, and implied concepts (e.g., "stakeholder management" matches "relationship building"; "data-driven decision-making" matches "analytics").
3. Prioritize broader competencies (e.g., "strategic planning", "cross-functional coordination") over specific tools or technologies unless explicitly emphasized.
4. Rank keywords by importance based on:
   - Placement in the job description:
     - High Priority: Keywords found in sections like "Responsibilities" or "What You'll Do," especially those listed at the beginning.
     - Medium Priority: Keywords from sections like "About Us" or "Preferred Qualifications."
   - Frequency within the job description.
   - Relevance to core competencies for this role.
5. Identify any critical keywords from the job description that do not appear in the provided resume text.
6. Flag high-priority keywords that are central to primary responsibilities or outcomes.
7. Group keywords into thematic clusters based on related skills or competency areas.
8. Be thorough in identifying both explicit and implicit requirements.
9. Look for compound phrases that represent key competencies (e.g., "Enterprise Customer Management").

Return a JSON object with the following structure:
{
    "keywords": {
        "high_priority": ["keyword1", "keyword2", ...],
        "medium_priority": ["keyword3", "keyword4", ...],
        "low_priority": ["keyword5", "keyword6", ...]
    },
    "missing_keywords": ["missing1", "missing2", ...],
    "clusters": {
        "Theme Name 1": ["related1", "related2", ...],
        "Theme Name 2": ["related3", "related4", ...],
        ...
    }
}

Job Description:
{job_description}

Resume Text:
{resume_text}
```

## Keyword Citation Finding Prompt

**File:** `services/keyword_service.py`  
**Function:** `find_keyword_citations()`  
**Purpose:** Finds evidence in the resume for each extracted keyword

```
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
{keywords}

Resume:
{resume_text}
```

### Fallback Citation Finding Prompt

**File:** `services/keyword_service.py`  
**Function:** `find_keyword_citations()` (fallback method)  
**Purpose:** Alternative approach if JSON parsing fails

```
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
{keywords}

Resume (excerpt):
{resume_text_excerpt}
```

## Keyword Highlighting Prompt

**File:** `services/keyword_service.py`  
**Function:** `highlight_keywords()`  
**Purpose:** Highlights keywords from the job description in the profile text

```
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
```

## Career Profile Generation Prompt

**File:** `services/resume_service.py`  
**Function:** `generate_career_profile()`  
**Purpose:** Generates a tailored career profile based on job description and resume

```
You are a resume-writing assistant specialized in crafting highly targeted, concise career profiles. 
Your task is to clearly demonstrate in one sentence why the candidate is the ideal match for a specific job opening without summarizing the entire career. 
This concise sentence should follow the structured format:

Who you are.

Your relevant experience (focus on competencies, not specific technical skills).

Which industries you've got experience in.

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

2. Look for the STRONGEST and most relevant competencies from ANY part of the resume that match the job description.

3. If multiple instances of a competency exist across different jobs/experiences, choose the strongest examples
   that best demonstrate the depth of experience, regardless of how recent they are.

4. Look beyond job titles and formal roles - evidence can be found in project descriptions, achievements, or hackathon participation.

5. DO NOT include phrases like "aligning with the job description" or "matching the requirements" in your output.

6. DO NOT mention the company name from the job description in your output.

7. DO NOT reference the job description itself in any way in your output.

8. The career profile should stand on its own as a professional statement without any meta-references.

9. Focus on competencies (e.g., "executive communication", "team leadership", "strategic planning") rather than specific technical skills or tools (e.g., "Outlook", "Python", "AWS").

10. Highlight broader capabilities that demonstrate value, not the specific technologies used to deliver that value.

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

Generate a concise career profile:
```

## Career Profile Citation Finding Prompt

**File:** `services/resume_service.py`  
**Function:** `find_profile_citations()`  
**Purpose:** Finds evidence in the resume for competencies mentioned in the career profile

```
I have a career profile and a master resume. I need you to thoroughly scan the ENTIRE resume to identify where the competencies and keywords 
mentioned in the career profile are supported by evidence in the master resume.

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
{profile_text}

Master Resume:
{resume_text}
```

## Core Competencies Generation Prompt

**File:** `services/resume_service.py`  
**Function:** `generate_core_competencies()`  
**Purpose:** Generates core competencies based on job description and resume

```
You are a resume-writing assistant specialized in identifying core competencies that match a job description and are supported by a candidate's resume.

Your task is to extract up to 15 core competencies from the job description that are also evident in the candidate's resume. Format these as a comma-separated list.

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

Job Description:
{job_description}

Master Resume:
{master_resume}

Generate a comma-separated list of up to 15 core competencies:
```

## Competencies Citation Finding Prompt

**File:** `services/resume_service.py`  
**Function:** `find_competencies_citations()`  
**Purpose:** Finds evidence in the resume for each core competency

```
I have a list of core competencies and a master resume. I need you to thoroughly scan the ENTIRE resume to identify where each competency 
is supported by evidence in the master resume.

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
{competencies}

Master Resume:
{resume_text}
