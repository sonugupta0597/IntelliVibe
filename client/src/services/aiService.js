const OpenAI = require('openai');
require('dotenv').config();

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
const analyzeResume = async (resumeText, jobDetails) => {
  try {
    const prompt = `You are an expert recruitment AI assistant. Analyze the following resume against the job requirements and provide a match score.

Job Details:
- Title: ${jobDetails.title}
- Company: ${jobDetails.company}
- Required Skills: ${jobDetails.skills?.join(', ') || 'Not specified'}
- Description: ${jobDetails.description}
- Experience Required: ${jobDetails.experienceLevel || 'Not specified'}

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
 * Generates quiz questions for a specific job
 * @param {Object} jobDetails - The job posting details
 * @returns {Promise<Array>} Array of quiz questions
 */
const generateQuizQuestions = async (jobDetails) => {
  // This function will be implemented in Phase 2
  // Placeholder for future implementation
  try {
    const prompt = `Generate 5 multiple-choice questions to test candidates for the following position:

Job Title: ${jobDetails.title}
Required Skills: ${jobDetails.skills?.join(', ') || 'Not specified'}
Description: ${jobDetails.description}

Create technical questions that test practical knowledge of the required skills.

Respond with a JSON array of questions, each with this structure:
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0 // Index of the correct option (0-3)
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a technical interviewer. Create challenging but fair multiple-choice questions. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 800,
    });

    const content = response.choices[0].message.content;
    const questions = JSON.parse(content);
    
    return questions;
  } catch (error) {
    console.error('Error generating quiz questions:', error);
    throw new Error('Failed to generate quiz questions: ' + error.message);
  }
};

module.exports = {
  analyzeResume,
  generateQuizQuestions,
};