class SessionAttributeManager{
  constructor(){
    this.sessionAttributes = {};
  }

  getSessionAttributes(){
    return this.sessionAttributes;
  }
  setSessionAttributes(attributes){
    this.sessionAttributes = attributes;
  }
}

module.exports = new SessionAttributeManager();
