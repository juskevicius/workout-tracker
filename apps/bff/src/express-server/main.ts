import express from 'express';
import { router } from './google-drive-sync-router';
import { checkClientOrigin } from './middleware';

const app = express();

// Middleware
app.use(express.json());
app.use(checkClientOrigin);

// CORS configuration for React app
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});


// Routes
app.use('/api/sync/google', router);

export { app };
