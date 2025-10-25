import express from 'express';
import webRoute from './routes/web.js';
import * as dotenv from 'dotenv';
import connectDB from './config/connectDB.js';
dotenv.config();


const app = express();
const PORT = process.env.PORT || 5001;

// middleware
app.use(express.json());

// connectDB
connectDB();

app.use(webRoute);



app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
