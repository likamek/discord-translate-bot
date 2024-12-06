require('dotenv').config(); // Make sure you're using .env to store sensitive info like token and API URL
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

// Create a new Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Set up your translate function
async function translateMessage(message, targetLang) {
    const text = message.content; // Get the message content
    
    console.log(`Attempting to translate: ${text}`);

    try {
        // Sending the POST request to the Argos Open Tech API
        const response = await axios.post(process.env.API_URL, {
            q: text,        // The text you want to translate
            source: 'auto', // Auto-detect the source language
            target: targetLang // The language to translate to (e.g., 'es' for Spanish)
        });

        // Log the response data for debugging
        console.log('Translation Response:', response.data);

        // Check if we have a valid translation and return it
        if (response.data.translatedText) {
            return response.data.translatedText;
        } else {
            console.log('Failed to get translated text:', response.data);
            return 'Translation failed';  // Return fallback message
        }
    } catch (error) {
        console.error('Error during translation:', error);
        return 'Failed to translate the message';  // Return error message
    }
}

// When the bot logs in and is ready
client.once('ready', () => {
    console.log('Bot is logged in and ready!');
    client.user.setActivity('Translating messages', { type: 'WATCHING' });
});

// Handling incoming messages
client.on('messageCreate', async (message) => {
    // Ignore messages from other bots
    if (message.author.bot) return;

    // Example: Set target language to Spanish ('es'). You can change this dynamically if needed
    const targetLang = 'es';  // You can replace this with logic to get user system language

    try {
        // Call the translateMessage function
        const translatedText = await translateMessage(message, targetLang);
        
        // Send the translated text as a reply
        message.reply(translatedText);
    } catch (error) {
        console.error('Error translating message:', error);
        message.reply('Failed to translate the message.');  // Fallback error message
    }
});

// Log in with your bot token (replace with your actual token)
client.login(process.env.BOT_TOKEN);
