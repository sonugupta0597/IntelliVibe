const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyzes a resume against a job description using AI
 * @param {string} resumeText - The extracted text from the resume
 * @param {Object} jobDetails - The job posting details
 * @returns {Promise<{matchScore: number, justification: string}>}
 */
exports.analyzeResume = async (resumeText, jobDetails) => {
    try {
        const prompt = `You are an expert recruitment AI assistant. Analyze the following resume against the job requirements and provide a match score.

Job Details:
- Title: ${jobDetails.title}
- Company: ${jobDetails.companyName}
- Required Skills: ${jobDetails.skills?.join(', ') || 'Not specified'}
- Description: ${jobDetails.description}
- Experience Level: ${jobDetails.experienceLevel || 'Not specified'}
- Job Type: ${jobDetails.jobType || 'Not specified'}
- Location: ${jobDetails.location}

Resume Text:
${resumeText}

Please analyze how well this candidate matches the job requirements. Consider:
1. Relevant skills and technologies
2. Years of experience
3. Educational background
4. Previous job roles and responsibilities
5. Industry experience

Respond with a JSON object containing:
- matchScore: A number between 0-100 representing the match percentage
- justification: A brief explanation (2-3 sentences) of the score

Example response:
{
  "matchScore": 75,
  "justification": "The candidate has strong experience with 3 out of 5 required technologies and relevant industry experience. However, they lack the specific leadership experience mentioned in the job description."
}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a professional recruitment assistant. Always respond with valid JSON only.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.3,
            max_tokens: 200,
        });

        const content = response.choices[0].message.content;
        
        // Parse the JSON response
        try {
            const result = JSON.parse(content);
            
            // Validate the response structure
            if (typeof result.matchScore !== 'number' || !result.justification) {
                throw new Error('Invalid response structure');
            }
            
            // Ensure matchScore is within valid range
            result.matchScore = Math.max(0, Math.min(100, result.matchScore));
            
            return result;
        } catch (parseError) {
            console.error('Error parsing AI response:', parseError);
            // Return a default response if parsing fails
            return {
                matchScore: 0,
                justification: 'Unable to properly analyze the resume at this time.',
            };
        }
    } catch (error) {
        console.error('Error in AI resume analysis:', error);
        throw new Error('Failed to analyze resume: ' + error.message);
    }
};

/**
 * Generates technical quiz questions based on job requirements
 * @param {Object} jobDetails - The job posting details
 * @returns {Promise<Array>} Array of quiz questions
 */
exports.generateQuizQuestions = async (jobDetails) => {
    try {
        const prompt = `You are an expert technical interviewer. Generate exactly 10 multiple-choice questions to test candidates for the following position. The questions should be technical and directly related to the required skills.

Job Details:
- Title: ${jobDetails.title}
- Required Skills: ${jobDetails.skills?.join(', ') || 'Not specified'}
- Description: ${jobDetails.description}

Requirements for questions:
1. Questions must be technical and test practical knowledge
2. Focus on the specific technologies and skills mentioned in the job
3. Mix difficulty levels: 3 easy, 4 medium, 3 hard
4. Each question must have exactly 4 options
5. Only one correct answer per question
6. Questions should test real-world application, not just theory
7. Avoid trivial or googleable facts

Respond with a JSON array of exactly 10 questions with this structure:
[
  {
    "question": "When working with React hooks, which of the following would cause an infinite re-render loop?",
    "options": [
      "Using useState inside useEffect without dependencies",
      "Calling setState directly in the component body",
      "Using useCallback without dependencies",
      "Passing an empty dependency array to useEffect"
    ],
    "correctAnswer": 1,
    "difficulty": "medium",
    "skill": "React",
    "explanation": "Calling setState directly in the component body causes the component to re-render immediately, which calls setState again, creating an infinite loop."
  }
]

Make sure:
- correctAnswer is the index (0-3) of the correct option
- Each question tests practical knowledge relevant to the job
- Questions are clear and unambiguous
- All options are plausible to avoid obvious answers`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a technical interviewer creating assessment questions. Always respond with valid JSON array only.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 3000,
        });

        const content = response.choices[0].message.content;
        
        try {
            const questions = JSON.parse(content);
            
            // Validate the response
            if (!Array.isArray(questions) || questions.length !== 10) {
                throw new Error('Invalid number of questions generated');
            }
            
            // Validate each question structure
            const validatedQuestions = questions.map((q, index) => {
                if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || 
                    typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
                    throw new Error(`Invalid question structure at index ${index}`);
                }
                
                return {
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    difficulty: q.difficulty || 'medium',
                    skill: q.skill || 'General',
                    explanation: q.explanation || ''
                };
            });
            
            return validatedQuestions;
            
        } catch (parseError) {
            console.error('Error parsing quiz questions:', parseError);
            throw new Error('Failed to generate valid quiz questions');
        }
        
    } catch (error) {
        console.error('Error generating quiz questions:', error);
        
        // Fallback: Generate generic technical questions if AI fails
        return generateFallbackQuestions(jobDetails.skills);
    }
};

/**
 * Generates fallback questions if AI fails
 */
function generateFallbackQuestions(skills) {
    const fallbackQuestions = [
        {
            question: "Which of the following best describes the principle of DRY in software development?",
            options: [
                "Deploy Rapidly Yesterday",
                "Don't Repeat Yourself",
                "Develop, Review, Yield",
                "Data Representation Year"
            ],
            correctAnswer: 1,
            difficulty: "easy",
            skill: "General Programming",
            explanation: "DRY stands for Don't Repeat Yourself, a principle aimed at reducing repetition in code."
        },
        {
            question: "What is the time complexity of searching for an element in a balanced binary search tree?",
            options: [
                "O(1)",
                "O(n)",
                "O(log n)",
                "O(n log n)"
            ],
            correctAnswer: 2,
            difficulty: "medium",
            skill: "Data Structures",
            explanation: "In a balanced BST, searching takes O(log n) time as we eliminate half the tree at each step."
        },
        {
            question: "Which HTTP status code indicates that a resource has been successfully created?",
            options: [
                "200 OK",
                "201 Created",
                "204 No Content",
                "302 Found"
            ],
            correctAnswer: 1,
            difficulty: "easy",
            skill: "Web Development",
            explanation: "201 Created is the standard response for successful resource creation in RESTful APIs."
        },
        {
            question: "What is the purpose of indexing in databases?",
            options: [
                "To encrypt sensitive data",
                "To speed up data retrieval operations",
                "To compress data for storage",
                "To validate data integrity"
            ],
            correctAnswer: 1,
            difficulty: "medium",
            skill: "Database",
            explanation: "Indexes improve query performance by allowing faster data retrieval."
        },
        {
            question: "Which of the following is NOT a principle of Object-Oriented Programming?",
            options: [
                "Encapsulation",
                "Inheritance",
                "Compilation",
                "Polymorphism"
            ],
            correctAnswer: 2,
            difficulty: "easy",
            skill: "OOP",
            explanation: "Compilation is a process, not an OOP principle. The four main OOP principles are Encapsulation, Inheritance, Polymorphism, and Abstraction."
        },
        {
            question: "What does the 'git merge' command do?",
            options: [
                "Deletes a branch",
                "Creates a new branch",
                "Combines changes from different branches",
                "Reverts the last commit"
            ],
            correctAnswer: 2,
            difficulty: "medium",
            skill: "Version Control",
            explanation: "Git merge combines changes from one branch into another branch."
        },
        {
            question: "Which design pattern is used to ensure a class has only one instance?",
            options: [
                "Factory Pattern",
                "Observer Pattern",
                "Singleton Pattern",
                "Strategy Pattern"
            ],
            correctAnswer: 2,
            difficulty: "medium",
            skill: "Design Patterns",
            explanation: "The Singleton pattern ensures a class has only one instance and provides global access to it."
        },
        {
            question: "What is the main purpose of unit testing?",
            options: [
                "To test the entire application",
                "To test individual components in isolation",
                "To test user interfaces",
                "To test database connections"
            ],
            correctAnswer: 1,
            difficulty: "easy",
            skill: "Testing",
            explanation: "Unit testing focuses on testing individual components or functions in isolation."
        },
        {
            question: "Which of the following is true about REST APIs?",
            options: [
                "They must use XML for data exchange",
                "They are stateful by design",
                "They use HTTP methods like GET, POST, PUT, DELETE",
                "They require SOAP protocol"
            ],
            correctAnswer: 2,
            difficulty: "medium",
            skill: "API Development",
            explanation: "REST APIs use standard HTTP methods and are stateless by design."
        },
        {
            question: "What is the purpose of a load balancer in system architecture?",
            options: [
                "To store cached data",
                "To distribute traffic across multiple servers",
                "To encrypt network traffic",
                "To compile source code"
            ],
            correctAnswer: 1,
            difficulty: "medium",
            skill: "System Design",
            explanation: "Load balancers distribute incoming traffic across multiple servers to ensure high availability and reliability."
        }
    ];
    
    // Customize questions based on skills if possible
    if (skills && skills.length > 0) {
        // Add skill-specific context to questions
        fallbackQuestions.forEach(q => {
            if (skills.some(skill => q.skill.toLowerCase().includes(skill.toLowerCase()))) {
                q.skill = skills.find(skill => q.skill.toLowerCase().includes(skill.toLowerCase())) || q.skill;
            }
        });
    }
    
    return fallbackQuestions;
}

/**
 * Analyzes video interview responses (placeholder for future implementation)
 */
exports.analyzeVideoInterview = async (transcripts, jobDetails) => {
    // This will be implemented in Phase 3
    return {
        overallScore: 0,
        communicationScore: 0,
        technicalScore: 0,
        confidenceScore: 0,
        feedback: "Video analysis not yet implemented"
    };
};