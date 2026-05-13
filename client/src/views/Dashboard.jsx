import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [stats, setStats] = useState({ orders: 0, runners: 0, stands: 0, revenue: 0 });

  useEffect(() => {
    axios.get('/api/reports/summary')
      .then(res => setStats(res.data))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
        <StatCard label="Total Orders" value={stats.orders} />
        <StatCard label="Active Runners" value={stats.runners} />
        <StatCard label="Stands" value={stats.stands} />
        <StatCard label="Revenue" value={`$${Number(stats.revenue || 0).toFixed(2)}`} />
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{ background: '#f0f0f0', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{value}</div>
      <div style={{ marginTop: '0.5rem', color: '#555' }}>{label}</div>
    </div>
  );
}
