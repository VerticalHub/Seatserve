import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [ordersByVenue, setOrdersByVenue] = useState([]);
  const [topRunners, setTopRunners] = useState([]);

  useEffect(() => {
    axios.get('/api/reports/summary').then(r => setSummary(r.data)).catch(() => {});
    axios.get('/api/reports/orders-by-venue').then(r => setOrdersByVenue(r.data)).catch(() => {});
    axios.get('/api/reports/top-runners').then(r => setTopRunners(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1>Reports</h1>

      {summary && (
        <section style={{ marginBottom: '2rem' }}>
          <h2>Summary</h2>
          <ul>
            <li>Total Orders: <strong>{summary.orders}</strong></li>
            <li>Active Runners: <strong>{summary.runners}</strong></li>
            <li>Stands: <strong>{summary.stands}</strong></li>
            <li>Total Revenue: <strong>${Number(summary.revenue || 0).toFixed(2)}</strong></li>
          </ul>
        </section>
      )}

      <section style={{ marginBottom: '2rem' }}>
        <h2>Orders by Venue</h2>
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
          <thead><tr><th>Venue</th><th>Orders</th><th>Revenue</th></tr></thead>
          <tbody>
            {ordersByVenue.map((row, i) => (
              <tr key={i}><td>{row.venue_name || row.venue_id}</td><td>{row.count}</td><td>${Number(row.revenue || 0).toFixed(2)}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Top Runners</h2>
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
          <thead><tr><th>Runner</th><th>Orders Delivered</th></tr></thead>
          <tbody>
            {topRunners.map((row, i) => (
              <tr key={i}><td>{row.runner_name || row.runner_id}</td><td>{row.count}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
