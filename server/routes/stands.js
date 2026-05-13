const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const { venue_id } = req.query;
    let query = 'SELECT * FROM stands';
    const params = [];
    if (venue_id) { params.push(venue_id); query += ' WHERE venue_id = $1'; }
    query += ' ORDER BY name';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
