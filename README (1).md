# Real-Time Stock Ticker

A simple real-time stock ticker web app built with **Node.js**, **Express**, and **Socket.IO**.  
It can fetch live market prices from the [Finnhub API](https://finnhub.io/) or simulate real-time stock updates if no API key is provided.

---

## 🚀 Features
- Real-time stock updates using **WebSockets (Socket.IO)**
- Uses live data from Finnhub (optional)
- Automatic simulation when offline or without an API key
- Responsive and minimal frontend
- Easily deployable to Vercel, Render, or Heroku

---

## 🧰 Technologies
- Node.js + Express (server)
- Socket.IO (real-time communication)
- HTML, CSS, JS (frontend)

---

## ⚙️ Setup Instructions

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/real-time-stock-ticker.git
cd real-time-stock-ticker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create a `.env` file
Copy the example file:
```bash
cp .env.example .env
```

Then edit `.env` to include your Finnhub API key if you have one:
```
FINNHUB_API_KEY=your_finnhub_key_here
PORT=3000
POLL_INTERVAL_MS=2000
SYMBOLS=AAPL,GOOGL,MSFT,TSLA,NVDA
```

### 4. Start the app
```bash
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 Deployment

### Deploy to Vercel
1. Go to [Vercel](https://vercel.com/).
2. Import your GitHub repository.
3. Set up environment variables in the Vercel dashboard.
4. Deploy — your app will be live at `https://your-app-name.vercel.app`.

### Deploy to Render / Heroku
- Use the **Node.js** buildpack.
- Set the environment variables in the dashboard.

---

## 📁 Project Structure
```
real-time-stock-ticker/
│
├── public/              # Frontend assets
│   ├── index.html
│   ├── styles.css
│   └── app.js
│
├── server.js            # Express + Socket.IO backend
├── package.json
├── .env.example
└── README.md
```

---

## 🧪 Example
![Example UI](https://user-images.githubusercontent.com/placeholder/stock-ticker-preview.png)

---

## 🪪 License
MIT License © 2025 Your Name
