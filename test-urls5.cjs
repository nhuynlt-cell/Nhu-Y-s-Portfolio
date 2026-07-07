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
  'https://cdn.simpleicons.org/canva/00C4CC',
  'https://cdn.simpleicons.org/affinity/1B1F22',
  'https://cdn.simpleicons.org/davinciresolve'
];

Promise.all(urls.map(checkUrl)).then(results => console.log(results.join('\n')));
