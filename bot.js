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
const TRANSLATE_EMOJI = '💭'; // Discord thought balloon emoji :thought_balloon:

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

client.on('messageReactionAdd', async (reaction, user) => {
    console.log("Reaction detected:", reaction.emoji.name); // Debugging: reaction detected

    if (user.bot) return;
    if (reaction.emoji.name !== TRANSLATE_EMOJI) return;

    const message = reaction.message;
    console.log('Message content:', message.content);

    await message.fetch();
    console.log('Fetched message:', message.content);

    const sourceLang = detectLanguage(message.content);
    console.log('Detected source language:', sourceLang);

    try {
        const member = await message.guild.members.fetch(user.id, { cache: true, timeout: 5000 });
        const targetLang = member.user.locale.split('-')[0] || DEFAULT_LANG;
        console.log('Target language:', targetLang);

        const translatedText = await translateText(message.content, sourceLang, targetLang);
        if (!translatedText) return;

        try {
            await message.reply({
                content: translatedText,
                ephemeral: true,
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
