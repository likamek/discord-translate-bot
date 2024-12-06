// Import required libraries
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

// Create the bot client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, // Required for interacting with servers
        GatewayIntentBits.GuildMessages, // Required for handling messages in servers
        GatewayIntentBits.MessageContent // Required to read the content of messages
    ]
});

// API settings
const apiUrl = process.env.API_URL;

// Default settings
const userLanguageCache = {}; // Cache to store user language preferences
const defaultLanguage = 'en'; // Global fallback language for translation

// Bot ready event
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Message event
client.on('messageCreate', async (message) => {
    // Ignore messages from bots
    if (message.author.bot) return;

    // Command to set user language
    if (message.content.startsWith('!setlang')) {
        const lang = message.content.split(' ')[1];

        if (!lang) {
            message.reply('Please provide a valid language code. Example: `!setlang es` for Spanish.');
            return;
        }

        userLanguageCache[message.author.id] = lang;
        message.reply(`Your default translation language has been set to \`${lang}\`.`);
        return;
    }

    // Auto-detect target language
    const targetLang = userLanguageCache[message.author.id] || defaultLanguage;

    // Translate the message
    try {
        const response = await axios.post(apiUrl, {
            q: message.content,
            source: 'auto', // Automatically detect the source language
            target: targetLang
        });

        const translatedText = response.data.translatedText;

        // Send the translated message as an embed
        const embed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setTitle('Translated Message')
            .addFields(
                { name: 'Original', value: message.content },
                { name: 'Translated', value: translatedText }
            )
            .setFooter({ text: `Translated to: ${targetLang}` });

        message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error translating message:', error);
        message.reply('Failed to translate the message.');
    }
});

// Rename channel names (advanced feature)
async function translateChannelNames(guild, language) {
    try {
        const channels = guild.channels.cache.filter(channel => channel.type === 0); // Text channels only
        for (const [channelId, channel] of channels) {
            const response = await axios.post(apiUrl, {
                q: channel.name,
                source: 'auto',
                target: language
            });

            const translatedName = response.data.translatedText;

            // Rename the channel
            await channel.setName(translatedName);
            console.log(`Renamed channel ${channel.name} to ${translatedName}`);
        }
    } catch (error) {
        console.error('Error translating channel names:', error);
    }
}

// Event: When a new member joins
client.on('guildMemberAdd', async (member) => {
    const userLang = userLanguageCache[member.id] || defaultLanguage;

    // Translate channel names to the user's system language
    await translateChannelNames(member.guild, userLang);

    // Welcome message
    member.send(`Welcome to the server! Your messages will be translated into ${userLang}. Use \`!setlang <language_code>\` to change this.`);
});

// Log in the bot
client.login(process.env.TOKEN);
