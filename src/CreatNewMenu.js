rp = require('request-promise');

var headers = {
    "Content-Type" : 'application/json',
    "Authorization" : 'Bearer {fGY0tObXfJlN1e+7xyj4B7G1a0dgXNNxP62pFAOsz5KJtY4z98ZiyYU5V/L3AKLzNClxTBbdO6J1zciD0bZlhsqhFab1GqsKyrvw4RWfGRDLVBMYSPilZ86Q8PjjZ6nbsw/p9pOY73KZUt+YaSP1GwdB04t89/1O/w1cDnyilFU=}'
};


var dataString = {
"size":{
    "width":2500,
        "height":1686
},
"selected":false,
    "name":"Controller",
    "chatBarText":"價格資料",
    "areas":[
    {
        "bounds":{
            "x":0,
            "y":0,
            "width":833,
            "height":843
        },
        "action":{
            "type":"postback",
            "label" : "BTC",
            "data":"{\"currency\": \"BTC\", \"action\": \"tickData\"}"
        }
    },
    {
        "bounds":{
            "x":833,
            "y":0,
            "width":833,
            "height":843
        },
        "action":{
            "type":"postback",
            "data":"{\"currency\": \"ETH\", \"action\": \"tickData\"}"
        }
    },
    {
        "bounds":{
            "x":1666,
            "y":0,
            "width":833,
            "height":843
        },
        "action":{
            "type":"postback",
            "data":"{\"currency\": \"LTC\", \"action\": \"tickData\"}"
        }
    },
    {
        "bounds":{
            "x":0,
            "y":843,
            "width":833,
            "height":843
        },
        "action":{
            "type":"postback",
            "data":"{\"currency\": \"XRP\", \"action\": \"tickData\"}"
        }
    },
    {
        "bounds":{
            "x":833,
            "y":843,
            "width":833,
            "height":843
        },
        "action":{
            "type":"postback",
            "data":"{\"currency\": \"BCH\", \"action\": \"tickData\"}"
        }
    },
    {
        "bounds":{
            "x":1666,
            "y":843,
            "width":833,
            "height":843
        },
        "action":{
            "type":"postback",
            "data":"{\"currency\": \"ETC\", \"action\": \"tickData\"}"
        }
    }
]
};

var options = {
    url: 'https://api.line.me/v2/bot/richmenu',
    method: 'POST',
    headers: headers,
    body: JSON.stringify(dataString)
};

rp(options).then(body=>{
    richMenuId = JSON.parse(body).richMenuId ;
});

