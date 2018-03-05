linebot = require('linebot');
express = require('express');
rp = require('request-promise');

bot = linebot({
    channelId: '1566351681',
    channelSecret: '2d2a8e358747aec623d89d8a565a79fd',
    channelAccessToken: 'fGY0tObXfJlN1e+7xyj4B7G1a0dgXNNxP62pFAOsz5KJtY4z98ZiyYU5V/L3AKLzNClxTBbdO6J1zciD0bZlhsqhFab1GqsKyrvw4RWfGRDLVBMYSPilZ86Q8PjjZ6nbsw/p9pOY73KZUt+YaSP1GwdB04t89/1O/w1cDnyilFU='
});


function getTickerData(pair) {
    return rp('https://poloniex.com/public?command=returnTicker').then(data => {
        data = JSON.parse(data);
        data = data['USDT_' + pair];
        tick = {
            'price': data.last,
            'high': data.high24hr,
            'low' : data.low24hr,
            'change': (parseFloat(data.percentChange)*100).toString()
        };

        console.log(tick);
        return tick
    });
}




bot.on('message', function (event) {
    if (event.message.type = 'text') {
        let msg = event.message.text;
        let msgs = msg.match(/\S+/g);
        console.log(msgs);
        let action = msgs[0];
        if (action === '價格' || action === '$') {
            console.log('in');
            let currency = msgs[1];
            getTickerData(currency).then(ticker => {
                let string = '現在價格 : ' + ticker.price ;
                string = '\n過去24H最高價 : ' + ticker.high ;
                string = '\n過去24H最低價 : ' + ticker.low ;
                string = '\n漲幅 : ' + ticker.change ;
                event.reply(ticker.toString())
            })
        }

        event.reply(msg).then(function (data) {
            // success
            console.log('success sent message' + data);
        }).catch(function (error) {
            // error
            console.log('error');
        });
    }
});

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});