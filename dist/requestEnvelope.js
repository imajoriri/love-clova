class RequestEnvelope{
  constructor(){
  }
  isLaunchRequest(){
    return this.request.type === "LaunchRequest";
  }
  isIntentRequest(intentName){
    return this.request.type === "IntentRequest" && this.request.intent.name === intentName;
  }
  isMatch(...intents){
    const check = intent => {
      if ( intent === "SessionEndedRequest" || intent === "LaunchRequest" ) {
        return this.request.type == intent;
      }
      if ( this.request.type === "IntentRequest" ) {
        return this.request.intent.name === intent;
      }
      return false;
    }
    return intents.some(check);
  }
  getSlot(){
    var inputSlots = this.request.intent.slots;
    var outputSlots = {};
    for(var slot in inputSlots){
      outputSlots[slot] = inputSlots[slot].value;
    }
    return outputSlots;
  }
}

module.exports = new RequestEnvelope();
