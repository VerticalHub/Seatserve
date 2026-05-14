import { useEffect, useState } from 'react';
import axios from 'axios';

const NAV = { background: '#1a1a2e', color: '#fff', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' };
const CARD = { background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' };
const BTN = { background: '#f5a623', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 1.2rem', cursor: 'pointer', fontWeight: 'bold' };
const INPUT = { padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', width: '100%', marginBottom: '0.5rem' };

export default function FanView() {
    const [step, setStep] = useState('venue');
    const [venues, setVenues] = useState([]);
    const [venue, setVenue] = useState(null);
    const [stands, setStands] = useState([]);
    const [stand, setStand] = useState(null);
    const [cart, setCart] = useState([]);
    const [seat, setSeat] = useState({ section: '', row: '', seat: '' });
    const [order, setOrder] = useState(null);
    const [status, setStatus] = useState('');

  useEffect(() => {
        axios.get('/api/venues').then(r => setVenues(r.data)).catch(() => {});
  }, []);

  const selectVenue = (v) => {
        setVenue(v);
        axios.get(`/api/venues/${v.id}/stands`).then(r => setStands(r.data)).catch(() => {});
        setStep('stand');
  };

  const selectStand = (s) => { setStand(s); setStep('menu'); };

  const addToCart = (item) => {
        setCart(prev => {
                const existing = prev.find(c => c.id === item.id);
                if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
                return [...prev, { ...item, qty: 1 }];
        });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(c => c.id !== id));

  const subtotal = cart.reduce((sum, c) => sum + parseFloat(c.price) * c.qty, 0);
    const total = subtotal + 2.00;

  const placeOrder = async () => {
        if (!seat.section) return setStatus('Please enter your section.');
        try {
                const res = await axios.post('/api/orders', {
                          venue_id: venue.id,
                          stand_id: stand.id,
                          section: seat.section,
                          row: seat.row,
                          items: cart.map(c => ({ id: c.id, name: c.name, price: c.price, qty: c.qty })),
                          subtotal: subtotal.toFixed(2),
                          total: total.toFixed(2),
                });
                setOrder(res.data);
                setStep('confirm');
                setStatus('');
        } catch {
                setStatus('Failed to place order. Please try again.');
        }
  };

  return (
        <div style={{ minHeight: '100vh', background: '#fff' }}>
                <nav style={NAV}>
                          <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>🏟️ SeatServe</span>span>
                  {step !== 'venue' && (
                    <button style={{ ...BTN, background: '#555', marginLeft: 'auto' }} onClick={() => { setStep('venue'); setVenue(null); setStand(null); setCart([]); }}>
                                  Start Over
                    </button>button>
                  )}
                </nav>nav>

                <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem' }}>

                  {step === 'venue' && (
                    <>
                                <h2>Select Your Venue</h2>h2>
                      {venues.length === 0 && <p style={{ color: '#888' }}>Loading venues...</p>p>}
                      {venues.map(v => (
                                    <div key={v.id} style={CARD}>
                                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{v.stadium}</div>div>
                                                    <div style={{ color: '#555', fontSize: '0.9rem' }}>{v.team} · {v.city}</div>div>
                                                    <button style={{ ...BTN, marginTop: '0.75rem' }} onClick={() => selectVenue(v)}>Select</button>button>
                                    </div>div>
                                  ))}
                    </>>
                  )}
                
                  {step === 'stand' && (
                    <>
                                <h2>Choose a Stand at {venue?.stadium}</h2>h2>
                      {stands.length === 0 && <p style={{ color: '#888' }}>No open stands available.</p>p>}
                      {stands.map(s => (
                                    <div key={s.id} style={CARD}>
                                                    <div style={{ fontWeight: 'bold' }}>{s.name}</div>div>
                                                    <div style={{ color: '#555', fontSize: '0.9rem' }}>Gate {s.gate} · Level {s.level}</div>div>
                                                    <button style={{ ...BTN, marginTop: '0.75rem' }} onClick={() => selectStand(s)}>Order Here</button>button>
                                    </div>div>
                                  ))}
                    </>>
                  )}
                
                  {step === 'menu' && (
                    <>
                                <h2>Menu — {stand?.name}</h2>h2>
                      {stand?.menu_items?.length === 0 && <p style={{ color: '#888' }}>No items available.</p>p>}
                      {(stand?.menu_items || []).map(item => (
                                    <div key={item.id} style={{ ...CARD, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                                      <span style={{ fontSize: '1.3rem', marginRight: '0.5rem' }}>{item.emoji}</span>span>
                                                                      <strong>{item.name}</strong>strong>
                                                                      <div style={{ color: '#555', fontSize: '0.85rem' }}>${parseFloat(item.price).toFixed(2)}</div>div>
                                                    </div>div>
                                                    <button style={BTN} onClick={() => addToCart(item)}>+ Add</button>button>
                                    </div>div>
                                  ))}
                    
                      {cart.length > 0 && (
                                    <div style={{ marginTop: '1.5rem', background: '#fffbf0', border: '1px solid #f5a623', borderRadius: '8px', padding: '1rem' }}>
                                                    <h3 style={{ margin: '0 0 0.75rem' }}>Your Cart</h3>h3>
                                      {cart.map(c => (
                                                        <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                                                            <span>{c.emoji} {c.name} x{c.qty}</span>span>
                                                                            <span>
                                                                                                  ${(parseFloat(c.price) * c.qty).toFixed(2)}
                                                                                                  <button onClick={() => removeFromCart(c.id)} style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>✕</button>button>
                                                                            </span>span>
                                                        </div>div>
                                                      ))}
                                                    <div style={{ borderTop: '1px solid #ddd', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                                                                      <div>Subtotal: ${subtotal.toFixed(2)}</div>div>
                                                                      <div>Delivery fee: $2.00</div>div>
                                                                      <div style={{ fontWeight: 'bold' }}>Total: ${total.toFixed(2)}</div>div>
                                                    </div>div>
                                                    <button style={{ ...BTN, marginTop: '0.75rem', width: '100%' }} onClick={() => setStep('checkout')}>
                                                                      Checkout →
                                                    </button>button>
                                    </div>div>
                                )}
                    </>>
                  )}
                
                  {step === 'checkout' && (
                    <>
                                <h2>Your Seat</h2>h2>
                                <p style={{ color: '#555' }}>Where should we deliver your order?</p>p>
                                <input style={INPUT} placeholder="Section (required)" value={seat.section} onChange={e => setSeat({ ...seat, section: e.target.value })} />
                                <input style={INPUT} placeholder="Row (optional)" value={seat.row} onChange={e => setSeat({ ...seat, row: e.target.value })} />
                                <input style={INPUT} placeholder="Seat # (optional)" value={seat.seat} onChange={e => setSeat({ ...seat, seat: e.target.value })} />
                    
                                <div style={{ background: '#f0f0f0', borderRadius: '8px', padding: '1rem', margin: '1rem 0' }}>
                                              <strong>Order Summary</strong>strong>
                                  {cart.map(c => (
                                      <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                                                        <span>{c.emoji} {c.name} x{c.qty}</span>span>
                                                        <span>${(parseFloat(c.price) * c.qty).toFixed(2)}</span>span>
                                      </div>div>
                                    ))}
                                              <div style={{ borderTop: '1px solid #ccc', marginTop: '0.5rem', paddingTop: '0.5rem', fontWeight: 'bold' }}>
                                                              Total: ${total.toFixed(2)}
                                              </div>div>
                                </div>div>
                    
                      {status && <p style={{ color: 'red' }}>{status}</p>p>}
                                <button style={{ ...BTN, width: '100%' }} onClick={placeOrder}>Place Order 🏃</button>button>
                    </>>
                  )}
                
                  {step === 'confirm' && order && (
                    <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
                                <div style={{ fontSize: '3rem' }}>✅</div>div>
                                <h2>Order Placed!</h2>h2>
                                <p>Your food is on its way to <strong>Section {order.section}{order.row ? `, Row ${order.row}` : ''}</strong>strong>.</p>p>
                                <p style={{ color: '#555', fontSize: '0.9rem' }}>Order ID: {order.id}</p>p>
                                <p style={{ color: '#555' }}>Total: ${parseFloat(order.total).toFixed(2)}</p>p>
                                <button style={{ ...BTN, marginTop: '1rem' }} onClick={() => { setStep('venue'); setVenue(null); setStand(null); setCart([]); setOrder(null); }}>
                                              Order Again
                                </button>button>
                    </div>div>
                        )}
                
                </div>div>
        </div>div>
      );
}</></></></>
