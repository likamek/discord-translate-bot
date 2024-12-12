const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function downloadModel() {
    // Google Drive direct download link (replace with your own)
    const url = 'https://drive.google.com/uc?export=download&id=1fXPouig4GE5oiDqY6swAtcOjf__63lU3';
    const outputPath = path.join(__dirname, 'models', 'whisper_large_model.bin');

    const writer = fs.createWriteStream(outputPath);

    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            maxRedirects: 5,  // Follow redirects if needed
        });

        response.data.pipe(writer);

        writer.on('finish', () => {
            console.log('Model downloaded successfully!');
        });

        writer.on('error', (err) => {
            console.error('Error downloading the model:', err);
        });
    } catch (error) {
        console.error('Error downloading the model:', error);
    }
}

downloadModel();
