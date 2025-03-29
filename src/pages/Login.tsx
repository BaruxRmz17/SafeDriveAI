import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Añadí Link
import { motion } from 'framer-motion';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import supabase from '../services/supabase';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      navigate('/AdminDashboard');
    } catch (err) {
      setError('Ocurrió un error inesperado. Intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white overflow-hidden">
      <motion.div
        className="relative z-10 max-w-md w-full mx-auto p-8 bg-white bg-opacity-90 rounded-2xl shadow-2xl"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
          Iniciar Sesión en{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
            SafeDrive IA
          </span>
        </h2>
        <form onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ingresa tu correo"
              required
            />
          </div>
          <div className="mt-4 relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center justify-center text-gray-500"
              >
                {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {error && (
            <motion.p
              className="text-red-500 text-sm mt-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.p>
          )}
          <motion.button
            type="submit"
            disabled={loading}
            className={`w-full mt-6 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full shadow-lg ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            whileHover={!loading ? { scale: 1.05, boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.2)' } : undefined}
          >
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </motion.button>
        </form>

        {/* Enlace para reportar un incidente */}
        <div className="mt-4 text-center">
          <Link
            to="/Reporte" // Ajusta la ruta según tu enrutamiento
            className="text-sm text-purple-600 hover:text-purple-800 underline"
          >
            Reportar un Incidente
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;