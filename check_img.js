const fs = require('fs');
const buf = fs.readFileSync('hq.jpg');
// simple jpeg check, look at size
console.log('hq.jpg size:', buf.length);
