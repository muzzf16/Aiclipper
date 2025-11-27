import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function installYtDlp() {
    try {
        console.log('Downloading yt-dlp binary from GitHub...');

        const binaryPath = path.join(__dirname, 'yt-dlp.exe');
        const downloadUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe';

        const response = await axios({
            method: 'GET',
            url: downloadUrl,
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(binaryPath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        console.log('✅ yt-dlp installed successfully at:', binaryPath);
        console.log('You can now download YouTube videos!');
    } catch (error) {
        console.error('❌ Failed to install yt-dlp:', error.message);
        console.log('\nAlternative installation methods:');
        console.log('1. Download manually from: https://github.com/yt-dlp/yt-dlp/releases');
        console.log('2. Or install via pip: pip install yt-dlp');
        process.exit(1);
    }
}

installYtDlp();
