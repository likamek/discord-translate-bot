require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const franc = require('franc-min');

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const API_URL = process.env.API_URL || 'https://api.mymemory.translated.net/get';

// Function to detect the language of a message using franc
function detectMessageLanguage(messageContent) {
    const langCode = franc(messageContent);
    return langCode === 'und' ? 'en' : langCode; // Default to English if undetermined
}

// Translation function using MyMemory API
async function translateText(text, sourceLang, targetLang) {
    try {
        const response = await axios.get(API_URL, {
            params: {
                q: text,
                langpair: `${sourceLang}|${targetLang}`,
            },
        });

        const translatedText = response.data.responseData.translatedText;
        if (!translatedText) throw new Error('Translation failed');
        return translatedText;
    } catch (error) {
        console.error('Error during translation:', error.message || error);
        return null;
    }
}

// Event handler when bot is ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Event handler for message creation
client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;

    // Detect the language of the message
    const sourceLang = detectMessageLanguage(message.content);

    // Detect the target language from the author's system language
    const targetLang = message.member?.user.locale?.split('-')[0] || 'en';

    // Skip translation if source and target languages are the same
    if (sourceLang === targetLang) return;

    console.log(`Translating: "${message.content}" from ${sourceLang} to ${targetLang}`);

    // Translate the message
    const translatedText = await translateText(message.content, sourceLang, targetLang);

    if (translatedText) {
        message.reply(translatedText); // Send just the translated text
    } else {
        message.reply('❌ Failed to translate the message.');
    }
});

// Log in to Discord
client.login(process.env.BOT_TOKEN);
