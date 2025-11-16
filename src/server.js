import 'dotenv/config';
import express from 'express';
import connectDB from './config/connectDB.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import parentAuthRoute from './routes/parentAuthRoute.js';
import parentChildManagementRoute from './routes/parentChildManagementRoute.js';
import childAuthRoute from './routes/childAuthRoute.js';
import getAccount from './routes/getAccount.js';

import { requireAuth } from './middlewares/requireAuth.js';
import { requireParent } from './middlewares/requireParent.js';

import { cronArticle } from './cron/cronArticle.js';



const app = express();
const PORT = process.env.PORT || 5001;



// middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  }),
);

// connectDB 
connectDB();

// run cron-job
// cronArticle();

// public routes
app.use('/parent/auth', parentAuthRoute)
app.use('/child/auth', childAuthRoute)

// private routes
app.use('/parent/child', requireAuth, requireParent, parentChildManagementRoute);
app.use('/account', getAccount)

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
})
