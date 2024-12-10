import dotenv from 'dotenv';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { OpenAI } from 'openai';
import express from 'express';
import vosk from 'vosk';
import fs from 'fs';
import record from 'node-record-lpcm16';  // Use this for recording

dotenv.config();

console.log("Starting bot...");

if (!process.env.OPENAI_API_KEY || !process.env.BOT_TOKEN) {
    console.error("Missing environment variables. Please set OPENAI_API_KEY and BOT_TOKEN.");
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        1024
    ],
    partials: [Partials.Message, Partials.Reaction]
});

const API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
    apiKey: API_KEY
});

const DEFAULT_LANG = 'en';
const TRANSLATE_EMOJI = '💭';
let userLanguages = {};
let userIgnoredLanguages = {};
let userAutoTranslation = {}; // Tracks auto-translation toggle
let translationEnabledChannels = {}; // Tracks enabled channels for translations

const models = [
    { language: 'english', modelPath: './models/vosk-model-en-us-0.22' },
    { language: 'english', modelPath: './models/vosk-model-en-in-0.5' },
    { language: 'chinese', modelPath: './models/vosk-model-cn-0.22' },
    { language: 'russian', modelPath: './models/vosk-model-ru-0.42' },
    { language: 'french', modelPath: './models/vosk-model-fr-0.22' },
    { language: 'german', modelPath: './models/vosk-model-de-0.21' },
    { language: 'spanish', modelPath: './models/vosk-model-es-0.42' },
    { language: 'portuguese', modelPath: './models/vosk-model-pt-fb-v0.1.1-20220516_2113' },
    { language: 'greek', modelPath: './models/vosk-model-el-gr-0.7' },
    { language: 'turkish', modelPath: './models/vosk-model-small-tr-0.3' },
    { language: 'vietnamese', modelPath: './models/vosk-model-vn-0.4' },
    { language: 'italian', modelPath: './models/vosk-model-it-0.22' },
    { language: 'dutch', modelPath: './models/vosk-model-nl-spraakherkenning-0.6' },
    { language: 'arabic', modelPath: './models/vosk-model-ar-0.22-linto-1.1.0' },
    { language: 'hindi', modelPath: './models/vosk-model-hi-0.22' },
    { language: 'farsi', modelPath: './models/vosk-model-fa-0.5' },
    { language: 'filipino', modelPath: './models/vosk-model-tl-ph-generic-0.6' },
    { language: 'ukrainian', modelPath: './models/vosk-model-uk-v3-lgraph' },
    { language: 'kazakh', modelPath: './models/vosk-model-kz-0.15' },
    { language: 'swedish', modelPath: './models/vosk-model-small-sv-rhasspy-0.15' },
    { language: 'japanese', modelPath: './models/vosk-model-ja-0.22' },
    { language: 'esperanto', modelPath: './models/vosk-model-small-eo-0.42' },
    { language: 'czech', modelPath: './models/vosk-model-small-cs-0.4-rhasspy' },
    { language: 'polish', modelPath: './models/vosk-model-small-pl-0.22' },
    { language: 'uzbek', modelPath: './models/vosk-model-small-uz-0.22' },
    { language: 'korean', modelPath: './models/vosk-model-small-ko-0.22' },
    { language: 'breton', modelPath: './models/vosk-model-br-0.8' },
    { language: 'gujarati', modelPath: './models/vosk-model-gu-0.42' },
    { language: 'tajik', modelPath: './models/vosk-model-tg-0.22' },
    { language: 'speaker-identification', modelPath: './models/vosk-model-spk-0.4' }
  ];
  

let activeModels = {};

// Function to load a model dynamically based on language
function loadModel(language) {
    // Check if model is already loaded
    if (activeModels[language]) {
        return activeModels[language];
    }

    // Find the model for the given language
    const modelConfig = models.find(model => model.language === language);
    
    if (modelConfig && fs.existsSync(modelConfig.modelPath)) {
        const model = new vosk.Model(modelConfig.modelPath);
        activeModels[language] = model;
        return model;
    } else {
        console.error(Model for ${language} not found or path is incorrect.);
        return null;
    }
}


// Initialize Vosk model and sample rate
const samplerate = 16000;

// Listen for the '/ignore' command
client.on('messageCreate', async (message) => {
    if (message.content.startsWith('/ignore')) {
        const args = message.content.split(' ');
        const languageToIgnore = args[1];
        
        if (languageToIgnore) {
            if (!userIgnoredLanguages[message.author.id]) {
                userIgnoredLanguages[message.author.id] = [];
            }
            userIgnoredLanguages[message.author.id].push(languageToIgnore);
            message.reply(You will no longer receive translations for ${languageToIgnore}.);
        } else {
            message.reply('Please specify a language code to ignore.');
        }
    }
});

// Listen for the '/language' command
client.on('messageCreate', async (message) => {
    if (message.content.startsWith('/language')) {
        const args = message.content.split(' ');
        const newLanguage = args[1];
        
        if (newLanguage) {
            userLanguages[message.author.id] = newLanguage;
            message.reply(Your preferred language has been set to ${newLanguage}.);
        } else {
            message.reply('Please specify a language code to set as your preferred language.');
        }
    }
});

// Listen for the '/toggletranslations' command
client.on('messageCreate', async (message) => {
    if (message.content.startsWith('/toggletranslations')) {
        const userId = message.author.id;
        userAutoTranslation[userId] = !userAutoTranslation[userId];
        const status = userAutoTranslation[userId] ? 'enabled' : 'disabled';
        message.reply(Auto-translation has been ${status} for you.);
    }
});

// Listen for the '/settranslationchannel' command
client.on('messageCreate', async (message) => {
    if (message.content.startsWith('/settranslationchannel')) {
        if (!message.member.permissions.has("MANAGE_CHANNELS")) {
            message.reply("You don't have permission to use this command.");
            return;
        }

        const args = message.content.split(' ');
        const channelId = args[1];

        if (!channelId || !message.guild.channels.cache.has(channelId)) {
            message.reply("Invalid channel ID. Please specify a valid channel.");
            return;
        }

        if (!translationEnabledChannels[message.guild.id]) {
            translationEnabledChannels[message.guild.id] = [];
        }

        const channels = translationEnabledChannels[message.guild.id];

        if (channels.includes(channelId)) {
            translationEnabledChannels[message.guild.id] = channels.filter(id => id !== channelId);
            message.reply(Translations disabled for <#${channelId}>.);
        } else {
            channels.push(channelId);
            message.reply(Translations enabled for <#${channelId}>.);
        }
    }
});

// Vosk speech-to-text function
async function transcribeVoiceToText(audioBuffer) {
    if (!audioBuffer || audioBuffer.length === 0) {
        console.error("Audio buffer is empty or invalid");
        return null;
    }

    const rec = new vosk.KaldiRecognizer(model, samplerate);
    const buffer = Buffer.from(audioBuffer);

    if (rec.AcceptWaveform(buffer)) {
        const result = JSON.parse(rec.Result());
        return result.text;
    } else {
        return null;
    }
}


// Listen for reactions to voice messages
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot || reaction.emoji.name !== TRANSLATE_EMOJI) return;

    const message = reaction.message;
    const audioAttachment = message.attachments.first();
    
    try {
        let translatedText = null;

        if (audioAttachment && audioAttachment.contentType.startsWith("audio/")) {
            const audioBuffer = await audioAttachment.download();
            const transcribedText = await transcribeVoiceToText(audioBuffer);
            if (!transcribedText) {
                message.reply("Sorry, I couldn't transcribe the audio.");
                return;
            }

            const targetLang = userLanguages[user.id] || DEFAULT_LANG;
            translatedText = await translateText(transcribedText, 'auto', targetLang);
        } else {
            translatedText = await translateText(message.content, 'auto', userLanguages[user.id] || DEFAULT_LANG);
        }

        if (translatedText) {
            message.channel.send({
                content: translatedText,
                ephemeral: true, // Requires interactions; simulated below
                reply: { messageReference: message.id },
            });
        }
    } catch (error) {
        console.error("Error during emoji-triggered translation:", error);
        message.reply("An error occurred while processing your translation. Please try again later.");
    }
});


// Auto-translate text messages for online users
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const member = await message.guild.members.fetch(message.author.id);
    const isOnline = member.presence?.status === 'online';

    if (isOnline) {
        const userLang = userLanguages[message.author.id] || DEFAULT_LANG;
        const translatedText = await translateText(message.content, 'auto', userLang);

        if (translatedText) {
            // Send ephemeral-like translation directly under the original message
            message.channel.send({
                content: translatedText,
                ephemeral: true, // Requires interactions; simulated below
                reply: { messageReference: message.id },
            });
        }
    }
});

// Translate text using OpenAI API
async function translateText(text, sourceLang, targetLang) {
    try {
        const prompt = Translate this text from ${sourceLang} to ${targetLang}: "${text}";
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error during translation with OpenAI:', error);
        return null;
    }
}

client.on('messageCreate', async (message) => {
    // Auto-translate messages if enabled and in a configured channel
    const userId = message.author.id;
    const guildId = message.guild?.id;

    if (
        !userAutoTranslation[userId] ||
        (guildId && translationEnabledChannels[guildId] && !translationEnabledChannels[guildId].includes(message.channel.id))
    ) {
        return;
    }

    const sourceLang = 'auto';
    const targetLang = userLanguages[userId] || DEFAULT_LANG;

    const translatedText = await translateText(message.content, sourceLang, targetLang);
    if (translatedText) {
        message.reply({ content: Translated: ${translatedText} });
    }
});

const app = express();
app.get('/', (req, res) => {
    res.send('Bot is running');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(Server is listening on port ${port});
});

client.login(process.env.BOT_TOKEN).then(() => {
    console.log("Logged in to Discord successfully!");
}).catch((err) => {
    console.error("Error during bot login:", err);
});