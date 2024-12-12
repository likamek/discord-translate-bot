const { translateText } = require('./translations');
const { transcribeVoice } = require('./transcribe');
const { logError } = require('./utils');

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
