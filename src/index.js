linebot = require('linebot');
express = require('express');
WebSocket = require('ws');
rp = require('request-promise');

/*import {fruit, person, multiply} from 'ExchangeApi/ResetApi.js'


console.log(fruit);*/


bot = linebot({
    channelId: '1566351681',
    channelSecret: '2d2a8e358747aec623d89d8a565a79fd',
    channelAccessToken: 'fGY0tObXfJlN1e+7xyj4B7G1a0dgXNNxP62pFAOsz5KJtY4z98ZiyYU5V/L3AKLzNClxTBbdO6J1zciD0bZlhsqhFab1GqsKyrvw4RWfGRDLVBMYSPilZ86Q8PjjZ6nbsw/p9pOY73KZUt+YaSP1GwdB04t89/1O/w1cDnyilFU='
});

img = {
    'BTC': 'https://i.ebayimg.com/images/g/9H0AAOSwh5hZ5P8g/s-l300.jpg',
    'ETH': 'https://steemitimages.com/DQmdfgYyo81i2bRSnFW5zyRYJYEx8taaBrzL7akWR3Rez7k/ethereum%20moon.jpg',
    'LTC': 'https://cryptocurrencynews.com/wp-content/uploads/sites/3/2018/02/Litecoin-Price-Watch-LTC-USD-Breaks-Above-230-678x381.jpg',
    'XRP': 'https://news4c.com/wp-content/uploads/2018/02/Ripple-Survives-Market-Crash.jpg'
};

all = {
    type: 'template',
    altText: 'this is a carousel template',
    template: {
        type: 'carousel',
        columns: []
    }
};

function getTickerData(pair) {
    return rp('https://poloniex.com/public?command=returnTicker').then(data => {
        data = JSON.parse(data);
        data = data['USDT_' + pair];
        tick = {
            'price': data.last,
            'high': data.high24hr,
            'low': data.low24hr,
            'change': (parseFloat(data.percentChange) * 100).toString()
        };

        console.log(tick);
        return tick;
    });
}

/*
[
    1002,                             Channel
    null,                             Unknown
    [
    121,                          CurrencyPairID
    "10777.56054438",             Last
    "10800.00000000",             lowestAsk
    "10789.20000001",             highestBid
    "-0.00860373",                percentChange
    "72542984.79776118",          baseVolume
    "6792.60163706",              quoteVolume
    0,                            isForzen
    "11400.00000000",             high24hr
    "9880.00000009"               low24hr
]
]
*/

poloniex = function () {
    socket = function () {
        var self = this;
        this.tick = {};
        this.trade = {};
        this.ids = {};
        this.cps = {};
        this.marketChannel = [];
        this.market = ['USDT_BTC', 'USDT_ETH', 'USDT_LTC', 'USDT_XRP'];
        for (let cp in this.market) this.trade[this.market[cp]] = {'asks': {}, 'bids': {}};

        function tickEvent(data) {
            cp = self.ids[data[0]];
            //console.log(self.tick.USDT_ETH);
            try {
                self.tick[cp].price = data[1];
                self.tick[cp].high = data[8];
                self.tick[cp].low = data[9];
                self.tick[cp].volume = data[5];
                self.tick[cp].change = (parseFloat(data[4]) * 100).toString();
                //console.log(self.tick);
            } catch (err) {
                // tickInit is not finished yet
                console.log(err);
            }
            //if (cp === 'USDT_ETH')
            //console.log(self.tick[cp].price)
        }

        function tickInit(e) {
            return rp('https://poloniex.com/public?command=returnTicker').then(data => {
                data = JSON.parse(data);
                for (let d in data) {
                    self.ids[data[d]['id']] = d;
                    self.cps[d] = data[d]['id'];
                    self.tick[d] = {
                        'price': data[d].last,
                        'volume': data[d].baseVolume,
                        'change': (parseFloat(data[d].percentChange) * 100).toString(),
                        'high': data[d].high24hr,
                        'low': data[d].low24hr
                    };
                }
                return e.target;
            });
        }

        function tradeEvent(datas, cp) {
            for (let i in datas) {
                let data = datas[i];
                if (data[0] === 'o') {
                    side = data[1] ? 'bids' : 'asks';
                    if (data[3] === '0.00000000') {
                        delete self.trade[cp][side][data[2]];
                    } else self.trade[cp][side][data[2]] = data[3];
                }
            }

            n = Object.keys(self.trade[cp].asks).map(parseFloat);
            //console.log(Math.min(...n));
        }

        function tradeInit(data, cp) {
            for (let a in [0, 1]) {
                for (let rate in data[a]) {
                    // 0 asks 1 bids
                    if (a == 1) // bids
                        self.trade[cp].bids[rate] = data[a][rate]; else self.trade[cp].asks[rate] = data[a][rate];
                }
            }
        }

        function webSockets_subscribe(conn) {
            console.log('開始訂閱');
            if (conn.readyState === 1) {
                var params = {command: "subscribe", channel: 1002};
                conn.send(JSON.stringify(params));
                for (let a in self.market) {
                    //console.log();
                    conn.send(JSON.stringify({command: "subscribe", channel: self.market[a]}));
                }
            }
        }

        this.start = function () {

            const mySocket = new WebSocket("wss://api2.poloniex.com");

            mySocket.onopen = function (e) {

                tickInit(e).then(webSockets_subscribe);
            };

            mySocket.onmessage = function (e) {
                data = JSON.parse(e.data);
                //console.log(data);
                channel = data[0];
                var cp = self.ids[channel];
                if (channel === 1002) {
                    if (data[1] === 1) return; // subscript 1002 success
                    tickEvent(data[2]);
                } else if (channel === 1010) {
                }
                // heartbeat

                else if (self.marketChannel.indexOf(channel) !== -1) {
                    tradeEvent(data[2], cp);
                    // Trade Event
                } else {
                    if (data[2][0][0] === 'i') { // TradeInit
                        self.marketChannel.push(channel);
                        tradeInit(data[2][0][1].orderBook, cp);
                    }
                    // Trade init
                } // end if
            };

            mySocket.onclose = function () {
                console.log("Websocket connection closed");
            };
        };
    };

    //this.t = new tick();

    this.start = function () {
        this.ws = new socket();
        this.ws.start();
    };
};

p = new poloniex();
p.start();

allpair = ['BTC', 'ETH', 'LTC', 'XRP'];

function alltick() {
    console.log('@@@');
    return new Promise(function (resolve, reject) {
        all.template.columns = [];
        for (let index in allpair) {
            pair = 'USDT_' + allpair[index];
            all.template.columns.push({
                thumbnailImageUrl: img[allpair[index]],
                title: pair,
                text: '現在價格 : ' + p.ws.tick[pair].price,
                actions: [{
                    type: 'postback',
                    label: 'Buy',
                    data: 'action=buy&itemid=123'
                }, {
                    type: 'postback',
                    label: 'Add to cart',
                    data: 'action=add&itemid=123'
                }, {
                    type: 'uri',
                    label: 'View detail',
                    uri: 'http://example.com/page/123'
                }]
            });
        }
        resolve(all);
    });
}

function replyAll(event) {
    return new Promise((resolve, reject) => {
        alltick().then(alls => {
            console.log(alls.template.columns[0]);
            event.reply([alls, {
                type: "sticker",
                packageId: "1",
                stickerId: "10"
            }]).then(function (data) {
                // success
                console.log('success sent message' + data);
                resolve();
            }).catch(function (error) {
                // error
                console.log('error66');
            });
        });
    });

}

function replyTick(event, currency) {
    return new Promise((resolve, reject) => {
        ticker = p.ws.tick['USDT_' + currency];
        let string = '現在價格 : ' + ticker.price;
        string += '\n過去24H最高價 : ' + ticker.high;
        string += '\n過去24H最低價 : ' + ticker.low;
        string += '\n漲幅 : ' + ticker.change + '%';
        console.log(string);
        event.reply(string).then(function (data) {
            // success
            console.log('success sent message' + data);
            resolve();
        }).catch(function (error) {
            // error
            event.reply('6不支援"' + currency + '"幣種');
            console.log('error');

        })
    });
}

bot.on('message', function (event) {
    if (event.message.type = 'text') {
        let msg = event.message.text;
        let msgs = msg.match(/\S+/g);
        console.log(msgs);
        let action = msgs[0];
        if (action === '價格' || action === '$') {
            let currency = msgs[1];
            if (currency === 'ALL') {
                replyAll(event);
            } else {
                replyTick(event, currency).catch(err => {
                    event.reply('不支援"' + currency + '"幣種')
                });
            }
        } else {
            if (action === '我申請了入金，為什麼還沒收到?') {
                let string = '申請後不會立即出金\n出金需要三個工作日的人工審核時間';
                event.reply([string, {
                    type: "sticker",
                    packageId: "1",
                    stickerId: "104"
                }]).then(() => {
                    console.log('send success');
                })
            }
        }
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