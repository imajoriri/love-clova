var requestEnvelope         = require("./requestEnvelope.js");
var responseBuilder         = require("./responseBuilder.js");
var sessionAttributeManager = require('./sessionAttributeManager.js');
var dynamoManager           = require("./dynamoManager.js");

var verifier                = require('./util/verifier.js');

//var ExtensionBulders = function(){
class ExtensionBulders{
  constructor(){
    // required object
    this.requestEnvelope         = requestEnvelope;
    this.responseBuilder         = responseBuilder;
    this.sessionAttributeManager = sessionAttributeManager;
    this.dynamoManager           = dynamoManager;

    // handler
    this.handlers = []; 
    this.errorHandlers = [];

    // ExtensionId(applicationId)
    this.extensionId;
    // extensionidやsignatureを判断するかどうか
    this.isCheckRequest = false;
  }
  // TODO 
  // extensionIDをセットするメソッド。
  // どこかのタイミングでverifier関数

  setEventBoforeDoHandler(event){
    this.requestEnvelope.version = event.version;
    this.requestEnvelope.session = event.session;
    this.requestEnvelope.context = event.context;
    this.requestEnvelope.request = event.request;

    this.sessionAttributeManager.sessionAttributes = event.session.sessionAttributes;
    this.dynamoManager.userId = event.session.user.userId;
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

  setDynamoTableName(tableName){
    this.dynamoManager.tableName = tableName;
    return this;
  }

  lambda(){
    var that = this;
    return (event) => this.invoke(event);
    //return async function(event, context){
    //  return that.invoke(event);
    //};
  }

  async invoke(event){
    this.setEventBoforeDoHandler(event);
    var executionHandler = this.getExecutionHandler(); // 実行するハンドラを一個だけ
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

      if(this.dynamoManager.tableName !== undefined){
        await this.dynamoManager.dynamoCreate();
      }

      return responseJSON;
    }
  }

  //invoke: function(event){
  //  this.setEventBoforeDoHandler(event);
  //  var executionHandler = this.getExecutionHandler();

  //  if(executionHandler){
  //    return new Promise( (resolve, reject) => {
  //      var responseJSON = executionHandler.handle(this);
  //      responseJSON.sessionAttributes = this.sessionAttributeManager.sessionAttributes;
  //      if(this.dynamoManager.tableName === undefined){
  //        resolve(responseJSON);
  //      }else{
  //        this.dynamoManager.dynamoCreate().then( data => {
  //          resolve(responseJSON);
  //        });
  //      }
  //    });
  //  }
  //},

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
