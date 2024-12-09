import dotenv from 'dotenv';
import { Client, GatewayIntentBits, Partials } from 'discord.js'; // Import Partials as well
import { OpenAI } from 'openai'; // Import OpenAI
import express from 'express';

dotenv.config();
console.log("Starting bot...");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        1024 // Using numeric bitfield for MessageReactions
    ],
    partials: [Partials.Message, Partials.Reaction] // Important for capturing reactions
});

console.log("Bot intents:", client.options.intents);

const API_KEY = process.env.OPENAI_API_KEY; // New constant for the API key
const openai = new OpenAI({
    apiKey: API_KEY  // Use the new constant here
});

const DEFAULT_LANG = 'en'; // Default language
const TRANSLATE_EMOJI = '💭'; // Thought balloon emoji

// Override and Ignore language lists
const IGNORED_LANGUAGES = ['fr', 'de'];  // Add any languages you want to ignore
let userLanguages = {}; // Stores user language preferences

async function translateText(text, sourceLang, targetLang) {
    if (sourceLang === targetLang) {
        return text; // No translation needed if the source and target languages are the same
    }

    try {
        const prompt = `Translate this text from ${sourceLang} to ${targetLang}: "${text}"`;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // You can use gpt-4 if needed
            messages: [{ role: 'user', content: prompt }],
        });

        const translatedText = response.choices[0].message.content.trim();
        return translatedText;
    } catch (error) {
        console.error('Error during translation with OpenAI:', error);
        return null;
    }
}

// Listen for emoji reactions
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return; // Ignore bot reactions

    console.log('Reaction emoji:', reaction.emoji.name);

    // Ensure the reaction is the correct emoji
    if (reaction.emoji.name !== TRANSLATE_EMOJI) return;

    const message = reaction.message;

    // Check if message has content, and if not, try fetching it again
    if (!message || !message.content) {
        try {
            await message.fetch();  // Attempt to fetch the full message content if not available
            if (!message.content) {
                console.log('Message content still empty after fetching. Skipping...');
                return;
            }
        } catch (error) {
            console.error('Failed to fetch message content:', error);
            return;
        }
    }

    console.log('Message content:', message.content);

    // Detect the source language
    const sourceLang = 'auto'; // Use auto for language detection with ChatGPT
    console.log('Detected source language:', sourceLang); // Debugging the detected source language

    // Get the target language from the user’s locale, falling back to default if not set
    let targetLang = (user.locale && user.locale.split('-')[0]) || DEFAULT_LANG;
    console.log('Target language:', targetLang); // Debugging the target language

    // Check if the user has set a preferred translation language
    if (userLanguages[user.id]) {
        targetLang = userLanguages[user.id];
        console.log(`User ${user.tag} has an override language set to: ${targetLang}`);
    }

    // Ignore translation for specific languages
    if (IGNORED_LANGUAGES.includes(sourceLang)) {
        console.log(`Ignoring language: ${sourceLang}`);
        return;
    }

    // Translate the message
    const translatedText = await translateText(message.content, sourceLang, targetLang);

    if (!translatedText) {
        console.log('No translation available. Exiting.');
        return;
    }

    try {
        await message.reply({
            content: translatedText,
            ephemeral: true,  // Makes the message ephemeral (only visible to the user)
            allowedMentions: { repliedUser: true } // Ensures the reply is connected to the original message          
        });
        console.log('Sent translated message:', translatedText); // Debugging sent translation
    } catch (err) {
        console.error('Error sending translation:', err);
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

console.log("Environment variable BOT_TOKEN:", process.env.BOT_TOKEN);

client.login(process.env.BOT_TOKEN).then(() => {
    console.log("Logged in to Discord successfully!");
}).catch((err) => {
    console.error("Error during bot login:", err);
});
console.log("Using API Key: ", API_KEY);
