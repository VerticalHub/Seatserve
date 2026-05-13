const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const { venue_id, status, runner_id, fan_id } = req.query;
    let query = `
      SELECT o.*, u1.name AS fan_name, u2.name AS runner_name, v.stadium AS venue_name
      FROM orders o
      LEFT JOIN users u1 ON o.fan_id = u1.id
      LEFT JOIN users u2 ON o.runner_id = u2.id
      LEFT JOIN venues v ON o.venue_id = v.id
    `;

    const params = [];
    const conditions = [];

    if (venue_id) {
      params.push(venue_id);
      conditions.push(`o.venue_id = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`o.status = $${params.length}`);
    }
    if (runner_id) {
      params.push(runner_id);
      conditions.push(`o.runner_id = $${params.length}`);
    }
    if (fan_id) {
      params.push(fan_id);
      conditions.push(`o.fan_id = $${params.length}`);
    }
    if (conditions.length) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    query += ' ORDER BY o.created_at DESC';

    const result = await db.query(query, params);
    for (const order of result.rows) {
      const items = await db.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
      order.items = items.rows;
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.post('/', async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const { fan_id, venue_id, stand_id, section, row, seat, items = [], tip = 0, delivery_fee = 2, subtotal, total } = req.body;
    const orderResult = await client.query(
      `INSERT INTO orders (fan_id, venue_id, stand_id, section, row, seat, tip, delivery_fee, subtotal, total, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending') RETURNING *`,
      [fan_id, venue_id, stand_id, section, row, seat, tip, delivery_fee, subtotal, total]
    );
    const order = orderResult.rows[0];
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, price, name) VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.menu_item_id, item.quantity, item.price, item.name]
      );
    }
    await client.query('COMMIT');
    res.status(201).json(order);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    client.release();
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status, runner_id } = req.body;
    const validStatuses = ['pending', 'accepted', 'pickedup', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const result = await db.query(
      `UPDATE orders SET status = $1, runner_id = COALESCE($2, runner_id), updated_at = NOW() WHERE id = $3 RETURNING *`,
      [status, runner_id, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Order not found' });
    if (status === 'delivered') {
      const order = result.rows[0];
      await db.query(
        `INSERT INTO earnings (runner_id, order_id, tip, base_pay, total) VALUES ($1, $2, $3, $4, $5)`,
        [order.runner_id, order.id, order.tip, 3.0, Number(order.tip || 0) + 3.0]
      );
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
