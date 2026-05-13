const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const { league, status } = req.query;
    let query = 'SELECT * FROM venues';
    const params = [];
    const conditions = [];

    if (league) {
      params.push(league);
      conditions.push(`league = $${params.length}`);
    }

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    if (conditions.length) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY league, team';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch venues' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM venues WHERE id = $1', [req.params.id]);

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch venue' });
  }
});

router.get('/:id/stands', async (req, res) => {
  try {
    const stands = await db.query(
      'SELECT * FROM stands WHERE venue_id = $1 AND is_open = true ORDER BY gate, name',
      [req.params.id]
    );

    for (const stand of stands.rows) {
      const items = await db.query(
        'SELECT * FROM menu_items WHERE stand_id = $1 AND is_available = true ORDER BY category, name',
        [stand.id]
      );
      stand.menu_items = items.rows;
    }

    res.json(stands.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stands' });
  }
});

module.exports = router;
