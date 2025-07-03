const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyzes a resume against a job description using AI
 */
exports.analyzeResume = async (resumeText, jobDetails) => {
    try {
        const prompt = `You are an expert technical recruiter. Analyze this resume against the job requirements and provide a detailed assessment.

Job Details:
- Title: ${jobDetails.title}
- Company: ${jobDetails.companyName}
- Required Skills: ${jobDetails.skills?.join(', ') || 'Not specified'}
- Description: ${jobDetails.description}
- Experience Level: ${jobDetails.experienceLevel || 'Not specified'}

Resume Text:
${resumeText}

Analyze the candidate's fit for this position considering:
1. Technical skills match (most important)
2. Relevant experience and projects
3. Educational background
4. Industry/domain knowledge
5. Years of experience

Provide a response in JSON format:
{
  "matchScore": <0-100>,
  "justification": "<2-3 sentences explaining the score>",
  "strengths": ["strength1", "strength2", "strength3"],
  "gaps": ["gap1", "gap2", "gap3"],
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"]
}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a technical recruiter with expertise in evaluating candidates. Always respond with valid JSON only.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.3,
            max_tokens: 500,
        });

        const content = response.choices[0].message.content;
        
        try {
            const result = JSON.parse(content);
            
            // Validate and sanitize the response
            result.matchScore = Math.max(0, Math.min(100, result.matchScore));
            
            return {
                matchScore: result.matchScore,
                justification: result.justification || 'Analysis completed.',
                strengths: result.strengths || [],
                gaps: result.gaps || [],
                matchedSkills: result.matchedSkills || [],
                missingSkills: result.missingSkills || []
            };
        } catch (parseError) {
            console.error('Error parsing AI response:', parseError);
            return {
                matchScore: 0,
                justification: 'Unable to properly analyze the resume at this time.',
                strengths: [],
                gaps: [],
                matchedSkills: [],
                missingSkills: []
            };
        }
    } catch (error) {
        console.error('Error in AI resume analysis:', error);
        throw new Error('Failed to analyze resume: ' + error.message);
    }
};

/**
 * Generates technical quiz questions based on job requirements
 */
exports.generateQuizQuestions = async (jobDetails) => {
    try {
        const prompt = `You are an expert technical interviewer. Generate a technical skills assessment quiz for the following position:

Job Title: ${jobDetails.title}
Required Skills: ${jobDetails.skills?.join(', ') || 'Not specified'}
Job Description: ${jobDetails.description}

Create exactly 10 multiple-choice questions that:
1. Test practical, hands-on knowledge of the required skills
2. Include real-world scenarios and problem-solving
3. Range from basic to advanced difficulty
4. Focus on technical concepts, best practices, and common challenges
5. Are specific to the technologies and skills mentioned

For each question:
- Make options plausible to avoid obvious answers
- Include common misconceptions as distractors
- Ensure only one option is clearly correct
- Provide a brief explanation for the correct answer

Return a JSON array with exactly 10 questions in this format:
[
  {
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of why this is correct",
    "difficulty": "easy|medium|hard",
    "skill": "specific skill being tested"
  }
]`;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a technical interviewer creating assessment questions. Generate exactly 10 questions. Always respond with valid JSON array only.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 2500,
        });

        const content = response.choices[0].message.content;
        
        try {
            const questions = JSON.parse(content);
            
            // Validate the questions
            if (!Array.isArray(questions) || questions.length !== 10) {
                throw new Error('Invalid number of questions generated');
            }
            
            // Ensure all questions have required fields
            const validatedQuestions = questions.map((q, index) => ({
                question: q.question || `Question ${index + 1}`,
                options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
                correctAnswer: typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer <= 3 ? q.correctAnswer : 0,
                explanation: q.explanation || 'No explanation provided',
                difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
                skill: q.skill || 'General'
            }));
            
            return validatedQuestions;
        } catch (parseError) {
            console.error('Error parsing quiz questions:', parseError);
            throw new Error('Failed to generate valid quiz questions');
        }
    } catch (error) {
        console.error('Error generating quiz questions:', error);
        throw new Error('Failed to generate quiz: ' + error.message);
    }
};

/**
 * Generates video interview questions based on job requirements and quiz performance
 */
exports.generateVideoInterviewQuestions = async (jobDetails, quizScore) => {
    try {
        const prompt = `Generate 5 technical video interview questions for a ${jobDetails.title} position.

The candidate scored ${quizScore}% on the technical quiz.
Required skills: ${jobDetails.skills?.join(', ')}

Create questions that:
1. Test problem-solving and technical thinking
2. Assess communication skills
3. Explore real-world experience
4. Include at least one system design or architecture question
5. Match the candidate's demonstrated skill level

Format as JSON array:
[
  {
    "question": "Question text",
    "timeLimit": 120,
    "category": "technical|problem-solving|experience|system-design",
    "assessmentCriteria": ["criteria1", "criteria2"],
    "followUp": "Optional follow-up question"
  }
]`;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a senior technical interviewer. Create thoughtful video interview questions.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.6,
            max_tokens: 1000,
        });

        const content = response.choices[0].message.content;
        return JSON.parse(content);
    } catch (error) {
        console.error('Error generating video questions:', error);
        throw new Error('Failed to generate video interview questions');
    }
};

/**
 * Analyzes video interview transcript
 */
exports.analyzeVideoInterview = async (transcript, questions, jobDetails) => {
    try {
        const prompt = `Analyze this video interview transcript for a ${jobDetails.title} position.

Questions and Answers:
${transcript}

Evaluate:
1. Technical accuracy and knowledge depth
2. Communication clarity
3. Problem-solving approach
4. Relevant experience mentioned
5. Red flags or concerns

Provide scores (0-100) and detailed feedback in JSON format.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert interviewer analyzing candidate responses.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.3,
            max_tokens: 800,
        });

        const content = response.choices[0].message.content;
        return JSON.parse(content);
    } catch (error) {
        console.error('Error analyzing video interview:', error);
        throw new Error('Failed to analyze video interview');
    }
};