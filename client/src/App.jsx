import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './views/Dashboard';
import Orders from './views/Orders';
import Runners from './views/Runners';
import Stands from './views/Stands';
import Reports from './views/Reports';
import FanView from './views/FanView';
import RunnerView from './views/RunnerView';
import AdminView from './views/AdminView';
import ScoutView from './views/ScoutView';

const NAV_LINK = (isActive) => ({ color: isActive ? '#f5a623' : '#ccc', textDecoration: 'none', fontSize: '0.9rem' });

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ display: 'flex', gap: '1rem', padding: '0.75rem 1.5rem', background: '#1a1a2e', color: '#fff', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold', marginRight: '0.5rem', fontSize: '1.1rem' }}>SeatServe</span>
        <span style={{ color: '#555', marginRight: '0.5rem' }}>|</span>
        <NavLink to="/" style={({ isActive }) => NAV_LINK(isActive)}>Dashboard</NavLink>
        <NavLink to="/orders" style={({ isActive }) => NAV_LINK(isActive)}>Orders</NavLink>
        <NavLink to="/runners" style={({ isActive }) => NAV_LINK(isActive)}>Runners</NavLink>
        <NavLink to="/stands" style={({ isActive }) => NAV_LINK(isActive)}>Stands</NavLink>
        <NavLink to="/reports" style={({ isActive }) => NAV_LINK(isActive)}>Reports</NavLink>
        <span style={{ color: '#555', marginLeft: '0.5rem', marginRight: '0.5rem' }}>|</span>
        <NavLink to="/fan" style={({ isActive }) => NAV_LINK(isActive)}>Fan Order</NavLink>
        <NavLink to="/runner" style={({ isActive }) => NAV_LINK(isActive)}>Runner App</NavLink>
        <NavLink to="/admin" style={({ isActive }) => NAV_LINK(isActive)}>Admin</NavLink>
        <NavLink to="/scout" style={({ isActive }) => NAV_LINK(isActive)}>Scout</NavLink>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/runners" element={<Runners />} />
          <Route path="/stands" element={<Stands />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/fan" element={<FanView />} />
          <Route path="/runner" element={<RunnerView />} />
          <Route path="/admin" element={<AdminView />} />
          <Route path="/scout" element={<ScoutView />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
