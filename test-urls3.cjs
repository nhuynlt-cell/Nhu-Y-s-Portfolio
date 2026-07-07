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
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Canva_icon_2021.svg/512px-Canva_icon_2021.svg.png',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Affinity_%28App%29_Logo.svg/512px-Affinity_%28App%29_Logo.svg.png'
];

Promise.all(urls.map(checkUrl)).then(results => console.log(results.join('\n')));
