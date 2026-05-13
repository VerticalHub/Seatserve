import { useEffect, useState } from 'react';
import axios from 'axios';

const S = {
  page: { padding: '2rem', background: '#f8fafc', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { fontSize: '1.8rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  btn: (color='#3b82f6') => ({ background: color, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.25rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }),
  card: { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', marginBottom: '1.5rem' },
  cardTitle: { fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f8fafc', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' },
  td: { padding: '0.875rem 1rem', borderBottom: '1px solid #f1f5f9', color: '#334155' },
  badge: (c) => ({ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600, background: c==='green'?'#dcfce7':c==='yellow'?'#fef9c3':c==='blue'?'#dbeafe':c==='red'?'#fee2e2':'#f1f5f9', color: c==='green'?'#166534':c==='yellow'?'#854d0e':c==='blue'?'#1e40af':c==='red'?'#991b1b':'#475569' }),
  empty: { textAlign: 'center', padding: '3rem', color: '#94a3b8' },
  select: { padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem', outline: 'none' },
};

const COLORS = { delivered: 'green', pending: 'yellow', in_progress: 'blue', cancelled: 'red' };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => axios.get('/api/orders').then(r => { setOrders(r.data || []); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const updateStatus = (id, status) => {
    axios.patch(`/api/orders/${id}`, { status }).then(load);
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Orders</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>Manage stadium-wide delivery requests</p>
        </div>
        <button style={S.btn()} onClick={load}>Refresh</button>
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}>Live Order Feed</div>
        {loading ? (
          <div style={S.empty}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={S.empty}>No orders found. Orders will appear here in real-time.</div>
        ) : (
          <table style={S.table}>
            <thead><tr>
              <th style={S.th}>ID</th>
              <th style={S.th}>Location</th>
              <th style={S.th}>Items</th>
              <th style={S.th}>Total</th>
              <th style={S.th}>Status</th>
              <th style={S.th}>Update</th>
            </tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td style={S.td}><code style={{background:'#f1f5f9',padding:'2px 4px',borderRadius:'4px'}}>{o.id.slice(0,8)}</code></td>
                  <td style={S.td}>
                    <div style={{fontWeight:600}}>Section {o.section}</div>
                    <div style={{fontSize:'0.75rem',color:'#64748b'}}>Row {o.row || '-'}</div>
                  </td>
                  <td style={S.td}>
                    {Array.isArray(o.items) ? o.items.map((i,idx) => (
                      <div key={idx} style={{fontSize:'0.75rem'}}>{i.qty}x {i.name}</div>
                    )) : 'Custom Order'}
                  </td>
                  <td style={S.td}><span style={{fontWeight:600}}>${Number(o.total||0).toFixed(2)}</span></td>
                  <td style={S.td}><span style={S.badge(COLORS[o.status])}>{o.status}</span></td>
                  <td style={S.td}>
                    <select 
                      style={S.select} 
                      value={o.status} 
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
