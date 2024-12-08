import dotenv from 'dotenv';
import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import axios from 'axios';
import { franc } from 'franc-min';
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

// Map of ISO6393 to ISO6391 codes
const ISO6393_TO_ISO6391 = {
    // Simplified language mappings for brevity
    'eng': 'en',
    'ita': 'it',
    'rus': 'ru',
    'spa': 'es',
    'fra': 'fr',
    'deu': 'de',
    'zho': 'zh',
    // Add more languages as needed
};

function detectLanguage(text) {
    const lang = franc(text);
    return ISO6393_TO_ISO6391[lang] || DEFAULT_LANG;
}

// Translate text using MyMemory API
async function translateText(text, sourceLang, targetLang) {
    if (sourceLang === targetLang) {
        return text; // Skip translation if source and target are the same
    }

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

// Event handler for message creation
client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;

    const sourceLang = detectLanguage(message.content);

    // Fetch all members of the channel
    const guild = message.guild;
    if (!guild) return;

    try {
        const members = await guild.members.fetch();
        const embedPromises = members.map(async (member) => {
            // Skip bots or members without a valid locale
            if (member.user.bot || !member.user.locale) return;

            const targetLang = member.user.locale.split('-')[0];
            const translatedText = await translateText(
                message.content,
                sourceLang,
                targetLang
            );

            if (!translatedText) return;

            // Send the translation text privately to the member
const messageContent = `Here is the translation:\n\n${translatedText}`;

await member.send(messageContent).catch((err) => {
    console.error(`Failed to send DM to ${member.user.tag}:`, err);
});

// Wait for all promises to resolve
await Promise.all(embedPromises);


// Log in to Discord
client.login(process.env.BOT_TOKEN);