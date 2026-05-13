const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const db = require('./db');
const venuesRouter = require('./routes/venues');
const ordersRouter = require('./routes/orders');
const runnersRouter = require('./routes/runners');
const standsRouter = require('./routes/stands');
const reportsRouter = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
}

app.use('/api/venues', venuesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/runners', runnersRouter);
app.use('/api/stands', standsRouter);
app.use('/api/reports', reportsRouter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'SeatServe',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

async function initDB() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await db.query(schema);
    console.log('Database schema initialized');
  } catch (err) {
    console.error('Schema init error', err.message);
  }
}

if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(PORT, async () => {
  await initDB();
  console.log(`SeatServe server running on port ${PORT}`);
});
