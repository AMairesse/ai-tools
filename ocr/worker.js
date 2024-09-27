// worker.js

// Import Transformer.js library
import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

(async () => {
    // Function to load the OCR model
    async function loadModel() {
      // TODO : switch with nanoLLaVA when transformer v3 will be released
      const model = await pipeline('image-to-text', 'Xenova/trocr-small-handwritten');
      return model;
    }

    // Load the model when the worker starts
    let modelPromise = loadModel();

    // Handle messages from the main thread
    onmessage = async function (e) {
        const { imageUrl } = e.data; // Change to receive imageUrl

        // Wait for the model to be loaded
        const model = await modelPromise;

        try {
            // Perform OCR on the image
            const result = await model(imageUrl);
            // Send the recognized text back to the main thread
            postMessage(result[0].generated_text.trim());
        } catch (err) {
            console.error('Error during OCR processing:', err);
            postMessage('Error: Could not process the image.');
        }
    };
})();