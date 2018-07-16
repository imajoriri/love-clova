var fs = require('fs');

// handlersファイルを作成
//
//ファイルの書き込み関数
function writeFile(path, data) {
  fs.writeFile(path, data, function (err) {
    if (err) {
        throw err;
    }
  });
}

// handlersディレクトリを作成
try{
  fs.mkdirSync('handlers');
}catch(e){
}

// intents
var intents = ["LaunchRequest", "SessionEndedRequest", "Clova.GuideIntent", "SampleIntent"]

// handlersディレクトリ内にファイルを作成していく
intents.forEach( (intent, index) => {
  var handler = intent.replace(".", "") + "Handler"; // ビルトインインテントに"."があるので排除
  var fileName = `handlers/${handler}.js`;
  var text = handlerCreater(handler, intent);
  writeFile(fileName, text);
});

// ErrorHandler
const ErrorHandlerText = `
exports.ErrorHandler = {
  canHandle: function(handlerInput){
    return true;
  },
  handle: function(handlerInput){
    var msg = "エラー発生";
    return handlerInput.responseBuilder.speak(msg).reprompt(msg).getResponse();
  }
}
`
writeFile('handlers/ErrorHandler.js', ErrorHandlerText);



// index.js作成
// require
var indexText = `
var clova = require("love-clova");
`
// handlerのrequire
intents.forEach( (intent, index) => {
  var handler = intent.replace(".", "") + "Handler"; // ビルトインインテントに"."があるので排除
  var fileName = `./handlers/${handler}.js`;
  indexText += `
const { ${handler} } = require(${"'" + fileName + "'"});`
});
// Errorhandlerも
indexText += `
const { ErrorHandler } = require('./handlers/ErrorHandler.js');
`;

//export.handlerのところ
indexText += `
exports.handler = async function(event, content) {
  clova.extensionBuilders.addRequestHandlers(`;

intents.forEach( (intent, index) => {
  var handler = intent.replace(".", "") + "Handler"; // ビルトインインテントに"."があるので排除
  var fileName = `./handlers/${handler}.js`;
  indexText += `
    ${handler},`
});

indexText += `
  )
  .addErrorHandlers(ErrorHandler)
  
  return clova.extensionBuilders.invoke(event);
};
`
writeFile("index.js", indexText);








// index file
//const makeIndex = require('./makeIndex.js');
//const createFileName = makeIndex.createFileName;
//const indexFile = makeIndex.indexFile;
//writeFile(createFileName, indexFile);


// ------functions------
function handlerCreater(handler, intent){
  var text = `
exports.${handler} = {
  canHandle: async function(handlerInput){
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


