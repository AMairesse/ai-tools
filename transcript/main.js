(() => {
  let audioContext;
  let audioWorkletNode;
  let audioBuffer = [];
  let isRecording = false;
  let transcriptionWorker;
  let stream;
  const startButton = document.getElementById('startButton')

  // Initialize the transcription worker with type 'module'
  transcriptionWorker = new Worker('transcriptionWorker.js', { type: 'module' });

  // Handle messages from the worker
  transcriptionWorker.onmessage = (event) => {
    const { text } = event.data;
    // Update the display
    const outputArea = document.getElementById("outputAreaMic");
    outputArea.textContent += text + " ";
    outputArea.scrollTop = outputArea.scrollHeight;
  };

  // Function to start recording
  async function startRecording() {
    isRecording = true;

    // Request access to the microphone
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Create an AudioContext
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Load the AudioWorklet processor script
    await audioContext.audioWorklet.addModule("processor.js");

    // Create an AudioWorkletNode
    audioWorkletNode = new AudioWorkletNode(audioContext, "audio-processor");

    // Create a MediaStreamAudioSourceNode from the microphone stream
    const source = audioContext.createMediaStreamSource(stream);

    // Connect the source to the AudioWorkletNode
    source.connect(audioWorkletNode);

    // Initialize a buffer to store incoming audio data
    audioBuffer = [];

    // Set the desired buffer size (e.g., process every 3 seconds of audio)
    const BUFFER_SIZE_IN_SECONDS = 3;
    const desiredBufferSize = 16000 * BUFFER_SIZE_IN_SECONDS; // Data is now at 16 kHz

    // Listen for messages (audio chunks) from the AudioWorkletProcessor
    audioWorkletNode.port.onmessage = (event) => {
      if (!isRecording) return; // Ignore if not recording
      const audioChunk = event.data;

      // Append the new chunk to the audio buffer
      audioBuffer = audioBuffer.concat(Array.from(audioChunk));

      // Check if the buffer has reached the desired size
      if (audioBuffer.length >= desiredBufferSize) {
        // Slice the buffer to get the amount of data we want to process
        const bufferToProcess = audioBuffer.slice(0, desiredBufferSize);

        // Remove the processed data from the buffer
        audioBuffer = audioBuffer.slice(desiredBufferSize);

        // Send the audio data to the transcription worker
        processAudioBuffer(bufferToProcess);
      }
    };
  }

  // Function to stop recording
  function stopRecording() {
    if (!isRecording) return;
    isRecording = false;

    // Disconnect audio nodes
    if (audioWorkletNode) {
      audioWorkletNode.disconnect();
    }

    if (audioContext) {
      audioContext.close();
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    // Send any remaining audio data to the worker
    if (audioBuffer.length > 0) {
      processAudioBuffer(audioBuffer);
      audioBuffer = [];
    }

    // Signal the worker to flush and process any remaining data
    transcriptionWorker.postMessage({ command: 'flush' });
  }

  // Function to process the audio buffer (e.g., send it for transcription)
  function processAudioBuffer(buffer) {
    // Convert the buffer array to a Float32Array
    const audioData = new Float32Array(buffer);

    // Send the audio data to the transcription worker
    transcriptionWorker.postMessage({ command: 'transcribe', data: audioData });
  }

  function processButton() {
    if (isRecording === true) {
      startButton.disabled = true
      startButton.textContent = "Processing"
      stopRecording()
      startButton.textContent = "Start recording"
      startButton.disabled = false
    }
    else {
      startButton.disabled = true
      startButton.textContent = "Processing"
      startRecording()
      startButton.textContent = "Stop recording"
      startButton.disabled = false
    }
  }

  function changeTranscriptionModel(newLanguage) {
    transcriptionWorker.postMessage({ command: 'changeLanguage', newLanguage: newLanguage });
  }

  frenchButton = document.getElementById('french')
  englishButton = document.getElementById('english')
  frenchButton.addEventListener('click', function() {
    frenchButton.disabled = true;
    englishButton.disabled = false;
    changeTranscriptionModel("french");
  });
  englishButton.addEventListener('click', function() {
    englishButton.disabled = true;
    frenchButton.disabled = false;
    changeTranscriptionModel("english");
  });

  // Attach the function to the button
  document.getElementById('startButton').addEventListener('click', processButton);
})();
