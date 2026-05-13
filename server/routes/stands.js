const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const { venue_id } = req.query;
    let query = 'SELECT * FROM stands';
    const params = [];
    if (venue_id) {
      params.push(venue_id);
      query += ` WHERE venue_id = $${params.length}`;
    }
    query += ' ORDER BY gate, name';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stands' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { venue_id, name, gate, level, sections } = req.body;
    const result = await db.query(
      'INSERT INTO stands (venue_id, name, gate, level, sections) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [venue_id, name, gate, level, sections]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create stand' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { name, gate, level, sections, is_open } = req.body;
    const result = await db.query(
      `UPDATE stands SET name = COALESCE($1, name), gate = COALESCE($2, gate),
       level = COALESCE($3, level), sections = COALESCE($4, sections),
       is_open = COALESCE($5, is_open), updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [name, gate, level, sections, is_open, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Stand not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update stand' });
  }
});

router.post('/:id/menu', async (req, res) => {
  try {
    const { name, price, category, emoji } = req.body;
    const result = await db.query(
      'INSERT INTO menu_items (stand_id, name, price, category, emoji) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.params.id, name, price, category, emoji]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add menu item' });
  }
});

module.exports = router;
