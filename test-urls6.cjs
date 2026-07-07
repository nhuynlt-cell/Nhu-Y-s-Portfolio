const https = require('https');
const checkUrl = (url) => {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      resolve(`${url} -> ${res.statusCode}`);
    }).on('error', (e) => {
      resolve(`${url} -> Error: ${e.message}`);
    });
  });
};

const urls = [
  'https://upload.wikimedia.org/wikipedia/commons/5/52/Affinity_%28App%29_Logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg'
];

Promise.all(urls.map(checkUrl)).then(results => console.log(results.join('\n')));
