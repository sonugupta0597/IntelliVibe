// File: server/services/videoAiService.js

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use a specific model optimized for this kind of task
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

/**
 * Generates the first question for the video interview.
 * @param {Object} jobDetails - The job posting details { title, description, skills }
 * @param {string} resumeText - The candidate's resume text.
 * @returns {Promise<string>} A single, insightful opening question.
 */
const generateInitialQuestion = async (jobDetails, resumeText) => {
  const prompt = `
    You are an expert AI technical interviewer conducting a video interview.
    Your tone is professional, encouraging, and conversational.
    The candidate has applied for a "${jobDetails.title}" position.

    Here are the key skills required: ${jobDetails.skills.join(', ')}.

    Below is the candidate's resume. Review it and identify the single most relevant project or experience that aligns with the job description.

    --- RESUME START ---
    ${resumeText}
    --- RESUME END ---

    Based on the resume and the job requirements, formulate ONE concise, open-ended, and engaging opening question.
    Start with a friendly greeting. Do not ask for a generic "tell me about yourself".
    Focus on their most impressive and relevant accomplishment from their resume.

    Example: "Hi, thanks for joining me today. I was really impressed with your work on the Secure Message Transmission Protocol project. Could you walk me through the technical challenges you faced and how you solved them?"

    Your response must be only the question text, without any preamble.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating initial question:", error);
    return "Thank you for joining. Let's start with this: can you tell me about a project you're particularly proud of?";
  }
};

/**
 * Generates a follow-up question based on the conversation history.
 * @param {Array<Object>} transcriptHistory - An array of objects, e.g., [{ speaker: 'AI', text: '...' }, { speaker: 'Candidate', text: '...' }]
 * @param {Object} jobDetails - The job posting details { title, skills }
 * @returns {Promise<string>} A single, relevant follow-up question.
 */
const generateFollowUpQuestion = async (transcriptHistory, jobDetails) => {
    // Convert transcript array to a readable string format
    const conversation = transcriptHistory.map(turn => `${turn.speaker}: ${turn.text}`).join('\n');

    const prompt = `
        You are an expert AI technical interviewer continuing a conversation.
        Your tone is professional and inquisitive.
        The candidate is applying for a "${jobDetails.title}" position requiring skills in: ${jobDetails.skills.join(', ')}.

        Below is the transcript of the conversation so far.

        --- TRANSCRIPT START ---
        ${conversation}
        --- TRANSCRIPT END ---

        Based on the candidate's LAST answer, ask ONE relevant follow-up question.
        - If their answer was strong, probe deeper into a technical aspect they mentioned.
        - If their answer was weak or vague, ask a clarifying question to help them elaborate.
        - If they seem to be straying off-topic, gently guide them back towards the required skills.
        - Do NOT repeat a question that has already been asked.
        - Keep the question concise.

        Example: "That's interesting. You mentioned using AES-256. What was your reasoning for choosing that specific encryption standard over others?"

        Your response must be only the question text, without any preamble.
    `;
    
    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating follow-up question:", error);
        return "Thanks for sharing. Can you tell me more about the technologies you used in that situation?";
    }
};

module.exports = {
  generateInitialQuestion,
  generateFollowUpQuestion,
};