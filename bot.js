import dotenv from 'dotenv';
import { Client, GatewayIntentBits, IntentsBitField } from 'discord.js'; // Import IntentsBitField from discord.js
import axios from 'axios';
import { franc } from 'franc-min';
import express from 'express'; // Import Express
dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,             // For general guild events
        GatewayIntentBits.GuildMessages,      // To read messages
        GatewayIntentBits.MessageContent,     // To read the content of messages
        GatewayIntentBits.GuildMembers,       // For member data
        GatewayIntentBits.MessageReactions,   // For listening to reactions
    ],
});

console.log(client.options.intents); // This will log the intents to the console

const API_URL = 'https://api.mymemory.translated.net/get';
const DEFAULT_LANG = 'en'; // Default fallback target language
const TRANSLATE_EMOJI = '💭'; // Discord thought balloon emoji :thought_balloon:

// Your code for the translation and reaction handling...

// Log in to Discord
client.login(process.env.BOT_TOKEN);
