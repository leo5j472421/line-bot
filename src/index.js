linebot = require('linebot');
express = require('express');
WebSocket = require('ws');
rp = require('request-promise');
poloniex = require('./ExchangeApi/wsApi');
jieba = require('./jieba-js/node.js/node');
richMenu = require('./richMenu');

const {Client} = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});

function pad(num, padding) {
    if (typeof num !== "string")
        num = num.toString();

    while (num.length < padding)
        num = "0" + num;

    return num;
}


function timestampToDate(timestamp) {
    let rDate = new Date(parseInt(timestamp));
    let date = rDate.getFullYear() + "-" + pad(rDate.getMonth() + 1, 2) + "-" + pad(rDate.getDate(), 2);
    let time = pad(rDate.getHours(), 2) + ":" + pad(rDate.getMinutes(), 2) + ":" + pad(rDate.getSeconds(), 2);
    return [date, time];

}


/*
client.connect();

client.query('INSERT INTO public.chatlog(\n' +
    '\tdate, message, sent, "time", type, "userId", "userName")\n' +
    '\tVALUES (\'' + datetime[0] + '\', \'test\', True, \'' + datetime[1] + '\', \'message\', \'12345\', \'爽拉\');', (err, res) => {
    if (err)
        console.log(err);
    else
        for (let row of res.rows) {
            console.log(JSON.stringify(row));
        }
    client.end();
});
*/



bot = linebot({
    'channelId': '1566351681',
    'channelSecret': '2d2a8e358747aec623d89d8a565a79fd',
    'channelAccessToken': 'fGY0tObXfJlN1e+7xyj4B7G1a0dgXNNxP62pFAOsz5KJtY4z98ZiyYU5V/L3AKLzNClxTBbdO6J1zciD0bZlhsqhFab1GqsKyrvw4RWfGRDLVBMYSPilZ86Q8PjjZ6nbsw/p9pOY73KZUt+YaSP1GwdB04t89/1O/w1cDnyilFU='
});

url = {
    'BTC': ['https://i.ebayimg.com/images/g/9H0AAOSwh5hZ5P8g/s-l300.jpg', 'https://bitcoin.org/en/'],
    'ETH': ['https://steemitimages.com/DQmdfgYyo81i2bRSnFW5zyRYJYEx8taaBrzL7akWR3Rez7k/ethereum%20moon.jpg', 'https://www.ethereum.org/'],
    'LTC': ['https://cryptocurrencynews.com/wp-content/uploads/sites/3/2018/02/Litecoin-Price-Watch-LTC-USD-Breaks-Above-230-678x381.jpg', 'https://litecoin.org/'],
    'XRP': ['https://news4c.com/wp-content/uploads/2018/02/Ripple-Survives-Market-Crash.jpg', 'https://ripple.com/']
};

all = {
    "type": 'template',
    "altText": 'this is a carousel template',
    "template": {
        "type": 'carousel',
        "columns": []
    }
};

function chatlog(event){
    let datetime = timestampToDate(Date.now());
    let type = event.type;
    let sent = true;
    let userId = event.source.userId;
    bot.getUserProfile(userId).then( profile => {
        console.log('yes id here');
        let sqlquery = 'INSERT INTO public.chatlog(\n' +
            '\tdate, message, sent, "time", type, "userId", "userName")\n' +
            '\tVALUES (\'' + datetime[0] + '\', \''+event.message.text +'\', True, \'' + datetime[1] + '\', \''+type+'\', \''+userId+'\', \''+profile.displayName+'\');';
        console.log(sqlquery);
        client.query(sqlquery, (err, res) => {
            if (err)
                console.log(err);
            else
                console.log(res);
            client.end();
        });
    });
}

function sticker(pkg, id) {
    return {
        "type": "sticker",
        "packageId": pkg.toString(),
        "stickerId": id.toString()
    }
}

function start() {
    exchange = new poloniex();
    exchange.start();
}

function stringInArrary(arr, string) {
    return arr.indexOf(string) !== -1
}

start();
allpair = ['BTC', 'ETH', 'LTC', 'XRP'];

function alltick() {
    return new Promise(function (resolve, reject) {
        all.template.columns = [];
        for (let index in allpair) {
            pair = 'USDT_' + allpair[index];
            all.template.columns.push({
                "thumbnailImageUrl": url[allpair[index]][0],
                "title": pair,
                "text": '現在價格 : ' + exchange.ws.tick[pair].price,
                "actions": [{
                    "type": 'postback',
                    "label": '價格資料',
                    "data": JSON.stringify({currency: allpair[index], action: 'tickData'})
                }, {
                    "type": 'uri',
                    "label": 'View detail',
                    "uri": url[allpair[index]][1]
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
            event.reply([alls, sticker(1, 10)]).then(function (data) {
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
        let string = currency + '價格資訊:\n現在價格 : ' + ticker.price.toFixed(3);
        string += '\n過去24H最高價 : ' + ticker.high.toFixed(3);
        string += '\n過去24H最低價 : ' + ticker.low.toFixed(3);
        string += '\n漲幅 : ' + ticker.change.toFixed(3) + '%';
        console.log(string);
        event.reply(string).then(function (data) {
            // success
            console.log('success sent message' + data);
            resolve();
        })
    });
}


bot.on('follow', (event => {
    let userid = event.source.userId;
    richMenu.getRichMenuList().then((menu) => {
        let menuid = menu.richMenuId;
        richMenu.linkToUser(userid, menuid).then(() => {
            console.log('link successful');
            event.reply('肛溫訂閱')
        });
    })
}));


bot.on('postback', (event) => {
    console.log('in postdata');
    try {
        data = JSON.parse(event.postback.data);
    } catch (e) {
        console.log(e);
        data = event.postback.data;
    }

    if (data.action === 'tickData')
        replyTick(event, data.currency);
});

bot.on('message', function (event) {
    console.log('user ID: ' + event.source.userId);
    chatlog(event);
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
            jieba(msg).then(result => {
                console.log(result);
                if (stringInArrary(result, '出金') && stringInArrary(result, '沒收到') && stringInArrary(result, '完成')) {
                    let string = '區塊鏈需要時間處理交易，交易速度會依照您當初出金設定的手續費高低而定\n' +
                        '如果希望能夠快速到帳，請設定較高的手續費\n' +
                        '我們無法對已經在鏈上的交易作出任何干預(包括Unconfirmed Transactions)\n' +
                        '※交易所的到帳資訊經常有誤，查看交易請以區塊鏈帳本為準';

                    event.reply([string, {
                        'type': 'template',
                        'altText': 'this is a carousel template',
                        'template': {
                            'type': 'carousel',
                            'columns': [{
                                'thumbnailImageUrl': "https://www.hungaryfoundation.org/wp-content/uploads/2016/03/contact.jpg",
                                'title': "填寫回報單",
                                'text': "請註明當初申請出金的金額，重新發送的手續費",
                                'actions': [
                                    {
                                        'type': "uri",
                                        'label': "回報單",
                                        'uri': "https://blocksfuturehelp.zendesk.com/hc/zh-tw/requests/new"
                                    },
                                    {
                                        'type': "uri",
                                        'label': "FQA",
                                        'uri': "https://blocksfuturehelp.zendesk.com/hc/zh-tw"
                                    }
                                ]
                            }, {
                                'thumbnailImageUrl': "https://cdn-images-1.medium.com/max/640/1*rv85RFa5z9_tMWo5QodVew.jpeg",
                                'title': "區塊鏈帳本",
                                'text': "選擇要查詢的幣種",
                                'actions': [
                                    {
                                        'type': "uri",
                                        'label': "比特幣",
                                        'uri': "https://www.blocktrail.com/BTC"
                                    },
                                    {
                                        'type': "uri",
                                        'label': "乙太幣",
                                        'uri': "https://etherscan.io/"
                                    }
                                ]
                            }

                            ]
                        }
                    }]).then(() => {
                        console.log('send success');

                    })

                }
                else if (stringInArrary(result, '出金') && stringInArrary(result, '沒收到')) {
                    let string = '請留意，申請後不會立即出金：\n' +
                        '\n' +
                        '出金需要三個工作日的人工審核時間\n' +
                        '\n' +
                        '超過中午12點，視為隔日申請\n' +
                        '\n' +
                        '例假日及國定假日不計入工作日\n' +
                        '\n' +
                        '例1: 小強在星期一早上10點申請出金，則出金日為星期三\n' +
                        '\n' +
                        '例2: 小明在星期五下午2點申請出金，則出金日為星期三\n' +
                        '\n' +
                        '例3: 小美在星期天凌晨3點申請出金，則出金日為星期三';
                    event.reply([string, sticker(1, 104)]).then(() => {
                        console.log('send success');

                    })
                }
                else if (stringInArrary(result, '帳號') && stringInArrary(result, '不存在')) {
                    let string = '為避免您的帳號被他人盜用，輸入錯誤密碼時僅顯示不存在此帳號\n' +
                        ' \n' +
                        '若無法找回，可使用忘記密碼功能尋回';
                    event.reply(string)
                }
                else if (stringInArrary(result, '註冊信')) {
                    let string = '建議使用Gmail註冊\n' +
                        ' \n' +
                        '避免使用Yahoo信箱、Hotmail\n\n' +
                        '不然可能漏收註冊信';
                    event.reply(string);
                }
                else if (stringInArrary(result, '入金') && stringInArrary(result, '時間')) {
                    let string = '申請入金時間 \n 隨時(網站維修除外，事前將另行公告)';
                    event.reply(string);
                }
                else if (stringInArrary(result, '查詢') && (stringInArrary(result, '交易') || stringInArrary(result, '帳本'))) {
                    event.reply({
                        'type': "template",
                        'altText': "This is a buttons template",
                        'template': {
                            'type': "buttons",
                            'thumbnailImageUrl': "https://cdn-images-1.medium.com/max/640/1*rv85RFa5z9_tMWo5QodVew.jpeg",
                            'imageAspectRatio': "rectangle",
                            'imageSize': "cover",
                            'imageBackgroundColor': "#313335",
                            'title': "區塊鏈帳本",
                            'text': "選擇要查詢的幣種",
                            'defaultAction': {
                                'type': "uri",
                                'label': "乙太幣",
                                'uri': "https://etherscan.io/"
                            },
                            'actions': [
                                {
                                    'type': "uri",
                                    'label': "比特幣",
                                    'uri': "https://www.blocktrail.com/BTC"
                                },
                                {
                                    'type': "uri",
                                    'label': "乙太幣",
                                    'uri': "https://etherscan.io/"
                                }
                            ]
                        }
                    }).then(() => {
                        console.log('send success')
                    })
                }
                else if (stringInArrary(result, '知識') || stringInArrary(result, '問答')) {
                    event.reply({
                        'type': "template",
                        'altText': "This is a buttons template",
                        'template': {
                            'type': "buttons",
                            'thumbnailImageUrl': "https://www.geotourismturkey.com/wp-content/uploads/2009/10/geo-tourism-frequently-asked-questions.jpg",
                            'imageAspectRatio': "rectangle",
                            'imageSize': "cover",
                            'imageBackgroundColor': "#313335",
                            'title': "常見問題集",
                            'text': "關於出入金的常見問答集",
                            'defaultAction': {
                                'type': "uri",
                                'label': "入金常見問題",
                                'uri': "https://blocksfuturehelp.zendesk.com/hc/zh-tw/categories/115000501514-%E5%85%A5%E9%87%91"
                            },
                            'actions': [
                                {
                                    'type': "uri",
                                    'label': "出金常見問題",
                                    'uri': "https://blocksfuturehelp.zendesk.com/hc/zh-tw/categories/115000501534-%E5%87%BA%E9%87%91"
                                },
                                {
                                    'type': "uri",
                                    'label': "入金常見問題",
                                    'uri': "https://blocksfuturehelp.zendesk.com/hc/zh-tw/categories/115000501514-%E5%85%A5%E9%87%91"
                                }
                            ]
                        }
                    }).then(() => {
                        console.log('send success')
                    })
                }
                else if ((stringInArrary(result, '兩步驗證') || stringInArrary(result, '兩步驟驗證')) && stringInArrary(result, '遺失')) {
                    let string = '一旦遺失，請填寫回報單處理，為了您的帳戶安全，我們不接受以回報單以外任何形式申請\n' +
                        ' \n' +
                        '找回二階段認證需時較長，工程團隊會主動與您聯繫';

                    event.reply([string, {
                        'type': "template",
                        'altText': "This is a buttons template",
                        'template': {
                            'type': "buttons",
                            'thumbnailImageUrl': "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4FpwMxT88YnZg7C2a279SXJSTi86JYNkM13AL7b7ChjQqd8rt",
                            'imageAspectRatio': "rectangle",
                            'imageSize': "cover",
                            'imageBackgroundColor': "#313335",
                            'title': "回報問題",
                            'text': "請聯絡表單通知客服人員",
                            'defaultAction': {
                                'type': "uri",
                                'label': "填寫回報單",
                                'uri': "https://blocksfuturehelp.zendesk.com/hc/zh-tw/requests/new"
                            },
                            'actions': [
                                {
                                    'type': "uri",
                                    'label': "常見問題集",
                                    'uri': "https://blocksfuturehelp.zendesk.com/hc/zh-tw"
                                },
                                {
                                    'type': "uri",
                                    'label': "填寫回報單",
                                    'uri': "https://blocksfuturehelp.zendesk.com/hc/zh-tw/requests/new"
                                }
                            ]
                        }
                    }, sticker(2, 175)])
                }
                else if (stringInArrary(result, '兩步驗證') || stringInArrary(result, '兩步驟驗證')) {
                    let string = '我們強烈建議客戶啟用二階段驗證(Two-Factor Authentication，簡稱2FA)，它可以有效防止他人登入您的帳戶\n' +
                        ' \n' +
                        '同時，請備份您的二階段認證系統';
                    event.reply([string, sticker(2, 175)])
                }
                else {
                    let string = '很抱歉系統無法辨識你的問題，建議請先利用知識庫尋找您的問題，';
                    string += '通常80%以上的問題都可以在知識庫得到解答，';
                    string += '如我在知識庫找不到您的問題，再請麻煩填寫表單回報你的問題';
                    event.reply([string, {
                        'type': "template",
                        'altText': "This is a buttons template",
                        'template': {
                            'type': "buttons",
                            'thumbnailImageUrl': "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4FpwMxT88YnZg7C2a279SXJSTi86JYNkM13AL7b7ChjQqd8rt",
                            'imageAspectRatio': "rectangle",
                            'imageSize': "cover",
                            'imageBackgroundColor': "#313335",
                            'title': "回報問題",
                            'text': "請聯絡表單通知客服人員",
                            'defaultAction': {
                                'type': "uri",
                                'label': "填寫回報單",
                                'uri': "https://blocksfuturehelp.zendesk.com/hc/zh-tw/requests/new"
                            },
                            'actions': [
                                {
                                    'type': "uri",
                                    'label': "常見問題集",
                                    'uri': "https://blocksfuturehelp.zendesk.com/hc/zh-tw"
                                },
                                {
                                    'type': "uri",
                                    'label': "填寫回報單",
                                    'uri': "https://blocksfuturehelp.zendesk.com/hc/zh-tw/requests/new"
                                }
                            ]
                        }
                    }, sticker(1, 135)]).then(() => {
                        console.log('send success')
                    })
                }
            });

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