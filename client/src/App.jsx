import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './views/Dashboard';
import Orders from './views/Orders';
import Runners from './views/Runners';
import Stands from './views/Stands';
import Reports from './views/Reports';

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', background: '#1a1a2e', color: '#fff' }}>
        <span style={{ fontWeight: 'bold', marginRight: '1rem' }}>SeatServe</span>
        <NavLink to="/" style={({ isActive }) => ({ color: isActive ? '#f5a623' : '#fff' })}>Dashboard</NavLink>
        <NavLink to="/orders" style={({ isActive }) => ({ color: isActive ? '#f5a623' : '#fff' })}>Orders</NavLink>
        <NavLink to="/runners" style={({ isActive }) => ({ color: isActive ? '#f5a623' : '#fff' })}>Runners</NavLink>
        <NavLink to="/stands" style={({ isActive }) => ({ color: isActive ? '#f5a623' : '#fff' })}>Stands</NavLink>
        <NavLink to="/reports" style={({ isActive }) => ({ color: isActive ? '#f5a623' : '#fff' })}>Reports</NavLink>
      </nav>
      <main style={{ padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/runners" element={<Runners />} />
          <Route path="/stands" element={<Stands />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
