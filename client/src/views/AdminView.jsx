import { useEffect, useState } from 'react';
import axios from 'axios';

const NAV = { background: '#1a1a2e', color: '#fff', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' };
const CARD = { background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' };
const BTN = { background: '#f5a623', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 1.2rem', cursor: 'pointer', fontWeight: 'bold' };
const BTN_SM = { ...BTN, padding: '0.35rem 0.8rem', fontSize: '0.85rem' };
const INPUT = { padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', marginRight: '0.5rem', marginBottom: '0.5rem' };
const STAT = { background: '#1a1a2e', color: '#fff', borderRadius: '10px', padding: '1.25rem', textAlign: 'center', flex: 1 };

export default function AdminView() {
  const [tab, setTab] = useState('overview');
  const [summary, setSummary] = useState({ orders: 0, runners: 0, stands: 0, revenue: 0 });
  const [orders, setOrders] = useState([]);
  const [runners, setRunners] = useState([]);
  const [venues, setVenues] = useState([]);
  const [stands, setStands] = useState([]);
  const [venueFilter, setVenueFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [topRunners, setTopRunners] = useState([]);
  const [venueStats, setVenueStats] = useState([]);
  const [newStand, setNewStand] = useState({ venue_id: '', name: '', gate: '', level: '', sections: '' });

  const load = () => {
    axios.get('/api/reports/summary').then(r => setSummary(r.data)).catch(() => {});
    axios.get('/api/runners').then(r => setRunners(r.data)).catch(() => {});
    axios.get('/api/venues').then(r => setVenues(r.data)).catch(() => {});
    axios.get('/api/reports/top-runners').then(r => setTopRunners(r.data)).catch(() => {});
    axios.get('/api/reports/orders-by-venue').then(r => setVenueStats(r.data)).catch(() => {});
  };

  const loadOrders = () => {
    const params = {};
    if (venueFilter) params.venue_id = venueFilter;
    if (statusFilter) params.status = statusFilter;
    axios.get('/api/orders', { params }).then(r => setOrders(r.data)).catch(() => {});
  };

  const loadStands = () => {
    const params = venueFilter ? { venue_id: venueFilter } : {};
    axios.get('/api/stands', { params }).then(r => setStands(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (tab === 'orders') loadOrders(); }, [tab, venueFilter, statusFilter]);
  useEffect(() => { if (tab === 'stands') loadStands(); }, [tab, venueFilter]);

  const updateOrderStatus = async (id, status) => {
    await axios.patch(`/api/orders/${id}`, { status });
    loadOrders();
  };

  const addStand = async (e) => {
    e.preventDefault();
    await axios.post('/api/stands', newStand);
    setNewStand({ venue_id: '', name: '', gate: '', level: '', sections: '' });
    loadStands();
  };

  const STATUS_BADGE = {
    pending: '#f39c12', accepted: '#2980b9', picked_up: '#8e44ad', delivered: '#27ae60', cancelled: '#e74c3c',
  };

  const TABS = ['overview', 'orders', 'runners', 'stands'];

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7' }}>
      <nav style={NAV}>
        <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>SeatServe Admin</span>
        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '2rem' }}>
          {TABS.map(t => (
            <button key={t} style={{ ...BTN_SM, background: tab === t ? '#f5a623' : 'rgba(255,255,255,0.15)' }}
              onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <button style={{ ...BTN_SM, background: '#555', marginLeft: 'auto' }} onClick={load}>Refresh</button>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem' }}>

        {tab === 'overview' && (
          <>
            <h2>Overview</h2>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div style={STAT}><div style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>{summary.orders}</div><div style={{ marginTop: '0.4rem', opacity: 0.8 }}>Total Orders</div></div>
              <div style={STAT}><div style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>{summary.runners}</div><div style={{ marginTop: '0.4rem', opacity: 0.8 }}>Online Runners</div></div>
              <div style={STAT}><div style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>{summary.stands}</div><div style={{ marginTop: '0.4rem', opacity: 0.8 }}>Stands</div></div>
              <div style={{ ...STAT, background: '#27ae60' }}><div style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>${Number(summary.revenue || 0).toFixed(2)}</div><div style={{ marginTop: '0.4rem', opacity: 0.8 }}>Revenue</div></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ ...CARD, padding: '1.25rem' }}>
                <h3 style={{ margin: '0 0 1rem' }}>Top Runners</h3>
                {topRunners.length === 0 && <p style={{ color: '#888', margin: 0 }}>No data yet.</p>}
                {topRunners.map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #eee' }}>
                    <span>{r.name}</span>
                    <span style={{ color: '#555' }}>{r.deliveries} deliveries</span>
                  </div>
                ))}
              </div>
              <div style={{ ...CARD, padding: '1.25rem' }}>
                <h3 style={{ margin: '0 0 1rem' }}>Orders by Venue</h3>
                {venueStats.length === 0 && <p style={{ color: '#888', margin: 0 }}>No data yet.</p>}
                {venueStats.map((v, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #eee' }}>
                    <span>{v.stadium}</span>
                    <span style={{ color: '#555' }}>{v.orders} orders · ${Number(v.revenue || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === 'orders' && (
          <>
            <h2>Orders</h2>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <select value={venueFilter} onChange={e => setVenueFilter(e.target.value)} style={INPUT}>
                <option value="">All Venues</option>
                {venues.map(v => <option key={v.id} value={v.id}>{v.stadium}</option>)}
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={INPUT}>
                <option value="">All Statuses</option>
                {['pending', 'accepted', 'picked_up', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {orders.length === 0 && <p style={{ color: '#888' }}>No orders found.</p>}
            {orders.map(o => (
              <div key={o.id} style={CARD}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong>Section {o.section}{o.row ? `, Row ${o.row}` : ''}</strong>
                    <div style={{ color: '#555', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      ${parseFloat(o.total || 0).toFixed(2)} · {new Date(o.created_at).toLocaleString()}
                    </div>
                    <span style={{ display: 'inline-block', marginTop: '0.35rem', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', background: STATUS_BADGE[o.status] || '#aaa', color: '#fff' }}>
                      {o.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {o.status !== 'delivered' && o.status !== 'cancelled' && (
                      <button style={{ ...BTN_SM, background: '#27ae60' }} onClick={() => updateOrderStatus(o.id, 'delivered')}>Mark Delivered</button>
                    )}
                    {o.status !== 'cancelled' && (
                      <button style={{ ...BTN_SM, background: '#e74c3c' }} onClick={() => updateOrderStatus(o.id, 'cancelled')}>Cancel</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === 'runners' && (
          <>
            <h2>Runners</h2>
            {runners.length === 0 && <p style={{ color: '#888' }}>No runners registered.</p>}
            {runners.map(r => (
              <div key={r.id} style={CARD}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{r.name}</strong>
                    <span style={{ display: 'inline-block', marginLeft: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.8rem', background: r.is_online ? '#27ae60' : '#ccc', color: r.is_online ? '#fff' : '#555' }}>
                      {r.is_online ? 'Online' : 'Offline'}
                    </span>
                    <div style={{ color: '#555', fontSize: '0.85rem', marginTop: '0.25rem' }}>{r.email}</div>
                    {r.current_section && <div style={{ color: '#888', fontSize: '0.8rem' }}>Section {r.current_section}</div>}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === 'stands' && (
          <>
            <h2>Stands</h2>
            <form onSubmit={addStand} style={{ ...CARD, display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
              <strong style={{ width: '100%', marginBottom: '0.25rem' }}>Add New Stand</strong>
              <select required value={newStand.venue_id} onChange={e => setNewStand({ ...newStand, venue_id: e.target.value })} style={INPUT}>
                <option value="">Select Venue</option>
                {venues.map(v => <option key={v.id} value={v.id}>{v.stadium}</option>)}
              </select>
              {[['name', 'Stand Name'], ['gate', 'Gate'], ['level', 'Level'], ['sections', 'Sections']].map(([k, p]) => (
                <input key={k} placeholder={p} required={k === 'name'} value={newStand[k]}
                  onChange={e => setNewStand({ ...newStand, [k]: e.target.value })} style={INPUT} />
              ))}
              <button type="submit" style={BTN}>Add Stand</button>
            </form>

            <select value={venueFilter} onChange={e => setVenueFilter(e.target.value)} style={{ ...INPUT, marginBottom: '1rem' }}>
              <option value="">All Venues</option>
              {venues.map(v => <option key={v.id} value={v.id}>{v.stadium}</option>)}
            </select>

            {stands.length === 0 && <p style={{ color: '#888' }}>No stands found.</p>}
            {stands.map(s => (
              <div key={s.id} style={CARD}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong>{s.name}</strong>
                    <span style={{ marginLeft: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.8rem', background: s.is_open ? '#27ae60' : '#e74c3c', color: '#fff' }}>
                      {s.is_open ? 'Open' : 'Closed'}
                    </span>
                    <div style={{ color: '#555', fontSize: '0.85rem', marginTop: '0.25rem' }}>Gate {s.gate} · Level {s.level} · Sections: {s.sections}</div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

      </div>
    </div>
  );
}
