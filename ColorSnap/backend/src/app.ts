import express from 'express';
import analysesRouter from './routes/analyses';
import authRouter from './routes/auth';
import bookingsRouter from './routes/bookings';
import healthRouter from './routes/health';
import meRouter from './routes/me';
import ordersRouter from './routes/orders';
import productsRouter from './routes/products';
import savedResultsRouter from './routes/savedResults';
import sharesRouter from './routes/shares';

const app = express();
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', clientOrigin);
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json());
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/me', meRouter);
app.use('/api/v1/analyses', analysesRouter);
app.use('/api/v1/bookings', bookingsRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/saved-results', savedResultsRouter);
app.use('/api/v1/shares', sharesRouter);

app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found.'
    }
  });
});

export default app;
