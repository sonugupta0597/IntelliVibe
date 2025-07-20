// File: server/services/videoAiService.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');


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
    console.error("CRITICAL: Error generating initial question with Gemini.", {
        errorMessage: error.message,
        errorDetails: error.details,
        errorStack: error.stack,
    });
    return "Thank you for joining. Let's start with this: can you tell me about a project you're particularly proud of?";
  }
};

// ... (keep the existing getGenerativeModel and generateInitialQuestion functions)

/**
 * Generates a follow-up question based on the conversation history.
 * @param {Array<Object>} transcriptHistory - An array of objects, e.g., [{ speaker: 'AI', text: '...' }, { speaker: 'Candidate', text: '...' }]
 * @param {Object} jobDetails - The job posting details { title, skills }
 * @returns {Promise<string>} A single, relevant follow-up question.
 */
const generateFollowUpQuestion = async (transcriptHistory, jobDetails) => {
    let conversation;
    // Defensive check: If we receive a plain string, treat it as the candidate's last answer.
    if (Array.isArray(transcriptHistory)) {
        conversation = transcriptHistory.map(turn => `${turn.speaker}: ${turn.text}`).join('\n');
    } else if (typeof transcriptHistory === 'string') {
        conversation = `Candidate: ${transcriptHistory}`;
    } else {
        // Fallback if the input is invalid
        conversation = "The candidate has just finished speaking.";
    }

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
        - Do NOT repeat a question that has already been asked. Keep the question concise.

        Your response must be only the question text, without any preamble.
    `;
    
    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Error generating follow-up question:", error);
        return "Thank you for that explanation. Can you elaborate on the specific technologies you used?";
    }
};

const analyzeInterviewTranscript = async (transcript, jobDetails) => {
    const prompt = `
        You are an expert AI recruitment analyst. Your task is to evaluate a candidate's video interview transcript for a "${jobDetails.title}" position.

        The required skills for this job are: ${jobDetails.skills.join(', ')}.

        --- INTERVIEW TRANSCRIPT ---
        ${transcript}
        --- END TRANSCRIPT ---

        Please provide a structured JSON response with the following fields:
        1.  "score": An integer between 0 and 100, representing how well the candidate's answers align with the job requirements. A score above 75 indicates a strong candidate.
        2.  "summary": A brief, neutral summary of the interview, highlighting the key points discussed.
        3.  "status": A string, either "AI Interview Passed" or "AI Interview Failed", based on the score.

        Your response must be only the JSON object, without any preamble.
    `;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        // Extract the JSON part from the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Invalid JSON response from AI.");
    } catch (error) {
        console.error("Error analyzing interview transcript:", error);
        return {
            score: 0,
            summary: "Could not analyze the interview transcript.",
            status: "AI Interview Failed",
        };
    }
};

module.exports = {
  generateInitialQuestion,
  generateFollowUpQuestion,
  analyzeInterviewTranscript,
};