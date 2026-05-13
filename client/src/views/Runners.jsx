import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Runners() {
  const [runners, setRunners] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', venue_id: '' });

  const load = () => axios.get('/api/runners').then(r => setRunners(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const submit = e => {
    e.preventDefault();
    axios.post('/api/runners', form).then(() => { load(); setForm({ name: '', phone: '', venue_id: '' }); });
  };

  const toggle = (id, active) => axios.patch(`/api/runners/${id}`, { active: !active }).then(load);

  return (
    <div>
      <h1>Runners</h1>
      <form onSubmit={submit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        <input placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        <input placeholder="Venue ID" value={form.venue_id} onChange={e => setForm({...form, venue_id: e.target.value})} />
        <button type="submit">Add Runner</button>
      </form>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Venue</th><th>Active</th><th>Action</th></tr></thead>
        <tbody>
          {runners.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td><td>{r.name}</td><td>{r.phone || '-'}</td>
              <td>{r.venue_id || '-'}</td>
              <td>{r.active ? 'Yes' : 'No'}</td>
              <td><button onClick={() => toggle(r.id, r.active)}>{r.active ? 'Deactivate' : 'Activate'}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
