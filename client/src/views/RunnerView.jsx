import { useEffect, useState } from 'react';
import axios from 'axios';

const NAV = { background: '#1a1a2e', color: '#fff', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' };
const CARD = { background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' };
const BTN = { background: '#f5a623', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 1.2rem', cursor: 'pointer', fontWeight: 'bold' };
const BTN_SM = { ...BTN, padding: '0.35rem 0.8rem', fontSize: '0.85rem' };
const BTN_GREEN = { ...BTN, background: '#27ae60' };

const STATUS_COLORS = {
  pending: '#f39c12',
  accepted: '#2980b9',
  picked_up: '#8e44ad',
  delivered: '#27ae60',
};

export default function RunnerView() {
  const [runner, setRunner] = useState(null);
  const [runners, setRunners] = useState([]);
  const [orders, setOrders] = useState([]);
  const [venues, setVenues] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', current_venue_id: '', current_section: '' });
  const [tab, setTab] = useState('queue');

  const loadOrders = (runnerId) => {
    const params = runnerId ? { runner_id: runnerId } : { status: 'pending' };
    axios.get('/api/orders', { params }).then(r => setOrders(r.data)).catch(() => {});
  };

  useEffect(() => {
    axios.get('/api/venues').then(r => setVenues(r.data)).catch(() => {});
    axios.get('/api/runners').then(r => setRunners(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (runner) {
      loadOrders(runner.id);
      const interval = setInterval(() => loadOrders(runner.id), 10000);
      return () => clearInterval(interval);
    } else {
      loadOrders(null);
    }
  }, [runner]);

  const register = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/runners', form);
      setRunner(res.data);
    } catch {
      alert('Could not register. Try again.');
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await axios.patch(`/api/orders/${orderId}`, { status, runner_id: runner?.id });
      loadOrders(runner?.id);
    } catch {
      alert('Failed to update order.');
    }
  };

  const toggleOnline = async () => {
    try {
      const res = await axios.patch(`/api/runners/${runner.id}`, { is_online: !runner.is_online });
      setRunner(res.data);
    } catch {}
  };

  const myOrders = orders.filter(o => o.runner_id === runner?.id);
  const pendingOrders = orders.filter(o => !o.runner_id && o.status === 'pending');
  const activeOrders = myOrders.filter(o => o.status !== 'delivered');
  const completedOrders = myOrders.filter(o => o.status === 'delivered');

  if (!runner) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff' }}>
        <nav style={NAV}>
          <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>SeatServe Runner</span>
        </nav>
        <div style={{ maxWidth: '420px', margin: '3rem auto', padding: '1.5rem', background: '#f9f9f9', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <h2 style={{ marginTop: 0 }}>Sign In as Runner</h2>
          <p style={{ color: '#666' }}>Select an existing runner or register as new.</p>
          {runners.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <strong>Existing Runners</strong>
              {runners.map(r => (
                <div key={r.id} style={{ ...CARD, cursor: 'pointer', marginTop: '0.5rem' }} onClick={() => setRunner(r)}>
                  <span style={{ fontWeight: 'bold' }}>{r.name}</span>
                  <span style={{ color: '#888', fontSize: '0.85rem', marginLeft: '0.5rem' }}>{r.email}</span>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={register}>
            <div style={{ borderTop: '1px solid #ddd', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <strong>Register New Runner</strong>
            </div>
            {[['Name', 'name', 'text'], ['Email', 'email', 'email'], ['Section', 'current_section', 'text']].map(([label, key, type]) => (
              <input key={key} type={type} placeholder={label} required={key !== 'current_section'}
                value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                style={{ display: 'block', width: '100%', padding: '0.5rem', margin: '0.5rem 0', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            ))}
            <select value={form.current_venue_id} onChange={e => setForm({ ...form, current_venue_id: e.target.value })}
              style={{ display: 'block', width: '100%', padding: '0.5rem', margin: '0.5rem 0', borderRadius: '6px', border: '1px solid #ccc' }}>
              <option value="">Select Venue</option>
              {venues.map(v => <option key={v.id} value={v.id}>{v.stadium}</option>)}
            </select>
            <button type="submit" style={{ ...BTN, width: '100%', marginTop: '0.75rem' }}>Register and Start</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <nav style={NAV}>
        <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>SeatServe Runner</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.9rem' }}>Hi, {runner.name}</span>
        <button style={{ ...BTN_SM, background: runner.is_online ? '#27ae60' : '#e74c3c' }} onClick={toggleOnline}>
          {runner.is_online ? 'Online' : 'Offline'}
        </button>
        <button style={{ ...BTN_SM, background: '#555' }} onClick={() => setRunner(null)}>Switch</button>
      </nav>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {['queue', 'active', 'done'].map(t => (
            <button key={t} style={{ ...BTN_SM, background: tab === t ? '#1a1a2e' : '#ddd', color: tab === t ? '#fff' : '#333' }}
              onClick={() => setTab(t)}>
              {t === 'queue' ? `Queue (${pendingOrders.length})` : t === 'active' ? `Active (${activeOrders.length})` : `Done (${completedOrders.length})`}
            </button>
          ))}
        </div>
        {tab === 'queue' && (
          <>
            <h3>Available Orders</h3>
            {pendingOrders.length === 0 && <p style={{ color: '#888' }}>No pending orders right now.</p>}
            {pendingOrders.map(o => (
              <div key={o.id} style={CARD}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong>Section {o.section}{o.row ? `, Row ${o.row}` : ''}</strong>
                    <div style={{ color: '#555', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      Total: ${parseFloat(o.total || 0).toFixed(2)}
                    </div>
                    <div style={{ color: '#888', fontSize: '0.8rem' }}>{new Date(o.created_at).toLocaleTimeString()}</div>
                  </div>
                  <button style={BTN_GREEN} onClick={() => updateStatus(o.id, 'accepted')}>Accept</button>
                </div>
              </div>
            ))}
          </>
        )}
        {tab === 'active' && (
          <>
            <h3>My Active Orders</h3>
            {activeOrders.length === 0 && <p style={{ color: '#888' }}>No active orders.</p>}
            {activeOrders.map(o => (
              <div key={o.id} style={CARD}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong>Section {o.section}{o.row ? `, Row ${o.row}` : ''}</strong>
                    <div style={{ color: '#555', fontSize: '0.85rem', marginTop: '0.25rem' }}>Total: ${parseFloat(o.total || 0).toFixed(2)}</div>
                    <span style={{ display: 'inline-block', marginTop: '0.35rem', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', background: STATUS_COLORS[o.status] || '#aaa', color: '#fff' }}>
                      {o.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {o.status === 'accepted' && <button style={BTN_SM} onClick={() => updateStatus(o.id, 'picked_up')}>Picked Up</button>}
                    {o.status === 'picked_up' && <button style={{ ...BTN_SM, ...BTN_GREEN }} onClick={() => updateStatus(o.id, 'delivered')}>Delivered</button>}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
        {tab === 'done' && (
          <>
            <h3>Completed Orders</h3>
            {completedOrders.length === 0 && <p style={{ color: '#888' }}>No completed orders yet.</p>}
            {completedOrders.map(o => (
              <div key={o.id} style={{ ...CARD, opacity: 0.7 }}>
                <strong>Section {o.section}{o.row ? `, Row ${o.row}` : ''}</strong>
                <div style={{ color: '#555', fontSize: '0.85rem' }}>Total: ${parseFloat(o.total || 0).toFixed(2)} {new Date(o.created_at).toLocaleString()}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
