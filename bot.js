import dotenv from 'dotenv';
import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import axios from 'axios';
import { franc } from 'franc-min';
import express from 'express';

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const API_URL = 'https://api.mymemory.translated.net/get';
const DEFAULT_LANG = 'en'; // Default fallback target language

// Initialize express app
const app = express();

const ISO6393_TO_ISO6391 = {
    // ... (same as before)
};

// Detect the language of the input text
function detectSourceLanguage(text) {
    // Check if the text contains Hebrew or other RTL languages manually
    if (/[\u0590-\u05FF]/.test(text)) {
        return 'he';  // Hebrew detected
    }
    
    const lang = franc(text);
    return ISO6393_TO_ISO6391[lang] || DEFAULT_LANG;
}

// Detect the preferred language of the user
function detectTargetLanguage(member) {
    const locale = member?.user?.locale;
    return locale ? locale.split('-')[0] : DEFAULT_LANG;
}

// Translate text using MyMemory API
async function translateText(text, sourceLang, targetLang) {
    if (sourceLang === targetLang) {
        return text; // Return the text as-is if source and target are the same
    }

    try {
        const response = await axios.get(API_URL, {
            params: {
                q: text,
                langpair: `${sourceLang}|${targetLang}`,
            },
        });

        console.log('API Response:', response.data); // Log the API response for debugging

        const translatedText = response.data.responseData.translatedText;
        if (!translatedText) throw new Error('Translation failed');

        return translatedText;
    } catch (error) {
        console.error('Error during translation:', error.message || error);
        return null;
    }
}

// Event handler when the bot is ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Event handler for message creation
client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;

    const sourceLang = detectSourceLanguage(message.content);
    const targetLang = detectTargetLanguage(message.member);

    // Log the detected languages for debugging
    console.log(`Detected Source Language: ${sourceLang}`);
    console.log(`Detected Target Language: ${targetLang}`);

    // If the source and target languages are the same, do nothing (no reply)
    if (sourceLang === targetLang) return;

    const translatedText = await translateText(message.content, sourceLang, targetLang);

    if (translatedText && translatedText !== message.content) {
        // Log the translated text for debugging
        console.log('Translated Text:', translatedText);

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setDescription(translatedText);  // Simplified design, no extra background/lines

        // Send the translated text as a single embed reply
        message.reply({ embeds: [embed] });
    } else if (translatedText && translatedText === message.content) {
        // If translation returned the same text (e.g., Hebrew or same text)
        message.reply(`Translation is the same as the original text: ${translatedText}`);
    } else {
        message.reply('Translation failed or text is identical.');
    }
});

// Log in to Discord
client.login(process.env.BOT_TOKEN);

// Express server to listen on the assigned port
const port = process.env.PORT || 10000;  // Use the Render-provided port
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
