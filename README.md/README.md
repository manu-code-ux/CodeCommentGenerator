# CodeComment AI

## NLP-Based Automatic Code Comment Generator

CodeComment AI is a full-stack web application that analyzes
source code and generates meaningful natural-language
explanations using an NLP-based code analysis engine.

The application provides an interactive code editor where
users can enter source code, execute Python programs, and
generate understandable comments automatically.

---

## Project Objective

The main objective of CodeComment AI is to make source code
easier to understand by converting programming constructs
into human-readable explanations.

The system is designed to help students, beginners and
developers understand the purpose and structure of source code.

---

## Key Features

- Interactive source code editor
- Automatic code comment generation
- NLP-based code analysis
- Programming construct detection
- Python code execution
- Terminal output display
- Sample code support
- Clear editor functionality
- One-click comment copying
- Error handling
- Responsive and professional user interface

---

## Technology Stack

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express.js
- CORS

### NLP Engine

- Python
- Regular Expressions
- Rule-based source code analysis

---

## System Architecture

```text
                    USER
                      |
                      v
              +---------------+
              |   FRONTEND    |
              | HTML CSS JS   |
              +-------+-------+
                      |
                      | HTTP Request
                      v
              +---------------+
              | NODE.JS       |
              | EXPRESS API   |
              +-------+-------+
                      |
                      | Python Process
                      v
              +---------------+
              |  PYTHON NLP   |
              |    ENGINE     |
              +-------+-------+
                      |
                      v
             CODE STRUCTURE ANALYSIS
                      |
        +-------------+-------------+
        |             |             |
        v             v             v
    Variables      Functions      Loops
        |             |             |
        +-------------+-------------+
                      |
                      v
           NATURAL LANGUAGE COMMENT
                      |
                      v
                  FRONTEND
                      |
                      v
                   USER