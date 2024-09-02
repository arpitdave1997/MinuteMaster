// Check if the Web Speech API is supported
if (!('webkitSpeechRecognition' in window)) {
    alert('Web Speech API is not supported in this browser.');
} else {
    // Initialize the speech recognition object
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true; // Keep recognizing until stopped
    recognition.interimResults = false; // Get final results only
    recognition.lang = 'en-US'; // Set the language

    // Get the button and text area elements
    const startButton = document.getElementById('start-recording');
    const transcriptionArea = document.getElementById('transcription');

    // Start recording when button is clicked
    startButton.addEventListener('click', () => {
        recognition.start();
    });

    // Handle the results
    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        transcriptionArea.value += transcript + ' ';
    };

    // Handle errors
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
    };

    // Handle the end of the recording
    recognition.onend = () => {
        console.log('Speech recognition service disconnected');
    };
}
