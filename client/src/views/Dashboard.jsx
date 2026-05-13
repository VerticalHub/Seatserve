import { useEffect, useState } from 'react';
import axios from 'axios';

const styles = {
  page: { padding: '2rem', background: '#f8fafc', minHeight: '100vh' },
  header: { marginBottom: '2rem' },
  title: { fontSize: '1.8rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  subtitle: { color: '#64748b', marginTop: '0.25rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' },
  card: { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' },
  cardIcon: { fontSize: '2rem', marginBottom: '0.75rem' },
  cardLabel: { fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
  cardValue: { fontSize: '2rem', fontWeight: 700, color: '#1e293b', margin: '0.25rem 0' },
  cardSub: { fontSize: '0.8rem', color: '#94a3b8' },
  section: { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', marginBottom: '1.5rem' },
  sectionTitle: { fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' },
  badge: (color) => ({ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600, background: color === 'green' ? '#dcfce7' : color === 'yellow' ? '#fef9c3' : color === 'blue' ? '#dbeafe' : '#f1f5f9', color: color === 'green' ? '#166534' : color === 'yellow' ? '#854d0e' : color === 'blue' ? '#1e40af' : '#475569' }),
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f8fafc', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' },
  td: { padding: '0.875rem 1rem', borderBottom: '1px solid #f1f5f9', color: '#334155' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#94a3b8' },
};

const STATUS_COLORS = { delivered: 'green', pending: 'yellow', in_progress: 'blue', cancelled: 'red' };

export default function Dashboard() {
  const [stats, setStats] = useState({ orders: 0, runners: 0, stands: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/reports/summary').catch(() => ({ data: {} })),
      axios.get('/api/orders?limit=5').catch(() => ({ data: [] }))
    ]).then(([sumRes, ordersRes]) => {
      setStats(sumRes.data || {});
      setRecentOrders(Array.isArray(ordersRes.data) ? ordersRes.data.slice(0, 5) : []);
      setLoading(false);
    });
  }, []);

  const cards = [
    { label: 'Total Orders', value: stats.orders || 0, icon: '🧾', sub: 'All time', color: '#3b82f6' },
    { label: 'Active Runners', value: stats.runners || 0, icon: '🏃', sub: 'Online now', color: '#10b981' },
    { label: 'Stands', value: stats.stands || 0, icon: '🏟️', sub: 'Configured', color: '#f59e0b' },
    { label: 'Revenue', value: `$${Number(stats.revenue || 0).toFixed(2)}`, icon: '💰', sub: 'Total earned', color: '#8b5cf6' },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard</h1>
        <p style={styles.subtitle}>Welcome to SeatServe — your stadium delivery command center</p>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading...</div>
      ) : (
        <>
          <div style={styles.grid}>
            {cards.map(c => (
              <div key={c.label} style={{...styles.card, borderTop: `3px solid ${c.color}`}}>
                <div style={styles.cardIcon}>{c.icon}</div>
                <div style={styles.cardLabel}>{c.label}</div>
                <div style={{...styles.cardValue, color: c.color}}>{c.value}</div>
                <div style={styles.cardSub}>{c.sub}</div>
              </div>
            ))}
          </div>

          <div style={styles.section}>
            <div style={styles.sectionTitle}>Recent Orders</div>
            {recentOrders.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>No orders yet. Orders will appear here once placed.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Order ID</th>
                    <th style={styles.th}>Section</th>
                    <th style={styles.th}>Total</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(o => (
                    <tr key={o.id}>
                      <td style={styles.td}><code style={{background:'#f1f5f9',padding:'2px 6px',borderRadius:'4px',fontSize:'0.75rem'}}>{o.id?.slice(0,8)}...</code></td>
                      <td style={styles.td}>Sec {o.section}</td>
                      <td style={styles.td}>${Number(o.total || 0).toFixed(2)}</td>
                      <td style={styles.td}><span style={styles.badge(STATUS_COLORS[o.status] || 'gray')}>{o.status || 'unknown'}</span></td>
                      <td style={styles.td}>{o.created_at ? new Date(o.created_at).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
