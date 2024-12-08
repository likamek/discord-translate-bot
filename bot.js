import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import axios from 'axios';
import { franc } from 'franc-min';
import express from 'express'; // Import Express
dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers, // Make sure GuildMembers intent is included
    ],
});

console.log(client.options.intents); // This will log the intents to the console

const API_URL = 'https://api.mymemory.translated.net/get';
const DEFAULT_LANG = 'en'; // Default fallback target language
const TRANSLATE_EMOJI = '💭'; // Discord thought balloon emoji :thought_balloon:

// Your code for the translation and reaction handling...

// Log in to Discord
client.login(process.env.BOT_TOKEN);
