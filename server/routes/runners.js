const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const { venue_id } = req.query;
    let query = `SELECT id, name, email, role, current_venue_id, current_section, is_online FROM users WHERE role = 'runner'`;
    const params = [];
    if (venue_id) {
      params.push(venue_id);
      query += ` AND current_venue_id = $${params.length}`;
    }
    query += ' ORDER BY name';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch runners' });
  }
});

router.patch('/:id/location', async (req, res) => {
  try {
    const { current_venue_id, current_section, is_online } = req.body;
    const result = await db.query(
      `UPDATE users SET current_venue_id = $1, current_section = $2, is_online = $3 WHERE id = $4 AND role = 'runner' RETURNING id, name, current_venue_id, current_section, is_online`,
      [current_venue_id, current_section, is_online, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Runner not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update runner location' });
  }
});

router.get('/:id/earnings', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT e.*, o.section, o.created_at AS order_date
       FROM earnings e
       LEFT JOIN orders o ON e.order_id = o.id
       WHERE e.runner_id = $1
       ORDER BY e.created_at DESC`,
      [req.params.id]
    );
    const total = result.rows.reduce((sum, r) => sum + Number(r.total || 0), 0);
    res.json({ earnings: result.rows, total_earned: total.toFixed(2) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
});

module.exports = router;
