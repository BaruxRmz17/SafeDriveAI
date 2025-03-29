import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import safedriveIcon from '/iconSF.png'; // Ajusta la ruta según donde guardes el ícono

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleStartClick = () => {
    navigate('/login');
  };

  // Animaciones para el título
  const titleVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: 'easeOut' } },
  };

  // Animaciones para el ícono
  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { scale: 1, rotate: 0, transition: { duration: 1, type: 'spring', stiffness: 100 } },
  };

  // Animaciones para la descripción
  const descriptionVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, delay: 0.5, ease: 'easeOut' } },
  };

  // Animaciones para el botón
  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: 1, type: 'spring' } },
    hover: { scale: 1.1, boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.2)', transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-400 via-purple-500 to-blue-600 overflow-hidden">
      {/* Fondo con partículas animadas (simuladas con círculos) */}
      <div className="absolute inset-0">
        <motion.div
          className="w-40 h-40 bg-yellow-300 rounded-full opacity-20 absolute top-10 left-20"
          animate={{ y: [0, -20, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="w-60 h-60 bg-green-300 rounded-full opacity-20 absolute bottom-20 right-20"
          animate={{ y: [0, 20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 max-w-3xl mx-auto text-center p-8 bg-white bg-opacity-90 rounded-2xl shadow-2xl">
        {/* Ícono animado */}
        <motion.img
          src={safedriveIcon}
          alt="SafeDrive IA Icon"
          className="w-40 mx-auto mb-6"
          variants={iconVariants}
          initial="hidden"
          animate="visible"
        />

        {/* Título animado */}
        <motion.h1
          className="text-5xl font-extrabold text-gray-800 mb-4"
          variants={titleVariants}
          initial="hidden"
          animate="visible"
        >
          Bienvenido a <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">SafeDrive IA</span>
        </motion.h1>

        {/* Descripción animada */}
        <motion.p
          className="text-lg text-gray-600 mb-8 leading-relaxed"
          variants={descriptionVariants}
          initial="hidden"
          animate="visible"
        >
          En <span className="font-semibold text-purple-600">SafeDrive IA</span>, nos dedicamos a transformar la seguridad vial y el bienestar de los conductores. Utilizamos tecnología de punta, como visión por computadora y análisis de datos, para monitorear el estado físico, emocional y mental de los operadores, reduciendo accidentes y promoviendo una cultura de cuidado y sostenibilidad en el transporte.
        </motion.p>

        {/* Botón animado */}
        <motion.button
          onClick={handleStartClick}
          className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full shadow-lg"
          variants={buttonVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
          Comienza ahora
        </motion.button>
      </div>
    </div>
  );
};

export default Home;