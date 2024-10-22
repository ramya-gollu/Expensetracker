const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const transactionRoutes = require('./routes/transactions');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Initialize SQLite database
const db = new sqlite3.Database('./db/database.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT,
        category TEXT,
        amount REAL,
        date TEXT,
        description TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        type TEXT
      )
    `);
  }
});

// Use Routes
app.use('/transactions', transactionRoutes(db));

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
