// transcriptionWorker.js

// Use ES module import to load the Transformers.js library
import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.5.4';

// Wrap your code in an async IIFE
(async () => {
  // Initialize the model
  let transcriber = await pipeline(
    "automatic-speech-recognition",
    "Xenova/whisper-small",
    {
      quantized: true
    }
  );
  let language = "english"

  // Queue to store incoming audio data
  let transcriptionQueue = [];
  let isTranscribing = false;

  // Handle messages from the main thread
  self.onmessage = async (event) => {
    const { command, data, newLanguage } = event.data;

    if (command === 'transcribe') {
      // Add the audio data to the transcription queue
      transcriptionQueue.push(data);
      // Start processing if not already transcribing
      if (!isTranscribing) {
        processQueue();
      }
    } else if (command === 'changeLanguage') {
      // Update the pipeline with the new model
      language = newLanguage;
    } else if (command === 'flush') {
      // Process any remaining data
      if (!isTranscribing && transcriptionQueue.length > 0) {
        processQueue();
      }
    }
  };

  // Function to process the transcription queue
  async function processQueue() {
    isTranscribing = true;
    while (transcriptionQueue.length > 0) {
      const audioData = transcriptionQueue.shift();

      const output = await transcriber(audioData, { language: language, task: 'transcribe' });
      // Send the transcription result back to the main thread
      self.postMessage({ text: output.text });
    }
    isTranscribing = false;
  }
})();
