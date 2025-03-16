# Dumped2Hire

<div align="center">
  <img src="static/images/dumped2hirelogo.png" alt="Dumped2Hire Logo" width="300"/>
  <p><em>Transform your resume into a targeted career profile that gets you hired</em></p>
</div>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Complete Workflow](#complete-workflow)
- [Technical Implementation](#technical-implementation)
- [Getting Started](#getting-started)
- [Development Guide](#development-guide)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## 🔍 Overview

Dumped2Hire is a web application that helps job seekers transform their resumes into targeted career profiles that get them hired. The application analyzes job descriptions, extracts important keywords, finds evidence of those keywords in your resume, and generates tailored content to help you stand out in the application process.

## ✨ Features

- **🔑 Keyword Extraction**: Automatically identifies and prioritizes important keywords from job descriptions
- **📄 Resume Analysis**: Scans your master resume to find evidence of the extracted keywords
- **📝 Citation Generation**: Creates citations that demonstrate your experience with each keyword
- **👤 Career Profile Generator**: Creates a concise, impactful career profile statement tailored to specific job descriptions
- **💼 Core Competencies**: Generates a list of core competencies based on the job requirements and your experience
- **🧭 Guided Interface**: Step-by-step guide to help you through the entire process

## 🏗️ Project Structure

<details>
<summary>Click to expand project structure</summary>

### Backend (Python)

| Component | Description |
|-----------|-------------|
| **app.py** | Main Flask application with API endpoints |
| **services/** | Core functionality modules |
| &nbsp;&nbsp;**keyword_service.py** | Entry point for keyword-related functionality |
| &nbsp;&nbsp;**resume_service.py** | Handles career profile and competencies generation |
| &nbsp;&nbsp;**openai_service.py** | Interface for OpenAI API calls |
| &nbsp;&nbsp;**keyword/** | Specialized keyword processing modules |
| &nbsp;&nbsp;&nbsp;&nbsp;**keyword_extraction.py** | Extracts keywords from job descriptions |
| &nbsp;&nbsp;&nbsp;&nbsp;**keyword_matching.py** | Finds keywords in resumes and generates citations |
| &nbsp;&nbsp;&nbsp;&nbsp;**keyword_highlighting.py** | Highlights keywords in text |
| &nbsp;&nbsp;&nbsp;&nbsp;**keyword_utils.py** | Utility functions for keyword processing |

### Frontend (JavaScript)

| Component | Description |
|-----------|-------------|
| **static/js/modules/** | Modular JavaScript components |
| &nbsp;&nbsp;**keyword-manager.js** | Manages keyword extraction and display |
| &nbsp;&nbsp;**citations-manager.js** | Handles citation generation and display |
| &nbsp;&nbsp;**profile-manager.js** | Manages career profile generation |
| &nbsp;&nbsp;**competencies-manager.js** | Handles core competencies generation |
| &nbsp;&nbsp;**ui-manager.js** | Manages UI state and transitions |
| &nbsp;&nbsp;**api-service.js** | Handles API calls to the backend |
| **static/js/** | UI component scripts |
| &nbsp;&nbsp;**main.js** | Main application logic |
| &nbsp;&nbsp;**guide-panel.js** | Handles the guided interface |
| &nbsp;&nbsp;**citations-panel.js** | Controls the citations panel |
| &nbsp;&nbsp;**keywords-panel.js** | Manages the keywords panel |
| &nbsp;&nbsp;**form-handler.js** | Processes form submissions |
| &nbsp;&nbsp;**ui-utils.js** | UI utility functions |

### Templates and CSS

| Component | Description |
|-----------|-------------|
| **templates/** | HTML templates |
| &nbsp;&nbsp;**index.html** | Main application page |
| &nbsp;&nbsp;**customized_resume.html** | Resume display template |
| &nbsp;&nbsp;**result_message.html** | Result message template |
| **static/css/** | Styling |
| &nbsp;&nbsp;**custom.css** | Custom styles beyond Tailwind CSS |

</details>

## 🔄 Complete Workflow

<details>
<summary>Click to expand workflow details</summary>

### 1. Input Phase

1. **Job Description Entry**:
   - User pastes the target job description in the "Job Description" field
   - Optionally provides job title, company name, and industry for more targeted results

2. **Master Resume Entry**:
   - User pastes their master resume in the "Master Resume" field
   - This comprehensive resume serves as the source for finding evidence of skills and experience

### 2. Keyword Extraction Phase

1. **Extract Keywords**:
   - User clicks "Extract Keywords" button
   - Backend processes the job description using NLP techniques
   - Keywords are extracted and categorized by priority (high, medium, low)
   - Job description is highlighted with color-coded keywords

2. **Review Keywords**:
   - Extracted keywords are displayed in the keywords panel
   - User can review and customize the keywords
   - User can add additional keywords manually if needed

### 3. Citation Generation Phase

1. **Generate Citations**:
   - User clicks "Generate Citations" button
   - Backend scans the master resume for evidence of each keyword
   - For each keyword found, a citation is generated that demonstrates the user's experience
   - Citations are organized by priority level

2. **Review Citations**:
   - Citations are displayed in the citations panel
   - Each citation shows the keyword and supporting evidence from the resume
   - Keywords in the keyword list are marked with checkmarks (✓) if citations were found, or X marks (✗) if not

### 4. Content Generation Phase

1. **Generate Career Profile**:
   - User clicks "Generate Career Profile" button
   - Backend creates a tailored career profile based on the job description, keywords, and citations
   - The profile is displayed with highlighted keywords

2. **Generate Core Competencies**:
   - User clicks "Generate Core Competencies" button
   - Backend creates a list of core competencies based on the job requirements and user's experience
   - Competencies are displayed with supporting evidence

### 5. Export Phase

1. **Save Results**:
   - User can save the career profile, competencies, and citations
   - Files are downloaded in text format for easy integration into resumes and cover letters

</details>

## 🔧 Technical Implementation

<details>
<summary>Click to expand technical details</summary>

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| **/extract-keywords** | Extracts keywords from job description |
| **/find-keywords-in-resume** | Finds keywords in the master resume |
| **/find-citations** | Generates citations for keywords |
| **/generate** | Creates a tailored career profile |
| **/generate-competencies** | Creates core competencies |
| **/save-profile**, **/save-competencies**, **/save-citations** | Save results to files |

### Data Flow

1. **Frontend to Backend**:
   - Job description and master resume are sent to the backend via API calls
   - API service module handles the communication

2. **Backend Processing**:
   - Keyword service extracts keywords and organizes them by priority
   - Keyword matching service finds evidence in the resume
   - Resume service generates career profiles and competencies

3. **Backend to Frontend**:
   - Processed data is returned to the frontend as JSON
   - Frontend modules update the UI with the results

4. **State Management**:
   - Global variables (window.keywordsData, window.citationsData) store application state
   - UI Manager handles transitions between different sections

</details>

## 🚀 Getting Started

### Prerequisites

- Python 3.7+
- pip
- Modern web browser
- OpenAI API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/dumped2hire.git
cd dumped2hire
```

2. Install dependencies
```bash
pip install -r requirements.txt
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration (including OpenAI API key)
```

4. Run the application
```bash
python app.py
```

5. Open your browser and navigate to `http://localhost:5001`

### Note on Experimental UIs

This repository contains experimental UI components in the following directories:
- `demo/` - Basic demo interface
- `demolanding/` - Next.js landing page prototype
- `demoui/` - Next.js UI components prototype

These directories are excluded from Git tracking via the `.gitignore` file as they are experimental and not part of the core application.

## 👨‍💻 Development Guide

<details>
<summary>Click to expand development guide</summary>

### Adding New Features

1. **Backend Changes**:
   - Add new functionality to appropriate service modules
   - Create new API endpoints in app.py if needed
   - Follow the existing pattern of service organization

2. **Frontend Changes**:
   - Add new UI components to the appropriate module
   - Update the main.js file to integrate the new functionality
   - Ensure proper event handling and state management

### Testing

1. **Manual Testing**:
   - Test each step of the workflow with different job descriptions and resumes
   - Verify that keywords are correctly extracted and prioritized
   - Check that citations accurately reflect the resume content

2. **Error Handling**:
   - Test edge cases such as empty inputs or very large inputs
   - Verify that error messages are displayed appropriately

</details>

## ❓ Troubleshooting

See the [fixme.md](fixme.md) file for known issues and their potential solutions.

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by the need to help job seekers stand out in competitive markets
- Special thanks to all contributors and beta testers

---

<div align="center">
  <p>Made with ❤️ for job seekers everywhere</p>
</div>
