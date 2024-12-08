import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import axios from 'axios';
import { franc } from 'franc-min';
import express from 'express'; // Import Express

dotenv.config();
console.log("Starting bot...");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, // For accessing guilds
        GatewayIntentBits.GuildMessages, // To read messages
        GatewayIntentBits.MessageContent, // To read message content
        GatewayIntentBits.GuildMembers, // To access guild members
        GatewayIntentBits.MessageReactions // To read message reactions
    ]
});

console.log("Bot intents:", client.options.intents); // Debugging: log intents

const TRANSLATE_EMOJI = '❤️'; // Define the emoji you're looking for

// Event handler for reactions added to messages
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return; // Ignore bot reactions

    console.log('Reaction emoji:', reaction.emoji.name); // Log reaction emoji name

    // Check if the reaction is the correct emoji
    if (reaction.emoji.name !== TRANSLATE_EMOJI) return; // Only proceed if the emoji is the one you're looking for

    console.log(`Reaction added by user ${user.tag} with emoji ${reaction.emoji.name}`);
});

// Setup the Express server
const app = express();
app.get('/', (req, res) => {
    res.send('Bot is running');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

// Login to Discord
client.login(process.env.BOT_TOKEN).then(() => {
    console.log("Logged in to Discord successfully!");
}).catch((err) => {
    console.error("Error during bot login:", err);
});
