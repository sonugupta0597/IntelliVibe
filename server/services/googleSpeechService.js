const fs = require('fs');
const speech = require('@google-cloud/speech');
const path = require('path');

// Explicitly load the credentials file
const credentialsPath = path.join(__dirname, '..', 'google-credentials.json');
const client = new speech.SpeechClient({
  keyFilename: credentialsPath
});

async function transcribeAudioFile(filePath) {
  const file = fs.readFileSync(filePath);
  const audioBytes = file.toString('base64');

  const audio = { content: audioBytes };
  const config = {
    encoding: 'WEBM_OPUS',
    sampleRateHertz: 48000, // Google expects 48000 Hz for WEBM_OPUS
    languageCode: 'en-US',
  };
  const request = { audio, config };

  const [response] = await client.recognize(request);
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  return transcription;
}

function startStreamingRecognize(onTranscript, onError) {
  const request = {
    config: {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: 'en-US',
      interimResults: true,
    },
    interimResults: true,
  };

  const recognizeStream = client
    .streamingRecognize(request)
    .on('error', (err) => {
      if (onError) onError(err);
    })
    .on('data', (data) => {
      if (onTranscript && data.results[0] && data.results[0].alternatives[0]) {
        onTranscript({
          transcript: data.results[0].alternatives[0].transcript,
          isFinal: data.results[0].isFinal,
        });
      }
    });

  return recognizeStream;
}

module.exports = { transcribeAudioFile, startStreamingRecognize }; 