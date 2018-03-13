rp = require('request-promise');
FormData = require('form-data');
fs = require('fs');
rq = require( 'request' );

channelAccessToken = 'fGY0tObXfJlN1e+7xyj4B7G1a0dgXNNxP62pFAOsz5KJtY4z98ZiyYU5V/L3AKLzNClxTBbdO6J1zciD0bZlhsqhFab1GqsKyrvw4RWfGRDLVBMYSPilZ86Q8PjjZ6nbsw/p9pOY73KZUt+YaSP1GwdB04t89/1O/w1cDnyilFU=';


exports.createRichMenu = function () {
    let headers = {
        "Content-Type": 'application/json',
        "Authorization": 'Bearer {'+channelAccessToken+'}'
    };


    let richMenu = {
        "size": {
            "width": 2500,
            "height": 1686
        },
        "selected": false,
        "name": "Controller",
        "chatBarText": "價格資料",
        "areas": [
            {
                "bounds": {
                    "x": 0,
                    "y": 0,
                    "width": 833,
                    "height": 843
                },
                "action": {
                    "type": "postback",
                    "label": "BTC",
                    "data": "{\"currency\": \"BTC\", \"action\": \"tickData\"}"
                }
            },
            {
                "bounds": {
                    "x": 833,
                    "y": 0,
                    "width": 833,
                    "height": 843
                },
                "action": {
                    "type": "postback",
                    "data": "{\"currency\": \"ETH\", \"action\": \"tickData\"}"
                }
            },
            {
                "bounds": {
                    "x": 1666,
                    "y": 0,
                    "width": 833,
                    "height": 843
                },
                "action": {
                    "type": "postback",
                    "data": "{\"currency\": \"LTC\", \"action\": \"tickData\"}"
                }
            },
            {
                "bounds": {
                    "x": 0,
                    "y": 843,
                    "width": 833,
                    "height": 843
                },
                "action": {
                    "type": "postback",
                    "data": "{\"currency\": \"XRP\", \"action\": \"tickData\"}"
                }
            },
            {
                "bounds": {
                    "x": 833,
                    "y": 843,
                    "width": 833,
                    "height": 843
                },
                "action": {
                    "type": "postback",
                    "data": "{\"currency\": \"BCH\", \"action\": \"tickData\"}"
                }
            },
            {
                "bounds": {
                    "x": 1666,
                    "y": 843,
                    "width": 833,
                    "height": 843
                },
                "action": {
                    "type": "postback",
                    "data": "{\"currency\": \"ETC\", \"action\": \"tickData\"}"
                }
            }
        ]
    };

    let options = {
        url: 'https://api.line.me/v2/bot/richmenu',
        method: 'POST',
        headers: headers,
        body: JSON.stringify(richMenu)
    };

    rp(options).then(body=>{
        let id = JSON.parse(body).richMenuId ;
        console.log('success create rich menu :' + id ) ;
        return id ;
    });

};


/*
function uploadImage(){

    let formData = {
        // Pass a simple key-value pair
        //my_field: 'my_value',
        // Pass data via Buffers
        //my_buffer: new Buffer([1, 2, 3]),
        // Pass data via Streams
        //my_file: fs.createReadStream(__dirname + '/image.jpg')
        // Pass multiple values /w an Array
        attachments:
            fs.createReadStream(__dirname + '/image.jpg')

        // Pass optional meta-data with an 'options' object with style: {value: DATA, options: OPTIONS}
        // Use case: for some types of streams, you'll need to provide "file"-related information manually.
        // See the `form-data` README for more information about options: https://github.com/form-data/form-data
        //custom_file: {
        //    value:  fs.createReadStream(__dirname),
        //   options: {
        //        filename: 'image.jpg',
        //        contentType: 'image/jpeg'
        //    }
        //}
    };

    headers = {
        'Authorization': 'Bearer {fGY0tObXfJlN1e+7xyj4B7G1a0dgXNNxP62pFAOsz5KJtY4z98ZiyYU5V/L3AKLzNClxTBbdO6J1zciD0bZlhsqhFab1GqsKyrvw4RWfGRDLVBMYSPilZ86Q8PjjZ6nbsw/p9pOY73KZUt+YaSP1GwdB04t89/1O/w1cDnyilFU=}',
        'Content-Type': 'image/jpeg'
    };

    options = {
        'url': 'https://api.line.me/v2/bot/richmenu/richmenu-67131e25ce72af42abfe7553429d5ba7/content',
        'method': 'POST',
        'formData': formData,
        'headers': headers
    };

    console.log(options);

    rq(options ,  function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        console.log('Upload successful!  Server responded with:', body);
    });



}
*/

exports.getRichMenuList = function () {
    let headers = {
        'Authorization': 'Bearer {'+channelAccessToken+'}'
    };

    let options = {
        'url' : 'https://api.line.me/v2/bot/richmenu/list',
        'headers' : headers
    };
    return rp(options).then(body => {
        let data = JSON.parse(body).richmenus[0] ;
        //console.log(data);
        return data;
    });
};

exports.deleteAllRichMenu =  function (){
    return getRichMenuList().then( data => {
        for ( let index in data ){
            deleteRichMenu(data[index].richMenuId);
        }

    } );
};

exports.deleteRichMenu = function (id){
    let headers = {
        'Authorization': 'Bearer {'+channelAccessToken+'}'
    };

    let options = {
        'url': 'https://api.line.me/v2/bot/richmenu/'+id ,
        'method': 'DELETE',
        'headers': headers
    };

    rp(options).then(body => {
        if ( isEmptyObject(JSON.parse(body)) )
          console.log('Success delete rich menu : '+ id);
    });
};

exports.linkToUser = function(user,richmenu) {
    return new Promise((resolve,reject)=>{

        let headers = {
            'Authorization': 'Bearer {'+channelAccessToken+'}',
            'Content-Length': '0'
        };

        let options = {
            'url': 'https://api.line.me/v2/bot/user/'+user+'/richmenu/'+richmenu ,
            'method': 'POST',
            'headers': headers
        };

        console.log(user);
        console.log(richmenu);

        rp(options).then(data=>{
            if ( exports.isEmptyObject(JSON.parse(data)) )
                console.log( 'success link '+ richmenu + 'to user ' + user );
        })
    })
};

exports.isEmptyObject = function(obj) {
    return !Object.keys(obj).length;
};


unlinkUser = function (userId){
    return new Promise((resolve,reject)=>{

        let headers = {
            'Authorization': 'Bearer {'+channelAccessToken+'}',
            'Content-Length': '0'
        };

        let options = {
            'url': 'https://api.line.me/v2/bot/user/'+userId+'/richmenu' ,
            'method': 'DELETE',
            'headers': headers
        };

        rp(options).then(data=>{
            if ( exports.isEmptyObject(JSON.parse(data)) )
                console.log(data);
                console.log( 'success unlink rich menu to user ' + userId );
        })
    })
};

//unlinkUser('U3f3f4d6d4fcad592fb04bf79fd716640');

//exports.linkToUser('U3f3f4d6d4fcad592fb04bf79fd716640','richmenu-67131e25ce72af42abfe7553429d5ba7');