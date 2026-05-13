const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const { venue_id, status, runner_id } = req.query;
    let query = 'SELECT * FROM orders';
    const params = [];
    const conditions = [];

    if (venue_id) { params.push(venue_id); conditions.push(`venue_id = $${params.length}`); }
    if (status) { params.push(status); conditions.push(`status = $${params.length}`); }
    if (runner_id) { params.push(runner_id); conditions.push(`runner_id = $${params.length}`); }

    if (conditions.length) { query += ' WHERE ' + conditions.join(' AND '); }
    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { venue_id, stand_id, runner_id, section, row, items, subtotal, total } = req.body;
    const result = await db.query(
      'INSERT INTO orders (venue_id, stand_id, runner_id, section, row, items, subtotal, total, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [venue_id, stand_id, runner_id, section, row, JSON.stringify(items || []), subtotal || 0, total || 0, 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { status, runner_id } = req.body;
    const updates = [];
    const params = [req.params.id];

    if (status) { params.push(status); updates.push(`status = $${params.length}`); }
    if (runner_id) { params.push(runner_id); updates.push(`runner_id = $${params.length}`); }

    if (!updates.length) return res.status(400).json({ error: 'No fields to update' });

    const result = await db.query(
      `UPDATE orders SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      params
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
