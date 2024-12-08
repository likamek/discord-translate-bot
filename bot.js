import dotenv from 'dotenv';
import { Client, GatewayIntentBits, IntentsBitField } from 'discord.js'; // Correct import of IntentsBitField
import axios from 'axios';
import { franc } from 'franc-min';
import express from 'express'; // Import Express
dotenv.config();

// Correctly define the intents using IntentsBitField.Flags
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,             // For general guild events
        IntentsBitField.Flags.GuildMessages,      // To read messages
        IntentsBitField.Flags.MessageContent,     // To read the content of messages
        IntentsBitField.Flags.GuildMembers,       // For member data
        IntentsBitField.Flags.MessageReactions,   // For listening to reactions
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

    // Get the message that was reacted to
    const message = reaction.message;

    // Fetch the full message if needed
    await message.fetch();
    console.log('Fetched message:', message.content);

    // Detect the language of the message
    const sourceLang = detectLanguage(message.content);
    console.log('Detected source language:', sourceLang);

    // Add try-catch around member fetching and handle timeout gracefully
    try {
        const member = await message.guild.members.fetch(user.id, { cache: true, timeout: 5000 }); // Added timeout (in ms)
        const targetLang = member.user.locale.split('-')[0] || DEFAULT_LANG; // Detect user's system language (fallback to default if not set)
        console.log('Target language:', targetLang);

        // Translate the message
        const translatedText = await translateText(message.content, sourceLang, targetLang);

        if (!translatedText) return;

        // Send the translation as an ephemeral message (visible only to the user who reacted)
        try {
            await message.reply({
                content: translatedText,
                ephemeral: true, // Makes the message ephemeral
            });
            console.log('Sent translated message');
        } catch (err) {
            console.error('Error sending translation:', err);
        }
    } catch (error) {
        console.error('Error fetching member data:', error.message);
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
