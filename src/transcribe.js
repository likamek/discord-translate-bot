const { translateText } = require('./src/translations');  // Adjusted path for translations.js
const { transcribeVoice } = require('./src/transcribe');  // Adjusted path for transcribe.js
const { logError } = require('./src/utils');  // Adjusted path for utils.js

// Handle live chat transcription and translation
async function handleLiveChat(voiceState) {
    try {
        const connection = await voiceState.channel.join();
        const transcriptionThread = await voiceState.channel.send('Transcribing live chat...');

        connection.on('speaking', async (user, speaking) => {
            if (speaking) {
                const audioBuffer = await getAudioBuffer(user);  // Your method for getting audio buffer
                const transcription = await transcribeVoice(user, audioBuffer);
                const translatedText = await translateText(transcription);
                transcriptionThread.send(`${user.username}: ${translatedText}`);
            }
        });
    } catch (error) {
        logError(error, 'Error in live chat transcription');
    }
}

module.exports = { handleLiveChat };
