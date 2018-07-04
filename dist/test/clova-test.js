#! /usr/bin/env node

var input = (event, data) => {
  var requestType = event.request.type;
  if(requestType === "IntentRequest"){
    var intentName = event.request.intent.name;
    var slots = event.request.intent.slots;
    var attr = event.session.sessionAttributes;
  }
  var result = `
  ------input------
  requestType: ${requestType}
  intentName: ${intentName || "none"}
  slots: ${JSON.stringify(slots)}
  attribute: ${JSON.stringify(attr)}
  `
  return result;
}

var output = (event, data) => {
  var attr = data.sessionAttributes;
  var shouldEndSession = data.response.shouldEndSession;
  const makeSpeak = (outputSpeech) => {
    if(outputSpeech.type === "SpeechList"){
      var text = "";
      for(var value of outputSpeech.values){
        text += value.value;
      }
    }
    return text;
  }
  var speak = makeSpeak(data.response.outputSpeech);
  var reprompt = makeSpeak(data.response.reprompt.outputSpeech);
  var result = `
  
  ------output------
  shouldEndSession: ${shouldEndSession}
  sessionAttributes: ${JSON.stringify(attr)}
  outputSpeech: ${speak}
  outputSpeech(reprompt): ${reprompt}
  `
  return result;
}

const rootDir = require("app-root-path").toString();
var lambda = require(`${rootDir}/index.js`).handler;
var argPath = process.argv[2];
var eventJSONPath = `${rootDir}/${argPath}`;
var event = require(eventJSONPath);

if(argPath === undefined){
  console.log("json file not specify");
  return "";
}
lambda(event).then( data => {
  if(data === undefined){
    console.log("null");
    return "";
  }
  const str = input(event, data) + output(event, data);
  console.log(str);
  console.log(JSON.stringify(data));
})
