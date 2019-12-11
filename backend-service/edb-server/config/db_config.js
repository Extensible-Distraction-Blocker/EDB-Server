const mysql = require('mysql2/promise');

//    host: process.env.DATABASE_HOST || '127.0.0.1',
const dbConfig = {
    host: process.env.DATABASE_HOST || '127.0.0.1',
    port: 3306,
    database: 'flexiblelock',
    user: 'root'
}


const localtestConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    database: 'flexiblelock',
    password:"welcome1"
}

//local exact test
//module.exports = mysql.createPool(localtestConfig);


//git-compose 이용 시 test
module.exports = mysql.createPool(dbConfig);