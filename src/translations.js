const fetch = require('node-fetch');
const { config } = require('./src/config');  // Adjusted path for config.js
const { logError } = require('./src/utils');  // Adjusted path for utils.js

// Translate text using Yandex API
async function translateText(message) {
    try {
        const targetLanguage = message.author.preferredLocale || 'en'; // Auto-detect user's language
        const response = await fetch('https://translate.yandex.net/api/v1.5/tr.json/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                key: config.YANDEX_API_KEY,
                text: message.content,
                lang: `${message.content.lang || 'auto'}-${targetLanguage}`
            })
        });

        const data = await response.json();
        if (data.code === 200) {
            const translatedText = data.text[0];
            await message.reply({ content: translatedText, ephemeral: true });
        } else {
            logError(new Error('Yandex translation failed'), 'Translation error');
        }
    } catch (error) {
        logError(error, 'Error during text translation');
    }
}

module.exports = { translateText };
