import React, { useState } from 'react';
import { motion, useViewportScroll, useTransform } from 'framer-motion';
import GridDistortion from '../components/GridDistortion';

// Definimos las variantes de animación con tipado
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Nosotros: React.FC = () => {
  const [hovered, setHovered] = useState<boolean>(false);
  
  // Usamos el scroll para cambiar colores
  const { scrollYProgress } = useViewportScroll();
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.5], // Rango de scroll (0 = arriba, 0.5 = mitad de la página)
    ['#ffffff', '#000000'] // De blanco a negro
  );
  const textColor = useTransform(
    scrollYProgress,
    [0, 0.5],
    ['#1f2937', '#ffffff'] // De gris oscuro (text-gray-800) a blanco
  );

  return (
    <motion.div
      className="min-h-screen font-sans relative overflow-hidden"
      style={{ backgroundColor }} // Fondo cambia con el scroll
    >
      {/* Sección Hero con GridDistortion */}
      <motion.div
        className="relative w-full h-[600px] z-10"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <GridDistortion
          imageSrc="https://picsum.photos/1920/1080?grayscale"
          grid={12}
          mouse={0.4}
          strength={0.6}
          relaxation={0.7}
          className="w-full h-full absolute inset-0"
        />
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <motion.h1
            className="text-7xl font-extrabold text-white drop-shadow-2xl cursor-pointer"
            whileHover={{
              color: '#000000', // Cambia a negro al pasar el puntero
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            transition={{ duration: 0.3 }}
          >
            EdgeHub
          </motion.h1>
        </div>
      </motion.div>

      {/* Sección de Información */}
      <motion.section
        className="max-w-5xl mx-auto py-16 px-6 z-10 relative"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        style={{ color: textColor }} // Letras cambian con el scroll
      >
        <div className="text-center mb-12">
          <img
            src="/edgeSF.png" // Ajusta la ruta de tu logo
            alt="Logo EdgeHub"
            className="w-36 h-36 mx-auto mb-6"
          />
          <h2 className="text-5xl font-bold">Sobre EdgeHub</h2>
          <p className="text-lg mt-3">Universidad de Innovación - NeoUniversidad</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-3xl font-semibold mb-5">Nuestra Misión</h3>
            <p className="leading-relaxed">
              En EdgeHub, lideramos la vanguardia de la educación en Inteligencia Artificial. 
              Combinamos tecnología de punta con un enfoque práctico para transformar el mundo con soluciones inteligentes.
            </p>
          </div>
          <div>
            <h3 className="text-3xl font-semibold mb-5">Nuestra Visión</h3>
            <p className="leading-relaxed">
              Ser la NeoUniversidad referente en IA, impulsando el progreso global a través de la formación 
              de profesionales éticos, creativos y altamente capacitados en tecnologías emergentes.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <h3 className="text-3xl font-semibold mb-5">Ingeniería en Inteligencia Artificial</h3>
          <p className="leading-relaxed">
            Nuestra carrera insignia ofrece un currículo avanzado en aprendizaje automático, visión computacional 
            y procesamiento de lenguaje natural. En EdgeHub, no solo aprendes teoría: construyes el futuro.
          </p>
        </div>
      </motion.section>

      {/* Sección de Equipo con una sola imagen */}
      <motion.section
        className="py-12 z-10 relative"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        style={{ color: textColor }} // Letras cambian con el scroll
      >
        <h2 className="text-4xl font-bold text-center mb-8">Nuestro Equipo</h2>
        <div className="max-w-3xl mx-auto">
          <img
            src="/nos.webp"
            alt="Equipo EdgeHub"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </motion.section>

    
    </motion.div>
  );
};

export default Nosotros;