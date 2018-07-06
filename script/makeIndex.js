

// require
var req = `
var clova = require("love-clova");
`

// handler
var handlersList = ["LaunchRequest", "SessionEndedRequest", "Clova.GuideIntent", "sampleIntent"]
var error = "error"
var handlers = handlersList.map( (intent) => {
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
var createFileName = "index.js";

console.log(`create ${createFileName} file`);

// ------exports------
module.exports.indexFile = indexFile;
module.exports.createFileName = createFileName;


// ------functions------
function handlerCreater(intent){
  var intentObject = intent.replace(".", ""); // ビルトインインテントに"."があるので排除
  var text = `
const ${intentObject}Handler = {
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


