var fs = require('fs');

//ファイルの書き込み関数
function writeFile(path, data) {
  fs.writeFile(path, data, function (err) {
    if (err) {
        throw err;
    }
  });
}

// index file
const makeIndex = require('./makeIndex.js');
const createFileName = makeIndex.createFileName;
const indexFile = makeIndex.indexFile;
writeFile(createFileName, indexFile);

