var extensionBuilders = require("./extensionBuilders.js");

class Clova {
  constructor(){
    this.extensionBuilders = extensionBuilders;
  }
}
var clova = new Clova();
module.exports = clova;
