const express = require('express');
const router = express.Router();

// Wrap the routing logic in a function to pass the `db` connection
module.exports = (db) => {
  // Add a new transaction
  router.post('/', (req, res) => {
    const { type, category, amount, date, description } = req.body;
    if (!type || !category || !amount || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `INSERT INTO transactions (type, category, amount, date, description) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [type, category, amount, date, description], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    });
  });

  // Get all transactions
  router.get('/', (req, res) => {
    db.all(`SELECT * FROM transactions`, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });

  // Get transaction summary (total income, total expenses, and balance)
  router.get('/summary', (req, res) => {
    const query = `
    SELECT 
      (SELECT IFNULL(SUM(amount), 0) FROM transactions WHERE type = 'income') AS totalIncome,
      (SELECT IFNULL(SUM(amount), 0) FROM transactions WHERE type = 'expense') AS totalExpense,
      (
        (SELECT IFNULL(SUM(amount), 0) FROM transactions WHERE type = 'income') - 
        (SELECT IFNULL(SUM(amount), 0) FROM transactions WHERE type = 'expense')
      ) AS balance
    `;
    db.get(query, [], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(row);
    });
  });

  // Get transaction by ID
  router.get('/:id', (req, res) => {
    const id = req.params.id;
    db.get(`SELECT * FROM transactions WHERE id = ?`, [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      res.json(row);
    });
  });

  // Update transaction by ID
  router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { type, category, amount, date, description } = req.body;

    const query = `
      UPDATE transactions
      SET type = ?, category = ?, amount = ?, date = ?, description = ?
      WHERE id = ?
    `;
    db.run(query, [type, category, amount, date, description, id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      res.json({ message: 'Transaction updated' });
    });
  });

  // Delete transaction by ID
  router.delete('/:id', (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM transactions WHERE id = ?`, [id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      res.json({ message: 'Transaction deleted' });
    });
  });



  return router;
};
