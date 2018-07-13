# 注意

公式ではありません。

# GITHUB

https://github.com/imajoriri/love-clova/wiki

# skd読み込み

```js
var clova = require('./clova-sdk.js');
```

# 初期設定


```js
exports.handler = clova.extensionBuilders.addRequestHandlers(
  LaunchRequestHandler,
  GuideIntentHandler,
  sampleIntentHandler) // 後で定義するhandlerを登録
  .lambda();
```

# ハンドラーの定義

1. handler変数を定義する。
2. 1で定義したhandlerに`canHandle`をメソッドを定義する。
3. 1で定義したhandlerに`handle`メソッドを定義する（`canHandle`が`true`の時`handle`が呼ばれる)
4. 1で定義したhandlerを`clova.extensionBuilders.addeRuestHandlers`に追加する

## LaunchRequestハンドラ

`LaunchRequest`を処理するハンドラを以下で定義する

```js
const LaunchRequestHandler = {
  canHandle: function(handlerInput){
    return handlerInput.requestEnvelope.isMatch("LaunchRequest");
    // or
    //return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  handle: function(handlerInput){
    var msg = "LauchRequestの時に呼ばれます";
    return handlerInput.responseBuilder
      .speak(msg)
      .reprompt(msg)
      .getResponse();
  }
}
```

## sampleIntentHandler(自分で定義したインテント)

CEKで定義した`sampleIntent`を処理するハンドラの定義

```js
const sampleIntentHandler = {
  canHandle: function(handlerInput){
    return handlerInput.requestEnvelope.isMatch("sampleIntent");
    // or
    //return handlerInput.requestEnvelope.request.type === "IntentRequest"
    //  && handlerInput.requestEnvelope.request.intent.name === "sampleIntent";
  },
  handle: function(handlerInput){
    var msg = "sampleIntentが呼ばれた時に発動";
    return handlerInput.responseBuilder
      .speak(msg)
      .getResponse();
  }
}
```

## erroHandlerの定義

`addHandlers`で定義したハンドラでエラーが起こった時、または呼ばれるハンドラがなかった時に呼ばれる
リリース前（開発段階）では取り除くことを推薦する

ハンドラの定義
```js
const errorHandler = {
  canHandle: function(handlerInput){
    return true;
  },
  handle: function(handlerInput){
    // canHandleがtrueの時に呼ばれる
    var msg = "エラー発生";
    return handlerInput.responseBuilder
      .speak(msg)
      .reprompt(msg)
      .getResponse();
  }
}
```

# ハンドラのセット

```js
exports.handler = clova.extensionBuilders.addRequestHandlers(
  LaunchRequestHandler,
  sampleIntentHandler) // 後で定義するhandlerを登録
  .addErrorHandlers(errorHandler)
  .lambda();

//or

exports.handler = async function(event, content){
  clova.extensionBuilders.add....
  return clova.extensionBuilders.invoke(event);
};
```

# slots

```js
var value = handlerInput.requestEnvelope.request.intent.slots.key.value;
// or
var slots = handlerInput.requestEnvelope.getSlot();
var value = slots.key;
```

# sessionAttributeManager

```js
var session = handlerInput.sessionAttributeManager.getSessionAttributes(); // 取得

handlerInput.sessionAttributeManager.setSessionAttributes(session); // セット
```

# レスポンス

## clovaが喋る言葉を定義する(会話終了)

`speak`関数を使用することによってClovaに喋らす言葉を定義する。
ただし、これだけだとClovaが喋ってスキルが終了となる。

```js
return handlerInput.responseBuilder.speak(msg).getResponse();
```

再度ユーザーに発話を促せたい場合、次にするす`reprompt`関数を使用する必要がある

## clovaが喋る言葉を定義する(再度ユーザーに発話を要求する)

`speak`関数と`reprompt`関数を使用することで再度ユーザーに発話を促すことができる（スキルが終了しない)
これにより`shouldEndSession`が`true`になる
`reprompt`関数の引数にはユーザーが一定時間発話しなかった時に再度Clovaに喋らせたい内容を定義する

```js
return handlerInput.responseBuilder.speak(msg).reprompt(reprompt).getResponse();
```

## audioを流す

```js
var url = "audioのURL";

return handlerInput.responseBuilder.audioPlay(url).getResponse(); // audioを流して、スキルを終了させたい時

return handlerInput.responseBuilder.audioPlay(url).audioPlayReprompt(url).getResponse(); // audioを流した後も会話を継続させたい時。（repromptもaudio)
return handlerInput.responseBuilder.audioPlay(url).reprompt(reprompt).getResponse(); // audioを流した後も会話を継続させたい時。（repromptはテキスト)
```


# dynamoDB

## 設定

```js
exports.handler = clova.extensionBuilders.addRequestHandlers(
  LaunchRequestHandler,
  GuideIntentHandler,
  sampleIntentHandler)  
  .setDynamoTableName("tableName") // テーブル名をセット。
  .lambda();
```

## 取得、保存
```js
var attributes = await handlerInput.dynamoManager.getDynamoAttributes(); // 取得

var attributes = {
  key: "value"
}

handlerInput.dynamoManager.setDynamoAttributes(attributes); // 値をセット
await handlerInput.dynamoManager.saveDynamoAttributes(); // 保存
```

# 付録

## handleをPromiseを使いたい時

例えば`request-promise`モジュールなどを使う時

```js
return new Promise((resolve, reject) => {
  rp('http://www.google.com')
  .then((res) => {
    resolve(handlerInput.responseBuilder.speak(msg).reprompt(msg).getResponse());
  });
});
```

