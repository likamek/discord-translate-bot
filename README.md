# Discord Translation Bot

This bot is designed to provide real-time translation services for messages and audio within a Discord server. It supports multiple languages and offers features like auto-translation, voice transcription, and emoji-based translation triggers. Below are detailed instructions for setting up, configuring, and using the bot.

---

## Features

- **Text Translation**: Translate messages automatically or on demand using OpenAI's API.
- **Voice Transcription and Translation**: Convert audio messages to text and translate the output.
- **Custom Language Preferences**: Users can set their preferred translation languages.
- **Ignore Specific Languages**: Users can opt out of translations for certain languages.
- **Auto-Translation**: Automatically translates all messages for specific users or channels.
- **Channel Configuration**: Restrict translation features to specific channels.

---

## Prerequisites

1. **Node.js**: Install the latest stable version from [Node.js](https://nodejs.org/).
2. **Discord Bot Token**: Create a bot and get a token from the [Discord Developer Portal](https://discord.com/developers/applications).
3. **OpenAI API Key**: Sign up for an OpenAI account and obtain an API key.
4. **Vosk Speech-to-Text Models**: Download required models for voice transcription from [Vosk](https://alphacephei.com/vosk/models).
5. **Environment Variables**:
   - `BOT_TOKEN`: Your Discord bot token.
   - `OPENAI_API_KEY`: Your OpenAI API key.
   - `PORT`: (Optional) The port number for hosting the bot's server.

---

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/discord-translate-bot.git
   cd discord-translate-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   BOT_TOKEN=your_discord_bot_token
   OPENAI_API_KEY=your_openai_api_key
   PORT=3000
   ```

4. Add Vosk models to the `models` folder and ensure the paths match those in the code.

---

## Usage

### Running the Bot
Start the bot by running:
```bash
node bot.js
```
You should see logs indicating the bot has started and connected to Discord.

### Bot Commands

#### **Set Preferred Language**
Command:
```
/language <language_code>
```
Example:
```
/language fr
```
Sets the user’s preferred language for translations.

#### **Ignore a Language**
Command:
```
/ignore <language_code>
```
Example:
```
/ignore es
```
Prevents the bot from translating messages in the specified language.

#### **Toggle Auto-Translation**
Command:
```
/toggletranslations
```
Enables or disables auto-translation for the user.

#### **Set Translation Channel**
Command:
```
/settranslationchannel <channel_id>
```
Example:
```
/settranslationchannel 123456789012345678
```
Toggles translation features on or off for a specific channel. Requires `Manage Channels` permission.

### Emoji-Based Translation
React to a message with “💭” to trigger a translation into your preferred language.

---

## File Structure

```
.
├── bot.js                  # Main bot file
├── models/                 # Folder containing Vosk speech-to-text models
├── .env                    # Environment variables file
├── package.json            # Node.js dependencies and scripts
├── README.md               # Documentation
```

---

## Troubleshooting

### Common Issues
- **Bot Fails to Start**: Ensure all dependencies are installed and `.env` is properly configured.
- **Translation Not Working**: Verify your OpenAI API key and check if your account has sufficient credits.
- **Voice Transcription Issues**: Ensure the correct Vosk models are installed and paths match in the code.

### Logs
Use the console output to debug issues. Errors related to Discord API or OpenAI will appear in the logs.

---

## Contributing
Contributions are welcome! Feel free to submit pull requests or open issues to improve the bot.

---

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Credits
- [OpenAI](https://openai.com/) for GPT models
- [Vosk](https://alphacephei.com/vosk/) for speech-to-text models
- [Discord.js](https://discord.js.org/) for the Discord API wrapper

