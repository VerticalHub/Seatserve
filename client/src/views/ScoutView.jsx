import { useEffect, useState } from 'react';
import axios from 'axios';

const NAV = { background: '#1a1a2e', color: '#fff', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' };
const CARD = { background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' };
const BTN = { background: '#f5a623', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 1.2rem', cursor: 'pointer', fontWeight: 'bold' };
const BTN_SM = { ...BTN, padding: '0.35rem 0.8rem', fontSize: '0.85rem' };
const INPUT = { padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', marginBottom: '0.5rem', width: '100%', boxSizing: 'border-box' };
const SELECT = { ...INPUT };

const TIER_COLOR = { 1: '#27ae60', 2: '#f39c12', 3: '#e74c3c' };
const STATUS_COLOR = { active: '#27ae60', needs_scout: '#f39c12', inactive: '#e74c3c', prospect: '#2980b9' };

export default function ScoutView() {
  const [venues, setVenues] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState({ league: '', status: '' });
  const [reportForm, setReportForm] = useState({ type: '', label: '', section: '' });
  const [reports, setReports] = useState([]);
  const [tab, setTab] = useState('venues');
  const [newVenue, setNewVenue] = useState({ id: '', league: '', team: '', stadium: '', city: '', capacity: '', tier: 3 });
  const [saving, setSaving] = useState(false);

  const loadVenues = () => {
    const params = {};
    if (filter.league) params.league = filter.league;
    if (filter.status) params.status = filter.status;
    axios.get('/api/venues', { params }).then(r => setVenues(r.data)).catch(() => {});
  };

  const loadReports = (venueId) => {
    axios.get('/api/reports', { params: { venue_id: venueId } }).then(r => setReports(r.data)).catch(() => setReports([]));
  };

  useEffect(() => { loadVenues(); }, [filter]);

  const selectVenue = (v) => {
    setSelected(v);
    setTab('detail');
    loadReports(v.id);
  };

  const submitReport = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/reports', { ...reportForm, venue_id: selected?.id, stand_id: null });
      setReportForm({ type: '', label: '', section: '' });
      loadReports(selected?.id);
    } catch {
      alert('Failed to submit report.');
    }
  };

  const addVenue = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post('/api/venues', { ...newVenue, capacity: parseInt(newVenue.capacity) || null, tier: parseInt(newVenue.tier) });
      setNewVenue({ id: '', league: '', team: '', stadium: '', city: '', capacity: '', tier: 3 });
      loadVenues();
      setTab('venues');
    } catch {
      alert('Failed to add venue. Check that the ID is unique.');
    } finally {
      setSaving(false);
    }
  };

  const leagues = [...new Set(venues.map(v => v.league))].sort();

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7' }}>
      <nav style={NAV}>
        <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>SeatServe Scout</span>
        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '2rem' }}>
          {['venues', 'add', selected ? 'detail' : null].filter(Boolean).map(t => (
            <button key={t} style={{ ...BTN_SM, background: tab === t ? '#f5a623' : 'rgba(255,255,255,0.15)' }}
              onClick={() => setTab(t)}>
              {t === 'venues' ? 'All Venues' : t === 'add' ? '+ Add Venue' : `${selected?.stadium?.slice(0, 20) || 'Detail'}...`}
            </button>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem' }}>

        {tab === 'venues' && (
          <>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>Venues ({venues.length})</h2>
              <select value={filter.league} onChange={e => setFilter({ ...filter, league: e.target.value })}
                style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #ccc' }}>
                <option value="">All Leagues</option>
                {leagues.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}
                style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #ccc' }}>
                <option value="">All Statuses</option>
                {['active', 'needs_scout', 'inactive', 'prospect'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {venues.length === 0 && <p style={{ color: '#888' }}>No venues found. Try adjusting filters or add one.</p>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {venues.map(v => (
                <div key={v.id} style={{ ...CARD, cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                  onClick={() => selectVenue(v)}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{v.stadium}</div>
                      <div style={{ color: '#555', fontSize: '0.85rem', marginTop: '0.2rem' }}>{v.team}</div>
                      <div style={{ color: '#888', fontSize: '0.8rem' }}>{v.city} · {v.league}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-end' }}>
                      <span style={{ padding: '0.15rem 0.5rem', borderRadius: '8px', fontSize: '0.75rem', background: STATUS_COLOR[v.status] || '#ccc', color: '#fff' }}>
                        {v.status?.replace('_', ' ')}
                      </span>
                      <span style={{ padding: '0.15rem 0.5rem', borderRadius: '8px', fontSize: '0.75rem', background: TIER_COLOR[v.tier] || '#aaa', color: '#fff' }}>
                        Tier {v.tier}
                      </span>
                    </div>
                  </div>
                  {v.capacity && <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '0.5rem' }}>Capacity: {Number(v.capacity).toLocaleString()}</div>}
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'add' && (
          <>
            <h2>Add New Venue</h2>
            <form onSubmit={addVenue} style={{ ...CARD, maxWidth: '480px', padding: '1.5rem' }}>
              {[
                ['id', 'Venue ID (e.g. MLB-CHC)', 'text', true],
                ['league', 'League (e.g. MLB)', 'text', true],
                ['team', 'Team Name', 'text', true],
                ['stadium', 'Stadium Name', 'text', true],
                ['city', 'City', 'text', true],
                ['capacity', 'Capacity', 'number', false],
              ].map(([key, placeholder, type, required]) => (
                <div key={key}>
                  <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '0.2rem' }}>{placeholder}</label>
                  <input type={type} placeholder={placeholder} required={required}
                    value={newVenue[key]} onChange={e => setNewVenue({ ...newVenue, [key]: e.target.value })}
                    style={INPUT} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: '0.85rem', color: '#555', display: 'block', marginBottom: '0.2rem' }}>Tier</label>
                <select value={newVenue.tier} onChange={e => setNewVenue({ ...newVenue, tier: e.target.value })} style={SELECT}>
                  <option value="1">Tier 1 (Top priority)</option>
                  <option value="2">Tier 2</option>
                  <option value="3">Tier 3</option>
                </select>
              </div>
              <button type="submit" style={{ ...BTN, width: '100%', marginTop: '1rem' }} disabled={saving}>
                {saving ? 'Saving...' : 'Add Venue'}
              </button>
            </form>
          </>
        )}

        {tab === 'detail' && selected && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0 }}>{selected.stadium}</h2>
              <span style={{ padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.85rem', background: STATUS_COLOR[selected.status] || '#ccc', color: '#fff' }}>
                {selected.status?.replace('_', ' ')}
              </span>
              <span style={{ padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.85rem', background: TIER_COLOR[selected.tier] || '#aaa', color: '#fff' }}>
                Tier {selected.tier}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <div style={CARD}>
                  <h3 style={{ margin: '0 0 0.75rem' }}>Venue Info</h3>
                  {[['Team', selected.team], ['League', selected.league], ['City', selected.city],
                    ['Capacity', selected.capacity ? Number(selected.capacity).toLocaleString() : 'Unknown'],
                    ['Operator', selected.operator || 'Not set'],
                    ['Concessions URL', selected.concessions_url || 'Not set']].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid #eee', fontSize: '0.9rem' }}>
                      <span style={{ color: '#555' }}>{label}</span>
                      <span style={{ fontWeight: '500', maxWidth: '180px', textAlign: 'right', wordBreak: 'break-all' }}>{val}</span>
                    </div>
                  ))}
                  {selected.notes && <div style={{ marginTop: '0.75rem', color: '#555', fontSize: '0.85rem' }}><strong>Notes:</strong> {selected.notes}</div>}
                </div>

                <div style={CARD}>
                  <h3 style={{ margin: '0 0 0.75rem' }}>Submit Field Report</h3>
                  <form onSubmit={submitReport}>
                    <select required value={reportForm.type} onChange={e => setReportForm({ ...reportForm, type: e.target.value })}
                      style={{ ...SELECT, marginBottom: '0.5rem' }}>
                      <option value="">Report Type</option>
                      <option value="stand_issue">Stand Issue</option>
                      <option value="crowd_issue">Crowd Issue</option>
                      <option value="opportunity">Opportunity</option>
                      <option value="general">General Note</option>
                    </select>
                    <input placeholder="Label / Summary" required value={reportForm.label}
                      onChange={e => setReportForm({ ...reportForm, label: e.target.value })} style={INPUT} />
                    <input placeholder="Section (optional)" value={reportForm.section}
                      onChange={e => setReportForm({ ...reportForm, section: e.target.value })} style={INPUT} />
                    <button type="submit" style={{ ...BTN, width: '100%' }}>Submit Report</button>
                  </form>
                </div>
              </div>

              <div>
                <div style={CARD}>
                  <h3 style={{ margin: '0 0 0.75rem' }}>Field Reports ({reports.length})</h3>
                  {reports.length === 0 && <p style={{ color: '#888', margin: 0 }}>No reports yet for this venue.</p>}
                  {reports.map(r => (
                    <div key={r.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong style={{ fontSize: '0.9rem' }}>{r.label}</strong>
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      <div style={{ color: '#555', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                        {r.type?.replace('_', ' ')}{r.section ? ` · Section ${r.section}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
