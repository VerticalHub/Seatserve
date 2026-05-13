import { useEffect, useState } from 'react';
import axios from 'axios';

const S = {
  page: { padding: '2rem', background: '#f8fafc', minHeight: '100vh' },
  header: { marginBottom: '2rem' },
  title: { fontSize: '1.8rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  card: { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', marginBottom: '1.5rem' },
  cardTitle: { fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f8fafc', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' },
  td: { padding: '0.875rem 1rem', borderBottom: '1px solid #f1f5f9', color: '#334155' },
  barBg: { height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginTop: '0.5rem' },
  barFill: (p) => ({ height: '100%', background: '#3b82f6', width: `${Math.min(p, 100)}%`, transition: 'width 0.3s ease' }),
};

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [ordersByVenue, setOrdersByVenue] = useState([]);
  const [topRunners, setTopRunners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/reports/summary'),
      axios.get('/api/reports/orders-by-venue'),
      axios.get('/api/reports/top-runners')
    ]).then(([s, v, r]) => {
      setSummary(s.data);
      setOrdersByVenue(v.data || []);
      setTopRunners(r.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={S.page}>Loading insights...</div>;

  const maxRevenue = Math.max(...ordersByVenue.map(v => Number(v.revenue)), 1);

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.title}>Operational Insights</h1>
        <p style={{ color: '#64748b' }}>Data-driven overview of stadium performance</p>
      </div>

      <div style={S.grid}>
        <div style={S.card}>
          <div style={S.cardTitle}>Orders by Venue</div>
          <table style={S.table}>
            <thead><tr><th style={S.th}>Venue</th><th style={S.th}>Volume</th><th style={S.th}>Revenue</th></tr></thead>
            <tbody>
              {ordersByVenue.map((v, i) => (
                <tr key={i}>
                  <td style={S.td}>
                    <div style={{fontWeight:600}}>{v.stadium || v.venue_id}</div>
                    <div style={S.barBg}><div style={S.barFill((Number(v.revenue)/maxRevenue)*100)}></div></div>
                  </td>
                  <td style={S.td}>{v.orders}</td>
                  <td style={S.td}>${Number(v.revenue).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={S.card}>
          <div style={S.cardTitle}>Top Performing Runners</div>
          <table style={S.table}>
            <thead><tr><th style={S.th}>Runner</th><th style={S.th}>Deliveries</th><th style={S.th}>Rank</th></tr></thead>
            <tbody>
              {topRunners.map((r, i) => (
                <tr key={i}>
                  <td style={S.td}>
                    <div style={{fontWeight:600}}>{r.name}</div>
                    <div style={{fontSize:'0.7rem',color:'#64748b'}}>{r.phone}</div>
                  </td>
                  <td style={S.td}>{r.deliveries}</td>
                  <td style={S.td}>
                    <span style={{ fontSize:'1.2rem' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
