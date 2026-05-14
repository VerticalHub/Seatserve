require('dotenv').config({ path: '/workspaces/Seatserve/server/.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
async function seed() {
  try {
    await pool.query(`INSERT INTO venues (id, league, team, stadium, city, capacity, status) VALUES ('CHI001', 'MLB', 'Chicago Cubs', 'Wrigley Field', 'Chicago', 41649, 'active') ON CONFLICT (id) DO NOTHING`);
    await pool.query(`INSERT INTO venues (id, league, team, stadium, city, capacity, status) VALUES ('LA001', 'NFL', 'LA Rams', 'SoFi Stadium', 'Los Angeles', 70240, 'active') ON CONFLICT (id) DO NOTHING`);
    const standRes = await pool.query(`INSERT INTO stands (venue_id, name, gate, level, sections) VALUES ('CHI001', 'Hot Dog Haven', 'Gate A', 'Main Level', 'Sections 100-110') RETURNING id`);
    const standId = standRes.rows[0].id;
    await pool.query(`INSERT INTO menu_items (stand_id, name, price, category, emoji) VALUES ($1, 'Chicago Dog', 6.50, 'food', '🌭') ON CONFLICT DO NOTHING`, [standId]);
    await pool.query(`INSERT INTO menu_items (stand_id, name, price, category, emoji) VALUES ($1, 'Craft Beer', 9.00, 'drinks', '🍺') ON CONFLICT DO NOTHING`, [standId]);
    const fan = await pool.query(`INSERT INTO users (email, password_hash, name, role, current_venue_id) VALUES ('fan@seatserve.com', 'x', 'Alex Fan', 'fan', 'CHI001') ON CONFLICT (email) DO NOTHING RETURNING id`);
    const runner = await pool.query(`INSERT INTO users (email, password_hash, name, role, current_venue_id, is_online) VALUES ('runner@seatserve.com', 'x', 'Sam Runner', 'runner', 'CHI001', true) ON CONFLICT (email) DO NOTHING RETURNING id`);
    console.log('Seed complete!');
  } catch(e) { console.error(e.message); }
  await pool.end();
}
seed();
