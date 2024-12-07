import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import axios from 'axios';
import { franc } from 'franc-min';
import express from 'express';

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

// Initialize express app
const app = express();

// Map of ISO6393 to ISO6391 codes (simplified for common languages)
const ISO6393_TO_ISO6391 = {
    'abk': 'ab',  // Abkhazian
    'ace': 'ace',  // Achinese
    'afr': 'af',  // Afrikaans
    'aka': 'ak',  // Akan
    'alb': 'sq',  // Albanian
    'amh': 'am',  // Amharic
    'ara': 'ar',  // Arabic
    'arg': 'an',  // Aragonese
    'arm': 'hy',  // Armenian
    'asm': 'as',  // Assamese
    'ava': 'av',  // Avaric
    'ave': 'ae',  // Avestan
    'aym': 'ay',  // Aymara
    'aze': 'az',  // Azerbaijani
    'bam': 'bm',  // Bambara
    'bel': 'be',  // Belarusian
    'ben': 'bn',  // Bengali
    'bos': 'bs',  // Bosnian
    'bre': 'br',  // Breton
    'bul': 'bg',  // Bulgarian
    'bur': 'my',  // Burmese
    'cat': 'ca',  // Catalan
    'ces': 'cs',  // Czech
    'cha': 'ch',  // Chamorro
    'che': 'ce',  // Chechen
    'chi': 'zh',  // Chinese
    'chm': 'chm',  // Mari
    'chn': 'chu',  // Chukchi
    'cho': 'cho',  // Cherokee
    'chu': 'ch',  // Church Slavic
    'cor': 'ko',  // Korean
    'cos': 'co',  // Corsican
    'cre': 'cr',  // Cree
    'cro': 'hr',  // Croatian
    'cze': 'cs',  // Czech
    'dan': 'da',  // Danish
    'dzo': 'dz',  // Dzongkha
    'ell': 'el',  // Greek
    'eng': 'en',  // English
    'epo': 'eo',  // Esperanto
    'est': 'et',  // Estonian
    'eus': 'eu',  // Basque
    'eve': 'ev',  // Evenki
    'fao': 'fo',  // Faroese
    'fas': 'fa',  // Persian
    'fat': 'ff',  // Fanti
    'fin': 'fi',  // Finnish
    'fij': 'fj',  // Fijian
    'fra': 'fr',  // French
    'fry': 'fy',  // Frisian
    'geo': 'ka',  // Georgian
    'ger': 'de',  // German
    'gle': 'ga',  // Irish
    'glg': 'gl',  // Galician
    'glv': 'gv',  // Manx
    'grc': 'grc',  // Ancient Greek
    'gre': 'el',  // Greek
    'guj': 'gu',  // Gujarati
    'hat': 'ht',  // Haitian Creole
    'hau': 'ha',  // Hausa
    'heb': 'he',  // Hebrew
    'hin': 'hi',  // Hindi
    'hmo': 'ho',  // Hiri Motu
    'hrv': 'hr',  // Croatian
    'hun': 'hu',  // Hungarian
    'hye': 'hy',  // Armenian
    'ibo': 'ig',  // Igbo
    'ido': 'io',  // Ido
    'ind': 'id',  // Indonesian
    'isl': 'is',  // Icelandic
    'ita': 'it',  // Italian
    'jav': 'jv',  // Javanese
    'jpn': 'ja',  // Japanese
    'jrb': 'jrb',  // Judeo-Arabic
    'kan': 'kn',  // Kannada
    'kas': 'ks',  // Kashmiri
    'kat': 'ka',  // Georgian
    'kaz': 'kk',  // Kazakh
    'khm': 'km',  // Khmer
    'kik': 'ki',  // Kikuyu
    'kin': 'rw',  // Kinyarwanda
    'kir': 'ky',  // Kirghiz
    'kom': 'kv',  // Komi
    'kon': 'kg',  // Kongo
    'kor': 'ko',  // Korean
    'kpe': 'kp',  // Kpelle
    'kur': 'ku',  // Kurdish
    'lao': 'lo',  // Lao
    'lat': 'la',  // Latin
    'lav': 'lv',  // Latvian
    'lit': 'lt',  // Lithuanian
    'ltz': 'lb',  // Luxembourgish
    'mac': 'mk',  // Macedonian
    'mal': 'ml',  // Malayalam
    'mar': 'mr',  // Marathi
    'may': 'ms',  // Malay
    'mlg': 'mg',  // Malagasy
    'mnc': 'mnc',  // Manchu
    'mon': 'mn',  // Mongolian
    'nep': 'ne',  // Nepali
    'nld': 'nl',  // Dutch
    'nno': 'nn',  // Norwegian Nynorsk
    'nob': 'no',  // Norwegian Bokmål
    'nor': 'no',  // Norwegian
    'oci': 'oc',  // Occitan
    'oji': 'oj',  // Ojibwe
    'ori': 'or',  // Oriya
    'orm': 'om',  // Oromo
    'pan': 'pa',  // Punjabi
    'per': 'fa',  // Persian
    'pli': 'pi',  // Pali
    'pol': 'pl',  // Polish
    'por': 'pt',  // Portuguese
    'que': 'qu',  // Quechua
    'roh': 'rm',  // Romansh
    'ron': 'ro',  // Romanian
    'rus': 'ru',  // Russian
    'sam': 'smp', // Samaritan Aramaic
    'san': 'sa',  // Sanskrit
    'scn': 'sc',  // Sicilian
    'sco': 'sco', // Scots
    'slk': 'sk',  // Slovak
    'slv': 'sl',  // Slovenian
    'sma': 'se',  // Northern Sami
    'sme': 'se',  // Northern Sami
    'smi': 'sm',  // Sami
    'som': 'so',  // Somali
    'sqi': 'sq',  // Albanian
    'srd': 'sc',  // Sardinian
    'srp': 'sr',  // Serbian
    'swa': 'sw',  // Swahili
    'swe': 'sv',  // Swedish
    'tgl': 'tl',  // Tagalog
    'tha': 'th',  // Thai
    'tir': 'ti',  // Tigrinya
    'ton': 'to',  // Tongan
    'tur': 'tr',  // Turkish
    'tuk': 'tk',  // Turkmen
    'ukr': 'uk',  // Ukrainian
    'uzb': 'uz',  // Uzbek
    'vie': 'vi',  // Vietnamese
    'vol': 'vo',  // Volapük
    'wln': 'wa',  // Walloon
    'xho': 'xh',  // Xhosa
    'yid': 'yi',  // Yiddish
    'yor': 'yo',  // Yoruba
    'zho': 'zh',  // Chinese
    'zul': 'zu',  // Zulu
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
        return text; // Ignore translation if source and target are the same
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
    // Ignore bot messages
    if (message.author.bot) return;

    const sourceLang = detectSourceLanguage(message.content);
    const targetLang = detectTargetLanguage(message.member);

    // If the source and target languages are the same, do nothing
    if (sourceLang === targetLang) {
        return; // Just return without doing anything
    }

    console.log(`Translating: "${message.content}" from ${sourceLang} to ${targetLang}`);

    const translatedText = await translateText(message.content, sourceLang, targetLang);

    if (translatedText) {
        message.reply(translatedText);
    } else {
        message.reply('Translation failed.');
    }
});

// Log in to Discord
client.login(process.env.BOT_TOKEN);

// Express server to listen on the assigned port
const port = process.env.PORT || 10000;  // Use the Render-provided port
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
