import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import supabase from '../services/supabase';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navbarVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.3 } },
  };

  if (!isAuthenticated) return null;

  return (
    <motion.nav
      className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 shadow-lg"
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/AdminDashboard" className="text-2xl font-extrabold text-white hover:opacity-80 transition duration-300">
            <img src="/iconSF.png" alt="Logo" className="h-20" />
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/AdminDashboard" className="text-white text-sm font-medium px-4 py-2 rounded-md transition duration-300 hover:bg-white hover:text-purple-700 shadow-md">
              Home
            </Link>
            <Link to="/DriverDetails" className="text-white text-sm font-medium px-4 py-2 rounded-md transition duration-300 hover:bg-white hover:text-purple-700 shadow-md">
              Conductores
            </Link>
            <Link to="/Emociones" className="text-white text-sm font-medium px-4 py-2 rounded-md transition duration-300 hover:bg-white hover:text-purple-700 shadow-md">
              Emociones
            </Link>
            <Link to="/FatigueDetails" className="text-white text-sm font-medium px-4 py-2 rounded-md transition duration-300 hover:bg-white hover:text-purple-700 shadow-md">
              Fatiga
            </Link>
            <button
              onClick={handleLogout}
              className="text-white text-sm font-medium px-4 py-2 rounded-md transition duration-300 bg-red-500 hover:bg-red-600 shadow-md"
            >
              Cerrar Sesión
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <motion.div className="md:hidden" variants={mobileMenuVariants} initial="hidden" animate={isOpen ? 'visible' : 'hidden'}>
          <div className="px-2 pt-2 pb-3 space-y-2 bg-white shadow-lg rounded-md">
            <Link to="/AdminDashboard" className="block text-gray-900 px-3 py-2 rounded-md text-base font-medium transition hover:bg-purple-700 hover:text-white" onClick={() => setIsOpen(false)}>
              Home
            </Link>
            <Link to="/DriverDetails" className="block text-gray-900 px-3 py-2 rounded-md text-base font-medium transition hover:bg-purple-700 hover:text-white" onClick={() => setIsOpen(false)}>
              Conductores
            </Link>
            <Link to="/Emociones" className="block text-gray-900 px-3 py-2 rounded-md text-base font-medium transition hover:bg-purple-700 hover:text-white" onClick={() => setIsOpen(false)}>
              Emociones
            </Link>
            <Link to="/FatigueDetails" className="block text-gray-900 px-3 py-2 rounded-md text-base font-medium transition hover:bg-purple-700 hover:text-white" onClick={() => setIsOpen(false)}>
              Fatiga
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="block text-gray-900 px-3 py-2 rounded-md text-base font-medium transition bg-red-500 hover:bg-red-600 text-white w-full text-left"
            >
              Cerrar Sesión
            </button>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
