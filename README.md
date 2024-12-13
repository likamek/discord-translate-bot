# Discord Translation and Transcription Bot

This bot allows real-time speech-to-text translation and text translation for Discord servers. It uses Yandex for text translations and Whisper for speech-to-text transcriptions. The bot works automatically for text translations and can transcribe voice messages during live chats.

## Features
- **Text Translation**: Automatically translates text messages into a user's preferred language.
- **Voice Message Transcription**: Transcribes voice messages into text and translates them into the target language.
- **Live Chat Transcription**: Joins voice channels and transcribes live conversations into text in real-time, then translates them.
- **Multi-language Support**: Currently supports English and Russian.
- **Seamless Integration**: Automatically detects and translates messages or voice chat.

## Setup

### Prerequisites
Before setting up the bot, make sure you have the following:
- Node.js (v18 or higher)
- NPM
- A Discord Developer account
- A Yandex API Key
- A Whisper API key
- Google Drive for Whisper model files

### Step-by-Step Setup

1. **Clone the Repository**  
   Clone the repository to your local machine:  
   ```bash  
   git clone https://github.com/your-username/discord-translate-bot.git  
   cd discord-translate-bot  
Install Dependencies
Install the necessary dependencies:

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

