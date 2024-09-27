# transcript

This is an 'in-browser' transcription tool for English and French.
It is based on Whisper, using the 'small' size with quantization, hard-coded to provide a simple UI.

Needed improvements:

- Currently, we are using the high-level 'transcriber', so each 5-second chunk is processed without any relation to the previous one. It would be better to issue a call directly to the model and maintain the state.
- The buffer size can grow very large if the processing is slower than real-time. There should be a limit to avoid any slowdown and a display of the current level of the buffer.
