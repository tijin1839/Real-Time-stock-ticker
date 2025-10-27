// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const fetch = require('node-fetch'); // v3
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static('public'));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' } // change for production
});

// Config
const PORT = process.env.PORT || 3000;
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS) || 2000;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || null;

// Default symbols
const SYMBOLS = (process.env.SYMBOLS || 'AAPL,GOOGL,MSFT,TSLA,NVDA').split(',');

// Internal state for simulation fallback
const simulatedState = {};
for (const s of SYMBOLS) {
  // start with a reasonable base price
  simulatedState[s] = {
    price: Math.round((50 + Math.random() * 200) * 100) / 100,
    history: []
  };
}

async function fetchQuoteFromFinnhub(symbol) {
  // Finnhub /quote endpoint: https://finnhub.io/docs/api/quote
  // returns object {c: current, h: high, l: low, o: open, pc: prevClose, t: timestamp}
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`http ${res.status}`);
    const data = await res.json();
    if (!data || typeof data.c !== 'number') throw new Error('invalid data');
    return {
      price: Math.round(data.c * 100) / 100,
      open: data.o ? Math.round(data.o * 100) / 100 : null,
      prevClose: data.pc ? Math.round(data.pc * 100) / 100 : null,
      raw: data
    };
  } catch (err) {
    console.warn('Finnhub fetch failed for', symbol, err.message);
    return null;
  }
}

function simulatePrice(symbol) {
  const s = simulatedState[symbol];
  // apply a small random percent change
  // e.g., ±0.5% with occasional larger moves
  const r = Math.random();
  const pct = (r < 0.02) ? ( (Math.random() - 0.5) * 0.1 ) // rare big move ±5%
                 : ( (Math.random() - 0.5) * 0.01 ); // normal ±0.5%
  const newPriceRaw = s.price * (1 + pct);
  const newPrice = Math.round(newPriceRaw * 100) / 100;
  const change = Math.round((newPrice - s.price) * 100) / 100;
  s.price = newPrice;
  s.history.push(newPrice);
  if (s.history.length > 60) s.history.shift();
  return { price: newPrice, change, history: s.history.slice() };
}

async function getPrices() {
  const results = [];
  for (const symbol of SYMBOLS) {
    let obj = null;
    if (FINNHUB_API_KEY) {
      const fetched = await fetchQuoteFromFinnhub(symbol);
      if (fetched) {
        const prev = simulatedState[symbol].price || fetched.prevClose || fetched.price;
        // ensure history state exists
        simulatedState[symbol].price = fetched.price;
        simulatedState[symbol].history.push(fetched.price);
        if (simulatedState[symbol].history.length > 60) simulatedState[symbol].history.shift();
        const change = Math.round((fetched.price - prev) * 100) / 100;
        obj = {
          symbol,
          price: fetched.price,
          change,
          history: simulatedState[symbol].history.slice()
        };
      } else {
        // fallback to simulation on error
        const sim = simulatePrice(symbol);
        obj = { symbol, price: sim.price, change: sim.change, history: sim.history };
      }
    } else {
      const sim = simulatePrice(symbol);
      obj = { symbol, price: sim.price, change: sim.change, history: sim.history };
    }
    results.push(obj);
  }
  return results;
}

// On new socket connection, send current symbols and start streaming
io.on('connection', (socket) => {
  console.log('client connected', socket.id);
  socket.emit('symbols', SYMBOLS);

  const interval = setInterval(async () => {
    try {
      const prices = await getPrices();
      socket.emit('prices', prices);
    } catch (err) {
      console.error('error in price poll:', err);
    }
  }, POLL_INTERVAL_MS);

  socket.on('disconnect', () => {
    clearInterval(interval);
    console.log('client disconnected', socket.id);
  });

  // allow client to request a one-off snapshot
  socket.on('snapshot', async () => {
    const prices = await getPrices();
    socket.emit('prices', prices);
  });
});

app.get('/health', (req, res) => res.json({ status: 'ok', time: Date.now() }));

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});