# dumped2hire

A minimalist web application to help job seekers optimize their resumes based on target job descriptions.

## Features

- **Career Profile Generator**: Create a concise employer branding statement using AI
- **Target Job Description Analysis**: Paste job descriptions for AI-powered analysis
- **Master Resume Integration**: Use your existing resume as a base for personalized optimization
- **OpenAI Integration**: Leverages OpenAI's powerful language models to generate tailored career profiles

## Tech Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML, JavaScript, Tailwind CSS

## Getting Started

### Prerequisites

- Python 3.7+
- pip (Python package manager)
- OpenAI API key

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd d2h2
   ```

2. Create a virtual environment (optional but recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up your OpenAI API key:
   - Rename `.env.example` to `.env` (or create a new `.env` file)
   - Add your OpenAI API key to the `.env` file:
     ```
     OPENAI_API_KEY=your_openai_api_key_here
     ```

5. Run the application:
   ```
   python app.py
   ```

6. Open your browser and navigate to:
   ```
   http://127.0.0.1:5000/
   ```

## Usage

1. Paste the target job description in the designated box
2. Paste your master resume in the designated box
3. Click "Generate" to process the information
4. The AI will analyze both inputs and generate a tailored career profile
5. The generated career profile will appear in the Career Profile box
6. You can edit the generated profile as needed or regenerate with different inputs

## Future Enhancements

- AI-powered resume optimization
- Keyword matching and suggestions
- Exportable formatted resumes
- User accounts to save multiple profiles
