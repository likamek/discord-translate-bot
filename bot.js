require('dotenv').config();  // Load environment variables from .env

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');

// Fetch the bot token from environment variables
const token = process.env.BOT_TOKEN;

// Ensure the token is available
if (!token) {
  console.error("Bot Token is missing! Please set the BOT_TOKEN environment variable.");
  process.exit(1);  // Exit if token is missing
}

// Initialize the Discord client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Your translation API URL
const API_URL = 'https://translate.argosopentech.com/translate';

// Log the bot token (for debugging, can be removed later)
console.log("Bot Token:", token);

// Log in to Discord with the bot token
client.login(token);

// Track processed messages to avoid multiple triggers
const processedMessages = new Set();

// When the bot is ready
client.once('ready', () => {
  console.log('Bot is online!');
});

// Function to handle translations
async function translateText(text, targetLang) {
  try {
    console.log(`Translating text: ${text} to ${targetLang}`);
    const response = await axios.post(API_URL, {
      q: text,
      source: 'auto',  // Auto-detect source language
      target: targetLang,
    });
    console.log(`Translated text: ${response.data.translatedText}`);
    return response.data.translatedText;
  } catch (error) {
    console.error('Error during translation:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Function to get the user's system language
async function getUserLanguage(userId, guildId) {
  const guild = await client.guilds.fetch(guildId);
  const member = await guild.members.fetch(userId);
  return member.preferredLocale;  // This gets the user's system language in Discord
}

// Listen for new messages
client.on('messageCreate', async (message) => {
  if (message.author.bot || processedMessages.has(message.id)) return;  // Avoid bot's own messages and processed messages

  // Mark this message as processed to prevent double handling
  processedMessages.add(message.id);

  // Get the user's language (if applicable)
  const userLang = await getUserLanguage(message.author.id, message.guild.id);
  
  console.log(`User language detected: ${userLang}`);
  
  // If the message is in a language other than the default, translate it
  const translatedText = await translateText(message.content, userLang);

  if (translatedText) {
    // Send an embedded message with the translation
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('Translated Message')
      .setDescription(`Original: ${message.content}\nTranslated: ${translatedText}`)
      .setFooter({ text: `Translated to ${userLang}` });

    message.reply({ embeds: [embed] });
  } else {
    message.reply('Failed to translate the message.');
  }
});
