import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DriverDetails from './pages/DriverDetails';
import FatigueDetails from './pages/FatigueDetails';
import Emociones from './pages/Emociones';
import RecentFatigueEvents from './pages/RecentFatigueEvents';
import Navbar from './components/Navbar';
import Footer from './components/footer'; // Asegúrate de que el nombre coincida con el archivo real (footer vs Footer)

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen w-full">
        {/* Navbar siempre visible */}
        <Navbar />
        
        {/* Contenido principal con flex-grow para ocupar el espacio disponible */}
        <main className="flex-grow">
          <Routes>
            {/* Ruta raíz y login como la misma página */}
            <Route path="/" element={<Login />} />
            <Route path="/Login" element={<Login />} /> {/* Mantengo minúsculas para consistencia */}
            <Route path="/AdminDashboard" element={<AdminDashboard />} />
            <Route path="/DriverDetails" element={<DriverDetails />} />
            <Route path="/FatigueDetails" element={<FatigueDetails />} />
            <Route path="/Emociones" element={<Emociones />} />
            <Route path="/RecentFatigueEvents" element={<RecentFatigueEvents />} />
          </Routes>
        </main>
        
        {/* Footer siempre al final */}
        <Footer />
      </div>
    </Router>
  );
};

export default App;