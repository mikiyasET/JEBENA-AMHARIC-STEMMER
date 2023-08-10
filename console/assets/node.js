const fs = require('fs');

const data = fs.readFileSync('./data.txt', 'utf8');

const lines = data.split('\n');
const stems = {};

lines.forEach(line => {
    let [stem, word] = line.split('\t');
    stem = stem.trim().replace(/"/g, '');
    word = word.trim().replace(/"/g, '');

    if (stem !== word) {
        stems[word] = stem;
    }
});

const json = JSON.stringify(stems);
fs.writeFileSync('stems.json', json);