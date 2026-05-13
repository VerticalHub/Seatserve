const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const { venue_id, type } = req.query;
    let query = `
      SELECT r.*, v.stadium AS venue_name, u.name AS reporter_name
      FROM reports r
      LEFT JOIN venues v ON r.venue_id = v.id
      LEFT JOIN users u ON r.user_id = u.id
    `;
    const params = [];
    const conditions = [];
    if (venue_id) {
      params.push(venue_id);
      conditions.push(`r.venue_id = $${params.length}`);
    }
    if (type) {
      params.push(type);
      conditions.push(`r.type = $${params.length}`);
    }
    if (conditions.length) query += ` WHERE ${conditions.join(' AND ')}`;
    query += ' ORDER BY r.created_at DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { venue_id, stand_id, user_id, type, label, section } = req.body;
    const result = await db.query(
      'INSERT INTO reports (venue_id, stand_id, user_id, type, label, section) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [venue_id, stand_id, user_id, type, label, section]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

router.get('/summary/:venue_id', async (req, res) => {
  try {
    const { venue_id } = req.params;
    const ordersResult = await db.query(
      'SELECT COUNT(*) AS total_orders, SUM(total) AS total_revenue FROM orders WHERE venue_id = $1',
      [venue_id]
    );
    const runnersResult = await db.query(
      `SELECT COUNT(*) AS active_runners FROM users WHERE role = 'runner' AND current_venue_id = $1 AND is_online = true`,
      [venue_id]
    );
    const topItems = await db.query(
      `SELECT oi.name, SUM(oi.quantity) AS total_sold
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.venue_id = $1
       GROUP BY oi.name ORDER BY total_sold DESC LIMIT 5`,
      [venue_id]
    );
    res.json({
      orders: ordersResult.rows[0],
      runners: runnersResult.rows[0],
      top_items: topItems.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

module.exports = router;
