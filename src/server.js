import express from 'express';
import webRoute from './routes/web.js';
// Get the client
import mysql from 'mysql2';
import cors from "cors";

const app = express();
const port = 3000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// Create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'news_db',
});

// Thực hiện query
app.get("/api/users", (req, res) => {
  connection.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.error("Lỗi khi truy vấn:", err);
      return res.status(500).json({ error: "Lỗi server" });
    }
    res.json(results);
  });
});



app.use(webRoute);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
