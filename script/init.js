#! /usr/bin/env node

var fs = require('fs');

//ファイルの書き込み関数
function writeFile(path, data) {
  fs.writeFile(path, data, function (err) {
    if (err) {
        throw err;
    }
  });
}

//使用例
writeFile("index.js", initIndex());

function initIndex(){
  var result = `
var clova = require("love-clova");

const LaunchRequestHandler = {
  canHandle: function(handlerInput){
    return handlerInput.requestEnvelope.isMatch("LaunchRequest");
  },
  handle: function(handlerInput){
    var msg = "LauchRequestの時に呼ばれます";
    return handlerInput.responseBuilder.speak(msg).reprompt(msg).getResponse();
  }
}

const GuideIntentHandler = {
  canHandle: function(handlerInput){
    return handlerInput.requestEnvelope.isMatch("Clova.GuideIntent");
  },
  handle: async function(handlerInput){
    var msg = "ヘルプとかって言われた時にこのスキルを説明するインテント"
    return handlerInput.responseBuilder.speak(msg).reprompt(msg).getResponse();
  }
}

const testIntentHandler = {
  canHandle: function(handlerInput){
    return handlerInput.requestEnvelope.isMatch("testIntent");
  },
  handle: async function(handlerInput){
    var msg = "testIntentが呼ばれた時に発動";
    return handlerInput.responseBuilder.speak(msg).getResponse();
  }
}

const errorHandler = {
  canHandle: function(handlerInput){
    return true;
  },
  handle: function(handlerInput){
    var msg = "エラー発生";
    return handlerInput.responseBuilder.speak(msg).reprompt(msg).getResponse();
  }
}

exports.handler = clova.extensionBuilders.addRequestHandlers(
  LaunchRequestHandler,
  GuideIntentHandler,
  testIntentHandler) 
  .addErrorHandlers(errorHandler)
  .lambda();
`
  return result;
}
