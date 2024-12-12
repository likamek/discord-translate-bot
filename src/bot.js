const { Client, GatewayIntentBits } = require('discord.js');
const { translateText } = require('./src/translations');  // Adjusted path for translations.js
const { transcribeVoice } = require('./src/transcribe');  // Adjusted path for transcribe.js
const { handleLiveChat } = require('./src/liveChat');  // Adjusted path for liveChat.js
const { config } = require('./src/config');  // Adjusted path for config.js
const { logError } = require('./src/utils');  // Adjusted path for utils.js

// Initialize Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Login to Discord with your app's token
client.login(config.DISCORD_BOT_TOKEN);

// Handle incoming messages
client.on('messageCreate', async (message) => {
    try {
        if (message.author.bot) return; // Ignore bot messages

        // Auto-detect language and translate the message
        if (message.content) {
            await translateText(message);
        }

        // Check if the message is a voice message
        if (message.attachments.size > 0) {
            const voiceMessage = message.attachments.first();
            if (voiceMessage.contentType.startsWith('audio/')) {
                await transcribeVoice(message, voiceMessage);
            }
        }
    } catch (error) {
        logError(error, 'Error processing message');
    }
});

// Handle live voice chat commands
client.on('voiceStateUpdate', async (oldState, newState) => {
    try {
        if (newState.channel && newState.channel.id === config.LIVE_CHAT_CHANNEL_ID) {
            await handleLiveChat(newState);
        }
    } catch (error) {
        logError(error, 'Error in live chat');
    }
});
