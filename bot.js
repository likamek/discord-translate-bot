import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import axios from 'axios';
import { franc } from 'franc-min';
import express from 'express'; // Import Express

dotenv.config();
console.log("Starting bot...");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

console.log("Bot intents:", client.options.intents); // Debugging: log intents

const API_URL = 'https://api.mymemory.translated.net/get';
const DEFAULT_LANG = 'en'; // Default fallback target language
const TRANSLATE_EMOJI = '❤️'; // Discord thought balloon emoji :thought_balloon:

function detectLanguage(text) {
    const lang = franc(text);
    return lang || DEFAULT_LANG;
}

async function translateText(text, sourceLang, targetLang) {
    if (sourceLang === targetLang) {
        return text;
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

    // Log the reaction emoji and the user who reacted
    console.log(`Reaction added: ${reaction.emoji.name} by user ${user.tag}`);

    // Check if the emoji is the one we want (💭 in this case)
    if (reaction.emoji.name !== TRANSLATE_EMOJI) return;

    // Get the message that was reacted to
    const message = reaction.message;
    console.log(`Message content: ${message.content}`); // Log the message content to see what was reacted to

    // Fetch the full message if needed
    await message.fetch();
    console.log('Fetched message:', message.content); // Log the fetched message content to confirm it's correct

    // Detect the language of the message
    const sourceLang = detectLanguage(message.content);
    console.log('Detected source language:', sourceLang); // Log the detected source language

    // Add try-catch around member fetching and handle timeout gracefully
    try {
        const member = await message.guild.members.fetch(user.id, { cache: true, timeout: 5000 }); // Added timeout (in ms)
        const targetLang = member.user.locale.split('-')[0] || DEFAULT_LANG; // Detect user's system language (fallback to default if not set)
        console.log('Target language:', targetLang); // Log the detected target language

        // Translate the message
        const translatedText = await translateText(message.content, sourceLang, targetLang);

        if (!translatedText) {
            console.log('No translation available. Exiting.');
            return; // Exit if no translation is available
        }

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


const app = express();
app.get('/', (req, res) => {
    res.send('Bot is running');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

console.log("Environment variable BOT_TOKEN:", process.env.BOT_TOKEN); // Debugging: checking bot token

client.login(process.env.BOT_TOKEN).then(() => {
    console.log("Logged in to Discord successfully!");
}).catch((err) => {
    console.error("Error during bot login:", err);
});
