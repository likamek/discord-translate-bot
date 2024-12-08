import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import axios from 'axios';
import { franc } from 'franc-min';
import express from 'express'; // Import Express
dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.MessageReactions, // Add this to track reactions
    ],
});

const API_URL = 'https://api.mymemory.translated.net/get';
const DEFAULT_LANG = 'en'; // Default fallback target language
const TRANSLATE_EMOJI = '💭'; // Discord thought balloon emoji :thought_balloon:

// Detect language logic remains the same
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

// Event handler for reactions added to messages
client.on('messageReactionAdd', async (reaction, user) => {
    // Ignore reactions from bots
    if (user.bot) return;

    // Check if the emoji is the one we want (💭 in this case)
    if (reaction.emoji.name !== TRANSLATE_EMOJI) return;

    // Get the message that was reacted to
    const message = reaction.message;

    // Detect the language of the message
    const sourceLang = detectLanguage(message.content);

    const member = await message.guild.members.fetch(user.id);
    const targetLang = member.user.locale.split('-')[0] || DEFAULT_LANG; // Detect user's system language (fallback to default if not set)

    // Translate the message
    const translatedText = await translateText(message.content, sourceLang, targetLang);

    if (!translatedText) return;

    // Send the translation as an ephemeral message (visible only to the user who reacted)
    try {
        await message.reply({
            content: translatedText,
            ephemeral: true, // Makes the message ephemeral
        });
    } catch (err) {
        console.error('Error sending translation:', err);
    }
});

// Set up an Express server to keep the bot alive and listen on a port
const app = express();

// Basic route for health check (useful for UptimeRobot)
app.get('/', (req, res) => {
    res.send('Bot is running');
});

// Start the Express server on a specified port (e.g., 3000)
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

// Log in to Discord
client.login(process.env.BOT_TOKEN);
