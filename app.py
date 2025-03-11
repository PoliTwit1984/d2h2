"""
Dumped2Hire - Resume Tailoring Application

This application helps users tailor their resumes to specific job descriptions
by extracting keywords, generating career profiles, and identifying core competencies.
"""

import os
import io
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_file, make_response
from dotenv import load_dotenv

# Import services
from services.keyword_service import extract_keywords, highlight_keywords
from services.resume_service import generate_career_profile, generate_core_competencies

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

@app.route('/')
def index():
    """Render the main application page."""
    return render_template('index.html')

@app.route('/extract-keywords', methods=['POST'])
def extract_keywords_endpoint():
    """Extract keywords from job description with enhanced prioritization."""
    # Get form data
    job_description = request.form.get('job_description', '')
    job_title = request.form.get('job_title', '')
    company_name = request.form.get('company_name', '')
    industry = request.form.get('industry', '')
    
    # Check if required fields are provided
    if not job_description:
        return jsonify({
            'success': False,
            'message': 'Job description is required.'
        }), 400
    
    try:
        # Extract keywords using the keyword service (job description only)
        from services.keyword_service import extract_keywords_only, highlight_job_description
        keywords_data, all_keywords = extract_keywords_only(
            job_description, 
            job_title, 
            company_name,
            industry
        )
        
        # Highlight keywords in the job description
        highlighted_job_description = highlight_job_description(job_description, keywords_data)
        
        return jsonify({
            'success': True,
            'message': 'Keywords extracted successfully!',
            'keywords': all_keywords,  # For backward compatibility
            'keywords_data': keywords_data,  # Enhanced data structure
            'highlighted_job_description': highlighted_job_description  # Highlighted job description
        })
    
    except Exception as e:
        # Handle any errors
        return jsonify({
            'success': False,
            'message': f'Error extracting keywords: {str(e)}'
        }), 500

@app.route('/generate', methods=['POST'])
def generate():
    """Generate a tailored career profile based on job description and master resume."""
    # Get form data
    job_description = request.form.get('job_description', '')
    master_resume = request.form.get('master_resume', '')
    keywords_json = request.form.get('keywords', '')
    keywords_data_json = request.form.get('keywords_data', '')
    citations_json = request.form.get('citations_json', '')
    job_title = request.form.get('job_title', '')
    company_name = request.form.get('company_name', '')
    industry = request.form.get('industry', '')
    
    # Parse keywords if provided
    provided_keywords = None
    if keywords_json:
        try:
            import json
            provided_keywords = json.loads(keywords_json)
        except:
            pass
    
    # Parse structured keywords data if provided
    keywords_data = None
    if keywords_data_json:
        try:
            import json
            keywords_data = json.loads(keywords_data_json)
        except:
            pass
    
    # Parse citations if provided
    existing_citations = None
    if citations_json:
        try:
            import json
            existing_citations = json.loads(citations_json)
        except:
            pass
    
    # Check if required fields are provided
    if not job_description or not master_resume:
        return jsonify({
            'success': False,
            'message': 'Job description and master resume are required.'
        }), 400
    
    try:
        # Generate career profile using the resume service
        profile, marked_profile, keywords, citations = generate_career_profile(
            job_description, 
            master_resume, 
            provided_keywords, 
            existing_citations,
            job_title,
            company_name,
            industry,
            keywords_data
        )
        
        return jsonify({
            'success': True,
            'message': 'Career profile generated successfully!',
            'career_profile': profile,
            'marked_profile': marked_profile,
            'keywords': keywords,  # Limited to top 20 keywords
            'citations': citations
        })
    
    except Exception as e:
        # Handle any errors
        return jsonify({
            'success': False,
            'message': f'Error generating career profile: {str(e)}'
        }), 500

@app.route('/generate-competencies', methods=['POST'])
def generate_competencies():
    """Generate core competencies based on job description and master resume."""
    # Get form data
    job_description = request.form.get('job_description', '')
    master_resume = request.form.get('master_resume', '')
    keywords_json = request.form.get('keywords', '')
    keywords_data_json = request.form.get('keywords_data', '')
    citations_json = request.form.get('citations_json', '')
    job_title = request.form.get('job_title', '')
    company_name = request.form.get('company_name', '')
    industry = request.form.get('industry', '')
    
    # Parse keywords if provided
    provided_keywords = None
    if keywords_json:
        try:
            import json
            provided_keywords = json.loads(keywords_json)
        except:
            pass
    
    # Parse structured keywords data if provided
    keywords_data = None
    if keywords_data_json:
        try:
            import json
            keywords_data = json.loads(keywords_data_json)
        except:
            pass
    
    # Parse citations if provided
    existing_citations = None
    if citations_json:
        try:
            import json
            existing_citations = json.loads(citations_json)
        except:
            pass
    
    # Check if required fields are provided
    if not job_description or not master_resume:
        return jsonify({
            'success': False,
            'message': 'Job description and master resume are required.'
        }), 400
    
    try:
        # Generate core competencies using the resume service
        competencies, keywords, citations = generate_core_competencies(
            job_description, 
            master_resume, 
            provided_keywords, 
            existing_citations,
            job_title,
            company_name,
            industry,
            keywords_data
        )
        
        return jsonify({
            'success': True,
            'message': 'Core competencies generated successfully!',
            'competencies': competencies,
            'keywords': keywords,  # Limited to top 15 keywords
            'citations': citations
        })
    
    except Exception as e:
        # Handle any errors
        return jsonify({
            'success': False,
            'message': f'Error generating core competencies: {str(e)}'
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

@app.route('/find-keywords-in-resume', methods=['POST'])
def find_keywords_in_resume():
    """Find keywords in the master resume and highlight them."""
    # Get form data
    master_resume = request.form.get('master_resume', '')
    keywords_json = request.form.get('keywords', '')
    job_title = request.form.get('job_title', '')
    company_name = request.form.get('company_name', '')
    industry = request.form.get('industry', '')
    
    # Parse keywords if provided
    keywords = []
    if keywords_json:
        try:
            import json
            keywords_data = json.loads(keywords_json)
            
            # Extract keywords from the keywords_data structure
            if isinstance(keywords_data, dict):
                # If it's the enhanced structure with priority categories
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
    
    # Check if required fields are provided
    if not master_resume or not keywords:
        return jsonify({
            'success': False,
            'message': 'Master resume and keywords are required.'
        }), 400
    
    try:
        # Find keywords in the resume
        from services.keyword_service import find_keywords_in_resume as find_kw
        found_keywords, highlighted_resume = find_kw(keywords, master_resume, job_title, company_name, industry)
        
        return jsonify({
            'success': True,
            'message': 'Keywords found successfully!',
            'found_keywords': found_keywords,
            'highlighted_resume': highlighted_resume
        })
    
    except Exception as e:
        # Handle any errors
        return jsonify({
            'success': False,
            'message': f'Error finding keywords in resume: {str(e)}'
        }), 500

@app.route('/find-citations', methods=['POST'])
def find_citations():
    """Find citations for keywords in the master resume."""
    # Get form data
    master_resume = request.form.get('master_resume', '')
    keywords_json = request.form.get('keywords', '')
    job_title = request.form.get('job_title', '')
    company_name = request.form.get('company_name', '')
    industry = request.form.get('industry', '')
    
    # Parse keywords if provided
    keywords = []
    if keywords_json:
        try:
            import json
            keywords_data = json.loads(keywords_json)
            
            # Extract keywords from the keywords_data structure
            if isinstance(keywords_data, dict):
                # If it's the enhanced structure with priority categories
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
    
    # Check if required fields are provided
    if not master_resume or not keywords:
        return jsonify({
            'success': False,
            'message': 'Master resume and keywords are required.'
        }), 400
    
    try:
        # Find citations for the keywords
        from services.keyword_service import find_keyword_citations
        citations = find_keyword_citations(keywords, master_resume, job_title, company_name, industry)
        
        return jsonify({
            'success': True,
            'message': 'Citations found successfully!',
            'citations': citations
        })
    
    except Exception as e:
        # Handle any errors
        return jsonify({
            'success': False,
            'message': f'Error finding citations: {str(e)}'
        }), 500

@app.route('/save-citations', methods=['POST'])
def save_citations():
    """Save the citations to a text file and send it as a download."""
    try:
        # Get the citations content from the request
        citations_content = request.form.get('citations_content', '')
        
        if not citations_content:
            return jsonify({
                'success': False,
                'message': 'No content provided to save.'
            }), 400
        
        # Create a timestamp for the filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"interview_prep_citations_{timestamp}.txt"
        
        # Create a file-like object in memory
        citations_file = io.BytesIO()
        citations_file.write(citations_content.encode('utf-8'))
        citations_file.seek(0)
        
        # Create a response with the file
        response = make_response(send_file(
            citations_file,
            as_attachment=True,
            download_name=filename,
            mimetype='text/plain'
        ))
        
        return response
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error saving citations: {str(e)}'
        }), 500

@app.route('/find-keyword-citation', methods=['POST'])
def find_keyword_citation():
    """Find citation for a single keyword in the resume."""
    # Get form data
    keyword = request.form.get('keyword', '')
    resume_text = request.form.get('resume_text', '')
    
    # Check if required fields are provided
    if not keyword or not resume_text:
        return jsonify({
            'success': False,
            'message': 'Keyword and resume text are required.'
        }), 400
    
    try:
        # Use OpenAI to find a citation for this keyword
        from services.openai_service import get_text_response
        
        # Create a prompt to find evidence for this keyword
        prompt = f"""
        Find the strongest evidence in the resume that demonstrates the person has experience with "{keyword}".
        Return only the relevant excerpt from the resume (1-2 sentences) that best supports this skill or competency.
        If you can't find clear evidence, respond with "No clear evidence found."
        
        Resume:
        {resume_text}
        """
        
        messages = [
            {"role": "system", "content": "You are a helpful assistant that finds evidence in resumes."},
            {"role": "user", "content": prompt}
        ]
        
        # Get the citation
        citation = get_text_response(messages, max_tokens=200, temperature=0.3)
        
        # Clean up the citation
        citation = citation.strip()
        if citation.lower() == "no clear evidence found." or "no clear evidence" in citation.lower():
            return jsonify({
                'success': False,
                'message': 'No citation found for this keyword.'
            })
        
        return jsonify({
            'success': True,
            'message': 'Citation found successfully!',
            'citation': citation,
            'keyword': keyword
        })
    
    except Exception as e:
        # Handle any errors
        return jsonify({
            'success': False,
            'message': f'Error finding citation: {str(e)}'
        }), 500

if __name__ == '__main__':
    import sys
    
    # Default port
    port = 5001
    
    # Check if port is specified as command-line argument
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])
    
    app.run(debug=True, port=port)
