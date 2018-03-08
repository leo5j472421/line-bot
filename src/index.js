linebot = require('linebot');
express = require('express');
WebSocket = require('ws');
rp = require('request-promise');
poloniex = require('./ExchangeApi/wsApi');
jieba = require('./jieba-js/node.js/node');


jieba('入金為什麼沒收到?').then(r => {
    console.log(r)
});


bot = linebot({
    channelId: '1566351681',
    channelSecret: '2d2a8e358747aec623d89d8a565a79fd',
    channelAccessToken: 'fGY0tObXfJlN1e+7xyj4B7G1a0dgXNNxP62pFAOsz5KJtY4z98ZiyYU5V/L3AKLzNClxTBbdO6J1zciD0bZlhsqhFab1GqsKyrvw4RWfGRDLVBMYSPilZ86Q8PjjZ6nbsw/p9pOY73KZUt+YaSP1GwdB04t89/1O/w1cDnyilFU='
});

url = {
    'BTC': ['https://i.ebayimg.com/images/g/9H0AAOSwh5hZ5P8g/s-l300.jpg', 'https://bitcoin.org/en/'],
    'ETH': ['https://steemitimages.com/DQmdfgYyo81i2bRSnFW5zyRYJYEx8taaBrzL7akWR3Rez7k/ethereum%20moon.jpg', 'https://www.ethereum.org/'],
    'LTC': ['https://cryptocurrencynews.com/wp-content/uploads/sites/3/2018/02/Litecoin-Price-Watch-LTC-USD-Breaks-Above-230-678x381.jpg', 'https://litecoin.org/'],
    'XRP': ['https://news4c.com/wp-content/uploads/2018/02/Ripple-Survives-Market-Crash.jpg', 'https://ripple.com/']
};

all = {
    type: 'template',
    altText: 'this is a carousel template',
    template: {
        type: 'carousel',
        columns: []
    }
};


function start() {
    exchange = new poloniex();
    exchange.start();
}

start();
allpair = ['BTC', 'ETH', 'LTC', 'XRP'];

function alltick() {
    return new Promise(function (resolve, reject) {
        all.template.columns = [];
        for (let index in allpair) {
            pair = 'USDT_' + allpair[index];
            all.template.columns.push({
                thumbnailImageUrl: url[allpair[index]][0],
                title: pair,
                text: '現在價格 : ' + exchange.ws.tick[pair].price,
                actions: [{
                    type: 'postback',
                    label: '價格資料',
                    data: JSON.stringify({currency: allpair[index], action: 'tickData'})
                }, {
                    type: 'uri',
                    label: 'View detail',
                    uri: url[allpair[index]][1]
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
        ticker = exchange.ws.tick['USDT_' + currency];
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

bot.on('postback', (event) => {
    data = JSON.parse(event.postback.data);
    console.log(data);
    if (data.action === 'tickData')
        replyTick(event, data.currency);
});

bot.on('message', function (event) {
    if (event.message.type = 'text') {
        let msg = event.message.text;
        let msgs = msg.match(/\S+/g);
        console.log(msgs);
        let action = msgs[0];
        if (action === 'restart')
            start();
        else if (action === '價格' || action === '$') {
            let currency = msgs[1].toUpperCase();
            if (currency === 'ALL') {
                replyAll(event);
            } else {
                replyTick(event, currency).catch(err => {
                    console.log(err);
                    event.reply('不支援"' + currency + '"幣種')
                });
            }
        } else {
            console.log(exchange.ws.tick.USDT_ETH);
            jieba(msg).then(result => {
                console.log(exchange.ws.tick.USDT_ETH);
                console.log(result);
                if (result.indexOf('出金') !== -1 && result.indexOf('沒收到') !== -1 && result.indexOf('完成') !== -1) {
                    let string = '區塊鏈需要時間處理交易Blah blah blah';
                    event.reply([string, {
                        type: "template",
                        altText: "This is a buttons template",
                        template: {
                            type: "buttons",
                            thumbnailImageUrl: "https://cdn-images-1.medium.com/max/640/1*rv85RFa5z9_tMWo5QodVew.jpeg",
                            imageAspectRatio: "rectangle",
                            imageSize: "cover",
                            imageBackgroundColor: "#FFFFFF",
                            title: "區塊鏈帳本",
                            text: "選擇要查詢的幣種",
                            defaultAction: {
                                type: "uri",
                                label: "乙太幣",
                                uri: "https://etherscan.io/"
                            },
                            actions: [
                                {
                                    type: "uri",
                                    label: "比特幣",
                                    data: "https://www.blocktrail.com/BTC"
                                },
                                {
                                    type: "uri",
                                    label: "乙太幣",
                                    uri: "https://etherscan.io/"
                                }
                            ]
                        }
                    }]).then(() => {
                        console.log('send success');

                    })

                } else if (result.indexOf('出金') !== -1 && result.indexOf('沒收到') !== -1) {
                    let string = '申請後不會立即出金\n出金需要三個工作日的人工審核時間\n超過中午12點，視為隔日申請';
                    event.reply([string, {
                        type: "sticker",
                        packageId: "1",
                        stickerId: "104"
                    }]).then(() => {
                        console.log('send success');

                    })
                }

            });
            /*
            if (action === '我申請了入金，為什麼還沒收到?') {
                let string = '申請後不會立即出金\n出金需要三個工作日的人工審核時間';
                event.reply([string, {
                    type: "sticker",
                    packageId: "1",
                    stickerId: "104"
                }]).then(() => {
                    console.log('send success');
                })
            }*/
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