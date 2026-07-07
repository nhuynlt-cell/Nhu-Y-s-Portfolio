import fs from 'fs';
import https from 'https';

function getSvg(url, filename) {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if(res.statusCode === 301 || res.statusCode === 302) {
             return getSvg(res.headers.location, filename);
        }
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => fs.writeFileSync(filename, data));
    });
}
// using valid wikimedia urls
getSvg('https://upload.wikimedia.org/wikipedia/commons/c/cf/Affinity_%28App%29_Logo.svg', 'public/affinity-logo.svg');
getSvg('https://upload.wikimedia.org/wikipedia/en/3/3b/Canva_Logo.png', 'public/canva-logo.png');
