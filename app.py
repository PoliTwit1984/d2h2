import os
import re
import json
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_file, make_response
from openai import OpenAI
from dotenv import load_dotenv
import io

# Load environment variables from .env file
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = Flask(__name__)

def extract_keywords_with_openai(job_description):
    """Extract important keywords from job description using OpenAI."""
    try:
        prompt = f"""
        Extract the most important keywords and phrases from the following job description.
        Focus on competencies, qualifications, responsibilities, and industry-specific terms.
        
        IMPORTANT: Prioritize broader competencies (e.g., "strategic planning", "team leadership", "change management") 
        over specific technical skills or tools (e.g., "Python", "AWS", "Excel").
        
        Return only a JSON array of strings with the keywords, with no additional text or explanation.
        
        Job Description:
        {job_description}
        """
        
        response = client.chat.completions.create(
            model="gpt-4.5-preview",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that extracts keywords from job descriptions."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            max_tokens=500,
            temperature=0.3
        )
        
        # Extract the JSON response
        content = response.choices[0].message.content.strip()
        keywords_data = json.loads(content)
        
        # Ensure we have a list of keywords
        if "keywords" in keywords_data:
            keywords = keywords_data["keywords"]
        else:
            # If the model didn't use the "keywords" key, use the first array found
            for key, value in keywords_data.items():
                if isinstance(value, list):
                    keywords = value
                    break
            else:
                # Fallback if no array is found
                keywords = list(keywords_data.values())[0] if keywords_data else []
        
        return keywords
    except Exception as e:
        print(f"Error extracting keywords with OpenAI: {str(e)}")
        # Fallback to regex-based extraction if OpenAI fails
        return extract_keywords_regex(job_description)

def extract_keywords_regex(text):
    """Extract important keywords from text using regex (fallback method)."""
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
    
    return all_keywords

def highlight_keywords_with_openai(profile_text, job_description):
    """Use OpenAI to identify and highlight keywords from the job description in the profile text."""
    try:
        prompt = f"""
        I have a career profile and a job description. I need you to identify keywords and phrases from the job description 
        that appear in the career profile, including semantically similar terms (not just exact matches).
        
        IMPORTANT: Prioritize broader competencies (e.g., "strategic planning", "team leadership", "change management") 
        over specific technical skills or tools (e.g., "Python", "AWS", "Excel").
        
        Return the career profile with HTML <mark> tags around each identified keyword or phrase.
        Return ONLY the marked-up HTML with no additional explanation or text.
        
        Career Profile:
        {profile_text}
        
        Job Description:
        {job_description}
        """
        
        response = client.chat.completions.create(
            model="gpt-4.5-preview",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that identifies and highlights keywords."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.3
        )
        
        # Extract the highlighted text
        highlighted_text = response.choices[0].message.content.strip()
        
        # Clean up any extra text the model might have added
        if "<mark>" in highlighted_text:
            # Extract just the part with the marks
            pattern = re.compile(r'(?:.*?)(?=<mark>|$)((?:<mark>.*?</mark>|.)*)', re.DOTALL)
            match = pattern.search(highlighted_text)
            if match:
                highlighted_text = match.group(1)
        
        return highlighted_text
    except Exception as e:
        print(f"Error highlighting with OpenAI: {str(e)}")
        # Fallback to regex-based highlighting if OpenAI fails
        keywords = extract_keywords_regex(job_description)
        return mark_keywords_regex(profile_text, keywords)

def mark_keywords_regex(text, keywords):
    """Mark keywords in text with HTML tags for highlighting (fallback method)."""
    marked_text = text
    for keyword in keywords:
        # Use word boundaries to match whole words only
        pattern = re.compile(r'\b' + re.escape(keyword) + r'\b', re.IGNORECASE)
        marked_text = pattern.sub(f'<mark>{keyword}</mark>', marked_text)
    
    return marked_text

def find_citations_with_openai(career_profile, master_resume):
    """Find citations in the master resume for keywords in the career profile."""
    try:
        prompt = f"""
        I have a career profile and a master resume. I need you to thoroughly scan the ENTIRE resume to identify where the competencies and keywords 
        mentioned in the career profile are supported by evidence in the master resume.
        
        IMPORTANT INSTRUCTIONS:
        1. Scan the ENTIRE resume, not just the most recent job experience.
        2. For each key competency or keyword in the career profile, find the STRONGEST and most relevant evidence 
           from ANY part of the resume that demonstrates this skill or competency.
        3. If multiple instances of a competency exist across different jobs/experiences, choose the strongest example
           that best demonstrates the depth of experience, regardless of how recent it is.
        4. Look for evidence across all sections: work experience, projects, education, certifications, etc.
        
        Return a JSON object where:
        - Each key is a competency or keyword from the career profile
        - Each value is a brief excerpt from the master resume (1-2 sentences) that provides the strongest evidence for this competency
        
        Focus on the most important 3-5 competencies only. Do not include generic skills that are not specifically evidenced.
        
        Career Profile:
        {career_profile}
        
        Master Resume:
        {master_resume}
        """
        
        response = client.chat.completions.create(
            model="gpt-4.5-preview",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that finds evidence in resumes."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            max_tokens=800,
            temperature=0.3
        )
        
        # Extract the JSON response
        content = response.choices[0].message.content.strip()
        citations_data = json.loads(content)
        
        return citations_data
    except Exception as e:
        print(f"Error finding citations with OpenAI: {str(e)}")
        # Return empty dict if there's an error
        return {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    # Get form data
    career_profile = request.form.get('career_profile', '')
    job_description = request.form.get('job_description', '')
    master_resume = request.form.get('master_resume', '')
    
    # Check if required fields are provided
    if not job_description or not master_resume:
        return jsonify({
            'success': False,
            'message': 'Job description and master resume are required.'
        }), 400
    
    try:
        # Prepare the prompt for OpenAI
        prompt = f"""You are a resume-writing assistant specialized in crafting highly targeted, concise career profiles. 
Your task is to clearly demonstrate in one sentence why the candidate is the ideal match for a specific job opening without summarizing the entire career. 
This concise sentence should follow the structured format:

Who you are.

Your relevant experience (focus on competencies, not specific technical skills).

Which industries you've got experience in.

IMPORTANT INSTRUCTIONS:
1. Thoroughly scan the ENTIRE resume, not just the most recent job experience.
2. Look for the STRONGEST and most relevant competencies from ANY part of the resume that match the job description.
3. If multiple instances of a competency exist across different jobs/experiences, choose the strongest examples
   that best demonstrate the depth of experience, regardless of how recent they are.
4. Look for evidence across all sections: work experience, projects, education, certifications, etc.
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

Generate a concise career profile:"""

        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4.5-preview",  # Using the latest model
            messages=[
                {"role": "system", "content": "You are a professional resume writer specializing in concise career profiles."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150,
            temperature=0.7
        )
        
        # Extract the generated career profile
        generated_profile = response.choices[0].message.content.strip()
        
        # Extract keywords from job description using OpenAI
        keywords = extract_keywords_with_openai(job_description)
        
        # Get the plain text profile for display in textarea
        plain_profile = generated_profile
        
        # Get the marked up profile with highlighted keywords using OpenAI
        marked_profile = highlight_keywords_with_openai(generated_profile, job_description)
        
        # Find citations in the master resume for the keywords in the career profile
        citations = find_citations_with_openai(generated_profile, master_resume)
        
        return jsonify({
            'success': True,
            'message': 'Career profile generated successfully!',
            'career_profile': plain_profile,
            'marked_profile': marked_profile,
            'keywords': keywords[:20],  # Limit to top 20 keywords to avoid overwhelming the UI
            'citations': citations
        })
    
    except Exception as e:
        # Handle any errors
        return jsonify({
            'success': False,
            'message': f'Error generating career profile: {str(e)}'
        }), 500

@app.route('/save-profile', methods=['POST'])
def save_profile():
    """Save the career profile to a text file and send it as a download."""
    try:
        # Get the career profile content from the request
        profile_content = request.form.get('profile_content', '')
        
        if not profile_content:
            return jsonify({
                'success': False,
                'message': 'No content provided to save.'
            }), 400
        
        # Create a timestamp for the filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"career_profile_{timestamp}.txt"
        
        # Create a file-like object in memory
        profile_file = io.BytesIO()
        profile_file.write(profile_content.encode('utf-8'))
        profile_file.seek(0)
        
        # Create a response with the file
        response = make_response(send_file(
            profile_file,
            as_attachment=True,
            download_name=filename,
            mimetype='text/plain'
        ))
        
        return response
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error saving profile: {str(e)}'
        }), 500

@app.route('/generate-competencies', methods=['POST'])
def generate_competencies():
    """Generate core competencies based on job description and master resume."""
    # Get form data
    job_description = request.form.get('job_description', '')
    master_resume = request.form.get('master_resume', '')
    
    # Check if required fields are provided
    if not job_description or not master_resume:
        return jsonify({
            'success': False,
            'message': 'Job description and master resume are required.'
        }), 400
    
    try:
        # Prepare the prompt for OpenAI
        prompt = f"""You are a resume-writing assistant specialized in identifying core competencies that match a job description and are supported by a candidate's resume.

Your task is to extract up to 15 core competencies from the job description that are also evident in the candidate's resume. Format these as a comma-separated list.

IMPORTANT INSTRUCTIONS:
1. Focus on broader competencies (e.g., "Strategic Planning", "Team Leadership", "Process Optimization") rather than specific technical skills or tools.
2. Do NOT include technical skills (computer software, technical certifications, etc.) - these belong in a skills section.
3. For example, "Software Development" would be a competency, while "Python" would be a skill (so include Software Development, not Python).
4. Thoroughly scan the ENTIRE resume, not just the most recent job experience.
5. Only include competencies that are both mentioned in the job description AND supported by evidence in the resume.
6. Include as many relevant competencies as possible, up to 15, as long as they are truly relevant to both the job description and resume.
7. Format the output as a simple comma-separated list (e.g., "Strategic Planning, Team Leadership, Process Optimization, Budget Management").
8. Each competency should be capitalized and separated by a comma and space.

Job Description:
{job_description}

Master Resume:
{master_resume}

Generate a comma-separated list of up to 15 core competencies:"""

        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4.5-preview",  # Using the latest model
            messages=[
                {"role": "system", "content": "You are a professional resume writer specializing in identifying core competencies."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150,
            temperature=0.7
        )
        
        # Extract the generated competencies
        generated_competencies = response.choices[0].message.content.strip()
        
        # Extract keywords from job description using OpenAI
        keywords = extract_keywords_with_openai(job_description)
        
        # Find citations in the master resume for the competencies
        citations_prompt = f"""
        I have a list of core competencies and a master resume. I need you to thoroughly scan the ENTIRE resume to identify where each competency 
        is supported by evidence in the master resume.
        
        IMPORTANT INSTRUCTIONS:
        1. Scan the ENTIRE resume, not just the most recent job experience.
        2. For each competency, find the STRONGEST and most relevant evidence 
           from ANY part of the resume that demonstrates this skill or competency.
        3. If multiple instances of a competency exist across different jobs/experiences, choose the strongest example
           that best demonstrates the depth of experience, regardless of how recent it is.
        4. Look for evidence across all sections: work experience, projects, education, certifications, etc.
        
        Return a JSON object where:
        - Each key is one of the competencies
        - Each value is a brief excerpt from the master resume (1-2 sentences) that provides the strongest evidence for this competency
        
        Core Competencies:
        {generated_competencies}
        
        Master Resume:
        {master_resume}
        """
        
        citations_response = client.chat.completions.create(
            model="gpt-4.5-preview",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that finds evidence in resumes."},
                {"role": "user", "content": citations_prompt}
            ],
            response_format={"type": "json_object"},
            max_tokens=800,
            temperature=0.3
        )
        
        # Extract the JSON response
        citations_content = citations_response.choices[0].message.content.strip()
        citations_data = json.loads(citations_content)
        
        return jsonify({
            'success': True,
            'message': 'Core competencies generated successfully!',
            'competencies': generated_competencies,
            'keywords': keywords[:15],  # Limit to top 15 keywords
            'citations': citations_data
        })
    
    except Exception as e:
        # Handle any errors
        return jsonify({
            'success': False,
            'message': f'Error generating core competencies: {str(e)}'
        }), 500

@app.route('/save-competencies', methods=['POST'])
def save_competencies():
    """Save the core competencies to a text file and send it as a download."""
    try:
        # Get the competencies content from the request
        competencies_content = request.form.get('competencies_content', '')
        
        if not competencies_content:
            return jsonify({
                'success': False,
                'message': 'No content provided to save.'
            }), 400
        
        # Create a timestamp for the filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"core_competencies_{timestamp}.txt"
        
        # Create a file-like object in memory
        competencies_file = io.BytesIO()
        competencies_file.write(competencies_content.encode('utf-8'))
        competencies_file.seek(0)
        
        # Create a response with the file
        response = make_response(send_file(
            competencies_file,
            as_attachment=True,
            download_name=filename,
            mimetype='text/plain'
        ))
        
        return response
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error saving competencies: {str(e)}'
        }), 500

@app.route('/save-resume', methods=['POST'])
def save_resume():
    """Save the complete customized resume to a text file and send it as a download."""
    try:
        # Get the resume content from the request
        resume_content = request.form.get('resume_content', '')
        
        if not resume_content:
            return jsonify({
                'success': False,
                'message': 'No content provided to save.'
            }), 400
        
        # Create a timestamp for the filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"customized_resume_{timestamp}.txt"
        
        # Create a file-like object in memory
        resume_file = io.BytesIO()
        resume_file.write(resume_content.encode('utf-8'))
        resume_file.seek(0)
        
        # Create a response with the file
        response = make_response(send_file(
            resume_file,
            as_attachment=True,
            download_name=filename,
            mimetype='text/plain'
        ))
        
        return response
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error saving resume: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
