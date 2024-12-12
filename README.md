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

bash
Copy code
npm install  
Configure Environment Variables
Create a .env file in the root directory and add the following keys:

env
Copy code
DISCORD_BOT_TOKEN=your-discord-bot-token  
YANDEX_API_KEY=your-yandex-api-key  
WHISPER_API_KEY=your-whisper-api-key  
GOOGLE_DRIVE_WHISPER_LINK_ENGLISH=link-to-english-whisper-model  
GOOGLE_DRIVE_WHISPER_LINK_RUSSIAN=link-to-russian-whisper-model  
LIVE_CHAT_CHANNEL_ID=your-discord-live-chat-channel-id  
Download Whisper Models
The Whisper models will be downloaded from Google Drive. Ensure the correct links are placed in the .env file for the models:

English Whisper Model
Russian Whisper Model
Deploy on Render
Follow the Render instructions to deploy your bot. You can use the free hosting platform to keep the bot running 24/7.

Set Up UptimeRobot
Use UptimeRobot to monitor your bot's status and receive alerts if it goes down.

Update Google Drive Links for Whisper Models
Ensure the links to the Whisper models in your Google Drive are correctly set up and accessible.

Set Up Discord App in Developer Mode

Create a new bot on the Discord Developer Portal.
Enable Developer Mode and use the bot's token in your .env file.
Usage
Once set up, the bot will:

Translate Text: Automatically translate messages based on the recipient's preferred language.
Transcribe Voice Messages: Convert audio messages into text and translate them.
Real-Time Live Chat Transcription: Join a voice channel, transcribe ongoing conversation, and translate it for users.
Contributing
Feel free to fork the repository and submit a pull request with your improvements. Contributions are welcome!

License
This project is licensed under the MIT License.