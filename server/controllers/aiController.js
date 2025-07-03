const { generateJobDescription } = require('../services/aiService');

const generateJobDescriptionHandler = async (req, res) => {
  try {
    const jobDetails = req.body;
    const description = await generateJobDescription(jobDetails);
    res.json({ description });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to generate job description' });
  }
};

module.exports = { generateJobDescriptionHandler }; 