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
  td: { padding: '0.875rem 1rem', borderBottom: '1px solid #f1f5f9', color: '#334155' },
  empty: { textAlign: 'center', padding: '3rem', color: '#94a3b8' },
  venueBadge: { padding: '0.2rem 0.5rem', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 },
};

export default function Stands() {
  const [stands, setStands] = useState([]);
  const [form, setForm] = useState({ name: '', gate: '', level: '', sections: '', venue_id: '' });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = () => axios.get('/api/stands').then(r => { setStands(r.data || []); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = e => {
    e.preventDefault();
    axios.post('/api/stands', form).then(() => { load(); setForm({ name: '', gate: '', level: '', sections: '', venue_id: '' }); setShowForm(false); });
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Concession Stands</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>Manage stadium locations and supply points</p>
        </div>
        <button style={S.btn()} onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add Stand'}</button>
      </div>

      {showForm && (
        <div style={S.card}>
          <div style={S.cardTitle}>Register New Stand</div>
          <form onSubmit={submit}>
            <div style={S.formGrid}>
              <div><label style={S.label}>Stand Name *</label><input style={S.input} placeholder="e.g. Section 101 Beer" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div><label style={S.label}>Gate</label><input style={S.input} placeholder="Gate G" value={form.gate} onChange={e => setForm({...form, gate: e.target.value})} /></div>
              <div><label style={S.label}>Level</label><input style={S.input} placeholder="Main Concourse" value={form.level} onChange={e => setForm({...form, level: e.target.value})} /></div>
              <div><label style={S.label}>Sections Covered</label><input style={S.input} placeholder="101-105" value={form.sections} onChange={e => setForm({...form, sections: e.target.value})} /></div>
              <div><label style={S.label}>Venue ID *</label><input style={S.input} placeholder="venue-1" value={form.venue_id} onChange={e => setForm({...form, venue_id: e.target.value})} required /></div>
            </div>
            <button type="submit" style={{...S.btn(), marginTop: '1rem'}}>Register Stand</button>
          </form>
        </div>
      )}

      <div style={S.card}>
        <div style={S.cardTitle}>Active Stands</div>
        {loading ? (
          <div style={S.empty}>Loading stands...</div>
        ) : stands.length === 0 ? (
          <div style={S.empty}>No stands registered yet. Add one to see it here.</div>
        ) : (
          <table style={S.table}>
            <thead><tr>
              <th style={S.th}>Stand Name</th>
              <th style={S.th}>Venue</th>
              <th style={S.th}>Location</th>
              <th style={S.th}>Sections</th>
            </tr></thead>
            <tbody>
              {stands.map(s => (
                <tr key={s.id}>
                  <td style={S.td}><span style={{fontWeight:600}}>{s.name}</span></td>
                  <td style={S.td}><span style={S.venueBadge}>{s.venue_id}</span></td>
                  <td style={S.td}>
                    <div style={{fontWeight:500}}>{s.level || 'Unspecified Level'}</div>
                    <div style={{fontSize:'0.75rem',color:'#64748b'}}>{s.gate ? `Gate ${s.gate}` : ''}</div>
                  </td>
                  <td style={S.td}>{s.sections || 'All'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
