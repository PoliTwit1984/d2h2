# Job Description Keyword Extraction Documentation

This document provides a detailed overview of the keyword extraction process used in dumped2hire to identify and prioritize important skills and competencies from job descriptions.

## Extraction Process Overview

The keyword extraction process follows these steps:

1. The job description text is sent to the OpenAI API with a specialized prompt
2. The API returns a structured JSON response with keywords categorized by priority
3. Each keyword includes a relevance score from 0.0 to 1.0
4. The keywords are then used to:
   - Highlight the job description with color-coded priority indicators
   - Match against the user's resume to find evidence of skills
   - Identify missing keywords that aren't found in the resume

## Prompt Design

The prompt is carefully designed to extract exact keywords and phrases from job descriptions for ATS optimization. Here is the exact prompt used:

```
You are an AI assistant specialized in extracting exact keywords and phrases from job descriptions for Applicant Tracking System (ATS) optimization. Your goal is to capture and rank explicit skills, competencies, or qualifications found within the job description. When the user provides a job description, you must:

Extract only the explicit skills, competencies, or qualifications

Use the exact wording as it appears in the job post.
Do not infer or add synonyms, related terms, or abbreviations if they're not explicitly stated. For example, if the text says "Microsoft Excel," do not shorten or alter it to "Excel" or "MS Excel."
Multi-word phrases should be kept as-is (e.g., "triaging support requests").
Rank the extracted keywords/phrases by priority

Sections titled "Responsibilities" or "Requirements" generally indicate higher priority than "About Us" or other background info.
If a term or phrase is repeated, factor its frequency into its final score.
Explicit context clues:
"required," "must-have," or "critical" => High priority.
"preferred," "nice to have" => Medium priority.
Anything else that appears relevant but not indicated as critical => Low priority.
Output the results in this exact JSON format:


{
  "high_priority": [
    { "keyword": "some exact term", "score": 0.95 },
    ...
  ],
  "medium_priority": [
    { "keyword": "some exact term", "score": 0.75 },
    ...
  ],
  "low_priority": [
    { "keyword": "some exact term", "score": 0.50 },
    ...
  ]
}
Each keyword/phrase should appear only once (no duplicates).
"score" is a numeric weight between 0.0 and 1.0, reflecting relative importance.
Make sure the JSON output is valid (no markdown formatting).
Do not include extra or missing keywords from external sources.

Only use what's explicitly stated in the provided job description.
Include multi-word phrases exactly as they appear.

Do not split "executive sponsors" into "executive" and "sponsors."
```

## API Configuration

The OpenAI API call is configured with the following parameters:

- **Model**: GPT-4 (via the OpenAI service)
- **Temperature**: 0.3 (to ensure consistent, deterministic outputs)
- **Max Tokens**: 1000 (sufficient for comprehensive keyword extraction)
- **Response Format**: JSON

## Keyword Prioritization

Keywords are categorized into three priority levels:

1. **High Priority** (score range: 0.8-1.0)
   - Keywords that appear in "Requirements" or "Qualifications" sections
   - Terms marked as "required," "must-have," or "essential"
   - Skills mentioned multiple times throughout the job description

2. **Medium Priority** (score range: 0.5-0.79)
   - Keywords that appear in "Responsibilities" sections
   - Terms marked as "preferred" or "nice to have"
   - Skills mentioned in the context of day-to-day activities

3. **Low Priority** (score range: 0.1-0.49)
   - Keywords that appear in general descriptions or "About Us" sections
   - Supplementary skills or knowledge areas
   - Terms mentioned only once in less prominent sections

## Fallback Mechanism

If the OpenAI API call fails or returns invalid JSON, a regex-based fallback mechanism is used:

1. Common words and short terms are filtered out
2. Phrases (2-3 word combinations) are extracted
3. Keywords are sorted by length (longer keywords first)
4. Scores are assigned based on position in the list

## Citation Finding

After keywords are extracted, the system searches for evidence of these skills in the user's resume:

1. Each keyword is searched for in the resume text
2. The AI uses semantic understanding to identify matches based on meaning
3. Only keywords with clear supporting evidence are included
4. For each match, a brief excerpt from the resume is provided as evidence

## Visual Representation

Keywords are highlighted in the job description with color-coding based on priority:

- High priority: Red highlighting
- Medium priority: Orange highlighting
- Low priority: Yellow highlighting

Each keyword badge also displays the relevance score to help users understand the relative importance of each skill.

## Missing Keywords Identification

Keywords that don't have corresponding citations in the resume are flagged as "missing":

1. Missing keywords are organized by priority level
2. Each missing keyword retains its original relevance score
3. The frontend displays these missing keywords prominently to help users identify gaps

## Implementation Details

The keyword extraction functionality is implemented in `keyword_service.py` with the following key functions:

- `extract_keywords()`: Main function that handles the OpenAI API call and processes the response
- `find_keyword_citations()`: Searches for evidence of keywords in the resume
- `highlight_job_description()`: Adds HTML markup to highlight keywords in the job description
- `extract_keywords_regex()`: Fallback function that uses regex for keyword extraction

The frontend displays the extracted keywords using the `displayEnhancedKeywords()` function in `main.js`, which creates keyword badges with scores and organizes them by priority.
