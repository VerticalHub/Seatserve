const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/summary', async (req, res) => {
  try {
    const orders = await db.query("SELECT COUNT(*) FROM orders");
    const runners = await db.query("SELECT COUNT(*) FROM users WHERE role = 'runner' AND is_online = true");
    const stands = await db.query("SELECT COUNT(*) FROM stands");
    const revenue = await db.query("SELECT SUM(total) FROM orders WHERE status = 'delivered'");
    res.json({
      orders: parseInt(orders.rows[0].count),
      runners: parseInt(runners.rows[0].count),
      stands: parseInt(stands.rows[0].count),
      revenue: parseFloat(revenue.rows[0].sum || 0)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders-by-venue', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT v.stadium, v.id as venue_id, COUNT(o.id) as orders, SUM(o.total) as revenue
      FROM venues v
      LEFT JOIN orders o ON v.id = o.venue_id
      GROUP BY v.id, v.stadium
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/top-runners', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.name, u.email, COUNT(o.id) as deliveries
      FROM users u
      JOIN orders o ON u.id = o.runner_id
      WHERE o.status = 'delivered'
      GROUP BY u.id, u.name, u.email
      ORDER BY deliveries DESC
      LIMIT 5
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
