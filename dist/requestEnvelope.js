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
  getSlot(slotsKey){
    if(this.request.intent.slots !== null && this.request.intent.slots[slotsKey]){
      var slots = this.request.intent.slots[slotsKey].value;
      return slots;
    }else{
      throw new Error("not defined slotsKey: " + slotsKey);
    }
  }
}

module.exports = new RequestEnvelope();
