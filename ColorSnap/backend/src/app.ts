import express from 'express';
import analysesRouter from './routes/analyses';
import healthRouter from './routes/health';
import productsRouter from './routes/products';

const app = express();
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', clientOrigin);
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json());
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/analyses', analysesRouter);
app.use('/api/v1/products', productsRouter);

app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found.'
    }
  });
});

export default app;
