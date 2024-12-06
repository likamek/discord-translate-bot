const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const apiUrl = process.env.API_URL;

// Default language settings
const userLanguageCache = {}; // Caches user language preferences
const defaultLanguage = 'en'; // Fallback language

// Bot ready event
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Message event
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Command to set user language
    if (message.content.startsWith('!setlang')) {
        const lang = message.content.split(' ')[1];
        userLanguageCache[message.author.id] = lang;
        message.reply(`Your default translation language has been set to \`${lang}\``);
        return;
    }

    // Auto-translate the message
    const targetLang = userLanguageCache[message.author.id] || defaultLanguage;
    try {
        const response = await axios.post(apiUrl, {
            q: message.content,
            source: 'auto',
            target: targetLang
        });

        const translatedText = response.data.translatedText;

        // Send translated message as an embed
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

// Login bot
client.login(process.env.TOKEN);
