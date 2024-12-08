import dotenv from 'dotenv';
import { Client, GatewayIntentBits, IntentsBitField } from 'discord.js'; // Import IntentsBitField from discord.js
import axios from 'axios';
import { franc } from 'franc-min';
import express from 'express'; // Import Express
dotenv.config();

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,             // For general guild events
        IntentsBitField.Flags.GuildMessages,      // To read messages
        IntentsBitField.Flags.MessageContent,     // To read the content of messages
        IntentsBitField.Flags.GuildMembers,       // For member data
        IntentsBitField.Flags.MessageReactions,   // For listening to reactions
    ],
});

console.log(client.options.intents); // This will log the intents to the console

const API_URL = 'https://api.mymemory.translated.net/get';
const DEFAULT_LANG = 'en'; // Default fallback target language
const TRANSLATE_EMOJI = '💭'; // Discord thought balloon emoji :thought_balloon:

// Your code for the translation and reaction handling...

// Log in to Discord
client.login(process.env.BOT_TOKEN);
