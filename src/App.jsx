import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Allocation from './pages/Allocation';
import Booking from './pages/Booking';
import Maintenance from './pages/Maintenance';
import Audit from './pages/Audit';
import Organization from './pages/Organization';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Core Layout Shell Wrapping Protected Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="registry" element={<Assets />} />
          <Route path="allocations" element={<Allocation />} />
          <Route path="bookings" element={<Booking />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="audits" element={<Audit />} />
          <Route path="organization" element={<Organization />} />
          <Route path="analytics" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
