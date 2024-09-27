# transcript

This is a 'in-browser' transcription tool for english and french.
It is based on Whisper, using the 'small' size with quantization, hard-coded to provide a simple UI.

Needed improvements :

- Currently using the high level 'transcriber' so call each 5 second chunk is processed without any relation to the previous one. It would be better to issue a call directly to the model and keep the state
- Buffer size can grow really big if the processing is slower than realtime. There should be a limit to avoird any slowdown and a display of the current level of the buffer
