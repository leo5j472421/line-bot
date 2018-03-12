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

module.exports = function () {
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
                self.tick[cp].price = parseFloat(data[1]);
                self.tick[cp].high = parseFloat(data[8]);
                self.tick[cp].low = parseFloat(data[9]);
                self.tick[cp].volume = parseFloat(data[5]);
                self.tick[cp].change =parseFloat(data[4]) * 100;
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
                        'price': parseFloat(data[d].last),
                        'volume': parseFloat(data[d].baseVolume),
                        'change': parseFloat(data[d].percentChange) * 100,
                        'high': parseFloat(data[d].high24hr),
                        'low': parseFloat(data[d].low24hr)
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

            mySocket.onclose = function (e) {

                console.log('Socket Close');
            };

            mySocket.onerror = function (e) {

                console.log('Socket Error');
                console.log(e);
            };

            mySocket.onmessage = function (e) {
                data = JSON.parse(e.data);
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