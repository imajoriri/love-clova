var requestEnvelope         = require("./requestEnvelope.js");
var responseBuilder         = require("./responseBuilder.js");
var sessionAttributeManager = require('./sessionAttributeManager.js');

var verifier                = require('./util/verifier.js');

//var ExtensionBulders = function(){
class ExtensionBulders{
  constructor(){
    // required object
    this.requestEnvelope         = requestEnvelope;
    this.responseBuilder         = responseBuilder;
    this.sessionAttributeManager = sessionAttributeManager;

    // handler
    this.handlers = []; 
    this.errorHandlers = [];

    // ExtensionId(applicationId)
    this.extensionId;
    // extensionidやsignatureを判断するかどうか
    this.isCheckRequest = false;
  }

  setEventBoforeDoHandler(event){
    this.requestEnvelope.version = event.version;
    this.requestEnvelope.session = event.session;
    this.requestEnvelope.context = event.context;
    this.requestEnvelope.request = event.request;

    // sessionAttributesManagerにリクエスト出来たセッションを保存
    this.sessionAttributeManager.sessionAttributes = event.session.sessionAttributes;
  }

  setExtensionId(extensionId){
    this.extensionId = extensionId;
    return this;
  }
  checkRequest(bool){
    this.isCheckRequest = bool;
    return this;
  }

  addRequestHandlers(){
    for(var i in arguments){ this.handlers.push(arguments[i]); }
    return this;
  }
  addErrorHandlers(){
    for(var i in arguments){ this.errorHandlers.push(arguments[i]); }
    return this;
  }

  lambda(){
    var that = this;
    return (event) => this.invoke(event);
  }

  async invoke(event){
    this.setEventBoforeDoHandler(event);
    var executionHandler = this.getExecutionHandler(); // 実行するハンドラを一個だけ取得
    var executionErrorHandler = this.getExecutionErrorHandler(); // 実行するエラーハンドラを一個だけ

    this.responseBuilder.response.outputSpeech.values = []; // lambdaの再利用により前実行の影響を受けないため
    this.responseBuilder.response.reprompt.outputSpeech.values = [];  // lambdaの再利用により前実行の影響を受けないため
    this.responseBuilder.response.shouldEndSession = true;  // lambdaの再利用により前実行の影響を受けないため

    // signature, extensionid, bodyを検証
    if(this.isCheckRequest){
      try{
        var signature = event.headers.signaturecek;
        verifier(signature, this.extensionId, this.requestEnvelope);
      }catch(e){
        console.log(e);
        return e;
      }
    }

    if(executionHandler){
      try{
        var responseJSON = await executionHandler.handle(this); 
      } catch(e) {
        if(!executionErrorHandler){throw new Error(e);}
        console.log(e);
        var errorResponseJSON = executionErrorHandler.handle(this);
        errorResponseJSON.sessionAttributes = this.sessionAttributeManager.sessionAttributes;
        return errorResponseJSON;
      }

      // sessionAttributeのセット
      responseJSON.sessionAttributes = this.sessionAttributeManager.sessionAttributes;

      return responseJSON;
    }
  }

  // canhandleが真のもの全てをexecutionhandlerに入れて行く
  getExecutionHandler(){
    var executionHandler;
    for(var i in this.handlers){
      if(this.handlers[i].canHandle(this)){ 
        executionHandler = this.handlers[i] 
        break;
      }
    }
    return executionHandler;
  }

  // canhandleが真のもの全てをexecutionErrorHandlerに入れて行く
  getExecutionErrorHandler(){
    var executionErrorHandler;
    for(var i in this.errorHandlers){
      if(this.errorHandlers[i].canHandle(this)){ 
        executionErrorHandler = this.errorHandlers[i] 
        break;
      }
    }
    return executionErrorHandler;
  }

}

module.exports = new ExtensionBulders();
