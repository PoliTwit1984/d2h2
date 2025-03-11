# dumped2hire

A web application that helps job seekers transform their resumes into targeted career profiles that get them hired.

## Features

- **Career Profile Generator**: Create a concise, impactful career profile statement tailored to specific job descriptions
- **Keyword Highlighting**: Automatically identifies and highlights important keywords from the job description
- **Supporting Evidence**: Extracts relevant experience and skills from your master resume
- **Top Keywords**: Shows the most important keywords to include in your application

## Technology Stack

- **Backend**: Python with Flask
- **Frontend**: HTML, JavaScript, and Tailwind CSS
- **UI**: Minimalist and sleek design with custom branding

## Getting Started

### Prerequisites

- Python 3.7+
- pip

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/dumped2hire.git
cd dumped2hire
```

2. Install dependencies
```
pip install -r requirements.txt
```

3. Set up environment variables
```
cp .env.example .env
# Edit .env with your configuration
```

4. Run the application
```
python -c "from app import app; app.run(debug=True, port=5001)"
```

5. Open your browser and navigate to `http://localhost:5001`

## Usage

1. Enter your target job description in the "Target Job Description" field
2. Paste your master resume in the "Master Resume" field
3. (Optional) Provide additional context:
   - Job Title: Specify the exact position you're applying for
   - Company Name: Enter the company name for more targeted results
   - Industry: Specify the industry for industry-specific tailoring
4. Click "Extract Keywords" to identify important keywords from the job description
5. Review and customize the extracted keywords
6. Generate your tailored career profile
7. Review the highlighted keywords and supporting evidence
8. Generate core competencies that align with the job requirements
9. Save your career profile, competencies, and supporting evidence for use in your job application

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the need to help job seekers stand out in competitive markets
- Special thanks to all contributors and beta testers
