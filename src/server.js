import express from 'express';
import * as dotenv from 'dotenv';
import connectDB from './config/connectDB.js';
import childAuthRoute from './routes/childAuthRoute.js';
import parentAuthRoute from './routes/parentAuthRoute.js';
dotenv.config();


const app = express();
const PORT = process.env.PORT || 5001;

// middleware
app.use(express.json());

// connectDB 
connectDB();

// public routes
app.use('/parent/auth', parentAuthRoute)
app.use('/child/auth', childAuthRoute)

// private routes


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
