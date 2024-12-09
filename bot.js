import dotenv from 'dotenv';
import { Client, GatewayIntentBits, Partials } from 'discord.js'; // Import Partials as well
import { OpenAI } from 'openai'; // Import OpenAI
import express from 'express';

dotenv.config();
console.log("Starting bot...");
if (!process.env.OPENAI_API_KEY || !process.env.BOT_TOKEN) {
    console.error("Missing environment variables. Please set OPENAI_API_KEY and BOT_TOKEN.");
    process.exit(1);  // Exit the program if the required keys are missing
}

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

let userLanguages = {};  // Stores user language preferences
let userIgnoredLanguages = {}; // Stores ignored languages for each user

// Listen for the '/ignore' command to allow users to ignore certain languages
client.on('messageCreate', async (message) => {
    if (message.content.startsWith('/ignore')) {
        const args = message.content.split(' ');
        const languageToIgnore = args[1]; // The language the user wants to ignore

        if (languageToIgnore) {
            // Add language to the user's ignored languages list
            if (!userIgnoredLanguages[message.author.id]) {
                userIgnoredLanguages[message.author.id] = [];
            }
            userIgnoredLanguages[message.author.id].push(languageToIgnore);
            message.reply(`You will no longer receive translations for ${languageToIgnore}.`);
        } else {
            message.reply('Please specify a language code to ignore.');
        }
    }
});

// Listen for the '/language' command to allow users to set their preferred language
client.on('messageCreate', async (message) => {
    if (message.content.startsWith('/language')) {
        const args = message.content.split(' ');
        const newLanguage = args[1]; // The language the user wants to set

        if (newLanguage) {
            userLanguages[message.author.id] = newLanguage; // Set the user's new preferred language
            message.reply(`Your preferred language has been set to ${newLanguage}.`);
        } else {
            message.reply('Please specify a language code to set as your preferred language.');
        }
    }
});

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

    // Ignore translation for specific languages for this user
    if (userIgnoredLanguages[user.id] && userIgnoredLanguages[user.id].includes(sourceLang)) {
        console.log(`User ${user.tag} has ignored ${sourceLang}.`);
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
