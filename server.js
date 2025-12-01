const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

// Serve frontend files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 8020;
const RATES_FILE = path.join(__dirname, 'rates.json');

let rates = {};

// Load rates from file at startup
async function loadRates() {
  try {
    const data = await fs.readFile(RATES_FILE, 'utf-8');
    rates = JSON.parse(data);
    console.log('Rates loaded from rates.json');
  } catch (err) {
    console.error('Failed to load rates.json:', err);
    process.exit(1);
  }
}

// GET /rate?from=USD&to=EUR
app.get('/rate', (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from and to required' });

  const rate = rates[from.toUpperCase()]?.[to.toUpperCase()];
  if (!rate) return res.status(404).json({ error: 'Rate not found' });

  res.json({
    from: from.toUpperCase(),
    to: to.toUpperCase(),
    rate
  });
});

// GET /convert?from=USD&to=EUR&amount=100
app.get('/convert', (req, res) => {
  const { from, to } = req.query;
  let amount = parseFloat(req.query.amount || '1');

  if (!from || !to) return res.status(400).json({ error: 'from and to required' });
  if (isNaN(amount)) return res.status(400).json({ error: 'amount must be numeric' });

  const rate = rates[from.toUpperCase()]?.[to.toUpperCase()];
  if (!rate) return res.status(404).json({ error: 'Rate not found' });

  const converted = +(amount * rate).toFixed(6);
  res.json({
    from: from.toUpperCase(),
    to: to.toUpperCase(),
    amount,
    rate,
    converted
  });
});

// Start server
app.listen(PORT, async () => {
  await loadRates();
  console.log(`Currency Exchange Service running on port ${PORT}`);
});

