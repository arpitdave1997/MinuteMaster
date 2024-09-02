// Request access to the microphone
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        console.log('Microphone access granted.');
        // Handle the audio stream here (e.g., create an audio context, process audio)
    })
    .catch(err => {
        console.error('Microphone access denied:', err);
        // Handle the error, such as displaying a message to the user
    });
