const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query("SELECT id, name, email, current_venue_id, current_section, is_online FROM users WHERE role = 'runner' ORDER BY name");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, current_venue_id, current_section } = req.body;
    const result = await db.query(
      "INSERT INTO users (name, email, role, current_venue_id, current_section, is_online, password_hash) VALUES ($1, $2, 'runner', $3, $4, true, 'x') RETURNING id, name, email",
      [name, email, current_venue_id, current_section]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { is_online, current_venue_id, current_section } = req.body;
    const updates = [];
    const params = [req.params.id];

    if (is_online !== undefined) { params.push(is_online); updates.push(`is_online = $${params.length}`); }
    if (current_venue_id) { params.push(current_venue_id); updates.push(`current_venue_id = $${params.length}`); }
    if (current_section) { params.push(current_section); updates.push(`current_section = $${params.length}`); }

    if (!updates.length) return res.status(400).json({ error: 'No fields to update' });

    const result = await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $1 AND role = 'runner' RETURNING *`,
      params
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
