require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const franc = require('franc-min'); // Language detection library

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const API_URL = process.env.API_URL || 'https://api.mymemory.translated.net/get';
const DEFAULT_LANG = 'en'; // Default fallback target language

// Function to detect user language from Discord settings
function detectLanguage(member) {
    const locale = member.user.locale;
    return locale ? locale.split('-')[0] : DEFAULT_LANG; // Extract "en" from "en-US"
}

// Function to detect the language of a given text
function detectMessageLanguage(text) {
    const lang = franc(text); // Detect language using franc
    return lang === 'und' ? DEFAULT_LANG : lang; // If undetermined, fallback to default language
}

// Translation function using MyMemory API
async function translateText(text, sourceLang, targetLang) {
    try {
        // If source and target languages are the same, don't translate
        if (sourceLang === targetLang) {
            console.log('Source and target languages are the same, returning original text.');
            return text; // Return the original text if source and target are the same
        }

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

    // Detect the target language from the author's settings (system language)
    const targetLang = detectLanguage(message.member) || 'en'; // Fallback to English
    const sourceLang = detectMessageLanguage(message.content); // Detect source language from the message content

    console.log(`User language detected: ${targetLang}`);
    console.log(`Translating text: ${message.content} from ${sourceLang} to ${targetLang}`);

    // Translate the message
    const translatedText = await translateText(message.content, sourceLang, targetLang);

    if (translatedText) {
        const embed = new EmbedBuilder()
            .setTitle('Translated Message')
            .setColor(0x00FF00)
            .addFields(
                { name: 'Original', value: message.content },
                { name: 'Translated', value: translatedText }
            )
            .setFooter({ text: `Translated to ${targetLang.toUpperCase()}` });

        message.reply({ embeds: [embed] });
    } else {
        message.reply('❌ Failed to translate the message.');
    }
});

// Log in to Discord
client.login(process.env.BOT_TOKEN);
