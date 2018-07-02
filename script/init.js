var fs = require('fs');

//ファイルの書き込み関数
function writeFile(path, data) {
  fs.writeFile(path, data, function (err) {
    if (err) {
        throw err;
    }
  });
}

var createFileName = "index.js";

// require
var req = `
var clova = require("love-clova");
`

// handler
var handlersList = ["LaunchRequest", "Clova.GuideIntent", "sampleIntent"]
var error = "error"
var handlers = handlersList.map( (intent) => {
  intent = intent.replace(".", ""); // ビルトインインテントに"."があるので排除
  return handlerCreater(intent);
}).join("");
var exports = exportsCreater(handlersList, error);

const errorHandler = `
const errorHandler = {
  canHandle: function(handlerInput){
    return true;
  },
  handle: function(handlerInput){
    var msg = "エラー発生";
    return handlerInput.responseBuilder.speak(msg).reprompt(msg).getResponse();
  }
}
`

var indexFile = req + handlers + errorHandler + exports;

writeFile(createFileName, indexFile);

// log
console.log(`create ${createFileName} file`);
                                   

// functions
function handlerCreater(intent){
  var text = `
const ${intent}Handler = {
  canHandle: function(handlerInput){
    return handlerInput.requestEnvelope.isMatch(${"'" + intent + "'"});
  },
  handle: function(handlerInput){
    var msg = "";
    return handlerInput.responseBuilder.speak(msg).reprompt(msg).getResponse();
  }
}
`
  return text;
}

function exportsCreater(intents, error){
  var RequestHandlers = intents.map( (intent) => {
    intent = intent.replace(".", ""); // ビルトインインテントに"."があるので排除
    return `${intent}Handler`;
  }).join(",");
  var errorHandler = `${error}Handler`;
  return `
exports.handler = clova.extensionBuilders
  .addRequestHandlers(${RequestHandlers})
  .addErrorHandlers(${errorHandler})
  .lambda()
`
  return RequestHandlers;
}


