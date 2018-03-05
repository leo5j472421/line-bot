var linebot = require('linebot');
var express = require('express');

var bot = linebot({
    channelId: '1566351681',
    channelSecret: '2d2a8e358747aec623d89d8a565a79fd',
    channelAccessToken: 'fGY0tObXfJlN1e+7xyj4B7G1a0dgXNNxP62pFAOsz5KJtY4z98ZiyYU5V/L3AKLzNClxTBbdO6J1zciD0bZlhsqhFab1GqsKyrvw4RWfGRDLVBMYSPilZ86Q8PjjZ6nbsw/p9pOY73KZUt+YaSP1GwdB04t89/1O/w1cDnyilFU='
});

bot.on('message', function(event) {
    console.log('123456879'); //把收到訊息的 event 印出來看看
});

bot.on('message', function(event) {
    if (event.message.type = 'text') {
        var msg = event.message.text;
        event.reply(msg).then(function(data) {
            // success
            console.log('success sent message'+msg);
        }).catch(function(error) {
            // error
            console.log('error');
        });
    }
});

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function() {
    var port = server.address().port;
    console.log("App now running on port", port);
});