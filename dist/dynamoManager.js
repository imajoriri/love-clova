var AWS = require('aws-sdk');
var dynamoClient = new AWS.DynamoDB.DocumentClient()

class DynamoManager{
  constructor(){
    this.userId = "";
    this.tabelName = undefined;

    this.tableParams = {
      TableName: undefined,
      KeySchema: [
        { AttributeName: "userId", KeyType: "HASH"} 
      ],
      AttributeDefinitions: [
        { AttributeName: "userId", AttributeType: "S" }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    };

    this.updateParams = {
      TableName: undefined,
      Key:{
        "userId": '' 
      },
      UpdateExpression: "set mapAttr=:mapAttr",
      ExpressionAttributeValues:{},
      ReturnValues:"UPDATED_NEW"
    }

    this.getParams = {
      TableName: "",
      Key: {
        "userId": ""
      }
    };
  }

  dynamoCreate(dynamodb){
    var dynamo = new AWS.DynamoDB();
    this.tableParams.TableName = this.tableName;
    return new Promise( (resolve, reject) => {
      dynamo.describeTable({TableName: this.tableName}, (err, data) => { // テーブルの詳細情報を取得
        if (err && err.code == "ResourceNotFoundException") { // テーブルがなかったら新しく作成
          dynamo.createTable(this.tableParams, (createTableErr, data) => {
            if(createTableErr){ reject(createTableErr); }
            resolve();
          });
        }else if(err && err.code != "ResourceNotFoundException") { // テーブルが存在しなかった時以外のエラー
          reject(err);
        }else{
          resolve();
        }
      });
    });
  }
  //dynamoCreate(dynamodb){
  //  var dynamo = new AWS.DynamoDB();
  //  this.tableParams.TableName = this.tableName;
  //  return new Promise( (resolve, reject) => {
  //      dynamo.createTable(this.tableParams, function(err, data) {
  //        console.log(err)
  //        resolve();
  //      });
  //  });
  //}

  getDynamoAttributes(){
    this.isTableNameSet();
    this.getParams.TableName = this.tableName;
    this.getParams.Key["userId"] = this.userId;
    return new Promise( (resolve, reject) => {
      dynamoClient.get(this.getParams, function(err, data){
        if(err){ reject(); }
        if(data.Item){ var result = data.Item.mapAttr; }
        resolve(result);
      })
    });
  }

  // UpdateExpressionとExpressionAttributeValues
  setDynamoAttributes(attributes){
    this.isTableNameSet();
    this.updateParams.TableName = this.tableName;
    this.updateParams.Key["userId"] = this.userId;
    var ExpressionAttributeValues = { ":mapAttr": attributes };
    this.updateParams.ExpressionAttributeValues = ExpressionAttributeValues;
    return this;
  }

  saveDynamoAttributes(){
    this.isTableNameSet();
    return new Promise( (resolve, reject) => {
      dynamoClient.update(this.updateParams, function (err, data) {
        if (err) {
          reject();
        } else {
          resolve();
        }
      });
    });
  }

  isTableNameSet(){
    if(this.tableName === undefined){
      throw new Error("please set tableName with setDynamoTableName function"); 
    }
  }
}

module.exports = new DynamoManager();
