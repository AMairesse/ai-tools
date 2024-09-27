// main.js

// Get references to HTML elements
const video = document.getElementById('videoElement');
const captureButton = document.getElementById('captureButton');
const capturedImage = document.getElementById('capturedImage');
const ocrResults = document.getElementById('ocrResults');

// Constraints for accessing the rear camera
const constraints = {
  video: { facingMode: { ideal: 'environment' } },
  audio: false,
};

// Start the video stream
navigator.mediaDevices.getUserMedia(constraints)
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => {
    console.error('Error accessing camera: ', err);
    alert('Could not access the camera. Please ensure you are using a secure connection (HTTPS) and that you have granted camera access permissions.');
  });

// Create the web worker
const ocrWorker = new Worker('worker.js',  { type: 'module' });

// Receive messages from the worker
ocrWorker.onmessage = function (e) {
  const text = e.data;
  ocrResults.value += text + '\n';
};

// Handle the capture button click event
captureButton.addEventListener('click', () => {
  // Create a canvas to capture the current frame from the video
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Convert the canvas image to a data URL
  const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
  //const imageDataUrl = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/handwriting.jpg';

  // Display the captured image
  capturedImage.src = imageDataUrl;
  capturedImage.style.display = 'block';

  // Send the image data URL to the web worker for OCR processing
  ocrWorker.postMessage({ imageUrl: imageDataUrl });
});
