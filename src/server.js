import 'dotenv/config';
import express from 'express';
import connectDB from './config/connectDB.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import parentAuthRoute from './routes/parentAuthRoute.js';
import parentChildManagementRoute from './routes/parentChildManagementRoute.js';
import childAuthRoute from './routes/childAuthRoute.js';
import childArticleRoute from './routes/childArticleRoute.js';
import publicArticleRoute from './routes/publicArticleRoute.js';
import getAccount from './routes/getAccount.js';
import childActivityRoute from './routes/childActivityRoute.js'

import { requireAuth } from './middlewares/requireAuth.js';
import { requireParent } from './middlewares/requireParent.js';

import { cronArticle } from './cron/cronArticle.js';
import { requireChild } from './middlewares/requireChild.js';
import { checkTime } from './middlewares/checkTime.js'

import fs from 'fs';
import swaggerUi from 'swagger-ui-express';

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// swagger
const swaggerDocument = JSON.parse(fs.readFileSync('./src/swagger.json', 'utf-8'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Serve static files (avatars) - URL: http://localhost:5000/image/filename.jpg
app.use('/image', express.static(path.join(__dirname, '../image')));


// run cron-job
// cronArticle();

// parent routes
app.use('/parent/auth', parentAuthRoute)
app.use('/parent/child', requireAuth, requireParent, parentChildManagementRoute);

// child routes
app.use('/child/auth', childAuthRoute)
app.use('/child', requireAuth, requireChild, checkTime, childArticleRoute);
app.use('/child/activity', requireAuth, requireChild, checkTime, childActivityRoute)

app.use('/account', getAccount)

// public route
app.use('/public', publicArticleRoute)

connectDB().then(() => {
  try {
    app.listen(PORT, () => {
      console.log(`Server connected to http://localhost:${PORT}`);
    })
  } catch (error) {
    console.log('Cannot connect to the server')
  }
}).catch(error => {
  console.log("Invalid database connection...!");
})