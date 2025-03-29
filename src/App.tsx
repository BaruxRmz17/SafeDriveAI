import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DriverDetails from './pages/DriverDetails';
import FatigueDetails from './pages/FatigueDetails';
import Emociones from './pages/Emociones';
import RecentFatigueEvents from './pages/RecentFatigueEvents';
import Navbar from './components/Navbar';
import Footer from './components/footer';
import supabase from './services/supabase';
import Nosotros from './pages/Nosotros';
import ReportarIncidente from './pages/Reporte'

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen w-full">
        {/* Mostrar Navbar solo si el usuario está autenticado */}
        {isAuthenticated && <Navbar />}

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/AdminDashboard" element={<AdminDashboard />} />
            <Route path="/DriverDetails" element={<DriverDetails />} />
            <Route path="/FatigueDetails" element={<FatigueDetails />} />
            <Route path="/Emociones" element={<Emociones />} />
            <Route path="/RecentFatigueEvents" element={<RecentFatigueEvents />} />
            <Route path="/Nosotros" element={<Nosotros />} />
            <Route path="/Reporte" element={<ReportarIncidente />} />


          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;