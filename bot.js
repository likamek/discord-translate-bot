require('dotenv').config();  // Load environment variables

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');

// Initialize the client with the necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Print the token to debug
console.log('Bot Token:', process.env.BOT_TOKEN);

// Your translation API URL
const API_URL = 'https://translate.argosopentech.com/translate';

// Log in to Discord with your bot's token
client.login(process.env.BOT_TOKEN);

// When the bot is ready
client.once('ready', () => {
  console.log('Bot is online!');
});

// Function to handle translations
async function translateText(text, targetLang) {
  try {
    const response = await axios.post(API_URL, {
      q: text,
      source: 'auto',  // Auto-detect source language
      target: targetLang,
    });
    return response.data.translatedText;
  } catch (error) {
    console.error('Error during translation:', error);
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
  if (message.author.bot) return;

  // Get the user's language (if applicable)
  const userLang = await getUserLanguage(message.author.id, message.guild.id);
  console.log(`User's language: ${userLang}`);

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
