import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ venue_id: '', stand_id: '', runner_id: '', items: '', total: '' });

  const load = () => axios.get('/api/orders').then(r => setOrders(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const submit = e => {
    e.preventDefault();
    axios.post('/api/orders', form).then(() => { load(); setForm({ venue_id: '', stand_id: '', runner_id: '', items: '', total: '' }); });
  };

  return (
    <div>
      <h1>Orders</h1>
      <form onSubmit={submit} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <input placeholder="Venue ID" value={form.venue_id} onChange={e => setForm({...form, venue_id: e.target.value})} required />
        <input placeholder="Stand ID" value={form.stand_id} onChange={e => setForm({...form, stand_id: e.target.value})} required />
        <input placeholder="Runner ID" value={form.runner_id} onChange={e => setForm({...form, runner_id: e.target.value})} />
        <input placeholder="Items (JSON)" value={form.items} onChange={e => setForm({...form, items: e.target.value})} />
        <input placeholder="Total" type="number" step="0.01" value={form.total} onChange={e => setForm({...form, total: e.target.value})} />
        <button type="submit">Place Order</button>
      </form>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead><tr><th>ID</th><th>Venue</th><th>Stand</th><th>Runner</th><th>Status</th><th>Total</th><th>Created</th></tr></thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td>{o.id}</td><td>{o.venue_id}</td><td>{o.stand_id}</td>
              <td>{o.runner_id || '-'}</td><td>{o.status}</td>
              <td>${Number(o.total || 0).toFixed(2)}</td>
              <td>{new Date(o.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
