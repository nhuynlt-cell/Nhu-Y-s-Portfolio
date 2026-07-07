const https = require('https');
const checkUrl = (url) => {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(`${url} -> ${res.statusCode}`);
    }).on('error', (e) => {
      resolve(`${url} -> Error: ${e.message}`);
    });
  });
};

const urls = [
  'https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg',
  'https://upload.wikimedia.org/wikipedia/commons/4/4d/DaVinci_Resolve_Studio.png',
  'https://upload.wikimedia.org/wikipedia/commons/6/67/Affinity_Photo_icon.svg',
  'https://upload.wikimedia.org/wikipedia/en/2/25/CapCut_logo.png'
];

Promise.all(urls.map(checkUrl)).then(results => console.log(results.join('\n')));
