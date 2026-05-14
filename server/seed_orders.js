
require('dotenv').config({path:'../.env'});
const {Pool} = require('pg');
const p = new Pool({connectionString:process.env.DATABASE_URL, ssl:{rejectUnauthorized:false}});
async function run() {
  const ru = await p.query("SELECT id FROM users WHERE role='runner' LIMIT 1");
  const rid = ru.rows[0].id;
  const st = await p.query('SELECT id FROM stands LIMIT 1');
  const sid = st.rows[0].id;
  await p.query('INSERT INTO orders(id,runner_id,venue_id,stand_id,section,status,subtotal,total) VALUES(gen_random_uuid(),,,,,,,)',[rid,'venue-1',sid,'101','delivered',16,16]);
  await p.query('INSERT INTO orders(id,runner_id,venue_id,stand_id,section,status,subtotal,total) VALUES(gen_random_uuid(),,,,,,,)',[rid,'venue-1',sid,'C','pending',27,27]);
  await p.query('INSERT INTO orders(id,runner_id,venue_id,stand_id,section,status,subtotal,total) VALUES(gen_random_uuid(),,,,,,,)',[rid,'venue-1',sid,'101','in_progress',12,12]);
  console.log('orders done');
  p.end();
}
run().catch(e=>{console.error(e.message);p.end();});
