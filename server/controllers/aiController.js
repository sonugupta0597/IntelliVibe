const { generateJobDescription } = require('../services/aiService');
const path = require('path');
const fs = require('fs');
const { transcribeAudioFile } = require('../services/googleSpeechService');

const generateJobDescriptionHandler = async (req, res) => {
  try {
    const jobDetails = req.body;
    const description = await generateJobDescription(jobDetails);
    res.json({ description });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to generate job description' });
  }
};

exports.speechToText = async (req, res) => {
  let tempPath;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }
    // Save the uploaded file temporarily
    tempPath = path.join(__dirname, '..', 'uploads', `${Date.now()}-${req.file.originalname}`);
    fs.writeFileSync(tempPath, req.file.buffer);

    // Transcribe using Google Speech-to-Text
    const transcript = await transcribeAudioFile(tempPath);

    // Clean up temp file
    fs.unlinkSync(tempPath);

    res.json({ text: transcript });
  } catch (error) {
    if (tempPath && fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    console.error('[SpeechToText Error]', error.stack || error);
    res.status(500).json({ error: error.message, details: error.stack });
  }
};

module.exports = { generateJobDescriptionHandler, speechToText: exports.speechToText }; 