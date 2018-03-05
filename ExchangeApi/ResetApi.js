rp = require('request-promise');
export function getTickerData(pair) {
        return rp('https://poloniex.com/public?command=returnTicker').then(data => {
            data = JSON.parse(data);
            data = data['USDT' + pair];
            tick = {
                'price': data.last,
                'volume': data.baseVolume,
                'change': data.percentChange
            };
            return tick
        });
}

export var port = 3000;




