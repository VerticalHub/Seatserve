import { useEffect, useState } from 'react';
import axios from 'axios';

const S = {
  page: { padding: '2rem', background: '#f8fafc', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { fontSize: '1.8rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  btn: (color='#3b82f6') => ({ background: color, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.25rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }),
  card: { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', marginBottom: '1.5rem' },
  cardTitle: { fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' },
  input: { width: '100%', padding: '0.6rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' },
  label: { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f8fafc', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' },
  td: { padding: '0.875rem 1rem', borderBottom: '1px solid #f1f5f9', color: '#334155', verticalAlign: 'middle' },
  badge: (on) => ({ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600, background: on ? '#dcfce7' : '#f1f5f9', color: on ? '#166534' : '#64748b' }),
  dot: (on) => ({ width: '6px', height: '6px', borderRadius: '50%', background: on ? '#22c55e' : '#94a3b8' }),
  empty: { textAlign: 'center', padding: '3rem', color: '#94a3b8' },
  avatar: { width: '34px', height: '34px', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#1e40af', fontSize: '0.875rem' },
  row: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
};

export default function Runners() {
  const [runners, setRunners] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', current_venue_id: '', current_section: '' });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = () => axios.get('/api/runners').then(r => { setRunners(r.data || []); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = e => {
    e.preventDefault();
    axios.post('/api/runners', form).then(() => { load(); setForm({ name: '', email: '', current_venue_id: '', current_section: '' }); setShowForm(false); });
  };

  const toggle = (id, is_online) => axios.patch(`/api/runners/${id}`, { is_online: !is_online }).then(load);

  const filtered = filter === 'all' ? runners : filter === 'online' ? runners.filter(r => r.is_online) : runners.filter(r => !r.is_online);
  const onlineCount = runners.filter(r => r.is_online).length;

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Runners</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>{onlineCount} online &bull; {runners.length} total</p>
        </div>
        <button style={S.btn()} onClick={() => setShowForm(f => !f)}>{showForm ? 'Cancel' : '+ Add Runner'}</button>
      </div>

      {showForm && (
        <div style={S.card}>
          <div style={S.cardTitle}>Add New Runner</div>
          <form onSubmit={submit}>
            <div style={S.formGrid}>
              <div><label style={S.label}>Name *</label><input style={S.input} placeholder="Full name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div><label style={S.label}>Email</label><input style={S.input} type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div><label style={S.label}>Venue ID</label><input style={S.input} placeholder="venue-1" value={form.current_venue_id} onChange={e => setForm({...form, current_venue_id: e.target.value})} /></div>
              <div><label style={S.label}>Section</label><input style={S.input} placeholder="101" value={form.current_section} onChange={e => setForm({...form, current_section: e.target.value})} /></div>
            </div>
            <button type="submit" style={{...S.btn(), marginTop: '1rem'}}>Add Runner</button>
          </form>
        </div>
      )}

      <div style={S.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>All Runners</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['all','online','offline'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '0.35rem 0.875rem', borderRadius: '99px', border: '1px solid', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', background: filter === f ? '#3b82f6' : '#fff', color: filter === f ? '#fff' : '#64748b', borderColor: filter === f ? '#3b82f6' : '#e2e8f0' }}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
            ))}
          </div>
        </div>
        {loading ? (
          <div style={S.empty}>Loading runners...</div>
        ) : filtered.length === 0 ? (
          <div style={S.empty}>No runners found. Add one above to get started.</div>
        ) : (
          <table style={S.table}>
            <thead><tr>
              <th style={S.th}>Runner</th>
              <th style={S.th}>Email</th>
              <th style={S.th}>Venue</th>
              <th style={S.th}>Section</th>
              <th style={S.th}>Status</th>
              <th style={S.th}>Action</th>
            </tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td style={S.td}>
                    <div style={S.row}>
                      <div style={S.avatar}>{(r.name || '?')[0].toUpperCase()}</div>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{r.name}</span>
                    </div>
                  </td>
                  <td style={S.td}>{r.email || '-'}</td>
                  <td style={S.td}>{r.current_venue_id || '-'}</td>
                  <td style={S.td}>{r.current_section || '-'}</td>
                  <td style={S.td}><span style={S.badge(r.is_online)}><span style={S.dot(r.is_online)}></span>{r.is_online ? 'Online' : 'Offline'}</span></td>
                  <td style={S.td}><button onClick={() => toggle(r.id, r.is_online)} style={S.btn(r.is_online ? '#ef4444' : '#10b981')}>{r.is_online ? 'Set Offline' : 'Set Online'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
