import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Stands() {
  const [stands, setStands] = useState([]);
  const [form, setForm] = useState({ name: '', location: '', venue_id: '' });

  const load = () => axios.get('/api/stands').then(r => setStands(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const submit = e => {
    e.preventDefault();
    axios.post('/api/stands', form).then(() => { load(); setForm({ name: '', location: '', venue_id: '' }); });
  };

  return (
    <div>
      <h1>Stands</h1>
      <form onSubmit={submit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input placeholder="Stand Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        <input placeholder="Location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
        <input placeholder="Venue ID" value={form.venue_id} onChange={e => setForm({...form, venue_id: e.target.value})} />
        <button type="submit">Add Stand</button>
      </form>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead><tr><th>ID</th><th>Name</th><th>Location</th><th>Venue</th></tr></thead>
        <tbody>
          {stands.map(s => (
            <tr key={s.id}>
              <td>{s.id}</td><td>{s.name}</td>
              <td>{s.location || '-'}</td><td>{s.venue_id || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
