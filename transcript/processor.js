// processor.js

class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // Buffer to store incoming audio data
    this.buffer = [];
    // Input and output sample rates
    this.inputSampleRate = sampleRate; // 'sampleRate' is a global variable in AudioWorkletProcessor
    this.outputSampleRate = 16000;     // Desired output sample rate
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];

    if (input.length > 0) {
      const samples = input[0];
      
      // Append incoming samples to the buffer
      this.buffer.push(...samples);

      // Calculate the number of samples needed for downsampling
      const sampleRateRatio = this.inputSampleRate / this.outputSampleRate;
      const outputBufferLength = Math.floor(this.outputSampleRate / 10); // For example, process every 100ms
      const inputBufferLength = Math.ceil(outputBufferLength * sampleRateRatio);

      // Check if we have enough samples to process
      if (this.buffer.length >= inputBufferLength) {
        // Extract the segment to process
        const inputBuffer = this.buffer.slice(0, inputBufferLength);
        this.buffer = this.buffer.slice(inputBufferLength);

        // Perform downsampling
        const outputBuffer = this.downsampleBuffer(inputBuffer, sampleRateRatio);

        // Send the downsampled data to the main thread
        this.port.postMessage(outputBuffer);
      }
    }

    return true;
  }

  downsampleBuffer(buffer, sampleRateRatio) {
    const outputLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Float32Array(outputLength);
    
    let offsetResult = 0;
    let offsetBuffer = 0;
    
    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      
      // Calculate the average value of the samples to downsample
      let accum = 0;
      let count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }
      result[offsetResult] = accum / count;
      
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    
    return result;
  }
}

registerProcessor('audio-processor', AudioProcessor);
