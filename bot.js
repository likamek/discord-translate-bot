import dotenv from 'dotenv';
import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import axios from 'axios';
import { franc } from 'franc-min';

dotenv.config(); // Make sure this is only here once

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const API_URL = 'https://api.mymemory.translated.net/get';
const DEFAULT_LANG = 'en'; // Default fallback target language

// Full ISO-639-3 to ISO-639-1 mapping
const ISO6393_TO_ISO6391 = {
    afr: 'af',
    amh: 'am',
    ara: 'ar',
    asm: 'as',
    aze: 'az',
    bel: 'be',
    ben: 'bn',
    bos: 'bs',
    bul: 'bg',
    cat: 'ca',
    ces: 'cs',
    cmn: 'zh', // Mandarin Chinese
    dan: 'da',
    deu: 'de',
    ell: 'el',
    eng: 'en',
    epo: 'eo',
    est: 'et',
    eus: 'eu',
    fas: 'fa',
    fin: 'fi',
    fra: 'fr',
    gle: 'ga',
    glg: 'gl',
    guj: 'gu',
    hau: 'ha',
    heb: 'he',
    hin: 'hi',
    hrv: 'hr',
    hun: 'hu',
    hye: 'hy',
    ind: 'id',
    isl: 'is',
    ita: 'it',
    jpn: 'ja',
    kan: 'kn',
    kat: 'ka',
    kaz: 'kk',
    khm: 'km',
    kor: 'ko',
    kur: 'ku',
    lao: 'lo',
    lat: 'la',
    lav: 'lv',
    lit: 'lt',
    ltz: 'lb',
    mal: 'ml',
    mar: 'mr',
    mkd: 'mk',
    mon: 'mn',
    mri: 'mi',
    msa: 'ms',
    mya: 'my',
    nep: 'ne',
    nld: 'nl',
    nor: 'no',
    pan: 'pa',
    pol: 'pl',
    por: 'pt',
    pus: 'ps',
    ron: 'ro',
    rus: 'ru',
    sin: 'si',
    slk: 'sk',
    slv: 'sl',
    som: 'so',
    spa: 'es',
    sqi: 'sq',
    srp: 'sr',
    swa: 'sw',
    swe: 'sv',
    tam: 'ta',
    tel: 'te',
    tha: 'th',
    tur: 'tr',
    ukr: 'uk',
    urd: 'ur',
    uzb: 'uz',
    vie: 'vi',
    xho: 'xh',
    yor: 'yo',
    zul: 'zu',
};

// Detect the language of the input text
function detectSourceLanguage(text) {
    const lang = franc(text);
    return ISO6393_TO_ISO6391[lang] || DEFAULT_LANG;
}

// Detect the preferred language of the user
function detectTargetLanguage(member) {
    const locale = member?.user?.locale;
    return locale ? locale.split('-')[0] : DEFAULT_LANG;
}

// Translate text using MyMemory API
async function translateText(text, sourceLang, targetLang) {
    if (sourceLang === targetLang) {
        return null; // Do nothing if source and target are the same
    }

    try {
        const response = await axios.get(API_URL, {
            params: {
                q: text,
                langpair: `${sourceLang}|${targetLang}`,
            },
        });

        const translatedText = response.data.responseData.translatedText;
        if (!translatedText) throw new Error('Translation failed');

        return translatedText;
    } catch (error) {
        console.error('Error during translation:', error.message || error);
        return null;
    }
}

// Event handler when the bot is ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Event handler for message creation
client.on('messageCreate', async (message) => {
    // Ignore bot messages and ensure that it reacts only once
    if (message.author.bot) return;

    const sourceLang = detectSourceLanguage(message.content);
    const targetLang = detectTargetLanguage(message.member);

    // If the source and target languages are the same, do nothing (no reply)
    if (sourceLang === targetLang) return;

    console.log(`Translating: "${message.content}" from ${sourceLang} to ${targetLang}`);

    const translatedText = await translateText(message.content, sourceLang, targetLang);

    if (translatedText) {
        // Create a simple embed with just the translated text
        const embed = new EmbedBuilder()
            .setDescription(translatedText) // Only translated text
            .setColor(0xFFFFFF); // White color for simplicity (no extra styling)

        // Send the translated text as a single embed reply (only one embed)
        message.reply({ embeds: [embed] });
    } else {
        message.reply('Translation failed.');
    }
});

// Log in to Discord
client.login(process.env.BOT_TOKEN);
