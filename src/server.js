import express from 'express';
import webRoute from './routes/web.js';
// Get the client
import mysql from 'mysql2';

const app = express();
const port = 3000;

// Create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'news_db',
});

// Thực hiện query
connection.query(
  'SELECT * FROM `users` WHERE `username` = "dat123" AND `id` = 1',
  function (err, results, fields) {
    if (err) throw err;
    console.log('📄 Kết quả truy vấn:');
    console.log(results);  
    console.log('📋 Thông tin cột:');
    console.log(fields);  
  }
);

// Đóng kết nối sau khi xong
connection.end();

app.use(webRoute);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
