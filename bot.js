import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import axios from 'axios';
import { franc } from 'franc-min';

dotenv.config();

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

// Function to detect message language
function detectLanguage(text) {
    const detectedISO6393 = franc(text);
    return ISO6393_TO_ISO6391[detectedISO6393] || DEFAULT_LANG;
}

// Translation function using MyMemory API
async function translateText(text, sourceLang, targetLang) {
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

// Event handler when bot is ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Event handler for message creation
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const sourceLang = detectLanguage(message.content);
    const targetLang = message.guild?.preferredLocale?.split('-')[0] || DEFAULT_LANG;

    console.log(`Translating: "${message.content}" from ${sourceLang} to ${targetLang}`);

    const translatedText = await translateText(message.content, sourceLang, targetLang);
    if (translatedText) {
        message.reply(translatedText);
    } else {
        message.reply('Failed to translate the message.');
    }
});

// Log in to Discord
client.login(process.env.BOT_TOKEN);
