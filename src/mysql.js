var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'db4free.net',
    user     : 'leo5j472421',
    password : '034625486',
    database : 'leo5j4linebot'
});

connection.connect();

connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    console.log(results);
    console.log(error);
    if (error) throw error;
    console.log('The solution is: ', results[0].solution);
});

connection.end();