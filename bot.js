import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import axios from 'axios';
import { franc } from 'franc-min';
import express from 'express'; // Import Express
dotenv.config();

// Ensure correct intents are set
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers, // GuildMembers intent is essential for fetching members
        GatewayIntentBits.Reactions, // Added reaction intent to detect reactions
    ],
});

const API_URL = 'https://api.mymemory.translated.net/get';
const DEFAULT_LANG = 'en'; // Default fallback target language
const TRANSLATE_EMOJI = '💭'; // Discord thought balloon emoji :thought_balloon:

// Detect language logic remains the same
function detectLanguage(text) {
    const lang = franc(text);
    return lang || DEFAULT_LANG; // Return detected language or fallback to default if undetected
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

// Event handler for reactions added to messages
client.on('messageReactionAdd', async (reaction, user) => {
    console.log('Reaction added:', reaction.emoji.name); // Log the emoji name to ensure the event is triggered

    // Ignore reactions from bots
    if (user.bot) return;

    // Check if the emoji is the one we want (💭 in this case)
    if (reaction.emoji.name !== TRANSLATE_EMOJI) return;

    //
