import fs from 'fs';
import path from 'path';
import axios from 'axios';
import unzipper from 'unzipper';  // Optional, for handling zip files

// Get the current directory path
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// List of models to download
const models = [
  { language: 'english', modelName: 'vosk-model-en-us-0.22', url: 'https://alphacephei.com/vosk/models/vosk-model-en-us-0.22.zip' },
  { language: 'english', modelName: 'vosk-model-en-in-0.5', url: 'https://alphacephei.com/vosk/models/vosk-model-en-in-0.5.zip' },
  { language: 'chinese', modelName: 'vosk-model-cn-0.22', url: 'https://alphacephei.com/vosk/models/vosk-model-cn-0.22.zip' },
  { language: 'russian', modelName: 'vosk-model-ru-0.42', url: 'https://alphacephei.com/vosk/models/vosk-model-ru-0.42.zip' },
  { language: 'french', modelName: 'vosk-model-fr-0.22', url: 'https://alphacephei.com/vosk/models/vosk-model-fr-0.22.zip' },
  { language: 'german', modelName: 'vosk-model-de-0.21', url: 'https://alphacephei.com/vosk/models/vosk-model-de-0.21.zip' },
  { language: 'spanish', modelName: 'vosk-model-es-0.42', url: 'https://alphacephei.com/vosk/models/vosk-model-es-0.42.zip' },
  { language: 'portuguese', modelName: 'vosk-model-pt-fb-v0.1.1-20220516_2113', url: 'https://alphacephei.com/vosk/models/vosk-model-pt-fb-v0.1.1-20220516_2113.zip' },
  { language: 'greek', modelName: 'vosk-model-el-gr-0.7', url: 'https://alphacephei.com/vosk/models/vosk-model-el-gr-0.7.zip' },
  { language: 'turkish', modelName: 'vosk-model-small-tr-0.3', url: 'https://alphacephei.com/vosk/models/vosk-model-small-tr-0.3.zip' },
  { language: 'vietnamese', modelName: 'vosk-model-vn-0.4', url: 'https://alphacephei.com/vosk/models/vosk-model-vn-0.4.zip' },
  { language: 'italian', modelName: 'vosk-model-it-0.22', url: 'https://alphacephei.com/vosk/models/vosk-model-it-0.22.zip' },
  { language: 'dutch', modelName: 'vosk-model-nl-spraakherkenning-0.6', url: 'https://alphacephei.com/vosk/models/vosk-model-nl-spraakherkenning-0.6.zip' },
  { language: 'arabic', modelName: 'vosk-model-ar-0.22-linto-1.1.0', url: 'https://alphacephei.com/vosk/models/vosk-model-ar-0.22-linto-1.1.0.zip' },
  { language: 'hindi', modelName: 'vosk-model-hi-0.22', url: 'https://alphacephei.com/vosk/models/vosk-model-hi-0.22.zip' },
  { language: 'farsi', modelName: 'vosk-model-fa-0.5', url: 'https://alphacephei.com/vosk/models/vosk-model-fa-0.5.zip' },
  { language: 'filipino', modelName: 'vosk-model-tl-ph-generic-0.6', url: 'https://alphacephei.com/vosk/models/vosk-model-tl-ph-generic-0.6.zip' },
  { language: 'ukrainian', modelName: 'vosk-model-uk-v3-lgraph', url: 'https://alphacephei.com/vosk/models/vosk-model-uk-v3-lgraph.zip' },
  { language: 'kazakh', modelName: 'vosk-model-kz-0.15', url: 'https://alphacephei.com/vosk/models/vosk-model-kz-0.15.zip' },
  { language: 'swedish', modelName: 'vosk-model-small-sv-rhasspy-0.15', url: 'https://alphacephei.com/vosk/models/vosk-model-small-sv-rhasspy-0.15.zip' },
  { language: 'japanese', modelName: 'vosk-model-ja-0.22', url: 'https://alphacephei.com/vosk/models/vosk-model-ja-0.22.zip' },
  { language: 'esperanto', modelName: 'vosk-model-small-eo-0.42', url: 'https://alphacephei.com/vosk/models/vosk-model-small-eo-0.42.zip' },
  { language: 'czech', modelName: 'vosk-model-small-cs-0.4-rhasspy', url: 'https://alphacephei.com/vosk/models/vosk-model-small-cs-0.4-rhasspy.zip' },
  { language: 'polish', modelName: 'vosk-model-small-pl-0.22', url: 'https://alphacephei.com/vosk/models/vosk-model-small-pl-0.22.zip' },
  { language: 'uzbek', modelName: 'vosk-model-small-uz-0.22', url: 'https://alphacephei.com/vosk/models/vosk-model-small-uz-0.22.zip' },
  { language: 'korean', modelName: 'vosk-model-small-ko-0.22', url: 'https://alphacephei.com/vosk/models/vosk-model-small-ko-0.22.zip' },
  { language: 'breton', modelName: 'vosk-model-br-0.8', url: 'https://alphacephei.com/vosk/models/vosk-model-br-0.8.zip' },
  { language: 'gujarati', modelName: 'vosk-model-gu-0.42', url: 'https://alphacephei.com/vosk/models/vosk-model-gu-0.42.zip' },
  { language: 'tajik', modelName: 'vosk-model-tg-0.22', url: 'https://alphacephei.com/vosk/models/vosk-model-tg-0.22.zip' },
  { language: 'speaker-identification', modelName: 'vosk-model-spk-0.4', url: 'https://alphacephei.com/vosk/models/vosk-model-spk-0.4.zip' }
];

async function downloadModel(model) {
  try {
    const modelFolder = path.join(__dirname, 'VoskModules', model.language + '_model', model.modelName);
    const zipFilePath = path.join(modelFolder, `${model.modelName}.zip`);
    const extractedFolder = path.join(modelFolder, model.modelName);

    // Check if the zip file already exists and if the model is extracted
    if (fs.existsSync(zipFilePath)) {
      console.log(`Model ${model.modelName} already downloaded. Skipping download.`);
      if (fs.existsSync(extractedFolder)) {
        console.log(`Model ${model.modelName} already extracted. Skipping extraction.`);
        return; // Skip if already extracted
      }
    }

    // If the model folder doesn't exist, create it
    if (!fs.existsSync(modelFolder)) {
      fs.mkdirSync(modelFolder, { recursive: true });
    }

    console.log(`Downloading ${model.modelName}...`);
    const response = await axios({
      method: 'get',
      url: model.url,
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(zipFilePath);
    response.data.pipe(writer);

    writer.on('finish', () => {
      console.log(`Downloaded ${model.modelName}`);
      extractModel(modelFolder, model.modelName);  // Extract the zip file if necessary
    });

  } catch (error) {
    console.error(`Error downloading model ${model.modelName}:`, error);
  }
}

// Optionally extract a zip file if the model is compressed
function extractModel(modelFolder, modelName) {
  const zipFilePath = path.join(modelFolder, `${modelName}.zip`);
  fs.createReadStream(zipFilePath)
    .pipe(unzipper.Extract({ path: modelFolder }))
    .on('close', () => {
      console.log(`Extracted ${modelName}`);
      fs.unlinkSync(zipFilePath); // Remove the zip file after extraction
    });
}

// Download all models
async function downloadAllModels() {
  for (const model of models) {
    await downloadModel(model);
  }
}

downloadAllModels();
