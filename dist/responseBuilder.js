class ResponseBuilder{
  constructor(){
    this.version = "0.1.0";
    this.sessionAttributes = {};
    this.response = {
      outputSpeech: {
        type: "SpeechList",
        values: [],
      },
      reprompt: {
        outputSpeech: {
          type: "SpeechList",
          values: [],
        }
      },
      shouldEndSession: true
    }
  }

  speak(msg){
    var value = {
      type: "PlainText",
      lang: "ja",
      value: msg
    };
    this.response.outputSpeech.values.push(value);
    this.response.reprompt = this.response.reprompt;
    this.response.shouldEndSession = this.response.shouldEndSession;
    return this 
  }

  reprompt(repromptMsg){
    var value = {
      type: "PlainText",
      lang: "ja",
      value: repromptMsg
    }
    this.response.reprompt.outputSpeech.values.push(value);
    this.response.shouldEndSession = false;
    return this 
  }
  audioPlay(url){
    var value = {
      type: "URL",
      lang: "",
      value: url
    };
    this.response.outputSpeech.values.push(value);
    this.response.reprompt = this.response.reprompt;
    this.response.shouldEndSession = this.response.shouldEndSession;
    return this 

  }
  audioPlayReprompt(repromptURL){
    var value = {
      type: "URL",
      lang: "",
      value: repromptURL
    }
    this.response.reprompt.outputSpeech.values.push(value);
    this.response.shouldEndSession = false;
    return this 

  }

  getResponse(){
    return this;
  }

}

var responseBuilder = new ResponseBuilder();
module.exports = responseBuilder;


