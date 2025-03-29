import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DriverDetails from './pages/DriverDetails';
import Navbar from './components/Navbar'; 
import FatigueDetails from './pages/FatigueDetails';
import Emociones from './pages/Emociones';
import Footer from './components/footer';
import RecentFatigueEvents from './pages/RecentFatigueEvents';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/AdminDashboard" element={<AdminDashboard />} />
          <Route path="/DriverDetails" element={<DriverDetails />} />
          <Route path="/FatigueDetails" element={<FatigueDetails />} />
          <Route path="/Emociones" element={<Emociones />} />
          <Route path="/RecentFatigueEvents" element={<RecentFatigueEvents />} />



        </Routes>
      </div>
      <Footer />
    </Router>
  );
};

export default App;